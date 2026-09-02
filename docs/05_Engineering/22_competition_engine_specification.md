# Campus Arena

## Competition Engine Specification v1.0

**Propósito:** Definir el funcionamiento lógico del motor de competencia de Campus Arena. Este motor es agnóstico a cualquier videojuego o institución y está diseñado para ser extensible, configurable y orientado a eventos mediante un patrón de adaptadores de juego (Game Adapters).

---

# 1. Objetivo y Principios

El **Competition Engine** es el núcleo competitivo de la plataforma. Su responsabilidad es administrar la lógica deportiva de cualquier torneo sin acoplarse a las reglas particulares de un videojuego específico.

### Principios Fundamentales
- **Independiente del Juego:** No almacena ni procesa variables internas de juego directamente en su núcleo.
- **Independiente de la Institución:** Funciona sin importar la organización anfitriona.
- **Reutilizable y Empaquetable:** Diseñado de tal forma que podría convertirse en una librería independiente.
- **Configurable:** Soporta múltiples formatos de torneo, tamaños de llaves y reglas de rondas.
- **Auditable y Orientado a Eventos:** Cada cambio de estado genera un evento inmutable de auditoría.

---

# 2. Conceptos Fundamentales

- **Temporada:** Agrupación cronológica de torneos (ej: *Temporada 2027 - Semestre I*).
- **Torneo:** Evento competitivo específico (ej: *Torneo de Clash Royale - Sede Lima*). Posee un juego, fechas, participantes, reglas y un formato asignado.
- **Participante:** Unidad competitiva. En el MVP representa a un *Jugador (Competidor)*; en versiones avanzadas podrá representar un *Equipo*.
- **Bracket:** Estructura completa que organiza el árbol competitivo del torneo. Contiene rondas, llaves y partidas.
- **Ronda:** Agrupación lógica de llaves que ocurren simultáneamente o en una fase común (ej: *Octavos*, *Cuartos*, *Semifinal*, *Final*).
- **Llave (Matchup):** Enfrentamiento directo entre dos participantes. Contiene las referencias a los dos contrincantes, estado, ganador, marcador agregado y la lista de partidas jugadas.
- **Partida (Game):** Enfrentamiento individual dentro de una Llave. Una Llave de tipo "Mejor de 3" (Bo3) puede contener hasta 3 partidas individuales.

---

# 3. Ciclo de Vida y Estados

### Estados del Torneo
- `Draft` (Borrador)
- `Published` (Publicado)
- `Registration Open` (Inscripciones Abiertas)
- `Registration Closed` (Inscripciones Cerradas)
- `Draw Generated` (Llaves Sorteadas)
- `In Progress` (En Curso)
- `Finished` (Finalizado)
- `Archived` (Archivado en el Histórico)

### Estados de la Llave (Matchup)
- `Pendiente` (Esperando rivales - ej. en fases avanzadas del bracket)
- `Programada` (Rivales definidos, fecha y hora asignadas)
- `En Juego` (Partidas disputándose activamente)
- `Finalizada` (Marcador resuelto, ganador definido)
- `Walkover (W.O.)` (Victoria por incomparecencia de uno de los participantes)
- `Cancelada`

### Estados de la Partida (Game)
- `Pendiente`
- `En Curso`
- `Finalizada`
- `Validada` (Marcador confirmado por un organizador o árbitro)

---

# 4. Formatos Soportados y Roadmap
El motor define una interfaz común de bracket que será extendida por cada formato competitivo:

```
          ┌─── Eliminación Simple (MVP)
          ├─── Doble Eliminación (v1.5)
Format ───┼─── Round Robin (v2.0)
          ├─── Sistema Suizo (v2.5)
          └─── Grupos + Playoffs (v3.0)
```

---

# 5. Configuración de Rondas y Llaves
Cada torneo define reglas de juego para sus llaves:
- **Número de Partidas (BoX):** Mejor de 1 (Bo1), Mejor de 3 (Bo3), Mejor de 5 (Bo5), Mejor de 7 (Bo7).
- **Capacidad:** Número máximo de participantes.
- **Tolerancia:** Tiempo límite de espera antes de declarar un Walkover (W.O.).
- **Método de Sorteo (Draw Seed):**
  - *Aleatorio:* Emparejamiento por azar de participantes validados.
  - *Seeded:* Emparejamiento basado en clasificación, nivel de trofeos, rango o historial competitivo.
  - *Manual:* El organizador acomoda directamente la posición de los participantes en la llave.

---

# 6. Eventos del Motor
Cada transición importante emite un evento de dominio inmutable:
1. `bracket.generated` ➔ Dispara notificaciones de emparejamiento.
2. `matchup.started` ➔ Alerta a los jugadores que su partida está lista.
3. `game.result_submitted` ➔ Registra el marcador parcial de una partida.
4. `matchup.finished` ➔ Promueve al ganador a la siguiente ronda de forma automática.
5. `tournament.finished` ➔ Actualiza estadísticas, otorga medallas y archiva la información en el legado histórico.

---

# 7. Arquitectura de Adaptadores de Juego (Game Adapters)

Para evitar acoplar la lógica de un juego específico dentro del motor, Campus Arena implementa el patrón **Game Adapters**:

```
                             ┌───► Clash Royale Adapter (Player Tag, Decks, Duración)
                             ├───► Brawl Stars Adapter (Player Tag, Brawlers, Copas)
[Competition Engine Core] ───┼───► Valorant Adapter (Riot ID, Rondas, Mapas, Agentes)
                             ├───► Rocket League Adapter (ID, Goles, Asistencias)
                             └───► EA Sports FC Adapter (ID, Goles, Tarjetas)
```

### Responsabilidades de cada Adaptador de Juego
1. **Validación de Identidades externas:** Conectarse con las APIs oficiales para validar el Player Tag/ID de juego del competidor.
2. **Sincronización de Datos y Estadísticas:** Obtener información del jugador en tiempo real (ej: nivel de trofeos de Clash Royale) para su uso en el seeding.
3. **Registro de Información Enriquecida de Partida:** Guardar metadatos exclusivos del juego dentro de cada Partida individual sin alterar las tablas centrales del motor.
   - *Ejemplo en Clash Royale:* Mazo utilizado (cards list), duración de la partida, coronas obtenidas.
4. **Presentación Visual Exclusiva:** Exponer a la capa del frontend los metadatos para renderizar llaves ricas y dinámicas en lugar de un simple marcador de texto.

---

# 8. Ejemplo de Matchup Enriquecido (Clash Royale)

```text
🏆 Octavos de Final: Luis (Tecsup) VS Carlos (Tecsup) ➔ Resultado Final: 2 - 1

├── Partida 1
│   ├── Ganador: Luis
│   ├── Mazo de Luis: P.E.K.K.A Bridge Spam
│   ├── Mazo de Carlos: Log Bait
│   └── Duración: 2:34
│
├── Partida 2
│   ├── Ganador: Carlos
│   ├── Mazo de Luis: Giant Graveyard
│   ├── Mazo de Carlos: LavaLoon
│   └── Duración: 3:11
│
└── Partida 3 (Definitoria)
    ├── Ganador: Luis
    ├── Mazo de Luis: Hog EQ
    ├── Mazo de Carlos: 2.6 Hog Cycle
    └── Duración: 1:58
```
