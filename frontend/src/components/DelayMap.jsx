import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

const stationNames = [
  { name: "Yonge and Dundas Station", info: "Downtown core" },
  { name: "St. George Station", info: "Bloor and Bedford" },
  // Add more...
];

function DelayMap() {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return (
    <div className="col-start-1 col-end-6 row-start-2 row-end-7 h-full py-10">
      <APIProvider
        apiKey={googleMapsApiKey}
        libraries={["marker", "places"]}
      >
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultCenter={{ lat: 43.6532, lng: -79.3832 }}
          defaultZoom={12}
          gestureHandling="greedy"
          mapId="8b26d7d82dd2cb40c086ce5c"
        />
        <StationMarkers />
      </APIProvider>
    </div>
  );
}

function StationMarkers() {
  const map = useMap();
  const [TTCData] = useTTCData();

  useEffect(() => {
    if (!map || !google.maps?.marker || !google.maps?.places?.Place) return;

    async function placeStations() {
      const { AdvancedMarkerElement } = await google.maps.importLibrary(
        "marker",
      );
      const searchByText = google.maps.places.Place.searchByText;
      const infoWindow = new google.maps.InfoWindow();
      const markers = [];

      if (!TTCData) return;

      for (const [index, station] of TTCData.entries()) {
        try {
          const response = await searchByText({
            textQuery: station["station"],
            fields: ["location", "displayName"],
          });

          const place = response?.places?.[0];

          if (!place?.location) {
            console.warn(`⚠️ No location found for ${station.station}`);
            continue;
          }

          const jitteredPosition = jitterPosition(place.location, index);

          const marker = new AdvancedMarkerElement({
            map,
            position: jitteredPosition,
            title: place.displayName ?? station.station,
          });

          marker.addListener("click", () => {
            infoWindow.setContent(
              `<strong>${station.station}</strong><br>${station.info ?? ""}`,
            );
            infoWindow.open(map, marker);
          });

          markers.push(marker);
        } catch (error) {
          console.error(`❌ Failed to add station ${station.station}:`, error);
        }
      }

      new MarkerClusterer({ markers, map });
    }

    placeStations();
  }, [map, TTCData]);

  return null;
}

function useTTCData() {
  const [TTCData, setTTCData] = useState([]);

  useEffect(() => {
    const getTTCData = async () => {
      try {
        const configResponse = await fetch("/config");
        const config = await configResponse.json();
        const apiUrl = config.backendApiUrl;

        if (!apiUrl) {
          console.error("API URL not found in config");
          return;
        }

        const TTCDataResponse = await fetch(
          `${apiUrl}/api/v1/ttc_subway_delay_data`,
        );
        const data = await TTCDataResponse.json();
        setTTCData(data);
      } catch (error) {
        console.error("Error when retreiving TTC Data:", error);
      }
    };

    getTTCData();
  }, []);
  return [TTCData];
}

function jitterPosition(position, index) {
  const jitter = (Math.random() - 0.5) * 0.0001;

  const lat = typeof position.lat === "function"
    ? position.lat()
    : position.lat;
  const lng = typeof position.lng === "function"
    ? position.lng()
    : position.lng;

  return {
    lat: lat + jitter,
    lng: lng + jitter,
  };
}
export default DelayMap;
