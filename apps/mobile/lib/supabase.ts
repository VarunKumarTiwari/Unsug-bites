// Supabase client for the app (native + Expo web). Auth lives HERE now — the
// marketing site no longer holds a session (see specs/auth-lives-in-app.md).
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fail loudly rather than breaking silently inside an auth call later.
  throw new Error(
    'Missing Supabase env. Set EXPO_PUBLIC_SUPABASE_URL and ' +
      'EXPO_PUBLIC_SUPABASE_ANON_KEY (see .env.example).',
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    // AsyncStorage persists on native and is backed by localStorage on web.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Only the web build parses the OAuth redirect hash; native uses deep links.
    detectSessionInUrl: Platform.OS === 'web',
  },
});
