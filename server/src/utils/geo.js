/**
 * Haversine distance between two lat/lng points, in kilometres.
 */
export function haversineKm(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return 0;
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Simple, transparent campus fare model:
 *   base fare + per-km rate, rounded to the nearest rupee, min ₹10.
 */
export function estimateFare(distanceKm) {
  const BASE = 10; // ₹
  const PER_KM = 12; // ₹/km
  return Math.max(BASE, Math.round(BASE + distanceKm * PER_KM));
}
