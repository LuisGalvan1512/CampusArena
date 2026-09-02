# Campus Arena

# Software Architecture Document (SAD)

**Versión:** 1.0

**Estado:** Arquitectura Base

---

# 1. Propósito

Este documento define la arquitectura oficial de Campus Arena. Su objetivo es garantizar que el sistema sea:
- Escalable.
- Seguro.
- Modular.
- Fácil de mantener.
- Preparado para múltiples instituciones.
- Preparado para nuevos videojuegos.
- Preparado para aplicaciones móviles.
- Preparado para futuras integraciones.

Toda decisión técnica deberá respetar esta arquitectura.

---

# 2. Visión Técnica

Campus Arena será una plataforma SaaS orientada a la gestión de torneos de videojuegos para instituciones educativas y organizaciones. 

La arquitectura debe permitir comenzar con un MVP para una sola institución (Tecsup) y evolucionar posteriormente hacia una plataforma multiinstitución (SaaS multitenant) sin reescribir la aplicación.

---

# 3. Principios Arquitectónicos

- **Modularidad:** Cada dominio del negocio será independiente.
- **Escalabilidad:** Cada módulo podrá crecer sin afectar a los demás.
- **Reutilización:** Los componentes visuales y la lógica común deberán compartirse siempre que sea posible.
- **Seguridad:** La seguridad será un requisito transversal en todos los módulos.
- **Observabilidad:** El sistema deberá registrar eventos, errores y métricas para facilitar el monitoreo y la resolución de problemas.

---

# 4. Arquitectura General

La plataforma seguirá una arquitectura en capas desacoplada.

```text
Cliente (Next.js)
       │
       ▼
API REST (NestJS)
       │
       ▼
Servicios de Dominio (Lógica de Negocio)
       │
       ▼
Repositorios (Acceso a Datos / Prisma)
       │
       ▼
PostgreSQL
```

Los servicios externos (almacenamiento, correo, APIs de juegos) se integrarán mediante adaptadores (puertos y adaptadores) para mantener el desacoplamiento.

---

# 5. Stack Tecnológico

## Frontend
- **Framework:** `Next.js` (App Router + React Server Components)
- **Biblioteca:** `React`
- **Lenguaje:** `TypeScript`
- **Estilos:** `Tailwind CSS`
- **UI:** `shadcn/ui` (basado en Radix UI)
- **Animaciones:** `Framer Motion`
- **Gestión de Consultas:** `TanStack Query` (React Query)
- **Formularios:** `React Hook Form`
- **Validación de Esquemas:** `Zod`

## Backend
- **Framework:** `NestJS` (TypeScript)
- **ORM:** `Prisma ORM`
- **Seguridad & Sesión:** `JWT` (Access + Refresh Token) & `Passport`
- **Documentación de API:** `Swagger / OpenAPI`

## Base de Datos
- **Motor:** `PostgreSQL`

## Almacenamiento
- **Servicio:** `Supabase Storage` (MVP) / `AWS S3` (opcional para futuras versiones)

## Tiempo Real (Real-time)
- **Tecnología:** `WebSockets` (Soporte nativo de NestJS / Socket.IO)
- **Uso:** Actualización de brackets en vivo, notificaciones instantáneas y resultados de partidas en tiempo real.

## Cache
- **Servicio:** `Redis` (cuando el volumen de usuarios lo justifique)

## Infraestructura & Deployment
- **Frontend:** Vercel
- **Backend:** Railway, Render o Fly.io
- **Base de Datos:** Neon o Supabase PostgreSQL

---

# 6. Arquitectura del Monorepo

El repositorio se organizará mediante Turborepo para gestionar de forma eficiente el frontend, el backend y los paquetes compartidos:

```text
campus-arena/
├── apps/
│   ├── web/                    # Frontend principal (Next.js)
│   ├── api/                    # Backend API (NestJS)
│   └── admin/                  # Panel Administrativo global (opcional futuro)
│
├── packages/
│   ├── ui/                     # Librería de componentes visuales (Tailwind + shadcn)
│   ├── config/                 # Configuración de ESLint, Prettier, TSConfig
│   ├── types/                  # Interfaces e intercambios de tipo TypeScript compartidos
│   ├── utils/                  # Utilidades y funciones auxiliares compartidas
│   └── constants/              # Constantes globales compartidas
│
├── database/
│   ├── prisma/                 # Schema de base de datos (schema.prisma)
│   ├── migrations/             # Migraciones SQL de Prisma
│   └── seed/                   # Scripts de población de base de datos
│
├── docs/                       # Toda la documentación del proyecto (.md)
├── scripts/                    # Scripts de automatización de desarrollo
└── .github/                    # Workflows de CI/CD (GitHub Actions)
```

