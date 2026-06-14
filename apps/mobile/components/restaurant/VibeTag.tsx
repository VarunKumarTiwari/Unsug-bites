import React from 'react';
import { View } from 'react-native';
import { Coffee, Wine, BookOpen, Moon, Sun, Heart, Compass } from 'lucide-react-native';
import { color, radius } from '@/theme/tokens';
import { Text } from '@/components/primitives/Text';

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
        borderColor: color.stone,
        borderWidth: 1,
        borderRadius: radius.pill,
        paddingVertical: padV,
        paddingHorizontal: padH,
      }}
    >
      <Icon size={size === 'sm' ? 12 : 14} color={color.ink} />
      <Text variant="small" weight="medium" style={{ marginLeft: 6 }}>
        {label}
      </Text>
    </View>
  );
}
