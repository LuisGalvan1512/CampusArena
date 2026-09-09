# 📋 Changelog — Campus Arena

Todos los cambios notables del proyecto están documentados aquí.

---

## [Unreleased] — Septiembre 2026

### ✨ Nuevas Funcionalidades

#### Autenticación Institucional
- Implementado login exclusivo con Google Workspace para correos `@tecsup.edu.pe`.
- Auto-registro de nuevos estudiantes: el sistema crea automáticamente el usuario y perfil al primer login.
- `luis.galvan@tecsup.edu.pe` recibe rol `ADMIN` automáticamente.
- JWT access token (15 min) con refresh token rotation en cookie httpOnly (7 días).
- Modal de onboarding celebratorio para nuevos competidores (3 pasos guiados).
- Correo de bienvenida vía Brevo SMTP enviado en background al registrar nuevo usuario.

#### Gestión de Torneos
- CRUD completo de torneos: crear, listar, editar, eliminar, publicar.
- Estados de ciclo de vida: DRAFT → PUBLISHED → REGISTRATION_OPEN → IN_PROGRESS → FINISHED.
- Filtros por juego (`game_code`) y estado (`status`).
- Slug único auto-generado para URLs amigables.
- Panel de administración con creación/edición de torneos.

#### Inscripciones y Pagos
- Wizard de inscripción en 4 pasos (Selección → Cuenta → Reglas → Pago).
- Soporte para métodos de pago: Yape, Plin, Transferencia bancaria.
- Flujo de revisión de pagos: subir comprobante → revisión admin → aprobación/rechazo.
- Control automático de cupos con sistema de waitlist.

#### Brackets y Competición
- Generación automática de brackets de eliminación directa (potencias de 2).
- Seeding aleatorio de participantes confirmados.
- Registro de resultados de matchup con score A/B.
- Avance automático del ganador a la siguiente ronda.
- Componente visual `BracketView.tsx` para renderizado completo del bracket.

#### Perfil y Vinculación de Juegos
- Página de perfil del competidor con datos académicos (carrera, ciclo, biografía).
- Vinculación de cuentas de juego para 6 títulos soportados.
- Verificación automática de Player Tags vía API de Supercell (Clash Royale, Brawl Stars).
- Soporte para Steam ID y vinculación manual.

#### Ranking Institucional
- Leaderboard por juego con estadísticas: trofeos, nivel, winrate, torneos ganados.
- Datos en tiempo real desde la BD con perfiles de juego vinculados.
- Filtro por Clash Royale y Brawl Stars.

#### Comunidad
- Foro con publicaciones categorizadas (General, Estrategia, Equipos, etc.).
- Sistema de reacciones emoji (1 reacción por usuario por post).
- Comentarios con soporte de media URL.

#### Panel de Administración
- Listado de todos los usuarios registrados.
- Cambio de roles (STUDENT ↔ ORGANIZER ↔ ADMIN).
- Gestión completa de torneos desde la interfaz web.

#### Infraestructura
- Monorepo con Turborepo y pnpm workspaces.
- API con Swagger docs auto-generadas en `/api/docs`.
- Formato de respuesta unificado (`ResponseInterceptor` + `HttpExceptionFilter`).
- Multi-schema en PostgreSQL (8 schemas organizados por dominio).
- Servicio de email con Brevo REST API y Nodemailer SMTP fallback.

### 🎨 UI/UX
- Landing page con animaciones Framer Motion y catálogo de juegos.
- Diseño dark mode con palette `#0B0C10` / `#15161E` / `#E63946`.
- Componentes: Navbar responsiva, Footer, TournamentCard, modales de edición/eliminación.
- Certificados (UI parcial con `CertificateModal`).
- Panel de notificaciones (UI ready con `NotificationCenterDrawer`).

### 🐛 Bugs Corregidos
- Limpieza de usuarios de prueba de la base de datos.
- Fix de CORS para comunicación frontend-backend en desarrollo.
- Fix de cookie parsing para refresh token rotation.

---

## Convención de Versionado

Este proyecto usa [Semantic Versioning](https://semver.org/):
- **MAJOR**: Cambios incompatibles en la API.
- **MINOR**: Nuevas funcionalidades compatibles.
- **PATCH**: Corrección de bugs.