---

# 7. Módulos del Sistema

La plataforma estará fragmentada en módulos desacoplados de negocio:
- **Autenticación (Auth):** Registro, login, refresh y recuperación de claves.
- **Usuarios (Users):** Gestión de perfiles y vinculación de Player Tags.
- **Organizaciones:** Gestión de instituciones educativas y campus.
- **Juegos (Games):** Base de videojuegos disponibles y reglas específicas.
- **Temporadas:** Agrupaciones temporales de torneos.
- **Torneos:** Gestión y ciclo de vida de las competencias.
- **Inscripciones:** Procesamiento de solicitudes de participación.
- **Pagos:** Carga y validación de comprobantes de pago.
- **Llaves (Brackets):** Generación y actualización de brackets.
- **Resultados:** Registro de marcadores oficiales de partidas.
- **Medallas:** Recompensas automáticas de gamificación.
- **Estadísticas:** Indicadores de competidores y torneos.
- **Comunidad & Noticias:** Feed de actividades y publicaciones.
- **Notificaciones:** Alertas en tiempo real por WebSockets y correo.
- **Administración:** Gestión de roles, permisos globales y moderación de contenido.

*Cada módulo tendrá su propia lógica y nunca accederá directamente a la base de datos de otro módulo.*

---

# 8. Seguridad

- **Cifrado de Contraseñas:** Algoritmo robusto **Argon2** (o `bcrypt`).
- **Autenticación:** Tokens JWT de corta duración + Refresh Tokens de larga duración almacenados en cookies seguras (`httpOnly`, `secure`, `sameSite`).
- **Protección CSRF:** Activación en los endpoints sensibles que utilicen cookies de sesión.
- **Validación de Datos:** En frontend (con Zod) y en backend mediante class-validator en DTOs.
- **Rate Limiting:** Control de peticiones (throttling) en endpoints críticos.
- **Registro de Auditoría:** Log de auditoría inmutable para cambios administrativos y de estado del torneo.
- **Control de Acceso (RBAC):** Restricciones de rutas mediante Guards de roles y permisos.

---

# 9. Integraciones

El sistema interactuará con servicios externos mediante adaptadores desacoplados:
- **APIs de Videojuegos:** API oficial de Clash Royale y API oficial de Brawl Stars para verificación de tags y sincronización.
- **Pasarelas de Pago:** Integración de Yape, Plin y pasarelas de pago como Mercado Pago según disponibilidad en el futuro.
- **Servicio de Correo Electrónico:** Envío de correos transaccionales (verificación, avisos) mediante adaptadores para SendGrid, Resend o similar.
- **Servicio de Almacenamiento:** Carga de comprobantes de pago y banners mediante almacenamiento S3 (Supabase Storage / AWS S3).

---

# 10. Escalabilidad

El diseño arquitectónico permite de forma flexible:
- Agregar nuevos videojuegos sin modificar la estructura del bracket.
- Soportar un esquema multiinstitucional (multi-tenant) aislando datos de cada organización.
- Escalar de forma modular separando servicios que requieran mayor cómputo (ej. generación automática de brackets).
- Exponer una API pública para desarrolladores y bots en fases avanzadas.
- Desarrollar aplicaciones móviles consumiendo la misma API del monorepo.

---

# 11. Calidad del Software

- **Código Limpio & SOLID:** Prácticas estructuradas de desarrollo.
- **Domain-Driven Design (DDD):** Lógica orientada al lenguaje de dominio.
- **Cobertura de Pruebas:** Pruebas unitarias, de integración y e2e.
- **Integración Continua (CI):** Ejecución automatizada de lints, tests y builds en cada Pull Request.

---

# 12. Observabilidad

El sistema registrará de forma persistente:
- Errores y excepciones del sistema en tiempo real.
- Eventos de negocio críticos (ej. creación de llaves, aprobación de pago).
- Logs de acceso a la plataforma.
- Logs administrativos de auditoría.

---

# 13. Evolución

La arquitectura está preparada para incorporar, en versiones futuras:
- **Aplicación móvil nativa** (mediante React Native o similar conectada al monorepo).
- **Sistema avanzado de ligas y equipos.**
- **Marketplace e integraciones de streaming en directo.**
- **Integración de Inteligencia Artificial** para la generación de resúmenes de torneos y recomendaciones.
- **Rankings globales e interactivos de competidores.**
