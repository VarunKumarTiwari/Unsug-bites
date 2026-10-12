import React from 'react';
import { Modal, View, Pressable, ScrollView, StyleSheet, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Star, X, Navigation } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Text, Button, color, radius, space } from '@unsung/ui';
import { VibeTag } from '@/components/restaurant/VibeTag';
import type { RestaurantSummary } from '@unsung/contracts';
import { directionsUrl, formatDistance } from '@/lib/geo';
import type { Coords } from '@/hooks/useLocation';

// ponytail: no color.warning token yet — matches StarRating's local constant
const STAR_COLOR = '#D4A017';

interface Props {
  restaurant: RestaurantSummary | null; // null → sheet closed
  userCoords: Coords | null;
  onClose: () => void;
}

// Preview sheet for a tapped pin. Everything shown comes from the summary
// already in the box payload — NO extra API call. 
export function PinSheet({ restaurant, userCoords, onClose }: Props) {
  const router = useRouter();
  const visible = restaurant != null;

  const distance = restaurant ? formatDistance(userCoords, restaurant) : null;

  function viewRestaurant() {
    if (!restaurant) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onClose();
    router.push(`/restaurant/${restaurant.id}`);
  }

  function openDirections() {
    if (!restaurant) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    void Linking.openURL(directionsUrl(restaurant.lat, restaurant.lng, restaurant.name));
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        {restaurant && (
          <View style={styles.sheet}>
            <View style={styles.grabber} />
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={20} color={color.text.muted} />
            </Pressable>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              {/* Hero — lazy; only mounts when the sheet (and thus this Modal) opens. */}
              <Image
                source={{ uri: restaurant.heroImage }}
                style={styles.hero}
                contentFit="cover"
                transition={200}
                accessibilityIgnoresInvertColors
              />

              <Text variant="h3Serif" tone="primary" style={styles.name}>
                {restaurant.name}
              </Text>

              <View style={styles.metaRow}>
                <Star size={14} color={STAR_COLOR} fill={STAR_COLOR} strokeWidth={1.5} />
                <Text variant="smallStrong" style={styles.rating}>
                  {restaurant.rating.toFixed(1)}
                </Text>
                <Text variant="small" tone="muted" style={styles.dot}>·</Text>
                <Text variant="small" tone="muted">{restaurant.cuisine}</Text>
                {distance && (
                  <>
                    <Text variant="small" tone="muted" style={styles.dot}>·</Text>
                    <Text variant="small" tone="muted">{distance}</Text>
                  </>
                )}
              </View>

              {restaurant.vibes.length > 0 && (
                <View style={styles.vibes}>
                  {restaurant.vibes.map((v) => (
                    <VibeTag key={v} label={v} size="sm" />
                  ))}
                </View>
              )}

              <View style={styles.actions}>
                <Button label="View restaurant" onPress={viewRestaurant} />
                <Button
                  label="Directions"
                  variant="secondary"
                  onPress={openDirections}
                  leading={<Navigation size={16} color={color.text.base} strokeWidth={2} />}
                />
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: color.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: space.sm,
    maxHeight: '85%',
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: color.border,
    marginBottom: space.sm,
  },
  closeBtn: {
    position: 'absolute',
    top: space.md,
    right: space.md,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xl },
  hero: {
    width: '100%',
    height: 160,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceMuted,
  },
  name: { marginTop: space.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.sm },
  rating: { marginLeft: space.xs },
  dot: { marginHorizontal: space.sm },
  vibes: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  actions: { marginTop: space.lg, gap: space.sm },
});
