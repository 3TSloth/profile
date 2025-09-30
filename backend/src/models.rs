use diesel::deserialize::{self, FromSql, FromSqlRow};
use diesel::expression::AsExpression;
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::serialize::{self, Output, ToSql};
use diesel::sql_types::Text;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::quotes)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[derive(serde::Serialize)]
pub struct Quote {
    pub id: i32,
    pub quote: String,
}

#[derive(Debug, Queryable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::ttc_subway_delay_data)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct TtcSubwayDelayData {
    pub id: i32,
    pub date: Option<chrono::NaiveDate>,
    pub time: Option<chrono::NaiveTime>,
    pub day_of_week: Option<WeekdayEnum>,
    pub station: Option<String>,
    pub code: Option<String>,
    pub delay: Option<i32>,
    pub gap: Option<i32>,
    pub direction: Option<String>,
    pub line: Option<String>,
    pub vehicle_id: Option<i32>,
}

#[derive(AsExpression, FromSqlRow, Serialize, Deserialize, Debug, Clone, Copy)]
#[diesel(sql_type = crate::schema::sql_types::Weekday)]
#[serde(rename_all = "PascalCase")]
pub enum WeekdayEnum {
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday,
}

impl ToSql<crate::schema::sql_types::Weekday, Pg> for WeekdayEnum {
    fn to_sql<'b>(&'b self, out: &mut Output<'b, '_, Pg>) -> serialize::Result {
        match self {
            WeekdayEnum::Monday => ToSql::<Text, Pg>::to_sql(&"Monday", out),
            WeekdayEnum::Tuesday => ToSql::<Text, Pg>::to_sql(&"Tuesday", out),
            WeekdayEnum::Wednesday => ToSql::<Text, Pg>::to_sql(&"Wednesday", out),
            WeekdayEnum::Thursday => ToSql::<Text, Pg>::to_sql(&"Thursday", out),
            WeekdayEnum::Friday => ToSql::<Text, Pg>::to_sql(&"Friday", out),
            WeekdayEnum::Saturday => ToSql::<Text, Pg>::to_sql(&"Saturday", out),
            WeekdayEnum::Sunday => ToSql::<Text, Pg>::to_sql(&"Sunday", out),
        }
    }
}

impl FromSql<crate::schema::sql_types::Weekday, Pg> for WeekdayEnum {
    fn from_sql(bytes: diesel::pg::PgValue<'_>) -> deserialize::Result<Self> {
        match <String as FromSql<Text, Pg>>::from_sql(bytes)?.as_str() {
            "Monday" => Ok(WeekdayEnum::Monday),
            "Tuesday" => Ok(WeekdayEnum::Tuesday),
            "Wednesday" => Ok(WeekdayEnum::Wednesday),
            "Thursday" => Ok(WeekdayEnum::Thursday),
            "Friday" => Ok(WeekdayEnum::Friday),
            "Saturday" => Ok(WeekdayEnum::Saturday),
            "Sunday" => Ok(WeekdayEnum::Sunday),
            other => Err(format!("Unrecognized weekday variant: {}", other).into()),
        }
    }
}

#[derive(diesel::QueryableByName, Debug)]
pub struct StationRow {
    #[diesel(sql_type = diesel::sql_types::Text)]
    pub name: String,

    #[diesel(sql_type = diesel::sql_types::Nullable<diesel::sql_types::Text>)]
    pub line: Option<String>,

    #[diesel(sql_type = diesel::sql_types::Float8)]
    pub lat: f64,

    #[diesel(sql_type = diesel::sql_types::Float8)]
    pub lon: f64,

    #[diesel(sql_type = diesel::sql_types::Nullable<diesel::sql_types::Text>)]
    pub top_code: Option<String>,

    #[diesel(sql_type = diesel::sql_types::BigInt)]
    pub top_count: i64,
}

#[derive(Serialize, Debug)]
pub struct StationOut {
    pub id: String,
    pub name: String,
    pub lat: f64,
    pub lon: f64,
    pub line: Option<String>,
    pub top_cause_code: Option<String>,
    pub top_cause_count: i64,
}
