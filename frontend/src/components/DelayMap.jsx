import {
  APIProvider,
  Map as GoogleMap,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import codeDescriptions from "../utilities/codeDescriptions.json" with {
  type: "json",
};

function DelayMap() {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return (
    <div className="col-start-1 col-end-6 row-start-2 row-end-7 h-full py-10">
      <APIProvider
        apiKey={googleMapsApiKey}
        libraries={["marker", "places"]}
      >
        <GoogleMap
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

      if (!TTCData) return;

      const stationCount = new Map();
      const placePromises = [];

      // Collect unique station names
      const uniqueStationNames = [
        ...new Set(TTCData.map((s) => s.station).filter(Boolean)),
      ];

      // Start all place searches in parallel
      for (const stationName of uniqueStationNames) {
        const promise = searchByText({
          textQuery: stationName,
          fields: ["location", "displayName"],
        });
        placePromises.push([stationName, promise]);
      }

      // Wait for all place lookups to complete
      const results = await Promise.allSettled(
        placePromises.map(([, promise]) => promise),
      );

      const placeCache = new Map();

      // Match results back to station names
      for (let i = 0; i < results.length; i++) {
        const [stationName] = placePromises[i];
        const result = results[i];

        if (result.status === "fulfilled") {
          const place = result.value?.places?.[0];
          if (place?.location) {
            placeCache.set(stationName, place);
          } else {
            console.warn(`⚠️ No location found for ${stationName}`);
          }
        } else {
          console.warn(`❌ Failed to look up ${stationName}:`, result.reason);
        }
      }

      const markers = [];

      // Create markers (off-map) using placeCache
      for (const station of TTCData) {
        const place = placeCache.get(station.station);
        if (!place?.location) continue;

        const count = stationCount.get(station.station) ?? 0;
        stationCount.set(station.station, count + 1);

        const marker = createMarker({
          map,
          AdvancedMarkerElement,
          place,
          station,
          infoWindow,
          offsetIndex: count,
        });

        if (marker) markers.push(marker);
      }

      // Only now attach markers via clusterer
      new MarkerClusterer({
        markers,
        map,
        minimumClusterSize: 2,
        maxZoom: 17,
        markerLayer: true,
      });
    }

    placeStations();
  }, [map, TTCData]);

  return null;
}

function createMarker(
  { map, AdvancedMarkerElement, place, station, infoWindow, offsetIndex },
) {
  const div = document.createElement("div");
  div.style.backgroundColor = "white";
  div.style.padding = "4px";
  div.style.border = "1px solid black";

  const paragraph = document.createElement("p");
  paragraph.textContent = `Code ${codeDescriptions[station.code]}`;
  div.appendChild(paragraph);

  const jitteredPosition = jitterPosition(place.location, offsetIndex);
  if (!jitteredPosition) return;
  const marker = new AdvancedMarkerElement({
    map,
    position: jitteredPosition,
    title: place.displayName ?? station.station,
    content: div,
  });

  marker.addListener("click", () => {
    infoWindow.setContent(
      `Delay in minutes: ${station.delay ?? ""}`,
    );
    infoWindow.open(map, marker);
  });

  return marker;
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
  const lat = typeof position.lat === "function"
    ? position.lat()
    : position.lat;
  const lng = typeof position.lng === "function"
    ? position.lng()
    : position.lng;

  if (typeof lat !== "number" || typeof lng !== "number") {
    console.error("❌ Invalid position passed to jitterPosition", position);
    return null;
  }

  const radius = 0.0001; // ~10m
  const angle = (index * 137.5) % 360; // golden angle for spacing
  const latOffset = radius * Math.cos(angle * Math.PI / 180);
  const lngOffset = radius * Math.sin(angle * Math.PI / 180);
  return {
    lat: lat + latOffset,
    lng: lng + lngOffset,
  };
}

export default DelayMap;
