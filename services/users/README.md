# Users Service

Owns identity, profile, and preferences (vibe affinities, dietary flags).

## Endpoints (planned)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/users` | Create account |
| GET | `/users/:id` | Profile |
| PATCH | `/users/:id` | Update preferences |

## Owns

- Auth identity
- Display name + avatar
- Preference vector (for `recommendations`)
