import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Award } from 'lucide-react-native';
import { Text, Button, color, radius } from '@unsung/ui';

export default function Achievement() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Hard-coded copy for now; later look up by id from gamification.getState().
  const title =
    id === 'b_carbonara'
      ? 'The Carbonara Connoisseur'
      : 'Explorer';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0F0E0E',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
      }}
    >
      {/* Confetti would render here via Skia / Lottie. */}
      <View
        style={{
          width: 180,
          height: 180,
          borderRadius: 999,
          backgroundColor: color.success.base,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 6,
          borderColor: 'rgba(255,255,255,0.15)',
        }}
      >
        <Award size={92} color="#E8C770" />
      </View>

      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          paddingHorizontal: 18,
          paddingVertical: 6,
          borderRadius: radius.pill,
          marginTop: -20,
          borderWidth: 1,
          borderColor: 'rgba(232,199,112,0.4)',
        }}
      >
        <Text variant="labelStrong" tone="surface">
          Explorer
        </Text>
      </View>

      <Text
        variant="display"
        tone="surface"
        style={{ marginTop: 36, textAlign: 'center', letterSpacing: 1 }}
      >
        BADGE UNLOCKED!
      </Text>
      <Text
        variant="h3Serif"
        tone="surface"
        style={{ marginTop: 10, textAlign: 'center', opacity: 0.85 }}
      >
        {title}
      </Text>

      <Button
        label="View My History"
        onPress={() => router.replace('/(tabs)/history')}
        style={{ marginTop: 56 }}
      />
    </View>
  );
}
