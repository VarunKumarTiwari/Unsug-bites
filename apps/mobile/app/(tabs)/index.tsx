import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInUp,
  SlideOutUp,
  useDerivedValue,
  runOnJS,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, List, AlertCircle, RefreshCw, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const hapticImpact = (style = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== 'web') Haptics.impactAsync(style);
};
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen, Text, color, radius, text, spring, duration as motionDuration, easing } from '@unsung/ui';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { FauxMap } from '@/components/map/FauxMap';
import { discovery } from '@/lib/api';
import { useReduceMotion } from '@/hooks/useReduceMotion';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FeedView = 'list' | 'map';

const VIBES = [
  'Cozy', 'Date Night', 'Hidden Gem',
  'Late Night', 'Morning', 'Solo Dining',
  'Casual', 'Local Favorite',
] as const;

const AnimatedFlatList = Animated.FlatList;

// Option A: hero collapses into this bar
const COLLAPSED_HEADER_H = 52;
const HERO_COLLAPSE_START = 80;
const HERO_COLLAPSE_END = 145;

// Option B: chips pin below the collapsed header
// Approximate scroll position where the chip row disappears behind the top edge
const CHIPS_STICKY_START = 185;
const CHIPS_STICKY_END = 210;

// Parallax
const FEATURED_CARD_OFFSET = 340;
const PARALLAX_RANGE = 20;

