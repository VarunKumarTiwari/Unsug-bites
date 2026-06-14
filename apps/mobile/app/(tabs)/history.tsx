import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Flame, Beef } from 'lucide-react-native';
import { Screen } from '@/components/primitives/Screen';
import { Text } from '@/components/primitives/Text';
import { color, radius, shadow } from '@/theme/tokens';
import { reviews, gamification } from '@/lib/api';

const SAMPLE_PHOTO = 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600';

export default function History() {
  const { data: reviewList, isLoading } = useQuery({
    queryKey: ['reviews', 'u_alex'],
    queryFn: () => reviews.listForUser('u_alex'),
  });
  const { data: stats } = useQuery({
    queryKey: ['gamification', 'u_alex'],
    queryFn: () => gamification.getState('u_alex'),
  });

  return (
    <Screen>
      <Text variant="display" serif tone="accent">
        Food History
      </Text>
      <Text variant="small" tone="muted" style={{ marginBottom: 16 }}>
        {stats ? `Dishes logged: ${stats.totalDishesLogged} · Streak: ${stats.streakDays} days` : ' '}
      </Text>

      {isLoading ? (
        <ActivityIndicator color={color.accent} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            {/* Vertical timeline axis */}
            <View
              style={{
                width: 1,
                backgroundColor: color.stone,
                marginLeft: 24,
                marginRight: 24,
              }}
            />

            <View style={{ flex: 1, gap: 20 }}>
              {(reviewList ?? []).map((rev) => (
                <View key={rev.id}>
                  <Text variant="label" tone="muted" style={{ marginBottom: 8 }}>
                    {new Date(rev.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>

                  <View
                    style={{
                      backgroundColor: color.surface,
                      padding: 12,
                      borderRadius: radius.md,
                      transform: [{ rotate: '-1.2deg' }],
                      ...shadow.card,
                    }}
                  >
                    <Image
                      source={{ uri: SAMPLE_PHOTO }}
                      style={{ width: '100%', aspectRatio: 1, borderRadius: 6 }}
                      contentFit="cover"
                    />
                    <View style={{ marginTop: 10 }}>
                      <Text variant="body" weight="semibold" serif>
                        {rev.dishName}
                      </Text>
                      {rev.note ? (
                        <Text variant="small" tone="muted" style={{ marginTop: 4 }}>
                          “{rev.note}”
                        </Text>
                      ) : null}
                      <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                        <Glance icon={<Flame size={12} color={color.olive} />} label="Calories" />
                        <Glance icon={<Beef size={12} color={color.olive} />} label="Protein" />
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

function Glance({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color.oliveSoft,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
      }}
    >
      {icon}
      <Text variant="label" tone="olive" weight="semibold" style={{ marginLeft: 4 }}>
        {label}
      </Text>
    </View>
  );
}
