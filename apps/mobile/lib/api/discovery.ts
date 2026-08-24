// Discovery service client. Public endpoints (no auth required).

import type { RestaurantSummary, RestaurantDetail } from '@unsung/contracts';
import nearby from '@/lib/mock/discovery_nearby.json';
import joesPasta from '@/lib/mock/discovery_r_joes_pasta.json';
import { apiFetch, withMock } from './_client';

export async function getNearby(lat: number, lng: number): Promise<RestaurantSummary[]> {
  return withMock(
    'discovery.getNearby',
    () =>
      apiFetch<RestaurantSummary[]>(
        `/restaurants/nearby?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
      ),
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
      return { ...summary, address: `${summary.neighborhood}, NY`, bestSellers: [], unsungBites: [] };
    },
  );
}
