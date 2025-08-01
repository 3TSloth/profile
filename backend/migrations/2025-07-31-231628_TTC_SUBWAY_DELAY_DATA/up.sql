CREATE TYPE weekday AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

CREATE TABLE ttc_subway_delay_data (
  id SERIAL PRIMARY KEY,
  date DATE,
  time TIME,
  day_of_week weekday,
  station TEXT,
  code TEXT,
  delay INTEGER,
  gap INTEGER,
  direction TEXT,
  line TEXT,
  vehicle_id INTEGER
);
