use diesel::sql_types::SqlType;

#[derive(SqlType, Debug, serde::Deserialize, serde::Serialize)]
#[diesel(postgres_type(name = "weekday"))]
pub struct Weekday; // Diesel marker type for the SQL type
