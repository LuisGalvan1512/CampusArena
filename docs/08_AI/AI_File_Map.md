# Campus Arena

# AI File Map v1.0

This map defines the designated folder structure and file locations within the monorepo to ensure architectural cleanliness.

---

# 1. Apps Directory (`apps/`)

### `apps/web/` (Next.js App Router)
- **`src/app/`**: Page routing structure.
  - `(public)/` ➔ Landing page, rules, brackets, public profiles.
  - `(competidor)/` ➔ Student dashboard, registrations, billing forms, legacy views.
  - `(organizador)/` ➔ Organizer dashboards, payments verification inbox, tournament creations.
- **`src/components/`**: Specific components only used in the web application (layout, headers).
- **`src/hooks/`**: App-level state and server query hooks.

### `apps/api/` (NestJS REST API)
- **`src/modules/`**: Modular backend domains.
  - `auth/` ➔ Controllers, services, and models for Identity.
  - `profile/` ➔ Competidor information.
  - `organization/` ➔ Schools and campus details.
  - `games/` ➔ Supported games configurations.
  - `tournament/` ➔ Tournament management.
  - `payments/` ➔ Receipts and approvals.
  - `competition/` ➔ Brackets generator and matchup schedules.
  - `notifications/` ➔ Websockets gates and email senders.
  - `statistics/` ➔ Scoring tables and rankings.

---

# 2. Packages Directory (`packages/`)

- **`packages/ui/`**: Shared Design System React UI Kit components.
  - `src/buttons/` ➔ Primary, secondary, and state action buttons.
  - `src/inputs/` ➔ Text fields, textareas, file uploaders.
  - `src/cards/` ➔ Tournament cards, matchup cards, profile previews.
  - `src/dialogs/` ➔ Modals, overlays, confirmations.
  - `src/brackets/` ➔ Interactive tree elements.
  - `src/badges/` ➔ State indicators.
- **`packages/types/`**: Single Source of Truth for shared TypeScript type definitions and DTO schemas.
- **`packages/config/`**: Shared ESLint, Prettier, and TSConfig templates.
- **`packages/utils/`**: Reusable helper functions.

---

# 3. Database Directory (`database/`)

- **`database/prisma/`**: Prisma configurations (`schema.prisma`).
- **`database/migrations/`**: Generated SQL migrations.
- **`database/seed/`**: Mock data seeds for development environments.
