import React from 'react';
import { View } from 'react-native';
import { MapPinOff } from 'lucide-react-native';
import { Text, color, radius, space } from '@unsung/ui';

// Shown when EXPO_PUBLIC_MAPTILER_KEY is unset. The map can't render without a
// tile key, so we fail soft instead of crashing.
export function MapPlaceholder() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color.surfaceMuted,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: space.lg,
      }}
    >
      <MapPinOff size={24} color={color.text.subtle} strokeWidth={2} />
      <Text variant="smallStrong" tone="muted" style={{ marginTop: space.sm, textAlign: 'center' }}>
        Map unavailable
      </Text>
      <Text variant="small" tone="subtle" style={{ marginTop: space.xs, textAlign: 'center', maxWidth: 220 }}>
        Set EXPO_PUBLIC_MAPTILER_KEY to show the map.
      </Text>
    </View>
  );
}
