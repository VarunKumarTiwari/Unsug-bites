import React, { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera as CameraIcon, ChevronLeft, X, Check } from 'lucide-react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text, Button, color, radius, space, spring } from '@unsung/ui';
import { Vignette } from '@/components/camera/Vignette';
import { HolographicBrackets } from '@/components/camera/HolographicBrackets';
import { scan, nutrition } from '@/lib/api';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import type { ScanResult, NutritionFact } from '@unsung/contracts';

type Phase = 'preview' | 'scanning' | 'result';

// ── Layout constants ──
const SHUTTER_SIZE = 76;
const SHUTTER_RING_WIDTH = 4;
const TOP_BAR_TOP = 56;
const BOTTOM_OFFSET = 48;
const ROUND_BTN = 40;

function hapticImpact(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(style);
  }
}

export default function Scan() {
  const router = useRouter();
  const reduceMotion = useReduceMotion();
  const [phase, setPhase] = useState<Phase>('preview');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [nut, setNut] = useState<NutritionFact | null>(null);

  // Shutter ring pulse
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.55);
  const shutterPress = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion || phase !== 'preview') {
      ringScale.value = 1;
      ringOpacity.value = 0.55;
      return;
    }
    ringScale.value = withRepeat(
      withTiming(1.18, { duration: 1400, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true,
    );
    ringOpacity.value = withRepeat(
      withTiming(0.15, { duration: 1400, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true,
    );
  }, [reduceMotion, phase, ringScale, ringOpacity]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const shutterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shutterPress.value }],
  }));

  async function capture() {
    hapticImpact(Haptics.ImpactFeedbackStyle.Medium);
    shutterPress.value = withSequence(
      withSpring(0.92, { duration: 90 }),
      withSpring(1, spring.snappy),
    );
    setPhase('scanning');
    const r = await scan.submitScan('mock://carbonara');
    const n = await nutrition.getNutrition(r.suggestedNutritionLookupKey ?? '');
    setResult(r);
    setNut(n);
    hapticImpact(Haptics.ImpactFeedbackStyle.Light);
    setPhase('result');
  }

  function reset() {
    hapticImpact();
    setResult(null);
    setNut(null);
    setPhase('preview');
  }

  return (
    <View style={styles.root}>
      {/* Mock camera viewfinder — real expo-camera mounts here. */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=1600' }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <Vignette />

      {phase !== 'result' && <HolographicBrackets />}

      {/* Top bar */}
      <View style={styles.topBar}>
        <RoundIcon onPress={() => { hapticImpact(); router.back(); }}>
          <ChevronLeft size={20} color={color.surface} />
        </RoundIcon>
        {phase === 'result' && (
          <RoundIcon onPress={reset}>
            <X size={20} color={color.surface} />
          </RoundIcon>
        )}
      </View>

      {/* Preview phase */}
      {phase === 'preview' && (
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(300)}
          style={styles.previewBottom}
        >
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDotLight} />
            <Text variant="labelStrong" tone="surface" style={styles.eyebrowText}>CENTER THE DISH</Text>
          </View>

          <View style={styles.shutterWrap}>
            <Animated.View style={[styles.shutterRing, ringStyle]} pointerEvents="none" />
            <Animated.View style={shutterStyle}>
              <Pressable
                onPress={capture}
                accessibilityRole="button"
                accessibilityLabel="Capture dish"
                style={({ pressed }) => [
                  styles.shutter,
                  pressed && { opacity: 0.95 },
                ]}
              >
                <CameraIcon size={28} color={color.text.base} />
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      )}

      {/* Scanning phase */}
      {phase === 'scanning' && (
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(220)}
          style={styles.scanningBottom}
        >
          <ShimmerSweep reduceMotion={reduceMotion} />
          <View style={styles.scanningCaptionRow}>
            <PulsingDot reduceMotion={reduceMotion} />
            <Text variant="bodyMedium" tone="surface" style={styles.scanningCaption}>
              Reading the plate…
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Result sheet */}
      {phase === 'result' && result && nut && (
        <ResultSheet
          result={result}
          nutrition={nut}
          reduceMotion={reduceMotion}
          onSubmit={() => {
            hapticImpact(Haptics.ImpactFeedbackStyle.Medium);
            router.push(`/achievement/b_carbonara`);
          }}
        />
      )}
    </View>
  );
}

// ── Round top-bar icon ──
function RoundIcon({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.roundIcon,
        pressed && { opacity: 0.75 },
      ]}
    >
      {children}
    </Pressable>
  );
}

// ── Editorial shimmer sweep (replaces flat translucent box) ──
function ShimmerSweep({ reduceMotion }: { reduceMotion: boolean }) {
  const x = useSharedValue(-1);
  useEffect(() => {
    if (reduceMotion) return;
    x.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.cubic) }), -1, false);
  }, [reduceMotion, x]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * 240 }],
  }));

  return (
    <View style={styles.shimmer}>
      <Animated.View style={[styles.shimmerSweep, sweepStyle]} />
    </View>
  );
}

