# Campus Arena

# AI UI Rules v1.0

This document defines the strict visual rules, layout guidelines, and animation parameters for the user interface of Campus Arena.

---

# 1. Themes & Visual Principles

- **Dark Mode First:** The platform is designed natively for dark mode. Light mode rules are secondary.
  - Base background color: `#0B0C10` (Negro Arena).
  - Main containers: `#15161E` (Gris Oscuro).
  - Input fields: `#1F212D` (Gris Medio).
- **No Gradients:** Do not use gradient backgrounds for regular pages, cards, or tables. Gradients are only allowed in the **Landing Page Hero Section**.
- **Rounded Edges:** Standard border radius is `8px` (`rounded-md`) for buttons and inputs, and `12px` (`rounded-lg`) for cards and containers. Larger dialogs/modales use `16px` (`rounded-xl`).

---

# 2. Colors & Typography Tokens

- **Primary Blue:** `#1D3557` (used for organization branding, navigation, secondary actions).
- **Accent Red:** `#E63946` (used for competitive actions, wins, primary CTAs).
- **Neutral Gray:** Scales from `#F1FAEE` (white text) to `#0B0C10` (black background).
- **Typography:**
  - Headings: `"Outfit"` (display font).
  - Body & Data: `"Inter"` (sans-serif).

---

# 3. Spacing & Layout Rules

- **Multiples of 4px:** All margins, paddings, gaps, and heights must be multiples of 4px (e.g., `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- **Tailwind Grid:** Use standard CSS Grid and Flexbox grids, avoiding absolute sizing of columns wherever possible.
- **Mobile First Responsive:** Always develop interfaces starting with the mobile view, optimizing touch targets to a minimum of `44px x 44px`.

---

# 4. Motion & Animation Tokens

- **Timing Restriction:** All UI micro-animations and transitions must be under **300ms** to ensure the platform feels ultra-fast and responsive.
  - Standard hovers: `100ms` (ease-in-out).
  - Modal entrances: `300ms` (bounce/spring curve).
- **Apple-like Deceleration:** Use custom easing curves for component entrances (e.g., `cubic-bezier(0.16, 1, 0.3, 1)`).
- **Spring Effect:** For dropdowns and modal boxes, use a subtle spring bounce (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Transitions:** Every color or scale change on hover must transition smoothly (e.g., `transition-all duration-200`).
