# Discovery Service

Finds restaurants near a coordinate, ranks them by the **Hidden Gem** score, returns best-sellers and vibe tags.

## Endpoints (planned)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/restaurants/nearby?lat=&lng=&radius_m=` | List nearby restaurants ordered by hidden-gem score |
| GET | `/restaurants/:id` | Full restaurant detail incl. best-sellers, vibe tags |
| GET | `/restaurants/search?q=&vibes=` | Free-text + vibe-filter search |

See `openapi.yaml` for full schema. See `mock/` for example responses.

## Owns

- Restaurant catalog
- Hidden Gem score calculation
- Best-seller aggregation (reads from reviews service later — for now denormalized)

## Does not own

- User-specific recommendations → `recommendations` service
- Review submission → `reviews` service
- Photo storage → `scan` service
