import React from 'react';
import { View, ViewProps, ScrollView, ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color } from '@/theme/tokens';

interface Props extends ViewProps {
  scroll?: boolean;
  padded?: boolean;
  scrollProps?: ScrollViewProps;
}

export function Screen({ scroll, padded = true, scrollProps, style, children, ...rest }: Props) {
  const inner = (
    <View
      style={[
        { flex: 1, paddingHorizontal: padded ? 20 : 0, paddingTop: padded ? 12 : 0 },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.bg }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          {...scrollProps}
        >
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}
