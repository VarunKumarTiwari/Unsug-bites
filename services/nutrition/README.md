# Nutrition Service

Looks up macronutrients + health flags for a dish or ingredient list.

## Endpoints (planned)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/nutrition/:lookupKey` | Macros + flags for a known dish key |
| POST | `/nutrition/estimate` | Estimate from a free-form ingredient list |

## Owns

- Nutrition database (or upstream Nutritionix/USDA wrapper)

## Does not own

- Dish detection → `scan`
- User goals/preferences → `users`