export default function Home() {
  const [feedView, setFeedView] = useState<FeedView>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVibe, setActiveVibe] = useState<string | null>(null);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [chipsStuck, setChipsStuck] = useState(false);
  // track direction so content slides in from the correct side
  const feedDirection = useRef<1 | -1>(1); // 1 = going right (→map), -1 = going left (→list)
  const contentTranslateX = useSharedValue(0);
  const contentOpacity = useSharedValue(1);
  const scrollY = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();

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
        (r: any) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.neighborhood.toLowerCase().includes(q),
      );
    }
    if (activeVibe) {
      results = results.filter((r: any) => r.vibes.includes(activeVibe));
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
      runOnJS(setChipsStuck)(event.contentOffset.y >= CHIPS_STICKY_END);
    },
  });

  // Hero compress as preamble to the collapse
  const heroStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, HERO_COLLAPSE_START], [1, 0.5], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(scrollY.value, [0, HERO_COLLAPSE_END], [1, 0.92], Extrapolation.CLAMP) },
      { translateY: interpolate(scrollY.value, [0, HERO_COLLAPSE_END], [0, -10], Extrapolation.CLAMP) },
    ],
  }));

  // Option A: Collapsed title bar slides down from above the safe area
  const collapsedHeaderStyle = useAnimatedStyle(() => {
    const p = interpolate(scrollY.value, [HERO_COLLAPSE_START, HERO_COLLAPSE_END], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: p,
      transform: [{ translateY: interpolate(p, [0, 1], [-COLLAPSED_HEADER_H, 0]) }],
    };
  });

  // Option B: Sticky chips strip slides down just after the header lands
  const stickyChipsStyle = useAnimatedStyle(() => {
    const p = interpolate(scrollY.value, [CHIPS_STICKY_START, CHIPS_STICKY_END], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: p,
      transform: [{ translateY: interpolate(p, [0, 1], [-40, 0]) }],
    };
  });

  // Parallax for featured card
  const parallaxOffset = useDerivedValue(() =>
    interpolate(
      scrollY.value,
      [FEATURED_CARD_OFFSET - 100, FEATURED_CARD_OFFSET + 100],
      [PARALLAX_RANGE, -PARALLAX_RANGE],
      Extrapolation.CLAMP,
    ),
  );

  // Animated style for the content area — slides + fades on tab switch
  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateX: contentTranslateX.value }],
  }));

  const handleToggleVibe = useCallback((vibe: string) => {
    setActiveVibe((prev) => (prev === vibe ? null : vibe));
  }, []);

  const handleToggleView = useCallback((view: FeedView) => {
    setFeedView((prev) => {
      if (prev === view) return prev;
      feedDirection.current = view === 'map' ? 1 : -1;

      if (reduceMotion) {
        contentOpacity.value = 1;
        contentTranslateX.value = 0;
        return view;
      }

      // All on UI thread — no setTimeout, no JS bridge dependency
      contentTranslateX.value = withSequence(
        withTiming(feedDirection.current * -24, { duration: 100, easing: easing.in }),
        withTiming(feedDirection.current * 32, { duration: 0 }),
        withSpring(0, spring.snappy),
      );
      contentOpacity.value = withSequence(
        withTiming(0, { duration: 100, easing: easing.in }),
        withDelay(10, withTiming(1, { duration: 180, easing: easing.out })),
      );

      return view;
    });
  }, [reduceMotion]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Screen padded>
        <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: 24, marginBottom: 28 }}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDot} />
            <Text variant="labelStrong" tone="muted" style={styles.eyebrowText}>
              NEARBY
            </Text>
          </View>
          <Text variant="display" tone="primary" style={{ marginTop: 6 }}>
            Hidden Gems
          </Text>
          <Text variant="small" tone="muted" style={{ marginTop: 8 }}>
            looking nearby…
          </Text>
        </Animated.View>
        <MotiView
          from={{ opacity: 0.35 }} animate={{ opacity: 0.7 }}
          transition={{ type: 'timing', duration: 650, loop: true, repeatReverse: true }}
          style={styles.skeletonFeatured}
        >
          <View style={styles.skeletonFeaturedImg} />
          <View style={{ padding: 14, gap: 8 }}>
            <View style={[styles.skeletonLine, { width: '60%' }]} />
            <View style={[styles.skeletonLine, { width: '40%', height: 10 }]} />
          </View>
        </MotiView>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          {[0, 1].map((i) => (
            <MotiView key={i} from={{ opacity: 0.35 }} animate={{ opacity: 0.7 }}
              transition={{ type: 'timing', duration: 650, loop: true, repeatReverse: true, delay: 150 + i * 120 }}
              style={[styles.skeletonCard, { flex: 1 }]}
            >
              <View style={styles.skeletonCardImg} />
              <View style={{ padding: 10, gap: 6 }}>
                <View style={[styles.skeletonLine, { width: '70%' }]} />
                <View style={[styles.skeletonLine, { width: '45%', height: 10 }]} />
              </View>
            </MotiView>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          {[0, 1].map((i) => (
            <MotiView key={i} from={{ opacity: 0.35 }} animate={{ opacity: 0.7 }}
              transition={{ type: 'timing', duration: 650, loop: true, repeatReverse: true, delay: 390 + i * 120 }}
              style={[styles.skeletonCard, { flex: 1 }]}
            >
              <View style={styles.skeletonCardImg} />
              <View style={{ padding: 10, gap: 6 }}>
                <View style={[styles.skeletonLine, { width: '65%' }]} />
                <View style={[styles.skeletonLine, { width: '40%', height: 10 }]} />
              </View>
            </MotiView>
          ))}
        </View>
      </Screen>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <Screen padded>
        <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: 24 }}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDot} />
            <Text variant="labelStrong" tone="muted" style={styles.eyebrowText}>NEARBY</Text>
          </View>
          <Text variant="display" tone="primary" style={{ marginTop: 6 }}>Hidden Gems</Text>
        </Animated.View>
        <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.errorContainer}>
          <View style={styles.errorIconWrap}>
            <AlertCircle size={22} color={color.text.muted} />
          </View>
          <Text variant="h3Serif" tone="muted" style={{ textAlign: 'center', marginTop: 16 }}>
            Couldn't reach nearby spots.
          </Text>
          <Text variant="small" tone="muted" style={{ textAlign: 'center', marginTop: 6, maxWidth: 220 }}>
            Check your connection and try again.
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={({ pressed }) => [styles.retryButton, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
          >
            <RefreshCw size={13} color={color.surface} strokeWidth={2.5} />
            <Text variant="smallStrong" tone="surface" style={{ marginLeft: 7 }}>Try again</Text>
          </Pressable>
        </Animated.View>
      </Screen>
    );
  }

  // ── Feed header ────────────────────────────────────────────────────────────
  const feedHeader = (
    <View>
      {/* Hero */}
      <View style={styles.heroBlock}>
        <Animated.View style={heroStyle}>
          {/* Eyebrow row — dot + label + search icon pinned to the right */}
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
                { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.93 : 1 }] },
              ]}
            >
              {searchQuery.length > 0
                ? <View style={styles.heroSearchActive}><Search size={14} color={color.surface} strokeWidth={2.5} /></View>
                : <Search size={18} color={color.text.muted} strokeWidth={1.8} />
              }
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

      <View style={{ paddingHorizontal: 20 }}>
        {/* Vibe chips — inline version */}
        <Animated.View entering={FadeInDown.delay(210).duration(350)} style={{ marginBottom: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingBottom: 2 }}>
            {VIBES.map((vibe) => (
              <VibeChip key={vibe} vibe={vibe} isActive={activeVibe === vibe} onPress={() => handleToggleVibe(vibe)} />
            ))}
          </ScrollView>
        </Animated.View>

        {/* View toggle */}
        <Animated.View entering={FadeInDown.delay(260).duration(350)} style={{ marginBottom: 20 }}>
          <ViewToggle feedView={feedView} onToggle={handleToggleView} />
        </Animated.View>
      </View>

      {/* Content area — slides + fades when switching tabs */}
      <Animated.View style={contentAnimStyle}>
        {/* Map */}
        {feedView === 'map' && (
          <View style={{ height: 420, marginHorizontal: 20, marginBottom: 12, borderRadius: radius.lg, overflow: 'hidden' }}>
            <FauxMap restaurants={filteredData} />
          </View>
        )}

        {/* Featured card */}
        {feedView === 'list' && featured && (
          <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
            <View style={styles.sectionLabel}>
              <Text variant="labelStrong" style={styles.sectionLabelText}>TOP PICK</Text>
              <View style={styles.sectionLabelLine} />
            </View>
            <RestaurantCard restaurant={featured} layout="row" parallaxOffset={parallaxOffset} />
          </View>
        )}

        {/* Grid section header */}
        {feedView === 'list' && gridData.length > 0 && (
          <View style={[styles.sectionLabel, { paddingHorizontal: 20, marginTop: 16, marginBottom: 4 }]}>
            <Text variant="labelStrong" style={styles.sectionLabelText}>MORE NEARBY</Text>
            <View style={styles.sectionLabelLine} />
            <Text variant="label" tone="muted" style={{ marginLeft: 8 }}>{gridData.length}</Text>
          </View>
        )}

        {/* Empty state */}
        {feedView === 'list' && filteredData.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text variant="h2" tone="muted" style={styles.emptyTitle}>
              {hasFilters ? 'No matches found.' : 'Nothing nearby yet.'}
            </Text>
            <View style={styles.emptyRule} />
            <Text variant="body" tone="muted" style={styles.emptyBody}>
              {hasFilters
              ? 'No spots match your filters. Try clearing one at a time, or search a cuisine or neighborhood.'
              : 'No gems found nearby. Try searching a cuisine, dish, or neighborhood name.'}
            </Text>
            {hasFilters && (
              <Pressable
                onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setSearchQuery(''); setActiveVibe(null); }}
                style={({ pressed }) => [styles.clearButton, { opacity: pressed ? 0.8 : 1 }]}
              >
                <Text variant="smallStrong" tone="base">Clear filters</Text>
              </Pressable>
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <Screen padded={false}>
      <AnimatedFlatList
        data={feedView === 'list' ? gridData : []}
        keyExtractor={(r: any) => r.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 48 }}
        ListHeaderComponent={feedHeader}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        renderItem={({ item, index }: { item: any; index: number }) => (
          <Animated.View
            entering={FadeInDown.delay(Math.min(50 * index, 200)).duration(360).springify().damping(20)}
            style={{ flex: 1 }}
          >
            <RestaurantCard restaurant={item} />
          </Animated.View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* ── Option A: Collapsed title bar ────────────────────────────────────
           The full hero compresses into this 52px bar. It slides in from above
           once the hero has scrolled ~80px, fully landing by ~145px.
           Left: accent dot + compact serif title.
           Right: search icon → opens full-screen overlay.
      ─────────────────────────────────────────────────────────────────────── */}
      <Animated.View
        style={[styles.collapsedHeader, { top: 0 }, collapsedHeaderStyle]}
        pointerEvents={chipsStuck ? 'auto' : 'none'}
      >
        <View style={styles.collapsedHeaderInner}>
          <View style={styles.collapsedLeft}>
            <View style={styles.eyebrowDot} />
            <Text variant="h3Serif" tone="primary" style={{ marginLeft: 8 }}>
              Hidden Gems
            </Text>
          </View>
          <Pressable
            onPress={() => setSearchOverlayOpen(true)}
            accessibilityLabel="Search restaurants"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.searchIconBtn,
              { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.93 : 1 }] },
            ]}
          >
            <Search size={16} color={color.text.base} strokeWidth={2} />
          </Pressable>
        </View>
      </Animated.View>

      {/* ── Option B: Sticky vibe chips ──────────────────────────────────────
           Arrives just after the header, pinning at insets.top + COLLAPSED_HEADER_H.
           Acts as the persistent filter layer — chips are always reachable once
           the user has scrolled into the card grid.
      ─────────────────────────────────────────────────────────────────────── */}
      <Animated.View
        style={[styles.stickyChipsBar, { top: COLLAPSED_HEADER_H }, stickyChipsStyle]}
        pointerEvents={chipsStuck ? 'auto' : 'none'}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 7, paddingHorizontal: 20, paddingVertical: 9 }}
        >
          {VIBES.map((vibe) => (
            <VibeChip key={vibe} vibe={vibe} isActive={activeVibe === vibe} onPress={() => handleToggleVibe(vibe)} />
          ))}
        </ScrollView>
      </Animated.View>

      {/* ── Search overlay ───────────────────────────────────────────────────
           Opens when the search icon in the collapsed header is tapped.
           Slides in a panel from the top, auto-focuses the input.
           Dismissible by tapping the dimmed backdrop or "Cancel".
      ─────────────────────────────────────────────────────────────────────── */}
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

