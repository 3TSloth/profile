#[macro_use]
extern crate rocket;

use rocket::fs::{relative, FileServer};
use rocket::serde::json::{json, Value};
use rocket_async_compression::{Compression, Level};
use std::env;

#[get("/config")]
fn config() -> Value {
    // Read the backend URL from an environment variable set in Cloud Run.
    let backend_api_url =
        env::var("BACKEND_API_URL").unwrap_or_else(|_| "http://localhost:8000".to_string());

    json!({
        "backendApiUrl": backend_api_url
    })
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![config])
        .attach(Compression::with_level(Level::Fastest))
        .mount("/", FileServer::from(relative!("dist")))
}
