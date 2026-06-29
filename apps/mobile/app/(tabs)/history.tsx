import React, { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useNavigation } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Flame, Beef, AlertCircle, RefreshCw, BookOpen } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, Text, color, radius, shadow, space } from '@unsung/ui';
import { reviews, gamification } from '@/lib/api';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import type { Review } from '@unsung/contracts';

const SAMPLE_PHOTO = 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800';

// ── Scroll animation ranges (mirrors index.tsx vocabulary) ──
const COLLAPSED_HEADER_H = 52;
const HERO_COLLAPSE_START = 80;
const HERO_COLLAPSE_END = 145;

// ── Layout constants ──
const H_PAD = 20;
const TIMELINE_GUTTER = 56;
const AXIS_X = 28;
const SUBTITLE_GAP = 10;
const RETRY_H_PAD = 22;
const RETRY_ICON_GAP = 7;

function hapticImpact() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export default function History() {
  const scrollY = useSharedValue(0);
  const reduceMotion = useReduceMotion();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: reviewList,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['reviews', 'u_alex'],
    queryFn: () => reviews.listForUser('u_alex'),
  });
  const { data: stats } = useQuery({
    queryKey: ['gamification', 'u_alex'],
    queryFn: () => gamification.getState('u_alex'),
  });

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, () => {
      // ponytail: scroll-to-top on tab re-press only; no ref needed since we re-mount cheap
    });
    return unsubscribe;
  }, [navigation]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const heroStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, HERO_COLLAPSE_START], [1, 0.5], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(scrollY.value, [0, HERO_COLLAPSE_END], [1, 0.92], Extrapolation.CLAMP) },
      { translateY: interpolate(scrollY.value, [0, HERO_COLLAPSE_END], [0, -10], Extrapolation.CLAMP) },
    ],
  }));

  const collapsedHeaderStyle = useAnimatedStyle(() => {
    const p = interpolate(scrollY.value, [HERO_COLLAPSE_START, HERO_COLLAPSE_END], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: p,
      transform: [{ translateY: interpolate(p, [0, 1], [-COLLAPSED_HEADER_H, 0]) }],
    };
  });

  const subtitle = isLoading
    ? 'gathering your plates…'
    : stats
    ? `${stats.totalDishesLogged} dish${stats.totalDishesLogged === 1 ? '' : 'es'} · ${stats.streakDays}-day streak`
    : 'every dish, remembered';

  async function onRefresh() {
    hapticImpact();
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  // ── Loading skeleton — geometry mirrors loaded layout pixel-for-pixel ──
  if (isLoading) {
    return (
      <Screen padded={false}>
        <View style={styles.scrollContent}>
          {/* Hero — identical to loaded hero */}
          <View style={styles.heroBlock}>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowDot} />
              <Text variant="labelStrong" tone="muted" style={styles.eyebrowText}>FOOD HISTORY</Text>
            </View>
            <Text variant="display" tone="primary" style={styles.heroTitle}>Food History</Text>
            <View style={styles.subtitleRow}>
              <View style={styles.subtitleRule} />
              <Text variant="small" tone="muted" style={styles.subtitleText}>gathering your plates…</Text>
            </View>
          </View>

          {/* Timeline skeleton — same wrap, axis, entry geometry as loaded */}
          <View style={styles.timelineWrap}>
            <View style={styles.timelineAxis} pointerEvents="none" />
            <View style={styles.entries}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={styles.entry}>
                  <View style={styles.entryAxisNode}>
                    <View style={styles.axisNodeOuter}>
                      <View style={styles.axisNodeInner} />
                    </View>
                  </View>
                  <View style={styles.entryContent}>
                    <View style={styles.dateRow}>
                      <View style={skelStyles.dateMonthBar} />
                      <View style={skelStyles.dateDayBar} />
                    </View>
                    <MotiView
                      from={{ opacity: 0.35 }}
                      animate={{ opacity: 0.7 }}
                      transition={{ type: 'timing', duration: 650, loop: true, repeatReverse: true, delay: i * 120 }}
                      style={styles.polaroid}
                    >
                      <View style={[styles.polaroidImage, { backgroundColor: color.surfaceMuted }]} />
                      <View style={styles.polaroidBody}>
                        <View style={[skelStyles.line, { width: '70%', height: 17 }]} />
                        <View style={[skelStyles.line, { width: '90%', height: 13, marginTop: 6 }]} />
                        <View style={styles.glanceRow}>
                          <View style={skelStyles.glancePill} />
                          <View style={skelStyles.glancePill} />
                        </View>
                      </View>
                    </MotiView>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Screen>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <Screen padded>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.errorHero}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDot} />
            <Text variant="labelStrong" tone="muted" style={styles.eyebrowText}>FOOD HISTORY</Text>
          </View>
          <Text variant="display" tone="primary" style={styles.errorTitle}>Food History</Text>
        </Animated.View>
        <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.errorContainer}>
          <View style={styles.errorIconWrap}>
            <AlertCircle size={22} color={color.text.muted} />
          </View>
          <Text variant="h3Serif" tone="muted" style={styles.errorBody}>
            Couldn't load your history.
          </Text>
          <Text variant="small" tone="muted" style={styles.errorSub}>
            Check your connection and try again.
          </Text>
          <Pressable
            onPress={() => {
              hapticImpact();
              refetch();
            }}
            style={({ pressed }) => [
              styles.retryButton,
              { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <RefreshCw size={13} color={color.surface} strokeWidth={2.5} />
            <Text variant="smallStrong" tone="surface" style={styles.retryLabel}>Try again</Text>
          </Pressable>
        </Animated.View>
      </Screen>
    );
  }

  const list = reviewList ?? [];
  const isEmpty = list.length === 0;

  return (
    <Screen padded={false}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.primary.base} />
        }
      >
        {/* Hero */}
        <View style={styles.heroBlock}>
          <Animated.View style={heroStyle}>
            <Animated.View entering={FadeInDown.duration(300)} style={styles.eyebrowRow}>
              <View style={styles.eyebrowDot} />
              <Text variant="labelStrong" tone="muted" style={styles.eyebrowText}>FOOD HISTORY</Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(60).duration(350)}>
              <Text variant="display" tone="primary" style={styles.heroTitle}>Food History</Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(120).duration(350)} style={styles.subtitleRow}>
              <View style={styles.subtitleRule} />
              <Text variant="small" tone="muted" style={styles.subtitleText}>{subtitle}</Text>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Empty */}
        {isEmpty ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <BookOpen size={22} color={color.text.muted} />
            </View>
            <Text variant="h2" tone="muted" style={styles.emptyTitle}>No plates logged yet.</Text>
            <View style={styles.emptyRule} />
            <Text variant="body" tone="muted" style={styles.emptyBody}>
              Scan a dish to start your story. Every plate finds its place here.
            </Text>
          </View>
        ) : (
          <View style={styles.timelineWrap}>
            <View style={styles.timelineAxis} pointerEvents="none" />
            <View style={styles.entries}>
              {list.map((rev: Review, idx: number) => (
                <TimelineEntry key={rev.id} review={rev} index={idx} reduceMotion={reduceMotion} />
              ))}
              <View style={styles.timelineCap}>
                <View style={styles.capDot} />
                <Text variant="label" tone="subtle" style={styles.capLabel}>THE BEGINNING</Text>
              </View>
            </View>
          </View>
        )}
      </Animated.ScrollView>

      {/* Collapsed header */}
      <Animated.View
        style={[
          styles.collapsedHeader,
          { height: COLLAPSED_HEADER_H + insets.top, paddingTop: insets.top },
          collapsedHeaderStyle,
        ]}
        pointerEvents="none"
      >
        <View style={[styles.collapsedHeaderInner, { height: COLLAPSED_HEADER_H }]}>
          <View style={styles.collapsedLeft}>
            <View style={styles.eyebrowDot} />
            <Text variant="h3Serif" tone="primary" style={styles.collapsedTitle}>Food History</Text>
          </View>
        </View>
      </Animated.View>
    </Screen>
  );
}

