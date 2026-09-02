# Campus Arena

## Database Architecture (Conceptual Model) v1.0

**Propósito:** Definir el modelo conceptual e indicar cómo estructuraremos físicamente las tablas en PostgreSQL mediante esquemas aislados por dominio. Esto previene una base de datos gigante, promueve el desacoplamiento de Domain-Driven Design (DDD) y facilita que cada microservicio o módulo acceda únicamente a su ámbito autorizado.

---

# 1. Filosofía de Diseño

La base de datos representa el conocimiento del negocio. No se diseña únicamente para almacenar datos temporales, sino para modelar de forma fidedigna y normalizada las relaciones del mundo real.

- **Normalización e Integridad:** Uso estricto de restricciones de claves foráneas (`FOREIGN KEY`) y claves primarias (`UUIDv4`) para evitar inconsistencias deportivas o de pago.
- **Auditable:** Todas las entidades clave tendrán campos de control temporal (`created_at`, `updated_at`, `deleted_at` para borrado lógico).
- **Esquemas Postgres (Multitenancy & Modularidad):** Utilizaremos la característica de **Multi-Schema** de PostgreSQL para aislar los dominios en esquemas lógicos separados, en lugar de tener un esquema `public` sobrecargado.

---

# 2. Organización por Esquemas de PostgreSQL

Para reflejar el diseño táctico de DDD directamente en la persistencia de datos, Campus Arena organizará sus tablas bajo los siguientes esquemas de base de datos:

```
Database (PostgreSQL)
  ├── 📂 auth (Identidad y Sesiones)
  ├── 📂 profile (Perfiles de usuario y personalización)
  ├── 📂 organization (Instituciones, Sedes y Temporadas)
  ├── 📂 games (Juegos y adaptadores externos)
  ├── 📂 tournament (Torneos y registros de participantes)
  ├── 📂 payments (Gestión de pagos y evidencias)
  ├── 📂 competition (Motor deportivo: Brackets, Rondas, Matches, GameSets)
  ├── 📂 statistics (Métricas cuantitativas de desempeño)
  ├── 📂 achievements (Medallas y logros desbloqueados)
  ├── 📂 community (Contenido público y social)
  ├── 📂 notifications (Cola de mensajes y plantillas)
  └── 📂 administration (Auditoría, eventos y configuraciones)
```

---

# 3. Estructura de Entidades por Dominio

## 📂 Esquema: `auth` (Identity)
Responsable del control de acceso al sistema y seguridad. Nunca almacena detalles de torneos o datos académicos de perfil.
- **`User`:** Credenciales principales (ID, correo, hash de contraseña encriptado, estado).
- **`Role`:** Roles de seguridad (ej: `COMPETITOR`, `ORGANIZER`, `ADMIN`).
- **`Permission`:** Permisos granulares de acción (ej: `tournament:create`, `payment:validate`).
- **`UserRole`:** Tabla asociativa intermedia para asignar roles a usuarios.
- **`RefreshToken`:** Almacén seguro para rotación y revocación de tokens JWT.
- **`Session`:** Registro de sesiones activas e IP/dispositivo.
- **`EmailVerification`:** Tokens temporales para verificar correos creados.
- **`PasswordReset`:** Tokens temporales de recuperación de clave.

## 📂 Esquema: `profile`
Responsable de modelar la identidad personal, académica y de comunidad del competidor.
- **`UserProfile`:** Información del estudiante (Nombre, Apellidos, Carrera, Ciclo, Sede académica, Biografía).
- **`SocialLink`:** Enlaces a redes sociales y plataformas de streaming (Twitch, YouTube, Twitter).
- **`FavoriteGame`:** Relación con los juegos favoritos del usuario para personalización de dashboard.
- **`Avatar`:** Biblioteca y metadatos de imágenes de avatar disponibles o cargadas.
- **`PrivacySettings`:** Configuración de visualización de perfil (Público, Privado, Solo Organización).

## 📂 Esquema: `games`
Catálogo de videojuegos soportados nativamente por el motor.
- **`Game`:** Datos base del videojuego (Nombre, Desarrolladora, Formatos, Icono).
- **`GameProfile`:** Vinculación de cuenta de juego del usuario (Player Tag, Nombre en juego).
- **`GameAdapter`:** Configuración lógica y llaves de la API oficial para la obtención de datos.
- **`GameMode`:** Configuraciones del modo de juego (ej: 1vs1, 2vs2, 5vs5).

## 📂 Esquema: `organization`
Permite el escalamiento multiinstitucional aislando los torneos por entidad organizadora.
- **`Organization`:** Instituciones registradas (ej: Tecsup, UPC, Empresa X).
- **`Campus`:** Sedes geográficas o virtuales de la organización (ej: Tecsup Lima, Tecsup Arequipa).
- **`Season`:** Periodo deportivo asociado a la organización (ej: *2027-I*).
- **`Organizer`:** Relación de personal autorizado a gestionar eventos de la organización.

