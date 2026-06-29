import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Pressable, ScrollView, StyleSheet, LayoutAnimation, Platform, UIManager, FlatList } from 'react-native';
import { useNavigation } from 'expo-router';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  useDerivedValue,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeInDown,
  runOnJS,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { Search, AlertCircle, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, Text, color, radius, space, spring } from '@unsung/ui';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { FauxMap } from '@/components/map/FauxMap';
import { discovery } from '@/lib/api';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import type { RestaurantSummary } from '@unsung/contracts';

import { SearchOverlay } from '@/components/feed/SearchOverlay';
import { VibeChip } from '@/components/feed/VibeChip';
import { ViewToggle, FeedView } from '@/components/feed/ViewToggle';
import { FeedSkeleton } from '@/components/feed/FeedSkeleton';
import { EmptyState } from '@/components/feed/EmptyState';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function hapticImpact() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

const VIBES = [
  'Cozy', 'Date Night', 'Hidden Gem',
  'Late Night', 'Morning', 'Solo Dining',
  'Casual', 'Local Favorite',
] as const;

const AnimatedFlatList = Animated.FlatList;

// ── Scroll animation ranges ──
const COLLAPSED_HEADER_H = 52;
const HERO_COLLAPSE_START = 80;
const HERO_COLLAPSE_END = 145;
const CHIPS_STICKY_START = 185;
const CHIPS_STICKY_END = 210;
const FEATURED_CARD_OFFSET = 340;
const PARALLAX_RANGE = 20;

// ── Layout constants (screen-specific, not in design tokens) ──
const H_PAD = 20;              // horizontal page inset
const CARD_GAP = space.md;     // 12 — gap between grid cards
const CHIP_GAP = 7;            // gap between vibe chips
const MAP_H = 420;             // map viewfinder height
const LIST_BOTTOM_PAD = 48;    // FlatList content bottom padding
const RETRY_H_PAD = 22;        // retry button horizontal padding
const RETRY_ICON_GAP = 7;      // gap between retry icon and label
const SUBTITLE_GAP = 10;       // gap between subtitle rule and text

