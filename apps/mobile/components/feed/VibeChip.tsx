import React from 'react';
import { Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text, color, radius } from '@unsung/ui';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { spring } from '@unsung/ui';

function hapticImpact() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

interface Props {
  vibe: string;
  isActive: boolean;
  onPress: () => void;
}

export function VibeChip({ vibe, isActive, onPress }: Props) {
  const scale = useSharedValue(1);
  const reduceMotion = useReduceMotion();

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        if (reduceMotion) return;
        scale.value = withTiming(0.91, { duration: 80 });
      }}
      onPressOut={() => {
        if (reduceMotion) return;
        scale.value = withSpring(1, spring.bouncy);
        hapticImpact();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${vibe} vibe filter${isActive ? ', selected' : ''}`}
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View style={animStyle}>
        <MotiView
          animate={{
            backgroundColor: isActive ? color.primary.base : color.bg,
            borderColor: isActive ? color.primary.base : color.border,
          }}
          transition={{ type: 'timing', duration: 160 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderRadius: radius.pill,
            paddingVertical: 10,
            paddingHorizontal: 15,
          }}
        >
          {isActive && (
            <Animated.View entering={FadeIn.duration(120)} exiting={FadeOut.duration(80)} style={{ marginRight: 5 }}>
              <Sparkles size={10} color={color.surface} strokeWidth={2} />
            </Animated.View>
          )}
          <Text variant="smallMedium" tone={isActive ? 'surface' : 'base'}>{vibe}</Text>
        </MotiView>
      </Animated.View>
    </Pressable>
  );
}
