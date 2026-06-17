import React from 'react';
import { View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { color, radius } from '@/theme/tokens';
import { Text } from '@/components/primitives/Text';

interface Props {
  score: number; // 0..1
}

export function HiddenGemBadge({ score }: Props) {
  if (score < 0.7) return null;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: radius.pill,
        paddingVertical: 5,
        paddingHorizontal: 10,
        alignSelf: 'flex-start',
      }}
    >
      <Sparkles size={11} color={color.accent} />
      <Text variant="label" tone="accent" weight="semibold" style={{ marginLeft: 4 }}>
        Hidden Gem
      </Text>
    </View>
  );
}
