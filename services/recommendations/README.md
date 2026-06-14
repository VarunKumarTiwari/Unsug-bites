# Recommendations Service

Personalized restaurant feed for a user. The data flywheel: more reviews → better recs.

## Endpoints (planned)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/recommendations/:userId?lat=&lng=` | Personalized restaurant feed |

## Owns

- User preference model
- Embeddings + similarity scoring
- A/B-tested ranking blend (hidden-gem vs preference vs novelty)

## Does not own

- Restaurant catalog → reads from `discovery`
- Review history → reads from `reviews`
- User preferences → reads from `users`
