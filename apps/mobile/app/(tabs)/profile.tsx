import React from 'react';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { Screen, Text, Button, color, radius, shadow, space } from '@unsung/ui';
import { Badge } from '@/components/gamification/Badge';
import { StreakFlame } from '@/components/gamification/StreakFlame';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { users, gamification, discovery } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth';

export default function Profile() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const toggle = useAuthStore((s) => s.toggle);

  const { data: me } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: users.getMe,
    enabled: isLoggedIn,
  });
  const { data: stats, isLoading } = useQuery({
    queryKey: ['gamification', 'u_alex'],
    queryFn: () => gamification.getState('u_alex'),
  });
  const { data: nearby } = useQuery({
    queryKey: ['discovery', 'nearby'],
    queryFn: () => discovery.getNearby(40.68, -74.0),
  });

  if (isLoading || !stats) {
    return (
      <Screen>
        <ActivityIndicator color={color.primary.base} />
      </Screen>
    );
  }

  const rows: typeof stats.badges[] = [];
  for (let i = 0; i < stats.badges.length; i += 3) rows.push(stats.badges.slice(i, i + 3));

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Profile hero — only when logged in */}
        {isLoggedIn && me && (
          <View
            style={{
              backgroundColor: color.primary.base,
              paddingHorizontal: 20,
              paddingTop: space.lg,
              paddingBottom: 36,
              borderBottomLeftRadius: radius.xl,
              borderBottomRightRadius: radius.xl,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              {me.avatarUrl ? (
                <Image
                  source={{ uri: me.avatarUrl }}
                  style={{ width: 64, height: 64, borderRadius: 999, borderWidth: 2, borderColor: color.surface }}
                />
              ) : (
                <View style={{ width: 64, height: 64, borderRadius: 999, backgroundColor: color.surface }} />
              )}
              <View style={{ flex: 1 }}>
                <Text variant="h2" tone="surface">
                  {me.displayName}
                </Text>
                <Text variant="small" tone="surface" style={{ opacity: 0.85, marginTop: 2 }}>
                  {stats.rank} · {Math.round((stats.rankProgress ?? 0) * 100)}% to next
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 16,
                height: 6,
                backgroundColor: 'rgba(255,255,255,0.25)',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${(stats.rankProgress ?? 0) * 100}%`,
                  height: '100%',
                  backgroundColor: color.surface,
                }}
              />
            </View>
          </View>
        )}

        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text variant="label" tone="muted">
            Achievements
          </Text>
          <View
            style={{
              backgroundColor: color.surface,
              borderRadius: radius.lg,
              padding: space.md,
              marginTop: space.sm,
              gap: space.md,
              ...shadow.card,
            }}
          >
            {rows.map((row, idx) => (
              <View key={idx} style={{ flexDirection: 'row', gap: space.sm }}>
                {row.map((b) => (
                  <Badge key={b.id} badge={b} />
                ))}
                {row.length < 3 &&
                  Array(3 - row.length)
                    .fill(0)
                    .map((_, k) => <View key={k} style={{ flex: 1 }} />)}
              </View>
            ))}
          </View>

          <View style={{ marginTop: 20 }}>
            <StreakFlame days={stats.streakDays} />
          </View>

          <Text variant="label" tone="muted" style={{ marginTop: 24 }}>
            Favorite Restaurants
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            {(nearby ?? []).slice(0, 2).map((r) => (
              <View key={r.id} style={{ flex: 1 }}>
                <RestaurantCard restaurant={r} />
              </View>
            ))}
          </View>

          {/* Dev toggle — tap to switch logged-in state for testing */}
          <Pressable
            onPress={toggle}
            style={{
              marginTop: space.xl,
              alignSelf: 'center',
              backgroundColor: color.surfaceMuted,
              paddingVertical: space.sm,
              paddingHorizontal: space.md,
              borderRadius: radius.pill,
            }}
          >
            <Text variant="smallMedium" tone="muted">
              DEV: {isLoggedIn ? 'Log out' : 'Log in (mock)'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
