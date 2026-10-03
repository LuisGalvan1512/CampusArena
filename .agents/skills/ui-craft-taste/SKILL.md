---
name: ui-craft-taste
description: >-
  Expert UI/UX craft, interaction design, and aesthetic guidelines combining Emil Kowalski motion principles,
  Impeccable anti-pattern detection, and Steam-inspired esports aesthetics. Use this skill whenever designing,
  refactoring, or styling frontend components, layouts, modals, or animations in Campus Arena.
---

# UI Craft & Design Taste (Campus Arena)

Este estándar combina lo mejor de **Emil Kowalski** (ingeniería de diseño y micro-interacciones), **Impeccable** (artesanía web libre de anti-patrones) y **Taste** (diseño gamer elegante inspirado en Steam y Riot Games).

---

## 1. Principios de Movimiento (Estilo Emil Kowalski)

### Físicas de Resorte y Duraciones
- **Micro-interacciones (botones, toggles, badges):**
  - Duración: `150ms` - `200ms`. Rápido, nítido y sin sensación de lentitud.
  - Easing: `easeOut` o resorte suave: `type: "spring", stiffness: 400, damping: 25`.
- **Modales y Drawers:**
  - Entrada: `type: "spring", stiffness: 300, damping: 30`.
  - Salida: `duration: 0.15, ease: "easeIn"`.
  - Siempre envolver con `<AnimatePresence mode="wait">` para evitar glitches visuales al desmontar.
- **Entrada de Vistas y Rutas (`PageTransition`):**
  - Desvanecimiento sutil con micro-desplazamiento vertical: `opacity: 0 -> 1`, `y: 8 -> 0`.
  - Evitar movimientos mayores a `12px` para prevenir fatiga visual en navegaciones consecutivas.

### Reglas de Oro de Animación
1. **Nunca animes propiedades que causen layout repaint:** Anima exclusivamente `transform` (`scale`, `x`, `y`) y `opacity`.
2. **Interactividad primero:** Los botones deben responder al `active:scale-95` para dar sensación táctil instantánea.
3. **Respetar preferencias del sistema:** Apoyar `prefers-reduced-motion` para usuarios sensibles al movimiento.

---

## 2. Anti-Patrones Prohibidos (Filtro Impeccable)

- ❌ **Prohibido apilar botones gigantes en móvil:** En pantallas táctiles, nunca apiles 3 o más botones de ancho completo verticalmente. Agrupa en cuadrículas de 2 columnas (`grid grid-cols-2 gap-2`) o filas de iconos con texto conciso.
- ❌ **Prohibido modales que desbordan el viewport:** Ningún modal debe forzar scroll de la página de fondo. Los modales deben tener `max-h-[85vh] flex flex-col` con encabezado fijo, cuerpo interno scrolleable (`overflow-y-auto`) y footer fijo con botón cerrar visible.
- ❌ **Prohibido el "Cardception" (cards dentro de cards sin jerarquía):** Si un contenedor ya tiene borde y fondo oscuro, los elementos internos deben diferenciarse con fondos sutiles (`rgba(255,255,255,0.03)`), divisores suaves o espaciado, no con bordes gruesos repetitivos.
- ❌ **Prohibido texto gris oscuro sobre fondos negros:** En modo oscuro, usa variables de alto contraste con jerarquía clara:
  - Primario: `text-[var(--text-primary)]` o `#FFFFFF`
  - Secundario: `text-[var(--text-secondary)]` o `#94A3B8` (slate-400)
  - Muted: `text-[var(--text-muted)]` o `#64748B` (slate-500, únicamente para timestamps o metadatos menores).

---

## 3. Estética Gamer Elegante (Taste / Estilo Steam & Riot)

### Fondos de Perfil (Profile Backgrounds)
- Inspirados en la tienda de puntos de Steam: fondos con texturas sutiles (cyberpunk grid, fibra de carbono, aurora, oro de campeonato).
- La textura debe vivir como fondo ambiental con opacidades controladas (`0.08` a `0.20`), nunca compitiendo con la legibilidad del texto o las estadísticas.

### Paleta Oficial Tecsup Esports
- **Rojo Carmesí Arena:** `#E63946` (Acentos de llamada a la acción, victorias, badges activos).
- **Azul Medianoche:** `#1D3557` (Gradientes de fondo institucional, headers).
- **Azul Táctico:** `#457B9D` (Bordes secundarios, estados hover sutiles).
- **Dark Obsidian:** `#0F172A` (Fondo base de alto contraste gamer).
- **Dorado Campeón:** `#F59E0B` (Medallas de oro, trofeos, roles de administrador).
- **Esmeralda Táctico:** `#10B981` (Inscripciones abiertas, verificados, ping en vivo).

### Componentes de Alto Impacto
- **Badges:** Pequeños, tipografía `[10px]` o `[11px]`, uppercase tracking wider, con punto pulsante (`animate-ping`) solo si hay acción en vivo.
- **Avatares:** Contenedores `rounded-2xl` con gradiente de borde suave, nunca saturados.
- **Empty States:** Con ilustración o icono temático, título descriptivo y botón de acción directa en un solo bloque centrado.
