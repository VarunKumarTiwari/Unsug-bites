import type { RestaurantSummary } from '@unsung/contracts';
import type { Bounds } from '@/lib/geo';

// Shared contract between RestaurantMap (owns data + sheet) and the two
// platform canvases (MapCanvas.tsx = native, MapCanvas.web.tsx = web).
export interface MapCanvasProps {
  restaurants: RestaurantSummary[];
  // Where to center on first mount (user GPS, else a fallback pin).
  initialCenter: { lat: number; lng: number };
  // Fired after a pan/zoom settles (moveend) with the new viewport edges.
  // RestaurantMap debounces + validates before refetching.
  onBoundsChange: (bounds: Bounds) => void;
  // Fired when a single (unclustered) pin is tapped. Clusters are handled
  // inside the canvas (tap → expand), never bubbled up.
  onPinPress: (restaurantId: string) => void;
}

// MapTiler style URL built from the frontend env key. null when unset so the
// map can render a graceful placeholder instead of crashing. See spec R2.
export const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY ?? '';
export const MAP_STYLE_URL = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
  : null;
