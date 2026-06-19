import React from 'react';
import { View, ViewProps } from 'react-native';
import { color } from '../tokens/color';
import { radius } from '../tokens/radius';
import { space } from '../tokens/space';
import { shadow } from '../tokens/shadow';

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
          padding: padded ? space.md : 0,
          borderWidth: variant === 'flat' ? 1 : 0,
          borderColor: color.border,
        },
        variant === 'lifted' && shadow.card,
        style,
      ]}
      {...rest}
    />
  );
}
