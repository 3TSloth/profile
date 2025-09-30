use diesel::prelude::*;
use profile_backend::models::Quote;
use profile_backend::models::StationOut;
use profile_backend::models::StationRow;
use profile_backend::models::TtcSubwayDelayData;

use profile_backend::schema::quotes::dsl::*;
use rocket::http::Method;
use rocket::http::Status;
use rocket::{get, launch, routes}; // Import Diesel query DSL traits

use profile_backend::establish_connection;
use rocket::serde::json::{json, Json, Value};
use rocket_cors::AllowedHeaders;
use std::env;

#[get("/")]
fn index() -> Value {
    json!({"hello": "world"})
}

#[get("/api/v1/quotes")]
fn get_quotes() -> Result<Json<Vec<Quote>>, Status> {
    let connection = &mut establish_connection();

    let result = quotes
        .limit(5)
        .select(Quote::as_select())
        .load::<Quote>(connection);

    match result {
        Ok(records) => Ok(Json(records)),
        Err(e) => {
            eprintln!("Database error: {e}");
            Err(Status::InternalServerError)
        }
    }
}

#[get("/api/v1/ttc_subway_delay_data")]
fn get_ttc_subway_delay_data() -> Value {
    use profile_backend::schema::ttc_subway_delay_data::dsl::*;
    let connection = &mut establish_connection();

    let results = ttc_subway_delay_data
        .select(TtcSubwayDelayData::as_select())
        .limit(5)
        .load::<TtcSubwayDelayData>(connection)
        .expect("Error loading TTC Subway Delay Data");

    json!(results)
}

use diesel::sql_query;

#[get("/api/v1/stations")]
pub fn get_stations() -> Result<Json<Vec<StationOut>>, Status> {
    let connection = &mut establish_connection();

    let sql = r#"
        WITH ranked AS (
          SELECT
            d.station,
            MIN(d.line) AS line,
            g.lat, g.lon,
            d.code,
            COUNT(*) AS cnt,
            ROW_NUMBER() OVER (
              PARTITION BY d.station
              ORDER BY COUNT(*) DESC, d.code
            ) AS rn
          FROM ttc_subway_delay_data d
          JOIN station_geo_cache g
            ON g.station_name = d.station
          GROUP BY d.station, g.lat, g.lon, d.code
        )
        SELECT
          station AS name,
          line,
          lat,
          lon,
          code AS top_code,
          cnt  AS top_count
        FROM ranked
        WHERE rn = 1
        ORDER BY station
    "#;

    let rows = sql_query(sql).load::<StationRow>(connection).map_err(|e| {
        eprintln!("DB error (stations+cause): {e}");
        Status::InternalServerError
    })?;

    let out = rows
        .into_iter()
        .map(|r| StationOut {
            id: format!("{}@{:.6},{:.6}", r.name, r.lat, r.lon),
            name: r.name,
            lat: r.lat,
            lon: r.lon,
            line: r.line,
            top_cause_code: r.top_code,
            top_cause_count: r.top_count,
        })
        .collect();

    Ok(Json(out))
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
        .mount(
            "/",
            routes![index, get_quotes, get_ttc_subway_delay_data, get_stations],
        )
        .attach(cors)
}
