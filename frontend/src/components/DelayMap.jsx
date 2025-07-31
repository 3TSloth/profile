import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
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

  useEffect(() => {
    if (!map || !google.maps?.marker || !google.maps?.places?.Place) return;

    async function placeStations() {
      const { AdvancedMarkerElement } = await google.maps.importLibrary(
        "marker",
      );
      const searchByText = google.maps.places.Place.searchByText;
      const infoWindow = new google.maps.InfoWindow();
      const markers = [];

      for (const station of stationNames) {
        try {
          const response = await searchByText({
            textQuery: station.name,
            fields: ["location", "displayName"],
          });
          const place = response.places?.[0];

          if (!place?.location) {
            console.warn(`⚠️ No location found for ${station.name}`);
            continue;
          }

          const marker = new AdvancedMarkerElement({
            map,
            position: place.location,
            title: place.displayName?.text ?? station.name,
          });

          marker.addListener("click", () => {
            infoWindow.setContent(
              `<strong>${station.name}</strong><br>${station.info}`,
            );
            infoWindow.open(map, marker);
          });
          markers.push(marker);
        } catch (error) {
          console.error(`❌ Failed to add station ${station.name}:`, error);
        }
      }

      new MarkerClusterer({ markers, map });
    }

    placeStations();
  }, [map]);

  return null;
}

export default DelayMap;
