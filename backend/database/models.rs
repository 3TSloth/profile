use diesel::prelude::*;
use rocket::serde::Deserialize;

#[derive(Insertable, Queryable, Selectable)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[diesel(table_name = crate::database::schema::orders)]
#[derive(Deserialize)]
#[serde(crate = "rocket::serde")]
#[derive(FromForm, Debug)]
pub struct Quotes {
    pub quote: String,
}
