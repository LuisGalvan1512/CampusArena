# Campus Arena — Specifications Pack

# Specification: Competition Engine (Competition.spec.md) v1.0

- **Contexto:** Dominio de Competencia (`competition` schema).
- **Dependencias:** Tournament, Registration, Profile, Game, Notifications, Audit, WebSockets.
- **Sustento de Diseño:**
  - Glosario Ubicuo: [Project_Glossary.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/00_Project/Project_Glossary.md)
  - Especificación de Interfaces: [13_mvp_wireframes_specification.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/03_UX/13_mvp_wireframes_specification.md#L182) (Sección 15 y 16) y [13_mvp_wireframes_specification.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/03_UX/13_mvp_wireframes_specification.md#L351) (Secciones 22 y 23)
  - Reglas del Ecosistema IA: [AI_Coding_Rules.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/08_AI/AI_Coding_Rules.md)

---

# 1. Objetivo del Módulo
Definir el Competition Engine (motor competitivo) del MVP de Campus Arena de manera desacoplada y determinista. Este módulo recibe la lista de participantes confirmados, genera el bracket de eliminación simple, gestiona rondas (Rounds), enfrentamientos (Matchups) y partidas individuales (GameSets) Bo1/Bo3, valida marcadores mediante adaptadores de juego y avanza automáticamente a los ganadores hasta declarar un campeón.

---

# 2. Alcance del MVP & Exclusiones

### ✅ Incluido en el MVP
- Torneos de Eliminación Simple Bo1 y Bo3 de participantes individuales.
- Tamaño de bracket basado en potencias de 2 (máximo 64 competidores).
- Gestión automática de posiciones vacías (`BYE`) en brackets incompletos.
- Sorteo aleatorio reproducible (semilla de generación guardada en BD).
- Asignación manual de seeds (cabezas de serie) en extremos opuestos.
- Registro de marcadores oficiales ingresados por el organizador.
- Gestión de inasistencias (W.O. / Walkover) y descalificaciones.
- Envío de actualizaciones de bracket en tiempo real mediante WebSockets.
- Adaptadores de juego (`GameAdapter`) mockeados para Clash Royale y Brawl Stars.

### ❌ Excluido del MVP (Backlog)
- Formato de doble eliminación, round robin o sistema suizo.
- Torneos por equipos (2vs2, 5vs5).
- Captura directa y automática de resultados vía APIs externas (sin revisión humana).
- Edición del bracket una vez iniciado el primer matchup.
- Generación de partidos de tercer puesto adicionales (salvo que existan de forma nativa).

---

# 3. Límites del Dominio

- **Competition es responsable de:** Generar la estructura del bracket, instanciar rondas, matchups y gamesets, avanzar a los ganadores automáticamente tras completar un matchup, registrar W.O. y descalificaciones, declarar al campeón y subcampeón, y emitir eventos de dominio.
- **Competition NO es responsable de:** Registrar usuarios, gestionar cobros o comprobar transacciones de Yape/Plin, definir reglamentos textuales, o invocar directamente APIs externas de Supercell sin pasar por el adaptador.

---

# 4. Fuente Oficial de Participantes (Participant Snapshots)
El motor de competencia solo puede consumir datos de competidores confirmados (`Registration.status = CONFIRMED`). Al cerrarse las inscripciones, se captura un **Snapshot inmutable** de cada participante:

- `registration_id` (UUID)
- `competitor_id` (UUID)
- `display_name` (Nombres de usuario)
- `game_nickname` (IGN del jugador)
- `player_tag` (Player Tag en Clash Royale/Brawl Stars)
- `seed` (Opcional, prioridad de cabeza de serie)

*Regla de Privacidad:* Si un usuario borra lógicamente su cuenta post-torneo, el Snapshot del participante permanece inmutable en el bracket para mantener la integridad deportiva, enmascarando únicamente su nombre real en la UI pública como `[Competidor Eliminado]`.

---

# 5. Entidades y Value Objects (Sistemas de Persistencia)

## Agregados y Entidades

- **`Competition` (Aggregate Root):** Instancia competitiva asociada a un torneo.
- **`Bracket` (Entidad Interna):** Árbol estructural del torneo. *Decisión de modelado:* Bracket se modela como entidad interna de `Competition` porque carece de ciclo de vida independiente; no existe un bracket sin una competencia.
- **`Round` (Entidad):** Agrupación física de enfrentamientos de una fase (ej: Octavos, Cuartos).
- **`Matchup` (Entidad):** Enfrentamiento entre dos participantes en una ronda específica.
- **`GameSet` (Entidad):** Set individual dentro de la serie del matchup (ej: Partida 1 de un Bo3).
- **`ParticipantSnapshot` (Entidad):** Datos estáticos e inmutables del competidor al iniciar el sorteo.
- **`MatchupResultRevision` (Entidad):** Registro de auditoría ante corrección de marcadores oficiales.

---

# 6. Máquina de Estados (State Machines)

## Máquina de Estados de `Competition`
```
[ PENDING_PARTICIPANTS ] ➔ [ READY_FOR_DRAW ] ➔ [ DRAFT_BRACKET ] ➔ [ BRACKET_PUBLISHED ] ➔ [ IN_PROGRESS ] ➔ [ FINISHED ]
```
- **Relación con Tournament:** Cuando `Tournament` pasa a `REGISTRATION_CLOSED`, la `Competition` correspondiente pasa a `READY_FOR_DRAW`. Al publicar las llaves (`Bracket.status = PUBLISHED`), la competencia pasa a `BRACKET_PUBLISHED`. Al iniciar el primer matchup, ambos pasan a `IN_PROGRESS`.

## Máquina de Estados de `Matchup`
- **Estados:** `PENDING_PARTICIPANTS`, `READY` (ambos jugadores definidos), `IN_PROGRESS`, `COMPLETED`, `WALKOVER`, `DISQUALIFIED`, `CANCELLED`.
- *Decisión:* El estado `RESULT_SUBMITTED` se omite en el MVP porque el registro lo hace únicamente el organizador de manera directa y oficial, pasando el matchup directo a `COMPLETED`.

---

# 7. Lógica Competitiva del MVP

## Algoritmo del Tamaño del Bracket
El tamaño del bracket se calcula como la potencia de 2 inmediatamente superior o igual al número de participantes confirmados, con un límite máximo para el MVP de **64 competidores**.
$$\text{Bracket Size} = 2^{\lceil \log_2(N) \rceil}$$

### Distribución de BYEs
Si la cantidad de competidores confirmados no es potencia de dos, el sistema distribuye `BYE`s (slots vacíos representados con ID nulo) en la primera ronda.
- Los BYEs se emparejan con los competidores de mayor cabeza de serie (`seed`).
- Un competidor emparejado con un `BYE` avanza automáticamente a la segunda ronda (el matchup pasa a `COMPLETED` de forma instantánea al iniciar el torneo).
- La victoria por `BYE` no suma victorias ni partidas en las estadísticas deportivas del competidor.

## Sorteo Aleatorio Reproducible (Fisher-Yates)
El sorteo de posiciones utiliza el algoritmo **Fisher-Yates**. Para garantizar la auditabilidad, se genera un UUIDv4 como semilla (`Bracket.generation_seed`). El resultado del barajado de la lista de participantes confirmados debe ser 100% determinista dada la misma lista ordenada y la misma semilla.

---

# 8. Reglas de Negocio (Business Rules)

1. **Inmutabilidad del Bracket:** El bracket queda completamente bloqueado (`LOCKED`) una vez que el primer Matchup inicia su transición al estado `IN_PROGRESS`.
2. **Victoria Matemática (Bo3):** Un matchup Bo3 finaliza inmediatamente cuando un jugador alcanza las 2 victorias (marcador 2-0 o 2-1). No se permite crear ni jugar un tercer GameSet si ya existe ganador matemático.
3. **Lazy GameSets:** Para optimizar base de datos, los registros de `GameSet` se crean de forma diferida (perezosa) únicamente cuando el `Matchup` correspondiente pasa a estado `READY` o `IN_PROGRESS`.
4. **Política de W.O. (Walkover):** Un Walkover otorga la victoria técnica al oponente por 1-0 en Bo1 y 2-0 en Bo3, contabilizando como victoria deportiva en estadísticas pero con 0 coronas registradas para no inflar métricas de Clash Royale.
5. **Auditoría de Modificaciones:** Cualquier corrección sobre un marcador completado requiere abrir una `MatchupResultRevision` con justificación obligatoria. Esta corrección queda bloqueada si el enfrentamiento dependiente de la siguiente ronda ya inició su juego (`IN_PROGRESS`).

---

# 9. Concurrencia y Bloqueos
- **Optimistic Locking:** Las tablas `Competition` y `Matchup` utilizarán una columna `@version` (entero autoincremental en Prisma). Cualquier actualización de marcador validará que la versión en memoria coincida con la base de datos para evitar que dos organizadores pisen el resultado de forma simultánea.
- **Idempotencia:** Las acciones críticas consumen un token UUIDv4 (`X-Idempotency-Key`) persistido en caché durante 24 horas.

---

# 10. Contrato de Base de Datos (Schema: `competition`)

- **`competition.competitions`:**
  - `id` (UUID, PRIMARY KEY)
  - `tournament_id` (UUID, UNIQUE)
  - `status` (VARCHAR(50), DEFAULT 'PENDING_PARTICIPANTS')
  - `bracket_size` (INTEGER)
  - `version` (INTEGER, DEFAULT 1)

- **`competition.rounds`:**
  - `id` (UUID, PRIMARY KEY)
  - `competition_id` (UUID, FOREIGN KEY)
  - `round_number` (INTEGER)
  - `name` (VARCHAR(100))

- **`competition.matchups`:**
  - `id` (UUID, PRIMARY KEY)
  - `round_id` (UUID, FOREIGN KEY)
  - `position` (INTEGER)
  - `participant_a_id` (UUID, NULL, FK -> `participant_snapshots.id`)
  - `participant_b_id` (UUID, NULL, FK -> `participant_snapshots.id`)
  - `winner_id` (UUID, NULL)
  - `status` (VARCHAR(50), DEFAULT 'PENDING_PARTICIPANTS')
  - `score_a` (INTEGER, DEFAULT 0)
  - `score_b` (INTEGER, DEFAULT 0)
  - `next_matchup_id` (UUID, NULL)
  - `version` (INTEGER, DEFAULT 1)

- **`competition.game_sets`:**
  - `id` (UUID, PRIMARY KEY)
  - `matchup_id` (UUID, FOREIGN KEY)
  - `sequence` (INTEGER)
  - `winner_id` (UUID, NULL)
  - `adapter_version` (VARCHAR(50), DEFAULT 'clash-royale@1.0.0')
  - `game_data` (JSONB, NULL)

### Restricciones Físicas de Unicidad
- `UNIQUE (round_id, position)`: Evita empalme de enfrentamientos.
- `UNIQUE (matchup_id, sequence)`: Impide duplicar sets de juego en una serie.

---

# 11. Contrato de API REST

### `POST /api/v1/competitions/:competitionId/generate-bracket`
- **Rol:** `ORGANIZER`.
- **Body:** `{ "seeding_method": "RANDOM" }`.
- **Response JSON (HTTP 201):** Genera llaves en estado `DRAFT`.

### `POST /api/v1/matchups/:matchupId/result`
- **Rol:** `ORGANIZER`.
- **Headers:** `X-Idempotency-Key` (UUID).
- **Body DTO:** `SubmitMatchupResultDto` (contiene ganador y desglose por GameSet).
- **Response JSON (HTTP 200):** Registra el resultado, avanza al ganador y emite eventos de WebSockets.

---

# 12. Especificaciones de UI (Framer Motion & WebSockets)

### Componente: Bracket View (Escritorio vs Móvil)
- **Escritorio:** Canvas responsivo con scroll bidireccional y líneas conectoras SVG dinámicas entre rounds.
- **Móvil:** Selector de pestañas horizontal (`Round 1`, `Octavos`, `Cuartos`) mostrando los matchups en lista vertical.
- **Micro-interacciones:** Al actualizarse un resultado, la tarjeta del Matchup destella sutilmente en color verde en el competidor que avanza, desplazándolo con una animación de translación suave de `Framer Motion` hacia el slot del siguiente matchup.

### Integración en Tiempo Real (WebSockets)
- **Gateways:** `competition.matchup.updated` y `competition.bracket.published`.
- El cliente Next.js escucha el canal privado del torneo (`/tournaments/:slug/live`) y actualiza el estado local de TanStack Query sin requerir recargar la página completa.

---

# 13. Criterios de Aceptación (DOD & QA Plan)
- [ ] La generación de llaves distribuye correctamente las potencias de dos y asigna `BYE`s en los matchups extremos.
- [ ] La semilla de generación de Fisher-Yates garantiza brackets idénticos ante la misma lista inicial de competidores.
- [ ] Las APIs bloquean cualquier actualización de marcadores si la versión del optimisc lock entra en conflicto.
- [ ] Una victoria por W.O. suma al legado deportivo, pero no agrega conteo de coronas ni estadísticas de mazos de cartas.
