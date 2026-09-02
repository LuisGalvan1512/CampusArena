# Campus Arena — Specifications Pack

# Specification: Competitor Profile & Game Linking (Profile.spec.md) v1.0

- **Contexto:** Dominio de User Profile (`profile` schema) e integración de Juegos (`games` schema).
- **Dependencias:** Identity (requiere cuenta verificada).
- **Objetivo:** Permitir a los estudiantes registrar y actualizar sus datos académicos (carrera, ciclo, sede), vincular sus cuentas de videojuegos oficiales (Player Tags de Clash Royale y Brawl Stars) y visualizar su legado competitivo acumulado.

---

# 1. Entradas (Inputs)

### Actualizar Detalles de Perfil (`PATCH /profile/me`)
- `biography` (string, optional, max 300 chars).
- `career` (string, optional, max 100 chars).
- `cycle` (integer, optional, range [1, 10]).
- `campus_id` (string, optional, UUID format).
- `avatar_url` (string, optional, format URL).
- `social_links` (array of objects, optional):
  - `platform` (ENUM: TWITCH, YOUTUBE, TWITTER, DISCORD).
  - `username` (string, max 50 chars).

### Vincular Cuenta de Juego (`POST /profile/games`)
- `game_id` (string, required, UUID format).
- `player_tag` (string, required, max 20 chars, uppercase, alphanumeric, starts optionally with `#`).

---

# 2. Salidas (Outputs)

### Lectura de Perfil Propio (`GET /profile/me` - Response JSON)
- **Status:** HTTP 200.
- **Body JSON:**
  ```json
  {
    "success": true,
    "data": {
      "id": "e98b02c4-...",
      "first_name": "Luis",
      "last_name": "Galvan",
      "email": "luis@tecsup.edu.pe",
      "profile": {
        "organization": "Tecsup",
        "campus": "Lima",
        "career": "Diseño y Desarrollo de Software",
        "cycle": 4,
        "biography": "Jugador competitivo de Clash Royale desde 2018.",
        "avatar_url": "/avatars/clash-shield.png"
      },
      "game_profiles": [
        {
          "id": "c7a80d12-...",
          "game_name": "Clash Royale",
          "player_tag": "#8YRP92VJ",
          "in_game_name": "Luis_CR",
          "synced_at": "2026-07-12T15:30:00Z"
        }
      ],
      "legacy_summary": {
        "tournaments_played": 12,
        "championships": 2,
        "match_wins": 34,
        "match_losses": 8,
        "win_rate": 80.9,
        "medals_count": 5
      }
    }
  }
  ```

---

# 3. Reglas de Negocio (Business Rules)

- **RN-201 (Unicidad de Tags):** Un Player Tag específico no puede ser vinculado por dos competidores diferentes en el mismo juego de forma simultánea.
- **RN-202 (Validación de Tag):** Al registrar un Player Tag, el adaptador de juego (`GameAdapter`) correspondiente debe consultar la API oficial del juego (ej: Clash Royale API) para verificar que el tag existe y retornar el apodo oficial (`in_game_name`). Si la API reporta un error 404, la vinculación es denegada.
- **RN-203 (Estadísticas Inmutables):** Los campos del legado (`legacy_summary`) son de solo lectura y son recalculados de forma automatizada por el backend tras cada reporte de partida oficial.
- **RN-204 (Restricciones Académicas):** La carrera, ciclo y sede del estudiante son requeridos obligatoriamente antes de poder completar una inscripción en torneos institucionales organizados por su propia escuela.

---

# 4. Interfaz de Usuario (UI Specifications)

### Vista: Mi Perfil (Dashboard View)
- Muestra el encabezado del jugador, la tarjeta consolidada de estadísticas de legado, el feed de medallas recientes y la línea de tiempo del "Camino del Competidor" en formato responsivo.

### Vista: Vincular Cuentas (Games Wizard)
- Formulario limpio con un selector de juego (Iconos grandes de Clash Royale y Brawl Stars).
- Campo para escribir el Player Tag con ayuda de texto (ej: *"Encuentra tu tag en tu perfil de Clash Royale debajo de tu nombre"*).
- Al ingresar el tag, el botón cambia al estado `Loading` y se muestra un modal de validación confirmando el Nickname oficial encontrado en el juego: *"¿Eres tú: Luis_CR?"* ➔ Botones `Sí, vincular` / `Cancelar`.

---

# 5. APIs y Contratos (REST API)

### `GET /api/v1/profile/me`
- Devuelve el perfil completo del usuario autenticado, sus tags vinculados y el legado consolidado.

### `PATCH /api/v1/profile/me`
- Permite actualizar los campos editables del perfil académico y biografía.

### `POST /api/v1/profile/games`
- Valida e integra una nueva cuenta de juego consultando el adaptador correspondiente. Emite el evento `game_profile.linked`.

### `DELETE /api/v1/profile/games/:id`
- Desvincula una cuenta de juego registrada del competidor.

---

# 6. Base de Datos (DB Mapping)

### Esquema: `profile`
- **`profile.user_profiles`:**
  - `id` (UUID, PK)
  - `user_id` (UUID, FK -> `auth.users.id` ON DELETE CASCADE)
  - `organization_id` (UUID, FK)
  - `campus_id` (UUID, FK, NULL)
  - `career` (VARCHAR, NULL)
  - `cycle` (INTEGER, NULL)
  - `biography` (VARCHAR(300), NULL)
  - `avatar_url` (VARCHAR, NULL)

### Esquema: `games`
- **`games.game_profiles`:**
  - `id` (UUID, PK)
  - `user_id` (UUID, FK -> `auth.users.id` ON DELETE CASCADE)
  - `game_id` (UUID, FK)
  - `player_tag` (VARCHAR, NOT NULL)
  - `in_game_name` (VARCHAR, NOT NULL)
  - `synced_at` (TIMESTAMP)

---

# 7. Plan de Pruebas (Testing Specifications)

- **Unit Tests:**
  - Validar que el validador de formato de Player Tag filtre correctamente caracteres inválidos (ej. letras O/I/L/S que no se usan en tags de Supercell).
- **Integration Tests:**
  - Simular una consulta al adaptador de Clash Royale mockeando la respuesta de la API oficial para validar que se guarda el Nickname devuelto.
- **E2E Tests:**
  - Playwright: Competidor inicia sesión ➔ va a "Mis Juegos" ➔ selecciona Clash Royale ➔ ingresa `#8YRP92VJ` ➔ ve el modal con el apodo "Luis_CR" ➔ confirma vinculación.

---

# 8. Criterios de Aprobación (Definition of Done)

- [ ] Tablas creadas en base de datos bajo los esquemas `profile` y `games`.
- [ ] Conexión y mocks configurados para las APIs de Supercell.
- [ ] Todos los endpoints de actualización validados con Zod/class-validator.
- [ ] Enlace público del perfil verificable y optimizado para SEO (RSC en Next.js).
- [ ] El legado y las estadísticas cargan en menos de 300ms gracias a indexación por `user_id`.
