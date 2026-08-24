import React from 'react';
import { View, Pressable, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Clock, Camera, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, color, radius, space, shadow } from '@unsung/ui';
import * as Haptics from 'expo-haptics';
import { useNavChrome } from '@/lib/navChrome';

// Floating "pill" bottom nav that mirrors the landing-page nav (img_2 / img_4):
// cream rounded pill, active tab = filled red chip with icon + label, inactive =
// muted icon + label. Shrinks to icons-only as the user reads down a screen and
// grows back at the top / on scroll-up. Active tab keeps its labeled red chip in
// both states (spec R3, R5).

const ICONS = { index: Home, history: Clock, scan: Camera, profile: User } as const;
const LABELS = { index: 'Home', history: 'History', scan: 'Scan', profile: 'Profile' } as const;

const EXPANDED_H = 62;
const SHRUNK_H = 50;
const ICON = 22;
const DESKTOP_MAX_W = 480; // centered cap on wide viewports (spec R8)
const WIDE_BREAKPOINT = 600;

function haptic() {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const nav = useNavChrome();
  const expanded = nav?.expanded;

  const isWide = width >= WIDE_BREAKPOINT;
  const bottomGap = Math.max(insets.bottom, 12);

  // Pill height eases between expanded/shrunk.
  const pillStyle = useAnimatedStyle(() => {
    const e = expanded ? expanded.value : 1;
    return { height: interpolate(e, [0, 1], [SHRUNK_H, EXPANDED_H], Extrapolation.CLAMP) };
  });

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { paddingBottom: bottomGap },
        isWide && styles.wrapWide,
      ]}
    >
      <Animated.View
        style={[
          styles.pill,
          isWide ? { maxWidth: DESKTOP_MAX_W, alignSelf: 'center' } : styles.pillPhone,
          pillStyle,
        ]}
      >
        {state.routes
          .filter((r) => r.name in ICONS)
          .map((route) => {
            const routeIndex = state.routes.findIndex((r) => r.key === route.key);
            const focused = state.index === routeIndex;
            const Icon = ICONS[route.name as keyof typeof ICONS];
            const label = LABELS[route.name as keyof typeof LABELS];

            const onPress = () => {
              haptic();
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabItem
                key={route.key}
                focused={focused}
                Icon={Icon}
                label={label}
                expanded={expanded}
                onPress={onPress}
              />
            );
          })}
      </Animated.View>
    </View>
  );
}

function TabItem({
  focused,
  Icon,
  label,
  expanded,
  onPress,
}: {
  focused: boolean;
  Icon: typeof Home;
  label: string;
  expanded: SharedValue<number> | undefined;
  onPress: () => void;
}) {
  // Inactive tabs fade their label out as the pill shrinks; the active chip's
  // label always stays (interpolated to 1 when focused).
  const labelStyle = useAnimatedStyle(() => {
    if (focused) return { opacity: 1, maxWidth: 120 };
    const e = expanded ? expanded.value : 1;
    return {
      opacity: interpolate(e, [0, 1], [0, 1], Extrapolation.CLAMP),
      // collapse the label's footprint when hidden so inactive tabs are icon-only
      maxWidth: interpolate(e, [0, 1], [0, 80], Extrapolation.CLAMP),
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      style={[styles.item, focused && styles.itemActive]}
      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
    >
      <Icon
        size={ICON}
        color={focused ? color.surface : color.text.subtle}
        strokeWidth={focused ? 2.4 : 1.9}
      />
      <Animated.View style={[styles.labelWrap, labelStyle]}>
        <Text
          variant="label"
          numberOfLines={1}
          style={[styles.label, { color: focused ? color.surface : color.text.subtle }]}
        >
          {label}
        </Text>
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
  },
  wrapWide: { paddingHorizontal: space.lg },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: color.bg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.border,
    paddingHorizontal: space.xs + 2,
    ...shadow.card,
  },
  pillPhone: { width: '100%' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    flexShrink: 1,
  },
  itemActive: {
    backgroundColor: color.primary.base,
    paddingHorizontal: space.md,
  },
  labelWrap: { overflow: 'hidden' },
  label: { letterSpacing: 0.3 },
});
