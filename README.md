<p align="center">
  <img src="https://api.dicebear.com/7.x/shapes/svg?seed=CampusArena&backgroundColor=E63946&shape1Color=1D3557&shape2Color=457B9D&size=120" width="80" />
</p>

<h1 align="center">🏟️ Campus Arena — Tecsup</h1>

<p align="center">
  <strong>Plataforma oficial de torneos de eSports universitarios para Tecsup</strong><br/>
  Gestión completa de torneos, brackets automáticos, rankings por juego y comunidad interactiva.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Estado-En%20Desarrollo-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/Frontend-Next.js%2016-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/Backend-NestJS%2012-E0234E?style=flat-square&logo=nestjs" />
  <img src="https://img.shields.io/badge/BD-Supabase%20PostgreSQL-3ECF8E?style=flat-square&logo=supabase" />
  <img src="https://img.shields.io/badge/ORM-Prisma%205-2D3748?style=flat-square&logo=prisma" />
  <img src="https://img.shields.io/badge/Monorepo-Turborepo-EF4444?style=flat-square&logo=turborepo" />
</p>

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Estado Actual del Desarrollo](#-estado-actual-del-desarrollo)
- [Tech Stack](#-tech-stack)
- [Arquitectura del Monorepo](#-arquitectura-del-monorepo)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Ejecución del Proyecto](#-ejecución-del-proyecto)
- [Credenciales de Prueba](#-credenciales-de-prueba)
- [Referencia de API](#-referencia-de-api)
- [Esquema de Base de Datos](#-esquema-de-base-de-datos)
- [Juegos Soportados](#-juegos-soportados)
- [Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [Roadmap — Funcionalidades Pendientes](#-roadmap--funcionalidades-pendientes)
- [Convenciones del Proyecto](#-convenciones-del-proyecto)
- [¿Cómo Contribuir?](#-cómo-contribuir)
- [Equipo](#-equipo)

---

## 🎮 Descripción del Proyecto

**Campus Arena** es la plataforma web oficial (en desarrollo) para la gestión integral de torneos de eSports presenciales y online dentro de **Tecsup (Sede Lima)**. Permite a los estudiantes:

- 🏆 **Inscribirse en torneos** de juegos como Clash Royale, Brawl Stars, Smash Bros, L4D2, eFootball y Dota 2.
- 🎯 **Vincular cuentas de juego** con validación automática vía APIs oficiales (Supercell, Steam).
- 📊 **Competir en brackets automáticos** de eliminación directa con generación de llaves.
- 🥇 **Ranking institucional** por juego con estadísticas en tiempo real.
- 💬 **Comunidad tipo foro** con publicaciones, reacciones y comentarios.
- 🔐 **Autenticación institucional** exclusiva con correos `@tecsup.edu.pe`.

---

## 📈 Estado Actual del Desarrollo

> **Última actualización:** Septiembre 2026

| Módulo | Estado | Progreso |
|---|---|---|
| 🔐 Autenticación (Google Workspace / JWT) | ✅ Funcional | 100% |
| 👤 Perfiles Públicos, Vista de Visitante y Muro de Firmas | ✅ Funcional | 100% |
| 🏆 CRUD de Torneos (Admin / Org) | ✅ Funcional | 100% |
| 📋 Inscripción a Torneos (Individual y Equipos con Roster) | ✅ Funcional | 100% |
| 🗡️ Generación de Brackets (Sorteo Aleatorio Oficial) | ✅ Funcional | 95% |
| 📊 Ranking Institucional y Medallero de Honor | ✅ Funcional | 90% |
| 💬 Comunidad / Foro | ✅ Funcional | 90% |
| 📧 Correos Transaccionales (Brevo SMTP) | ✅ Funcional | 90% |
| 👑 Panel de Administración, Moderación y Sanciones | ✅ Funcional | 95% |
| 🎓 Onboarding de Nuevos Estudiantes | ✅ Funcional | 100% |
| 📡 Centro de Notificaciones In-App (con Borrado y Vaciado) | ✅ Funcional | 100% |
| 🎨 Sistema de Diseño, Dual Theme y Branding Oficial | ✅ Funcional | 100% |
| 🌐 Deploy a Producción | 🔴 Pendiente | 0% |

---

## 🛠️ Tech Stack

### Frontend (`apps/web`)
| Tecnología | Versión | Uso |
|---|---|---|
| **Next.js** | 16.3 | Framework React con App Router, SSR |
| **React** | 19.2 | Librería de UI |
| **Tailwind CSS** | 4.x | Diseño utility-first responsive |
| **Zustand** | 5.x | Estado global (auth store) |
| **Framer Motion** | 13.x | Animaciones y transiciones |
| **Lucide React** | 1.37 | Iconografía SVG |

### Backend (`apps/api`)
| Tecnología | Versión | Uso |
|---|---|---|
| **NestJS** | 12.x | Framework Node.js con módulos |
| **Prisma** | 5.22 | ORM con multi-schema PostgreSQL |
| **Supabase** | Cloud | Base de datos PostgreSQL remota |
| **JWT** | vía `@nestjs/jwt` | Autenticación con access + refresh tokens |
| **Argon2** | 0.45 | Hashing seguro de contraseñas |
| **Nodemailer + Brevo** | SMTP | Correos transaccionales institucionales |
| **Swagger** | vía `@nestjs/swagger` | Documentación automática de API |

### Infraestructura
| Tecnología | Uso |
|---|---|
| **Turborepo** | Orquestación del monorepo |
| **pnpm** | Gestor de paquetes (workspaces) |
| **Vitest** | Framework de testing |
| **OxLint** | Linter rápido para TypeScript |

---

## 📁 Arquitectura del Monorepo

```
CampusArena/
├── apps/
│   ├── api/                          # Backend NestJS
│   │   ├── prisma/
│   │   │   └── schema.prisma         # Esquema completo multi-schema
│   │   └── src/
│   │       ├── auth/                 # Módulo de autenticación
│   │       │   ├── auth.controller.ts
│   │       │   ├── auth.service.ts
│   │       │   ├── dto/              # RegisterDto, LoginDto, GoogleAuthDto
│   │       │   ├── guards/           # JwtAuthGuard
│   │       │   ├── strategies/       # JWT Strategy (Passport)
│   │       │   └── decorators/       # @CurrentUser()
│   │       ├── profile/              # Perfiles públicos, medallas y muro de firmas
│   │       ├── tournament/           # CRUD de torneos
│   │       ├── registration/         # Inscripciones individuales y por equipos
│   │       ├── competition/          # Brackets (sorteo aleatorio) + matchups + resultados
│   │       ├── ranking/              # Leaderboard por juego y palmarés
│   │       ├── community/            # Posts, comentarios, reacciones
│   │       ├── admin/                # Moderación, sanciones y apelaciones
│   │       ├── notifications/        # Notificaciones in-app
│   │       ├── mail/                 # Servicio de correos (Brevo SMTP)
│   │       ├── common/
│   │       │   ├── interceptors/     # ResponseInterceptor (formato unificado)
│   │       │   ├── filters/          # HttpExceptionFilter
│   │       │   ├── guards/           # RolesGuard
│   │       │   └── decorators/       # @Roles()
│   │       └── prisma/               # PrismaService (singleton)
│   │
│   └── web/                          # Frontend Next.js
│       └── src/
│           ├── app/
│           │   ├── page.tsx           # Landing page principal
│           │   ├── auth/
│           │   │   ├── login/         # Login institucional Google
│           │   │   └── register/      # Registro manual (legacy)
│           │   ├── tournaments/       # Listado, detalle e inscripción
│           │   ├── profile/           # Perfil propio (con Vista de Visitante)
│           │   │   └── [id]/          # Perfil público de competidor + Muro de firmas
│           │   ├── ranking/           # Leaderboard institucional
│           │   ├── community/         # Foro de la comunidad
│           │   ├── admin/
│           │   │   └── organizers/    # Panel de administración y moderación
│           │   ├── live/              # Vista de brackets en vivo
│           │   └── dashboard/         # Dashboard del organizador / competidor
│           ├── components/
│           │   ├── Navbar.tsx         # Barra de navegación optimizada y despejada
│           │   ├── Footer.tsx         # Footer institucional Tecsup
│           │   ├── BracketView.tsx    # Visualizador de brackets interactivo con SVG láser
│           │   ├── TournamentCard.tsx # Tarjeta de torneo con arte oficial HD
│           │   ├── RegistrationWizardModal.tsx  # Wizard de inscripción (1v1 y equipos)
│           │   ├── EditTournamentModal.tsx      # Editar torneo (admin)
│           │   ├── DeleteTournamentModal.tsx    # Eliminar torneo (admin)
│           │   ├── NotificationCenterDrawer.tsx # Centro de notificaciones con descarte y vaciado
│           │   └── ThemeToggle.tsx    # Selector de tema dual (Oscuro / Claro)
│           ├── context/
│           │   └── AuthContext.tsx     # Zustand auth store global
│           └── lib/
│               ├── api.ts             # HTTP client con auto-refresh
│               ├── games.ts           # Catálogo de juegos soportados
│               └── storage.ts         # Utilidades de almacenamiento local
│
├── specifications/                    # Documentos de especificación técnica
│   ├── Auth.spec.md
│   ├── Competition.spec.md
│   ├── Profile.spec.md
│   ├── RegistrationPayment.spec.md
│   └── Tournament.spec.md
│
├── docs/                              # Documentación del proyecto
├── package.json                       # Root monorepo config
├── turbo.json                         # Turborepo pipeline
└── pnpm-workspace.yaml               # Workspaces config
```

---

## 🚀 Requisitos Previos

- [Node.js](https://nodejs.org/) **v18** o superior
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- Conexión a internet (la BD está en Supabase Cloud)

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/LuisGalvan1512/CampusArena.git
cd CampusArena
```

### 2. Instalar dependencias del monorepo
```bash
pnpm install
```

### 3. Configurar variables de entorno
Crear archivo `apps/api/.env`:
```env
# === Base de Datos (Supabase - Solicitar credenciales al admin) ===
DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

# === JWT ===
JWT_SECRET="campus-arena-jwt-secret-change-in-production-2026"
JWT_EXPIRATION=900

# === Frontend URL (CORS) ===
FRONTEND_URL="http://localhost:3000"

# === Servicio de Correo (Brevo SMTP) ===
# Pedir las credenciales al administrador del proyecto
BREVO_API_KEY="<pedir-a-luis.galvan>"
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT=587
SMTP_USER="<pedir-a-luis.galvan>"
SMTP_PASS="<pedir-a-luis.galvan>"
SMTP_FROM="luis.galvan@tecsup.edu.pe"
```

### 4. Sincronizar la Base de Datos
```bash
cd apps/api
npx prisma db push
npx prisma generate
cd ../..
```

---

## 🎮 Ejecución del Proyecto

### Opción A — Con Turborepo (recomendado):
```bash
pnpm run dev
```
Esto arranca ambos servicios simultáneamente.

### Opción B — Terminales separadas:

**Terminal 1 — Backend (Puerto 3001):**
```bash
cd apps/api
pnpm run dev
```

**Terminal 2 — Frontend (Puerto 3000):**
```bash
cd apps/web
pnpm run dev
```

### URLs de Desarrollo

| Servicio | URL |
|---|---|
| 🌐 Frontend (Next.js) | http://localhost:3000 |
| 🔌 API REST (NestJS) | http://localhost:3001/api/v1 |
| 📖 Swagger Docs | http://localhost:3001/api/docs |

---

## 🧪 Credenciales de Prueba

### Cuenta de Administrador
```
Email:    luis.galvan@tecsup.edu.pe
Método:   Click en "Continuar con Google" en la página de login
Rol:      ADMIN (acceso total al panel de administración)
```

### Crear Cuenta de Estudiante (prueba)
```
1. En la página de login (/auth/login), click en "¿Ingresar con otro correo @tecsup.edu.pe?"
2. Ingresar cualquier email del dominio @tecsup.edu.pe
   Ejemplo: tu.nombre@tecsup.edu.pe
3. El sistema crea automáticamente la cuenta con rol STUDENT
4. Se muestra el modal de bienvenida (onboarding) para nuevos usuarios
```

### Restricciones de Acceso
- ⚠️ **Solo se aceptan correos `@tecsup.edu.pe`** — cualquier otro dominio es rechazado.
- 🔑 `luis.galvan@tecsup.edu.pe` recibe automáticamente el rol **ADMIN**.
- 👤 Todos los demás correos `@tecsup.edu.pe` reciben el rol **STUDENT** por defecto.

### Flujo de Prueba Rápido
1. **Login** → `http://localhost:3000/auth/login` → "Continuar con Google"
2. **Admin Panel** → `http://localhost:3000/admin/organizers` (solo con rol ADMIN)
3. **Crear Torneo** → Desde el panel admin, botón "Nuevo Torneo"
4. **Ver Torneos** → `http://localhost:3000/tournaments`
5. **Perfil** → `http://localhost:3000/profile` → Vincular cuenta de juego
6. **Ranking** → `http://localhost:3000/ranking`
7. **Comunidad** → `http://localhost:3000/community`

---

## 📡 Referencia de API

> Base URL: `http://localhost:3001/api/v1`  
> Documentación interactiva en Swagger: `http://localhost:3001/api/docs`

### Formato de Respuesta Unificado
```json
// Éxito
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Descripción", "details": null } }
```

### Autenticación (`/auth`)
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `POST` | `/auth/google` | Login/registro con Google Workspace | ❌ |
| `POST` | `/auth/login` | Login con email/password | ❌ |
| `POST` | `/auth/register` | Registro manual | ❌ |
| `POST` | `/auth/refresh` | Rotar refresh token (cookie) | 🍪 Cookie |
| `POST` | `/auth/logout` | Cerrar sesión | 🍪 Cookie |
| `GET`  | `/auth/me` | Obtener usuario actual | 🔒 JWT |

### Perfil y Muro Social (`/profile`)
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `GET`  | `/profile/me` | Mi perfil + historial de torneos activos | 🔒 JWT |
| `PATCH` | `/profile/me` | Actualizar perfil académico y avatar | 🔒 JWT |
| `GET`  | `/profile/:id` | Perfil público de cualquier competidor | ❌ |
| `GET`  | `/profile/:id/signatures` | Muro de firmas y dedicatorias de un competidor | ❌ |
| `POST` | `/profile/:id/signatures` | Dejar firma/sticker/meme en muro de competidor | 🔒 JWT |
| `DELETE` | `/profile/signatures/:id` | Eliminar firma del muro (autor / dueño / admin) | 🔒 JWT |
| `GET`  | `/profile/me/sanctions` | Mis sanciones activas y apelaciones | 🔒 JWT |
| `POST` | `/profile/me/appeals` | Enviar apelación de sanción | 🔒 JWT |

### Torneos (`/tournaments`)
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `GET` | `/tournaments` | Listar torneos (filtros opcionales) | ❌ |
| `GET` | `/tournaments/:slug` | Detalle de torneo por slug | ❌ |
| `POST` | `/tournaments` | Crear torneo (1v1 o equipos) | 🔒 ADMIN/ORG |
| `PATCH` | `/tournaments/:id` | Editar torneo completo | 🔒 ADMIN/ORG |
| `DELETE` | `/tournaments/:id` | Eliminar torneo | 🔒 ADMIN/ORG |
| `POST` | `/tournaments/:id/publish` | Publicar borrador | 🔒 ADMIN/ORG |

### Inscripciones y Equipos (`/registrations`, `/payments`)
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `POST` | `/tournaments/:id/registrations` | Inscribirse a torneo (individual o capitán + roster) | 🔒 JWT |
| `GET` | `/registrations/me` | Mis inscripciones activas | 🔒 JWT |
| `GET` | `/tournaments/:id/participants` | Lista de participantes y escuadras | ❌ |
| `POST` | `/registrations/:id/evidence` | Subir comprobante de pago | 🔒 JWT |
| `POST` | `/payments/:id/approve` | Aprobar pago de inscripción | 🔒 ADMIN/ORG |
| `POST` | `/payments/:id/reject` | Rechazar pago | 🔒 ADMIN/ORG |

### Competición / Brackets (`/tournaments/:id/bracket`, `/matchups`)
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `GET` | `/tournaments/:id/bracket` | Obtener bracket del torneo | ❌ |
| `POST` | `/tournaments/:id/generate-bracket` | Generar bracket por sorteo aleatorio oficial | 🔒 ADMIN/ORG |
| `POST` | `/matchups/:id/result` | Registrar resultado de partida (score y sets) | 🔒 ADMIN/ORG |

### Ranking y Palmarés (`/ranking`)
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `GET` | `/ranking/leaderboard?game=CLASH_ROYALE` | Leaderboard institucional | ❌ |

### Comunidad y Foro (`/community`)
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `GET` | `/community/posts` | Listar publicaciones | ❌ |
| `POST` | `/community/posts` | Crear publicación | 🔒 JWT |
| `POST` | `/community/posts/:id/comments` | Comentar publicación | 🔒 JWT |
| `POST` | `/community/posts/:id/react` | Reaccionar a publicación | 🔒 JWT |

### Notificaciones In-App (`/notifications`)
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `GET` | `/notifications` | Listar mis notificaciones y cantidad no leídas | 🔒 JWT |
| `PATCH` | `/notifications/:id/read` | Marcar notificación específica como leída | 🔒 JWT |
| `PATCH` | `/notifications/read-all` | Marcar todas las notificaciones como leídas | 🔒 JWT |
| `DELETE` | `/notifications/:id` | Eliminar notificación específica de la bandeja | 🔒 JWT |
| `DELETE` | `/notifications/clear-all` | Vaciar y eliminar todas las notificaciones del usuario | 🔒 JWT |

### Administración y Moderación (`/admin`)
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| `GET` | `/admin/users` | Listado y directorio de usuarios con roles y sanciones | 🔒 ADMIN |
| `PATCH` | `/admin/users/:id/role` | Asignar rol (STUDENT / ORGANIZER / ADMIN) | 🔒 ADMIN |
| `POST` | `/admin/users/:id/sanction` | Aplicar sanción (Silencio, Ban temporal o permanente) | 🔒 ADMIN |
| `DELETE` | `/admin/users/:id/sanction` | Levantar sanción disciplinaria | 🔒 ADMIN |
| `POST` | `/admin/appeals/:id/review` | Aprobar o denegar apelación de estudiante | 🔒 ADMIN |

---

## 🗄️ Esquema de Base de Datos

El esquema usa **multi-schema** de PostgreSQL para organización limpia:

| Schema | Tablas | Descripción |
|---|---|---|
| `identity` | `users`, `sessions`, `refresh_tokens`, `device_otps` | Autenticación y sesiones |
| `profile` | `user_profiles` | Datos académicos del estudiante |
| `games` | `game_profiles`, `ranking_seasons`, `ranking_entries` | Cuentas de juego y rankings |
| `tournament` | `tournaments` | Catálogo de torneos |
| `registration` | `registrations` | Inscripciones de competidores |
| `payment` | `payments`, `payment_reviews` | Pagos y auditoría |
| `competition` | `competitions`, `rounds`, `matchups`, `game_sets` | Brackets y resultados |
| `community` | `community_posts`, `community_comments`, `community_post_reactions` | Foro y contenido social |

### Diagrama ER Simplificado

```
User ──┬── UserProfile
       ├── Session ── RefreshToken
       ├── GameProfile ── RankingEntry
       ├── Registration ── Payment ── PaymentReview
       ├── Post ── Comment
       └── Post ── PostReaction

Tournament ── Registration
Tournament ── Competition ── Round ── Matchup ── GameSet

RankingSeason ── RankingEntry
```

---

## 🎮 Juegos Soportados

| Juego | Código | Formato | Vinculación | Estado API |
|---|---|---|---|---|
| 🗡️ Clash Royale | `CLASH_ROYALE` | 1vs1 (BO3/BO5) | Supercell API (Player Tag) | ✅ Funcional |
| 🎮 Brawl Stars | `BRAWL_STARS` | 3vs3 / Duelos | Supercell API (Player Tag) | ✅ Funcional |
| ⚡ Super Smash Bros | `SMASH_ULTIMATE` | 1vs1 Presencial | Manual (Nombre + Main) | ✅ Funcional |
| 🎯 Left 4 Dead 2 | `LEFT_4_DEAD_2` | 4vs4 Versus | Steam Web API (Steam ID) | ✅ Funcional |
| ⚽ eFootball | `EFOOTBALL` | 1vs1 Liga | Manual (Konami ID) | ✅ Funcional |
| ⚔️ Dota 2 | `DOTA_2` | 5vs5 Capitán | Manual (Steam ID) | ✅ Funcional |

---

## ✅ Funcionalidades Implementadas (Detalle)

### 🔐 Autenticación Institucional
- Login directo con Google Workspace (`@tecsup.edu.pe` exclusivamente).
- Auto-registro de nuevos estudiantes con perfil predeterminado.
- Modal de **onboarding celebratorio** para nuevos usuarios con pasos guiados.
- JWT access token (15 min) + refresh token en cookie httpOnly (7 días).
- Rotación automática de refresh tokens con revocación.
- Correo de bienvenida vía Brevo SMTP para nuevos registros.
- Roles: `STUDENT`, `ORGANIZER`, `ADMIN`.

### 👤 Perfiles Públicos, Vista de Visitante y Muro de Firmas
- **Perfil Público (`/profile/[id]`)**: Visualización del avatar, nombre completo, correo institucional sutil, carrera, ciclo y estado oficial.
- **Vista de Visitante**: Botón en el perfil propio (`/profile`) para previsualizar la cuenta tal como la ven los demás competidores, con banner superior de modo visitante y retorno rápido a edición.
- **Muro de Firmas & Mensajes de la Comunidad**: Espacio social en cada perfil para recibir dedicatorias, firmas de honor, stickers rápidos (*"🏆 ¡A romperla!", "👑 Leyenda de Tecsup", "🔥 GG WP"*) y soporte para adjuntar imágenes/memes. Control de moderación para eliminar mensajes.
- **Torneos Activos Reales**: Listado en vivo de torneos en los que el competidor está participando actualmente (eliminados tags y copas simuladas).
- **Medallero de Honor**: Palmarés oficial de podios y participaciones en torneos finalizados (🥇 Oro, 🥈 Plata, 🥉 Bronce).

### 🏆 Gestión de Torneos
- CRUD completo de torneos con estados: `DRAFT → PUBLISHED → REGISTRATION_OPEN → IN_PROGRESS → FINISHED`.
- Campos: nombre, descripción, juego, cupos, costo, premio, formato, fechas, reglas, banner.
- Modalidades 1vs1 y por equipos (3vs3, 5vs5).
- Publicación de borradores, edición y eliminación con cascade.
- Filtros por juego, estado y búsqueda rápida.

### 📋 Inscripciones, Equipos y Pagos
- **Inscripción en Equipos Optimizada**: El Capitán se precarga automáticamente con la cuenta del usuario en sesión, eligiendo emblema del equipo (🐉, ⚡, 🐺, 🛡️, 👑, 🦅, ⚔️) y registrando únicamente a los compañeros restantes.
- **Roster Lightbox Modal**: Ventana modal sobreexpuesta flotante en la lista de participantes para inspeccionar a todos los miembros de un equipo sin salir de la página ni abrir nuevas pestañas.
- **Participantes 1vs1**: Tarjeta con avatar, nombre, correo institucional y enlace directo al perfil público.
- Métodos de pago: **Yape**, **Plin**, **Transferencia**.
- Flujo de comprobante: subir evidencia → revisión del organizador/admin → aprobación/rechazo.
- Estados: `PENDING_PAYMENT → PAYMENT_UNDER_REVIEW → CONFIRMED / REJECTED`.

### 🗡️ Sistema de Brackets
- Generación de brackets por **Sorteo Aleatorio Oficial** (eliminado seeding por copas simuladas).
- Registro de resultados por matchup con score A/B y sets.
- Avance automático del ganador a la siguiente ronda (eliminación directa).
- Visualización de bracket interactivo completa en el frontend con `BracketView.tsx`.

### 👑 Panel de Administración, Moderación y Sanciones
- Directorio de usuarios registrados con enlace directo a sus perfiles públicos.
- Cambio dinámico de roles (`STUDENT` ↔ `ORGANIZER` ↔ `ADMIN`).
- **Sistema Disciplinario**: Aplicación de sanciones de silencio (Mute), suspensión temporal o baneo permanente con motivo y vencimiento.
- **Sistema de Apelaciones**: Los estudiantes pueden apelar sanciones desde su perfil y el administrador puede evaluarlas, aprobarlas o rechazarlas.
- Gestión de torneos: crear, editar, publicar, eliminar.

### 📡 Centro de Notificaciones In-App
- **Drawer interactivo (`NotificationCenterDrawer.tsx`)**: Desplegable lateral con acceso directo desde la campana del Navbar, con contador dinámico de no leídas (`9+` / pulso animado).
- **Gestión Completa de Mensajes**:
  - **Eliminación individual**: Cada tarjeta cuenta con su propio botón de papelera (`Trash2`) con descarte optimista inmediato (sin recargas de página).
  - **Vaciado completo ("Vaciar")**: Botón superior para limpiar la bandeja completa de notificaciones en un clic.
  - **Marcar como leídas**: Lectura automática al interactuar con una notificación o masiva mediante *"Marcar leídas"*.
- **Eventos soportados**: Notificaciones de pagos revisados (`PAYMENT`), llamado a partidas (`MATCH_CALL`), transmisiones en vivo (`STREAM`), diplomas y medallas (`DIPLOMA`), avisos de torneos (`TOURNAMENT`) y resoluciones disciplinarias.

### 🎨 Identidad Visual Gamer, Dual Theme y UI Streamlined
- **Branding Oficial Tecsup**: Integración del emblema oficial institucional en alta calidad y tipografía deportiva (`CAMPUS ARENA / TECSUP ESPORTS`).
- **Catálogo Oficial de Juegos en HD**: Sustitución definitiva de placeholders por arte oficial y fondos en alta definición para Clash Royale, Brawl Stars, Super Smash Bros Ultimate, Left 4 Dead 2, eFootball y Dota 2 vía [`games.ts`](apps/web/src/lib/games.ts).
- **Dual Theme (Dark Obsidian / Warm Slate Light)**: Soporte completo para modo oscuro y claro con tokens CSS pulidos, contraste equilibrado y excelente legibilidad para entornos competitivos.
- **Brackets Interactivos con Conectores Láser SVG**: Llaves de torneo con trazados vectoriales dinámicos que animan el flujo de victorias hacia la gran final.
- **Barra de Navegación Depurada (Navbar)**:
  - Navegación pública directa y espaciosa (Inicio, Torneos, Comunidad, En Vivo con indicador sutil, Ranking).
  - Menú de perfil (`Avatar`) que agrupa el rol, acceso al panel de Organizador y Admin, Mi Perfil, cambio de tema y cerrar sesión.
  - Landing page con Call To Action unificado hacia ingreso institucional con Google Tecsup y catálogo de torneos.

### 💬 Comunidad
- Publicaciones con categorías (General, Estrategia, Equipos, etc.).
- Sistema de reacciones tipo emoji (una reacción por usuario por post).
- Comentarios con hilos y media URL.

### 📧 Correo Transaccional
- Servicio de email con Brevo (Sendinblue) REST API + Nodemailer SMTP fallback.
- Templates HTML con branding Campus Arena Tecsup.
- Correo de bienvenida al registrar nuevo competidor.

---

## 🗺️ Roadmap — Funcionalidades Pendientes

### 🔴 Prioridad Alta (Sprint actual)
- [ ] **OAuth real con Google**: Integrar `@react-oauth/google` en el frontend para popup de Google real (actualmente se simula enviando email directamente al backend).
- [ ] **Tests E2E completos**: Configurar Vitest para tests de integración del API.

### 🟡 Prioridad Media (Próximo sprint)
- [ ] **WebSockets para brackets en vivo**: Actualización en tiempo real del estado del bracket durante torneos.
- [ ] **Subida de imágenes en la nube**: Integrar Supabase Storage o Cloudinary para almacenamiento persistente de comprobantes y banners.
- [ ] **Dashboard del competidor**: Métricas personalizadas de rendimiento en torneos.
- [ ] **Multi-campus**: Soporte específico para sedes Arequipa y Trujillo.

### 🟢 Prioridad Baja (Futuro)
- [ ] **App móvil** con React Native o Expo.
- [ ] **Integración Discord** para anuncios de torneos.
- [ ] **Streaming/VODs** integrados para partidas destacadas.
- [ ] **Deploy a producción**: Vercel (frontend) + Railway/Render (backend).
- [ ] **CI/CD con GitHub Actions**: Build automático, lint, tests, deploy preview.

---

## 📏 Convenciones del Proyecto

### Estructura de Código
- **Backend**: Cada feature tiene su módulo NestJS (`*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`).
- **Frontend**: Pages en `app/` (App Router Next.js 16), componentes reutilizables en `components/`, estado global en `context/`.
- **Base de datos**: Multi-schema en PostgreSQL. Cada dominio (`identity`, `tournament`, `competition`, etc.) tiene su propio schema.

### Nomenclatura
- Archivos: `kebab-case` (ej. `create-tournament.dto.ts`).
- Clases/tipos: `PascalCase` (ej. `TournamentService`).
- Variables/funciones: `camelCase`.
- Tablas BD: `snake_case` con `@@map()`.
- API endpoints: `kebab-case` bajo `/api/v1/`.

### Formato de Respuesta API
Todas las respuestas siguen el formato unificado:
```typescript
// Interceptor global: ResponseInterceptor
{ success: true, data: T }

// Filter global: HttpExceptionFilter
{ success: false, error: { code: string, message: string, details: any } }
```

---

## 🤝 ¿Cómo Contribuir?

1. **Fork** el repositorio.
2. Crea una rama con tu feature: `git checkout -b feature/nombre-feature`
3. Realiza tus cambios y haz commit: `git commit -m "feat: descripción"`
4. Push a tu rama: `git push origin feature/nombre-feature`
5. Abre un **Pull Request** contra `main`.

### Antes de hacer PR:
```bash
# Verificar que el linter pasa
pnpm run lint

# Verificar que los tests pasan
cd apps/api && pnpm run test

# Verificar que el build funciona
pnpm run build
```

### Áreas donde se necesita ayuda:
- 🔌 **Integración OAuth real** con Google popup.
- 🖼️ **Subida de imágenes** (avatares, banners, comprobantes).
- 📱 **Responsive design** — revisar mobile en todas las vistas.
- 🧪 **Tests unitarios y E2E** para servicios del backend.
- 🚀 **Configuración de deploy** (Vercel + Railway).

---

## 👥 Equipo

| Nombre | Rol | Contacto |
|---|---|---|
| Luis Galvan | Desarrollador Principal / Admin | luis.galvan@tecsup.edu.pe |

---

<p align="center">
  <strong>🏟️ Campus Arena — Desarrollado para la comunidad de eSports de Tecsup.</strong><br/>
  <sub>Tecsup — Sede Lima — 2026</sub>
</p>
