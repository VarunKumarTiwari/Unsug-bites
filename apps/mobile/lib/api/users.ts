import type { User } from '@unsung/contracts';
import { Platform } from 'react-native';
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

// Partial update. Backend coalesces each field, so only send what changed —
// omitted keys are left untouched. Returns the full updated profile.
export type UserPatch = Partial<Pick<User, 'displayName' | 'avatarUrl' | 'preferredVibes' | 'dietary'>>;

export async function updateMe(patch: UserPatch): Promise<User> {
  return withMock(
    'users.updateMe',
    () => apiFetch<User>('/users/me', { method: 'PATCH', body: patch }),
    () => ({ ...(alex as User), ...patch }),
  );
}

// Upload a new avatar photo. Backend re-encodes + stores it and returns the
// full updated profile with the new avatarUrl. Same multipart shape as scan.
export async function uploadAvatar(imageUri: string): Promise<User> {
  return withMock(
    'users.uploadAvatar',
    async () => {
      const form = new FormData();
      // Web: the RN { uri, name, type } shape stringifies to "[object Object]" and no file
      // part is sent — fetch the uri into a real Blob. Native: use the RN file-part shape.
      if (Platform.OS === 'web') {
        const blob = await (await fetch(imageUri)).blob();
        form.append('image', blob, 'avatar.jpg');
      } else {
        form.append('image', { uri: imageUri, name: 'avatar.jpg', type: 'image/jpeg' } as any);
      }
      return apiFetch<User>('/users/me/avatar', { method: 'POST', body: form, timeoutMs: 20000 });
    },
    () => ({ ...(alex as User), avatarUrl: imageUri }),
  );
}
