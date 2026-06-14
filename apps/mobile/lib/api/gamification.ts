import type { UserGameState } from '@unsung/contracts';
import alex from '@/lib/mock/gamification_u_alex.json';
import { fakeLatency } from './_latency';

export async function getState(_userId: string): Promise<UserGameState> {
  await fakeLatency();
  return alex as UserGameState;
}
