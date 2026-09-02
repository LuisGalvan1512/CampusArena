# Campus Arena

# Project Glossary v1.0

This glossary defines the ubiquitous language terms for Campus Arena. All variables, database columns, class names, code comments, and documentation must stick to these terms.

---

# 1. Ubiquitous Vocabulary

### Competidor
- **Definición:** Usuario estudiante registrado en la plataforma que participa activamente en los torneos.
- **Nivel de Código:** `Competitor` / `competitor` (o `User` en el contexto de autenticación).
- **Prohibido usar:** `Player`, `Client`, `Customer`, `Student`.

### Organizador
- **Definición:** Usuario con privilegios de gestión deportiva asignado a una organización para programar torneos, validar pagos y registrar marcadores.
- **Nivel de Código:** `Organizer` / `organizer`.
- **Prohibido usar:** `Admin` (salvo que sea administrador global), `Staff`, `Ref`.

### Bracket
- **Definición:** Estructura física y lógica que contiene el árbol de eliminación del torneo.
- **Nivel de Código:** `Bracket` / `bracket`.
- **Prohibido usar:** `Tree`, `Chart`, `Diagram`.

### Match (Llave)
- **Definición:** Enfrentamiento deportivo entre dos competidores dentro de una ronda de eliminación.
- **Nivel de Código:** `Match` / `match`.
- **Prohibido usar:** `Game` (salvo para partidas individuales), `Versus`, `Battle`.

### GameSet (Partida)
- **Definición:** Enfrentamiento individual de videojuego que forma parte de un Match al mejor de X (ej: Partida 1 de un Bo3).
- **Nivel de Código:** `GameSet` / `game_set`.
- **Prohibido usar:** `Round` (Ronda agrupa matches, no partidas individuales), `Game`.

### Legado (Legacy)
- **Definición:** Historial inmutable y permanente de estadísticas, medallas, participaciones y campeonatos de un competidor.
- **Nivel de Código:** `Legacy` / `legacy`.
- **Prohibido usar:** `Profile History`, `User Records`.

### Organización
- **Definición:** Institución académica o empresarial registrada en la plataforma (ej: Tecsup).
- **Nivel de Código:** `Organization` / `organization`.
- **Prohibido usar:** `Tenant`, `School`, `Company`.