export default function Home() {
  const [feedView, setFeedView] = useState<FeedView>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVibe, setActiveVibe] = useState<string | null>(null);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [chipsStuck, setChipsStuck] = useState(false);
  const feedDirection = useRef<1 | -1>(1);
  const contentTranslateX = useSharedValue(0);
  const contentOpacity = useSharedValue(1);
  const scrollY = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const listRef = useRef<FlatList<RestaurantSummary>>(null);
  const navigation = useNavigation();

  // Reset filters whenever the Home tab is pressed — including re-press.
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, () => {
      setSearchQuery('');
      setActiveVibe(null);
      setSearchOverlayOpen(false);
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return unsubscribe;
  }, [navigation]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['discovery', 'nearby'],
    queryFn: () => discovery.getNearby(40.68, -74.0),
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    let results = data;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (r: RestaurantSummary) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.neighborhood.toLowerCase().includes(q),
      );
    }
    if (activeVibe) {
      results = results.filter((r: RestaurantSummary) => r.vibes.includes(activeVibe));
    }
    return results;
  }, [data, searchQuery, activeVibe]);

  const featured = filteredData[0] ?? null;
  const gridData = filteredData.slice(1);
  const hasFilters = Boolean(searchQuery.trim() || activeVibe);

  const subtitle = isLoading
    ? 'looking nearby…'
    : data?.length
    ? `${data.length} spot${data.length === 1 ? '' : 's'} worth finding`
    : 'the good stuff, close by';

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Only update chipsStuck state when crossing the threshold — not every frame
  useAnimatedReaction(
    () => scrollY.value >= CHIPS_STICKY_END,
    (curr, prev) => {
      if (curr !== prev) {
        runOnJS(setChipsStuck)(curr);
      }
    },
    [],
  );

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

  const stickyChipsStyle = useAnimatedStyle(() => {
    const p = interpolate(scrollY.value, [CHIPS_STICKY_START, CHIPS_STICKY_END], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: p,
      transform: [{ translateY: interpolate(p, [0, 1], [-40, 0]) }],
    };
  });

  const parallaxOffset = useDerivedValue(() =>
    interpolate(
      scrollY.value,
      [FEATURED_CARD_OFFSET - 100, FEATURED_CARD_OFFSET + 100],
      [PARALLAX_RANGE, -PARALLAX_RANGE],
      Extrapolation.CLAMP,
    ),
  );

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateX: contentTranslateX.value }],
  }));

  const handleToggleVibe = useCallback((vibe: string) => {
    hapticImpact();
    setActiveVibe((prev) => (prev === vibe ? null : vibe));
  }, []);

  const handleToggleView = useCallback(
    (view: FeedView) => {
      setFeedView((prev) => {
        if (prev === view) return prev;
        feedDirection.current = view === 'map' ? 1 : -1;

        if (reduceMotion) {
          contentOpacity.value = 1;
          contentTranslateX.value = 0;
          return view;
        }

        contentTranslateX.value = withSequence(
          withSpring(feedDirection.current * -24, { duration: 100 }),
          withSpring(feedDirection.current * 32, { duration: 0 }),
          withSpring(0, spring.snappy),
        );
        contentOpacity.value = withSequence(
          withSpring(0, { duration: 100 }),
          withSpring(1, { duration: 180 }),
        );

        return view;
      });
    },
    [reduceMotion],
  );

  const clearFilters = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearchQuery('');
    setActiveVibe(null);
  }, []);

  // ── Loading ──
  if (isLoading) {
    return (
      <Screen padded>
        <FeedSkeleton />
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
            <Text variant="labelStrong" tone="muted" style={styles.eyebrowText}>NEARBY</Text>
          </View>
          <Text variant="display" tone="primary" style={styles.errorTitle}>Hidden Gems</Text>
        </Animated.View>
        <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.errorContainer}>
          <View style={styles.errorIconWrap}>
            <AlertCircle size={22} color={color.text.muted} />
          </View>
          <Text variant="h3Serif" tone="muted" style={styles.errorBody}>
            Couldn't reach nearby spots.
          </Text>
          <Text variant="small" tone="muted" style={styles.errorSub}>
            Check your connection and try again.
          </Text>
          <Pressable
            onPress={() => refetch()}
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

  // ── Feed header ──
  const feedHeader = (
    <View>
      <View style={styles.heroBlock}>
        <Animated.View style={heroStyle}>
          <Animated.View entering={FadeInDown.duration(300)} style={styles.heroTopRow}>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowDot} />
              <Text variant="labelStrong" tone="muted" style={styles.eyebrowText}>NEARBY</Text>
            </View>
            <Pressable
              onPress={() => setSearchOverlayOpen(true)}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              accessibilityLabel="Search restaurants"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.heroSearchBtn,
                pressed && styles.pressedOpacity,
              ]}
            >
              {searchQuery.length > 0 ? (
                <View style={styles.heroSearchActive}>
                  <Search size={14} color={color.surface} strokeWidth={2.5} />
                </View>
              ) : (
                <Search size={18} color={color.text.muted} strokeWidth={1.8} />
              )}
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(60).duration(350)}>
            <Text variant="display" tone="primary" style={styles.heroTitle}>Hidden Gems</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(120).duration(350)} style={styles.subtitleRow}>
            <View style={styles.subtitleRule} />
            <Text variant="small" tone="muted" style={styles.subtitleText}>{subtitle}</Text>
          </Animated.View>
        </Animated.View>
      </View>

      <View style={styles.insetPad}>
        <Animated.View entering={FadeInDown.delay(210).duration(350)} style={styles.chipsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {VIBES.map((vibe) => (
              <VibeChip key={vibe} vibe={vibe} isActive={activeVibe === vibe} onPress={() => handleToggleVibe(vibe)} />
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(260).duration(350)} style={styles.toggleWrapper}>
          <ViewToggle feedView={feedView} onToggle={handleToggleView} />
        </Animated.View>
      </View>

      <Animated.View style={contentAnimStyle}>
        {feedView === 'map' && (
          <View style={styles.mapWrap}>
            <FauxMap restaurants={filteredData} />
          </View>
        )}

        {feedView === 'list' && featured && (
          <View style={styles.featuredWrap}>
            <View style={styles.sectionLabel}>
              <Text variant="labelStrong" style={styles.sectionLabelText}>TOP PICK</Text>
              <View style={styles.sectionLabelLine} />
            </View>
            <RestaurantCard restaurant={featured} layout="row" parallaxOffset={parallaxOffset} />
          </View>
        )}

        {feedView === 'list' && gridData.length > 0 && (
          <View style={[styles.sectionLabel, styles.gridHeader]}>
            <Text variant="labelStrong" style={styles.sectionLabelText}>MORE NEARBY</Text>
            <View style={styles.sectionLabelLine} />
            <Text variant="label" tone="muted" style={styles.gridCount}>{gridData.length}</Text>
          </View>
        )}

        {feedView === 'list' && filteredData.length === 0 && (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
        )}
      </Animated.View>
    </View>
  );

  // ── Main render ──
  return (
    <Screen padded={false}>
      <AnimatedFlatList
        ref={listRef as any}
        data={feedView === 'list' ? gridData : []}
        keyExtractor={(r: RestaurantSummary) => r.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrap}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={feedHeader}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        renderItem={({ item, index }: { item: RestaurantSummary; index: number }) => (
          <Animated.View
            entering={FadeInDown.delay(Math.min(50 * index, 200)).duration(360).springify().damping(20)}
            style={styles.gridCell}
          >
            <RestaurantCard restaurant={item} />
          </Animated.View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Collapsed title bar */}
      <Animated.View
        style={[
          styles.collapsedHeader,
          { height: COLLAPSED_HEADER_H + insets.top, paddingTop: insets.top },
          collapsedHeaderStyle,
        ]}
        pointerEvents={chipsStuck ? 'auto' : 'none'}
      >
        <View style={[styles.collapsedHeaderInner, { height: COLLAPSED_HEADER_H }]}>
          <View style={styles.collapsedLeft}>
            <View style={styles.eyebrowDot} />
            <Text variant="h3Serif" tone="primary" style={styles.collapsedTitle}>Hidden Gems</Text>
          </View>
          <Pressable
            onPress={() => setSearchOverlayOpen(true)}
            accessibilityLabel="Search restaurants"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.searchIconBtn,
              pressed && styles.pressedOpacity,
            ]}
          >
            <Search size={16} color={color.text.base} strokeWidth={2} />
          </Pressable>
        </View>
      </Animated.View>

      {/* Sticky vibe chips */}
      <Animated.View
        style={[styles.stickyChipsBar, { top: COLLAPSED_HEADER_H + insets.top }, stickyChipsStyle]}
        pointerEvents={chipsStuck ? 'auto' : 'none'}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stickyChipsScroll}
        >
          {VIBES.map((vibe) => (
            <VibeChip key={vibe} vibe={vibe} isActive={activeVibe === vibe} onPress={() => handleToggleVibe(vibe)} />
          ))}
        </ScrollView>
      </Animated.View>

      <SearchOverlay
        visible={searchOverlayOpen}
        query={searchQuery}
        onChangeQuery={setSearchQuery}
        onClose={() => setSearchOverlayOpen(false)}
        insetTop={insets.top}
      />
    </Screen>
  );
}

