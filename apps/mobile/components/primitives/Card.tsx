import React from 'react';
import { View, ViewProps } from 'react-native';
import { color, radius, shadow } from '@/theme/tokens';

interface Props extends ViewProps {
  variant?: 'flat' | 'lifted';
  padded?: boolean;
}

export function Card({ variant = 'lifted', padded = true, style, ...rest }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: color.surface,
          borderRadius: radius.lg,
          padding: padded ? 16 : 0,
          borderWidth: variant === 'flat' ? 1 : 0,
          borderColor: color.stone,
        },
        variant === 'lifted' && shadow.card,
        style,
      ]}
      {...rest}
    />
  );
}
