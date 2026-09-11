import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface AuthState {
  isLoggedIn: boolean;
  // Supabase access token; apiFetch reads it via getAccessToken() for the
  // Bearer header. Driven by Supabase auth events (see initAuth below).
  accessToken: string | null;
  // false until the first session check resolves — gates routing so we don't
  // flash the login screen before a persisted session loads.
  ready: boolean;
  login: () => void;
  logout: () => void;
  setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  accessToken: null,
  ready: false,
  login: () => set({ isLoggedIn: true }),
  logout: () => {
    // Clears Supabase's persisted session; onAuthStateChange then zeroes state.
    void supabase.auth.signOut();
    set({ isLoggedIn: false, accessToken: null });
  },
  setAccessToken: (token) => set({ accessToken: token }),
}));

// Non-hook accessor so plain modules (apiFetch) can read the token.
export const getAccessToken = () => useAuthStore.getState().accessToken;

// Sync Supabase auth state → the store. Call once at app start. onAuthStateChange
// fires with the restored session (or null) and also flips `ready`.
export function initAuth() {
  const apply = (token: string | null) =>
    useAuthStore.setState({
      accessToken: token,
      isLoggedIn: !!token,
      ready: true,
    });

  void supabase.auth.getSession().then(({ data }) => apply(data.session?.access_token ?? null));
  const { data } = supabase.auth.onAuthStateChange((_event, session) =>
    apply(session?.access_token ?? null),
  );
  return () => data.subscription.unsubscribe();
}
