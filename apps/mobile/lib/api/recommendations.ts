import type { Recommendation } from '@unsung/contracts';
import alex from '@/lib/mock/recommendations_u_alex.json';
import { fakeLatency } from './_latency';

export async function forUser(_userId: string): Promise<Recommendation[]> {
  await fakeLatency();
  return alex as Recommendation[];
}
