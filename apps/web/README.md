# 🏟️ Campus Arena — Frontend (Next.js 16)

Frontend de **Campus Arena — Tecsup**, desarrollado con **Next.js 16 (App Router)**, Turbopack, TailwindCSS y Framer Motion.

---

## 🚀 Inicio Rápido (Desarrollo Local)

```bash
# Desde la raíz del monorepo
pnpm --filter web dev

# O dentro de apps/web
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔑 Variables de Entorno (`.env.local`)

Crea un archivo `.env.local` en `apps/web/` con los siguientes valores:

```env
# URL de la API del Backend (NestJS)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Supabase Auth & Storage (Ohio us-east-2)
NEXT_PUBLIC_SUPABASE_URL=https://wksydtbuvlwtbfsifthb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indrc3lkdGJ1dmx3dGJmc2lmdGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MTk1OTAsImV4cCI6MjEwNzM5NTU5MH0.8vBo52SoEq8JUA3MM4lUE8aU1q7jawlT51ZC_N7kYFE
```

---

## 📦 Despliegue en Vercel

1. **Framework Preset:** Next.js
2. **Root Directory:** `apps/web`
3. **Variables en Vercel:**
   * `NEXT_PUBLIC_API_URL`: Tu URL de Render (ej. `https://campus-arena-api.onrender.com/api/v1`)
   * `NEXT_PUBLIC_SUPABASE_URL`: `https://wksydtbuvlwtbfsifthb.supabase.co`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: La clave anon pública (guardada como tipo **Config**)
