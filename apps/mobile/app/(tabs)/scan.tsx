import React, { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera as CameraIcon, ChevronLeft, RefreshCcw, X } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Text, Button, color, radius, space } from '@unsung/ui';
import { Vignette } from '@/components/camera/Vignette';
import { HolographicBrackets } from '@/components/camera/HolographicBrackets';
import { scan, nutrition } from '@/lib/api';
import type { ScanResult, NutritionFact } from '@unsung/contracts';

type Phase = 'preview' | 'scanning' | 'result';

export default function Scan() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('preview');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [nut, setNut] = useState<NutritionFact | null>(null);

  async function capture() {
    setPhase('scanning');
    const r = await scan.submitScan('mock://carbonara');
    const n = await nutrition.getNutrition(r.suggestedNutritionLookupKey ?? '');
    setResult(r);
    setNut(n);
    setPhase('result');
  }

  function reset() {
    setResult(null);
    setNut(null);
    setPhase('preview');
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0C' }}>
      {/* Mock camera viewfinder — real expo-camera mounts here. */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=1600' }}
        style={{ ...AbsFill }}
        contentFit="cover"
      />
      <Vignette />

      {phase !== 'result' && <HolographicBrackets />}

      {/* Top bar */}
      <View
        style={{
          position: 'absolute',
          top: 56,
          left: 16,
          right: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <RoundIcon onPress={() => router.back()}>
          <ChevronLeft size={20} color={color.surface} />
        </RoundIcon>
        {phase === 'result' && (
          <RoundIcon onPress={reset}>
            <X size={20} color={color.surface} />
          </RoundIcon>
        )}
      </View>

      {/* Bottom UI */}
      {phase === 'preview' && (
        <View
          style={{
            position: 'absolute',
            bottom: 48,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}
        >
          <Text variant="small" tone="surface" style={{ marginBottom: 16 }}>
            Center the dish in frame
          </Text>
          <Pressable
            onPress={capture}
            style={{
              width: 76,
              height: 76,
              borderRadius: 999,
              backgroundColor: color.surface,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 4,
              borderColor: 'rgba(255,255,255,0.4)',
            }}
          >
            <CameraIcon size={28} color={color.text.base} />
          </Pressable>
        </View>
      )}

      {phase === 'scanning' && (
        <View
          style={{
            position: 'absolute',
            bottom: 64,
            left: 24,
            right: 24,
            alignItems: 'center',
          }}
        >
          <ShimmerLoader />
          <Text variant="bodyMedium" tone="surface" style={{ marginTop: space.md }}>
            Reading the plate…
          </Text>
        </View>
      )}

      {phase === 'result' && result && nut && (
        <ResultSheet
          result={result}
          nutrition={nut}
          onSubmit={() => router.push(`/achievement/b_carbonara`)}
        />
      )}
    </View>
  );
}

const AbsFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

function RoundIcon({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 40,
        height: 40,
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </Pressable>
  );
}

function ShimmerLoader() {
  return (
    <View
      style={{
        height: 64,
        borderRadius: radius.md,
        alignSelf: 'stretch',
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center',
        paddingHorizontal: 16,
      }}
    >
      <ActivityIndicator color={color.surface} />
    </View>
  );
}

function ResultSheet({
  result,
  nutrition,
  onSubmit,
}: {
  result: ScanResult;
  nutrition: NutritionFact;
  onSubmit: () => void;
}) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: color.surface,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
      }}
    >
      <View
        style={{
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: color.surfaceMuted,
          alignSelf: 'center',
          marginBottom: 16,
        }}
      />
      <Text variant="label" tone="muted">
        AI Detected
      </Text>
      <Text variant="h2" style={{ marginTop: 4 }}>
        {result.detectedDish}
      </Text>
      <Text variant="smallStrong" tone="success" style={{ marginTop: 4 }}>
        ✓ {Math.round(result.confidence * 100)}% confidence
      </Text>

      <Text variant="label" tone="muted" style={{ marginTop: 18 }}>
        Key Ingredients
      </Text>
      <Text variant="small" style={{ marginTop: 4, lineHeight: 20 }}>
        {result.ingredients.join(' · ')}
      </Text>

      <Text variant="label" tone="muted" style={{ marginTop: 18 }}>
        Nutrition Summary
      </Text>
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 6 }}>
        <NutChip label="Calories" value={`${nutrition.calories}`} />
        <NutChip label="Protein" value={`${nutrition.protein_g}g`} />
        <NutChip label="Carbs" value={`${nutrition.carbs_g}g`} />
      </View>

      <Button label="Log & Submit Review" onPress={onSubmit} style={{ marginTop: 24 }} />
    </View>
  );
}

function NutChip({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        backgroundColor: color.success.soft,
        borderRadius: radius.md,
        paddingVertical: 10,
        paddingHorizontal: 14,
        flex: 1,
      }}
    >
      <Text variant="labelStrong" tone="success">
        {label}
      </Text>
      <Text variant="bodyStrong" style={{ marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}
