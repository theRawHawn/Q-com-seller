import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Compass, Search, Check, AlertCircle } from 'lucide-react';

// Custom Marker Icon for QCOM Store Location
const storeMarkerIcon = L.divIcon({
  className: 'custom-qcom-store-marker',
  html: `
    <div style="
      background-color: #059669;
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4), 0 2px 4px rgba(0,0,0,0.1);
      border: 3px solid #ffffff;
      cursor: grab;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background-color: #ffffff;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

interface StoreLocationMapProps {
  lat: number;
  lng: number;
  address: string;
  onLocationChange: (lat: number, lng: number, formattedAddress?: string) => void;
}

// MapRecenter component to smooth pan map when lat/lng change from outside or button
const MapRecenter: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
};

// MapClickHandler to update marker on click
const MapClickHandler: React.FC<{
  onMapClick: (lat: number, lng: number) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const StoreLocationMap: React.FC<StoreLocationMapProps> = ({
  lat,
  lng,
  address,
  onLocationChange,
}) => {
  const [position, setPosition] = useState<[number, number]>([lat, lng]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Sync external props with internal position state
  useEffect(() => {
    if (lat && lng) {
      setPosition([lat, lng]);
    }
  }, [lat, lng]);

  const handleReverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          onLocationChange(latitude, longitude, data.display_name);
          return;
        }
      }
    } catch {
      // Fallback
    }
    onLocationChange(latitude, longitude);
  };

  const handleMarkerDragEnd = () => {
    const marker = markerRef.current;
    if (marker != null) {
      const latLng = marker.getLatLng();
      const newLat = Number(latLng.lat.toFixed(6));
      const newLng = Number(latLng.lng.toFixed(6));
      setPosition([newLat, newLng]);
      handleReverseGeocode(newLat, newLng);
    }
  };

  const handleMapClick = (clickLat: number, clickLng: number) => {
    const newLat = Number(clickLat.toFixed(6));
    const newLng = Number(clickLng.toFixed(6));
    setPosition([newLat, newLng]);
    handleReverseGeocode(newLat, newLng);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetecting(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      pos => {
        const newLat = Number(pos.coords.latitude.toFixed(6));
        const newLng = Number(pos.coords.longitude.toFixed(6));
        setPosition([newLat, newLng]);
        handleReverseGeocode(newLat, newLng);
        setIsDetecting(false);
      },
      err => {
        setIsDetecting(false);
        setGeoError('Unable to detect location. Please check browser permissions or drag the map marker.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setGeoError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const results = await response.json();
        if (results && results.length > 0) {
          const first = results[0];
          const newLat = Number(parseFloat(first.lat).toFixed(6));
          const newLng = Number(parseFloat(first.lon).toFixed(6));
          setPosition([newLat, newLng]);
          onLocationChange(newLat, newLng, first.display_name);
        } else {
          setGeoError('No location matching search query. Try dragging the map pin manually.');
        }
      }
    } catch {
      setGeoError('Location search failed. Please select point on map directly.');
    } finally {
      setIsSearching(false);
    }
  };

  const eventHandlers = useMemo(
    () => ({
      dragend: handleMarkerDragEnd,
    }),
    []
  );

  return (
    <div className="space-y-3">
      {/* Search & GPS Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <form onSubmit={handleSearchLocation} className="flex-1 flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search area, landmark, pincode or street..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
          >
            {isSearching ? 'Searching...' : 'Find'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isDetecting}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
        >
          <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${isDetecting ? 'animate-spin' : ''}`} />
          {isDetecting ? 'Detecting GPS...' : 'Use Current GPS'}
        </button>
      </div>

      {geoError && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Interactive Leaflet Map Container */}
      <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-200 shadow-2xs z-0">
        <MapContainer
          center={position}
          zoom={16}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter lat={position[0]} lng={position[1]} />
          <MapClickHandler onMapClick={handleMapClick} />
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={storeMarkerIcon}
          />
        </MapContainer>

        {/* Floating Instruction overlay */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-1.5 rounded-lg text-[11px] text-slate-700 shadow-sm flex items-center justify-between z-10">
          <span className="flex items-center gap-1.5 font-medium">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            Drag pin or click map to adjust store entrance
          </span>
          <span className="font-mono text-[10px] text-slate-500 hidden sm:inline-block">
            {position[0]}, {position[1]}
          </span>
        </div>
      </div>

      {/* Latitude & Longitude Coordinate Cards */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Latitude</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{position[0]}</span>
          </div>
          <MapPin className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Longitude</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{position[1]}</span>
          </div>
          <MapPin className="w-4 h-4 text-emerald-600" />
        </div>
      </div>
    </div>
  );
};
