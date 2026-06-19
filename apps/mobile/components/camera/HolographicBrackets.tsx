import React from 'react';
import { View, useWindowDimensions } from 'react-native';

// Static smart-corner brackets — animation arrives once we wire Reanimated to the AI confidence stream.
export function HolographicBrackets({ size = 240 }: { size?: number }) {
  const { width } = useWindowDimensions();
  const s = Math.min(size, width * 0.7);
  const arm = 26;
  const thickness = 3;
  const colorBracket = '#79E3B7';

  const Corner = ({ rotate }: { rotate: string }) => (
    <View
      style={{
        position: 'absolute',
        width: arm,
        height: arm,
        transform: [{ rotate }],
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: arm,
          height: thickness,
          backgroundColor: colorBracket,
          borderRadius: 2,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: thickness,
          height: arm,
          backgroundColor: colorBracket,
          borderRadius: 2,
        }}
      />
    </View>
  );

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: '32%',
        alignSelf: 'center',
        width: s,
        height: s,
      }}
    >
      <View style={{ position: 'absolute', top: 0, left: 0 }}>
        <Corner rotate="0deg" />
      </View>
      <View style={{ position: 'absolute', top: 0, right: 0 }}>
        <Corner rotate="90deg" />
      </View>
      <View style={{ position: 'absolute', bottom: 0, right: 0 }}>
        <Corner rotate="180deg" />
      </View>
      <View style={{ position: 'absolute', bottom: 0, left: 0 }}>
        <Corner rotate="270deg" />
      </View>
    </View>
  );
}
