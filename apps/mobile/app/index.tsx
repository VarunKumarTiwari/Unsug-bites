import { Redirect } from 'expo-router';
import { LoadingScreen } from '@unsung/ui';
import { useAuthStore } from '@/lib/store/auth';

// Entry gate: wait for the persisted Supabase session to resolve, then route.
// Logged in → onboarding splash (location) → app. Logged out → login.
export default function Index() {
  const ready = useAuthStore((s) => s.ready);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  if (!ready) return <LoadingScreen />;
  return <Redirect href={isLoggedIn ? '/splash' : '/login'} />;
}
