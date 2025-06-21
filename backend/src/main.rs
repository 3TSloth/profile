#[macro_use]
extern crate rocket;
use rocket::http::Method;

use rocket::serde::json::{json, Value};
use rocket_cors::AllowedHeaders;

use diesel::prelude::*;
use std::env;

#[get("/")]
fn index() -> Value {
    json!({"hello": "world"})
}

pub fn establish_connection() -> PgConnection {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    println!("Got here");
    PgConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
}

#[launch]
fn rocket() -> _ {
    let allowed_origins = rocket_cors::AllowedOrigins::some_exact(&["http://localhost:80"]);

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

    establish_connection();

    rocket::build().mount("/", routes![index]).attach(cors)
}
