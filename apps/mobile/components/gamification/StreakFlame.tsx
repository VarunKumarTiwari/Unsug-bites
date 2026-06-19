import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { color, radius, space, Text } from '@unsung/ui';

// Minimalist geometric flame. Intensity 0..1 modulates the inner glow color stop.
export function StreakFlame({ days }: { days: number }) {
  const intensity = Math.min(1, days / 30);
  const inner = `rgba(232, 199, 112, ${0.4 + intensity * 0.6})`;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color.surface,
        borderRadius: radius.pill,
        paddingVertical: 10,
        paddingHorizontal: space.md,
        borderWidth: 1,
        borderColor: color.primary.soft,
        alignSelf: 'flex-start',
      }}
    >
      <Svg width={20} height={24} viewBox="0 0 20 24">
        <Path
          d="M10 0 C 13 6, 18 7, 18 14 C 18 19, 14 23, 10 23 C 6 23, 2 19, 2 14 C 2 9, 6 8, 6 4 C 8 6, 9 4, 10 0 Z"
          fill={color.primary.base}
        />
        <Path
          d="M10 6 C 12 10, 14 11, 14 15 C 14 18, 12 20, 10 20 C 8 20, 6 18, 6 15 C 6 12, 9 11, 10 6 Z"
          fill={inner}
        />
      </Svg>
      <Text variant="bodyStrong" style={{ marginLeft: 10 }}>
        {days} Day Streak
      </Text>
    </View>
  );
}
