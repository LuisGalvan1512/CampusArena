# Campus Arena — Design System (`DESIGN.md`)

## 1. Aesthetic Direction & Brand Personality
- **Persona:** Steam & Riot Games Client meets Institutional University Pride (Tecsup Esports).
- **Mode:** Dual-theme with Dark Mode default (*Midnight Sapphire & Crimson*) and a high-contrast *Warm Slate / Titanium* Light Mode.
- **Core Principles:**
  - Sub-200ms responsive feedback with zero-latency Web Audio API tactile cues (respecting global mute).
  - Strict WCAG 2.2 Level AA contrast, keyboard navigation (`:focus-visible` crimson rings, `Escape` modal dismissal), and mobile-native ergonomics (`44x44px` touch targets, `16px` mobile inputs, zero horizontal overflow).

## 2. Color Tokens (`apps/web/src/app/globals.css`)
| Token | Dark Mode (*Midnight Sapphire*) | Light Mode (*Warm Slate*) | Role |
| :--- | :--- | :--- | :--- |
| `--bg-arena` | `#080B12` | `#F8FAFC` | Primary page canvas |
| `--bg-card` | `#0E1424` | `#FFFFFF` | Elevated card & modal surface |
| `--bg-card-hover` | `#141C33` | `#F1F5F9` | Interactive card hover state |
| `--border-card` | `rgba(255, 255, 255, 0.08)` | `rgba(15, 23, 42, 0.08)` | Hairline structural border |
| `--red-arena` | `#E63946` | `#E63946` | Tecsup Crimson primary action & focus accent |
| `--blue-strategy` | `#1D3557` | `#1E293B` | Deep strategy sapphire |
| `--cyan-accent` | `#38BDF8` | `#0284C7` | Competitive telemetry & live status accent |
| `--text-primary` | `#F8FAFC` | `#0F172A` | Primary headings & body copy |
| `--text-secondary` | `#94A3B8` | `#475569` | Secondary descriptions & metadata |
| `--text-muted` | `#64748B` | `#64748B` | Captions, timestamps & subtle labels |

## 3. Typography System
- **Display / Hero (`.font-display`):** `'Clash Display', 'Outfit', sans-serif` (Fontshare + Google Fonts)
- **Editorial / Subheadings (`.font-editorial`):** `'Cabinet Grotesk', 'Inter', sans-serif`
- **UI & Body Copy:** `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- **Telemetry, Brackets, Scores & Currency (`.font-mono-data`, `.tabular-nums`):** `'JetBrains Mono', 'Fira Code', monospace` with `font-variant-numeric: tabular-nums`

## 4. Layout, Spacing & Motion Guardrails
- **Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Modals:** Constrained to `max-h-[85vh]` or `max-h-[90vh]` with internal scrolling (`overflow-y-auto`) and `Escape` key support.
- **Motion:** 150ms–250ms transitions using `cubic-bezier(0.16, 1, 0.3, 1)` or Framer Motion springs (`stiffness: 300-400, damping: 25-30`), animating only `transform` and `opacity`. Hover transforms are gated behind `@media (hover: hover) and (pointer: fine)`.

