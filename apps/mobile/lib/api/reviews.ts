import type { Review, ReviewInput } from '@unsung/contracts';
import feed from '@/lib/mock/reviews_feed.json';
import { fakeLatency } from './_latency';

export async function listForUser(userId: string): Promise<Review[]> {
  await fakeLatency();
  return (feed as Review[]).filter((r) => r.userId === userId);
}

export async function submit(input: ReviewInput): Promise<Review> {
  await fakeLatency();
  return {
    ...input,
    id: `rev_${Math.floor(Math.random() * 1e9).toString(36)}`,
    createdAt: new Date().toISOString(),
  };
}
