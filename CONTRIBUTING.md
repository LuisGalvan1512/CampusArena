# 🤝 Guía de Contribución — Campus Arena

## Primeros Pasos

1. **Fork** el repositorio en GitHub.
2. **Clona** tu fork:
   ```bash
   git clone https://github.com/<tu-usuario>/CampusArena.git
   cd CampusArena
   ```
3. **Instala** dependencias:
   ```bash
   pnpm install
   ```
4. **Configura** el `.env` (ver [README.md](../README.md#-instalación-y-configuración)).
5. **Sincroniza** la BD:
   ```bash
   cd apps/api && npx prisma db push && npx prisma generate && cd ../..
   ```
6. **Arranca** el proyecto:
   ```bash
   pnpm run dev
   ```

---

## Estructura de Ramas

| Rama | Uso |
|---|---|
| `main` | Código estable y funcional |
| `feature/*` | Nuevas funcionalidades |
| `fix/*` | Corrección de bugs |
| `docs/*` | Cambios de documentación |

**Ejemplo:**
```bash
git checkout -b feature/google-oauth-popup
```

---

## Convenciones de Commits

Usamos el formato **Conventional Commits**:

```
<type>(<scope>): <description>

Tipos permitidos:
  feat     → Nueva funcionalidad
  fix      → Corrección de bug
  docs     → Solo documentación
  style    → Formato (no afecta lógica)
  refactor → Refactorización sin cambiar funcionalidad
  test     → Añadir o corregir tests
  chore    → Mantenimiento, dependencias, CI
```

**Ejemplos:**
```bash
git commit -m "feat(auth): integrar popup OAuth real de Google"
git commit -m "fix(bracket): corregir avance de ganador en semifinal"
git commit -m "docs(readme): actualizar credenciales de prueba"
```

---

## Áreas donde Necesitamos Ayuda

### 🔴 Alta Prioridad
- **OAuth Real**: Integrar `@react-oauth/google` con `GoogleOAuthProvider` para el popup nativo de Google (actualmente el login envía el email directo sin popup real).
- **Tests del API**: Escribir tests con Vitest para los servicios de `auth`, `tournament`, `registration`, `competition`.

### 🟡 Media Prioridad
- **Subida de Imágenes**: Integrar Supabase Storage o Cloudinary para avatares, banners y comprobantes de pago.
- **Notificaciones**: Conectar el componente `NotificationCenterDrawer.tsx` con un backend de notificaciones.
- **Responsive Mobile**: Revisar y pulir todas las vistas en viewport `< 768px`.

### 🟢 Ideas Abiertas
- Sistema de equipos para torneos 3v3/5v5.
- Integración Discord webhook.
- Dashboard con métricas del competidor.
- Certificados PDF auto-generados.

---

## Guía de Desarrollo

### Backend (NestJS)

Para añadir un nuevo módulo:

```bash
cd apps/api

# 1. Crear módulo
# Crear manualmente: src/<nombre>/
#   ├── <nombre>.module.ts
#   ├── <nombre>.controller.ts
#   ├── <nombre>.service.ts
#   └── dto/

# 2. Registrar en app.module.ts
import { NuevoModule } from './nuevo/nuevo.module.js';
```

**Principios:**
- Todo endpoint bajo el prefix `/api/v1/`.
- Usar `@UseGuards(JwtAuthGuard)` para endpoints protegidos.
- Usar `@Roles('ADMIN')` + `RolesGuard` para endpoints con rol.
- Usar `@CurrentUser('id')` para obtener el ID del usuario autenticado.
- Responses pasan por `ResponseInterceptor` automáticamente.
- Errors pasan por `HttpExceptionFilter` automáticamente.

### Frontend (Next.js)

Para añadir una nueva página:

```
apps/web/src/app/<ruta>/page.tsx   → Nueva página
apps/web/src/components/<Comp>.tsx → Nuevo componente
```

**Principios:**
- Todas las páginas usan `'use client'` (client components).
- Estado global de auth vía `useAuth()` (Zustand).
- HTTP requests vía `api.get()`, `api.post()`, etc. (auto-refresh incluido).
- Estilos con Tailwind CSS + clases personalizadas (`.arena-card`, `.btn-primary`, `.input-arena`).
- Iconos con Lucide React.
- Animaciones con Framer Motion.

### Base de Datos

Para modificar el schema:

```bash
cd apps/api

# 1. Editar prisma/schema.prisma
# 2. Aplicar cambios
npx prisma db push

# 3. Regenerar cliente
npx prisma generate
```

> ⚠️ **Nota**: `db push` es destructivo en dev. Para producción se deberá usar `prisma migrate`.

---

## Checklist de Pull Request

Antes de abrir un PR, verifica:

- [ ] El código compila sin errores: `pnpm run build`
- [ ] El linter pasa: `pnpm run lint`
- [ ] Tests pasan (si aplica): `cd apps/api && pnpm run test`
- [ ] La funcionalidad fue probada manualmente en `http://localhost:3000`
- [ ] No se incluyen credenciales hardcodeadas ni secretos
- [ ] Se actualizó documentación si es necesario

---

## Contacto

Para dudas sobre el proyecto o coordinación, contacta a:
- **Luis Galvan** — luis.galvan@tecsup.edu.pe
