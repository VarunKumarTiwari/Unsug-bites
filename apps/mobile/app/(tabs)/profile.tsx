import React, { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeInDown,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { LogIn, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Screen, Text, color, radius, shadow, space } from '@unsung/ui';
import { Badge } from '@/components/gamification/Badge';
import { StreakFlame } from '@/components/gamification/StreakFlame';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { users, gamification, discovery } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import type { Badge as BadgeType, RestaurantSummary } from '@unsung/contracts';

// ── Scroll animation ranges ──
const COLLAPSED_HEADER_H = 52;
const HERO_COLLAPSE_START = 90;
const HERO_COLLAPSE_END = 180;

// ── Layout constants ──
const H_PAD = 20;
const AVATAR_SIZE = 72;
const SUBTITLE_GAP = 10;

function hapticImpact() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export default function Profile() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const toggle = useAuthStore((s) => s.toggle);
  const reduceMotion = useReduceMotion();
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);

  const { data: me } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: users.getMe,
    enabled: isLoggedIn,
  });
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['gamification', 'u_alex'],
    queryFn: () => gamification.getState('u_alex'),
  });
  const { data: nearby } = useQuery({
    queryKey: ['discovery', 'nearby'],
    queryFn: () => discovery.getNearby(40.68, -74.0),
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const heroStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, HERO_COLLAPSE_START], [1, 0.6], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(scrollY.value, [0, HERO_COLLAPSE_END], [1, 0.94], Extrapolation.CLAMP) },
      { translateY: interpolate(scrollY.value, [0, HERO_COLLAPSE_END], [0, -8], Extrapolation.CLAMP) },
    ],
  }));

  const collapsedHeaderStyle = useAnimatedStyle(() => {
    const p = interpolate(scrollY.value, [HERO_COLLAPSE_START, HERO_COLLAPSE_END], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: p,
      transform: [{ translateY: interpolate(p, [0, 1], [-COLLAPSED_HEADER_H, 0]) }],
    };
  });

  // Progress bar animated fill
  const progress = stats?.rankProgress ?? 0;
  const progressWidth = useSharedValue(0);
  React.useEffect(() => {
    if (reduceMotion) {
      progressWidth.value = progress * 100;
      return;
    }
    progressWidth.value = withTiming(progress * 100, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [progress, reduceMotion, progressWidth]);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progressWidth.value}%` }));

  async function onRefresh() {
    hapticImpact();
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  // ── Loading skeleton — geometry mirrors loaded layout pixel-for-pixel ──
  if (isLoading || !stats) {
    return (
      <Screen padded={false}>
        <View style={styles.scrollContent}>
          {/* Hero — matches whichever loaded hero will render */}
          {isLoggedIn ? (
            <View style={styles.loggedInHero}>
              <View style={styles.heroEyebrowLight}>
                <View style={styles.eyebrowDotLight} />
                <View style={skelStyles.eyebrowBarLight} />
              </View>
              <View style={styles.heroIdentity}>
                <View style={styles.avatarRing}>
                  <View style={styles.avatarInnerRing}>
                    <View style={[styles.avatar, { backgroundColor: color.surface, opacity: 0.6 }]} />
                  </View>
                </View>
                <View style={styles.identityText}>
                  <View style={skelStyles.nameBarLight} />
                  <View style={styles.subtitleRowLight}>
                    <View style={styles.subtitleRuleLight} />
                    <View style={skelStyles.rankBarLight} />
                  </View>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '0%' }]} />
              </View>
            </View>
          ) : (
            <View style={styles.loggedOutHero}>
              <View style={styles.eyebrowRow}>
                <View style={styles.eyebrowDot} />
                <Text variant="labelStrong" tone="muted" style={styles.eyebrowText}>SIGN IN</Text>
              </View>
              <Text variant="display" tone="primary" style={styles.heroTitle}>Your Story</Text>
              <View style={styles.subtitleRow}>
                <View style={styles.subtitleRule} />
                <Text variant="small" tone="muted" style={styles.subtitleText}>every dish, every badge, every streak</Text>
              </View>
              <View style={styles.signInCard}>
                <View style={skelStyles.signInPillSkel} />
              </View>
            </View>
          )}

          {/* Body — same layout as loaded */}
          <View style={styles.body}>
            <View style={styles.sectionLabel}>
              <Text variant="labelStrong" style={styles.sectionLabelText}>ACHIEVEMENTS</Text>
              <View style={styles.sectionLabelLine} />
            </View>
            <MotiView
              from={{ opacity: 0.35 }}
              animate={{ opacity: 0.7 }}
              transition={{ type: 'timing', duration: 650, loop: true, repeatReverse: true, delay: 120 }}
              style={skelStyles.badgeCardSkel}
            />

            <View style={styles.streakWrap}>
              <View style={styles.sectionLabel}>
                <Text variant="labelStrong" style={styles.sectionLabelText}>STREAK</Text>
                <View style={styles.sectionLabelLine} />
              </View>
              <MotiView
                from={{ opacity: 0.35 }}
                animate={{ opacity: 0.7 }}
                transition={{ type: 'timing', duration: 650, loop: true, repeatReverse: true, delay: 200 }}
                style={skelStyles.streakSkel}
              />
            </View>

            <View style={[styles.sectionLabel, { marginTop: space.lg }]}>
              <Text variant="labelStrong" style={styles.sectionLabelText}>FAVORITE RESTAURANTS</Text>
              <View style={styles.sectionLabelLine} />
            </View>
            <View style={styles.favRow}>
              {[0, 1].map((i) => (
                <MotiView
                  key={i}
                  from={{ opacity: 0.35 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ type: 'timing', duration: 650, loop: true, repeatReverse: true, delay: 280 + i * 100 }}
                  style={[styles.favCell, skelStyles.favCardSkel]}
                />
              ))}
            </View>
          </View>
        </View>
      </Screen>
    );
  }

  const rows: BadgeType[][] = [];
  for (let i = 0; i < stats.badges.length; i += 3) rows.push(stats.badges.slice(i, i + 3));

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
        {/* Hero — logged in: rich red bleed card. Logged out: editorial empty hero. */}
        {isLoggedIn && me ? (
          <Animated.View style={[styles.loggedInHero, heroStyle]}>
            <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(320)} style={styles.heroEyebrowLight}>
              <View style={styles.eyebrowDotLight} />
              <Text variant="labelStrong" tone="surface" style={styles.eyebrowText}>YOUR STORY</Text>
            </Animated.View>

            <Animated.View
              entering={reduceMotion ? undefined : FadeInDown.delay(60).duration(360)}
              style={styles.heroIdentity}
            >
              <View style={styles.avatarRing}>
                <View style={styles.avatarInnerRing}>
                  {me.avatarUrl ? (
                    <Image
                      source={{ uri: me.avatarUrl }}
                      style={styles.avatar}
                      contentFit="cover"
                      transition={300}
                    />
                  ) : (
                    <View style={[styles.avatar, { backgroundColor: color.surface }]} />
                  )}
                </View>
              </View>
              <View style={styles.identityText}>
                <Text variant="display" tone="surface" style={styles.displayName}>{me.displayName}</Text>
                <View style={styles.subtitleRowLight}>
                  <View style={styles.subtitleRuleLight} />
                  <Text variant="small" tone="surface" style={styles.rankText}>
                    {stats.rank} · {Math.round((stats.rankProgress ?? 0) * 100)}% to next
                  </Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View
              entering={reduceMotion ? undefined : FadeInDown.delay(140).duration(360)}
              style={styles.progressBar}
            >
              <Animated.View style={[styles.progressFill, progressStyle]} />
            </Animated.View>
          </Animated.View>
        ) : (
          <View style={styles.loggedOutHero}>
            <Animated.View style={heroStyle}>
              <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(320)} style={styles.eyebrowRow}>
                <View style={styles.eyebrowDot} />
                <Text variant="labelStrong" tone="muted" style={styles.eyebrowText}>SIGN IN</Text>
              </Animated.View>
              <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(60).duration(360)}>
                <Text variant="display" tone="primary" style={styles.heroTitle}>Your Story</Text>
              </Animated.View>
              <Animated.View
                entering={reduceMotion ? undefined : FadeInDown.delay(120).duration(360)}
                style={styles.subtitleRow}
              >
                <View style={styles.subtitleRule} />
                <Text variant="small" tone="muted" style={styles.subtitleText}>
                  every dish, every badge, every streak
                </Text>
              </Animated.View>

              <Animated.View
                entering={reduceMotion ? undefined : FadeIn.delay(220).duration(400)}
                style={styles.signInCard}
              >
                <Pressable
                  onPress={() => { hapticImpact(); toggle(); }}
                  style={({ pressed }) => [
                    styles.signInPill,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <LogIn size={14} color={color.surface} strokeWidth={2.5} />
                  <Text variant="smallStrong" tone="surface" style={{ marginLeft: 7 }}>
                    Sign in to track your finds
                  </Text>
                  <ChevronRight size={14} color={color.surface} strokeWidth={2.5} style={{ marginLeft: 6 }} />
                </Pressable>
              </Animated.View>
            </Animated.View>
          </View>
        )}

        {/* Content */}
        <View style={styles.body}>
          <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(200).duration(360)}>
            <View style={styles.sectionLabel}>
              <Text variant="labelStrong" style={styles.sectionLabelText}>ACHIEVEMENTS</Text>
              <View style={styles.sectionLabelLine} />
              <Text variant="label" tone="muted" style={styles.sectionCount}>
                {stats.badges.filter((b: BadgeType) => b.unlocked).length}/{stats.badges.length}
              </Text>
            </View>
            <View style={styles.badgeCard}>
              {rows.map((row, idx) => (
                <View key={idx} style={styles.badgeRow}>
                  {row.map((b: BadgeType) => (
                    <Badge key={b.id} badge={b} />
                  ))}
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View
            entering={reduceMotion ? undefined : FadeInDown.delay(260).duration(360)}
            style={styles.streakWrap}
          >
            <View style={styles.sectionLabel}>
              <Text variant="labelStrong" style={styles.sectionLabelText}>STREAK</Text>
              <View style={styles.sectionLabelLine} />
            </View>
            <StreakFlame days={stats.streakDays} />
          </Animated.View>

          <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(320).duration(360)}>
            <View style={[styles.sectionLabel, { marginTop: space.lg }]}>
              <Text variant="labelStrong" style={styles.sectionLabelText}>FAVORITE RESTAURANTS</Text>
              <View style={styles.sectionLabelLine} />
            </View>
            <View style={styles.favRow}>
              {(nearby ?? []).slice(0, 2).map((r: RestaurantSummary) => (
                <View key={r.id} style={styles.favCell}>
                  <RestaurantCard restaurant={r} />
                </View>
              ))}
            </View>
          </Animated.View>

          {__DEV__ && (
            <Pressable
              onPress={() => { hapticImpact(); toggle(); }}
              style={({ pressed }) => [
                styles.devToggle,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text variant="smallMedium" tone="muted">
                DEV: {isLoggedIn ? 'Log out' : 'Log in (mock)'}
              </Text>
            </Pressable>
          )}
        </View>
      </Animated.ScrollView>

      {/* Collapsed header */}
      <Animated.View style={[styles.collapsedHeader, collapsedHeaderStyle]} pointerEvents="none">
        <View style={styles.collapsedHeaderInner}>
          {isLoggedIn && me?.avatarUrl ? (
            <Image source={{ uri: me.avatarUrl }} style={styles.collapsedAvatar} contentFit="cover" />
          ) : (
            <View style={styles.eyebrowDot} />
          )}
          <Text variant="h3Serif" tone="primary" style={styles.collapsedTitle}>
            {isLoggedIn && me ? me.displayName : 'Your Story'}
          </Text>
        </View>
      </Animated.View>
    </Screen>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  scrollContent: { paddingBottom: space.xxl },

  // Eyebrow
  eyebrowRow: { flexDirection: 'row', alignItems: 'center' },
  eyebrowDot: { width: 5, height: 5, borderRadius: 99, backgroundColor: color.primary.base, marginRight: 7 },
  eyebrowDotLight: { width: 5, height: 5, borderRadius: 99, backgroundColor: color.surface, marginRight: 7 },
  eyebrowText: { letterSpacing: 1.4, fontSize: 10 },

  // Logged-in hero
  loggedInHero: {
    backgroundColor: color.primary.base,
    paddingHorizontal: H_PAD,
    paddingTop: space.lg + 6,
    paddingBottom: space.xl + 4,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    ...shadow.card,
  },
  heroEyebrowLight: { flexDirection: 'row', alignItems: 'center' },
  heroIdentity: { flexDirection: 'row', alignItems: 'center', marginTop: space.md, gap: 14 },
  avatarRing: {
    width: AVATAR_SIZE + 8,
    height: AVATAR_SIZE + 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInnerRing: {
    width: AVATAR_SIZE + 2,
    height: AVATAR_SIZE + 2,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: 999 },
  identityText: { flex: 1 },
  displayName: { lineHeight: 36 },
  subtitleRowLight: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: SUBTITLE_GAP },
  subtitleRuleLight: { width: 18, height: 1, backgroundColor: 'rgba(255,255,255,0.55)' },
  rankText: { opacity: 0.9, fontSize: 12 },

  progressBar: {
    marginTop: space.md + 4,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: color.surface, borderRadius: 999 },

  // Logged-out hero
  loggedOutHero: {
    paddingHorizontal: H_PAD,
    paddingTop: space.lg + 4,
    paddingBottom: space.lg + 4,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  heroTitle: { marginTop: space.xs, lineHeight: 42 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.sm + 2, gap: SUBTITLE_GAP },
  subtitleRule: { width: 24, height: 1, backgroundColor: color.border },
  subtitleText: { lineHeight: 16 },
  signInCard: { marginTop: space.lg, alignItems: 'flex-start' },
  signInPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.text.base,
    borderRadius: radius.pill,
    paddingVertical: space.sm + 4,
    paddingHorizontal: space.md + 2,
  },

  // Body
  body: { paddingHorizontal: H_PAD, marginTop: space.lg },

  // Section label
  sectionLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: space.sm + 2 },
  sectionLabelText: { letterSpacing: 1.4, fontSize: 10, color: color.text.muted },
  sectionLabelLine: { flex: 1, height: 1, backgroundColor: color.border, marginLeft: space.sm + 2 },
  sectionCount: { marginLeft: space.sm, letterSpacing: 1, fontSize: 10 },

  // Badges
  badgeCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: space.md,
    gap: space.md,
    ...shadow.card,
  },
  badgeRow: { flexDirection: 'row', gap: space.sm, justifyContent: 'space-around' },

  // Streak
  streakWrap: { marginTop: space.lg },

  // Favorites
  favRow: { flexDirection: 'row', gap: 12 },
  favCell: { flex: 1 },

  // Dev toggle
  devToggle: {
    marginTop: space.xl,
    alignSelf: 'center',
    backgroundColor: color.surfaceMuted,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
  },

  // Collapsed header
  collapsedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: COLLAPSED_HEADER_H,
    backgroundColor: color.bg,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  collapsedHeaderInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    height: '100%',
  },
  collapsedAvatar: { width: 28, height: 28, borderRadius: 999, marginRight: space.sm },
  collapsedTitle: { marginLeft: 0 },

  // Loading skeleton
  skelHero: {
    paddingHorizontal: H_PAD,
    paddingTop: space.lg + 4,
    paddingBottom: space.lg,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  skelEyebrow: { flexDirection: 'row', alignItems: 'center' },
  skelTitle: {
    height: 34,
    width: '55%',
    borderRadius: radius.sm,
    backgroundColor: color.surfaceMuted,
    marginTop: space.sm,
  },
  skelBlock: {
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceMuted,
  },
});

const skelStyles = StyleSheet.create({
  // Logged-in hero placeholders
  eyebrowBarLight: { width: 64, height: 10, borderRadius: radius.sm, backgroundColor: 'rgba(255,255,255,0.45)' },
  nameBarLight: { width: '60%', height: 28, borderRadius: radius.sm, backgroundColor: 'rgba(255,255,255,0.45)' },
  rankBarLight: { width: 130, height: 12, borderRadius: radius.sm, backgroundColor: 'rgba(255,255,255,0.45)' },

  // Logged-out sign-in pill placeholder
  signInPillSkel: { width: 220, height: 44, borderRadius: radius.pill, backgroundColor: color.surfaceMuted },

  // Achievements card placeholder — height matches loaded badge card (3 rows × ~78 + gaps + padding)
  badgeCardSkel: {
    height: 274,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceMuted,
  },
  // Streak pill placeholder
  streakSkel: { width: 140, height: 44, borderRadius: radius.pill, backgroundColor: color.surfaceMuted, alignSelf: 'flex-start' },

  // Favorite restaurant card placeholder — matches RestaurantCard grid layout
  favCardSkel: {
    height: 230,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceMuted,
  },
});

