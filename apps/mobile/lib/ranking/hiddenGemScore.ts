// ─────────────────────────────────────────────────────────────────────────────
// HIDDEN GEM SCORING — your call.
//
// This function decides which restaurants surface as "Unsung Bites." It IS the
// product's recommendation core. Three candidate formulas are sketched below;
// pick one (or combine) based on what *feels* like a hidden gem to you.
// ─────────────────────────────────────────────────────────────────────────────

interface Signals {
  rating: number;            // 0..5  — quality
  reviewCount: number;       // raw — exposure
  recentReviewCount: number; // last 30 days — momentum
  cityMedianReviews: number; // benchmark for "well-known"
}

// Candidate A — Quality / Exposure Ratio
// Pros: simple, intuitive. Cons: a 5★ place with 2 reviews dominates.
// const score = (s.rating / 5) / Math.log10(s.reviewCount + 10);

// Candidate B — Bayesian Lower Bound (Wilson) on quality, dampened by exposure
// Pros: handles small samples honestly. Cons: punishes new places harshly.

// Candidate C — Quality * Underexposure * Momentum
// Pros: surfaces rising quiet places. Cons: needs `recentReviewCount` from reviews service.

export function hiddenGemScore(s: Signals): number {
  // TODO(you): write 5–10 lines that combine the signals above into a 0..1 score.
  //   Higher = more "hidden gem." Examples:
  //     const quality = s.rating / 5;
  //     const underexposed = 1 - Math.min(1, s.reviewCount / s.cityMedianReviews);
  //     const momentum = Math.min(1, s.recentReviewCount / 20);
  //     return quality * 0.5 + underexposed * 0.3 + momentum * 0.2;
  return 0;
}
