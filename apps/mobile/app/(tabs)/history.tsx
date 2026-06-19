import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Flame, Beef } from 'lucide-react-native';
import { Screen, Text, color, radius, shadow, space } from '@unsung/ui';
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
      <Text variant="display" tone="primary">
        Food History
      </Text>
      <Text variant="small" tone="muted" style={{ marginBottom: space.md }}>
        {stats ? `Dishes logged: ${stats.totalDishesLogged} · Streak: ${stats.streakDays} days` : ' '}
      </Text>

      {isLoading ? (
        <ActivityIndicator color={color.primary.base} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: space.xl + space.sm }}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            {/* Vertical timeline axis */}
            <View
              style={{
                width: 1,
                backgroundColor: color.border,
                marginLeft: space.lg,
                marginRight: space.lg,
              }}
            />

            <View style={{ flex: 1, gap: space.lg - 4 }}>
              {(reviewList ?? []).map((rev) => (
                <View key={rev.id}>
                  <Text variant="label" tone="muted" style={{ marginBottom: space.sm }}>
                    {new Date(rev.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>

                  <View
                    style={{
                      backgroundColor: color.surface,
                      padding: space.sm + 4,
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
                      <Text variant="bodySerif">
                        {rev.dishName}
                      </Text>
                      {rev.note ? (
                        <Text variant="small" tone="muted" style={{ marginTop: 4 }}>
                          “{rev.note}”
                        </Text>
                      ) : null}
                      <View style={{ flexDirection: 'row', gap: space.sm + 4, marginTop: 10 }}>
                        <Glance icon={<Flame size={12} color={color.success.base} />} label="Calories" />
                        <Glance icon={<Beef size={12} color={color.success.base} />} label="Protein" />
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
        backgroundColor: color.success.soft,
        paddingHorizontal: space.sm,
        paddingVertical: 4,
        borderRadius: radius.pill,
      }}
    >
      {icon}
      <Text variant="labelStrong" tone="success" style={{ marginLeft: 4 }}>
        {label}
      </Text>
    </View>
  );
}
