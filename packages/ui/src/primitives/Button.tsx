import React from 'react';
import { Pressable, PressableProps, View, ActivityIndicator } from 'react-native';
import { color } from '../tokens/color';
import { radius } from '../tokens/radius';
import { space } from '../tokens/space';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  leading?: React.ReactNode;
}

export function Button({
  label,
  variant = 'primary',
  loading,
  fullWidth = true,
  leading,
  disabled,
  style,
  ...rest
}: Props) {
  const bg =
    variant === 'primary' ? color.primary.base : variant === 'secondary' ? color.surface : 'transparent';
  const border = variant === 'secondary' ? color.border : 'transparent';
  const tone = variant === 'primary' ? 'surface' : 'base';

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: radius.pill,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: border,
          paddingVertical: 14,
          paddingHorizontal: space.lg,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        typeof style === 'function' ? undefined : style,
      ]}
      {...rest}
    >
      {leading ? <View style={{ marginRight: space.sm }}>{leading}</View> : null}
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? color.surface : color.text.base} />
      ) : (
        <Text variant="bodyStrong" tone={tone}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
