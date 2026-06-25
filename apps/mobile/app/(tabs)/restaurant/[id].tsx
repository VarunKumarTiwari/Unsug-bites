import React, { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeInDown,
  withSpring,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { ChevronLeft, Navigation } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text, Button, color, radius, shadow, space, spring } from '@unsung/ui';
import { VibeTag } from '@/components/restaurant/VibeTag';
import { HiddenGemBadge } from '@/components/restaurant/HiddenGemBadge';
import { discovery } from '@/lib/api';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import type { Dish } from '@unsung/contracts';

type Tab = 'legends' | 'unsung';

// ── Layout constants ──
const HERO_H = 360;
const COLLAPSED_HEADER_H = 56;
const COLLAPSE_START = HERO_H * 0.55;
const COLLAPSE_END = HERO_H * 0.8;
const PARALLAX_RATE = 0.5;
const H_PAD = 20;
const SUBTITLE_GAP = 10;
const TAB_LABEL_WIDTH = 0.5; // each tab takes half

function hapticImpact(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(style);
  }
}

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const [tab, setTab] = useState<Tab>('legends');
  const scrollY = useSharedValue(0);
  const tabIndicator = useSharedValue(0);

  const { data: r, isLoading } = useQuery({
    queryKey: ['discovery', 'restaurant', id],
    queryFn: () => discovery.getRestaurant(id!),
    enabled: !!id,
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // Parallax + pull-down zoom on hero
  const heroStyle = useAnimatedStyle(() => {
    const pull = Math.min(0, scrollY.value);
    const scale = interpolate(pull, [-200, 0], [1.35, 1], Extrapolation.CLAMP);
    const translateY = scrollY.value > 0 ? -scrollY.value * PARALLAX_RATE : pull * 0.5;
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const heroOverlayTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_START * 0.7], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [0, COLLAPSE_START], [0, -20], Extrapolation.CLAMP) },
    ],
  }));

  const collapsedHeaderStyle = useAnimatedStyle(() => {
    const p = interpolate(scrollY.value, [COLLAPSE_START, COLLAPSE_END], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: p,
      transform: [{ translateY: interpolate(p, [0, 1], [-COLLAPSED_HEADER_H, 0]) }],
    };
  });

  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicator.value }],
  }));

  function switchTab(next: Tab, tabsWidth: number) {
    if (tab === next) return;
    hapticImpact();
    setTab(next);
    const target = next === 'legends' ? 0 : tabsWidth * TAB_LABEL_WIDTH;
    if (reduceMotion) {
      tabIndicator.value = target;
    } else {
      tabIndicator.value = withSpring(target, spring.snappy);
    }
  }

  // ── Loading skeleton — geometry mirrors loaded layout pixel-for-pixel ──
  if (isLoading || !r) {
    return (
      <View style={styles.root}>
        <View>
          {/* Hero — same height/width as loaded parallax hero */}
          <View style={{ width, height: HERO_H, overflow: 'hidden' }}>
            <MotiView
              from={{ opacity: 0.45 }}
              animate={{ opacity: 0.75 }}
              transition={{ type: 'timing', duration: 650, loop: true, repeatReverse: true }}
              style={[StyleSheet.absoluteFill, { backgroundColor: color.surfaceMuted }]}
            />
          </View>

          {/* Content card — same overlap, padding, structure */}
          <View style={styles.contentCard}>
            {/* HiddenGemBadge spot */}
            <View style={skelStyles.gemBadge} />
            {/* Display title */}
            <View style={[skelStyles.line, { width: '70%', height: 32, marginTop: space.sm }]} />
            {/* Subtitle row */}
            <View style={styles.subtitleRow}>
              <View style={styles.subtitleRule} />
              <View style={[skelStyles.line, { width: 140, height: 13 }]} />
            </View>
            {/* Vibes */}
            <View style={styles.vibesWrap}>
              {[60, 80, 70].map((w, i) => (
                <View key={i} style={[skelStyles.vibePill, { width: w }]} />
              ))}
            </View>
            {/* Directions button */}
            <View style={[skelStyles.directionsSkel, { marginTop: space.lg }]} />

            {/* Menu section label */}
            <View style={styles.menuSectionLabel}>
              <View style={[skelStyles.line, { width: 70, height: 10 }]} />
              <View style={styles.sectionLabelLine} />
            </View>

            {/* Tab strip — same height */}
            <View style={styles.tabStrip}>
              <View style={[styles.tabBtn, { alignItems: 'center' }]}>
                <View style={[skelStyles.line, { width: 90, height: 14 }]} />
              </View>
              <View style={[styles.tabBtn, { alignItems: 'center' }]}>
                <View style={[skelStyles.line, { width: 120, height: 14 }]} />
              </View>
              <View style={[styles.tabIndicator, { backgroundColor: color.surfaceMuted }]} />
            </View>

            {/* Dish rows */}
            <View style={styles.dishList}>
              {[0, 1, 2].map((i) => (
                <MotiView
                  key={i}
                  from={{ opacity: 0.45 }}
                  animate={{ opacity: 0.75 }}
                  transition={{ type: 'timing', duration: 650, loop: true, repeatReverse: true, delay: 120 + i * 80 }}
                  style={styles.dishRow}
                >
                  <View style={[styles.dishImage, { backgroundColor: color.surfaceMuted }]} />
                  <View style={styles.dishBody}>
                    <View style={[skelStyles.line, { width: '60%', height: 17 }]} />
                    <View style={[skelStyles.line, { width: '90%', height: 13, marginTop: 4 }]} />
                    <View style={[skelStyles.pricePillSkel, { marginTop: 8 }]} />
                  </View>
                </MotiView>
              ))}
            </View>
          </View>
        </View>

        {/* Floating back button — same as loaded */}
        <Pressable
          onPress={() => { hapticImpact(); router.back(); }}
          style={({ pressed }) => [
            styles.floatingBack,
            pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
          ]}
        >
          <ChevronLeft size={20} color={color.text.base} strokeWidth={2.2} />
        </Pressable>
      </View>
    );
  }

  const dishes = tab === 'legends' ? r.bestSellers : r.unsungBites;

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: space.xxl }}
      >
        {/* Parallax hero */}
        <View style={{ width, height: HERO_H, overflow: 'hidden' }}>
          <Animated.View style={[StyleSheet.absoluteFill, heroStyle]}>
            <Image
              source={{ uri: r.heroImage }}
              style={{ width, height: HERO_H }}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.heroGradient} pointerEvents="none" />
          </Animated.View>

          <Animated.View
            entering={reduceMotion ? undefined : FadeIn.delay(120).duration(400)}
            style={[styles.heroOverlayTitle, heroOverlayTitleStyle]}
            pointerEvents="none"
          >
            <View style={styles.eyebrowRowLight}>
              <View style={styles.eyebrowDotLight} />
              <Text variant="labelStrong" tone="surface" style={styles.eyebrowText}>{r.cuisine.toUpperCase()}</Text>
            </View>
            <Text variant="display" tone="surface" style={styles.heroTitle}>{r.name}</Text>
            <View style={styles.subtitleRowLight}>
              <View style={styles.subtitleRuleLight} />
              <Text variant="small" tone="surface" style={styles.heroSubtitle}>
                {r.neighborhood}
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Editorial content card */}
        <View style={styles.contentCard}>
          <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(360)}>
            <HiddenGemBadge score={r.hiddenGemScore} />
            <Text variant="display" tone="base" style={styles.name}>{r.name}</Text>
            <View style={styles.subtitleRow}>
              <View style={styles.subtitleRule} />
              <Text variant="small" tone="muted" style={styles.subtitleText}>
                {r.cuisine} · {r.neighborhood}
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(80).duration(360)}
            style={styles.vibesWrap}
          >
            {r.vibes.map((v: string) => (
              <VibeTag key={v} label={v} />
            ))}
          </Animated.View>

          <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(140).duration(360)}>
            <Button
              label="Directions"
              leading={<Navigation size={16} color={color.surface} />}
              onPress={() => hapticImpact(Haptics.ImpactFeedbackStyle.Medium)}
              style={styles.directionsBtn}
            />
          </Animated.View>

          {/* Section label for menu */}
          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(200).duration(360)}
            style={styles.menuSectionLabel}
          >
            <Text variant="labelStrong" style={styles.sectionLabelText}>THE MENU</Text>
            <View style={styles.sectionLabelLine} />
          </Animated.View>

          {/* Animated tab strip */}
          <View
            style={styles.tabStrip}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              tabIndicator.value = tab === 'legends' ? 0 : w * TAB_LABEL_WIDTH;
            }}
          >
            <TabButton
              label="The Legends"
              active={tab === 'legends'}
              onPress={(w) => switchTab('legends', w)}
            />
            <TabButton
              label="The Unsung Bites"
              active={tab === 'unsung'}
              onPress={(w) => switchTab('unsung', w)}
            />
            <Animated.View style={[styles.tabIndicator, tabIndicatorStyle]} />
          </View>

          {/* Dishes */}
          <View style={styles.dishList} key={tab}>
            {dishes.length === 0 ? (
              <Text variant="small" tone="muted" style={{ marginTop: space.md }}>
                Nothing here yet — be the first to log a dish.
              </Text>
            ) : (
              dishes.map((d: Dish, idx: number) => (
                <Animated.View
                  key={d.id}
                  entering={
                    reduceMotion
                      ? undefined
                      : FadeInDown.delay(Math.min(60 * idx, 240)).duration(360).springify().damping(20)
                  }
                  style={styles.dishRow}
                >
                  <Image
                    source={{ uri: d.image }}
                    style={styles.dishImage}
                    contentFit="cover"
                    transition={300}
                  />
                  <View style={styles.dishBody}>
                    <Text variant="h3Serif" tone="base" style={styles.dishName}>
                      {d.name}
                    </Text>
                    {d.description ? (
                      <Text variant="small" tone="muted" style={styles.dishDescription} numberOfLines={2}>
                        {d.description}
                      </Text>
                    ) : null}
                    {d.priceCents ? (
                      <View style={styles.pricePill}>
                        <Text variant="labelStrong" tone="primary" style={styles.priceText}>
                          ${(d.priceCents / 100).toFixed(2)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Animated.View>
              ))
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Floating back button (always visible) */}
      <Pressable
        onPress={() => { hapticImpact(); router.back(); }}
        accessibilityLabel="Back"
        style={({ pressed }) => [
          styles.floatingBack,
          pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
        ]}
      >
        <ChevronLeft size={20} color={color.text.base} strokeWidth={2.2} />
      </Pressable>

      {/* Collapsed header */}
      <Animated.View style={[styles.collapsedHeader, collapsedHeaderStyle]} pointerEvents="box-none">
        <View style={styles.collapsedHeaderInner}>
          <Pressable
            onPress={() => { hapticImpact(); router.back(); }}
            style={({ pressed }) => [
              styles.collapsedBackBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <ChevronLeft size={18} color={color.text.base} strokeWidth={2.2} />
          </Pressable>
          <Text variant="h3Serif" tone="primary" style={styles.collapsedTitle} numberOfLines={1}>
            {r.name}
          </Text>
          <View style={{ width: 36 }} />
        </View>
      </Animated.View>
    </View>
  );
}

// ── Tab button ──
function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: (parentWidth: number) => void;
}) {
  const [parentWidth, setParentWidth] = React.useState(0);
  return (
    <Pressable
      onPress={() => onPress(parentWidth)}
      onLayout={(e) => setParentWidth(e.nativeEvent.layout.width * 2)}
      style={styles.tabBtn}
    >
      <Text
        variant="bodySerif"
        tone={active ? 'primary' : 'muted'}
        style={[styles.tabLabel, active && styles.tabLabelActive]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },

  // Hero
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_H * 0.6,
    backgroundColor: 'rgba(0,0,0,0.0)',
    // subtle linear-ish darken using shadow inset is not possible in RN;
    // ponytail: flat tint suffices for legibility, swap to expo-linear-gradient if needed
  },
  heroOverlayTitle: {
    position: 'absolute',
    left: H_PAD,
    right: H_PAD,
    bottom: space.xl + 12,
  },
  eyebrowRowLight: { flexDirection: 'row', alignItems: 'center' },
  eyebrowDotLight: { width: 5, height: 5, borderRadius: 99, backgroundColor: color.surface, marginRight: 7 },
  eyebrowText: { letterSpacing: 1.6, fontSize: 10 },
  heroTitle: { marginTop: space.sm, lineHeight: 40, textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 12, textShadowOffset: { width: 0, height: 2 } },
  subtitleRowLight: { flexDirection: 'row', alignItems: 'center', marginTop: space.sm, gap: SUBTITLE_GAP },
  subtitleRuleLight: { width: 18, height: 1, backgroundColor: 'rgba(255,255,255,0.7)' },
  heroSubtitle: { opacity: 0.92 },

  // Floating back
  floatingBack: {
    position: 'absolute',
    top: 56,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },

  // Content card
  contentCard: {
    marginTop: -32,
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: H_PAD,
    paddingTop: space.lg + 4,
    paddingBottom: space.xl,
    ...shadow.card,
  },
  name: { marginTop: space.sm, lineHeight: 38 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.sm, gap: SUBTITLE_GAP },
  subtitleRule: { width: 24, height: 1, backgroundColor: color.border },
  subtitleText: { lineHeight: 16 },
  vibesWrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: space.md },
  directionsBtn: { marginTop: space.lg },

  // Menu section
  menuSectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.xl,
    marginBottom: space.sm + 2,
  },
  sectionLabelText: { letterSpacing: 1.4, fontSize: 10, color: color.text.muted },
  sectionLabelLine: { flex: 1, height: 1, backgroundColor: color.border, marginLeft: space.sm + 2 },

  // Tabs
  tabStrip: {
    flexDirection: 'row',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  tabBtn: { flex: 1, paddingBottom: 12, paddingTop: 6, alignItems: 'center' },
  tabLabel: { fontSize: 14 },
  tabLabelActive: { },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    width: '50%',
    height: 2,
    backgroundColor: color.primary.base,
    borderRadius: 2,
  },

  // Dishes
  dishList: { marginTop: space.md + 2, gap: space.md + 2 },
  dishRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dishImage: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    backgroundColor: color.surfaceMuted,
  },
  dishBody: { flex: 1 },
  dishName: { fontSize: 17, lineHeight: 22 },
  dishDescription: { marginTop: 4, lineHeight: 18 },
  pricePill: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: color.primary.soft,
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  priceText: { letterSpacing: 0.5, fontSize: 11 },

  // Collapsed header
  collapsedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 44,
    backgroundColor: color.bg,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  collapsedHeaderInner: {
    height: COLLAPSED_HEADER_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
  },
  collapsedBackBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapsedTitle: { flex: 1, textAlign: 'center', marginHorizontal: space.sm },

  // Loading skeleton
  skelHero: { backgroundColor: color.surfaceMuted },
  skelCardOverlap: {
    marginTop: -32,
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: H_PAD,
    paddingTop: space.lg + 4,
    paddingBottom: space.xl,
    ...shadow.card,
  },
  skelLine: {
    height: 24,
    width: '70%',
    borderRadius: radius.sm,
    backgroundColor: color.surfaceMuted,
  },
  skelDishRow: {
    height: 88,
    borderRadius: radius.md,
    backgroundColor: color.surfaceMuted,
    marginTop: space.lg,
  },
  skelBackBtn: {
    position: 'absolute',
    top: 56,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const skelStyles = StyleSheet.create({
  line: { backgroundColor: color.surfaceMuted, borderRadius: radius.sm },
  gemBadge: { width: 110, height: 22, borderRadius: radius.pill, backgroundColor: color.surfaceMuted },
  vibePill: { height: 26, borderRadius: radius.pill, backgroundColor: color.surfaceMuted },
  directionsSkel: { height: 48, borderRadius: radius.pill, backgroundColor: color.surfaceMuted },
  pricePillSkel: { width: 56, height: 18, borderRadius: radius.pill, backgroundColor: color.surfaceMuted },
});

