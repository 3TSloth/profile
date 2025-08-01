// @generated automatically by Diesel CLI.

pub mod sql_types {
    #[derive(diesel::query_builder::QueryId, Clone, diesel::sql_types::SqlType)]
    #[diesel(postgres_type(name = "weekday"))]
    pub struct Weekday;
}

diesel::table! {
    quotes (id) {
        id -> Int4,
        quote -> Varchar,
    }
}

diesel::table! {
    use diesel::sql_types::*;
    use super::sql_types::Weekday;

    ttc_subway_delay_data (id) {
        id -> Int4,
        date -> Nullable<Date>,
        time -> Nullable<Time>,
        day_of_week -> Nullable<Weekday>,
        station -> Nullable<Text>,
        code -> Nullable<Text>,
        delay -> Nullable<Int4>,
        gap -> Nullable<Int4>,
        direction -> Nullable<Text>,
        line -> Nullable<Text>,
        vehicle_id -> Nullable<Int4>,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    quotes,
    ttc_subway_delay_data,
);
