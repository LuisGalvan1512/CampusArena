---
name: web-performance
description: >-
  Frontend web performance optimization guidelines for Next.js, React, bundle size reduction,
  render optimization, asset delivery, and Core Web Vitals. Use this skill when building new pages,
  analyzing loading times, auditing bundle size, or optimizing re-renders and client performance.
---

# Web Performance & Frontend Optimization (Campus Arena)

Este estándar define las pautas técnicas para garantizar que la web de **Campus Arena** cargue en menos de 1 segundo, mantenga 60fps en animaciones y logre puntajes sobresalientes en Core Web Vitals (LCP, FID/INP, CLS).

---

## 1. Estrategia de Carga y Code Splitting (Next.js)

### Importaciones Dinámicas (`next/dynamic`)
- Componentes pesados o que no se ven en el primer render (above the fold) deben cargarse bajo demanda:
  - Modales (Avatar selector, Fondo de perfil, Roster modal).
  - Brackets interactivos complejos (`BracketView.tsx`).
  - Confetti y efectos sonoros (`confetti.ts`, `sound.ts`).
  ```tsx
  import dynamic from 'next/dynamic';
  
  const HeavyBracketView = dynamic(
    () => import('@/components/BracketView').then((m) => m.BracketView),
    { ssr: false, loading: () => <BracketSkeleton /> }
  );
  ```

### Prevención de Layout Shift (CLS = 0)
- Todo contenedor con contenido asíncrono debe reservar su espacio exacto con skeletons (`TournamentCardSkeleton`) o `min-height`.
- Las imágenes y avatares siempre deben tener dimensiones explícitas (`width`, `height`, `aspect-ratio`) o usar `next/image` con `fill`.

---

## 2. Optimización de Renderizado en React

### Colocación de Estado (State Colocation)
- Mantén el estado lo más cerca posible de donde se usa.
- Evita estados globales para cosas efímeras como "el modal está abierto" o "el input de búsqueda cambió"; eso evita que toda la página se vuelva a renderizar.

### Memorización Inteligente (Sin Sobre-optimizar)
- Usa `useCallback` en funciones pasadas como prop a listas largas (como filas de ranking o tarjetas de torneo).
- Usa `useMemo` únicamente para cálculos costosos (filtrado de cientos de participantes o cálculo de estadísticas acumuladas), no para arrays estáticos pequeños.

### Almacenamiento Local Eficiente (LocalStorage / Zustand)
- Nunca leas `localStorage` directamente en el cuerpo del render (causa desajustes de hidratación SSR y bloquea el hilo principal).
- Usa hooks con `useEffect` o Zustand con `persist` configurado con hidratación asíncrona.

---

## 3. Optimización de Recursos y Multimedia

### Imágenes y Assets
- Formatos recomendados: **WebP** y **SVG** optimizados.
- Iconos: Importa directamente los iconos específicos de `lucide-react` (ej. `import { Trophy } from 'lucide-react'`), evitando importar paquetes completos.
- Fondos y Banners: Las texturas CSS procedurales (gradientes lineales/radiales como las de `banner-*`) son infinitamente más ligeras (0 KB de red) que imágenes de mapa de bits pesadas. Prioriza CSS puro siempre que sea posible.

### Reducción de Bundle
- Revisa dependencias con frecuencia. No instales librerías completas si un helper nativo de JavaScript o un hook de 10 líneas puede resolverlo.
