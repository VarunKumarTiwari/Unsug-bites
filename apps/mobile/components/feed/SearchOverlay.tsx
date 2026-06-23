import React, { useRef } from 'react';
import { View, Pressable, TextInput, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';
import { Search } from 'lucide-react-native';
import { Text, color, radius, text } from '@unsung/ui';

interface Props {
  visible: boolean;
  query: string;
  onChangeQuery: (q: string) => void;
  onClose: () => void;
  insetTop: number;
}

export function SearchOverlay({ visible, query, onChangeQuery, onClose, insetTop }: Props) {
  const inputRef = useRef<TextInput>(null);
  const backdropOpacity = useSharedValue(visible ? 1 : 0);
  const backdropAnimStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));

  React.useEffect(() => {
    backdropOpacity.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 180 : 140,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
    });
  }, [visible, backdropOpacity]);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { zIndex: 99 }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.backdrop, backdropAnimStyle]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} accessibilityLabel="Close search" />
      </Animated.View>

      {visible && (
        <Animated.View
          entering={SlideInUp.duration(280).springify().damping(22).stiffness(200)}
          exiting={SlideOutUp.duration(220).easing(Easing.in(Easing.cubic))}
          style={[styles.panel, { paddingTop: insetTop + 12 }]}
        >
          <View style={styles.searchRow}>
            <Search size={15} color={color.text.muted} strokeWidth={2} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={onChangeQuery}
              placeholder="Search dishes, cuisines, or neighborhoods"
              placeholderTextColor={color.text.subtle}
              accessibilityLabel="Search restaurants by dish, cuisine, or neighborhood"
              autoFocus
              style={styles.input}
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

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(28,28,30,0.45)' },
  panel: {
    backgroundColor: color.bg,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
    paddingHorizontal: 20,
    paddingBottom: 14,
    shadowColor: '#1C1C1E',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: color.border,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: color.text.base,
    fontSize: text.body.size,
    fontFamily: text.body.family,
  },
});
