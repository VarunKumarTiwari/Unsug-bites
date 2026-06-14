import React from 'react';
import { View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/primitives/Screen';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { color } from '@/theme/tokens';

export default function Splash() {
  const router = useRouter();
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 32 }}>
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <Text variant="display" serif tone="accent">
            Unsung
          </Text>
          <Text variant="display" serif tone="accent" style={{ marginTop: -6 }}>
            Bites
          </Text>
        </View>

        <View style={{ alignItems: 'center', paddingHorizontal: 24 }}>
          <Text variant="h1" serif style={{ textAlign: 'center', lineHeight: 34 }}>
            Discover the{'\n'}Flavor Next Door.
          </Text>
          <Text
            variant="body"
            tone="muted"
            style={{ textAlign: 'center', marginTop: 12, lineHeight: 22 }}
          >
            Find hidden gems and delicious details — the cafes and restaurants locals love but
            most people miss.
          </Text>
        </View>

        <View
          style={{
            height: 220,
            backgroundColor: color.stone,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 24,
          }}
        >
          {/* Replace with hand-drawn diner illustration. */}
          <Text variant="h2" serif tone="muted">
            🏪 Local Diner
          </Text>
        </View>

        <Button label="Enable Location" onPress={() => router.replace('/(tabs)')} />
      </View>
    </Screen>
  );
}