## 📂 Esquema: `tournament`
Gestión de torneos y solicitudes de registro de participantes.
- **`Tournament`:** Datos del evento competitivo (Nombre, Juego, Temporada, Cupos, Premios, Estado).
- **`TournamentTemplate`:** Plantillas para creación rápida de torneos recurrentes.
- **`TournamentRule`:** Reglas oficiales y reglamentos asociados.
- **`TournamentPrize`:** Distribución de premios del torneo.
- **`Registration`:** Inscripción vinculando competidor, torneo y estado de registro.

## 📂 Esquema: `payments`
Registro contable y evidencias financieras.
- **`Payment`:** Registro de la transacción y relación con la inscripción.
- **`PaymentMethod`:** Catálogo de métodos activos (Yape, Plin, Transferencia bancaria).
- **`PaymentEvidence`:** Historial de archivos cargados como comprobantes.
- **`Refund`:** Procesamiento de devoluciones en caso de cancelaciones.

## 📂 Esquema: `competition` (Competition Engine Core)
El motor de ejecución deportiva. Administra la estructura de llaves.
- **`Bracket`:** Árbol deportivo asociado al torneo.
- **`Round`:** Fase de eliminación (ej: Octavos, Cuartos).
- **`Match`:** Enfrentamiento individual (Llave) entre dos participantes en una ronda.
- **`MatchParticipant`:** Registro intermedio para manejar competidores (jugador o equipo) de cada matchup.
- **`GameSet`:** Partida individual del Match (Bo3/Bo5).
- **`GameData`:** Contenedor de datos enriquecidos exclusivos de cada videojuego (ej: mazo de Clash Royale, mapa de Valorant) asociado al GameSet.

## 📂 Esquema: `statistics` (Analytics & KPIs)
Tablas de cómputo para rankings y rendimientos.
- **`UserStatistics`:** Win rate, partidas jugadas, victorias, derrotas acumuladas de cada usuario.
- **`TournamentStatistics`:** Datos de rendimiento del torneo.
- **`SeasonStatistics`:** Resumen acumulado de la temporada.

## 📂 Esquema: `achievements` (Gamificación)
- **`Medal`:** Catálogo de medallas (ej: *Campeón*, *Veterano*).
- **`Achievement`:** Logros por hitos de plataforma (ej: *100 victorias*).
- **`UserMedal`:** Medallas ganadas por los competidores.
- **`UserAchievement`:** Logros desbloqueados por los usuarios.

## 📂 Esquema: `community`
- **`News`:** Artículos informativos y publicaciones.
- **`Announcement`:** Avisos importantes en los dashboards.
- **`Gallery`:** Imágenes y videos compartidos de los torneos.
- **`Comment`:** Interacción social (versión futura).

## 📂 Esquema: `notifications`
- **`Notification`:** Historial de notificaciones internas del usuario.
- **`NotificationTemplate`:** Estructura de mensajes automáticos.
- **`EmailQueue`:** Cola de correos electrónicos pendientes de envío.

## 📂 Esquema: `administration`
- **`AuditLog`:** Log inmutable de auditoría de seguridad y administración.
- **`SystemEvent`:** Eventos de negocio (ej: `payment.approved`) para desencadenantes automáticos.
- **`Configuration`:** Variables de configuración global del sistema SaaS.

---

# 4. Diagrama y Relaciones de Alto Nivel

```
[organization.Organization]
       │ (1:N)
[organization.Season]
       │ (1:N)
[tournament.Tournament] ◄─────────────── (1:1) ──────────────► [competition.Bracket]
       │ (1:N)                                                        │ (1:N)
[tournament.Registration] ◄─── (1:1) ──► [payments.Payment]     [competition.Round]
       │ (N:1)                                                        │ (1:N)
[auth.User] ◄───────────────────────────────────────────────► [competition.Match]
       ├───────► [profile.UserProfile] (1:1)                           │ (1:N)
       ├───────► [games.GameProfile] (1:N)                      [competition.GameSet] ──► [competition.GameData]
       ├───────► [achievements.UserMedal] (1:N)
       └───────► [statistics.UserStatistics] (1:N)
```

---

# 5. Preparación del Schema de Prisma para Múltiples Esquemas (MultiSchema)
Para soportar esta arquitectura modular directamente con Prisma, utilizaremos el soporte de esquemas múltiples configurando el archivo `schema.prisma` de la siguiente forma:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["auth", "profile", "games", "organization", "tournament", "payments", "competition", "statistics", "achievements", "community", "notifications", "administration"]
}
```
Esto asegura que las migraciones generen los esquemas correspondientes en PostgreSQL y el cliente de Prisma esté 100% tipado por dominio.
