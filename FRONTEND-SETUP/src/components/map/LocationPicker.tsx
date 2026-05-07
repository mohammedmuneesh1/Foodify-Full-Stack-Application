import React, { useState, useEffect, useRef, useCallback } from "react";

/* eslint-disable */

// ─── Types ────────────────────────────────────────────────────────────────────
interface LocationData {
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: [number, number]; // [longitude, latitude]
}

interface LocationPickerProps {
  value: LocationData;
  onChange: (data: LocationData) => void;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    county?: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const reverseGeocode = async (lat: number, lon: number): Promise<Partial<LocationData>> => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
    { headers: { "Accept-Language": "en" } }
  );
  const data: NominatimResult = await res.json();
  const a = data.address;

  const road = a.road || a.suburb || a.neighbourhood || "";
  const city = a.city || a.town || a.village || a.county || "";
  const state = a.state || "";
  const pincode = a.postcode || "";
  const address = [road, city].filter(Boolean).join(", ") || data.display_name.split(",")[0];

  return { address, city, state, pincode };
};

const searchPlaces = async (query: string): Promise<NominatimResult[]> => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`,
    { headers: { "Accept-Language": "en" } }
  );
  return res.json();
};

// ─── Component ────────────────────────────────────────────────────────────────
const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(0);

  // Default center: India
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const hasCoords = value.coordinates[0] !== 0 || value.coordinates[1] !== 0;

  // ── Init Leaflet (loaded from CDN lazily) ──────────────────────────────────
  useEffect(() => {
    const initMap = async () => {
      // Load Leaflet CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!(window as any).L) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      const L = (window as any).L;
      if (!mapRef.current || leafletMap.current) return;

      const center: [number, number] = hasCoords
        ? [value.coordinates[1], value.coordinates[0]]
        : defaultCenter;

      const map = L.map(mapRef.current, { zoomControl: true }).setView(center, hasCoords ? 16 : 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Custom red marker icon
      const icon = L.divIcon({
        html: `<div style="
          width:28px;height:28px;background:#ff4d2d;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        className: "",
      });

      if (hasCoords) {
        markerRef.current = L.marker(center, { icon, draggable: true }).addTo(map);
        markerRef.current.on("dragend", handleMarkerDrag);
      }

      // Click on map to place marker
      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        placeMarker(lat, lng, map, icon);
      });

      leafletMap.current = map;
      setMapReady(true);
    };

    initMap();

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  const placeMarker = useCallback(async (lat: number, lng: number, map?: any, icon?: any) => {
    const L = (window as any).L;
    const m = map || leafletMap.current;
    if (!m) return;

    const resolvedIcon = icon || L.divIcon({
      html: `<div style="
        width:28px;height:28px;background:#ff4d2d;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      className: "",
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: resolvedIcon, draggable: true }).addTo(m);
      markerRef.current.on("dragend", handleMarkerDrag);
    }

    m.setView([lat, lng], 16);

    try {
      const geo = await reverseGeocode(lat, lng);
      onChange({
        ...value,
        ...geo,
        coordinates: [lng, lat], // [longitude, latitude] for MongoDB GeoJSON
      });
    } catch {
      onChange({ ...value, coordinates: [lng, lat] });
    }
  }, [value, onChange]);

  const handleMarkerDrag = useCallback(async (e: any) => {
    const { lat, lng } = e.target.getLatLng();
    try {
      const geo = await reverseGeocode(lat, lng);
      onChange({ ...value, ...geo, coordinates: [lng, lat] });
    } catch {
      onChange({ ...value, coordinates: [lng, lat] });
    }
  }, [value, onChange]);

  // ── Current location ───────────────────────────────────────────────────────
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        await placeMarker(coords.latitude, coords.longitude);
        setLocating(false);
      },
      () => {
        setError("Unable to get your location. Please allow location access.");
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearchInput = (query: string) => {
    setSearchQuery(query);
    clearTimeout(debounceTimer.current);
    if (query.length < 3) { setSuggestions([]); return; }
    setSearchLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(query);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  const selectSuggestion = async (result: NominatimResult) => {
    setSuggestions([]);
    setSearchQuery(result.display_name.split(",")[0]);
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    await placeMarker(lat, lng);
  };

  return (
    <div className="border border-gray-200 p-4 rounded-xl space-y-3 w-full max-w-full h-full overflow-y-scroll">
      {/* <h3 className="font-semibold text-gray-800">Location</h3> */}

      {/* Search bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              placeholder="Search place name..."
              className="w-full border border-gray-300 p-2 pl-9 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/40 text-sm"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
            />
            <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchLoading && (
              <div className="absolute right-2.5 top-2.5 w-4 h-4 border-2 border-[#ff4d2d] border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {/* Current location button */}
          <button
            onClick={useCurrentLocation}
            disabled={locating}
            className="flex items-center gap-1.5 bg-[#ff4d2d] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#e63d1f] transition disabled:opacity-60 flex-shrink-0"
          >
            {locating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            {locating ? "Locating..." : "Use My Location"}
          </button>
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {suggestions.map((s) => (
              <li
                key={s.place_id}
                onClick={() => selectSuggestion(s)}
                className="px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-0 flex items-start gap-2"
              >
                <svg className="w-4 h-4 text-[#ff4d2d] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="line-clamp-2">{s.display_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Map */}
      <div
        ref={mapRef}
        className="w-full h-56 rounded-lg overflow-hidden border border-gray-200 z-0"
        style={{ position: "relative" }}
      />

      {!mapReady && (
        <div className="w-full h-56 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-400 -mt-56 relative z-10">
          Loading map...
        </div>
      )}

      {/* Hint */}
      <p className="text-xs text-gray-400">
        📍 Click on the map or drag the pin to fine-tune the location.
      </p>

      {/* Auto-filled fields */}
      <input
        placeholder="Address *"
        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/40 text-sm"
        value={value.address}
        onChange={(e) => onChange({ ...value, address: e.target.value })}
      />

      <div className="flex gap-2">
        <input
          placeholder="City"
          className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none text-sm"
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
        />
        <input
          placeholder="State"
          className="border border-gray-300 p-2 rounded-lg w-full focus:outline-none text-sm"
          value={value.state}
          onChange={(e) => onChange({ ...value, state: e.target.value })}
        />
      </div>

      <input
        placeholder="Pincode"
        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none text-sm"
        value={value.pincode}
        onChange={(e) => onChange({ ...value, pincode: e.target.value })}
      />

      {/* Coordinates display */}
      {hasCoords && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-green-700 font-medium">
            Location pinned — {value.coordinates[1].toFixed(5)}, {value.coordinates[0].toFixed(5)}
          </span>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;