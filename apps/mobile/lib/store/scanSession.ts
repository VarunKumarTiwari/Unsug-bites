import { create } from 'zustand';
import type { ScanResult, NutritionFact } from '@unsung/contracts';

// Holds the just-captured scan so the full-screen result route can read it
// without re-running the 1400ms mock scan or serializing arrays through params.
interface ScanSessionState {
  result: ScanResult | null;
  nutrition: NutritionFact | null;
  photoUri: string | null;
  set: (s: { result: ScanResult; nutrition: NutritionFact; photoUri: string }) => void;
  clear: () => void;
}

export const useScanSession = create<ScanSessionState>((set) => ({
  result: null,
  nutrition: null,
  photoUri: null,
  set: ({ result, nutrition, photoUri }) => set({ result, nutrition, photoUri }),
  clear: () => set({ result: null, nutrition: null, photoUri: null }),
}));
