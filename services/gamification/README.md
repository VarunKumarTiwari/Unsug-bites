# Gamification Service

Tracks user streaks, evaluates badge criteria, surfaces achievements.

## Endpoints (planned)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/gamification/:userId` | Stats: streak, total dishes, unlocked badges |
| POST | `/gamification/:userId/events` | Log a "dish_logged" / "review_submitted" event |

## Owns

- Badge catalog + unlock criteria
- User streak counter
- Achievement records

## Does not own

- Reviews → `reviews` service emits events here
- User profile → `users` service
