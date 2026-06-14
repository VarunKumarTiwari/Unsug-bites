import type { NutritionFact } from '@unsung/contracts';
import carbonara from '@/lib/mock/nutrition_carbonara_truffle.json';
import { fakeLatency } from './_latency';

export async function getNutrition(_lookupKey: string): Promise<NutritionFact> {
  await fakeLatency();
  return carbonara as NutritionFact;
}
