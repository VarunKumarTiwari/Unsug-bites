// Shared types — the ONLY thing services and the mobile app may import in common.
// Mirrors each service's openapi.yaml. Keep these two in sync by hand.

// ─── Discovery ────────────────────────────────────────────────────────────────
export interface RestaurantSummary {
  id: string;
  name: string;
  cuisine: string;
  neighborhood: string;
  hiddenGemScore: number; // 0..1
  rating: number;
  reviewCount: number;
  heroImage: string;
  lat: number;
  lng: number;
  vibes: string[];
}

export interface Dish {
  id: string;
  name: string;
  image: string;
  priceCents?: number;
  description?: string;
}

export interface RestaurantDetail extends RestaurantSummary {
  address: string;
  bestSellers: Dish[];
  unsungBites: Dish[];
}

// ─── Scan ─────────────────────────────────────────────────────────────────────
export interface ScanResult {
  scanId: string;
  detectedDish: string;
  confidence: number; // 0..1
  ingredients: string[];
  suggestedNutritionLookupKey?: string;
  capturedAt: string; // ISO
}

// ─── Nutrition ────────────────────────────────────────────────────────────────
export interface NutritionFact {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  flags?: string[];
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  dishName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  note?: string;
  scanId?: string | null;
  photoUrl?: string | null;
  createdAt: string;
}

export type ReviewInput = Omit<Review, 'id' | 'createdAt'>;

// ─── Gamification ─────────────────────────────────────────────────────────────
export interface Badge {
  id: string;
  title: string;
  description?: string;
  unlocked: boolean;
  unlockedAt?: string | null;
  iconKey: string;
}

export interface UserGameState {
  userId: string;
  streakDays: number;
  totalDishesLogged: number;
  rank?: string;
  rankProgress?: number; // 0..1
  badges: Badge[];
}

// ─── Users ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  displayName: string;
  avatarUrl?: string;
  rank?: string;
  preferredVibes?: string[];
  dietary?: string[];
}

// ─── Recommendations ──────────────────────────────────────────────────────────
export interface Recommendation {
  restaurantId: string;
  reason: string;
  score: number;
}
