# Campus Arena

# AI Context Book v1.0

This document is optimized for AI Developer Agent context parsing. It defines the core stack, modules, global architectural rules, and project boundaries for Campus Arena.

---

# 1. Project Profile

- **Project Name:** Campus Arena
- **Description:** SaaS eSports and competitive tournament platform for educational institutions.
- **Tenancy:** Multitenant-ready (designed for isolating organization scopes under `organization` schema).
- **Core Goal:** Track student competitors, manage registrations, validate payments, run game-agnostic brackets (Competition Engine), and preserve competitive history (legacy).

---

# 2. Technology Stack

- **Monorepo:** Turborepo + npm workspaces.
- **Frontend:** Next.js (App Router + React Server Components).
- **Backend:** NestJS (TypeScript).
- **ORM:** Prisma ORM.
- **Database:** PostgreSQL (with MultiSchema support enabled).
- **Styling:** Tailwind CSS.
- **Component Base:** shadcn/ui.
- **Animations:** Framer Motion.
- **State Management:** TanStack Query (Server State) & Zustand (Client State).
- **Form Validation:** React Hook Form + Zod.
- **Testing:** Vitest & React Testing Library (Frontend), Jest (Backend), Playwright (E2E).

---

# 3. Global Architecture Rules

- **Strict Layering (Backend):** `Controller ➔ Service ➔ Repository ➔ Prisma ORM`.
  - Controllers must only handle transport layer code, routing, and DTO validations.
  - Services must contain the business logic.
  - Repositories must abstract database interactions.
- **No Direct UI-to-Database access:** Frontend apps must always consume NestJS APIs.
- **Zero Business Logic duplication:** Lógica de negocio (como el cálculo del win rate) debe residir únicamente en el backend.
- **End-to-End Type Safety:** Share TS interfaces via `@campus-arena/types` workspace package.

---

# 4. Core Modules (Bounded Contexts)

1. **Identity (`auth`):** Handles registration, logins, JWT session management, password resets, and role assignments.
2. **User Profile (`profile`):** User academic details, biography, privacy configurations, and social links.
3. **Organizations (`organization`):** Schools, campuses, active seasons, and organizers.
4. **Games (`games`):** Video game catalog and Player Tag associations (`GameProfile`).
5. **Tournament Management (`tournament`):** Creating, updating, and rules management of tournaments.
6. **Registration (`tournament`):** Requests to register, and candidate player listings.
7. **Payments (`payments`):** Receipt storage, payment status validation, and history.
8. **Competition Engine (`competition`):** Single elimination brackets generator, matchup scheduling, game set scoring, and walkovers.
9. **Statistics (`statistics`):** Compiles match wins, losses, and win rates segmentated by game.
10. **Achievements (`achievements`):** Automated medals and badge allocations.
11. **Notifications (`notifications`):** Email queue and real-time alerts.
12. **Community (`community`):** Platform news, announcements, and galleries.
13. **Administration (`administration`):** Audit logging, global config, and tenant approvals.
14. **Analytics (`analytics`):** KPIs and reporting dashboards.
