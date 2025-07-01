use diesel::prelude::*;

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::quotes)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[derive(serde::Serialize)]
pub struct Quote {
    pub id: i32,
    pub quote: String,
}
