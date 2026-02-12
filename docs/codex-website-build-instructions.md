# How to Ask Codex to Build This Website

Use this guide to get Codex to build the **actual website implementation** (not just architecture docs) from `docs/larp-platform-architecture.md`.

## Quick answer

If you only want one message to send Codex, use this:

```text
Build the LARP platform website described in docs/larp-platform-architecture.md.

Requirements:
- Use Next.js (App Router) + TypeScript + Tailwind.
- Use PostgreSQL with migrations and seed data.
- Use Redis for queues/caching.
- Use Stripe test mode for paid ticket tiers.
- Implement auth with roles: player, organizer, referee, admin.
- Enforce tenant scoping for all business entities.

Implement these MVP features end-to-end:
1) Auth: sign up, sign in, sign out
2) Organizer: create campaign, create event, define ticket tiers (free + paid)
3) Player: browse event, register, complete free/paid registration flow
4) Staff: check-in screen to mark registered players as checked in
5) Incident logging: create/view incident reports with role-based visibility

Engineering requirements:
- Dockerized local dev via docker compose
- API route docs (OpenAPI or markdown)
- Unit/integration tests for critical flows
- CI workflow for lint + tests
- README with exact run commands

Execution constraints:
- Work in phases with small commits
- After each phase, run tests and summarize what changed
- Call out architecture deviations before implementing them

Stop only when all acceptance criteria pass.
```

---

## Stronger version (recommended)

Use this if you want stricter control over output quality.

```text
You are my implementation agent. Build a production-minded MVP for a LARP management website.

Source of truth:
- docs/larp-platform-architecture.md

Stack:
- Next.js (App Router), TypeScript, Tailwind
- PostgreSQL (Prisma or Drizzle + migrations)
- Redis + BullMQ (or equivalent)
- Stripe (test mode)
- Docker Compose for local runtime

Required domain modules:
- Identity & Access
- Campaigns/Events
- Registration & Ticketing
- In-Game Operations (check-in + incident logs)
- Messaging abstraction (stub allowed)
- Reporting basics (simple attendance/revenue views)

RBAC:
- player, organizer, referee, admin

MVP flows (must be functional in UI + API + DB):
1. User auth and tenant membership
2. Organizer creates campaign and event
3. Organizer publishes free and paid ticket tiers
4. Player registers for event
5. Stripe webhook reconciliation updates payment/registration state
6. Staff checks in registered player
7. Referee logs incident, with access controls

Quality gates:
- Typecheck, lint, unit tests, and at least one integration test per critical flow
- Idempotent webhook handling
- Basic audit trail fields on sensitive records
- Seed data for a demo tenant + demo users

Output expectations:
- Phase-by-phase implementation plan first
- Then implement Phase A and continue through completion
- After each phase: list changed files, run checks, explain results
- Keep changes reviewable and logically grouped
```

---

## Acceptance criteria block (append this)

```text
Definition of done:
- `docker compose up` starts app + db + redis
- I can sign in as organizer and create campaign/event
- I can create free and paid ticket tiers
- A player can register for an event
- Stripe webhook marks paid registration reconciled
- Staff can check in a registered player
- Referee can create incident reports and permissions are enforced
- CI passes lint + tests
```

---

## Ask for phased PRs

```text
Use these PR-sized phases:
- Phase A: scaffold + auth + tenant model + RBAC
- Phase B: campaigns/events + ticket tiers
- Phase C: registration + Stripe payment + webhook reconciliation
- Phase D: staff check-in + incident logging
- Phase E: notifications abstraction + basic reporting + docs hardening
```

---

## Common mistake to avoid

If Codex returns only architecture prose, send this correction:

```text
Do not produce only documentation. Implement runnable code now, including UI pages, API routes, database migrations, tests, Docker setup, and README run instructions.
```
