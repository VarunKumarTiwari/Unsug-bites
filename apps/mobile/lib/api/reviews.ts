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
  // Stamp the device's IANA zone so local-time badges (e.g. Dawn Patrol) work
  // anywhere, not just the server's region. Server falls back to UTC if absent.
  const tz = input.tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  return withMock(
    'reviews.submit',
    () => apiFetch<Review>('/reviews', { method: 'POST', body: { ...input, tz } }),
    () => ({
      ...input,
      tz,
      id: `rev_${Math.floor(Math.random() * 1e9).toString(36)}`,
      createdAt: new Date().toISOString(),
    }),
  );
}
