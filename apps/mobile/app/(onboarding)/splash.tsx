import React from 'react';
import { View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Button, color, space, radius } from '@unsung/ui';

export default function Splash() {
  const router = useRouter();
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: space.xl }}>
        <View style={{ alignItems: 'center', marginTop: space.xl }}>
          <Text variant="display" tone="primary">
            Unsung
          </Text>
          <Text variant="display" tone="primary" style={{ marginTop: -6 }}>
            Bites
          </Text>
        </View>

        <View style={{ alignItems: 'center', paddingHorizontal: space.lg }}>
          <Text variant="h1" style={{ textAlign: 'center' }}>
            Discover the{'\n'}Flavor Next Door.
          </Text>
          <Text
            variant="body"
            tone="muted"
            style={{ textAlign: 'center', marginTop: space.sm + 4 }}
          >
            Find hidden gems and delicious details — the cafes and restaurants locals love but
            most people miss.
          </Text>
        </View>

        <View
          style={{
            height: 220,
            backgroundColor: color.surfaceMuted,
            borderRadius: radius.lg,
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: space.lg,
          }}
        >
          {/* Replace with hand-drawn diner illustration. */}
          <Text variant="h2" tone="muted">
            🏪 Local Diner
          </Text>
        </View>

        <Button label="Enable Location" onPress={() => router.replace({ pathname: '/(tabs)' })} />
      </View>
    </Screen>
  );
}