function PulsingDot({ reduceMotion }: { reduceMotion: boolean }) {
  const o = useSharedValue(0.4);
  useEffect(() => {
    if (reduceMotion) return;
    o.value = withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.cubic) }), -1, true);
  }, [reduceMotion, o]);
  const s = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[styles.pulseDot, s]} />;
}

// ── Result sheet ──
function ResultSheet({
  result,
  nutrition,
  reduceMotion,
  onSubmit,
}: {
  result: ScanResult;
  nutrition: NutritionFact;
  reduceMotion: boolean;
  onSubmit: () => void;
}) {
  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInUp.duration(420).springify().damping(20)}
      style={styles.sheet}
    >
      <View style={styles.sheetHandle} />

      <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(80).duration(320)}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowDot} />
          <Text variant="labelStrong" tone="muted" style={styles.eyebrowText}>AI DETECTED</Text>
        </View>
        <Text variant="display" tone="base" style={styles.sheetTitle}>
          {result.detectedDish}
        </Text>
        <View style={styles.confidenceRow}>
          <View style={styles.confidenceCheck}>
            <Check size={10} color={color.success.base} strokeWidth={3} />
          </View>
          <Text variant="smallStrong" tone="success">
            {Math.round(result.confidence * 100)}% confidence
          </Text>
        </View>
      </Animated.View>

      <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(160).duration(320)}>
        <View style={styles.sectionLabelRow}>
          <Text variant="labelStrong" style={styles.sectionLabelText}>KEY INGREDIENTS</Text>
          <View style={styles.sectionLabelLine} />
        </View>
        <Text variant="body" style={styles.ingredients}>
          {result.ingredients.join(' · ')}
        </Text>
      </Animated.View>

      <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(220).duration(320)}>
        <View style={styles.sectionLabelRow}>
          <Text variant="labelStrong" style={styles.sectionLabelText}>NUTRITION</Text>
          <View style={styles.sectionLabelLine} />
        </View>
        <View style={styles.nutRow}>
          <NutChip label="Calories" value={`${nutrition.calories}`} />
          <NutChip label="Protein" value={`${nutrition.protein_g}g`} />
          <NutChip label="Carbs" value={`${nutrition.carbs_g}g`} />
        </View>
      </Animated.View>

      <Animated.View entering={reduceMotion ? undefined : FadeInDown.delay(290).duration(320)}>
        <Button label="Log & Submit Review" onPress={onSubmit} style={styles.submitBtn} />
      </Animated.View>
    </Animated.View>
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

// ── Styles ──
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0B0C' },

  // Top bar
  topBar: {
    position: 'absolute',
    top: TOP_BAR_TOP,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundIcon: {
    width: ROUND_BTN,
    height: ROUND_BTN,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  // Eyebrow (light variant for camera overlay)
  eyebrowRow: { flexDirection: 'row', alignItems: 'center' },
  eyebrowDot: { width: 5, height: 5, borderRadius: 99, backgroundColor: color.primary.base, marginRight: 7 },
  eyebrowDotLight: { width: 5, height: 5, borderRadius: 99, backgroundColor: color.surface, marginRight: 7 },
  eyebrowText: { letterSpacing: 1.6, fontSize: 10 },

  // Preview
  previewBottom: {
    position: 'absolute',
    bottom: BOTTOM_OFFSET,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shutterWrap: {
    marginTop: space.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: SHUTTER_SIZE + 40,
    height: SHUTTER_SIZE + 40,
  },
  shutterRing: {
    position: 'absolute',
    width: SHUTTER_SIZE + 28,
    height: SHUTTER_SIZE + 28,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: color.surface,
  },
  shutter: {
    width: SHUTTER_SIZE,
    height: SHUTTER_SIZE,
    borderRadius: 999,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: SHUTTER_RING_WIDTH,
    borderColor: 'rgba(255,255,255,0.4)',
  },

  // Scanning
  scanningBottom: {
    position: 'absolute',
    bottom: BOTTOM_OFFSET + 16,
    left: space.lg,
    right: space.lg,
    alignItems: 'center',
  },
  shimmer: {
    height: 56,
    borderRadius: radius.md,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  shimmerSweep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: 'rgba(255,255,255,0.22)',
    transform: [{ skewX: '-18deg' }],
  },
  scanningCaptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.md,
    gap: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: color.surface,
  },
  scanningCaption: { letterSpacing: 0.3 },

  // Result sheet
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.surfaceMuted,
    alignSelf: 'center',
    marginBottom: space.md,
  },
  sheetTitle: { marginTop: space.xs, lineHeight: 38 },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.xs + 2,
    gap: 6,
  },
  confidenceCheck: {
    width: 16,
    height: 16,
    borderRadius: 99,
    backgroundColor: color.success.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section labels
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.md + 2, marginBottom: space.sm },
  sectionLabelText: { letterSpacing: 1.4, fontSize: 10, color: color.text.muted },
  sectionLabelLine: { flex: 1, height: 1, backgroundColor: color.border, marginLeft: space.sm + 2 },

  ingredients: { lineHeight: 22 },

  // Nutrition row
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

  submitBtn: { marginTop: space.lg },
});
