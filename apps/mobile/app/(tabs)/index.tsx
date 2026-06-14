import React, { useState } from 'react';
import { View, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, List } from 'lucide-react-native';
import { Screen } from '@/components/primitives/Screen';
import { Text } from '@/components/primitives/Text';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { FauxMap } from '@/components/map/FauxMap';
import { color, radius } from '@/theme/tokens';
import { discovery } from '@/lib/api';

type View = 'list' | 'map';

export default function Home() {
  const [view, setView] = useState<View>('list');
  const { data, isLoading } = useQuery({
    queryKey: ['discovery', 'nearby'],
    queryFn: () => discovery.getNearby(40.68, -74.0),
  });

  return (
    <Screen padded>
      {/* Editorial hero */}
      <Text variant="display" serif tone="accent" style={{ marginTop: 4 }}>
        Hidden Gems
      </Text>
      <Text variant="small" tone="muted" style={{ marginBottom: 16 }}>
        nearby · curated for you
      </Text>

      {/* Search */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: color.surface,
          borderRadius: radius.pill,
          paddingHorizontal: 14,
          height: 44,
          borderWidth: 1,
          borderColor: color.stone,
          marginBottom: 12,
        }}
      >
        <Search size={16} color={color.inkMuted} />
        <Text variant="body" tone="subtle" style={{ marginLeft: 8 }}>
          Search dishes or vibes
        </Text>
      </View>

      {/* List / Map toggle */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: color.stone,
          borderRadius: radius.pill,
          padding: 4,
          alignSelf: 'flex-start',
          marginBottom: 16,
        }}
      >
        <Toggle active={view === 'list'} onPress={() => setView('list')} icon={<List size={14} color={view === 'list' ? color.surface : color.ink} />} label="List" />
        <Toggle active={view === 'map'} onPress={() => setView('map')} icon={<MapPin size={14} color={view === 'map' ? color.surface : color.ink} />} label="Map" />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={color.accent} />
        </View>
      ) : view === 'map' ? (
        <FauxMap restaurants={data ?? []} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(r) => r.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <RestaurantCard restaurant={item} />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

function Toggle({
  active,
  onPress,
  icon,
  label,
}: {
  active: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: active ? color.ink : 'transparent',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 999,
      }}
    >
      {icon}
      <Text
        variant="small"
        weight="semibold"
        tone={active ? 'surface' : 'ink'}
        style={{ marginLeft: 6 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
