import type { User } from '@unsung/contracts';
import alex from '@/lib/mock/users_u_alex.json';
import { fakeLatency } from './_latency';

export async function getMe(): Promise<User> {
  await fakeLatency();
  return alex as User;
}
