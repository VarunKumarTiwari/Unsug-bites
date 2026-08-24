import type { Recommendation } from '@unsung/contracts';
import alex from '@/lib/mock/recommendations_u_alex.json';
import { apiFetch, withMock } from './_client';

export async function forUser(userId: string): Promise<Recommendation[]> {
  return withMock(
    'recommendations.forUser',
    () => apiFetch<Recommendation[]>(`/recommendations/${encodeURIComponent(userId)}`),
    () => alex as Recommendation[],
  );
}
