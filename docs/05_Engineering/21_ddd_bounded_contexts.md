# Campus Arena

## Domain Driven Design (DDD) & Bounded Contexts v1.0

**Propósito:** Definir los límites lógicos (Bounded Contexts), el lenguaje del dominio y las responsabilidades exclusivas de cada contexto dentro del diseño modular de Campus Arena. Esto evita el acoplamiento cruzado y permite escalar el sistema soportando múltiples juegos, organizaciones y flujos financieros.

---

# 1. ¿Por qué DDD y Bounded Contexts?
Campus Arena se implementa bajo principios de DDD para garantizar que cada parte del sistema sea independiente. A medida que sumemos más videojuegos (Valorant, League of Legends, CS2, etc.) u organizaciones, cada contexto podrá evolucionar por separado.

Un **Bounded Context** representa un límite lógico donde un término o modelo tiene un significado claro y unas reglas explícitas.
- *Ejemplo:* El contexto de **Payments** no sabe cómo funciona un bracket ni qué jugadores participan. Solo conoce transacciones y estados de pago para un identificador de inscripción.
- *Ejemplo:* El contexto de **Competition Engine** no conoce la información de inicio de sesión ni roles de usuario; solo gestiona partidas, contrincantes y resultados.

---

# 2. Los 14 Bounded Contexts de Campus Arena

```
Campus Arena
   ├── 1. Identity
   ├── 2. User Profile
   ├── 3. Organizations
   ├── 4. Games
   ├── 5. Tournament Management
   ├── 6. Registration
   ├── 7. Payments
   ├── 8. Competition Engine ⭐
   ├── 9. Statistics
   ├── 10. Medals & Achievements
   ├── 11. Notifications
   ├── 12. Community
   ├── 13. Administration
   └── 14. Analytics
```

---

## 1️⃣ Identity Context
- **Responsabilidades:**
  - Registro de cuenta.
  - Inicio de sesión y verificación de sesión (JWT / Refresh Tokens).
  - Control de accesos basado en Roles y Permisos globales (Competidor, Organizador, Admin).
  - Procesos de verificación de correo institucional y recuperación de contraseñas.
- **Aislamiento:** Nunca conoce conceptos como "torneos", "brackets" o "comprobantes de pago".

## 2️⃣ User Profile Context
- **Responsabilidades:**
  - Información pública y privada del competidor (nombre, avatar, biografía, redes sociales).
  - Datos académicos (carrera, ciclo, sede).
  - Preferencias de privacidad del perfil.
  - Historial personal y juegos favoritos vinculados.
- **Aislamiento:** No administra credenciales ni tokens de sesión (Identity). Solo almacena y sirve información del perfil.

## 3️⃣ Organizations Context
- **Responsabilidades:**
  - Registro de instituciones o comunidades (Tecsup, UPC, PUCP, empresas).
  - Información de campus y sedes.
  - Vinculación de usuarios a organizaciones académicas.
- **Aislamiento:** Permite que Campus Arena funcione como un entorno multitenant sin alterar las entidades centrales de torneo.

## 4️⃣ Games Context
- **Responsabilidades:**
  - Administrar el catálogo de videojuegos activos (Clash Royale, Brawl Stars, Valorant, etc.).
  - Definir las reglas específicas y metadatos de integración para cada juego.
  - *Clash Royale:* Player Tag, Arena, Trofeos.
  - *Valorant:* Riot ID, Agente favorito, Rondas, Mapas.
- **Aislamiento:** Funciona como un adaptador dinámico que expone los campos necesarios para otros módulos sin obligar a cambiar la estructura principal de la base de datos de torneos.

## 5️⃣ Tournament Management Context
- **Responsabilidades:**
  - Gestión de temporadas (fechas de inicio y fin).
  - Configuración y ciclo de vida de los torneos (Borrador, Publicado, En curso, Finalizado, Archivado).
  - Gestión de reglamentos, premios e información pública de convocatorias.
- **Aislamiento:** Define los participantes aprobados y la estructura del evento, pero delegará el cálculo del emparejamiento (brackets) y resultados al motor de competencia.

