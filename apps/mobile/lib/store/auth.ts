import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  // Supabase access token, set once real sign-in lands (separate spec).
  // apiFetch reads it via getAccessToken() to attach the Bearer header.
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  toggle: () => void;
  setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  accessToken: null,
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false, accessToken: null }),
  toggle: () => set((s) => ({ isLoggedIn: !s.isLoggedIn })),
  setAccessToken: (token) => set({ accessToken: token }),
}));

// Non-hook accessor so plain modules (apiFetch) can read the token.
export const getAccessToken = () => useAuthStore.getState().accessToken;
