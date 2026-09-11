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
    () => apiFetch<RestaurantSummary[]>(`/restaurants/nearby${qs}`),
    () => nearby as RestaurantSummary[],
  );
}

export async function getRestaurant(id: string): Promise<RestaurantDetail> {
  return withMock(
    'discovery.getRestaurant',
    () => apiFetch<RestaurantDetail>(`/restaurants/${encodeURIComponent(id)}`),
    () => {
      // Mock fallback: known detail, else synthesize from the nearby list.
      if (id === 'r_joes_pasta') return joesPasta as RestaurantDetail;
      const summary = (nearby as RestaurantSummary[]).find((r) => r.id === id);
      if (!summary) throw new Error(`Restaurant ${id} not found`);
      return { ...summary, address: `${summary.neighborhood}, NY`, legends: [], unsungBites: [] };
    },
  );
}
