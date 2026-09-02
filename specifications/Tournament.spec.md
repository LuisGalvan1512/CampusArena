# Campus Arena — Specifications Pack

# Specification: Tournament Lifecycle & Management (Tournament.spec.md) v1.0

- **Contexto:** Dominio de Tournament Management (`tournament` schema).
- **Dependencias:** Auth, Profile, Organization, Season, Game, Registration, Competition Engine, Audit, Notifications.
- **Sustento Estratégico:** 
  - Requisitos de Producto: [06_prd_epic_003_tournaments_seasons.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/01_Product/06_prd_epic_003_tournaments_seasons.md)
  - Especificación de Interfaces: [13_mvp_wireframes_specification.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/03_UX/13_mvp_wireframes_specification.md#L97) (Sección 6) y [13_mvp_wireframes_specification.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/03_UX/13_mvp_wireframes_specification.md#L309) (Sección 18)
  - Reglas de Base de Datos: [24_database_architecture_conceptual.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/06_Database/24_database_architecture_conceptual.md)

---

# 1. Objetivo del Módulo
Definir la creación, configuración, publicación, administración y ciclo de vida de los torneos de Campus Arena dentro de una arquitectura SaaS multi-tenant. El torneo debe comportarse como un evento digital perteneciente a una organización, sede, temporada y juego.

---

# 2. Alcance del MVP & Exclusiones

### ✅ Incluido en el MVP
- Creación y edición de torneos por el organizador (como borrador).
- Configuración de cupos (mínimo y máximo), costo de inscripción, reglamento e imagen (banner).
- Publicación y transiciones automáticas de la máquina de estados.
- Página pública del torneo (Detalle de información y reglamento).
- Permisos basados en roles (RBAC) para la gestión.
- Cancelación, finalización administrativa y archivado lógico en el histórico.

### ❌ Excluido del MVP (Backlog)
- Gestión de equipos (2vs2, 5vs5) - *MVP es 1vs1*.
- Automatización e integración directa de las APIs de Clash Royale/Brawl Stars - *manejado por adaptadores en el perfil*.
- Validación ni aprobación de comprobantes de pago - *delegado a RegistrationPayment.spec.md*.
- Sorteo, cálculo de emparejamientos y brackets - *delegado a Competition.spec.md*.
- Asignación automatizada de medallas y logros - *delegado a Achievements/Medals*.

---

# 3. Actores y Permisos (RBAC)

- **Visitante:** Puede explorar la página pública del torneo, reglamento e información general.
- **Competidor:** Puede solicitar la inscripción a un torneo publicado que tenga las inscripciones abiertas.
- **Organizador:** Creador y gestor autorizado de los torneos asociados a su Organización. Tiene permisos para transicionar estados, modificar borradores y cancelar competencias.
- **Administrador Global:** Control total sobre todos los torneos e instituciones de la plataforma.

---

# 4. Lenguaje Ubicuo (Local Context)
- **Torneo (Tournament):** Evento competitivo con un único juego, temporada y organización.
- **Temporada (Season):** Periodo competitivo en el que se agrupan torneos de una organización.
- **Organizador (Organizer):** Gestor del torneo con permisos de modificación y transiciones de estado.
- **Slug:** Identificador alfanumérico único para la URL del torneo (ej: `/tournaments/copa-tecsup-clash-royale-2027`).

---

# 5. Máquina de Estados del Torneo

Todo torneo se rige bajo la siguiente máquina de estados determinista. Las transiciones no permitidas lanzarán una excepción `BadRequestException` en la API.

```
       [ DRAFT ] (Edición inicial)
          │
          ▼ (Publish Action)
      [ PUBLISHED ] (Visible, no inscribe)
          │
          ▼ (Open Date / Manual Action)
   [ REGISTRATION_OPEN ]
          │
          ▼ (Close Date / Manual Action)
  [ REGISTRATION_CLOSED ]
          │
          ▼ (Start Review)
[ PARTICIPANT_VERIFICATION ] (Revisión de comprobantes)
          │
          ▼ (Verify Completed)
    [ DRAW_PENDING ] ➔ (Evento a Competition Engine)
          │
          ▼ (Bracket Generated)
    [ IN_PROGRESS ] (Partidas en juego)
          │
          ▼ (Winner Declared)
     [ FINISHED ]
          │
          ▼ (Archive Action)
     [ ARCHIVED ] (Histórico inmutable)
```

*Nota:* Un torneo puede ser transicionado al estado `CANCELLED` desde cualquier estado previo a `FINISHED`.

### Tabla de Transiciones de Estado
| Estado Origen | Estado Destino | Actor Autorizado | Precondiciones requeridas |
| :--- | :--- | :--- | :--- |
| `DRAFT` | `PUBLISHED` | Organizador / Admin | Tener cargados: nombre, banner, juego, temporada, reglamento, cupos, costo y fechas válidas. |
| `PUBLISHED` | `REGISTRATION_OPEN` | Sistema / Organizador | La fecha de apertura ha llegado y el torneo está completo. |
| `REGISTRATION_OPEN` | `REGISTRATION_CLOSED` | Sistema / Organizador | La fecha de cierre ha llegado o el organizador cierra el registro de forma manual. |
| `REGISTRATION_CLOSED` | `PARTICIPANT_VERIFICATION` | Organizador | Periodo administrativo iniciado para validar comprobantes pendientes. |
| `PARTICIPANT_VERIFICATION`| `DRAW_PENDING` | Organizador | No deben existir solicitudes de inscripción en estado "Pendiente" o "En revisión". |
| `DRAW_PENDING` | `IN_PROGRESS` | Sistema (Competition Engine) | Bracket y emparejamientos generados exitosamente. |
| `IN_PROGRESS` | `FINISHED` | Sistema (Competition Engine) | Todas las partidas y rondas resueltas y registrado el campeón. |
| `FINISHED` | `ARCHIVED` | Organizador | Torneo concluido oficialmente; bloquea permanentemente cualquier edición deportiva. |
| *Cualquiera pre-Finished*| `CANCELLED` | Organizador / Admin | Justificación obligatoria en logs. Notifica a participantes inscritos. |

---

# 6. Reglas de Negocio (Business Rules)

- **RN-301 (Integridad SaaS):** Todo torneo pertenece obligatoriamente a una organización y a una temporada activa asociadas al tenant del creador.
- **RN-302 (Congelamiento de Reglas):** Una vez que el torneo pasa al estado `REGISTRATION_OPEN`, el reglamento, el costo de inscripción y el videojuego quedan completamente bloqueados. No se permiten modificaciones para evitar fraudes deportivos.
- **RN-303 (Cupo Límite):** Al alcanzar el número de participantes validados igual a `max_slots`, el estado de inscripciones debe bloquearse automáticamente, moviendo a los nuevos aplicantes a lista de espera.
- **RN-304 (Inmutabilidad Histórica):** Un torneo en estado `ARCHIVED` o `FINISHED` nunca se elimina físicamente de la base de datos (`deleted_at` para borrado lógico).
- **RN-305 (Cancelación Auditada):** La transición al estado `CANCELLED` requiere ingresar una justificación textual, la cual se guardará en `AuditLog` y disparará notificaciones automáticas por correo electrónico a todos los participantes inscritos.

---

# 7. Historias de Usuario (User Stories)

### HU-301: Crear Borrador
Como **organizador**,  
quiero **crear un torneo en borrador**,  
para **ir configurando sus reglas y premios con calma**.

### HU-302: Publicar Convocatoria
Como **organizador**,  
quiero **publicar un torneo borrador**,  
para **que los estudiantes puedan ver la fecha y el premio en la landing**.

### HU-303: Monitorear Ciclo de Vida
Como **competidor**,  
quiero **ver el estado dinámico y la cuenta regresiva en la página del torneo**,  
para **saber cuánto tiempo me queda para inscribirme**.

---

# 8. Casos Límite y Validaciones

- **Fechas Inconsistentes:** Lanzar `BadRequestException` si la fecha de inicio del torneo es menor a la fecha de cierre de inscripciones, o si la fecha de cierre es menor a la fecha de apertura.
- **Mínimo no alcanzado:** Si al llegar la fecha de cierre de registros el número de participantes confirmados es menor a `min_slots`, el torneo no puede pasar a `DRAW_PENDING`. El organizador debe posponer la fecha o cancelar el torneo.
- **Cupo Límite Cero:** Lanzar error de validación si `max_slots` es menor o igual a cero.

---

# 9. Contrato de Base de Datos (Schema: `tournament`)

Estructura física de persistencia requerida en PostgreSQL:

- **`tournament.tournaments`:**
  - `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
  - `organization_id` (UUID, NOT NULL, FOREIGN KEY REFERENCES `organization.organizations(id)`)
  - `campus_id` (UUID, NULL, FOREIGN KEY REFERENCES `organization.campuses(id)`)
  - `season_id` (UUID, NOT NULL, FOREIGN KEY REFERENCES `organization.seasons(id)`)
  - `game_id` (UUID, NOT NULL, FOREIGN KEY REFERENCES `games.games(id)`)
  - `name` (VARCHAR(150), NOT NULL)
  - `slug` (VARCHAR(200), UNIQUE, NOT NULL)
  - `description_short` (VARCHAR(250), NOT NULL)
  - `description_full` (TEXT, NOT NULL)
  - `banner_url` (VARCHAR(255), NOT NULL)
  - `rules_text` (TEXT, NOT NULL)
  - `status` (VARCHAR(50), NOT NULL, DEFAULT 'DRAFT')
  - `max_slots` (INTEGER, NOT NULL)
  - `min_slots` (INTEGER, NOT NULL, DEFAULT 8)
  - `cost` (DECIMAL(10,2), NOT NULL, DEFAULT 0.00)
  - `currency` (VARCHAR(10), NOT NULL, DEFAULT 'PEN')
  - `prize_pool` (VARCHAR(255), NOT NULL)
  - `registration_open_at` (TIMESTAMP, NOT NULL)
  - `registration_close_at` (TIMESTAMP, NOT NULL)
  - `tournament_start_at` (TIMESTAMP, NOT NULL)
  - `tournament_end_at_estimate` (TIMESTAMP, NOT NULL)
  - `is_online` (BOOLEAN, NOT NULL, DEFAULT TRUE)
  - `location_address` (VARCHAR(255), NULL)
  - `contact_email` (VARCHAR(255), NOT NULL)
  - `created_at` (TIMESTAMP, DEFAULT NOW())
  - `updated_at` (TIMESTAMP, DEFAULT NOW())
  - `deleted_at` (TIMESTAMP, NULL)

### Índices Requeridos
1. `tournaments` ➔ `slug` (INDEX UNIQUE): Carga ultra-rápida de la página pública.
2. `tournaments` ➔ `organization_id` & `status` (INDEX): Filtro de torneos activos de una universidad.
3. `tournaments` ➔ `game_id` (INDEX): Consultas de torneos de Clash Royale/Brawl Stars.

---

# 10. Contrato de API REST

### `POST /api/v1/organizations/:organizationId/tournaments`
- **Rol Requerido:** `ORGANIZER`, `ADMIN`.
- **Input DTO:**
  ```json
  {
    "name": "Copa Tecsup CR 2027",
    "campus_id": "4b380f23-...",
    "season_id": "c7a8d011-...",
    "game_id": "e98b02c4-...",
    "description_short": "Torneo universitario de Clash Royale.",
    "description_full": "Competencia exclusiva para alumnos regulares de Tecsup...",
    "banner_url": "https://storage.supabase.co/banners/tecsup_cr.png",
    "rules_text": "Queda prohibido el uso de cuentas compartidas...",
    "max_slots": 64,
    "min_slots": 8,
    "cost": 5.00,
    "currency": "PEN",
    "prize_pool": "S/ 300 para el primer lugar + Medalla Legendaria",
    "registration_open_at": "2026-07-15T09:00:00Z",
    "registration_close_at": "2026-07-28T18:00:00Z",
    "tournament_start_at": "2026-07-30T10:00:00Z",
    "tournament_end_at_estimate": "2026-07-30T18:00:00Z",
    "is_online": true,
    "contact_email": "esports@tecsup.edu.pe"
  }
  ```
- **Output JSON (HTTP 201):**
  ```json
  {
    "success": true,
    "data": {
      "id": "e7b892a0-...",
      "slug": "copa-tecsup-cr-2027",
      "status": "DRAFT"
    }
  }
  ```

### `GET /api/v1/tournaments`
- Lista pública de torneos.
- **Filtros por Query Params:** `game_id` (UUID), `organization_id` (UUID), `status` (ENUM), `page` (number), `limit` (number).

### `GET /api/v1/tournaments/:slug`
- Devuelve la información completa del torneo para renderizar la página del evento.

### `PATCH /api/v1/tournaments/:id`
- **Rol Requerido:** `ORGANIZER` de la organización correspondiente. Permite actualizar campos de metadatos si el estado es `DRAFT` o `PUBLISHED` (bajo las restricciones de congelamiento).

### `POST /api/v1/tournaments/:id/publish`
- Cambia estado a `PUBLISHED`.

---

# 11. Eventos de Dominio (Domain Events)

1. **`TournamentCreated`:** Emisor: `TournamentService`. Ocurre al insertar el borrador. Payload: `{ tournament_id, organization_id, name }`.
2. **`TournamentPublished`:** Emisor: `TournamentService`. Dispara la indexación en motores de búsqueda y feed público. Payload: `{ tournament_id, slug, game_id }`.
3. **`TournamentRegistrationClosed`:** Emisor: `TournamentService` o Scheduler. Cierra el ingreso de nuevas solicitudes y emite evento para que `Registration` congele estados y alerte a `Competition Engine`. Payload: `{ tournament_id, total_confirmed_players }`.
4. **`TournamentCancelled`:** Emisor: `TournamentService`. Notifica a `Notifications` para envío de correos de alerta y reembolsos. Payload: `{ tournament_id, reason, contact_email }`.

---

# 12. Especificación de UI (Framer Motion & Tailwind CSS)

### Componente: `TournamentCard`
- **Estilo:** Tarjeta con fondo `#15161E`, borde sutil `#2D3142` y redondeado de `12px` (`rounded-lg`).
- **Estados:**
  - *Loading:* Skeleton loader simulando la estructura del banner y el texto con animación de pulso de `1.5s`.
  - *Hover:* Elevación de `translateY(-4px)` y cambio de borde a azul en `200ms` (`ease-out`).

### Pantalla: Creación de Torneo (Asistente en Pasos)
- Formulario modular en 6 pasos. La navegación entre pasos debe conservar la memoria local del formulario y realizar validaciones mediante Zod antes de habilitar el botón "Siguiente".

---

# 13. Pruebas y Validación (QA Plan)

- **Unit Tests:**
  - Validar que un torneo en estado `REGISTRATION_OPEN` lance error si se intenta modificar el costo de inscripción (`cost`).
  - Validar que las fechas sean cronológicamente consistentes antes de insertar en la base de datos.
- **Integration Tests:**
  - Testear que el endpoint `POST /tournaments/:id/publish` valide correctamente la existencia de un reglamento (`rules_text`) cargado, arrojando error 400 si está vacío.
- **E2E Tests:**
  - Playwright: Autenticarse como Organizador ➔ Ir a Dashboard ➔ Clic en "Crear Torneo" ➔ Rellenar formulario ➔ Confirmar y publicar ➔ Validar que el torneo aparece en la lista pública como `PUBLISHED`.
