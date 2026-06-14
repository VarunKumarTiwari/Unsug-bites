import React from 'react';
import { View } from 'react-native';

// Pure-RN vignette: stacked translucent shadow rings emulate a heavy edge fall-off.
// Skia version comes later for a smoother gradient.
export function Vignette() {
  return (
    <View pointerEvents="none" style={{ ...StyleSheetAbsoluteFill }}>
      <View
        style={{
          ...StyleSheetAbsoluteFill,
          borderRadius: 0,
          shadowColor: '#000',
          shadowOpacity: 0.7,
          shadowRadius: 60,
          shadowOffset: { width: 0, height: 0 },
          backgroundColor: 'transparent',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: -120,
          left: -120,
          right: -120,
          bottom: -120,
          borderRadius: 600,
          borderWidth: 180,
          borderColor: 'rgba(0,0,0,0.55)',
        }}
      />
    </View>
  );
}

const StyleSheetAbsoluteFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
