import React from 'react';
import { View, AccessibilityInfo } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, cancelAnimation, Easing } from 'react-native-reanimated';
import { color } from '../tokens/color';
import { space } from '../tokens/space';
import { text } from '../tokens/typography';
import { duration } from '../tokens/motion';
import { Logo, BRAND } from './Logo';

interface Props {
  tagline?: boolean;
}

// Full-screen boot/loading state. Mark pulses (opacity + scale) unless the user
// has reduce-motion on, in which case it sits static. Mirrored in apps/web.
export function LoadingScreen({ tagline = true }: Props) {
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!active || reduce) return;
      pulse.value = withRepeat(
        withTiming(0.5, { duration: duration.ambient, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    });
    return () => {
      active = false;
      cancelAnimation(pulse);
    };
  }, [pulse]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.94 + pulse.value * 0.06 }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: color.primary.base, alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
      <Animated.View style={markStyle}>
        <Logo size={88} color={color.surface} />
      </Animated.View>
      <Animated.Text style={{ ...text.display, color: color.surface, marginTop: space.lg }}>
        {BRAND.name}
      </Animated.Text>
      {tagline && (
        <Animated.Text style={{ ...text.body, color: color.surface, opacity: 0.85, marginTop: space.xs, textAlign: 'center' }}>
          {BRAND.tagline}
        </Animated.Text>
      )}
    </View>
  );
}
