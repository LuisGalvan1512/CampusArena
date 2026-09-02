# Campus Arena

## Motion Guidelines (Guías de Movimiento) v1.0

**Propósito:** Definir la filosofía de movimiento, duraciones, curvas de aceleración y pautas de animación en Campus Arena. Esto asegura que la plataforma se sienta viva, premium y con respuestas inmediatas, reforzando la emoción del juego sin entorpecer la usabilidad.

---

# 1. Filosofía del Movimiento (Motion Philosophy)

El movimiento en Campus Arena no es puramente estético; cumple una función comunicativa y de experiencia. Nos inspiramos en tres grandes referencias:
- **Apple (Física Natural):** Movimientos fluidos basados en masa y amortiguación. Las transiciones no se detienen en seco, desaceleran de forma natural.
- **Steam (Impacto Competitivo):** Sensación de peso y emoción al revelar logros, brackets y campeonatos.
- **Linear / Stripe (Velocidad & Precisión):** Micro-transiciones ultra-rápidas para no retrasar las acciones de productividad u organización (como aprobar un pago).

---

# 2. Tokens de Tiempo (Timing Tokens)

Definimos tres constantes de duración para mantener la coherencia en todas las transiciones:

- **`duration-fast` (100ms):** Para interacciones instantáneas de controles de entrada.
  - *Uso:* Hovers en botones, checkboxes, inputs y tooltips.
- **`duration-medium` (200ms):** Duración estándar para cambios de estado de componentes.
  - *Uso:* Despliegues de dropdowns, colapsables, cambio de pestañas (tabs).
- **`duration-slow` (300ms):** Reservado para animaciones de mayor escala física o espacial.
  - *Uso:* Apertura de modales, transiciones de página, entrada de toasts y animaciones del bracket.

---

# 3. Curvas de Aceleración (Easing Curves)

Evitamos las animaciones lineales (`linear`) ya que se sienten artificiales. En su lugar, utilizamos curvas de aceleración personalizadas:

- **Standard Easing (`ease-in-out`):** Curva simétrica básica para transiciones de color y opacidad.
  - *CSS:* `cubic-bezier(0.4, 0, 0.2, 1)`
- **Deceleration Curve (`ease-out`):** Entrada rápida y desaceleración sutil al final. Ideal para elementos que entran a la pantalla.
  - *CSS:* `cubic-bezier(0.16, 1, 0.3, 1)`
- **Spring Curve (`bounce-out`):** Curva con un rebote elástico (muelle) al final para aportar energía de juego y retroalimentación interactiva.
  - *CSS:* `cubic-bezier(0.34, 1.56, 0.64, 1)`

---

# 4. Comportamiento en Componentes Clave

### Botones (Hover & Active States)
- **Hover:** Transición rápida de `100ms` usando `ease-out`. El botón se eleva sutilmente (`transform: scale(1.02)`) e incrementa el brillo de su fondo degradado.
- **Active (Clic):** Reducción de tamaño a `98%` en `100ms` para simular la presión física del botón.

### Tarjetas (Cards)
- **Hover:** Desplazamiento vertical hacia arriba en `200ms` usando `ease-out` (`transform: translateY(-4px)`) y cambio en el brillo del borde (`border-color`). Genera una sensación de que el elemento es clickeable.

### Modales (Dialogs)
- **Backdrop Overlay:** Se desvanece (fade-in) en `200ms` con `ease-in-out` (opacidad máxima al 60%).
- **Contenedor Modal:** Entra desde el centro de la pantalla, escalando de `95%` a `100%` en `300ms` utilizando la curva **Spring Curve (rebote)** para dar presencia.

### Notificaciones Toast
- **Entrada:** Entra desde la derecha de la pantalla deslizándose hacia la izquierda (slide-in) en `300ms` con `ease-out`.
- **Salida:** Se desvanece (fade-out) en `200ms` con `ease-in-out`.

### Skeleton Loaders
- **Animación:** Pulso continuo de opacidad (`opacity` del 40% al 80%) y barrido lateral de un gradiente de luz de izquierda a derecha en un ciclo infinito de `1.5s`.

---

# 5. Animación del Bracket (Sorteo de Llaves)

La revelación del bracket de torneos es uno de los momentos más épicos. No debe aparecer de golpe.
- **Flujo:** Al cargarse la página de llaves, los enfrentamientos de cada ronda aparecen de forma escalonada (secuencial).
- **Especificación:**
  - Animación de entrada: Desvanecimiento (fade-in) y deslizamiento lateral hacia la derecha en `300ms`.
  - Retraso (Stagger): Cada llave tiene un retraso acumulado de `50ms` respecto a la anterior (`transition-delay: index * 50ms`), creando un efecto de barrido en cascada.
