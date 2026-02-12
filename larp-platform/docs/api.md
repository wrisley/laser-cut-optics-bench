# API quick reference (MVP)

All tenant-protected routes require headers:
- `X-User-Id`
- `X-Tenant-Id`

## Auth
- `POST /api/auth/signup` `{ email, password }`
- `POST /api/auth/signin` `{ email, password }`
- `POST /api/auth/signout`

## Organizer/Admin
- `POST /api/campaigns` `{ name }`
- `POST /api/events` `{ name, capacity, startsAt, campaignId? }`
- `POST /api/ticket-tiers` `{ eventId, name, priceCents, capacity }`

## Player
- `POST /api/registrations` `{ eventId, ticketTierId }`

## Staff/Ref/Admin
- `POST /api/checkins` `{ eventId, registrationId }`
- `POST /api/incidents` `{ eventId, summary, visibility }`
- `GET /api/incidents`

## Stripe
- `POST /api/webhooks/stripe`
  - expects event shape containing `type=checkout.session.completed`
  - reads `data.object.metadata.registrationId`
  - idempotent by unique `stripeEventId`
