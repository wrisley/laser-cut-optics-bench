# LARP Platform Implementation Playbook

This guide turns `docs/larp-platform-architecture.md` into a **runnable MVP** with concrete commands, phases, and code structure.

## 0) What to build first (scope lock)

Implement only these end-to-end slices for MVP:

1. Auth (signup, signin, signout)
2. Organizer: campaign + event + ticket tiers (free/paid)
3. Player: browse event + register + payment path
4. Staff: check-in registered players
5. Referee: incident report create/view with role-based visibility

Do not expand to character systems, advanced messaging, or offline sync until these pass.

---

## 1) Stack decisions

- **Web/API**: Next.js App Router + TypeScript + Tailwind
- **ORM**: Prisma (fast setup + migrations)
- **DB**: PostgreSQL
- **Queue/cache**: Redis + BullMQ
- **Payments**: Stripe test mode + webhook endpoint
- **Auth**: NextAuth/Auth.js credentials provider (email/password) + JWT sessions
- **Validation**: Zod
- **Tests**: Vitest (unit) + Playwright (critical integration flow)

---

## 2) Bootstrap commands

```bash
# 1) create app
npx create-next-app@latest larp-platform --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
cd larp-platform

# 2) runtime + data deps
npm i @prisma/client prisma zod bcryptjs jsonwebtoken
npm i next-auth stripe bullmq ioredis

# 3) dev/test deps
npm i -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
npm i -D playwright @playwright/test tsx

# 4) init prisma
npx prisma init
```

---

## 3) Docker compose (local runtime)

Create `docker-compose.yml`:

```yaml
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: larp
    ports: ["5432:5432"]
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports: ["6379:6379"]

volumes:
  pgdata:
```

Run:

```bash
docker compose up -d
```

---

## 4) Env variables

Create `.env` (local development):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/larp?schema=public"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="dev-secret-change-me"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

---

## 5) Data model (Prisma baseline)

Add these core models first:

- `Tenant`
- `User`
- `Membership` (user ↔ tenant + role)
- `Campaign`
- `Event`
- `TicketTier` (free/paid)
- `Registration`
- `Payment`
- `CheckIn`
- `Incident`
- `AuditLog`

Key rules:

- Every business table includes `tenantId`.
- Sensitive/safety actions write `AuditLog` rows.
- Soft-delete fields where needed (`deletedAt`).

Then run:

```bash
npx prisma migrate dev --name init_mvp
```

---

## 6) API route map (MVP)

Implement in `src/app/api/...`:

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/signout`
- `POST /api/campaigns` (organizer/admin)
- `POST /api/events` (organizer/admin)
- `POST /api/ticket-tiers` (organizer/admin)
- `GET /api/events/:id` (tenant member)
- `POST /api/registrations` (player)
- `POST /api/payments/create-checkout-session` (player)
- `POST /api/webhooks/stripe` (public, signature-verified)
- `POST /api/checkins` (staff/ref/organizer)
- `POST /api/incidents` (ref/staff/admin)
- `GET /api/incidents` (role-filtered visibility)

Add `docs/api.md` with request/response examples and role requirements.

---

## 7) Tenant and RBAC enforcement pattern

Use a shared guard utility (example design):

- Resolve session user.
- Resolve active tenant from membership.
- Require role(s) for command.
- Apply `where: { tenantId: activeTenantId }` to every DB query.

Never query tenant-owned rows without tenant predicate.

---

## 8) Stripe webhook reconciliation (idempotent)

For `checkout.session.completed`:

1. Verify signature.
2. Extract `registrationId` from metadata.
3. Upsert `Payment` by unique `stripeEventId` (idempotency).
4. Mark `Registration.status = CONFIRMED`.
5. Insert audit log entry.

Also store a processed-event marker (or unique index on event ID) to prevent duplicate execution.

---

## 9) Queue/background tasks (BullMQ)

Create queues:

- `payments` for webhook reconciliation retries.
- `notifications` for post-registration emails (stub provider OK).

Use exponential backoff and dead-letter queue handling.

---

## 10) UI pages (minimum viable)

- `/auth/signin`, `/auth/signup`
- `/organizer/campaigns/new`
- `/organizer/events/new`
- `/organizer/events/[id]/tickets`
- `/events/[id]` (player view + register CTA)
- `/staff/checkin`
- `/ref/incidents`

Every form should hit real API routes and persist data in PostgreSQL.

---

## 11) Seed data

Create Prisma seed script with:

- One demo tenant
- Users: organizer, player, referee, admin
- One campaign and one event
- One free and one paid ticket tier

Run:

```bash
npx prisma db seed
```

---

## 12) Tests you should not skip

Critical automated checks:

- Auth signup/signin unit tests
- RBAC policy unit tests
- Registration service unit tests
- Stripe webhook idempotency integration test
- One Playwright E2E: player registers for free tier and appears in check-in list

Suggested commands:

```bash
npm run lint
npm run typecheck
npm run test
npx playwright test
```

---

## 13) CI workflow

Add `.github/workflows/ci.yml`:

- Install deps
- Lint
- Typecheck
- Unit tests
- Integration tests (optionally with Postgres/Redis service containers)

Gate merges on CI success.

---

## 14) Recommended phase plan (small PRs)

### Phase A
Scaffold + auth + tenant model + RBAC guard.

### Phase B
Campaign/event/ticket tier creation flows.

### Phase C
Registration + Stripe checkout + webhook reconciliation.

### Phase D
Check-in + incident logging + role visibility.

### Phase E
Notification abstraction + basic reporting + docs hardening.

After each phase:

1. List changed files
2. Run checks
3. Record what passed/failed
4. Note any architecture deviation before coding it

---

## 15) Definition of done checklist

- `docker compose up` starts Postgres + Redis
- Organizer can create campaign/event/ticket tiers
- Player can register to free and paid tiers
- Stripe webhook reconciles paid registrations
- Staff can check in players
- Referee incident logging permissions work
- CI lint/tests pass
- README includes exact local run commands

---

## 16) If you want a one-shot implementation prompt

Use this exact prompt with Codex:

```text
Build runnable code (not architecture docs) for the MVP in docs/larp-platform-architecture.md.

Use Next.js App Router + TypeScript + Tailwind + Prisma + Postgres + Redis/BullMQ + Stripe test mode.
Implement phases A-E with small commits.
After each phase, run lint/typecheck/tests and summarize changed files.
Enforce tenant scoping and RBAC (player, organizer, referee, admin) on all business entities.
Include migrations, seed data, docker compose, CI workflow, API docs, and README run instructions.
Stop only when all definition-of-done checks pass.
```
