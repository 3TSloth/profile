#[macro_use]
extern crate rocket;
use dotenvy::dotenv;
use rocket::http::Method;

use rocket::serde::json::{json, Value};
use rocket_cors::AllowedHeaders;

use diesel::prelude::*;
use std::env;

#[get("/")]
fn index() -> Value {
    json!({"hello": "world"})
}

#[get("/api/v1/quotes")]
fn get_quotes() -> Value {
    json!({"goodbye": "world"})
}

pub fn establish_connection() -> PgConnection {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    println!("Allowed Origins Should Work");
    PgConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

#[launch]
fn rocket() -> _ {
    dotenv().ok();

    let origins_str =
        env::var("ALLOWED_ORIGINS").expect("ALLOWED_ORIGINS must be set in your .env file");

    let mut origins: Vec<&str> = origins_str.split(',').collect();
    origins.push("http://localhost:8080");

    let allowed_origins = rocket_cors::AllowedOrigins::some_exact(&origins);

    let cors = rocket_cors::CorsOptions {
        allowed_origins,
        allowed_methods: vec![Method::Get, Method::Post]
            .into_iter()
            .map(From::from)
            .collect(),
        allowed_headers: AllowedHeaders::some(&["Authorization", "Accept", "Content-Type"]),
        allow_credentials: true,
        ..Default::default()
    }
    .to_cors()
    .expect("error when attempting to make cors");

    rocket::build()
        .mount("/", routes![index, get_quotes])
        .attach(cors)
}
