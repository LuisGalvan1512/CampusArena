# Campus Arena

# AI Coding Rules v1.0

This document defines coding standard rules, conventions, and quality restrictions for any AI developer agent working on Campus Arena.

---

# 1. TypeScript Coding Rules

- **Enable Strict Mode:** No implicit `any`, strict null checks, and strict function parameter checks.
- **Explicit Types:** Every function signature (parameters and return values) must have explicit TypeScript types.
- **Named Exports Only:** Do not use `export default` for core modules, classes, or types (except for page route entry points in Next.js).
- **No Direct Any:** If a type is unknown, use `unknown` instead of `any`, and validate/cast it with Zod.

---

# 2. React & UI Component Rules

Every component must:
1. Use functional components with typed properties.
2. Have explicit loading states (skeletons).
3. Have explicit empty states (with action CTAs, no blank layouts).
4. Have explicit error states (user-friendly error alerts).
5. Include accessibility labels (`aria-label`, correct semantic HTML tags).

Never:
- Use inline styles (always use Tailwind CSS utility classes).
- Hardcode user-facing strings (maintain localizations or constants).
- Duplicate business logic inside component hooks.

---

# 3. Backend & NestJS Rules

Every module must:
1. Implement DTOs (Data Transfer Objects) with `class-validator` decorators for payload validation.
2. Encapsulate business logic in Services and database access in Repositories.
3. Throw standard `HttpException` classes (e.g. `NotFoundException`, `BadRequestException`) with meaningful error codes.
4. Have OpenAPI (`@nestjs/swagger`) documentation decorators for all controller routes and schemas.

---

# 4. Testing Mandates

- **Unit Testing:** Write unit tests for all utility helper functions and NestJS business services.
- **Integration Testing:** Validate controller routes, payload validations, and error handling.
- **E2E Testing:** Critical user journeys must be covered by Playwright specs.
