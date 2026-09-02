# Campus Arena

# MASTER CONTEXT v1.0

This is the single entry point for any AI agent interacting with Campus Arena. Read this file first, then use the links below to load detailed context as required by your task.

---

# 1. Project Vision & Concept
Campus Arena is a multitenant SaaS eSports tournament manager for students. 
- **Language & Terms:** [Project_Glossary.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/00_Project/Project_Glossary.md)
- **Conceptual Flow:** [01_domain_model.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/00_Project/01_domain_model.md) & [02_event_storming.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/00_Project/02_event_storming.md)

---

# 2. Scope & Status (MVP Freeze)
- **Current Status:** `MVP Freeze` / `Sprint 0` (No application code allowed).
- **Active Sprint & Scope Rules:** [AI_Project_Rules.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/08_AI/AI_Project_Rules.md)
- **Strategic Backlog:** [09_product_backlog_estrategico.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/01_Product/09_product_backlog_estrategico.md)

---

# 3. Feature Specifications (Execution Ready 🚀)
- [Auth.spec.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/specifications/Auth.spec.md): Authentication & Identity specifications.
- [Profile.spec.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/specifications/Profile.spec.md): Competitor profile, academic rules, and game tags linking.
- [Tournament.spec.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/specifications/Tournament.spec.md): Tournament creation, configurations, publication and lifecycle specifications.
- [RegistrationPayment.spec.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/specifications/RegistrationPayment.spec.md): Competitor registration requests, manual billing proof verification, waitlisting and cup reserve transactions.
- [Competition.spec.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/specifications/Competition.spec.md): Single elimination bracket draw generation, round matchups scheduling, and game set scoring logic specs.

---

# 4. Reference Frameworks

### Product & UX Requirements
- [06_prd_epic_001_authentication_identity.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/01_Product/06_prd_epic_001_authentication_identity.md)
- [06_prd_epic_002_profile_legacy.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/01_Product/06_prd_epic_002_profile_legacy.md)
- [06_prd_epic_003_tournaments_seasons.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/01_Product/06_prd_epic_003_tournaments_seasons.md)
- [13_mvp_wireframes_specification.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/03_UX/13_mvp_wireframes_specification.md)

### Design & Theme Specifications
- [17_design_tokens.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/04_Design/17_design_tokens.md)
- [18_ui_kit.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/04_Design/18_ui_kit.md)
- [19_motion_guidelines.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/04_Design/19_motion_guidelines.md)
- [AI_UI_Rules.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/08_AI/AI_UI_Rules.md)

### Software & Database Engineering
- [20_software_architecture_document.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/05_Engineering/20_software_architecture_document.md)
- [29_engineering_playbook.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/05_Engineering/29_engineering_playbook.md)
- [24_database_architecture_conceptual.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/06_Database/24_database_architecture_conceptual.md)
- [25_erd_001_identity.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/06_Database/25_erd_001_identity.md)
- [AI_Coding_Rules.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/08_AI/AI_Coding_Rules.md)
- [AI_Database_Rules.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/08_AI/AI_Database_Rules.md)
- File map targets: [AI_File_Map.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/08_AI/AI_File_Map.md)

---

# 5. Architecture Decisions (ADR Index)
Decisions are documented in `docs/10_Decisions/`:
- [ADR-001](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/10_Decisions/ADR-001.md): NestJS
- [ADR-002](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/10_Decisions/ADR-002.md): Prisma ORM
- [ADR-003](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/10_Decisions/ADR-003.md): JWT + Refresh Tokens
- [ADR-004](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/10_Decisions/ADR-004.md): Tailwind CSS
- [ADR-005](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/10_Decisions/ADR-005.md): Dark Mode First
- [ADR-006](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/10_Decisions/ADR-006.md): Monorepo Layout
- [ADR-007](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/10_Decisions/ADR-007.md): Turborepo Build
- [ADR-008](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/10_Decisions/ADR-008.md): shadcn/ui Componentry
