import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { color, radius, space } from '@unsung/ui';

export function FeedSkeleton() {
  return (
    <View style={{ marginTop: 24, marginBottom: 28 }}>
      <View style={s.eyebrowRow}>
        <View style={s.eyebrowDot} />
      </View>
      <View style={[s.line, { width: '60%', height: 34, marginTop: 6 }]} />
      <View style={[s.line, { width: '40%', height: 14, marginTop: 8 }]} />

      <MotiView
        from={{ opacity: 0.35 }}
        animate={{ opacity: 0.7 }}
        transition={{ type: 'timing', duration: 650, loop: true, repeatReverse: true }}
        style={s.featured}
      >
        <View style={s.featuredImg} />
        <View style={{ padding: 14, gap: 8 }}>
          <View style={[s.line, { width: '60%' }]} />
          <View style={[s.line, { width: '40%', height: 10 }]} />
        </View>
      </MotiView>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        {[0, 1].map((i) => (
          <MotiView
            key={i}
            from={{ opacity: 0.35 }}
            animate={{ opacity: 0.7 }}
            transition={{ type: 'timing', duration: 650, loop: true, repeatReverse: true, delay: 150 + i * 120 }}
            style={[s.card, { flex: 1 }]}
          >
            <View style={s.cardImg} />
            <View style={{ padding: 10, gap: 6 }}>
              <View style={[s.line, { width: '70%' }]} />
              <View style={[s.line, { width: '45%', height: 10 }]} />
            </View>
          </MotiView>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        {[0, 1].map((i) => (
          <MotiView
            key={i}
            from={{ opacity: 0.35 }}
            animate={{ opacity: 0.7 }}
            transition={{ type: 'timing', duration: 650, loop: true, repeatReverse: true, delay: 390 + i * 120 }}
            style={[s.card, { flex: 1 }]}
          >
            <View style={s.cardImg} />
            <View style={{ padding: 10, gap: 6 }}>
              <View style={[s.line, { width: '65%' }]} />
              <View style={[s.line, { width: '40%', height: 10 }]} />
            </View>
          </MotiView>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  eyebrowRow: { flexDirection: 'row', alignItems: 'center' },
  eyebrowDot: { width: 5, height: 5, borderRadius: 99, backgroundColor: color.primary.base, marginRight: 7 },
  featured: { backgroundColor: color.surfaceMuted, borderRadius: radius.lg, overflow: 'hidden', marginTop: 20 },
  featuredImg: { width: '100%', aspectRatio: 16 / 9, backgroundColor: color.text.subtle, opacity: 0.12 },
  card: { backgroundColor: color.surfaceMuted, borderRadius: radius.md, overflow: 'hidden' },
  cardImg: { width: '100%', aspectRatio: 4 / 3, backgroundColor: color.text.subtle, opacity: 0.12 },
  line: { height: 13, backgroundColor: color.text.subtle, borderRadius: radius.sm, opacity: 0.18 },
});
