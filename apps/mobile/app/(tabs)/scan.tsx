 import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Camera as CameraIcon, ChevronLeft, X, Check, ChevronRight } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  FadeIn,
  FadeInUp,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text, color, radius, space, spring } from '@unsung/ui';
import { Vignette } from '@/components/camera/Vignette';
import { HolographicBrackets } from '@/components/camera/HolographicBrackets';
import { scan, nutrition } from '@/lib/api';
import { useScanSession } from '@/lib/store/scanSession';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import type { ScanResult } from '@unsung/contracts';

type Phase = 'preview' | 'scanning' | 'result';

// Mock camera viewfinder image — real expo-camera frame + captured photo replace this.
const MOCK_PHOTO = 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=1600';

// ── Layout constants ──
const NAV_CLEARANCE = 74; // lift bottom controls clear of the floating pill nav
const SHUTTER_SIZE = 76;
const SHUTTER_RING_WIDTH = 4;
const ROUND_BTN = 40;

function hapticImpact(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(style);
  }
}

export default function Scan() {
  const router = useRouter();
  const reduceMotion = useReduceMotion();
  const insets = useSafeAreaInsets();
  const setSession = useScanSession((s) => s.set);
  const [phase, setPhase] = useState<Phase>('preview');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [focused, setFocused] = useState(false);
  // Only stream while this tab is focused so the camera releases when navigating away.
  const canUseCamera = !!permission?.granted && focused;

  // Reset to a fresh camera every time the tab regains focus (e.g. after
  // backing out of the result route) so re-scanning always starts clean.
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => {
        setFocused(false);
        setPhase('preview');
        setResult(null);
      };
    }, []),
  );

  // Ask for camera access once the screen mounts.
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

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
    // Grab the real frame when the camera is live; otherwise use the mock viewfinder image.
    let photoUri = MOCK_PHOTO;
    if (canUseCamera && cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo?.uri) photoUri = photo.uri;
      } catch {
        // Capture failed — fall back to the mock frame so the flow still completes.
      }
    }
    const r = await scan.submitScan(photoUri);
    const n = await nutrition.getNutrition(r.suggestedNutritionLookupKey ?? '');
    setResult(r);
    setSession({ result: r, nutrition: n, photoUri });
    hapticImpact(Haptics.ImpactFeedbackStyle.Light);
    setPhase('result');
  }

  function reset() {
    hapticImpact();
    setResult(null);
    setPhase('preview');
  }

  function openDetail() {
    hapticImpact(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/scan-result');
  }

  return (
    <View style={styles.root}>
      {/* Live camera when granted; static frame on web / before permission. */}
      {canUseCamera && phase !== 'result' ? (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <Image source={{ uri: MOCK_PHOTO }} style={StyleSheet.absoluteFill} contentFit="cover" />
      )}
      <Vignette />

      {phase !== 'result' && <HolographicBrackets />}

      {/* Top bar */}
      <View style={[styles.topBar, { top: insets.top + 12 }]}>
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
          style={[styles.previewBottom, { bottom: insets.bottom + 16 + NAV_CLEARANCE }]}
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
          style={[styles.scanningBottom, { bottom: insets.bottom + 16 + NAV_CLEARANCE }]}
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

      {/* Result phase — compact card, tap to open the full detail page */}
      {phase === 'result' && result && (
        <Animated.View
          entering={reduceMotion ? undefined : FadeInUp.duration(320)}
          style={[styles.resultCardWrap, { bottom: insets.bottom + 16 + NAV_CLEARANCE }]}
        >
          <Pressable
            onPress={openDetail}
            accessibilityRole="button"
            accessibilityLabel={`${result.detectedDish}, ${Math.round(result.confidence * 100)} percent confidence. Open details.`}
            style={({ pressed }) => [styles.resultCard, pressed && { opacity: 0.9 }]}
          >
            <Image source={{ uri: MOCK_PHOTO }} style={styles.resultThumb} contentFit="cover" />
            <View style={styles.resultCardBody}>
              <View style={styles.eyebrowRow}>
                <View style={styles.eyebrowDot} />
                <Text variant="labelStrong" tone="muted" style={styles.eyebrowText}>AI DETECTED</Text>
              </View>
              <Text variant="h3Serif" tone="base" numberOfLines={1} style={styles.resultTitle}>
                {result.detectedDish}
              </Text>
              <View style={styles.confidenceRow}>
                <View style={styles.confidenceCheck}>
                  <Check size={9} color={color.success.base} strokeWidth={3} />
                </View>
                <Text variant="smallStrong" tone="success">
                  {Math.round(result.confidence * 100)}% confidence
                </Text>
              </View>
            </View>
            <ChevronRight size={22} color={color.text.subtle} />
          </Pressable>
        </Animated.View>
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

// ── Editorial shimmer sweep ──
function ShimmerSweep({ reduceMotion }: { reduceMotion: boolean }) {
  const x = useSharedValue(-1);
  const [shimmerWidth, setShimmerWidth] = React.useState(240);

  useEffect(() => {
    if (reduceMotion) return;
    x.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.cubic) }), -1, false);
  }, [reduceMotion, x]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * shimmerWidth }],
  }));

  return (
    <View
      style={styles.shimmer}
      onLayout={(e) => setShimmerWidth(e.nativeEvent.layout.width)}
    >
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

// ── Styles ──
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0B0C' },

  // Top bar
  topBar: {
    position: 'absolute',
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

  // Eyebrow
  eyebrowRow: { flexDirection: 'row', alignItems: 'center' },
  eyebrowDot: { width: 5, height: 5, borderRadius: 99, backgroundColor: color.primary.base, marginRight: 7 },
  eyebrowDotLight: { width: 5, height: 5, borderRadius: 99, backgroundColor: color.surface, marginRight: 7 },
  eyebrowText: { letterSpacing: 1.6, fontSize: 10 },

  // Preview
  previewBottom: {
    position: 'absolute',
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

  // Result card
  resultCardWrap: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.sm + 2,
    gap: space.sm + 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  resultThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: color.surfaceMuted,
  },
  resultCardBody: { flex: 1, gap: 3 },
  resultTitle: { marginTop: 1 },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 1,
  },
  confidenceCheck: {
    width: 15,
    height: 15,
    borderRadius: 99,
    backgroundColor: color.success.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
