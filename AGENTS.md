# Campus Arena — Directrices de Desarrollo y Estándares de Ingeniería

Este documento establece las reglas fundamentales que todo agente debe seguir al desarrollar en el repositorio **Campus Arena**. Estas directrices se complementan armoniosamente con las skills ubicadas en `.agents/skills/`.

---

## 🎯 Armonía de Estándares (Sin Conflictos)

Para evitar contradicciones entre diseño y rendimiento, se establece la siguiente jerarquía:
1. **La Experiencia del Usuario y la Claridad mandan:** Una interfaz hermosa pero lenta o confusa no es aceptable. Toda interacción debe ser ágil (menos de 200ms de respuesta) y visualmente pulida.
2. **Modularidad estricta (Skills oficiales instaladas):**
   - **Frontend UI, Craft & Motion (Emil Kowalski + Impeccable + Taste):**
     - [`emil-design-eng`](.agents/skills/emil-design-eng/SKILL.md) & [`animate`](.agents/skills/animate/SKILL.md): Filosofía de diseño, timing y resortes físicos.
     - [`mobile-native`](.agents/skills/mobile-native/SKILL.md): Experiencia táctil, viewport móvil y micro-detalles en celulares.
     - [`ask-sonner`](.agents/skills/ask-sonner/SKILL.md): Gestión óptima de toasts y notificaciones con Sonner.
     - [`impeccable`](.agents/skills/impeccable/SKILL.md): Detección y erradicación de anti-patrones de diseño genérico.
     - [`design-taste-frontend`](.agents/skills/design-taste-frontend/SKILL.md) & [`high-end-visual-design`](.agents/skills/high-end-visual-design/SKILL.md): Criterio estético no genérico, jerarquía tipográfica y acabados premium.
     - [`ui-craft-taste`](.agents/skills/ui-craft-taste/SKILL.md): Síntesis unificada adaptada a la identidad Tecsup Esports y estilo Steam.
   - **Rendimiento Cliente / Next.js:** Sigue la skill [`web-performance`](.agents/skills/web-performance/SKILL.md).
   - **Backend / Prisma / PostgreSQL:** Sigue la skill [`backend-db-performance`](.agents/skills/backend-db-performance/SKILL.md).

---

## 🎨 1. Estándar de Frontend & UI/UX (Emil Kowalski + Impeccable + Steam Style)

- **Estética Gamer Elegante:** Inspirada en Steam y Riot Games. Fondos con texturas sutiles (`banner-*`), acentos de la paleta oficial Tecsup (`#E63946`, `#1D3557`, `#0F172A`), y cero saturación excesiva.
- **Mobile First Obligatorio:**
  - En móviles, botones de acción agrupados en cuadrícula compacta (`grid-cols-2`) o filas de iconos, nunca barras gigantes apiladas verticalmente.
  - Modales con altura acotada (`max-h-[85vh]` o `max-h-[90vh]`) con scroll interno, nunca desbordando la pantalla del celular ni forzando scroll en la página de fondo.
- **Micro-interacciones Fluidas:**
  - Animaciones ágiles de 150ms-250ms con Framer Motion (resortes suaves: `stiffness: 300-400, damping: 25-30`).
  - Animación solo en `opacity` y `transform` (`scale`, `x`, `y`) para mantener 60 FPS estables.
- **Sin cuentas de terceros obligatorias:** La plataforma no debe exigir vinculaciones de cuentas de juegos externas para participar en torneos a menos que el usuario lo solicite expresamente. Solo se requiere una cuenta institucional `@tecsup.edu.pe`.

---

## ⚡ 2. Estándar de Rendimiento Frontend (Web Performance)

- **Carga Diferida:** Modales pesados, selectores de avatar, brackets interactivos y librerías auxiliares deben importarse dinámicamente con `next/dynamic`.
- **Zero Layout Shift (CLS = 0):** Reserva espacio con skeletons y dimensiones fijas en avatares e imágenes antes de que carguen los datos.
- **Librerías ligeras:** Aprovechar utilidades existentes (`sonner`, `framer-motion`, `lucide-react`) en lugar de instalar paquetes redundantes.

---

## 🛡️ 3. Estándar de Backend, API y Base de Datos (NestJS & Prisma)

- **Cero Consultas N+1:** Prohibido hacer queries a la base de datos dentro de bucles `map` o `forEach`. Usa relaciones de Prisma (`include`, `_count`) en una única consulta.
- **Proyección Selectiva:** No seleccionar contraseñas ni datos sensibles en respuestas públicas. Selecciona únicamente los campos necesarios.
- **Transacciones Atómicas:** Operaciones críticas (inscripción de equipos, generación de brackets, aprobación de pagos) deben ejecutarse dentro de `prisma.$transaction`.
- **Validación Estricta:** Validar todos los DTOs con `class-validator` antes de procesar lógica de negocio.
