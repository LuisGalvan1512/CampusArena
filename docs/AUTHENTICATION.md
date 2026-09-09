# 🔐 Documentación de Autenticación — Campus Arena

## Resumen

Campus Arena utiliza un sistema de autenticación exclusiva por dominio institucional `@tecsup.edu.pe`, combinando Google Workspace OAuth con JWT (JSON Web Tokens) y refresh token rotation.

---

## Flujo de Autenticación

### 1. Login con Google Institucional (Flujo Principal)

```
┌──────────────┐     POST /auth/google      ┌──────────────┐
│   Frontend   │ ─────────────────────────► │   Backend    │
│  (Next.js)   │  { email, first_name,      │  (NestJS)    │
│              │    last_name, avatar_url }  │              │
│              │ ◄───────────────────────── │              │
│              │  { access_token,           │  Validación: │
│              │    is_new_user,            │  ✓ @tecsup   │
│              │    user }                  │  ✓ Crear/Get │
│              │  + Set-Cookie:             │  ✓ JWT sign  │
│              │    refresh_token (httpOnly) │              │
└──────────────┘                            └──────────────┘
```

### 2. Para Nuevos Usuarios

1. El backend detecta que el email no existe en la BD.
2. Crea un nuevo `User` con role `STUDENT` (o `ADMIN` si es `luis.galvan@tecsup.edu.pe`).
3. Crea un `UserProfile` con datos por defecto.
4. Envía correo de bienvenida vía Brevo SMTP (en background).
5. Retorna `is_new_user: true`.
6. El frontend muestra el **Modal de Onboarding Celebratorio**.

### 3. Para Usuarios Existentes

1. El backend encuentra el usuario, actualiza `last_login_at`.
2. Retorna `is_new_user: false`.
3. El frontend redirige directamente:
   - `ADMIN` → `/admin/organizers`
   - `STUDENT` → `/tournaments`

---

## Tokens y Sesiones

| Tipo | Almacenamiento | Duración | Uso |
|---|---|---|---|
| **Access Token** (JWT) | `localStorage` (`campus_token`) | 15 min | Header `Authorization: Bearer <token>` |
| **Refresh Token** | Cookie `httpOnly` + hash SHA-256 en BD | 7 días | Rotación automática vía `POST /auth/refresh` |

### Refresh Token Rotation

El API client (`apps/web/src/lib/api.ts`) implementa **auto-refresh transparente**:

1. Si una petición recibe `401 Unauthorized`:
   - Envía `POST /auth/refresh` con la cookie.
   - Si exitoso, actualiza el `campus_token` y reintenta la petición original.
   - Si falla, limpia `localStorage` y el usuario debe re-autenticarse.

---

## Roles

| Rol | Permisos |
|---|---|
| `STUDENT` | Ver torneos, inscribirse, ver perfil, comunidad, ranking |
| `ORGANIZER` | Todo de STUDENT + crear/editar/eliminar torneos, revisar pagos |
| `ADMIN` | Todo de ORGANIZER + gestión de usuarios, cambio de roles |

---

## Endpoints de Autenticación

### POST `/auth/google`
**Body:**
```json
{
  "email": "nombre.apellido@tecsup.edu.pe",
  "first_name": "Nombre",
  "last_name": "Apellido",
  "avatar_url": "https://...",
  "credential": "eyJ..." // (opcional) JWT de Google
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "is_new_user": true,
    "access_token": "eyJhbGciOiJI...",
    "expires_in": 900,
    "user": {
      "id": "uuid",
      "email": "nombre.apellido@tecsup.edu.pe",
      "first_name": "Nombre",
      "last_name": "Apellido",
      "role": "STUDENT",
      "avatar_url": "https://...",
      "roles": ["STUDENT"]
    }
  }
}
```

### POST `/auth/refresh`
Sin body. Lee la cookie `refresh_token`.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbG...",
    "expires_in": 900
  }
}
```

### GET `/auth/me`
**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "luis.galvan@tecsup.edu.pe",
    "first_name": "Luis",
    "last_name": "Galvan",
    "role": "ADMIN",
    "avatar_url": "...",
    "email_verified": true,
    "status": "ACTIVE",
    "created_at": "2026-09-01T...",
    "last_login_at": "2026-09-08T...",
    "profile": {
      "career": "Diseño y Desarrollo de Software",
      "cycle": 4,
      "biography": "Competidor de la Arena Tecsup.",
      "avatar_url": null
    },
    "roles": ["ADMIN"]
  }
}
```

---

## Seguridad

- **Dominio restringido**: Solo `@tecsup.edu.pe` puede autenticarse.
- **Argon2id**: Hashing de contraseñas para login manual (legacy).
- **SHA-256**: Hashing de refresh tokens antes de almacenar en BD.
- **httpOnly + Secure + SameSite=Strict**: Configuración de cookies de refresh token.
- **Validación con class-validator**: Todos los DTOs son validados automáticamente por `ValidationPipe`.
