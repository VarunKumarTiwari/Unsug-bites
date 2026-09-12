import React from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { AuthForm } from '@/app/(onboarding)/login';

export function AuthGate({ reason, children }: { reason: string; children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  if (isLoggedIn) return <>{children}</>;
  return <AuthForm reason={reason} initialMode="signup" showBack={false} />;
}
