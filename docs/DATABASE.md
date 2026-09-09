# 🗄️ Guía de Base de Datos — Campus Arena

## Proveedor

- **PostgreSQL** alojado en **Supabase** (Plan Free, región `sa-east-1` São Paulo).
- ORM: **Prisma 5.22** con soporte `multiSchema`.

## Conexión

El proyecto usa dos URLs de conexión:

| Variable | Puerto | Uso |
|---|---|---|
| `DATABASE_URL` | 6543 | PgBouncer (connection pooling) — usado por la app en runtime |
| `DIRECT_URL` | 5432 | Conexión directa — usado por Prisma para migraciones y `db push` |

## Multi-Schema

La base de datos está organizada en **8 schemas** para separación de dominios:

```
identity     → Usuarios, sesiones, tokens, OTP
profile      → Perfiles académicos
games        → Cuentas de juego, rankings
tournament   → Torneos
registration → Inscripciones
payment      → Pagos y auditoría
competition  → Brackets, rondas, matchups
community    → Posts, comentarios, reacciones
```

## Comandos Útiles

```bash
# Desde apps/api/

# Sincronizar schema con BD (desarrollo)
npx prisma db push

# Generar cliente Prisma
npx prisma generate

# Abrir Prisma Studio (GUI para explorar datos)
npx prisma studio

# Ver estado de la BD
npx prisma db pull

# Formatear schema
npx prisma format
```

## Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────────────┐
│                    IDENTITY SCHEMA                          │
│                                                             │
│  User ──── Session ──── RefreshToken                        │
│   │                                                         │
│   │        DeviceOtp (standalone, OTP por email)             │
└───┼─────────────────────────────────────────────────────────┘
    │
    ├───────────────────┐
    │                   │
┌───▼───────────┐  ┌───▼───────────┐
│ PROFILE       │  │ GAMES         │
│               │  │               │
│ UserProfile   │  │ GameProfile ──┤
│               │  │      │        │
│ 1:1 con User  │  │      │        │
└───────────────┘  │ RankingSeason │
                   │      │        │
                   │ RankingEntry  │
                   └───────────────┘
    │
    ├──────────────────────────────────────┐
    │                                      │
┌───▼───────────────────┐           ┌──────▼──────────┐
│ REGISTRATION          │           │ COMMUNITY       │
│                       │           │                 │
│ Registration ─────────┤           │ Post ── Comment │
│   │                   │           │   │             │
│   │ 1:1               │           │   └─ Reaction   │
│   ▼                   │           │                 │
│ PAYMENT               │           └─────────────────┘
│                       │
│ Payment ── Review     │
└──────────┬────────────┘
           │
           │ Registration.tournament_id
           ▼
┌──────────────────────────────────────────┐
│ TOURNAMENT                               │
│                                          │
│ Tournament ── Competition ── Round       │
│                                 │        │
│                              Matchup     │
│                                 │        │
│                              GameSet     │
└──────────────────────────────────────────┘
```

## Modelos Principales

### User (`identity.users`)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Primary key |
| `email` | VARCHAR | Único, email institucional |
| `password_hash` | VARCHAR? | Hash Argon2 (null para Google-only) |
| `role` | Enum | `STUDENT`, `ORGANIZER`, `ADMIN` |
| `google_id` | VARCHAR? | ID de Google OAuth |
| `avatar_url` | VARCHAR? | URL de avatar |
| `first_name` | VARCHAR(50) | Nombre |
| `last_name` | VARCHAR(50) | Apellido |
| `email_verified` | Boolean | Siempre `true` para Google auth |
| `status` | Enum | `ACTIVE`, `SUSPENDED`, `INACTIVE` |

### Tournament (`tournament.tournaments`)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | VARCHAR(150) | Nombre del torneo |
| `slug` | VARCHAR(200) | URL-friendly unique identifier |
| `game_code` | VARCHAR(50) | Código del juego (ej. `CLASH_ROYALE`) |
| `status` | Enum | Estado del ciclo de vida |
| `max_slots` | INT | Cupos máximos |
| `cost` | DECIMAL(10,2) | Costo de inscripción (PEN) |
| `prize_pool` | VARCHAR(255) | Descripción de premios |
| `format` | VARCHAR(100) | Formato de juego |

### Matchup (`competition.matchups`)
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Primary key |
| `round_id` | UUID | FK a Round |
| `position` | INT | Posición en el bracket |
| `participant_a_name` | VARCHAR? | Nombre jugador A |
| `participant_b_name` | VARCHAR? | Nombre jugador B |
| `winner_name` | VARCHAR? | Nombre del ganador |
| `score_a` | INT | Score jugador A |
| `score_b` | INT | Score jugador B |
| `status` | Enum | `PENDING`, `READY`, `IN_PROGRESS`, `COMPLETED` |
| `next_matchup_id` | UUID? | FK a siguiente matchup (bracket tree) |

## Enums

### TournamentStatus
```
DRAFT → PUBLISHED → REGISTRATION_OPEN → REGISTRATION_CLOSED → IN_PROGRESS → FINISHED
                                                                              CANCELLED
                                                                              ARCHIVED
```

### RegistrationStatus
```
PENDING_PAYMENT → PAYMENT_UNDER_REVIEW → CONFIRMED
                                       → CORRECTION_REQUIRED
                                       → REJECTED
                                       → WAITLISTED
                                       → CANCELLED
```

### PaymentMethod
```
YAPE | PLIN | TRANSFER
```

### CompetitionStatus
```
PENDING_PARTICIPANTS → READY_FOR_DRAW → DRAFT_BRACKET → BRACKET_PUBLISHED → IN_PROGRESS → FINISHED
```
