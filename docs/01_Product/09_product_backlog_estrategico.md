# Campus Arena

## Strategic Product Backlog & MVP Scope v1.0

**Propósito:** Definir los límites funcionales del **MVP Freeze** (Producto Mínimo Viable) de Campus Arena y organizar las características secundarias e incrementales en un backlog estratégico de versiones futuras (v1.1 a v3.0). Esto asegura un lanzamiento ágil y enfocado en resolver el problema central sin dispersión de esfuerzos.

---

# 1. Definición del MVP (Alcance del MVP Freeze)

El MVP se enfoca exclusivamente en validar el flujo de inscripción, pago y motor deportivo básico para un solo competidor y un formato de juego directo.

### ✅ Módulos Incluidos en el MVP

1. **Landing Page:**
   - Presentación de la propuesta de valor de Campus Arena.
   - Listado de próximos torneos destacados.
   - Listado de videojuegos disponibles con tags.
   - Call to Action (CTA) destacado para registrarse.
2. **Autenticación (Identity):**
   - Registro de cuentas de estudiante.
   - Inicio de sesión y mantenimiento de sesión.
   - Recuperación de contraseñas.
   - Flujo de verificación de correo electrónico.
3. **Perfil del Competidor:**
   - Datos personales y académicos básicos.
   - Juegos favoritos.
   - Vinculación de Player Tags (Clash Royale y Brawl Stars).
   - Historial básico de partidas.
4. **Módulo de Torneos:**
   - Crear, editar, visualizar y archivar torneos.
   - Botón interactivo de inscripción.
5. **Inscripciones:**
   - Registro de solicitudes por torneo.
   - Visualización de la lista pública de participantes aprobados.
6. **Pagos:**
   - Cargador de capturas de comprobantes de pago (Yape/Plin/Transferencias).
   - Panel de aprobación/rechazo administrativo de pagos.
7. **Competition Engine (Motor Deportivo MVP):**
   - Soporte exclusivo de formato **Eliminación Simple**.
   - Configuración de enfrentamientos **Mejor de 1 (Bo1)** y **Mejor de 3 (Bo3)**.
8. **Resultados:**
   - Registro del marcador del matchup por el organizador.
   - Actualización dinámica e instantánea de las ramas del bracket.
9. **Dashboard del Organizador:**
   - Creación rápida de torneos.
   - Inbox unificado para revisión y validación de comprobantes de pago.
   - Botón para generar el sorteo del bracket tras el cierre de registros.
   - Registro rápido de marcadores de enfrentamiento.
10. **Dashboard del Competidor:**
    - Listado de "Mis Torneos" inscritos.
    - Mi perfil y legado inicial.
    - Mis medallas y reconocimientos obtenidos automáticamente.
    - Historial personal de partidas.

---

# 2. Excluido del MVP (Mapeado al Backlog)

Las siguientes características quedan congeladas y pospuestas para asegurar un desarrollo rápido y un lanzamiento a tiempo:
- Gestión de Equipos (2vs2, 5vs5).
- Gestión de Ligas y clasificaciones por puntos.
- Marketplace deportivo y patrocinios.
- Streaming embebido e integración de transmisiones de video.
- Integración de Inteligencia Artificial para resúmenes.
- Exposición de API pública.
- Mensajería interna y chat entre competidores.
- Feed social, comentarios y reacciones.
- Sistema de lista de amigos.
- Rankings mundiales globales.
- Torneos de modalidad "Fantasy".
- Soporte para organizaciones profesionales de eSports (fuera del ámbito estudiantil).
- Localización multiidioma.
- Aplicación móvil nativa (Android/iOS).

---

# 3. Product Backlog Estratégico (Roadmap)

### Versión 1.1 — Estadísticas y Rankings
- Rankings avanzados inter-sedes.
- Estadísticas acumuladas y filtradas por temporada competitiva.
- Mejoras de personalización en el perfil del competidor (redes sociales y personalización cosmética).

### Versión 1.5 — Equipos y Torneos Grupales
- Registro de Equipos de estudiantes.
- Torneos por equipos (ej: Valorant 5vs5, Brawl Stars 3vs3).
- Roles de Capitán de equipo para inscripción y carga de pagos grupales.

### Versión 2.0 — Integraciones y Automatización
- Integración nativa y en tiempo real con las APIs oficiales de Supercell (Clash Royale y Brawl Stars).
- Historial competitivo de partidas detallado (con mazos y duración de partida automatizados).
- Módulo de Streaming integrado.
- Servicio de Inteligencia Artificial (IA) para generar resúmenes narrados de las finales y hazañas del torneo.

### Versión 3.0 — Ecosistema y Omnicanalidad
- Marketplace de productos y ventajas de patrocinio.
- Integraciones y Webhooks oficiales para bots de Discord de las comunidades estudiantiles.
- API pública de Campus Arena para desarrolladores externos.
- Lanzamiento de la Aplicación Móvil nativa de Campus Arena.

---

# 4. Distribución del Trabajo en el Ecosistema

Para el desarrollo del MVP en un equipo de dos ingenieros, se establece la siguiente división funcional bajo el mismo monorepo:

### Rol 1: Frontend & UX
- Configuración de Next.js, React, Tailwind CSS y componentes de shadcn/ui.
- Implementación de transiciones en Framer Motion y micro-interacciones.
- Construcción y maquetación de la Landing Page, Dashboards de competidor/organizador y página pública de torneos con brackets interactivos.
- Consumo e integración de las APIs del backend con tipado estático seguro.

### Rol 2: Backend & Base de Datos
- Configuración de NestJS y base de datos relacional PostgreSQL con Prisma ORM.
- Desarrollo de endpoints de autenticación, DTOs y validaciones robustas.
- Codificación lógica del motor de competencia (seeding de brackets, W.O. y asignaciones de ganadores).
- Implementación del almacenamiento de comprobantes de pago (Supabase Storage) y encriptación de datos sensibles con Argon2id.
