# Campus Arena

## Design Language & Design System v1.0

### Filosofía
Campus Arena no debe sentirse como un sistema académico. Debe sentirse como una plataforma competitiva de videojuegos con un acabado profesional. 

Cuando un estudiante abra la plataforma debe pensar:
> *"Aquí pasan cosas importantes."*

No buscamos una estética infantil ni excesivamente gamer. Buscamos una identidad moderna, elegante, dinámica y competitiva.

---

# Los cinco pilares del diseño

## 1. Competitivo
Cada elemento debe transmitir progreso. El usuario siempre debe sentir que avanza.

## 2. Premium
Nada debe parecer improvisado. Mucho espacio en blanco, buenas tipografías y una jerarquía visual clara.

## 3. Dinámico
Las interfaces nunca estarán completamente quietas. Existirán pequeñas animaciones:
- Hover y microinteracciones de respuesta.
- Transiciones de aparición fluida.
- Contadores dinámicos.
- Cambios de estado fluidos.
- Skeleton Loaders para tiempos de carga.

## 4. Claro
La información importante siempre tendrá prioridad. Nunca saturaremos una pantalla.

## 5. Escalable
Cada componente debe poder reutilizarse. Nunca diseñaremos algo para una sola página.

---

# Identidad Visual

### Colores
- **Azul (Confianza, Tecnología, Competencia):**
  - Primary Base: `#1D3557` (Principal para navegación, paneles y organizadores).
  - Hover: `#2A4B7C`
  - Accent/Cyan: `#457B9D` (Inscripciones, noticias, enlaces secundarios).
- **Rojo (Acción, Intensidad, Victoria):**
  - Primary Base: `#E63946` (Llamados a la acción de competidores, estados críticos, victorias).
  - Hover: `#F05C66`
  - Active: `#C92A36`
- **Blanco (Limpieza, Orden, Claridad):**
  - Text Primary: `#F1FAEE` (Títulos de alta jerarquía, lectura de alto contraste).
  - Text Secondary: `#A8DADC` (Subtítulos, captions, metadatos).
- **Colores Secundarios (Grises de Equilibrio):**
  - Background (Negro Arena): `#0B0C10` (Fondo general del sitio).
  - Surface Primary (Gris Oscuro): `#15161E` (Contenedores de tarjetas, listados).
  - Surface Secondary (Gris Medio): `#1F212D` (Campos de entrada, fondos secundarios).
  - Surface Border: `#2D3142` (Bordes sutiles, divisores de tabla).

### Estilo General & Inspiración
- **Steam / Discord:** Modo oscuro y estructuración de comunidades.
- **Apple / Linear / Stripe:** Minimalismo premium, espacios generosos y bordes ultra-limpios.
- **Riot Games / Valorant Champions:** Acentos vibrantes, tipografías marcadas y mística de esports.
- **Notion:** Estructura limpia y enfocada a la organización.

---

# Tipografía
Debe cumplir con excelente lectura, apariencia moderna y adaptabilidad multiplataforma.

- **Title & Headings Font:** `Geist` o `Outfit` (Fuentes geométricas con gran personalidad).
- **Body & Data Font:** `Inter` o `Geist` (Legibilidad óptima en listados extensos y dispositivos móviles).

| Token | Familia | Tamaño | Peso (Weight) | Line-Height | Uso |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display L** | Geist/Outfit | 48px | 800 (Extra Bold) | 1.1 | Títulos Hero y Portadas |
| **H1** | Geist/Outfit | 32px | 700 (Bold) | 1.2 | Cabeceras de Dashboard / Secciones principales |
| **H2** | Geist/Outfit | 24px | 700 (Bold) | 1.3 | Títulos de tarjetas grandes / Subpáginas |
| **H3** | Geist/Outfit | 20px | 600 (Semi Bold) | 1.4 | Títulos de tablas, modales y tarjetas secundarias |
| **Body Regular** | Inter/Geist | 14px | 400 (Regular) | 1.5 | Texto de lectura, descripciones de torneos |
| **Body Bold** | Inter/Geist | 14px | 600 (Semi Bold) | 1.5 | Destacados, etiquetas de formulario |
| **Caption / Small** | Inter/Geist | 12px | 400 (Regular) | 1.4 | Fechas, tags, notas secundarias |

---

# Bordes
Las esquinas serán ligeramente redondeadas para lograr el equilibrio entre elegancia y modernidad:
- **Card / Contenedores:** `border-radius: 12px;`
- **Botón / Input / Badges:** `border-radius: 8px;`
- **Modales / Diálogos:** `border-radius: 16px;`

---

# Espaciado
Toda la plataforma utilizará la siguiente escala consistente (basada en el grid de 8px):
- **4 px (xxs):** Distancia entre icono y texto.
- **8 px (xs):** Padding en botones compactos y badges.
- **12 px (sm):** Padding interno de campos de texto e inputs.
- **16 px (md):** Padding estándar de tarjetas pequeñas y espacios entre párrafos.
- **24 px (lg):** Padding estándar de tarjetas grandes y modales.
- **32 px (xl):** Separación entre módulos o secciones en dashboards.
- **48 px (xxl):** Márgenes de layout de página.
- **64 px (xxxl):** Altura de secciones Hero y bloques de landing.

---

