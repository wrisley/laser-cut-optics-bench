# LARP Platform MVP (Runnable Scaffold)

## Run locally

```bash
cd larp-platform
cp .env.example .env
docker compose up -d
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Open http://localhost:3000

## Demo credentials
Use seeded emails with password `password123`:
- organizer@demo.local
- player@demo.local
- ref@demo.local
- admin@demo.local

## Current MVP scope
- Auth signup/signin APIs
- Campaign/event/ticket-tier creation APIs
- Player registration API
- Staff check-in API
- Incident logging/listing API with role checks
- Stripe webhook reconciliation endpoint (idempotent by event ID)

See `docs/api.md` for route details.
