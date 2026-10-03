---
name: accessibility-responsive-ux
description: Accessibility (a11y) and Responsive UX engineering skill based on WCAG 2.2 Level AA, inclusive design, fluid typography, touch target optimization, keyboard focus traps, screen reader landmarks, and safe area viewports. Use when designing, reviewing, or fixing accessibility issues, responsive layout bugs, mobile touch problems, contrast failures, keyboard navigation, or screen reader readiness.
---

# Accessibility & Responsive UX (a11y & Fluid Design)

This skill provides the definitive engineering and design guidelines for building accessible (WCAG 2.2 Level AA compliant) and fluidly responsive web interfaces in **Campus Arena**.

---

## 🎯 1. Core Operating Philosophy

1. **Accessibility is not a feature, it is the foundation:** Aesthetics and accessible design are partners, not rivals. A high-craft esports UI must be fully navigable by keyboard, legible under diverse lighting conditions, and readable by assistive technologies.
2. **Fluid over Fixed:** Interfaces must scale gracefully across viewports from compact mobile devices (320px) to ultra-wide displays (4K) without breaking, clipping, or inducing unintended horizontal scrolling.
3. **Respect User System Preferences:** Always honor `@media (prefers-reduced-motion: reduce)`, `@media (prefers-contrast: more)`, and device input capabilities (`pointer: fine` vs `pointer: coarse`).

---

## 👁️ 2. Color Contrast & Visual Accessibility (WCAG 2.2 AA)

### Contrast Ratios
- **Normal Text (< 18pt or < 14pt bold):** Minimum contrast ratio of **4.5:1** against its background.
- **Large Text (>= 18pt or >= 14pt bold):** Minimum contrast ratio of **3.0:1**.
- **UI Components & Graphical Objects:** Interactive controls, input borders, and active status indicators must meet **3.0:1** against adjacent colors.

### Never Rely on Color Alone
- Never communicate status, winners, or errors solely through color hue.
- **Rule:** Always pair color with an icon, shape, or explicit text label.
  - *Incorrect:* `<span className="w-2 h-2 rounded-full bg-emerald-400" />`
  - *Correct:* `<span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" /><span className="text-xs font-bold text-emerald-400">Inscripciones Abiertas</span></span>`

---

## ⌨️ 3. Keyboard Navigation & Focus Management

### Visible Focus Indicators
- **Strict Rule:** Never write `outline: none` without providing a high-visibility replacement `:focus-visible`.
- **Campus Arena Standard Focus Ring:**
  ```css
  /* Tailwind standard focus ring */
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E63946] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-arena)]
  ```

### Modal & Drawer Dialogs
- Any modal or drawer dialog must:
  1. Have `role="dialog"` or `role="alertdialog"` and `aria-modal="true"`.
  2. Be labeled via `aria-labelledby="modal-title-id"`.
  3. Trap keyboard focus inside the dialog while open.
  4. Dismiss immediately upon pressing the `Escape` key (`onKeyDown={(e) => e.key === 'Escape' && onClose()}`).
  5. Return keyboard focus to the triggering element upon closing.
  6. Prevent background page scrolling (`overflow: hidden` on body or `touch-action: none`).

### Skip-to-Content Link
- Include an accessible skip link as the very first focusable element on every page:
  ```tsx
  <a 
    href="#main-content" 
    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#E63946] focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
  >
    Saltar al contenido principal
  </a>
  ```

---

## 📢 4. Semantic HTML & Screen Reader Architecture

### Heading Hierarchy
- Exactly **one** `<h1>` per page representing the core subject.
- Subsections must follow strict descending order (`<h2>` -> `<h3>` -> `<h4>`) without skipping levels.
- Avoid using heading tags purely for font size styling; use CSS utility classes for visual scale.

### Interactive Elements & Accessible Names
- **Buttons vs. Links:**
  - Use `<button>` for actions that change state or trigger modals/mutations.
  - Use `<Link>` or `<a>` for navigation that changes the URL.
- **Icon-Only Buttons:** Every icon button MUST include an accessible name via `aria-label`:
  ```tsx
  <button
    type="button"
    onClick={onClose}
    aria-label="Cerrar modal"
    className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-white"
  >
    <X className="w-5 h-5" aria-hidden="true" />
  </button>
  ```