// ── SearchOverlay ────────────────────────────────────────────────────────────
// Rendered as an absolute-positioned View directly inside the Screen tree —
// no Modal, no web rendering quirks. Only mounted when visible=true so the
// TextInput never exists in the tree (and can't steal focus) while closed.

function SearchOverlay({
  visible,
  query,
  onChangeQuery,
  onClose,
  insetTop,
}: {
  visible: boolean;
  query: string;
  onChangeQuery: (q: string) => void;
  onClose: () => void;
  insetTop: number;
}) {
  const inputRef = useRef<TextInput>(null);
  const backdropOpacity = useSharedValue(visible ? 1 : 0);
  const backdropAnimStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));

  React.useEffect(() => {
    backdropOpacity.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 180 : 140,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
    });
  }, [visible]);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { zIndex: 99 }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {/* Dimmed backdrop — animates in/out */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.overlayBackdrop, backdropAnimStyle]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} accessibilityLabel="Close search" />
      </Animated.View>

      {/* Panel — slides down from top */}
      {visible && (
        <Animated.View
          entering={SlideInUp.duration(280).springify().damping(22).stiffness(200)}
          exiting={SlideOutUp.duration(220).easing(Easing.in(Easing.cubic))}
          style={[styles.overlayPanel, { paddingTop: insetTop + 12 }]}
        >
          <View style={styles.overlaySearchRow}>
            <Search size={15} color={color.text.muted} strokeWidth={2} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={onChangeQuery}
              placeholder="Search dishes, cuisines, or neighborhoods"
              placeholderTextColor={color.text.subtle}
              accessibilityLabel="Search restaurants by dish, cuisine, or neighborhood"
              autoFocus
              style={styles.overlayInput}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityLabel="Cancel search"
              accessibilityRole="button"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, paddingLeft: 10 })}
            >
              <Text variant="smallStrong" tone="base">Cancel</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function VibeChip({ vibe, isActive, onPress }: { vibe: string; isActive: boolean; onPress: () => void }) {
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

const TOGGLE_BTN_W = 80;
const TOGGLE_BTN_H = 44;

function ViewToggle({ feedView, onToggle }: { feedView: FeedView; onToggle: (v: FeedView) => void }) {
  const pillX = useSharedValue(feedView === 'list' ? 0 : TOGGLE_BTN_W);
  // icon scale sharedValues — pop the active icon on switch
  const listIconScale = useSharedValue(1);
  const mapIconScale = useSharedValue(1);

  // withTiming belongs at the assignment site, not inside useAnimatedStyle
  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  const listIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: listIconScale.value }] }));
  const mapIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: mapIconScale.value }] }));

  const handlePress = (view: FeedView) => {
    pillX.value = withSpring(view === 'list' ? 0 : TOGGLE_BTN_W, spring.snappy);
    const targetScale = view === 'list' ? listIconScale : mapIconScale;
    targetScale.value = withSequence(
      withTiming(0.6, { duration: motionDuration.micro, easing: easing.in }),
      withSpring(1, spring.bouncy),
    );
    hapticImpact();
    onToggle(view);
  };

  React.useEffect(() => {
    pillX.value = withSpring(feedView === 'list' ? 0 : TOGGLE_BTN_W, spring.snappy);
  }, [feedView]);

  return (
    <View style={styles.toggleContainer}>
      {/* Sliding pill background */}
      <Animated.View style={[styles.togglePill, pillStyle]} />
      <ToggleButton
        active={feedView === 'list'}
        onPress={() => handlePress('list')}
        iconAnimStyle={listIconStyle}
        icon={<List size={13} color={feedView === 'list' ? color.surface : color.text.muted} strokeWidth={2} />}
        label="List"
      />
      <ToggleButton
        active={feedView === 'map'}
        onPress={() => handlePress('map')}
        iconAnimStyle={mapIconStyle}
        icon={<MapPin size={13} color={feedView === 'map' ? color.surface : color.text.muted} strokeWidth={2} />}
        label="Map"
      />
    </View>
  );
}

