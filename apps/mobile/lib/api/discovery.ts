// Discovery service client. Public endpoints (no auth required).

import type { RestaurantSummary, RestaurantDetail } from '@unsung/contracts';
import nearby from '@/lib/mock/discovery_nearby.json';
import joesPasta from '@/lib/mock/discovery_r_joes_pasta.json';
import { apiFetch, withMock } from './_client';

// Coords are optional: pass them when the user granted location (personalized
// nearby results); omit them to get the server's default set (~5 restaurants)
// so the feed is never empty. See specs/nearby-optional-location.md.
export async function getNearby(coords?: { lat: number; lng: number }): Promise<RestaurantSummary[]> {
  const qs = coords
    ? `?lat=${encodeURIComponent(coords.lat)}&lng=${encodeURIComponent(coords.lng)}`
    : '';
  return withMock(
    'discovery.getNearby',
    () => apiFetch<RestaurantSummary[]>(`/restaurants/nearby${qs}`, { auth: false }),
    () => nearby as RestaurantSummary[],
  );
}

// Map view: fetch restaurants inside the current viewport box. Same payload
// shape as getNearby, so pins and cards share RestaurantSummary. `vibes` is a
// repeatable server-side filter (OR logic); omit for all. The backend caps at
// 300 pins. See specs/map-view-frontend.md §2–3.
export async function getInBounds(args: {
  north: number;
  south: number;
  east: number;
  west: number;
  vibes?: string[];
}): Promise<RestaurantSummary[]> {
  const { north, south, east, west, vibes } = args;
  const params = new URLSearchParams({
    north: String(north),
    south: String(south),
    east: String(east),
    west: String(west),
  });
  for (const v of vibes ?? []) params.append('vibe', v);
  return withMock(
    'discovery.getInBounds',
    () => apiFetch<RestaurantSummary[]>(`/restaurants/in-bounds?${params.toString()}`, { auth: false }),
    () => {
      // Mock: filter the bundled nearby set to the box (+ vibes) so the map
      // isn't empty while the backend stabilizes.
      let list = (nearby as RestaurantSummary[]).filter(
        (r) => r.lat <= north && r.lat >= south && r.lng <= east && r.lng >= west,
      );
      if (vibes?.length) list = list.filter((r) => vibes.some((v) => r.vibes.includes(v)));
      return list;
    },
  );
}

export async function getRestaurant(id: string): Promise<RestaurantDetail> {
  return withMock(
    'discovery.getRestaurant',
    () => apiFetch<RestaurantDetail>(`/restaurants/${encodeURIComponent(id)}`, { auth: false }),
    () => {
      // Mock fallback: known detail, else synthesize from the nearby list.
      if (id === 'r_joes_pasta') return joesPasta as RestaurantDetail;
      const summary = (nearby as RestaurantSummary[]).find((r) => r.id === id);
      if (!summary) throw new Error(`Restaurant ${id} not found`);
      return { ...summary, address: summary.neighborhood, legends: [], unsungBites: [] };
    },
  );
}
