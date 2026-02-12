# Modular LARP Platform Architecture (Web + Mobile)

## Product Goals

Build a secure platform where:
1. **World owners** create and manage worlds.
2. **Players** create characters and join worlds (subject to world rules).
3. Functionality is **module-based** so each world enables/disables specific systems (e.g., economy, combat, crafting).
4. A shared web app + phone app supports day-to-day gameplay and administration.

---

## Core Concepts

### 1) Multi-tenant world model
- Each world is a tenant.
- Data is isolated by `world_id`.
- Users can belong to many worlds with different roles.

### 2) Role and permission model
- **Platform Admin**: operates global platform settings and moderation.
- **World Owner**: owns a world and controls enabled modules.
- **World Staff**: can run events, approve characters, enforce rules.
- **Player**: owns characters and participates in worlds.

### 3) Character/world relationship
- A character has a home profile owned by a player.
- Characters can be admitted to one or many worlds based on world policy.
- World-level overlays allow world-specific stats/inventory while keeping a global identity.

### 4) Module registry
- Modules are plug-ins that declare:
  - Feature name/version
  - Required permissions
  - Data schema migrations
  - API endpoints/events
  - UI components (web/mobile)
- Worlds enable modules from a catalog.

---

## Recommended Technical Architecture

### Frontend
- **Web**: Next.js (React + TypeScript)
- **Mobile**: React Native (Expo) sharing TypeScript models/API client
- **Admin UI** for world setup, module management, and analytics

### Backend
- **API Gateway** (REST or GraphQL)
- **Core Services**
  - Auth & identity service
  - World service
  - Character service
  - Module orchestration service
  - Economy service (optional module)
  - Rulebook/content service
- **Event bus** (e.g., NATS/Kafka/SQS) for module event handling and audit trails

### Data layer
- **Primary DB**: PostgreSQL (strong consistency + row-level security)
- **Caching**: Redis for sessions, rate limits, hot data
- **Object storage**: S3-compatible for assets (character sheets, world media)

### Infra/Security
- Docker + Kubernetes (or managed containers)
- Infrastructure as Code (Terraform)
- Managed secrets (AWS Secrets Manager / Vault)
- Centralized logs + metrics + tracing (OpenTelemetry)

---

## Secure Database Design (PostgreSQL)

### Security controls
- Row-Level Security by `world_id` and `user_id`
- Least-privilege DB roles per service
- TLS in transit + encrypted disks at rest
- PII minimization and field-level encryption for sensitive fields
- Full audit table for admin and character-impacting actions
- Daily backups + PITR enabled

### Core tables
- `users`
- `worlds`
- `world_memberships` (`user_id`, `world_id`, `role`)
- `characters`
- `character_world_profiles`
- `modules`
- `world_enabled_modules`
- `rulebooks`
- `economy_accounts`, `economy_transactions` (module-owned)
- `audit_events`

### Isolation patterns
- Hard filter by `world_id` on all world-scoped records
- Global records only where necessary (`users`, module catalog)
- Every write emits immutable `audit_events`

---

## Module System Design

### Module contract
Each module should implement a contract such as:
- `manifest.json`
  - `name`, `version`, `capabilities`, `permissions`, `dependencies`
- `migrations/` for DB changes
- `api/` handlers
- `ui/` widgets and screens
- `events/` subscribers and publishers

### Enable/disable behavior
When a world owner enables a module:
1. Validate compatibility and dependencies.
2. Apply module migration scripts (idempotent).
3. Register routes/features and UI toggles.
4. Initialize default settings.

When disabled:
1. Hide routes/UI features.
2. Stop event consumers for that module.
3. Keep data archived (soft-disabled) unless owner requests purge.

### Suggested first-party modules
- Rulebook module
- Character generation module
- Character progression module
- Economy module
- Inventory/crafting module
- Event scheduling module

---

## Authentication and Authorization

- OIDC provider (Auth0, Cognito, Keycloak, etc.)
- MFA for staff and world owners
- Short-lived JWT access tokens + refresh rotation
- RBAC + optional ABAC (world policy flags)
- Per-module permission scopes (`economy:write`, `characters:approve`, etc.)

---

## API Strategy

- Stable core API namespace: `/api/v1/core/*`
- Module APIs: `/api/v1/modules/{module_key}/*`
- Enforce world context in middleware
- Idempotency keys for financial/economy endpoints
- OpenAPI specs generated per module for discoverability

---

## Character Generation and Tracking

- Template-driven character creation flow
- World-specific eligibility rules (age, class, faction, stat caps)
- Approval workflow:
  - Draft -> Submitted -> Approved/Rejected
- Time-series stat history for auditability
- World transfer model with migration rules for incompatible modules

---

## Economy Tracking

- Ledger-style double-entry transactions
- Immutable transaction records
- Admin controls for mint/burn with audit requirements
- Fraud controls: velocity limits, anomaly alerts, suspension flags
- Reconciliation tools for staff

---

## Rulebook Management

- Versioned rulebook documents per world
- Modules can append sections/tables to rulebooks
- Effective-date publishing (future rule changes)
- Character validation engine checks against active rulebook version

---

## Delivery Roadmap

### Phase 1: Foundations
- Identity/auth
- World creation and role model
- Character basic profile
- Module registry + enable/disable workflow

### Phase 2: Core gameplay
- Rulebook module
- Character generation module
- Character tracking module

### Phase 3: Economy and advanced systems
- Economy module + audit dashboards
- Event hooks, notifications, and mobile UX polish

### Phase 4: Ecosystem
- Public module SDK
- Marketplace / module sharing
- Advanced analytics and anti-abuse tooling

---

## Suggested MVP Scope

Start with these modules enabled:
1. Rulebook
2. Character generation
3. Character tracking
4. Optional economy (beta)

This gives world owners immediate control while keeping technical risk manageable.
