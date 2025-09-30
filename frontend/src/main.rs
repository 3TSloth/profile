extern crate rocket;

use anyhow::Result;
use reqwest::Client;

use rocket::fs::{relative, FileServer};

use rocket::response::content::RawJson;
use rocket::{get, launch, routes, State};
use rocket_async_compression::{Compression, Level};

use std::env;

struct AppState {
    client: Client,
    backend_internal: String, // internal-only base for server->server calls
}

#[get("/bff/ttc_subway_delay_data")]
async fn bff_ttc_subway_data(
    state: &State<AppState>,
) -> Result<RawJson<String>, (rocket::http::Status, String)> {
    let url = format!("{}/api/v1/stations", state.backend_internal);
    let req = state.client.get(&url);

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

#[get("/bff/quotes")]
async fn bff_quotes(
    state: &State<AppState>,
) -> Result<RawJson<String>, (rocket::http::Status, String)> {
    // Build backend URL
    let url = format!("{}/api/v1/quotes", state.backend_internal);

    // Prepare request
    let req = state.client.get(&url);

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

#[launch]
fn rocket() -> _ {
    let backend_internal = env::var("BACKEND_API_INTERNAL_URL")
        .unwrap_or_else(|_| "http://mock-backend:8000".to_string());

    // Build client once
    let client = Client::builder()
        .pool_max_idle_per_host(8)
        .connect_timeout(std::time::Duration::from_secs(3))
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .expect("reqwest client");

    rocket::build()
        .manage(AppState {
            backend_internal: backend_internal,
            client,
        })
        .mount("/", routes![bff_quotes, bff_ttc_subway_data])
        .attach(Compression::with_level(Level::Fastest))
        .mount("/", FileServer::from(relative!("dist")))
}
