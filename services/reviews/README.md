# Reviews Service

Stores user reviews of dishes (rating, note, photo reference, scan reference).

## Endpoints (planned)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/reviews` | Submit a review |
| GET | `/reviews?userId=` | List a user's reviews |
| GET | `/reviews?restaurantId=` | List reviews for a restaurant |

## Owns

- Review records (rating, text, photo URL, scan reference, timestamps)

## Does not own

- Photo bytes → `scan` service stores those; reviews keeps a reference
- Aggregation into best-sellers → `discovery` service consumes review events
- Badge unlocks → `gamification` service watches review events
