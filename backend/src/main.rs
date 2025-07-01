use diesel::prelude::*;
use profile_backend::models::Quote;
use rocket::http::Method;
use rocket::{get, launch, routes}; // Import Diesel query DSL traits

use profile_backend::establish_connection;
use rocket::serde::json::{json, Value};
use rocket_cors::AllowedHeaders;
use std::env;

#[get("/")]
fn index() -> Value {
    json!({"hello": "world"})
}

#[get("/api/v1/quotes")]
fn get_quotes() -> Value {
    use profile_backend::schema::quotes::dsl::*;

    let connection = &mut establish_connection();
    let results = quotes
        .limit(5)
        .select(Quote::as_select())
        .load::<Quote>(connection)
        .expect("Error loading quotes");

    json!(results)
}

#[launch]
fn rocket() -> _ {
    dotenvy::from_filename(".env.development").ok();

    let origins_str =
        env::var("ALLOWED_ORIGINS").expect("ALLOWED_ORIGINS must be set in your .env file");

    let origins: Vec<&str> = origins_str.split(',').collect();
    println!("Allowed origins: {:?}", origins);

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
