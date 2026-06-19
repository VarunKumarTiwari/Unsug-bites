import React from 'react';
import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import type { RestaurantSummary } from '@unsung/contracts';
import { color, radius, shadow, space, Text } from '@unsung/ui';
import { HiddenGemBadge } from './HiddenGemBadge';

// expo-image isn't animatable by default — wrap it so Reanimated can drive transform
const AnimatedExpoImage = Animated.createAnimatedComponent(Image);

// Extra image height beyond the clipped container; gives parallax room to travel
const ROW_IMG_HEIGHT = 200;
const PARALLAX_EXTRA = 40;

interface Props {
  restaurant: RestaurantSummary;
  layout?: 'grid' | 'row';
  parallaxOffset?: SharedValue<number>;
}

export function RestaurantCard({ restaurant, layout = 'grid', parallaxOffset }: Props) {
  const router = useRouter();
  const r = restaurant;
  const isParallax = layout === 'row' && !!parallaxOffset;

  // Always called — returns identity transform when parallaxOffset is absent
  const imageAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: parallaxOffset?.value ?? 0 }],
  }));

  return (
    <Pressable
      onPress={() => router.push(`/restaurant/${r.id}`)}
      style={({ pressed }) => [
        {
          backgroundColor: color.surface,
          borderRadius: radius.lg,
          overflow: 'hidden',
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        shadow.card,
      ]}
    >
      {/* Image container — fixed height + overflow hidden when parallax is active */}
      <View
        style={{
          position: 'relative',
          ...(isParallax && { height: ROW_IMG_HEIGHT, overflow: 'hidden' }),
        }}
      >
        <AnimatedExpoImage
          source={{ uri: r.heroImage }}
          style={[
            isParallax
              ? {
                  width: '100%',
                  // Oversized so there's bleed above and below the clip window
                  height: ROW_IMG_HEIGHT + PARALLAX_EXTRA,
                  // Pull up half the extra so at rest the image is centered
                  marginTop: -(PARALLAX_EXTRA / 2),
                }
              : {
                  width: '100%',
                  aspectRatio: layout === 'grid' ? 4 / 3 : 16 / 9,
                },
            imageAnimStyle,
          ]}
          contentFit="cover"
          transition={200}
        />
        <View style={{ position: 'absolute', top: 10, left: 10 }}>
          <HiddenGemBadge score={r.hiddenGemScore} />
        </View>
      </View>

      <View style={{ padding: space.sm + 4 }}>
        <Text variant="h3Serif" numberOfLines={1}>
          {r.name}
        </Text>
        <Text variant="small" tone="muted" style={{ marginTop: 2 }} numberOfLines={1}>
          {r.cuisine} · {r.neighborhood}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: space.sm }}>
          <Text variant="smallStrong">
            ★ {r.rating.toFixed(1)}
          </Text>
          <Text variant="small" tone="subtle" style={{ marginLeft: space.xs + 2 }}>
            ({r.reviewCount})
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