function ToggleButton({
  active, onPress, icon, label, iconAnimStyle,
}: { active: boolean; onPress: () => void; icon: React.ReactNode; label: string; iconAnimStyle?: any }) {
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
      style={{ width: TOGGLE_BTN_W, height: TOGGLE_BTN_H }}
    >
      <Animated.View style={[pressStyle, { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill }]}>
        {/* Icon wrapped in its own animated view for the pop-on-activate effect */}
        <Animated.View style={iconAnimStyle}>
          {icon}
        </Animated.View>
        <Text variant="smallStrong" tone={active ? 'surface' : 'muted'} style={{ marginLeft: 6 }}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Hero
  heroBlock: {
    paddingHorizontal: 20, paddingTop: 28, paddingBottom: 22,
    borderBottomWidth: 1, borderBottomColor: color.border, marginBottom: 20,
  },
  // Hero top row — eyebrow left, search icon right
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  heroSearchBtn: { padding: 4 },
  // Filled circle indicator when a search query is active
  heroSearchActive: {
    width: 28, height: 28, borderRadius: radius.pill,
    backgroundColor: color.primary.base, alignItems: 'center', justifyContent: 'center',
  },

  eyebrowRow: { flexDirection: 'row', alignItems: 'center' },
  eyebrowDot: { width: 5, height: 5, borderRadius: 99, backgroundColor: color.primary.base, marginRight: 7 },
  eyebrowText: { letterSpacing: 1.4, fontSize: 10 },
  heroTitle: { marginTop: 4, lineHeight: 42 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 },
  subtitleRule: { width: 24, height: 1, backgroundColor: color.border },
  subtitleText: { lineHeight: 16 },

  // Option A: Collapsed title bar
  collapsedHeader: {
    position: 'absolute', left: 0, right: 0,
    height: COLLAPSED_HEADER_H,
    backgroundColor: color.bg,
    borderBottomWidth: 1, borderBottomColor: color.border,
  },
  collapsedHeaderInner: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, height: '100%',
  },
  collapsedLeft: { flexDirection: 'row', alignItems: 'center' },
  searchIconBtn: {
    width: 36, height: 36,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceMuted,
    alignItems: 'center', justifyContent: 'center',
  },

  // Option B: Sticky vibe chips
  stickyChipsBar: {
    position: 'absolute', left: 0, right: 0,
    backgroundColor: color.bg,
    borderBottomWidth: 1, borderBottomColor: color.border,
    shadowColor: '#1C1C1E', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },

  // View toggle
  toggleContainer: {
    flexDirection: 'row', backgroundColor: color.surfaceMuted,
    borderRadius: radius.pill, padding: 3, alignSelf: 'flex-start',
    position: 'relative',
  },
  togglePill: {
    position: 'absolute',
    top: 3, left: 3,
    width: TOGGLE_BTN_W, height: TOGGLE_BTN_H,
    borderRadius: radius.pill,
    backgroundColor: color.text.base,
  },

  // Section labels
  sectionLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionLabelText: { letterSpacing: 1.4, fontSize: 10, color: color.text.muted },
  sectionLabelLine: { flex: 1, height: 1, backgroundColor: color.border, marginLeft: 10 },

  // Error
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 64 },
  errorIconWrap: {
    width: 52, height: 52, borderRadius: radius.pill,
    backgroundColor: color.surfaceMuted, alignItems: 'center', justifyContent: 'center',
  },
  retryButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: color.text.base, borderRadius: radius.pill,
    paddingVertical: 12, paddingHorizontal: 22, marginTop: 24,
  },

  // Empty state
  emptyContainer: { alignItems: 'center', paddingTop: 56, paddingHorizontal: 32, paddingBottom: 32 },
  emptyTitle: { textAlign: 'center' },
  emptyRule: { width: 32, height: 1, backgroundColor: color.border, marginTop: 14, marginBottom: 14 },
  emptyBody: { textAlign: 'center', maxWidth: 240, lineHeight: 22 },
  clearButton: {
    marginTop: 20, borderRadius: radius.pill,
    paddingVertical: 10, paddingHorizontal: 20,
    borderWidth: 1, borderColor: color.border,
  },

  // Skeleton
  skeletonFeatured: { backgroundColor: color.surfaceMuted, borderRadius: radius.lg, overflow: 'hidden' },
  skeletonFeaturedImg: { width: '100%', aspectRatio: 16 / 9, backgroundColor: color.text.subtle, opacity: 0.12 },
  skeletonCard: { backgroundColor: color.surfaceMuted, borderRadius: radius.md, overflow: 'hidden' },
  skeletonCardImg: { width: '100%', aspectRatio: 4 / 3, backgroundColor: color.text.subtle, opacity: 0.12 },
  skeletonLine: { height: 13, backgroundColor: color.text.subtle, borderRadius: radius.sm, opacity: 0.18 },

  // Search overlay
  overlayBackdrop: {
    backgroundColor: 'rgba(28,28,30,0.45)',
  },
  overlayPanel: {
    backgroundColor: color.bg,
    borderBottomWidth: 1, borderBottomColor: color.border,
    paddingHorizontal: 20, paddingBottom: 14,
    shadowColor: '#1C1C1E', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
  },
  overlaySearchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 16, height: 48,
    borderWidth: 1, borderColor: color.border,
  },
  overlayInput: {
    flex: 1, marginLeft: 10,
    color: color.text.base,
    fontSize: text.body.size, fontFamily: text.body.family,
  },
});
