import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import type { RestaurantSummary } from '@unsung/contracts';
import { color, radius, shadow } from '@/theme/tokens';
import { Text } from '@/components/primitives/Text';

// Placeholder map — geometry-free monochrome canvas with glowing pins.
// Real Mapbox/Google integration replaces this component later; the API stays the same.
interface Props {
  restaurants: RestaurantSummary[];
}

export function FauxMap({ restaurants }: Props) {
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color.bg,
        borderRadius: radius.lg,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Subtle grid lines to suggest a map without committing to a provider. */}
      {[...Array(6)].map((_, i) => (
        <View
          key={`h-${i}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${(i + 1) * 14}%`,
            height: 1,
            backgroundColor: color.stone,
          }}
        />
      ))}
      {[...Array(6)].map((_, i) => (
        <View
          key={`v-${i}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${(i + 1) * 14}%`,
            width: 1,
            backgroundColor: color.stone,
          }}
        />
      ))}

      {restaurants.map((r, i) => {
        // Distribute pins pseudo-randomly across the canvas for visual interest.
        const top = 15 + ((i * 23) % 70);
        const left = 12 + ((i * 37) % 76);
        const isGem = r.hiddenGemScore >= 0.85;
        return (
          <Pressable
            key={r.id}
            onPress={() => router.push(`/restaurant/${r.id}`)}
            style={{
              position: 'absolute',
              top: `${top}%`,
              left: `${left}%`,
            }}
          >
            <View
              style={[
                {
                  width: isGem ? 18 : 26,
                  height: isGem ? 18 : 26,
                  borderRadius: 999,
                  borderWidth: 2,
                  borderColor: color.accent,
                  backgroundColor: color.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                shadow.pin,
              ]}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: color.accent,
                }}
              />
            </View>
          </Pressable>
        );
      })}

      <View
        style={{
          position: 'absolute',
          bottom: 12,
          alignSelf: 'center',
          backgroundColor: color.surface,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: color.stone,
        }}
      >
        <Text variant="label" tone="muted">
          map placeholder · tap a pin
        </Text>
      </View>
    </View>
  );
}
