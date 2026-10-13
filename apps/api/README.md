# 🏟️ Campus Arena — Backend API (NestJS 12)

API RESTful de **Campus Arena — Tecsup**, desarrollada con **NestJS 12**, **Prisma ORM 5.22** y **PostgreSQL (Supabase)** en multi-esquema.

---

## 🚀 Inicio Rápido (Desarrollo Local)

```bash
# Instalar dependencias
pnpm install

# Generar cliente de Prisma
pnpm --filter api exec prisma generate

# Ejecutar en modo watch
pnpm --filter api dev
```

La API estará disponible en [http://localhost:3001/api/v1](http://localhost:3001/api/v1).  
Documentación Swagger disponible en [http://localhost:3001/api/docs](http://localhost:3001/api/docs).

---

## 🔑 Variables de Entorno (`.env`)

Copia `.env.example` a `.env` y configura tus valores:

```env
# Supabase PostgreSQL (Ohio us-east-2)
DATABASE_URL="postgresql://postgres.wksydtbuvlwtbfsifthb:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.wksydtbuvlwtbfsifthb:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres"

# JWT
JWT_SECRET="campus-arena-jwt-secret-change-in-production-2026"
JWT_EXPIRATION=900

# CORS
FRONTEND_URL="http://localhost:3000,https://campusarenatec.vercel.app"

# Supabase Auth
SUPABASE_URL="https://wksydtbuvlwtbfsifthb.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indrc3lkdGJ1dmx3dGJmc2lmdGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MTk1OTAsImV4cCI6MjEwNzM5NTU5MH0.8vBo52SoEq8JUA3MM4lUE8aU1q7jawlT51ZC_N7kYFE"
```

---

## 📦 Scripts de Base de Datos

```bash
# Sincronizar esquema de Prisma con Supabase
pnpm --filter api exec prisma db push

# Ejecutar backup completo de datos a JSON
node apps/api/scripts/backup-data.mjs

# Restaurar datos desde backup
node apps/api/scripts/restore-data.mjs
```
