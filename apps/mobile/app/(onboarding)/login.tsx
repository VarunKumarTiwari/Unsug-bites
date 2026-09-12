import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Screen, Text, Button, Logo, color, space, radius } from '@unsung/ui';
import { supabase } from '@/lib/supabase';

// Login lives in the app (native + Expo web), not the marketing site.
// See specs/auth-lives-in-app.md. On success, Supabase's onAuthStateChange
// updates useAuthStore (via initAuth) and index.tsx routes past login.

type Pending = null | 'password' | 'magic' | 'google' | 'apple';

const emailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Brand marks — inline SVG, same approach as @unsung/ui Logo. lucide has no
// branded logos.
function GoogleMark() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <Path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </Svg>
  );
}

function AppleMark() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        fill={color.text.base}
        d="M17.05 12.9c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.1-2.01-3.77-2.04-1.6-.16-3.13.94-3.94.94-.81 0-2.07-.92-3.4-.9-1.75.03-3.36 1.02-4.26 2.58-1.82 3.16-.46 7.84 1.3 10.4.87 1.26 1.9 2.66 3.26 2.61 1.31-.05 1.8-.84 3.38-.84 1.58 0 2.02.84 3.4.82 1.4-.03 2.29-1.28 3.15-2.54.99-1.46 1.4-2.87 1.42-2.94-.03-.01-2.72-1.04-2.75-4.13ZM14.5 5.3c.72-.87 1.2-2.08 1.07-3.3-1.03.04-2.28.69-3.02 1.56-.66.77-1.24 2-1.09 3.18 1.15.09 2.32-.58 3.04-1.44Z"
      />
    </Svg>
  );
}

export default function Login() {
  const router = useRouter();
  const { reason, mode } = useLocalSearchParams<{ reason?: string; mode?: string }>();
  return (
    <AuthForm
      reason={reason}
      initialMode={mode === 'signup' ? 'signup' : 'signin'}
      showBack
      onBack={() => router.back()}
      onSuccess={() => router.replace('/splash')}
    />
  );
}

