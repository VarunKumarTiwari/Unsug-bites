import React, { useState } from 'react';
import { Modal, View, TextInput, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { X, Camera } from 'lucide-react-native';
import { Text, Button, color, radius, space } from '@unsung/ui';
import { VibeChip } from '@/components/feed/VibeChip';
import { users } from '@/lib/api';
import type { User } from '@unsung/contracts';
import type { UserPatch } from '@/lib/api/users';

// Canonical option lists. VIBES mirrors the discovery feed's list so a user's
// preferred vibes line up with the filters they'll actually see.
const VIBES = [
  'Cozy', 'Date Night', 'Hidden Gem', 'Late Night',
  'Morning', 'Solo Dining', 'Casual', 'Local Favorite',
] as const;
const DIETARY = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal',
  'Kosher', 'Dairy-Free', 'Nut-Free', 'Pescatarian',
] as const;

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((v) => v !== item) : [...list, item];
}

interface Props {
  me: User;
  visible: boolean;
  onClose: () => void;
}

export function EditProfileSheet({ me, visible, onClose }: Props) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(me.displayName);
  const [vibes, setVibes] = useState<string[]>(me.preferredVibes ?? []);
  const [dietary, setDietary] = useState<string[]>(me.dietary ?? []);

  // Push the server's canonical row into the cache so the hero updates at once.
  const applyUser = (updated: User) => {
    queryClient.setQueryData(['users', 'me'], updated);
    queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
  };

  const mutation = useMutation({
    mutationFn: (patch: UserPatch) => users.updateMe(patch),
    onSuccess: (updated) => { applyUser(updated); onClose(); },
  });

  const avatarMutation = useMutation({
    mutationFn: (uri: string) => users.uploadAvatar(uri),
    onSuccess: applyUser, // stay open so the user sees the new avatar before saving the rest
  });

  async function pickAvatar() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    // Library only (no camera). Square crop to match the round avatar frame.
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!res.canceled && res.assets[0]) avatarMutation.mutate(res.assets[0].uri);
  }

  function save() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    // Diff against the loaded profile — PATCH only what changed. Trim guards
    // against saving an all-whitespace name over a real one.
    const trimmed = name.trim();
    const patch: UserPatch = {};
    if (trimmed && trimmed !== me.displayName) patch.displayName = trimmed;
    if (!sameSet(vibes, me.preferredVibes ?? [])) patch.preferredVibes = vibes;
    if (!sameSet(dietary, me.dietary ?? [])) patch.dietary = dietary;

    if (Object.keys(patch).length === 0) { onClose(); return; }
    mutation.mutate(patch);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text variant="h3Serif" tone="primary">Edit profile</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
              <X size={22} color={color.text.muted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Pressable onPress={pickAvatar} style={styles.avatarPicker} accessibilityRole="button" accessibilityLabel="Change photo">
              <View style={styles.avatarWrap}>
                {me.avatarUrl ? (
                  <Image source={{ uri: me.avatarUrl }} style={styles.avatar} contentFit="cover" transition={200} />
                ) : (
                  <View style={[styles.avatar, styles.avatarEmpty]} />
                )}
                <View style={styles.avatarBadge}>
                  <Camera size={14} color={color.surface} strokeWidth={2.5} />
                </View>
              </View>
              <Text variant="smallMedium" tone="muted" style={styles.avatarHint}>
                {avatarMutation.isPending ? 'Uploading…' : 'Change photo'}
              </Text>
            </Pressable>

            <Text variant="labelStrong" tone="muted" style={styles.label}>DISPLAY NAME</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="New Foodie"
              placeholderTextColor={color.text.muted}
              style={styles.input}
              maxLength={40}
              returnKeyType="done"
            />

            <Text variant="labelStrong" tone="muted" style={styles.label}>PREFERRED VIBES</Text>
            <View style={styles.chipGrid}>
              {VIBES.map((v) => (
                <VibeChip key={v} vibe={v} isActive={vibes.includes(v)} onPress={() => setVibes((cur) => toggle(cur, v))} />
              ))}
            </View>

            <Text variant="labelStrong" tone="muted" style={styles.label}>DIETARY</Text>
            <View style={styles.chipGrid}>
              {DIETARY.map((d) => (
                <VibeChip key={d} vibe={d} isActive={dietary.includes(d)} onPress={() => setDietary((cur) => toggle(cur, d))} />
              ))}
            </View>

            {mutation.isError && (
              <Text variant="small" tone="muted" style={styles.error}>
                Couldn’t save — check your connection and try again.
              </Text>
            )}
            {avatarMutation.isError && (
              <Text variant="small" tone="muted" style={styles.error}>
                {(avatarMutation.error as Error)?.message || 'Couldn’t upload photo, try a different image.'}
              </Text>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Button label="Save changes" loading={mutation.isPending} onPress={save} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Order-insensitive set equality — chip toggles reorder the array, which isn't a real change.
function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: color.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: space.lg,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  content: { paddingHorizontal: space.lg, paddingBottom: space.lg },
  avatarPicker: { alignItems: 'center', marginBottom: space.sm },
  avatarWrap: { width: 88, height: 88 },
  avatar: { width: 88, height: 88, borderRadius: 999 },
  avatarEmpty: { backgroundColor: color.surfaceMuted, borderWidth: 1, borderColor: color.border },
  avatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: color.primary.base,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: color.bg,
  },
  avatarHint: { marginTop: space.sm },
  label: { letterSpacing: 1.4, fontSize: 10, marginTop: space.lg, marginBottom: space.sm },
  input: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontSize: 16,
    color: color.text.base,
    backgroundColor: color.surface,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  error: { marginTop: space.md, color: color.primary.base },
  footer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xl,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
});
