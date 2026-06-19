import React from 'react';
import { View } from 'react-native';
import { Coffee, Wine, BookOpen, Moon, Sun, Heart, Compass } from 'lucide-react-native';
import { color, radius, space, Text } from '@unsung/ui';

const ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  Cozy: Coffee,
  'Date Night': Wine,
  'Solo Dining': BookOpen,
  'Late Night': Moon,
  Morning: Sun,
  'Local Favorite': Heart,
  'Hidden Gem': Compass,
  Casual: Coffee,
};

interface Props {
  label: string;
  size?: 'sm' | 'md';
}

export function VibeTag({ label, size = 'md' }: Props) {
  const Icon = ICONS[label] ?? Compass;
  const padV = size === 'sm' ? 6 : 8;
  const padH = size === 'sm' ? 10 : 14;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: color.surface,
        borderColor: color.border,
        borderWidth: 1,
        borderRadius: radius.pill,
        paddingVertical: padV,
        paddingHorizontal: padH,
      }}
    >
      <Icon size={size === 'sm' ? 12 : 14} color={color.text.base} />
      <Text variant="smallMedium" style={{ marginLeft: space.xs + 2 }}>
        {label}
      </Text>
    </View>
  );
}
