import type { Review, ReviewInput } from '@unsung/contracts';
import feed from '@/lib/mock/reviews_feed.json';
import { apiFetch, withMock } from './_client';

export async function listForUser(userId: string): Promise<Review[]> {
  // Server derives identity from the JWT; the userId filters the mock fallback.
  return withMock(
    'reviews.listForUser',
    () => apiFetch<Review[]>('/reviews'),
    () => (feed as Review[]).filter((r) => r.userId === userId),
  );
}

export async function submit(input: ReviewInput): Promise<Review> {
  return withMock(
    'reviews.submit',
    () => apiFetch<Review>('/reviews', { method: 'POST', body: input }),
    () => ({
      ...input,
      id: `rev_${Math.floor(Math.random() * 1e9).toString(36)}`,
      createdAt: new Date().toISOString(),
    }),
  );
}
