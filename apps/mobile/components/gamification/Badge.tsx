import React from 'react';
import { View } from 'react-native';
import { Award, Compass, BookOpen, Sun, Leaf, Shield, Soup } from 'lucide-react-native';
import type { Badge as BadgeType } from '@unsung/contracts';
import { color, radius } from '@/theme/tokens';
import { Text } from '@/components/primitives/Text';

const ICONS = {
  shield: Shield,
  medal: Award,
  bowl: Soup,
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
          backgroundColor: unlocked ? color.surface : color.stone,
          borderWidth: 1,
          borderColor: unlocked ? color.accentSoft : color.stone,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: unlocked ? 1 : 0.55,
        }}
      >
        <Icon size={36} color={unlocked ? color.accent : color.inkSubtle} />
      </View>
      <Text
        variant="label"
        weight="medium"
        tone={unlocked ? 'ink' : 'subtle'}
        style={{ marginTop: 8, textAlign: 'center' }}
        numberOfLines={2}
      >
        {badge.title}
      </Text>
    </View>
  );
}
