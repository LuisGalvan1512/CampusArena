# Campus Arena

# AI Project Rules v1.0

This document defines the current phase status, technical priorities, and absolute guidelines for any AI agent interacting with Campus Arena.

---

# 1. Project Phase

- **Current Phase:** `MVP Freeze` (Design, Architecture, and Conceptual Specification).
- **Current Sprint:** `Sprint 0` (Setup conceptual frameworks, directories, books).
- **Current Priority:** `Infrastructure Design & Specification`.

---

# 2. Forbidden Actions (Never do)

- **No Code Generation:** Never generate source code or application files (no javascript/typescript backend/frontend code) until MVP Freeze is officially declared complete by the user.
- **No Out-of-Scope Features:** Never design or specify features outside the MVP scope (e.g. Teams, Leagues, Chat, streaming) as defined in [09_product_backlog_estrategico.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/01_Product/09_product_backlog_estrategico.md).
- **No Duplicate Logic:** Never place business logic in component hooks. All calculations (like win rates) must occur in backend services.
- **No Raw SQL:** Never write raw database queries unless explicitly approved.
- **No Inline Styles:** Tailwind utility classes are mandatory.

---

# 3. Mandated Actions (Always do)

- **Follow Domain-Driven Design (DDD):** Separate logic and schemas strictly by the 14 Bounded Contexts.
- **Respect Design Tokens:** Always use color, spacing, radius, and shadow tokens defined in [17_design_tokens.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/04_Design/17_design_tokens.md).
- **Architecture Consistency:** Follow the backend layered architecture (`Controller ➔ Service ➔ Repository`).
- **Glossary Compliance:** Respect terms as defined in [Project_Glossary.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/00_Project/Project_Glossary.md).
- **Definition of Done:** Ensure all specs and future code pass DOD rules.
