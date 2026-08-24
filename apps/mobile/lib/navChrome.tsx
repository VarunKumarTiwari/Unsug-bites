import React, { createContext, useContext } from 'react';
import { useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';

// Shared scroll-driven state for the floating tab bar.
// The pill lives in the tab layout; the scrollable screens live elsewhere in the
// route tree. A single context lets every screen feed one shrink/expand state so
// the pill stays coordinated across tab switches (spec R9).
export type NavChrome = {
  expanded: SharedValue<number>; // 1 = full size, 0 = shrunk (icons only)
  target: SharedValue<number>;   // debounced target so we only animate on direction change
  lastY: SharedValue<number>;
};

const Ctx = createContext<NavChrome | null>(null);

export function NavChromeProvider({ children }: { children: React.ReactNode }) {
  const expanded = useSharedValue(1);
  const target = useSharedValue(1);
  const lastY = useSharedValue(0);
  return <Ctx.Provider value={{ expanded, target, lastY }}>{children}</Ctx.Provider>;
}

export function useNavChrome(): NavChrome | null {
  return useContext(Ctx);
}

// Called from each screen's existing onScroll worklet — no second listener (spec R7).
// Scrolling down past a small threshold shrinks the pill; scrolling up or returning
// to the top expands it. Only fires withTiming on an actual direction change so we
// don't re-issue the animation every frame (edge case: rapid flick jitter).
export function updateNavChrome(nav: NavChrome | null, y: number) {
  'worklet';
  if (!nav) return;
  const dy = y - nav.lastY.value;
  nav.lastY.value = y;

  let next = nav.target.value;
  if (y <= 8) next = 1;          // at / near top → always expanded
  else if (dy > 4) next = 0;     // reading down → shrink
  else if (dy < -4) next = 1;    // scrolling up → expand

  if (next !== nav.target.value) {
    nav.target.value = next;
    nav.expanded.value = withTiming(next, { duration: 220 });
  }
}
