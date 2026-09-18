import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Button, Logo, BRAND, space } from '@unsung/ui';

export default function Splash() {
  const router = useRouter();
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: space.xl }}>
        {/* Brand lockup — crisp gem + live text (sharp at any size). Gem left,
            wordmark + tagline right. */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs, marginTop: space.xl }}>
          <Logo size={64} />
          <View>
            <Text variant="display" tone="primary">
              {BRAND.name}
            </Text>
            <Text variant="body" tone="base">
              {BRAND.tagline}
            </Text>
          </View>
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
            Find hidden gems and delicious details, the cafes and restaurants locals love but
            most people miss.
          </Text>
        </View>

        <Button label="Enable Location" onPress={() => router.replace({ pathname: '/(tabs)' })} />
      </View>
    </Screen>
  );
}
