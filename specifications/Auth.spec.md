# Campus Arena — Specifications Pack

# Specification: Authentication & Identity (Auth.spec.md) v1.0

- **Contexto:** Dominio de Identity (`auth` schema).
- **Dependencias:** Ninguna (módulo base).
- **Objetivo:** Administrar el registro de cuentas de competidores y organizadores, verificación de correos, autenticación basada en sesiones JWT seguras y autorización de accesos basada en roles (RBAC).

---

# 1. Entradas (Inputs)

### Registro (`POST /auth/register`)
- `first_name` (string, required, [2, 50] chars).
- `last_name` (string, required, [2, 50] chars).
- `email` (string, required, format email, lowercase).
- `password` (string, required, min 8 chars, 1 uppercase, 1 lowercase, 1 number).
- `confirm_password` (string, required, matches `password`).
- `terms_accepted` (boolean, required, must be `true`).

### Login (`POST /auth/login`)
- `email` (string, required, format email).
- `password` (string, required).

### Verificación de Correo (`POST /auth/verify-email`)
- `token` (string, required, UUID format).

---

# 2. Salidas (Outputs)

### Login Exitoso (Response JSON)
- **Status:** HTTP 200.
- **Cookies:** `refresh_token` (Cookie httpOnly, secure, sameSite: strict, expires: 7d).
- **Body JSON:**
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOi...",
      "expires_in": 900,
      "user": {
        "id": "a3b908c1-...",
        "email": "luis@tecsup.edu.pe",
        "first_name": "Luis",
        "last_name": "Galvan",
        "roles": ["COMPETITOR"]
      }
    }
  }
  ```

### Errores de Autenticación (Response JSON)
- **Status:** HTTP 400 (Bad Request) o 401 (Unauthorized).
- **Body JSON:**
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_CREDENTIALS",
      "message": "El correo o la contraseña ingresada son incorrectos.",
      "details": null
    }
  }
  ```

---

# 3. Reglas de Negocio (Business Rules)

- **RN-001 (Cifrado):** Las contraseñas de los usuarios deben encriptarse utilizando el algoritmo **Argon2id** (o `bcrypt` factor 10+) antes de persistir en `password_hash`. Nunca almacenar en texto plano.
- **RN-002 (Correo Único):** No se permiten dos cuentas registradas con el mismo correo electrónico.
- **RN-003 (Correo Verificado):** Los competidores solo podrán inscribirse a torneos si su cuenta tiene `email_verified` en `true`.
- **RN-004 (Sesión Limitada):** Solo se permite un `refresh_token` activo por navegador/dispositivo. Si se inicia sesión en un nuevo dispositivo, se emite una nueva sesión pero se conserva el histórico de auditoría.
- **RN-005 (Fuerza Bruta):** Bloquear el endpoint de login (`/auth/login`) durante 15 minutos para una IP específica si acumula 5 intentos fallidos consecutivos en menos de 5 minutos.

---

# 4. Interfaz de Usuario (UI Specifications)

### Pantalla: Registro (Register)
- **Layout:** Pantalla dividida en dos columnas en escritorio (izquierda: branding e ilustración épica; derecha: caja de formulario limpia en fondo `#15161E`).
- **Campos:** Nombres, Apellidos, Correo, Contraseña, Confirmar Contraseña, Checkbox de términos.
- **Micro-interacciones:**
  - El botón primario "Crear Cuenta" (Rojo Arena `#E63946`) tiene animación hover de escala (`scale(1.02)`) y estados `Loading` deshabilitado con spinner si el formulario se está enviando.

### Pantalla: Inicio de Sesión (Login)
- **Campos:** Correo, Contraseña, Checkbox de "Recordar Sesión".
- **Botón:** "Ingresar" (Rojo). Enlace secundario en azul a "Recuperar Contraseña".

---

# 5. APIs y Contratos (REST API)

### `POST /api/v1/auth/register`
- Registra al usuario en estado `ACTIVE`, crea su token de verificación en `EmailVerification` y emite evento `user.registered`.

### `POST /api/v1/auth/login`
- Verifica credenciales, crea un registro en `Session` y `RefreshToken`, inyecta el Refresh Token en la cookie segura y devuelve el Access Token en el body JSON.

### `POST /api/v1/auth/refresh`
- Lee la cookie `refresh_token`, valida su firma y expiración, y emite un nuevo Access Token de corta duración y un nuevo Refresh Token (rotación).

### `POST /api/v1/auth/logout`
- Revoca el token en `RefreshToken` y limpia la cookie `refresh_token` del cliente.

### `POST /api/v1/auth/verify-email`
- Recibe el token por URL, valida que no haya expirado y actualiza `email_verified` a `true` en la tabla `User`.

---

# 6. Base de Datos (DB Mapping - Schema `auth`)

Estructura física requerida en PostgreSQL:

- **`auth.users`:**
  - `id` (UUID, PK)
  - `email` (VARCHAR, UNIQUE)
  - `password_hash` (VARCHAR)
  - `email_verified` (BOOLEAN)
  - `status` (ENUM: ACTIVE, SUSPENDED, INACTIVE)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
  - `last_login_at` (TIMESTAMP)

- **`auth.sessions`:**
  - `id` (UUID, PK)
  - `user_id` (UUID, FK -> `users.id` ON DELETE CASCADE)
  - `ip` (VARCHAR(45))
  - `device` (VARCHAR(255))
  - `browser` (VARCHAR(100))
  - `expires_at` (TIMESTAMP)
  - `created_at` (TIMESTAMP)

- **`auth.refresh_tokens`:**
  - `id` (UUID, PK)
  - `session_id` (UUID, FK -> `sessions.id` ON DELETE CASCADE)
  - `token_hash` (VARCHAR, UNIQUE)
  - `expires_at` (TIMESTAMP)
  - `revoked_at` (TIMESTAMP, NULL)

---

# 7. Plan de Pruebas (Testing Specifications)

- **Unit Tests:**
  - Validar que contraseñas válidas coinciden con su hash de Argon2id y contraseñas inválidas son rechazadas.
  - Validar que un JWT expirado genera una excepción `UnauthorizedException` en el Guard de NestJS.
- **Integration Tests:**
  - Probar que `POST /auth/register` crea exitosamente el registro en `auth.users` e inicia el token en `auth.email_verifications`.
  - Probar que el rate-limiter bloquea las peticiones de login tras 5 intentos erróneos.
- **E2E Tests:**
  - Simular flujo completo en Playwright: Abrir login ➔ Clic en Registrarse ➔ Llenar datos ➔ Recibir pantalla de éxito con confirmación.

---

# 8. Criterios de Aprobación (Definition of Done)

- [ ] Esquema físico de Prisma implementado y migrado en base de datos.
- [ ] Validaciones de entrada (class-validator) y salida (DTO serializado) operativas.
- [ ] Cookies del Refresh Token configuradas estrictamente con `httpOnly`, `secure` y `sameSite: strict`.
- [ ] Cobertura de pruebas unitarias sobre los servicios del módulo superior al 85%.
- [ ] Pantallas de Login y Registro maquetadas con Tailwind, respetando la escala de espaciado y colores oscuros, y totalmente responsivas.
- [ ] Enlace al reglamento y política de privacidad funcionales en la vista de registro.
