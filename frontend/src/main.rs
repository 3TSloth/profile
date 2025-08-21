extern crate rocket;

use anyhow::Result;
use reqwest::Client;
use reqwest::Method;
use rocket::fs::{relative, FileServer};
use rocket::http::uri::Origin;
use rocket::http::{ContentType, Status};
use rocket::response::content::RawJson;
use rocket::serde::json::{json, Value};
use rocket::{get, launch, routes, State};
use rocket_async_compression::{Compression, Level};
use std::path::PathBuf;

use std::env; // Import Diesel query DSL traits

struct AppState {
    backend_base: String, // e.g., "https://profile-backend-...run.app"
    client: Client,
    use_iam: bool,
}

/// Helper: trim trailing slash to avoid `//` when building URLs.
fn trim_end_slash(s: &str) -> &str {
    s.trim_end_matches('/')
}

#[get("/config")]
fn config() -> Value {
    // Read the backend URL from an environment variable set in Cloud Run.
    let backend_api_url =
        env::var("BACKEND_API_URL").unwrap_or_else(|_| "http://localhost:8000".to_string());

    json!({
        "backendApiUrl": backend_api_url
    })
}

async fn id_token(audience: &str) -> Result<String> {
    let url = format!(
        "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience={}&format=full",
        urlencoding::encode(audience)
    );
    let token = Client::new()
        .get(url)
        .header("Metadata-Flavor", "Google")
        .send()
        .await?
        .error_for_status()?
        .text()
        .await?;
    Ok(token)
}

async fn forward(
    method: Method,
    path: PathBuf,
    qs: Option<String>,
    ct: Option<&ContentType>,
    body_bytes: Option<Vec<u8>>,
    state: &State<AppState>,
) -> Result<RawJson<String>, (Status, String)> {
    // Build backend URL
    let mut url = format!(
        "{}/{}",
        trim_end_slash(&state.backend_base),
        path.to_string_lossy()
    );
    if let Some(q) = &qs {
        url.push('?');
        url.push_str(q);
    }

    let client = &state.client;
    let mut req = client.request(method.clone(), &url);

    // Attach IAM token if enabled
    if state.use_iam {
        let audience = format!("{}/", trim_end_slash(&state.backend_base));
        let token = id_token(&audience)
            .await
            .map_err(|e| (Status::InternalServerError, format!("id_token error: {e}")))?;
        req = req.header("Authorization", format!("Bearer {}", token));
    }

    // Attach Content-Type and body when present (and not GET/HEAD)
    if let Some(bytes) = body_bytes {
        if !matches!(method, Method::GET | Method::HEAD) {
            if let Some(ct) = ct {
                req = req.header("Content-Type", ct.to_string());
            }
            req = req.body(bytes);
        }
    }

    let resp = req
        .send()
        .await
        .map_err(|e| (Status::BadGateway, format!("backend fetch failed: {e}")))?;
    let status = resp.status();
    let text = resp.text().await.unwrap_or_else(|_| "{}".to_string());

    if status.is_success() {
        Ok(RawJson(text))
    } else {
        Err((Status::new(status.as_u16()), text))
    }
}

#[get("/bff/quotes")]
async fn bff_quotes(
    state: &State<AppState>,
) -> Result<RawJson<String>, (rocket::http::Status, String)> {
    // Build backend URL
    let url = format!("{}/api/v1/quotes", trim_end_slash(&state.backend_base));

    // Prepare request
    let mut req = state.client.get(&url);

    // Attach ID token if enabled
    if state.use_iam {
        // Audience should be the backend base URL (trailing slash OK)
        let audience = format!("{}/", trim_end_slash(&state.backend_base));
        let token = id_token(&audience).await.map_err(|e| {
            (
                rocket::http::Status::InternalServerError,
                format!("id_token error: {e}"),
            )
        })?;
        req = req.header("Authorization", format!("Bearer {}", token));
    }

    // Call backend
    let resp = req.send().await.map_err(|e| {
        (
            rocket::http::Status::BadGateway,
            format!("backend fetch failed: {e}"),
        )
    })?;
    let status = resp.status();
    let body = resp.text().await.unwrap_or_else(|_| "{}".to_string());

    // Map status codes roughly to Rocket
    let rocket_status = rocket::http::Status::new(status.as_u16());
    if status.is_success() {
        Ok(RawJson(body))
    } else {
        Err((rocket_status, body))
    }
}

#[get("/bff/<path..>")]
async fn bff_get(
    path: PathBuf,
    origin: &Origin<'_>,
    state: &State<AppState>,
) -> Result<RawJson<String>, (Status, String)> {
    let qs = origin.query().map(|q| q.to_string());
    forward(reqwest::Method::GET, path, qs, None, None, state).await
}

#[launch]
fn rocket() -> _ {
    // Read env
    let backend_api_url =
        env::var("BACKEND_API_URL").unwrap_or_else(|_| "http://localhost:8000".to_string());
    let use_iam = env::var("BACKEND_USE_IAM").unwrap_or_else(|_| "1".to_string()) == "1";

    // Build client once
    let client = Client::builder()
        .pool_max_idle_per_host(8)
        .build()
        .expect("reqwest client");

    rocket::build()
        .manage(AppState {
            backend_base: backend_api_url,
            client,
            use_iam,
        })
        .mount("/", routes![config, bff_get, bff_quotes])
        .attach(Compression::with_level(Level::Fastest))
        .mount("/", FileServer::from(relative!("dist")))
}