- **Decorative Icons:** All non-interactive visual iconography must have `aria-hidden="true"`.

### Live Regions (`aria-live`)
- Search results, filter updates, and bracket refreshes should alert screen readers politely:
  ```tsx
  <div aria-live="polite" aria-atomic="true" className="sr-only">
    {isLoading ? 'Cargando torneos...' : `${tournaments.length} torneos encontrados.`}
  </div>
  ```

---

## 📱 5. Responsive UX & Fluid Viewports

### Zero Horizontal Overflow
- The page must never cause horizontal scrolling (`overflow-x: hidden`) on viewports from 320px to 4K.
- Use fluid containers with padding: `px-4 sm:px-6 lg:px-8` and `max-w-7xl mx-auto`.
- Wrap long unbroken strings (hashes, tags, emails) in `break-words` or `truncate`.

### Touch Target Sizing (Mobile First)
- **Minimum Interactive Area:** Every touch target on mobile must be at least **44x44px** (iOS HIG) or **48x48px** (WCAG 2.2 Target Size Minimum).
- For compact icons, expand the touch bounding box with invisible padding (`p-2.5` or `min-h-[44px] min-w-[44px] flex items-center justify-center`).

### Mobile Form UX & iOS Zoom Prevention
- **Font Size in Inputs:** Inputs, selects, and textareas on mobile must have a minimum `font-size: 16px` (or `text-base sm:text-sm`). If text is smaller than 16px, iOS Safari automatically zooms in and breaks the viewport.
- **Virtual Keyboard Awareness:** Ensure submit buttons and bottom navigation are not obscured by the software keyboard.

### Viewport Height & Safe Areas
- Use `100dvh` (dynamic viewport height) for full-screen modals and mobile drawers to adapt to browser address bar collapsing.
- Use `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` for fixed headers, floating action buttons, and bottom navigation.

### Mobile Modals & Sheets
- Modales on mobile screens must:
  - Have a bounded height: `max-h-[85vh]` or `max-h-[90vh]`.
  - Feature an internal scrollable container: `overflow-y-auto`.
  - Action buttons must be arranged in a 2-column compact grid (`grid-cols-2`) or single sticky footer bar, never stacking 4+ full-width vertical buttons.

---

## ⚙️ 6. Motion Sensitivity (`prefers-reduced-motion`)

Users with vestibular disorders or motion sensitivity can experience nausea or disorientation from large viewport animations, parallax, and continuous loops.

### Implementation Standard:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

In Framer Motion components:
```tsx
import { useReducedMotion } from 'framer-motion';

export function AnimatedCard({ children }) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

---

## 🎮 7. Esports Domain Playbook (Campus Arena)

1. **Tournament Brackets:**
   - Brackets have complex visual trees. On mobile, allow smooth horizontal panning (`overflow-x-auto scrollbar-thin`) with visible scroll affordance indicators.
   - Provide an alternative accessible summary list of matches and rounds for screen reader users.
2. **Game Art & Banners:**
   - All `<img>` tags for game posters and avatars must have descriptive `alt` text (e.g. `alt="Torneo Oficial Clash Royale - Fase Final"`).
   - Never leave `alt=""` unless the image is purely decorative and hidden with `aria-hidden="true"`.
3. **Player Badges & Medals:**
   - Medals and trophies must include their rank name in text (e.g. `<span className="sr-only">Medalla de Oro: </span>1° Lugar`).

---

## ✅ Accessibility & Responsive UX Checklist (Pre-Flight)

Before approving any UI view:
- [ ] Contrast ratio >= 4.5:1 for body copy and >= 3:1 for large headings/UI borders.
- [ ] Tested at 320px width: zero horizontal scrolling, no text clipping, buttons wrap cleanly.
- [ ] Keyboard test: Can reach all controls using only `Tab` / `Shift+Tab` / `Enter` / `Space` / `Escape`.
- [ ] Visible focus ring appears on all interactive elements upon keyboard focus.
- [ ] All icon buttons have an explicit `aria-label`.
- [ ] Modals are bounded to `max-h-[85vh]` on mobile with internal scroll.
- [ ] Inputs have `text-base sm:text-sm` (>= 16px on mobile) to prevent iOS auto-zoom.
- [ ] `prefers-reduced-motion` is supported and does not break component lifecycles.
