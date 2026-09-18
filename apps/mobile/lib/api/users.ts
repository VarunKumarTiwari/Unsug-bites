import type { User } from '@unsung/contracts';
import alex from '@/lib/mock/users_u_alex.json';
import { apiFetch, withMock } from './_client';

export async function getMe(): Promise<User> {
  return withMock(
    'users.getMe',
    // "me" is the backend's self-alias: it resolves the profile from the JWT
    // sub, so this works for any signed-in user. Hitting a literal id (e.g.
    // u_alex) 403s because it isn't the caller's own id.
    () => apiFetch<User>('/users/me'),
    () => alex as User,
  );
}