# Sombras
Las sombras serán suaves y sutiles para separar elementos sin sobrecargar:
- **Shadow Low:** `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);` (Tarjetas secundarias e inputs).
- **Shadow Medium:** `box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);` (Tarjetas de torneos y componentes principales).
- **Shadow High:** `box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8);` (Modales flotantes y notificaciones toast).

---

# Iconografía
Utilizaremos una única familia de iconos simples, reconocibles y sin exceso de detalle (como *Lucide* o *Phosphor*).
- **Esports & Logros:** `Trophy`, `Gamepad2`, `Swords`, `Medal`, `Target`.
- **Administración & Control:** `Users`, `CreditCard`, `Lock`, `Settings`, `Activity`.
- **UI básica:** `ArrowRight`, `Check`, `X`, `ChevronDown`, `Bell`, `Calendar`.

---

# Componentes Base

## 1. Botón
- **Estados:**
  - **Normal:** Color base (Rojo o Azul), texto claro, opacidad 100%.
  - **Hover:** Brillo incrementado del color de fondo, escala sutil (`scale(1.02)`).
  - **Active:** Fondo oscurecido, escala reducida (`scale(0.98)`).
  - **Focus:** Anillo exterior sutil de 2px de color complementario.
  - **Loading:** Texto semioculto con indicador de spinner circular o pulso continuo de carga.
  - **Disabled:** Fondo `#2D3142`, texto `#6C7A89`, cursor no permitido (`not-allowed`).

## 2. Input
- **Estados:**
  - **Vacío:** Borde `#2D3142`, fondo `#1F212D`, texto de marcador `#6C7A89`.
  - **Escribiendo (Focus):** Borde cambia a `#E63946` (competidor) o `#457B9D` (organizador) con resplandor sutil.
  - **Correcto (Success):** Borde cambia a `#2A9D8F`. Icono de verificación visible.
  - **Error:** Borde cambia a `#E76F51`. Mensaje explicativo en la parte inferior en color `#E76F51`.
  - **Deshabilitado (Disabled):** Opacidad al 50%, fondo `#15161E`.

## 3. Card
Se utiliza para Torneos, Juegos, Usuarios, Noticias y Estadísticas.
- **Estructura Visual:** Fondo `#15161E`, borde sutil 1px `#2D3142`, esquinas `12px`.
- **Interacción:** Efecto de elevación al pasar el mouse (`translateY(-4px)`) y realce de borde.

## 4. Badge
Se utiliza para estados, medallas, categorías y roles.
- **Estilo:** Bordes completamente redondeados o de `6px`, fondo semi-transparente (15% de opacidad) del color de estado correspondiente con texto al 100% de brillo.
  - *Inscrito/Verificado:* Fondo verde translúcido, texto `#2A9D8F`.
  - *Pendiente:* Fondo naranja translúcido, texto `#F4A261`.
  - *Cancelado:* Fondo rojo translúcido, texto `#E76F51`.

## 5. Modal
Siempre suspendido sobre un fondo oscuro semi-transparente (backdrop overlay).
- **Estructura:**
  - Título (`Outfit/Geist` H3).
  - Descripción clara.
  - Botón de Acción Principal (alineado a la derecha).
  - Botón de Acción Secundaria (cancelar/cerrar).

## 6. Toast
Notificación sutil autodescartable en la esquina de la pantalla.
- **Estilo:** Contenedor pequeño con fondo `#15161E`, borde según el estado (Éxito, Error o Info) y un icono representativo de la acción realizada (ej: "Pago recibido").

---

# Estados del Sistema

## Cargando
- **Skeleton Loaders:** Bloques con efecto barrido o gradiente de animación pulsante (`pulse 1.5s infinite`). Evitamos spinners en la medida de lo posible para no romper el flujo visual.

## Vacío
No utilizaremos respuestas genéricas. 
- *Ejemplo:* En lugar de *"No hay datos"*, diremos *"Aún no participas en ningún torneo"* con un botón de CTA destacado: *"Explorar Torneos"*.

## Error
Los mensajes siempre tendrán dos partes:
1. Qué ocurrió (lenguaje comprensible, no técnico).
2. Qué puede hacer el usuario para solucionarlo (acción sugerida).

## Éxito
Confirmación visual inmediata con animación sutil de check y color verde de éxito `#2A9D8F`.

---

# Animaciones
El movimiento debe ayudar a la experiencia, nunca distraer.
- **Apertura de Modales:** Despliegue con escala y efecto rebote sutil (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Transición de Páginas:** Desvanecimiento suave (fade) y desplazamiento lateral (slide) controlado.
- **Sorteo de Bracket:** Animación secuencial de revelación de emparejamientos.

---

# Responsive
La experiencia en móvil es prioritaria. 
- Adaptabilidad flex y grid en todos los componentes.
- Brackets con desplazamiento horizontal táctil nativo.
- Tamaño mínimo de clics de `44px x 44px`.

---

# Accesibilidad
- Contraste WCAG AA asegurado en toda la paleta de colores.
- Outline visible (`outline-color`) en todos los elementos interactivos al navegar con teclado.
- Uso de etiquetas aria-labels en elementos únicamente icónicos.

---

# Principio Fundamental
Cada nueva pantalla deberá construirse reutilizando componentes existentes. Si un componente nuevo rompe la consistencia visual, primero se evaluará si el Design System debe evolucionar antes de incorporarlo.
