import type { User } from '@unsung/contracts';
import alex from '@/lib/mock/users_u_alex.json';
import { apiFetch, withMock } from './_client';

// Until real sign-in lands, "me" is the mock user's id. The server still
// derives identity from the JWT; this id only picks the path + mock fallback.
const CURRENT_USER_ID = (alex as User).id;

export async function getMe(): Promise<User> {
  return withMock(
    'users.getMe',
    () => apiFetch<User>(`/users/${encodeURIComponent(CURRENT_USER_ID)}`),
    () => alex as User,
  );
}
