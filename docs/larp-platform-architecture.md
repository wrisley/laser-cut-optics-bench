# LARP Platform Architecture

## 1. Purpose
This document proposes a practical, production-ready architecture for a **LARP (Live Action Role Play) management platform**. The platform supports:

- Event and campaign organization
- Character and faction management
- Ticketing and registration
- Logistics, scheduling, and check-in
- In-game communications and referee tools
- After-action reporting and analytics

The design favors modularity, operational simplicity, and progressive scaling from a single event organizer to multi-org operation.

---

## 2. System Context

### Primary actors
- **Players**: Register, build characters, receive event updates, check in.
- **Game Masters / Organizers**: Create campaigns, events, quests, and moderation actions.
- **Referees / Staff**: Manage safety incidents, adjudication notes, and in-game operations.
- **Admins**: Multi-tenant management, billing, and policy controls.

### External integrations
- Payment processor (e.g., Stripe)
- Email/SMS provider (e.g., SES/Twilio)
- Identity provider (OIDC providers)
- Object storage/CDN for media assets

---

## 3. Architectural Style
A **modular monolith** is recommended for early and mid-stage scale, with clean internal boundaries and asynchronous workflows. This enables:

- Fast iteration for a small engineering team
- Straightforward deployment and observability
- Gradual extraction of high-load modules into services when justified

Core internal modules:
1. Identity & Access
2. Player Profiles & Characters
3. Campaigns, Events, and Scheduling
4. Registration & Ticketing
5. In-Game Operations (ref tools, incidents, handouts)
6. Messaging & Notifications
7. Reporting & Audit

---

## 4. High-Level Component Diagram (Logical)

```text
[Web App] ----\
[Mobile App] --- > [API Gateway / BFF] --> [Application Core]
[Staff Console]-/                 |               |
                                  |               +--> [PostgreSQL]
                                  |               +--> [Redis]
                                  |               +--> [Message Broker]
                                  |               +--> [Object Storage]
                                  |
                                  +--> [Auth Provider]
                                  +--> [Payment Provider]
                                  +--> [Email/SMS Provider]
```

### Client surfaces
- **Web app**: Main player and organizer experience.
- **Mobile app/PWA**: On-site check-in, schedules, and notifications.
- **Staff console**: Operational tools with role-restricted workflows.

### Backend edge
- **API Gateway/BFF** handles auth context, request shaping, rate limiting, and versioning.

---

## 5. Data Architecture

### Primary stores
- **PostgreSQL** (system of record):
  - tenants
  - users
  - campaigns
  - events
  - characters
  - factions
  - registrations
  - payments (reconciled state)
  - incidents / safety logs
  - audits
- **Redis**:
  - session cache
  - request throttling
  - short-lived event state (check-in queues, live dashboard counters)
- **Object Storage (S3-compatible)**:
  - character sheets (attachments)
  - map files / handouts
  - consent forms and policy documents

### Data model principles
- **Tenant-scoped IDs** for all business entities.
- **Soft-delete with audit trail** for compliance-sensitive records.
- **Append-only event logs** for critical moderation and safety workflows.
- **PII separation** (sensitive profile attributes isolated with strict access policy).

---

## 6. Domain Module Responsibilities

### 6.1 Identity & Access
- OIDC + email/password fallback
- MFA for staff and organizers
- RBAC + policy checks (tenant roles, event roles, emergency roles)

### 6.2 Character & Faction Management
- Character templates and approvals
- Inventory/equipment abstractions (optional rules module)
- Relationship graph (party/faction memberships)

### 6.3 Campaigns & Event Planning
- Campaign timelines
- Event sessions, locations, and capacity constraints
- Plot hooks, objectives, and content packages

### 6.4 Registration & Ticketing
- Product catalog and ticket tiers
- Waitlist and transfer workflows
- Payment orchestration + webhook reconciliation
- Refund/cancellation policy engine

### 6.5 In-Game Operations
- Real-time check-in dashboard
- Safety incident recording and escalation
- GM/referee private notes and adjudication timeline

### 6.6 Messaging & Notifications
- Email, SMS, and in-app notifications
- Template system with locale support
- Delivery status tracking and retry policies

### 6.7 Reporting & Audit
- Attendance and retention metrics
- Revenue and conversion funnels
- Compliance exports and immutable audit queries

---

## 7. API Design

### API shape
- REST for transactional core flows
- Optional GraphQL read facade for rich organizer dashboards
- Webhooks for event-driven integrations

### Versioning and compatibility
- URI or header versioning (`/v1/...`)
- Backward-compatible schema migration with deprecation windows
- Idempotency keys for payment and registration commands

### Security controls
- JWT access tokens with short TTL
- Fine-grained authorization checks at command boundaries
- Rate limits per IP, user, and tenant

---

## 8. Asynchronous Workflows

Use a broker (e.g., RabbitMQ/SQS/Kafka-lite) for:
- Payment webhook processing
- Notification fan-out
- Report materialization
- Import/export processing

Event examples:
- `registration.created`
- `payment.reconciled`
- `checkin.completed`
- `incident.reported`

Design notes:
- Consumers are idempotent.
- Dead-letter queues are monitored.
- Critical events include correlation IDs and tenant IDs.

---

## 9. Reliability, Security, and Compliance

### Reliability
- Blue/green or rolling deploys
- Health checks + readiness gates
- Point-in-time recovery for PostgreSQL
- Background job retries with exponential backoff

### Security
- Data encryption in transit and at rest
- Secret management via cloud secret store
- Structured security logs and anomaly alerts

### Compliance / safety
- Consent and waiver tracking
- Incident data retention policy
- Role-based visibility for sensitive incident records

---

## 10. Deployment Topology

### Recommended baseline
- Containerized app deployed to managed Kubernetes or ECS/Fargate
- Managed PostgreSQL
- Managed Redis
- Managed object storage + CDN
- Managed message queue

### Environments
- `dev` (shared)
- `staging` (production-like)
- `prod`

Each environment should include isolated credentials, queues, and storage buckets.

---

## 11. Observability

- **Metrics**: latency, error rate, queue depth, check-in throughput
- **Logs**: structured JSON with request and tenant correlation IDs
- **Tracing**: distributed traces across API, jobs, and provider calls
- **SLOs**:
  - API availability: 99.9%
  - P95 read latency: < 300ms
  - P95 command latency: < 700ms

---

## 12. Scaling Roadmap

### Phase 1 (0–10k MAU)
- Modular monolith
- One primary region
- Daily analytics ETL

### Phase 2 (10k–100k MAU)
- Extract Notifications and Reporting as separate services
- Add read replicas and cache hierarchy
- Introduce multi-region DR strategy

### Phase 3 (100k+ MAU)
- Extract Registration/Payments for independent scaling
- Multi-region active-passive or active-active for API layer
- Partition large audit and incident tables by tenant/time

---

## 13. Risks and Mitigations

- **Operational complexity creep**: enforce module boundaries and architecture decision records.
- **Payment reconciliation drift**: strong idempotency + periodic reconciliation jobs.
- **On-site connectivity issues**: offline-capable check-in workflow with local queue sync.
- **Staff misuse of sensitive data**: immutable audit trails + least-privilege defaults.

---

## 14. Open Questions and Current Answers

1. Should event check-in support fully offline mode on mobile devices?  
   **Answer:** Yes.
2. Is custom rules-engine scripting required for different LARP systems?  
   **Answer:** Yes.
3. What are legal data-retention requirements by region for incident reports?  
   **Answer:** Unknown (requires legal/compliance review by target region).
4. Are third-party community tools expected to integrate via public APIs?  
   **Answer:** Yes.
