// ─────────────────────────────────────────────────────────────────────────────
// BADGE CRITERIA — your call.
//
// Each badge here defines *when* it unlocks. The runtime iterates this list
// after every dish-logged event and emits an "unlocked" notification. The
// criteria you write here directly shapes user behavior.
// ─────────────────────────────────────────────────────────────────────────────

export interface UserStats {
  totalDishes: number;
  uniqueCuisines: string[];
  visitedRestaurants: string[];
  hiddenGemVisits: number;
  cuisineDishCounts: Record<string, number>; // e.g. { italian: 3 }
  streakDays: number;
}

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  iconKey: string;
  criteria: (s: UserStats) => boolean;
}

export const BADGES: BadgeDef[] = [
  // TODO(you): write 3–5 starter badges. Examples:
  // {
  //   id: 'b_local_guide',
  //   title: 'Local Guide',
  //   description: 'Reviewed 5 nearby restaurants.',
  //   iconKey: 'shield',
  //   criteria: (s) => s.visitedRestaurants.length >= 5,
  // },
  // {
  //   id: 'b_hidden_hunter',
  //   title: 'Hidden Hunter',
  //   description: 'Visited 5 hidden gems.',
  //   iconKey: 'compass',
  //   criteria: (s) => s.hiddenGemVisits >= 5,
  // },
];

export function evaluate(stats: UserStats): string[] {
  return BADGES.filter((b) => b.criteria(stats)).map((b) => b.id);
}
