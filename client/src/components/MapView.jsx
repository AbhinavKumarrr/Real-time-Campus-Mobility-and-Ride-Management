import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo } from 'react';
import { CAMPUS_CENTER } from '../lib/constants.js';

// Coloured pin icons built from inline SVG (no asset-loading issues with Vite).
function pin(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <path d="M14 0C6.3 0 0 6.3 0 14c0 9.8 14 26 14 26s14-16.2 14-26C28 6.3 21.7 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="14" r="6" fill="#fff"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: 'map-pin',
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -36],
  });
}

const ICONS = {
  pickup: pin('#22c55e'),
  destination: pin('#ef4444'),
  driver: pin('#6366f1'),
};

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    const valid = points.filter((p) => p && p.lat != null && p.lng != null);
    if (valid.length === 0) return;
    if (valid.length === 1) {
      map.setView([valid[0].lat, valid[0].lng], 16);
    } else {
      map.fitBounds(valid.map((p) => [p.lat, p.lng]), { padding: [40, 40], maxZoom: 17 });
    }
  }, [JSON.stringify(points)]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/**
 * Reusable campus map.
 * Props: pickup, destination (points {lat,lng,label}); drivers (array w/ currentLocation).
 */
export default function MapView({ pickup, destination, drivers = [], showRoute = true }) {
  const driverPoints = useMemo(
    () =>
      drivers
        .map((d) => ({
          id: d._id || d.driverId,
          name: d.name,
          vehicle: d.vehicle,
          lat: d.currentLocation?.lat ?? d.lat,
          lng: d.currentLocation?.lng ?? d.lng,
        }))
        .filter((d) => d.lat != null && d.lng != null),
    [drivers]
  );

  const allPoints = [pickup, destination, ...driverPoints];

  return (
    <div className="map-shell">
      <MapContainer center={CAMPUS_CENTER} zoom={15} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={allPoints} />

        {pickup?.lat != null && (
          <Marker position={[pickup.lat, pickup.lng]} icon={ICONS.pickup}>
            <Popup>Pickup: {pickup.label}</Popup>
          </Marker>
        )}
        {destination?.lat != null && (
          <Marker position={[destination.lat, destination.lng]} icon={ICONS.destination}>
            <Popup>Destination: {destination.label}</Popup>
          </Marker>
        )}
        {showRoute && pickup?.lat != null && destination?.lat != null && (
          <Polyline
            positions={[[pickup.lat, pickup.lng], [destination.lat, destination.lng]]}
            pathOptions={{ color: '#6366f1', weight: 3, dashArray: '6 8' }}
          />
        )}

        {driverPoints.map((d) => (
          <Marker key={d.id} position={[d.lat, d.lng]} icon={ICONS.driver}>
            <Popup>
              <strong>{d.name || 'Driver'}</strong>
              {d.vehicle ? <div>{d.vehicle.type} · {d.vehicle.plateNumber}</div> : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
