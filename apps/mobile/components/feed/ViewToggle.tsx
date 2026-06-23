import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { List, MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text, color, radius, spring, duration, easing } from '@unsung/ui';
import { useReduceMotion } from '@/hooks/useReduceMotion';

function hapticImpact() {
  if (typeof window === 'undefined') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export type FeedView = 'list' | 'map';

interface Props {
  feedView: FeedView;
  onToggle: (view: FeedView) => void;
}

const BTN_W = 80;
const BTN_H = 44;

export function ViewToggle({ feedView, onToggle }: Props) {
  const pillX = useSharedValue(feedView === 'list' ? 0 : BTN_W);
  const listIconScale = useSharedValue(1);
  const mapIconScale = useSharedValue(1);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  const listIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: listIconScale.value }] }));
  const mapIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: mapIconScale.value }] }));

  React.useEffect(() => {
    pillX.value = withSpring(feedView === 'list' ? 0 : BTN_W, spring.snappy);
  }, [feedView, pillX]);

  const handlePress = (view: FeedView) => {
    if (view === feedView) return;
    pillX.value = withSpring(view === 'list' ? 0 : BTN_W, spring.snappy);
    const targetScale = view === 'list' ? listIconScale : mapIconScale;
    targetScale.value = withSequence(
      withTiming(0.6, { duration: duration.micro, easing: easing.in }),
      withSpring(1, spring.bouncy),
    );
    hapticImpact();
    onToggle(view);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pill, pillStyle]} />
      <ToggleBtn
        active={feedView === 'list'}
        onPress={() => handlePress('list')}
        iconAnimStyle={listIconStyle}
        icon={<List size={13} color={feedView === 'list' ? color.surface : color.text.muted} strokeWidth={2} />}
        label="List"
      />
      <ToggleBtn
        active={feedView === 'map'}
        onPress={() => handlePress('map')}
        iconAnimStyle={mapIconStyle}
        icon={<MapPin size={13} color={feedView === 'map' ? color.surface : color.text.muted} strokeWidth={2} />}
        label="Map"
      />
    </View>
  );
}

function ToggleBtn({
  active,
  onPress,
  icon,
  label,
  iconAnimStyle,
}: {
  active: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
  iconAnimStyle: any;
}) {
  const scale = useSharedValue(1);
  const reduceMotion = useReduceMotion();

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        if (reduceMotion) return;
        scale.value = withTiming(0.93, { duration: 80 });
      }}
      onPressOut={() => {
        if (reduceMotion) return;
        scale.value = withSpring(1, spring.bouncy);
      }}
      accessibilityRole="button"
      accessibilityLabel={`${label} view${active ? ', selected' : ''}`}
      accessibilityState={{ selected: active }}
      style={{ width: BTN_W, height: BTN_H }}
    >
      <Animated.View style={[pressStyle, { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill }]}>
        <Animated.View style={iconAnimStyle}>{icon}</Animated.View>
        <Text variant="smallStrong" tone={active ? 'surface' : 'muted'} style={{ marginLeft: 6 }}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.pill,
    padding: 3,
    alignSelf: 'flex-start',
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: BTN_W,
    height: BTN_H,
    borderRadius: radius.pill,
    backgroundColor: color.text.base,
  },
});
