import React from 'react';
import { View, Pressable, Platform, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Text, color, space } from '@unsung/ui';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ponytail: no color.warning token yet — promote to design system when adding one
const STAR_COLOR = '#D4A017';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  label?: string;
  size?: number;
}

export function StarRating({ value, onChange, label, size = 28 }: StarRatingProps) {
  function handlePress(star: number) {
    // Haptic on first tap and boundary (5 stars)
    if (value === 0 || star === 5) {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onChange(star);
  }

  return (
    <View style={styles.container} accessibilityRole="adjustable" accessibilityLabel={`${label ?? 'Rating'}, ${value} of 5`}>
      {label && <Text variant="body" style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((star) => (
          <StarButton
            key={star}
            star={star}
            filled={star <= value}
            onPress={() => handlePress(star)}
            size={size}
          />
        ))}
      </View>
    </View>
  );
}

function StarButton({ star, filled, onPress, size }: { star: number; filled: boolean; onPress: () => void; size: number }) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(filled ? 1.1 : 1, { damping: 12 }) }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={`${star} of 5 stars`}
      accessibilityState={{ selected: filled }}
      style={[styles.starBtn, animStyle]}
    >
      <Star
        size={size}
        color={filled ? STAR_COLOR : color.text.subtle}
        fill={filled ? STAR_COLOR : 'transparent'}
        strokeWidth={1.5}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: space.xs },
  label: { color: color.text.muted },
  row: { flexDirection: 'row', gap: space.xs },
  starBtn: { padding: 8, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
