import type { NutritionFact } from '@unsung/contracts';
import carbonara from '@/lib/mock/nutrition_carbonara_truffle.json';
import { apiFetch, withMock } from './_client';

export async function getNutrition(lookupKey: string): Promise<NutritionFact> {
  return withMock(
    'nutrition.getNutrition',
    () => apiFetch<NutritionFact>(`/nutrition/${encodeURIComponent(lookupKey)}`),
    () => carbonara as NutritionFact,
  );
}
