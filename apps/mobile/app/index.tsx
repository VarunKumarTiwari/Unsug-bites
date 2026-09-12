import { Redirect } from 'expo-router';
import { LoadingScreen } from '@unsung/ui';
import { useAuthStore } from '@/lib/store/auth';

// Entry gate: wait for the persisted Supabase session to resolve, then route.
// Everyone lands in the app — discovery (restaurants/nearby) is public.
// Login is asked for only on gated actions: scan, history, profile.
export default function Index() {
  const ready = useAuthStore((s) => s.ready);

  if (!ready) return <LoadingScreen />;
  return <Redirect href="/splash" />;
}
