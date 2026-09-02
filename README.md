# Campus Arena - Plataforma de Torneos Tecsup

Campus Arena es la plataforma oficial (versión en desarrollo) para la gestión de torneos de eSports presenciales y online en Tecsup. Permite a los competidores registrarse en torneos (Dota 2, Valorant, L4D2, FIFA, Clash Royale, etc.), encontrar equipos, y participar en una comunidad interactiva estilo foro.

## 🚀 Requisitos Previos
- [Node.js](https://nodejs.org/es/) (v18 o superior)
- [pnpm](https://pnpm.io/es/) (`npm install -g pnpm`)

## 🛠️ Instalación y Configuración

1. **Clonar el repositorio y entrar a la carpeta:**
   ```bash
   git clone <URL_DEL_REPO>
   cd CampusArena
   ```

2. **Instalar todas las dependencias del Monorepo:**
   ```bash
   pnpm install
   ```

3. **Configurar las variables de entorno:**
   En la ruta `apps/api/`, crea o edita el archivo `.env` y pega lo siguiente (estas son las credenciales de la base de datos de desarrollo en Supabase):
   
   ```env
   DATABASE_URL="postgresql://postgres.sxqwztaccmdnpotcfeev:whNsRmmzdaji1SUs@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.sxqwztaccmdnpotcfeev:whNsRmmzdaji1SUs@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

   # JWT Configuration
   JWT_SECRET="campus-arena-jwt-secret-change-in-production-2026"
   JWT_EXPIRATION=900

   # Frontend URL (for CORS)
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Sincronizar la Base de Datos y el Cliente Prisma:**
   Ejecuta esto desde la carpeta raíz o dentro de `apps/api`:
   ```bash
   cd apps/api
   npx prisma db push
   npx prisma generate
   cd ../..
   ```

## 🎮 Ejecución del Proyecto

Este es un monorepo, por lo que necesitas correr tanto el **Frontend** (Next.js) como el **Backend** (NestJS).

Abre **dos terminales** en la raíz del proyecto (`CampusArena`):

**Terminal 1 (Backend - Puerto 3001):**
```bash
cd apps/api
pnpm run start:dev
```

**Terminal 2 (Frontend - Puerto 3000):**
```bash
cd apps/web
pnpm run dev
```

Una vez que ambos estén corriendo, abre tu navegador en: [http://localhost:3000](http://localhost:3000)

## 🧪 Cómo probarlo (Credenciales)
Por ahora no hay usuarios "semilla" (seed) obligatorios, pero puedes usar el sistema de autenticación libremente:
1. Ve a **"Iniciar Sesión"** -> **"Regístrate"**
2. Créate una cuenta con cualquier correo inventado y contraseña (ej. `test@tecsup.edu.pe` / `12345678`).
3. Accede al foro en **"Comunidad"** para probar las publicaciones, imágenes, y el sistema de reacciones interactivas.
4. Explora tu **Perfil** para vincular tus cuentas de juego.

## 🗂️ Estructura del Monorepo
- `/apps/web`: Frontend en React, Next.js, Tailwind CSS y Lucide Icons.
- `/apps/api`: Backend en NestJS y Prisma (Conectado a Supabase).

---
*Desarrollado para la comunidad de eSports de Tecsup.*
