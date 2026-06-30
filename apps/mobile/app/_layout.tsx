import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Screen, Text, color, space, radius } from '@unsung/ui';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60, retry: 2 } },
});

// ponytail: Expo Router's built-in ErrorBoundary export — catches fatal JS exceptions (e.g. Metro socket drops on Android)
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <Screen padded>
      <View style={eb.container}>
        <Text variant="h3Serif" tone="muted" style={eb.title}>Something went wrong</Text>
        <Text variant="small" tone="muted" style={eb.message}>
          {error.message || 'An unexpected error occurred.'}
        </Text>
        <Pressable
          onPress={retry}
          style={({ pressed }) => [eb.button, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Text variant="smallStrong" tone="surface">Try again</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const eb = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  title: { textAlign: 'center', marginBottom: space.sm },
  message: { textAlign: 'center', marginBottom: space.lg, maxWidth: 260 },
  button: {
    backgroundColor: color.text.base,
    borderRadius: radius.pill,
    paddingVertical: space.sm + 4,
    paddingHorizontal: space.lg,
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.bg }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: color.bg },
              animation: 'none',
            }}
          />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
