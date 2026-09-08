import React, { useState } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Check, MapPin } from 'lucide-react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text, Button, color, radius, space } from '@unsung/ui';
import type { ScanResult } from '@unsung/contracts';
import { StarRating } from '@/components/review/StarRating';
import { VibeChip } from '@/components/feed/VibeChip';
import { useScanSession } from '@/lib/store/scanSession';
import { useReduceMotion } from '@/hooks/useReduceMotion';

const CUISINES = ['Italian', 'Japanese', 'Mexican', 'Indian', 'French', 'Thai', 'American', 'Other'];
const PORTIONS = ['Small', 'Just Right', 'Generous'];
const OCCASIONS = ['Solo', 'Date', 'Friends', 'Business'];

function hapticImpact(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(style);
  }
}

export default function ScanResult() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const { result, nutrition: nut, photoUri } = useScanSession();

  const [showReview, setShowReview] = useState(false);

  // Form state
  const [restaurant, setRestaurant] = useState('');
  const [location, setLocation] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [overall, setOverall] = useState(0);
  const [taste, setTaste] = useState(0);
  const [presentation, setPresentation] = useState(0);
  const [portion, setPortion] = useState('');
  const [orderAgain, setOrderAgain] = useState<boolean | null>(null);
  const [occasion, setOccasion] = useState('');
  const [notes, setNotes] = useState('');

  // Session missing (e.g. deep-link / reload) — bail back to camera.
  if (!result || !nut) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text variant="body" tone="muted">No scan to show.</Text>
        <Button label="Back to camera" onPress={() => router.replace('/(tabs)/scan')} style={{ marginTop: space.md }} />
      </View>
    );
  }

  function revealReview() {
    hapticImpact(Haptics.ImpactFeedbackStyle.Medium);
    setShowReview(true);
  }

  function saveReview() {
    hapticImpact(Haptics.ImpactFeedbackStyle.Medium);
    // ponytail: mock submit — wire to reviews.submit when the review payload is finalized
    router.back();
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: space.xl }}
        >
          {/* Header photo band — modest, in-flow (not full-bleed, not a thumbnail) */}
          <View style={styles.photoBand}>
            <Image source={{ uri: photoUri ?? undefined }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <Pressable
              onPress={() => { hapticImpact(); router.back(); }}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={[styles.closeBtn, { top: insets.top + 12 }]}
            >
              <X size={20} color={color.surface} />
            </Pressable>
          </View>

          <View style={styles.body}>
            {/* Dish + confidence */}
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowDot} />
              <Text variant="labelStrong" tone="muted" style={styles.eyebrowText}>AI DETECTED</Text>
            </View>
            <Text variant="display" tone="base" style={styles.title}>{result.detectedDish}</Text>
            <View style={styles.confidenceRow}>
              <View style={styles.confidenceCheck}>
                <Check size={10} color={color.success.base} strokeWidth={3} />
              </View>
              <Text variant="smallStrong" tone="success">
                {Math.round(result.confidence * 100)}% confidence
              </Text>
            </View>

            {/* Ingredients */}
            <SectionLabel>KEY INGREDIENTS</SectionLabel>
            <Text variant="body" style={styles.ingredients}>{result.ingredients.join(' · ')}</Text>

            {/* Nutrition */}
            <SectionLabel trailing={<SourceBadge source={result.source} coverage={result.coverage} />}>
              NUTRITION
            </SectionLabel>
            <View style={styles.nutRow}>
              <NutChip label="CALORIES" value={`${result.nutrition.calories}`} />
              <NutChip label="PROTEIN" value={`${result.nutrition.protein_g}g`} />
              <NutChip label="CARBS" value={`${result.nutrition.carbs_g}g`} />
            </View>

            {/* Gated review form */}
            {showReview && (
              <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(240)}>
                <SectionLabel>RESTAURANT</SectionLabel>
                <TextInput
                  value={restaurant}
                  onChangeText={setRestaurant}
                  placeholder="Restaurant Name"
                  placeholderTextColor={color.text.subtle}
                  style={styles.formInput}
                />
                <View style={styles.locationRow}>
                  <MapPin size={16} color={color.text.subtle} />
                  <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Location"
                    placeholderTextColor={color.text.subtle}
                    style={[styles.formInput, { flex: 1, marginBottom: 0 }]}
                  />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {CUISINES.map((c) => (
                    <VibeChip key={c} vibe={c} isActive={cuisine === c} onPress={() => setCuisine(c)} />
                  ))}
                </ScrollView>

                <SectionLabel>RATING</SectionLabel>
                <StarRating label="Overall" value={overall} onChange={setOverall} size={32} />
                <StarRating label="Taste" value={taste} onChange={setTaste} size={24} />
                <StarRating label="Presentation" value={presentation} onChange={setPresentation} size={24} />

                <SectionLabel>DETAILS</SectionLabel>
                <View style={styles.chipRowWrap}>
                  {PORTIONS.map((p) => (
                    <VibeChip key={p} vibe={p} isActive={portion === p} onPress={() => setPortion(p)} />
                  ))}
                </View>

                <SectionLabel>ORDER AGAIN?</SectionLabel>
                <View style={styles.chipRowWrap}>
                  <VibeChip vibe="Yes" isActive={orderAgain === true} onPress={() => setOrderAgain(true)} />
                  <VibeChip vibe="No" isActive={orderAgain === false} onPress={() => setOrderAgain(false)} />
                </View>

                <SectionLabel>OCCASION</SectionLabel>
                <View style={styles.chipRowWrap}>
                  {OCCASIONS.map((o) => (
                    <VibeChip key={o} vibe={o} isActive={occasion === o} onPress={() => setOccasion(o)} />
                  ))}
                </View>

                <SectionLabel>NOTES</SectionLabel>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Any thoughts..."
                  placeholderTextColor={color.text.subtle}
                  multiline
                  style={styles.formTextArea}
                />
              </Animated.View>
            )}
          </View>
        </ScrollView>

        {/* Sticky footer — always visible, safe-area padded */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + space.sm }]}>
          {showReview ? (
            <Button label="Save Review" onPress={saveReview} />
          ) : (
            <Button label="Add Your Review" onPress={revealReview} />
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function SectionLabel({ children, trailing }: { children: React.ReactNode; trailing?: React.ReactNode }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Text variant="labelStrong" style={styles.sectionLabelText}>{children}</Text>
      <View style={styles.sectionLabelLine} />
      {trailing}
    </View>
  );
}

function SourceBadge({ source, coverage }: { source: ScanResult['source']; coverage: ScanResult['coverage'] }) {
  const verified = source === 'usda';
  return (
    <View style={[styles.badge, verified ? styles.badgeVerified : styles.badgeEstimated]}>
      {verified ? (
        <Check size={11} color={color.success.base} strokeWidth={3} />
      ) : (
        <Text variant="smallStrong" tone="muted" style={styles.badgeTilde}>~</Text>
      )}
      <Text variant="labelStrong" tone={verified ? 'success' : 'muted'} style={styles.badgeText}>
        {verified ? 'Verified' : 'Estimated'}
      </Text>
      {!verified && coverage.matched < coverage.total && (
        <Text variant="labelStrong" tone="muted" style={styles.badgeCoverage}>
          {coverage.matched}/{coverage.total}
        </Text>
      )}
    </View>
  );
}

function NutChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.nutChip}>
      <Text variant="labelStrong" tone="success" style={styles.nutLabel}>{label}</Text>
      <Text variant="h3Serif" tone="base" style={styles.nutValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.surface },
  center: { alignItems: 'center', justifyContent: 'center', padding: space.lg },

  // Header photo band — fixed modest height, scrolls away with content
  photoBand: {
    height: 260,
    backgroundColor: color.surfaceMuted,
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  body: { paddingHorizontal: 20, paddingTop: space.lg },

  eyebrowRow: { flexDirection: 'row', alignItems: 'center' },
  eyebrowDot: { width: 5, height: 5, borderRadius: 99, backgroundColor: color.primary.base, marginRight: 7 },
  eyebrowText: { letterSpacing: 1.6, fontSize: 10 },

  title: { marginTop: space.xs, lineHeight: 38 },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.xs + 2, gap: 6 },
  confidenceCheck: {
    width: 16,
    height: 16,
    borderRadius: 99,
    backgroundColor: color.success.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.md + 2, marginBottom: space.sm },
  sectionLabelText: { letterSpacing: 1.4, fontSize: 10, color: color.text.muted },
  sectionLabelLine: { flex: 1, height: 1, backgroundColor: color.border, marginLeft: space.sm + 2 },

  // Verified / Estimated source badge — chip beside the Nutrition header
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: space.sm + 2,
    paddingVertical: 3,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
  },
  badgeVerified: { backgroundColor: color.success.soft },
  badgeEstimated: { backgroundColor: color.surfaceMuted },
  badgeTilde: { fontSize: 12, lineHeight: 12 },
  badgeText: { letterSpacing: 0.6, fontSize: 10 },
  badgeCoverage: { letterSpacing: 0.4, fontSize: 10, opacity: 0.7 },

  ingredients: { lineHeight: 22 },

  nutRow: { flexDirection: 'row', gap: space.sm + 2 },
  nutChip: {
    flex: 1,
    backgroundColor: color.success.soft,
    borderRadius: radius.md,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.sm + 4,
  },
  nutLabel: { letterSpacing: 1.2, fontSize: 10 },
  nutValue: { marginTop: 4 },

  formInput: {
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.md,
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    fontSize: 15,
    color: color.text.base,
    marginBottom: space.lg,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginBottom: space.sm },
  formTextArea: {
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.sm,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.sm + 4,
    fontSize: 15,
    color: color.text.base,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipRow: { flexDirection: 'row', gap: space.sm, marginTop: space.xs },
  chipRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.xs },

  // Sticky footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: space.sm,
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
});
