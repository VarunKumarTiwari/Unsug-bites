import { Platform } from 'react-native';

// ─── Bounding box ───────────────────────────────────────────────────────────
export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// A box is sendable only if every edge is a real number, north is strictly
// above south, and it doesn't cross the antimeridian (west must be <= east).
// The backend 400s on any of these, so we skip the request instead. See
// specs/map-view-frontend.md "400s to handle".
export function boundsValid(b: Bounds | null | undefined): b is Bounds {
  if (!b) return false;
  const { north, south, east, west } = b;
  if (![north, south, east, west].every((v) => typeof v === 'number' && Number.isFinite(v))) {
    return false;
  }
  if (north <= south) return false;
  if (west > east) return false; // antimeridian — don't send boxes crossing ±180°
  return true;
}

// react-query cache key: round edges so micro-pans (sub-tile jitter) reuse the
// cached response instead of refetching. ~4 decimals ≈ 11m — finer than any pin.
export function roundBounds(b: Bounds): Bounds {
  const r = (n: number) => Math.round(n * 1e4) / 1e4;
  return { north: r(b.north), south: r(b.south), east: r(b.east), west: r(b.west) };
}

// ─── Distance ─────────────────────────────────────────────────────────────────
type LatLng = { lat: number; lng: number };

// Haversine great-circle distance in km. Used only for the pin sheet's
// "0.8 km away" label — accuracy to a few meters is irrelevant here.
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371; // Earth radius, km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

// "120 m away" under 1km, else "0.8 km away". null → caller omits the label.
export function formatDistance(from: LatLng | null | undefined, to: LatLng): string | null {
  if (!from) return null;
  const km = haversineKm(from, to);
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}

// ─── Directions deep link ──────────────────────────────────────────────────────
// Hand the OS a maps URL built from the pin's coords. The native app owns
// routing/ETA/traffic — we build none of it. See spec §6.
export function directionsUrl(lat: number, lng: number, name: string): string {
  const label = encodeURIComponent(name);
  switch (Platform.OS) {
    case 'ios':
      return `maps://?daddr=${lat},${lng}`;
    case 'android':
      return `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
    default:
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
}