## 6️⃣ Registration Context
- **Responsabilidades:**
  - Gestión de solicitudes de participación por torneo.
  - Estados del participante (Inscripción enviada, Esperando confirmación, Aceptada, Cancelada, Lista de espera).
- **Aislamiento:** Conecta el perfil del jugador con el torneo y genera el hook hacia la validación de pagos.

## 7️⃣ Payments Context
- **Responsabilidades:**
  - Almacenar comprobantes de pago digitales cargados por los competidores.
  - Bandeja de entrada de pagos pendientes para revisión de organizadores.
  - Integraciones con pasarelas de pago (Yape, Plin, Mercado Pago, Stripe).
- **Aislamiento:** Solo entiende transacciones, estados de pago (Pendiente, Aprobado, Rechazado) y montos de dinero. Se comunica con el contexto de Inscripción a través de identificadores de referencia.

## 8️⃣ Competition Engine Context ⭐
El corazón lógico del torneo. Puede ser extraído como una librería de código independiente.
- **Responsabilidades:**
  - Generación automática de brackets de eliminación (Eliminación simple, doble eliminación, suizo).
  - Asignación de rondas y emparejamientos de partidas.
  - Registrar marcadores y resultados oficiales.
  - Procesamiento automático de victorias por default (Walkovers / W.O.) y descalificaciones.
  - Determinación del Campeón.

## 9️⃣ Statistics Context
- **Responsabilidades:**
  - Calcular y guardar el historial de victorias/derrotas de partidas.
  - Calcular porcentajes de victoria (Win Rate) globales y segmentados por juego.
  - Identificar MVPs y registrar récords.
- **Aislamiento:** No realiza lógica de cobro ni autenticación. Consume resultados y eventos del Competition Engine.

## 🔟 Medals Context (Achievements)
- **Responsabilidades:**
  - Definir los criterios de insignias y medallas.
  - Otorgar automáticamente reconocimientos gamificados al jugador (ej: *Jugador Constante*).
- **Aislamiento:** Reacciona a eventos emitidos por torneos y estadísticas para actualizar de manera asíncrona el perfil del usuario.

## 1️⃣1️⃣ Notifications Context
- **Responsabilidades:**
  - Envío de correos electrónicos transaccionales.
  - Alertas instantáneas y push mediante WebSockets.
  - Recordatorios de partidas y avisos de aprobación.

## 1️⃣2️⃣ Community Context
- **Responsabilidades (Evolución Futura):**
  - Feed general de actividades.
  - Comentarios, reacciones e interacción social entre competidores.

## 1️⃣3️⃣ Administration Context
- **Responsabilidades:**
  - Panel centralizado de control global de la aplicación.
  - Auditoría de accesos y logs.
  - Moderación de perfiles, comentarios y contenido público.
- **Aislamiento:** No contiene lógica de negocio; orquesta acciones administrativas y de seguridad general.

## 1️⃣4️⃣ Analytics Context
- **Responsabilidades:**
  - Generación de reportes globales y gráficos de conversión.
  - KPIs de retención, usuarios activos y métricas de temporadas.

---

# 3. Flujo y Relaciones entre Dominios

El flujo de interacción de dominios sigue una ruta lógica y secuencial:

```
[Identity]
    │  (Autentica / Crea sesión)
    ▼
[User Profile]
    │  (Vincula juego y solicita participar)
    ▼
[Registration] ── (Envia comprobante) ──► [Payments]
    │                                         │
    │  (Si Pago es Aprobado)                  │ (Valida transacción)
    ▼                                         ▼
[Tournament]
    │  (Cierra inscripción y convoca inicio)
    ▼
[Competition Engine] ── (Sortea llaves y registra marcador de partidas)
    │
    ├─────────────────────────────┐
    ▼                             ▼
[Statistics]                 [Medals & Achievements]
(Actualiza Win Rate)         (Desbloquea logros e insignias)
    │                             │
    └──────────────┬──────────────┘
                   ▼
       [User Profile Legado]
(El legado competitivo se actualiza)
```
