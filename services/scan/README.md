# Scan Service

Accepts a food photo, returns the detected dish + key ingredients. Wraps an LLM vision model later (GPT-4o, Gemini, Claude).

## Endpoints (planned)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/scan` | Upload image (multipart), receive detected dish + ingredients |
| GET | `/scan/:id` | Retrieve a previous scan result |

## Owns

- Photo storage
- Vision model orchestration
- Detected-dish persistence

## Does not own

- Nutrition lookup → calls `nutrition` service with detected ingredients
- Review submission → user submits review separately via `reviews`
