import type { UserGameState } from '@unsung/contracts';
import alex from '@/lib/mock/gamification_u_alex.json';
import { apiFetch, withMock } from './_client';

export async function getState(userId: string): Promise<UserGameState> {
  return withMock(
    'gamification.getState',
    () => apiFetch<UserGameState>(`/gamification/${encodeURIComponent(userId)}`),
    () => alex as UserGameState,
  );
}
