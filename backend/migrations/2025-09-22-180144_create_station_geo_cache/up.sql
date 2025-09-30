-- 2025-09-22_create_station_geo_cache.sql
CREATE TABLE IF NOT EXISTS station_geo_cache (
  station_key  TEXT PRIMARY KEY,              -- normalized key, e.g. "BATHURST STATION|TORONTO|CA"
  station_name TEXT NOT NULL,                 -- original name from your data
  city         TEXT NOT NULL DEFAULT 'Toronto',
  country_cc   TEXT NOT NULL DEFAULT 'CA',    -- ISO-2
  lat          DOUBLE PRECISION NOT NULL,
  lon          DOUBLE PRECISION NOT NULL,
  display_name TEXT,                          -- from OSM (human readable)
  osm_id       BIGINT,
  osm_type     TEXT,                          -- "node"|"way"|"relation"
  source       TEXT NOT NULL DEFAULT 'nominatim',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS station_geo_cache_unique_triplet
ON station_geo_cache (station_name, city, country_cc);

-- A view returning distinct stations 
CREATE OR REPLACE VIEW stations_with_coords AS
SELECT DISTINCT ON (d.station)
  d.station AS name,
  d.line     AS line,
  g.lat,
  g.lon
FROM ttc_subway_delay_data d
JOIN station_geo_cache g
  ON g.station_name = d.station
ORDER BY d.station, d.line NULLS LAST;