export function AuthForm({
  reason,
  initialMode = 'signin',
  showBack = true,
  onBack,
  onSuccess,
}: {
  reason?: string;
  initialMode?: 'signin' | 'signup';
  showBack?: boolean;
  onBack?: () => void;
  // Called once a session exists. Embedded (AuthGate) passes a no-op — the
  // auth store flip re-renders the gate to reveal the protected content.
  onSuccess?: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  // OAuth/magic-link auto-create the account, so login==signup for those. Only
  // the email+password path needs a distinct signUp() call for new users.
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  async function handlePasswordAuth() {
    setError(null);
    if (!emailValid(email)) return setError('Enter a valid email address.');
    if (!password) return setError('Enter your password.');
    if (mode === 'signup' && password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setPending('password');
    const { error } =
      mode === 'signup'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
    setPending(null);
    if (error) return setError(error.message);
    // signUp may require email confirmation (no session yet) → tell the user.
    // signIn (or auto-confirmed signUp) sets a session → auth listener routes.
    if (mode === 'signup' && !(await supabase.auth.getSession()).data.session) {
      return setMagicSent(true); // reuse the "check your email" confirmation view
    }
    onSuccess?.();
  }

  async function handleMagicLink() {
    setError(null);
    if (!emailValid(email)) return setError('Enter a valid email to get a link.');

    setPending('magic');
    const { error } = await supabase.auth.signInWithOtp({ email });
    setPending(null);
    if (error) return setError(error.message);
    setMagicSent(true);
  }

  // ponytail: web uses the browser redirect flow; native OAuth needs
  // expo-auth-session + a shauni:// deep-link redirect (see spec, task #5).
  // Stubbed on native until wired. Apple Sign-In is required alongside Google
  // for App Store review — ship both together.
  async function handleOAuth(provider: 'google' | 'apple') {
    setError(null);
    if (Platform.OS !== 'web') {
      Alert.alert('Coming soon', `${provider === 'google' ? 'Google' : 'Apple'} sign-in isn't wired on the app yet. Use email for now.`);
      return;
    }
    setPending(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setPending(null);
      setError(error.message);
    }
    // On success the browser redirects away.
  }

  if (magicSent) {
    return (
      <Screen padded>
        <View style={styles.centered}>
          <Logo size={52} />
          <Text variant="h3Serif" style={styles.title}>Check your email</Text>
          <Text variant="body" tone="muted" style={styles.subtitle}>
            We sent a link to {email}. Open it on this device to finish
            {mode === 'signup' ? ' creating your account.' : ' signing in.'}
          </Text>
          <Button label="Use a different method" variant="ghost" onPress={() => setMagicSent(false)} />
        </View>
      </Screen>
    );
  }

  const busy = pending !== null;

  return (
    <Screen padded>
      <View style={styles.container}>
        <View style={styles.header}>
          <Logo size={56} />
          <Text variant="h2" tone="primary" style={styles.title}>
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </Text>
          <Text variant="body" tone="muted" style={styles.subtitle}>
            {reason
              ? reason
              : mode === 'signup'
                ? 'Sign up to start finding hidden gems.'
                : 'Log in to pick up where you left off.'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text variant="labelStrong" style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={color.text.subtle}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              editable={!busy}
            />
          </View>

          <View style={styles.field}>
            <Text variant="labelStrong" style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={color.text.subtle}
              secureTextEntry
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChangeText={setPassword}
              editable={!busy}
            />
          </View>

          {error && (
            <Text variant="small" tone="primary" style={styles.error}>{error}</Text>
          )}

          <Button
            label={
              pending === 'password'
                ? mode === 'signup' ? 'Creating account…' : 'Signing in…'
                : mode === 'signup' ? 'Sign up' : 'Sign in'
            }
            loading={pending === 'password'}
            disabled={busy}
            onPress={handlePasswordAuth}
          />
          <Button
            label={pending === 'magic' ? 'Sending…' : 'Email me a magic link'}
            variant="ghost"
            disabled={busy}
            onPress={handleMagicLink}
          />

          <Pressable
            onPress={() => { setError(null); setMode((m) => (m === 'signup' ? 'signin' : 'signup')); }}
            disabled={busy}
            style={styles.modeToggle}
          >
            <Text variant="small" tone="muted">
              {mode === 'signup' ? 'Already have an account? ' : "New here? "}
              <Text variant="smallStrong" tone="primary">
                {mode === 'signup' ? 'Log in' : 'Sign up'}
              </Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.divider}>
          <View style={styles.rule} />
          <Text variant="small" tone="muted">or continue with</Text>
          <View style={styles.rule} />
        </View>

        <View style={styles.socialRow}>
          <Pressable
            accessibilityLabel="Continue with Google"
            disabled={busy}
            onPress={() => handleOAuth('google')}
            style={({ pressed }) => [styles.socialBtn, pressed && styles.socialPressed, busy && styles.socialDisabled]}
          >
            {pending === 'google' ? <Text variant="smallMedium" tone="muted">…</Text> : <GoogleMark />}
          </Pressable>
          <Pressable
            accessibilityLabel="Continue with Apple"
            disabled={busy}
            onPress={() => handleOAuth('apple')}
            style={({ pressed }) => [styles.socialBtn, pressed && styles.socialPressed, busy && styles.socialDisabled]}
          >
            {pending === 'apple' ? <Text variant="smallMedium" tone="muted">…</Text> : <AppleMark />}
          </Pressable>
        </View>

        {showBack && (
          <Pressable onPress={onBack} style={styles.back} disabled={busy}>
            <Text variant="smallMedium" tone="muted">Back</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

const CONTENT_MAX_W = 380;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: space.lg, width: '100%', maxWidth: CONTENT_MAX_W, alignSelf: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, maxWidth: CONTENT_MAX_W, alignSelf: 'center' },
  header: { alignItems: 'center', gap: space.xs },
  title: { textAlign: 'center', marginTop: space.sm },
  subtitle: { textAlign: 'center', maxWidth: 300 },
  form: { gap: space.md },
  field: { gap: 6 },
  label: { letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    paddingHorizontal: space.md,
    paddingVertical: 13,
    fontSize: 15,
    color: color.text.base,
  },
  error: { textAlign: 'center' },
  modeToggle: { alignSelf: 'center', paddingVertical: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rule: { flex: 1, height: 1, backgroundColor: color.border },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: space.md },
  socialBtn: {
    width: 64,
    height: 52,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialPressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  socialDisabled: { opacity: 0.5 },
  back: { alignSelf: 'center', paddingVertical: space.sm },
});
