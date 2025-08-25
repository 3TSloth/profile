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
import { useRef } from "react";

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

  // Persist across renders
  const placeCacheRef = useRef(new Map()); // stationName -> { lat, lng, displayName }
  const inflightRequestsRef = useRef(new Map()); // stationName -> Promise<PlaceData>
  const createdMarkersRef = useRef([]); // AdvancedMarkerElement[]
  const markerClustererRef = useRef(null); // MarkerClusterer

  // Cache settings
  const PLACE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
  const CACHE_VERSION = "v1"; // bump to invalidate old entries

  useEffect(() => {
    if (!map || !google.maps?.marker || !google.maps?.places?.Place) return;
    if (!TTCData || TTCData.length === 0) return;

    let wasCancelled = false;

    const cleanupMarkersAndClusterer = () => {
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
        markerClustererRef.current = null;
      }
      for (const markerElement of createdMarkersRef.current) {
        markerElement.map = null;
      }
      createdMarkersRef.current = [];
    };

    async function getPlaceDataFromCacheOrApi(stationName) {
      // 1) In-memory cache
      if (placeCacheRef.current.has(stationName)) {
        return placeCacheRef.current.get(stationName);
      }

      // 2) sessionStorage with TTL
      const sessionKey = `place:${CACHE_VERSION}:${stationName}`;
      const cachedJson = sessionStorage.getItem(sessionKey);
      if (cachedJson) {
        try {
          const cachedEntry = JSON.parse(cachedJson);
          if (cachedEntry.expiresAt > Date.now()) {
            placeCacheRef.current.set(stationName, cachedEntry.data);
            return cachedEntry.data;
          }
          sessionStorage.removeItem(sessionKey);
        } catch {
          sessionStorage.removeItem(sessionKey);
        }
      }

      // 3) De-duplicate concurrent lookups
      if (inflightRequestsRef.current.has(stationName)) {
        return await inflightRequestsRef.current.get(stationName);
      }

      // 4) Query Places API (searchByText)
      const fetchPromise = (async () => {
        const searchByText = google.maps.places.Place.searchByText;
        const response = await searchByText({
          textQuery: stationName,
          fields: ["location", "displayName"],
        });

        const firstPlace = response?.places?.[0];
        const location = firstPlace?.location;
        if (!location) return null;

        const placeData = {
          lat: typeof location.lat === "function"
            ? location.lat()
            : location.lat,
          lng: typeof location.lng === "function"
            ? location.lng()
            : location.lng,
          displayName: firstPlace.displayName || stationName,
        };

        placeCacheRef.current.set(stationName, placeData);
        try {
          sessionStorage.setItem(
            sessionKey,
            JSON.stringify({
              data: placeData,
              expiresAt: Date.now() + PLACE_TTL_MS,
            }),
          );
        } catch {
          // ignore quota errors
        }
        return placeData;
      })().catch((error) => {
        console.warn(`Failed to look up "${stationName}":`, error);
        return null;
      });

      inflightRequestsRef.current.set(stationName, fetchPromise);
      try {
        return await fetchPromise;
      } finally {
        inflightRequestsRef.current.delete(stationName);
      }
    }

    async function buildMarkersAndClusterer() {
      cleanupMarkersAndClusterer();

      const { AdvancedMarkerElement } = await google.maps.importLibrary(
        "marker",
      );
      const infoWindow = new google.maps.InfoWindow();

      // Unique station names from data
      const uniqueStationNames = [
        ...new Set(TTCData.map((row) => row.station).filter(Boolean)),
      ];

      // Resolve all station locations (cached when available)
      const resolvedPlaceDataList = await Promise.all(
        uniqueStationNames.map((stationName) =>
          getPlaceDataFromCacheOrApi(stationName)
        ),
      );
      if (wasCancelled) return;

      // stationName -> placeData
      const placeDataByStationName = new Map();
      uniqueStationNames.forEach((stationName, index) => {
        const placeData = resolvedPlaceDataList[index];
        if (placeData) placeDataByStationName.set(stationName, placeData);
      });

      // Track how many markers per station (for jitter spacing)
      const perStationMarkerCount = new Map();
      const newMarkerElements = [];

      for (const dataRow of TTCData) {
        const placeData = placeDataByStationName.get(dataRow.station);
        if (!placeData) continue;

        const existingCount = perStationMarkerCount.get(dataRow.station) ?? 0;
        perStationMarkerCount.set(dataRow.station, existingCount + 1);

        const markerElement = createMarker({
          map,
          AdvancedMarkerElement,
          place: { location: placeData, displayName: placeData.displayName },
          station: dataRow,
          infoWindow,
          offsetIndex: existingCount,
        });

        if (markerElement) newMarkerElements.push(markerElement);
      }

      markerClustererRef.current = new MarkerClusterer({
        markers: newMarkerElements,
        map,
        minimumClusterSize: 2,
        maxZoom: 17,
        markerLayer: true,
      });
      createdMarkersRef.current = newMarkerElements;
    }

    buildMarkersAndClusterer();

    return () => {
      wasCancelled = true;
      cleanupMarkersAndClusterer();
    };
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
        const TTCDataResponse = await fetch(
          "/bff/ttc_subway_delay_data",
          { credentials: "same-origin" },
        );
        if (!TTCDataResponse.ok) {
          throw new Error(`HTTP error! status: ${TTCDataResponse.status}`);
        }

        const data = await TTCDataResponse.json();
        setTTCData(data);
      } catch (error) {
        console.error("Error when retrieving TTC Data:", error);
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
