# CAMPUS ARENA — MASTER PLAYBOOK: AGENT SKILLS, ARCHITECTURE & CRAFT FLOOR
> **Guía maestra de ingeniería, diseño artesanal y automatización para Campus Arena (Tecsup Esports).**
> Diseñada para operar con **coste de infraestructura S/. 0.00 / \$0.00**, apalancada en Inteligencia Artificial, Web Audio API, CLI de Assets automatizado y estándares estrictos de rendimiento y accesibilidad (WCAG 2.2 AA).

---

## ÍNDICE GENERAL
1. [Instalación Automática de Skills (`.agents/skills/`)](#1-instalación-automática-de-skills)
2. [Stack Tecnológico de Coste Cero (S/. 0.00)](#2-stack-tecnológico-de-coste-cero)
3. [Repertorio de Assets, Imágenes, Iconos y CLI Automatizado (`scripts/asset-fetcher.js`)](#3-repertorio-de-assets-imágenes-iconos-y-cli-automatizado)
4. [Audio y Sonido para la Web (Diseño Sonoro & Web Audio API)](#4-audio-y-sonido-para-la-web)
5. [Video y Backgrounds de Alto Rendimiento (WebM Alpha & Loops)](#5-video-y-backgrounds-de-alto-rendimiento)
6. [Tipografía y Dirección de Arte (Fontshare & Google Fonts)](#6-tipografía-y-dirección-de-arte)
7. [Matriz de Tecnologías y Arquitectura de Campus Arena](#7-matriz-de-tecnologías-y-arquitectura-de-campus-arena)
8. [Infraestructura de Pagos Yape/Plin y Validación por WhatsApp](#8-infraestructura-de-pagos-yapeplin-y-validación-por-whatsapp)
9. [Checklist de Rendimiento Extremo, GPU y SEO (El Craft Floor)](#9-checklist-de-rendimiento-extremo-gpu-y-seo)
10. [Protocolo de Mejora Continua, Auditoría Ponytail y Post-Mortem](#10-protocolo-de-mejora-continua-auditoría-ponytail-y-post-mortem)

---

## 1. INSTALACIÓN AUTOMÁTICA DE SKILLS

Todas las skills del ecosistema están instaladas en `.agents/skills/` y registradas en `skills-lock.json`. Para reinstalar o actualizar las capacidades en cualquier entorno:

```bash
# 1. Instalar Superpowers (Ingeniería de software disciplinada y TDD)
npx -y skills add obra/superpowers --all

# 2. Instalar Claude-Mem (Persistencia de memoria entre sesiones)
npx -y skills add thedotmack/claude-mem --skill mem-search mem-setup how-it-works handoff

# 3. Instalar Impeccable (Diseño artesanal, anti-slop y dirección de arte)
npx -y skills add pbakaus/impeccable --skill impeccable

# 4. Instalar Ponytail (Desarrollo pragmático minimalista, YAGNI y control de deuda)
npx -y skills add DietrichGebert/ponytail --all

# 5. Instalar Find-Skills (Búsqueda e instalación de nuevas capacidades)
npx -y skills add vercel-labs/skills --skill find-skills

# 6. Instalar Deconstrucción y Construcción de Interfaces
npx -y skills add jakubkrehel/skills --skill explain-interface build-design
```

### Resumen del Ecosistema de Skills en Campus Arena:
| Skill / Suite | Propósito Principal en Campus Arena |
| :--- | :--- |
| **Superpowers** (`obra/superpowers`) | Flujos disciplinados: `brainstorming`, `writing-plans`, `subagent-driven-development`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`. |
| **Claude-Mem** (`thedotmack/claude-mem`) | Memoria persistente entre sesiones (`mem-search`, `mem-setup`, `how-it-works`, `handoff`). Compatible con Gemini Flash (`CLAUDE_MEM_PROVIDER=gemini`). |
| **Impeccable** (`pbakaus/impeccable`) | Erradicación de "AI slop", auditoría con `impeccable detect` y cumplimiento de `craft-floor.md`. |
| **Ponytail** (`DietrichGebert/ponytail`) | Filosofía minimalista senior: *"El mejor código es el que no se escribe"*. Incluye `ponytail-audit`, `ponytail-debt`, `ponytail-prep`, `ponytail-retro`. |
| **Explain-Interface & Build-Design** (`jakubkrehel/skills`) | Deconstrucción de interfaces de referencia y conversión de diseños al sistema visual de Campus Arena. |
| **Find-Skills** (`vercel-labs/skills`) | Meta-skill para descubrir e instalar nuevas capacidades con `npx skills find`. |
| **Skills Especializadas Campus Arena** | `ui-craft-taste`, `emil-design-eng`, `animate`, `mobile-native`, `accessibility-responsive-ux`, `ask-sonner`, `design-taste-frontend`, `high-end-visual-design`, `web-performance`, `backend-db-performance`. |

---

## 2. STACK TECNOLÓGICO DE COSTE CERO (S/. 0.00)

| Área | Herramienta en Campus Arena | Nivel Gratuito (Free Tier) |
| :--- | :--- | :--- |
| **Frontend & Edge** | [Vercel](https://vercel.com) (Next.js 16 App Router) | Despliegues continuos, SSL automático, CDN global y Vercel Analytics. |
| **Base de Datos & Storage** | [Supabase](https://supabase.com) (PostgreSQL + Storage) | Base de datos relacional para torneos/partidas y almacenamiento de comprobantes Yape/Plin. |
| **Backend API & Realtime** | NestJS 11 + Prisma ORM + Socket.io | API transaccional con validación `class-validator` y actualización de brackets en vivo. |
| **Audio UI** | Web Audio API (`apps/web/src/lib/sound.ts`) | Síntesis de sonido en tiempo real en el navegador (0 KB de descarga extra). |
| **Cobros de Inscripción** | Yape / Plin + Coordinación WhatsApp (`apps/web/src/lib/whatsapp.ts`) | Transferencias inmediatas en Soles (`S/.`) con 0% de comisión bancaria. |

---

## 3. REPERTORIO DE ASSETS, IMÁGENES, ICONOS Y CLI AUTOMATIZADO

El proyecto incluye el script autónomo [`scripts/asset-fetcher.js`](./scripts/asset-fetcher.js) (ejecutable mediante `pnpm run assets` o `node scripts/asset-fetcher.js`) que descarga recursos reales listos para producción sin requerir API Keys de pago:

```bash
# 1. Buscar y descargar fotos reales (Wikimedia Commons API)
pnpm run assets search "esports arena tournament" ./apps/web/public/assets/arena.jpg

# 2. Generar renders o ilustraciones a medida con IA gratuita (Pollinations Flux)
pnpm run assets ai "cyberpunk esports trophy crimson and sapphire lighting, dark background, 8k" ./apps/web/public/assets/trophy.jpg 1200 1200

# 3. Descargar iconos vectoriales SVG de +200,000 librerías (Iconify API)
pnpm run assets icon lucide:trophy ./apps/web/public/assets/icons/trophy.svg "#E63946"
pnpm run assets icon ph:game-controller-duotone ./apps/web/public/assets/icons/controller.svg "#38BDF8"

# 4. Descargar logotipos oficiales en SVG (SimpleIcons CDN)
pnpm run assets logo discord ./apps/web/public/assets/logos/discord.svg E63946
```

---

## 4. AUDIO Y SONIDO PARA LA WEB (DISEÑO SONORO & WEB AUDIO API)

Implementado en [`apps/web/src/lib/sound.ts`](./apps/web/src/lib/sound.ts), [`apps/web/src/components/GlobalButtonSound.tsx`](./apps/web/src/components/GlobalButtonSound.tsx) y [`apps/web/src/components/SoundToggle.tsx`](./apps/web/src/components/SoundToggle.tsx):
- **Cero latencia y 0 KB de red:** Osciladores nativos (`AudioContext`) sintetizan clics táctiles (`playClick`, `playWoodClick`), barridos metálicos de carrusel (`playMetalSlide`), acordes de éxito (`playSuccessChime`, `playSuccess`) y fanfarrias de inscripción (`playFanfare`).
- **3 Reglas de Oro del Audio Web aplicadas:**
  1. **Activación tras interacción del usuario:** `AudioContext` se inicializa o reanuda únicamente tras el primer clic del usuario.
  2. **Botón de Mute Global Persistente:** `<SoundToggle />` está integrado en la barra de navegación ([`Navbar.tsx`](./apps/web/src/components/Navbar.tsx)) en escritorio y móvil, sincronizado con `localStorage` (`campus_arena_muted` / `sound_muted`) y con la paleta de comandos (`Ctrl+K`).
  3. **Sutileza Acústica:** Ganancias calibradas entre `0.05` y `0.18` para acompañar la acción táctil sin saturar.

---

## 5. VIDEO Y BACKGROUNDS DE ALTO RENDIMIENTO (WEBM ALPHA & LOOPS)

Las utilidades `.video-hero-container`, `.video-bg`, `.video-overlay` y `.floating-model` están disponibles en [`apps/web/src/app/globals.css`](./apps/web/src/app/globals.css):
- Siempre incluir `autoplay loop muted playsInline preload="metadata"` y `poster` estático ligero.
- Para comprimir videos pesados antes de subirlos a `apps/web/public/`:
  ```bash
  ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 1M -crf 30 -an -vf "scale=1920:-2" -t 8 hero-loop.webm
  ```

---

## 6. TIPOGRAFÍA Y DIRECCIÓN DE ARTE (FONTSHARE & GOOGLE FONTS)

Configurado en [`apps/web/src/app/layout.tsx`](./apps/web/src/app/layout.tsx) y [`apps/web/src/app/globals.css`](./apps/web/src/app/globals.css):
- **Display & Títulos Hero (`.font-display`):** `Clash Display` (Fontshare) + `Outfit`.
- **Editorial & Subtítulos (`.font-editorial`):** `Cabinet Grotesk` (Fontshare) + `Inter`.
- **UI & Cuerpo:** `Inter` con jerarquía fluida y contraste WCAG 2.2 AA.
- **Datos, Brackets, Timers y Precios (`.font-mono-data` / `.tabular-nums`):** `JetBrains Mono` y `Fira Code` con `font-variant-numeric: tabular-nums` para evitar saltos de layout al actualizar marcadores o montos en Soles.

---

## 7. MATRIZ DE TECNOLOGÍAS Y ARQUITECTURA DE CAMPUS ARENA

| Capa | Tecnología | Ubicación en el Monorepo |
| :--- | :--- | :--- |
| **Web App (Cliente)** | Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Framer Motion | [`apps/web`](./apps/web) |
| **API Backend & WebSockets** | NestJS 11 + Socket.io + JWT Guards + `class-validator` | [`apps/api`](./apps/api) |
| **ORM & Esquema Relacional** | Prisma ORM + PostgreSQL (Supabase) | [`apps/api/prisma`](./apps/api/prisma) |
| **Paquetes Compartidos** | Tipos y UI compartida de Turborepo | [`packages/types`](./packages/types), [`packages/ui`](./packages/ui) |
| **Automatización & Scripts** | Asset Fetcher CLI & Auditoría Ponytail | [`scripts/asset-fetcher.js`](./scripts/asset-fetcher.js) |

---

## 8. INFRAESTRUCTURA DE PAGOS YAPE/PLIN Y VALIDACIÓN POR WHATSAPP

Implementado en [`apps/web/src/lib/whatsapp.ts`](./apps/web/src/lib/whatsapp.ts) y [`apps/web/src/components/RegistrationWizardModal.tsx`](./apps/web/src/components/RegistrationWizardModal.tsx):
- **Doble vía de validación sin fricción:**
  1. Subida directa de captura del comprobante Yape/Plin a Supabase Storage desde el Paso 3 del modal de inscripción.
  2. Botón integrado **"Validar Comprobante por WhatsApp"** / **"Notificar Inscripción al Comité por WhatsApp"** (`sendTournamentRegistrationToWhatsApp`) que envía el resumen estructurado (Torneo, Competidor/Capitán, Escuadra, Monto en `S/.`, Método Yape/Plin y N° de Operación) al número oficial de organización (`994 058 442`).

---

## 9. CHECKLIST DE RENDIMIENTO EXTREMO, GPU Y SEO (EL CRAFT FLOOR)

1. **Animaciones 100% GPU-Accelerated:** Solo se animan `transform` (`translate3d`, `scale`, `rotate`) y `opacity`.
2. **Mobile-Native Feel:**
   - `viewport-fit=cover` y `interactive-widget=resizes-content` en [`layout.tsx`](./apps/web/src/app/layout.tsx).
   - `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation` y `font-size: 16px` en inputs móviles (`@media (pointer: coarse)`) para evitar el auto-zoom en iOS Safari.
   - Estados `:hover` de elevación encapsulados en `@media (hover: hover) and (pointer: fine)`.
3. **Accesibilidad WCAG 2.2 AA:**
   - Modales con `role="dialog"`, `aria-modal="true"`, cierre con tecla `Escape` y altura acotada (`max-h-[90vh]`).
   - Botones de icono con `aria-label` descriptivo y anillo `:focus-visible` de alto contraste (`#E63946`).
4. **SEO & OpenGraph:**
   - Metadatos completos para WhatsApp, Discord y redes sociales (`og:title`, `og:description`, `og:image`, `twitter:card`) en [`layout.tsx`](./apps/web/src/app/layout.tsx).

---

## 10. PROTOCOLO DE MEJORA CONTINUA, AUDITORÍA PONYTAIL Y POST-MORTEM

### Control de Deuda de Atajos (`pnpm run debt`)
Cuando se tome un atajo consciente por velocidad, dejar un comentario rastreable en el código:
```ts
// shortcut: descripción breve — qué se omitió y qué lo dispararía para corregirlo
```
Para auditar toda la deuda del repositorio en cualquier momento:
```bash
pnpm run debt
```

### Auditoría Visual Anti-Slop (`impeccable detect`)
Antes de cerrar cualquier entrega de UI, ejecutar el detector determinista:
```bash
.\.agents\skills\impeccable\scripts\impeccable.cmd detect --json apps/web/src
```

