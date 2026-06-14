// Discovery service client.
// LIVE swap: replace function bodies with `fetch(\`${BASE}/restaurants/...\`)`. Signatures stay identical.

import type { RestaurantSummary, RestaurantDetail } from '@unsung/contracts';
import nearby from '@/lib/mock/discovery_nearby.json';
import joesPasta from '@/lib/mock/discovery_r_joes_pasta.json';
import { fakeLatency } from './_latency';

export async function getNearby(_lat: number, _lng: number): Promise<RestaurantSummary[]> {
  await fakeLatency();
  return nearby as RestaurantSummary[];
}

export async function getRestaurant(id: string): Promise<RestaurantDetail> {
  await fakeLatency();
  // Only one mock detail right now; fall back to a synthesized detail from the nearby list.
  if (id === 'r_joes_pasta') return joesPasta as RestaurantDetail;
  const summary = (nearby as RestaurantSummary[]).find((r) => r.id === id);
  if (!summary) throw new Error(`Restaurant ${id} not found`);
  return {
    ...summary,
    address: `${summary.neighborhood}, NY`,
    bestSellers: [],
    unsungBites: [],
  };
}
