import React from 'react';
import { View, Pressable, LayoutAnimation } from 'react-native';
import { Text, color, radius, space } from '@unsung/ui';

interface Props {
  hasFilters: boolean;
  onClear: () => void;
}

export function EmptyState({ hasFilters, onClear }: Props) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 56, paddingHorizontal: 32, paddingBottom: 32 }}>
      <Text variant="h2" tone="muted" style={{ textAlign: 'center' }}>
        {hasFilters ? 'No matches found.' : 'Nothing nearby yet.'}
      </Text>
      <View style={{ width: 32, height: 1, backgroundColor: color.border, marginTop: 14, marginBottom: 14 }} />
      <Text variant="body" tone="muted" style={{ textAlign: 'center', maxWidth: 240, lineHeight: 22 }}>
        {hasFilters
          ? 'No spots match your filters. Try clearing one at a time, or search a cuisine or neighborhood.'
          : 'No gems found nearby. Try searching a cuisine, dish, or neighborhood name.'}
      </Text>
      {hasFilters && (
        <Pressable
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            onClear();
          }}
          style={({ pressed }) => ({
            marginTop: 20,
            borderRadius: radius.pill,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderWidth: 1,
            borderColor: color.border,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text variant="smallStrong" tone="base">Clear filters</Text>
        </Pressable>
      )}
    </View>
  );
}
