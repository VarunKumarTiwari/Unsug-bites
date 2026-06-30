import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Button, Logo, BRAND, color, space, radius } from '@unsung/ui';

export default function Splash() {
  const router = useRouter();
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: space.xl }}>
        <View style={{ alignItems: 'center', marginTop: space.xl }}>
          <Text variant="display" tone="primary">
            {BRAND.name}
          </Text>
          <Text variant="body" tone="muted" style={{ marginTop: space.xs }}>
            {BRAND.tagline}
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
          <Logo size={120} />
        </View>

        <Button label="Enable Location" onPress={() => router.replace({ pathname: '/(tabs)' })} />
      </View>
    </Screen>
  );
}
