# Campus Arena

## ERD 001 – Identity Domain (auth Schema) v1.0

**Propósito:** Especificar en detalle el diseño físico de las tablas, relaciones, índices y restricciones asociadas al dominio de **Identity** (`auth` schema). Su responsabilidad exclusiva es administrar la autenticación, autorización y control de sesiones del sistema, manteniéndose desacoplado de los datos de torneos y perfiles.

---

# 1. Esquema de Entidades

### Entidad: `User`
Representa una cuenta de usuario registrada en Campus Arena.
- `id` (UUIDv4, PRIMARY KEY)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL) (Cifrado con Argon2id)
- `email_verified` (BOOLEAN, DEFAULT FALSE)
- `status` (ENUM: `ACTIVE`, `SUSPENDED`, `INACTIVE`, DEFAULT `ACTIVE`)
- `created_at` (TIMESTAMP, DEFAULT NOW())
- `updated_at` (TIMESTAMP, DEFAULT NOW())
- `last_login_at` (TIMESTAMP, NULL)

### Entidad: `Role`
Define los roles del sistema para el Control de Acceso Basado en Roles (RBAC).
- `id` (UUIDv4, PRIMARY KEY)
- `name` (VARCHAR(50), UNIQUE, NOT NULL) (Ej: `COMPETITOR`, `ORGANIZER`, `ADMIN`, `SUPERADMIN`)
- `description` (TEXT, NULL)

### Entidad: `Permission`
Define capacidades de acción específicas dentro del sistema.
- `id` (UUIDv4, PRIMARY KEY)
- `code` (VARCHAR(100), UNIQUE, NOT NULL) (Ej: `tournament:create`, `payment:validate`, `user:suspend`)
- `name` (VARCHAR(100), NOT NULL)
- `description` (TEXT, NULL)

### Entidad: `UserRole` (Tabla Puente)
Relaciona a los usuarios con sus respectivos roles (N:M). Un usuario puede poseer múltiples roles.
- `user_id` (UUIDv4, FOREIGN KEY REFERENCES `User(id)`, ON DELETE CASCADE)
- `role_id` (UUIDv4, FOREIGN KEY REFERENCES `Role(id)`, ON DELETE CASCADE)
- *Clave Primaria Compuesta:* `(user_id, role_id)`

### Entidad: `RolePermission` (Tabla Puente)
Relaciona los roles con sus correspondientes permisos asignados (N:M).
- `role_id` (UUIDv4, FOREIGN KEY REFERENCES `Role(id)`, ON DELETE CASCADE)
- `permission_id` (UUIDv4, FOREIGN KEY REFERENCES `Permission(id)`, ON DELETE CASCADE)
- *Clave Primaria Compuesta:* `(role_id, permission_id)`

### Entidad: `Session`
Registra las sesiones de usuario activas en tiempo real.
- `id` (UUIDv4, PRIMARY KEY)
- `user_id` (UUIDv4, FOREIGN KEY REFERENCES `User(id)`, ON DELETE CASCADE)
- `ip` (VARCHAR(45), NOT NULL)
- `device` (VARCHAR(255), NULL)
- `browser` (VARCHAR(100), NULL)
- `expires_at` (TIMESTAMP, NOT NULL)
- `created_at` (TIMESTAMP, DEFAULT NOW())

### Entidad: `RefreshToken`
Almacena los tokens de refresco hashificados para la rotación segura de accesos JWT.
- `id` (UUIDv4, PRIMARY KEY)
- `session_id` (UUIDv4, FOREIGN KEY REFERENCES `Session(id)`, ON DELETE CASCADE)
- `token_hash` (VARCHAR(255), UNIQUE, NOT NULL)
- `expires_at` (TIMESTAMP, NOT NULL)
- `revoked_at` (TIMESTAMP, NULL)

### Entidad: `EmailVerification`
Controla los tokens de verificación enviados por correo para validar cuentas nuevas.
- `id` (UUIDv4, PRIMARY KEY)
- `user_id` (UUIDv4, FOREIGN KEY REFERENCES `User(id)`, ON DELETE CASCADE)
- `token_hash` (VARCHAR(255), UNIQUE, NOT NULL)
- `expires_at` (TIMESTAMP, NOT NULL)
- `verified_at` (TIMESTAMP, NULL)

### Entidad: `PasswordReset`
Controla las solicitudes y tokens de recuperación de contraseñas olvidadas.
- `id` (UUIDv4, PRIMARY KEY)
- `user_id` (UUIDv4, FOREIGN KEY REFERENCES `User(id)`, ON DELETE CASCADE)
- `token_hash` (VARCHAR(255), UNIQUE, NOT NULL)
- `expires_at` (TIMESTAMP, NOT NULL)
- `used_at` (TIMESTAMP, NULL)

---

# 2. Relaciones Lógicas

```text
  [Role] 1 ───────── N [UserRole] N ───────── 1 [User]
    │                                            │
    │ (1:N)                                      ├───── (1:N) ────► [Session] ── (1:N) ──► [RefreshToken]
    ▼                                            ├───── (1:N) ────► [EmailVerification]
[RolePermission]                                 └───── (1:N) ────► [PasswordReset]
    ▲
    │ (N:1)
[Permission]
```

---

# 3. Índices Recomendados

Para garantizar que el sistema mantenga un rendimiento excelente con decenas de miles de usuarios, definimos los siguientes índices físicos:

1. `User` ➔ `email` (INDEX UNIQUE): Búsqueda inmediata al autenticar.
2. `Role` ➔ `name` (INDEX UNIQUE): Validación rápida de roles.
3. `Permission` ➔ `code` (INDEX UNIQUE): Validación de guards a nivel de endpoints.
4. `Session` ➔ `user_id` (INDEX): Listado rápido de sesiones de un usuario.
5. `Session` ➔ `expires_at` (INDEX): Para tareas automáticas de limpieza de sesiones expiradas.
6. `RefreshToken` ➔ `session_id` (INDEX): Validación al momento de refrescar tokens.

---

# 4. Restricciones y Reglas de Integridad

- **Argon2id Obligatorio:** Las contraseñas deben ser encriptadas usando Argon2id antes de almacenarse en `password_hash`.
- **Integridad de Sesión:** Un `RefreshToken` no puede existir sin una `Session` activa relacionada.
- **Unicidad de Tokens:** Los campos `token_hash` en `RefreshToken`, `EmailVerification` y `PasswordReset` deben ser inmutables y únicos.
- **Borrado Lógico y Cascadas:**
  - Si un `User` se elimina físicamente, se eliminan todas sus relaciones (`UserRole`, `Session`, `EmailVerification`, `PasswordReset`) mediante `ON DELETE CASCADE`.
  - Sin embargo, para auditoría e histórico competitivo, se priorizará el borrado lógico del usuario cambiando su estado a `INACTIVE` o anonymizando datos deportivos antes del borrado físico.
