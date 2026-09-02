# Campus Arena

# AI Database Rules v1.0

This document defines the strict rules, conventions, and database schema constraints for PostgreSQL and Prisma ORM in Campus Arena.

---

# 1. Primary & Foreign Keys

- **UUID Everywhere:** All tables must use UUIDv4 as their primary key. Never use auto-incrementing integers (`Int`) for primary keys.
  - *Prisma example:* `id String @id @default(uuid()) @db.Uuid`
- **Explicit Foreign Key Constraints:** Claves foráneas deben mapearse de forma explícita y coherente, usando `ON DELETE CASCADE` solo en tablas hijas dependientes directa e incondicionalmente (ej: `Session` -> `User`).

---

# 2. Control Audit Columns

Every table must include the following control columns:
- `createdAt` (`created_at` in DB): Date and time of record creation.
- `updatedAt` (`updated_at` in DB): Date and time of last record modification.
- `deletedAt` (`deleted_at` in DB): Nullable date/time column for soft deletes (borrado lógico).

---

# 3. Soft Delete Constraint

- **No Hard Deletes:** Competitive and historical user registries (e.g. `User`, `Tournament`, `Registration`, `Match`, `GameSet`) must never be physically deleted from the database. Use soft deletes (`deletedAt`) to maintain the integrity of brackets and the history of participants.

---

# 4. Indexes & Performance Rules

- **Foreign Key Indexing:** Every column representing a foreign key (`FOREIGN KEY`) must have a corresponding database index to optimize joins.
- **Unique Fields:** Unique columns (like `email`, `role_name`, `permission_code`) must have explicit `UNIQUE` indexes.
- **Automated Cleanup Indexes:** Columns used in cron job queries (like `Session.expiresAt`) must be indexed.

---

# 5. Schema Alterations & Raw Queries

- **Prisma Migrations Only:** All changes to the database structure (adding tables, columns, indexes, enums) must be done exclusively through Prisma migrations (`npx prisma migrate dev`).
- **No Direct Schema Updates:** Never modify columns manually or directly in production.
- **No Raw SQL:** Do not write raw SQL queries unless explicitly justified and approved (prefer using the Prisma Client).
