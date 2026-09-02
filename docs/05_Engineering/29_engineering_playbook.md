# Campus Arena

# Engineering Playbook

**Versión:** 1.0

**Estado:** Guía Oficial de Desarrollo

---

# 1. Objetivo
Establecer los estándares técnicos y de colaboración para garantizar que todo el código del proyecto sea consistente, mantenible y escalable.

---

# 2. Filosofía
Todo cambio en el sistema debe cumplir cuatro principios:
- **Claridad:** Código autoexplicativo, limpio y bien estructurado.
- **Consistencia:** Respetar los mismos patrones, estilos y nomenclaturas en todo el proyecto.
- **Reutilización:** Compartir componentes visuales y lógica común en los paquetes correspondientes.
- **Simplicidad:** Resolver problemas con la menor complejidad de código posible (YAGNI / KISS).

---

# 3. Stack Oficial

### Frontend
- **Framework:** Next.js (App Router)
- **Biblioteca:** React
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Componentes:** shadcn/ui
- **Animaciones:** Framer Motion

### Backend
- **Framework:** NestJS
- **Lenguaje:** TypeScript
- **ORM:** Prisma ORM
- **Base de Datos:** PostgreSQL

### Infraestructura
- **Frontend Deploy:** Vercel
- **Backend Deploy:** Railway o Render
- **Base de Datos:** Neon PostgreSQL
- **Almacenamiento (Storage):** Supabase Storage

---

# 4. Estructura del Monorepo

El código del proyecto se organizará físicamente de la siguiente manera:

```text
campus-arena/
├── apps/
│   ├── web/                    # Aplicación Frontend (Next.js)
│   └── api/                    # Aplicación Backend (NestJS)
│
├── packages/
│   ├── ui/                     # Componentes visuales compartidos (Tailwind + shadcn)
│   ├── config/                 # Configuraciones comunes (TSConfig, ESLint, Prettier)
│   ├── types/                  # Definición de tipos de datos comunes en TS
│   └── utils/                  # Helpers y utilidades compartidas
│
├── database/
│   ├── prisma/                 # Esquemas físicos y configuración de Prisma
│   ├── migrations/             # Archivos de migración de base de datos
│   └── seed/                   # Seeds de población de datos iniciales
│
├── docs/                       # Toda la documentación de diseño (Project Bible)
└── .github/                    # Workflows de CI/CD para GitHub Actions
```

---

# 5. Convenciones de Nombramiento

## Archivos
- **Componentes React:** `PascalCase`
  - *Ejemplo:* `TournamentCard.tsx`, `MatchCard.tsx`
- **Hooks Personalizados:** `camelCase` (empezando con *use*)
  - *Ejemplo:* `useTournament.ts`, `useAuth.ts`
- **Utilidades y Funciones:** `camelCase`
  - *Ejemplo:* `formatDate.ts`, `cn.ts`
- **Constantes:** `UPPER_SNAKE_CASE`
  - *Ejemplo:* `DEFAULT_PAGE_SIZE`, `MAX_FILE_SIZE`

---

# 6. Convenciones de Control de Versiones (Git)

## Nombres de Ramas (Branches)
- `main` ➔ Rama de producción estable.
- `develop` ➔ Rama de integración de desarrollo.
- `feature/nombre-funcionalidad` ➔ Nuevas características (ej: `feature/auth-register`).
- `fix/nombre-error` ➔ Corrección de bugs (ej: `fix/payment-upload-fail`).
- `hotfix/nombre` ➔ Correcciones urgentes aplicadas directamente sobre producción.

## Convención de Commits (Conventional Commits)
Todos los commits deben seguir el formato `tipo(ámbito): descripción corta en minúsculas`.
- `feat(auth): add login` (Nueva funcionalidad)
- `fix(profile): avatar upload` (Corrección de error)
- `docs(api): update endpoints` (Cambio en documentación)
- `style(ui): improve buttons` (Estilos, padding, colores, sin alterar lógica)
- `refactor(payment): simplify validation` (Cambio de código que no corrige error ni añade feature)

## Reglas de Pull Requests (PR)
Todo Pull Request deberá:
1. Tener una descripción clara de los cambios realizados.
2. Referenciar una tarea o issue específico del backlog.
3. Pasar todas las pruebas automáticas en el pipeline de integración.
4. Ser revisado y aprobado por al menos otro integrante del proyecto antes del merge.

---

# 7. Calidad del Código
Para asegurar la salud del repositorio, configuraremos las siguientes herramientas de análisis estático en la raíz:
- **ESLint:** Reglas de calidad y buenas prácticas de código.
- **Prettier:** Formateo automático de estilo y espaciado de archivos.
- **Husky & lint-staged:** Ejecución automática de lints y format antes de confirmar cada commit (`pre-commit hook`).
- **TypeScript Strict Mode:** Habilitado para evitar tipos implícitos y nulos no controlados.

---

# 8. Estrategia de Testing

### Frontend
- **Biblioteca:** Vitest + React Testing Library (para pruebas unitarias y de componentes React).

### Backend
- **Framework:** Jest (para controladores y servicios de NestJS).

### End-to-End (E2E)
- **Herramienta:** Playwright (para simular el flujo completo del usuario en el navegador).

---

# 9. Seguridad

- **Manejo de Secretos:** Está estrictamente prohibido subir archivos `.env`, credenciales de bases de datos, tokens de sesión o llaves de APIs al repositorio.
- **Variables de Entorno:** Todos los secretos se gestionarán mediante variables de entorno configuradas localmente y en el dashboard de los proveedores de despliegue (Vercel/Render).

---

# 10. Documentación de Módulos
Cada módulo del backend o frontend debe incluir su propio archivo `README.md` detallando:
- Responsabilidades exclusivas del módulo.
- Dependencias con otros módulos o servicios de terceros.
- Ejemplos de uso rápido o llamadas de métodos.

---

# 11. APIs y Contratos de Datos
- Toda API pública o privada expuesta por el backend deberá documentarse utilizando **OpenAPI / Swagger**.
- No se aceptarán Pull Requests con endpoints que carezcan de su documentación de Swagger correspondiente.

---

# 12. Base de Datos
- Todas las modificaciones de la estructura de tablas de la base de datos deben realizarse mediante **migraciones generadas por Prisma ORM**.
- Nunca se modificarán tablas o columnas de manera manual o directa en producción.

---

# 13. Principios SOLID
Todo desarrollo de software en Campus Arena deberá respetar los 5 principios SOLID:
- **S**ingle Responsibility (Responsabilidad única).
- **O**pen/Closed (Abierto a extensión, cerrado a modificación).
- **L**iskov Substitution (Sustitución de Liskov).
- **I**nterface Segregation (Segregación de interfaces).
- **D**ependency Inversion (Inversión de dependencias).

---

# 14. Definition of Done (Criterios de Terminado)
Una tarea o historia de usuario solo se considerará oficialmente terminada cuando:
1. El código compile correctamente sin advertencias.
2. Supere todas las pruebas unitarias e de integración correspondientes.
3. Cuente con documentación y Swagger actualizado (si aplica).
4. Haya sido revisado y aprobado en el Pull Request.
5. Cumpla con los estándares de calidad (sin errores de ESLint o de tipado).
