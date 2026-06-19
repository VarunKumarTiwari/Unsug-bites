import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Navigation } from 'lucide-react-native';
import { Text, Button, color, radius, shadow, space } from '@unsung/ui';
import { VibeTag } from '@/components/restaurant/VibeTag';
import { HiddenGemBadge } from '@/components/restaurant/HiddenGemBadge';
import { discovery } from '@/lib/api';

type Tab = 'legends' | 'unsung';

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<Tab>('legends');

  const { data: r, isLoading } = useQuery({
    queryKey: ['discovery', 'restaurant', id],
    queryFn: () => discovery.getRestaurant(id!),
    enabled: !!id,
  });

  if (isLoading || !r) {
    return (
      <View style={{ flex: 1, backgroundColor: color.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={color.primary.base} />
      </View>
    );
  }

  const dishes = tab === 'legends' ? r.bestSellers : r.unsungBites;

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Immersive bleed header */}
        <View>
          <Image
            source={{ uri: r.heroImage }}
            style={{ width, height: 320 }}
            contentFit="cover"
          />
          <Pressable
            onPress={() => router.back()}
            style={{
              position: 'absolute',
              top: 56,
              left: 16,
              width: 40,
              height: 40,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.92)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={20} color={color.text.base} />
          </Pressable>
        </View>

        {/* Editorial content card */}
        <View
          style={{
            marginTop: -32,
            backgroundColor: color.surface,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 32,
            ...shadow.card,
          }}
        >
          <HiddenGemBadge score={r.hiddenGemScore} />
          <Text variant="h1" style={{ marginTop: space.sm }}>
            {r.name}
          </Text>
          <Text variant="small" tone="muted" style={{ marginTop: 4 }}>
            {r.cuisine} · {r.neighborhood}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            {r.vibes.map((v) => (
              <VibeTag key={v} label={v} />
            ))}
          </View>

          <Button
            label="Directions"
            leading={<Navigation size={16} color={color.surface} />}
            style={{ marginTop: 20 }}
          />

          {/* Split-screen menu */}
          <View
            style={{
              flexDirection: 'row',
              marginTop: 28,
              borderBottomWidth: 1,
              borderBottomColor: color.border,
            }}
          >
            <TabButton label="The Legends" active={tab === 'legends'} onPress={() => setTab('legends')} />
            <TabButton label="The Unsung Bites" active={tab === 'unsung'} onPress={() => setTab('unsung')} />
          </View>

          <View style={{ marginTop: 16, gap: 16 }}>
            {dishes.length === 0 ? (
              <Text variant="small" tone="muted">
                Nothing here yet — be the first to log a dish.
              </Text>
            ) : (
              dishes.map((d) => (
                <View
                  key={d.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <Image
                    source={{ uri: d.image }}
                    style={{ width: 84, height: 84, borderRadius: radius.md }}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodySerif">
                      {d.name}
                    </Text>
                    {d.description ? (
                      <Text variant="small" tone="muted" style={{ marginTop: 2 }} numberOfLines={2}>
                        {d.description}
                      </Text>
                    ) : null}
                    {d.priceCents ? (
                      <Text variant="smallStrong" tone="primary" style={{ marginTop: 4 }}>
                        ${(d.priceCents / 100).toFixed(2)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: active ? color.primary.base : 'transparent',
        alignItems: 'center',
      }}
    >
      <Text variant="bodySerif" tone={active ? 'primary' : 'muted'} style={{ fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}
