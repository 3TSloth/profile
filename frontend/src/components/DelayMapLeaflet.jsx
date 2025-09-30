// DelayMapLeaflet.jsx
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import codeDescriptions from "../utilities/codeDescriptions.json" with {
  type: "json",
};

// --- Vite/CRA icon path fix (Leaflet expects images at a specific URL) ---
import iconUrl from "leaflet/dist/images/marker-icon.png";
import icon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import useTTCData from "../hooks/useTTCData.jsx";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl: icon2xUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Fit map to all stations on mount/update
function FitToStations({ stations }) {
  const map = useMap();
  const bounds = useMemo(() => {
    const ll = stations
      .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lon))
      .map((s) => [s.lat, s.lon]);
    return ll.length ? L.latLngBounds(ll) : null;
  }, [stations]);

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView([43.6532, -79.3832], 12); // fallback (Toronto)
    }
  }, [bounds, map]);

  return null;
}

/**
 * Props:
 *   tileUrl?: string  (override if you use a hosted tile provider)
 *   attribution?: string
 */
export default function DelayMapLeaflet({
  tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution = "&copy; OpenStreetMap contributors",
}) {
  const stations = useTTCData();

  return (
    <div className="h-full w-full">
      <MapContainer
        className="h-full w-full rounded-2xl"
        center={[43.6532, -79.3832]}
        zoom={12}
        scrollWheelZoom
        preferCanvas
      >
        <TileLayer url={tileUrl} attribution={attribution} />

        <FitToStations stations={stations} />

        {/* Cluster DOM markers; for tens of thousands, switch to canvas/symbol layers */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          spiderfyOnEveryZoom={false}
          showCoverageOnHover={false}
        >
          {stations.length > 0
            ? stations.map((s) => (
              <Marker key={s.id ?? s.name} position={[s.lat, s.lon]}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{s.name}</div>
                    {s.line
                      ? <div className="text-gray-600">Line: {s.line}</div>
                      : null}

                    {/* NEW: top cause */}
                    {s.top_cause_code
                      ? (
                        <div className="mt-1">
                          Top cause:{" "}
                          <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">
                            <span className="font-semibold">
                              {codeDescriptions[s.top_cause_code]}
                            </span>
                            <span className="opacity-70">
                              ({s.top_cause_count})
                            </span>
                          </span>
                        </div>
                      )
                      : <div className="mt-1 opacity-70">Top cause: —</div>}

                    <div className="mt-1 text-xs text-gray-500">
                      {s.lat.toFixed(6)}, {s.lon.toFixed(6)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))
            : <p>Stations not available</p>}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