// ── Styles ──
// Every value here is either a token import or a named constant from the top of the file.

const styles = StyleSheet.create({
  // Hero
  heroBlock: {
    paddingHorizontal: H_PAD,
    paddingTop: space.lg + 4,
    paddingBottom: space.lg - 2,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
    marginBottom: space.lg - 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.xs - 2,
  },
  heroSearchBtn: { padding: space.xs },
  heroSearchActive: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: color.primary.base,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Eyebrow
  eyebrowRow: { flexDirection: 'row', alignItems: 'center' },
  eyebrowDot: { width: 5, height: 5, borderRadius: 99, backgroundColor: color.primary.base, marginRight: 7 },
  eyebrowText: { letterSpacing: 1.4, fontSize: 10 },
  heroTitle: { marginTop: space.xs, lineHeight: 42 },

  // Subtitle
  subtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.sm + 2, gap: SUBTITLE_GAP },
  subtitleRule: { width: 24, height: 1, backgroundColor: color.border },
  subtitleText: { lineHeight: 16 },

  // Inset wrapper
  insetPad: { paddingHorizontal: H_PAD },

  // Chips
  chipsWrapper: { marginBottom: space.md },
  chipsScroll: { gap: CHIP_GAP, paddingBottom: 2 },

  // Toggle
  toggleWrapper: { marginBottom: space.lg - 4 },

  // Map
  mapWrap: { height: MAP_H, marginHorizontal: H_PAD, marginBottom: space.sm + 4, borderRadius: radius.lg, overflow: 'hidden' },

  // Featured card
  featuredWrap: { paddingHorizontal: H_PAD, marginBottom: space.sm },

  // Section labels
  sectionLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: space.md - 4 },
  sectionLabelText: { letterSpacing: 1.4, fontSize: 10, color: color.text.muted },
  sectionLabelLine: { flex: 1, height: 1, backgroundColor: color.border, marginLeft: space.sm + 2 },
  gridHeader: { paddingHorizontal: H_PAD, marginTop: space.md, marginBottom: space.xs },
  gridCount: { marginLeft: space.sm },

  // FlatList
  columnWrap: { gap: CARD_GAP, paddingHorizontal: H_PAD },
  listContent: { gap: CARD_GAP, paddingBottom: LIST_BOTTOM_PAD },
  gridCell: { flex: 1 },

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
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
  },
  collapsedLeft: { flexDirection: 'row', alignItems: 'center' },
  collapsedTitle: { marginLeft: space.sm },
  searchIconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sticky chips
  stickyChipsBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: color.bg,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
    // Custom shadow — not part of the two-token shadow vocabulary (card / pin).
    // This is a thin hairline shadow for the sticky bar only.
    shadowColor: '#1C1C1E',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  stickyChipsScroll: { gap: CHIP_GAP, paddingHorizontal: H_PAD, paddingVertical: 9 },

  // Pressed state utility
  pressedOpacity: { opacity: 0.7 },

  // Error states
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