// ── Timeline entry ──
function TimelineEntry({
  review,
  index,
  reduceMotion,
}: {
  review: Review;
  index: number;
  reduceMotion: boolean;
}) {
  const delay = reduceMotion ? 0 : Math.min(50 * index, 200);
  const date = new Date(review.createdAt);
  const month = date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
  const day = date.toLocaleDateString(undefined, { day: 'numeric' });

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(360).springify().damping(20)}
      style={styles.entry}
    >
      <View style={styles.entryAxisNode}>
        <View style={styles.axisNodeOuter}>
          <View style={styles.axisNodeInner} />
        </View>
      </View>
      <View style={styles.entryContent}>
        <View style={styles.dateRow}>
          <Text variant="labelStrong" tone="primary" style={styles.dateMonth}>{month}</Text>
          <Text variant="h3Serif" tone="base" style={styles.dateDay}>{day}</Text>
        </View>
        <View style={styles.polaroid}>
          <Image
            source={{ uri: SAMPLE_PHOTO }}
            style={styles.polaroidImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.polaroidBody}>
            <Text variant="h3Serif" tone="base" style={styles.dishName}>{review.dishName}</Text>
            {review.note ? (
              <Text variant="small" tone="muted" style={styles.dishNote}>
                {'“'}{review.note}{'”'}
              </Text>
            ) : null}
            <View style={styles.glanceRow}>
              <Glance icon={<Flame size={11} color={color.success.base} />} label="Calories" />
              <Glance icon={<Beef size={11} color={color.success.base} />} label="Protein" />
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function Glance({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.glance}>
      {icon}
      <Text variant="labelStrong" tone="success" style={styles.glanceLabel}>{label}</Text>
    </View>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  scrollContent: { paddingBottom: space.xxl + space.md },

  // Hero
  heroBlock: {
    paddingHorizontal: H_PAD,
    paddingTop: space.lg + 4,
    paddingBottom: space.lg - 2,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
    marginBottom: space.lg - 4,
  },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center' },
  eyebrowDot: { width: 5, height: 5, borderRadius: 99, backgroundColor: color.primary.base, marginRight: 7 },
  eyebrowText: { letterSpacing: 1.4, fontSize: 10 },
  heroTitle: { marginTop: space.xs, lineHeight: 42 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.sm + 2, gap: SUBTITLE_GAP },
  subtitleRule: { width: 24, height: 1, backgroundColor: color.border },
  subtitleText: { lineHeight: 16 },

  // Collapsed header
  collapsedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: color.bg,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  collapsedHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
  },
  collapsedLeft: { flexDirection: 'row', alignItems: 'center' },
  collapsedTitle: { marginLeft: space.sm },

  // Timeline
  timelineWrap: { position: 'relative' },
  timelineAxis: {
    position: 'absolute',
    left: AXIS_X,
    top: 0,
    bottom: 24,
    width: 1,
    backgroundColor: color.border,
  },
  entries: { gap: space.lg + space.xs },

  // Entry
  entry: { flexDirection: 'row', paddingHorizontal: 0 },
  entryAxisNode: {
    width: TIMELINE_GUTTER,
    alignItems: 'flex-start',
    paddingLeft: AXIS_X - 5,
    paddingTop: space.sm + 2,
  },
  axisNodeOuter: {
    width: 11,
    height: 11,
    borderRadius: 99,
    backgroundColor: color.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.border,
  },
  axisNodeInner: {
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: color.primary.base,
  },
  entryContent: { flex: 1, paddingRight: H_PAD },
  dateRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: space.sm + 2, gap: space.xs + 2 },
  dateMonth: { letterSpacing: 1.4, fontSize: 10 },
  dateDay: { fontSize: 18 },

  // Polaroid
  polaroid: {
    backgroundColor: color.surface,
    padding: space.sm + 4,
    paddingBottom: space.md - 2,
    borderRadius: radius.md,
    transform: [{ rotate: '-1.2deg' }],
    ...shadow.card,
  },
  polaroidImage: { width: '100%', aspectRatio: 1, borderRadius: 6, backgroundColor: color.surfaceMuted },
  polaroidBody: { marginTop: 10 },
  dishName: { fontSize: 17 },
  dishNote: { marginTop: 6, lineHeight: 18, fontStyle: 'italic' },
  glanceRow: { flexDirection: 'row', gap: space.xs + 2, marginTop: 10 },
  glance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.success.soft,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  glanceLabel: { marginLeft: 4 },

  // Timeline cap
  timelineCap: {
    marginTop: space.lg,
    paddingLeft: AXIS_X + space.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  capDot: {
    position: 'absolute',
    left: AXIS_X - 3,
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: color.border,
  },
  capLabel: { letterSpacing: 1.6, fontSize: 10 },

  // Empty
  emptyWrap: { alignItems: 'center', paddingHorizontal: space.xl, paddingTop: space.xl + space.lg },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { textAlign: 'center', marginTop: space.md },
  emptyRule: { width: 32, height: 1, backgroundColor: color.border, marginTop: 14, marginBottom: 14 },
  emptyBody: { textAlign: 'center', maxWidth: 260, lineHeight: 22 },

  // Loading skeleton (legacy)
  skelCard: {
    height: 220,
    borderRadius: radius.md,
    backgroundColor: color.surfaceMuted,
  },

  // Error
  errorHero: { marginTop: space.lg },
  errorTitle: { marginTop: space.xs + 2 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: space.xl + space.md },
  errorIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBody: { textAlign: 'center', marginTop: space.lg - 8 },
  errorSub: { textAlign: 'center', marginTop: space.xs + 2, maxWidth: 220 },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.text.base,
    borderRadius: radius.pill,
    paddingVertical: space.sm + 4,
    paddingHorizontal: RETRY_H_PAD,
    marginTop: space.lg,
  },
  retryLabel: { marginLeft: RETRY_ICON_GAP },
});

const skelStyles = StyleSheet.create({
  dateMonthBar: { width: 48, height: 10, borderRadius: radius.sm, backgroundColor: color.surfaceMuted },
  dateDayBar: { width: 24, height: 16, borderRadius: radius.sm, backgroundColor: color.surfaceMuted },
  line: { backgroundColor: color.surfaceMuted, borderRadius: radius.sm },
  glancePill: { width: 70, height: 22, borderRadius: radius.pill, backgroundColor: color.surfaceMuted, marginRight: space.xs + 2 },
});

