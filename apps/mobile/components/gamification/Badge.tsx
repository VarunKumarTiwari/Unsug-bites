import React from 'react';
import { View } from 'react-native';
import { Award, Compass, BookOpen, Sun, Leaf, Shield, Soup, Flame } from 'lucide-react-native';
import type { Badge as BadgeType } from '@unsung/contracts';
import { color, radius, space, Text } from '@unsung/ui';

const ICONS = {
  shield: Shield,
  medal: Award,
  bowl: Soup,
  flame: Flame,
  compass: Compass,
  sun: Sun,
  leaf: Leaf,
  book: BookOpen,
} as const;

export function Badge({ badge }: { badge: BadgeType }) {
  const Icon = (ICONS as any)[badge.iconKey] ?? Award;
  const unlocked = badge.unlocked;

  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View
        style={{
          width: 78,
          height: 78,
          borderRadius: radius.lg,
          backgroundColor: unlocked ? color.surface : color.surfaceMuted,
          borderWidth: 1,
          borderColor: unlocked ? color.primary.soft : color.border,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: unlocked ? 1 : 0.55,
        }}
      >
        <Icon size={36} color={unlocked ? color.primary.base : color.text.subtle} />
      </View>
      <Text
        variant="label"
        tone={unlocked ? 'base' : 'subtle'}
        style={{ marginTop: space.sm, textAlign: 'center' }}
        numberOfLines={2}
      >
        {badge.title}
      </Text>
      {badge.description ? (
        <Text
          variant="small"
          tone="muted"
          style={{ marginTop: 2, textAlign: 'center' }}
          numberOfLines={2}
        >
          {badge.description}
        </Text>
      ) : null}
    </View>
  );
}
