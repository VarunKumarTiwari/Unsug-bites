import React from 'react';
import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { RestaurantSummary } from '@unsung/contracts';
import { color, radius, shadow } from '@/theme/tokens';
import { Text } from '@/components/primitives/Text';
import { HiddenGemBadge } from './HiddenGemBadge';

interface Props {
  restaurant: RestaurantSummary;
  layout?: 'grid' | 'row';
}

export function RestaurantCard({ restaurant, layout = 'grid' }: Props) {
  const router = useRouter();
  const r = restaurant;

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
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: r.heroImage }}
          style={{ width: '100%', aspectRatio: layout === 'grid' ? 4 / 3 : 16 / 9 }}
          contentFit="cover"
          transition={200}
        />
        <View style={{ position: 'absolute', top: 10, left: 10 }}>
          <HiddenGemBadge score={r.hiddenGemScore} />
        </View>
      </View>
      <View style={{ padding: 12 }}>
        <Text variant="h3" serif numberOfLines={1}>
          {r.name}
        </Text>
        <Text variant="small" tone="muted" style={{ marginTop: 2 }} numberOfLines={1}>
          {r.cuisine} · {r.neighborhood}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Text variant="small" weight="semibold">
            ★ {r.rating.toFixed(1)}
          </Text>
          <Text variant="small" tone="subtle" style={{ marginLeft: 6 }}>
            ({r.reviewCount})
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
