# Campus Arena

## Data Dictionary v1.0

**Propósito:** Definir todas las entidades principales del sistema, su propósito y sus relaciones lógicas antes del diseño físico de la base de datos. Este documento representa la referencia oficial del modelo de datos para Prisma ORM, la base de datos PostgreSQL y las APIs.

---

# 1. User
- **Descripción:** Representa a cualquier persona registrada en Campus Arena. Puede desempeñar distintos roles (competidor, organizador o administrador).
- **Responsabilidades:** Autenticarse, gestionar su perfil de usuario, participar en torneos, recibir notificaciones y mantener un historial competitivo.
- **Relaciones:** 
  - Tiene un `UserProfile` (1:1).
  - Puede poseer múltiples `GameProfile` (1:N).
  - Puede tener múltiples `Registration` (1:N).
  - Puede obtener múltiples `Medal` (N:M).
  - Puede obtener múltiples `Achievement` (N:M).

---

# 2. UserProfile
- **Descripción:** Contiene la información pública y académica del usuario.
- **Campos Clave:** Nombre, Apellidos, Foto/Avatar, Biografía, Organización Principal, Carrera, Ciclo actual, Juegos favoritos, Configuración de privacidad.
- **Relaciones:** Pertenece a un único `User` (1:1).

---

# 3. Organization
- **Descripción:** Representa una institución o comunidad que organiza las temporadas y torneos (ej: Tecsup, UPC, PUCP, empresas).
- **Relaciones:** Puede administrar múltiples `Season` (1:N) y `Tournament` (1:N).

---

# 4. Season (Temporada)
- **Descripción:** Agrupa torneos bajo un mismo periodo cronológico de la organización (ej: *Temporada 2027-I*).
- **Relaciones:** Pertenece a una `Organization` (N:1) y contiene múltiples `Tournament` (1:N).

---

# 5. Game
- **Descripción:** Representa un videojuego soportado de forma nativa por Campus Arena (ej: Clash Royale, Brawl Stars).
- **Relaciones:** Asociado a múltiples `Tournament` (1:N) y tiene múltiples `GameProfile` (1:N).

---

# 6. GameProfile
- **Descripción:** Vincula un usuario con un videojuego específico para almacenar identificadores de juego.
- **Campos Clave:** Player Tag (ej: Clash Royale/Brawl Stars Tag), Nombre en el juego (IGN).
- **Relaciones:** Pertenece a un `User` (N:1) y a un `Game` (N:1).

---

# 7. Tournament
- **Descripción:** Representa un evento competitivo individual.
- **Campos Clave:** Juego, Temporada, Organización, Fechas, Reglamento, Estado, Cupos (mín/máx), Premios, Configuración.
- **Relaciones:** 
  - Pertenece a un `Game` (N:1).
  - Pertenece a una `Season` (N:1).
  - Pertenece a una `Organization` (N:1).
  - Recibe múltiples `Registration` (1:N).
  - Genera un `Bracket` (1:1).

---

# 8. Registration
- **Descripción:** Representa la solicitud de inscripción de un competidor a un torneo específico.
- **Estados:** Pendiente, Pago pendiente, En revisión, Confirmada, Rechazada, Cancelada.
- **Relaciones:** 
  - Pertenece a un `User` (N:1).
  - Pertenece a un `Tournament` (N:1).
  - Puede tener asociado un `Payment` (1:1).

---

# 9. Payment
- **Descripción:** Representa la evidencia y estado del pago realizado para concretar una inscripción.
- **Campos Clave:** Método (Yape, Plin, Transferencia), Monto, Moneda, Estado (Pendiente, Aprobado, Rechazado), Comprobante (URL de imagen), Fecha.
- **Relaciones:** Pertenece a una única `Registration` (1:1).

---

# 10. Bracket
- **Descripción:** Representa la estructura competitiva (árbol de eliminación) de un torneo específico.
- **Relaciones:** 
  - Pertenece a un `Tournament` (1:1).
  - Contiene múltiples `Round` (1:N).

---

# 11. Round (Ronda)
- **Descripción:** Agrupa enfrentamientos dentro de una misma fase del torneo (ej: Octavos, Cuartos, Semifinal).
- **Relaciones:** Pertenece a un `Bracket` (N:1) y contiene múltiples `Match` (1:N).

---

# 12. Match (Enfrentamiento / Llave)
- **Descripción:** Representa un enfrentamiento directo entre dos competidores dentro de una ronda.
- **Campos Clave:** Competidor A (User), Competidor B (User), Estado (Pendiente, En juego, W.O., etc.), Ganador (User), Resultado (marcador).
- **Relaciones:** 
  - Pertenece a una `Round` (N:1).
  - Contiene uno o varios `GameSet` (1:N).

---

# 13. GameSet (Partida)
- **Descripción:** Representa una partida individual dentro de un enfrentamiento al mejor de X (BoX).
- **Relaciones:** 
  - Pertenece a un `Match` (N:1).
  - Tiene una referencia a `GameData` (1:1).

---

# 14. GameData
- **Descripción:** Entidad flexible destinada a almacenar información exclusiva de las partidas de cada videojuego mediante adaptadores.
- **Ejemplos de campos:**
  - *Clash Royale:* Mazo utilizado, duración de la partida, coronas obtenidas.
  - *Valorant:* Agente seleccionado, mapa, rondas ganadas, KDA.
  - *Rocket League:* Goles, asistencias, salvadas.
- **Relaciones:** Pertenece a un `GameSet` (1:1).

---

# 15. Medal
- **Descripción:** Reconocimiento visual y gamificado asignado a los competidores por sus resultados en torneos (ej: Campeón, Subcampeón, Primera participación).
- **Relaciones:** Puede pertenecer a múltiples `User` (N:M).

---

# 16. Achievement (Logro)
- **Descripción:** Distinciones automáticas del sistema basadas en estadísticas acumuladas (ej: *10 torneos disputados*, *20 victorias consecutivas*).
- **Relaciones:** Puede pertenecer a múltiples `User` (N:M).

---

# 17. Notification
- **Descripción:** Comunicaciones y alertas enviadas al usuario (correo, alertas push, mensajes en plataforma).
- **Relaciones:** Pertenece a un `User` (N:1).

---

# 18. News
- **Descripción:** Publicaciones oficiales de noticias de la plataforma o de organizaciones específicas.
- **Relaciones:** Puede pertenecer opcionalmente a una `Organization` (N:1).

---

# 19. AuditLog
- **Descripción:** Registro inmutable de acciones críticas del sistema para fines de seguridad y control (ej: modificación de resultados, inicio de sesión).
- **Relaciones:** Vinculado al `User` que ejecuta la acción (N:1).

---

# 20. SystemEvent
- **Descripción:** Registro cronológico de eventos de negocio significativos para estadísticas y flujos automáticos (ej: `user.registered`, `bracket.generated`, `medal.awarded`).

---

# Relaciones de Alto Nivel

```text
Organization
  │
  └── Season
        │
        └── Tournament
              │
              ├── Registration ── Payment
              │
              └── Bracket
                    │
                    └── Round
                          │
                          └── Match
                                │
                                └── GameSet ── GameData

User
  │
  ├── UserProfile
  ├── GameProfile (Vinculación de Player Tags)
  ├── Registration (Historial competitivo)
  ├── Medal
  ├── Achievement
  └── Notification
```
