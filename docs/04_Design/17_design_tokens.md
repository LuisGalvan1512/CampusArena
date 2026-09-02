# Campus Arena

## Design Tokens v1.0

**Propósito:** Definir los tokens de diseño (variables atómicas) de Campus Arena. Estos valores garantizan la consistencia estética y facilitan la traducción directa del diseño visual al código, específicamente mapeados para su configuración en **Tailwind CSS**.

---

# 1. Tokens de Color (Color Scale)

### Primary Blue (Confianza & Organización)
Escala de azules profundos para fondos estructurados, paneles, tablas y botones secundarios.
- `blue-50`: `#F0F4F8`
- `blue-100`: `#D9E2EC`
- `blue-200`: `#BCCCDC`
- `blue-300`: `#9FB3C8`
- `blue-400`: `#829AB1`
- `blue-500`: `#627D98`
- `blue-600`: `#486581`
- `blue-700`: `#334E68`
- `blue-800`: `#243B53` (Principal para superficies oscuras secundarias)
- `blue-900`: `#1D3557` (Principal de la marca)
- `blue-950`: `#102A43`

### Accent Red (Competencia & Acción)
Escala de rojos vibrantes para CTAs, estados competitivos y llamadas de atención prioritarias.
- `red-50`: `#FFE3E3`
- `red-100`: `#FFC9C9`
- `red-200`: `#FFA8A8`
- `red-300`: `#FF8787`
- `red-400`: `#FF6B6B`
- `red-500`: `#FA5252`
- `red-600`: `#F03E3E`
- `red-700`: `#E63946` (Rojo principal de la marca)
- `red-800`: `#C92A36`
- `red-900`: `#B01E2A`

### Neutral Grays (Grises de Equilibrio / Arena)
Gama cromática de grises fríos para dar soporte al modo oscuro de la interfaz.
- `gray-50`: `#F8F9FA`
- `gray-100`: `#F1F3F5`
- `gray-200`: `#E9ECEF`
- `gray-300`: `#DEE2E6`
- `gray-400`: `#CED4DA`
- `gray-500`: `#ADB5BD`
- `gray-600`: `#6C7A89` (Placeholders y texto deshabilitado)
- `gray-700`: `#2D3142` (Bordes de tarjetas y divisores)
- `gray-800`: `#1F212D` (Fondo de inputs y campos de datos)
- `gray-900`: `#15161E` (Fondo de tarjetas y contenedores principales)
- `gray-950`: `#0B0C10` (Fondo principal de la aplicación)

### Estados (System States)
- `success`: `#2A9D8F` (Aprobado, confirmado, verificado)
- `warning`: `#F4A261` (Pendiente, en revisión, advertencia)
- `error`: `#E76F51` (Rechazado, fallido, peligro)

---

# 2. Tokens de Espaciado (Spacing Scale)

Basado en una progresión de 8px (y divisiones lógicas de 4px) para controlar paddings, márgenes y gaps.

| Token | Valor (rem) | Equivalente (px) | Uso Sugerido |
| :--- | :--- | :--- | :--- |
| `spacing-1` | `0.25rem` | 4px | Margen icono a texto, micro-detalles. |
| `spacing-2` | `0.5rem` | 8px | Padding de badges y botones compactos. |
| `spacing-3` | `0.75rem` | 12px | Padding interno de inputs y textareas. |
| `spacing-4` | `1rem` | 16px | Padding estándar de tarjetas pequeñas, gaps de rejilla móvil. |
| `spacing-6` | `1.5rem` | 24px | Padding de tarjetas principales y modales. |
| `spacing-8` | `2rem` | 32px | Separación entre secciones del dashboard. |
| `spacing-12`| `3rem` | 48px | Márgenes de layouts y vistas de página. |
| `spacing-16`| `4rem` | 64px | Alturas de cabeceras Hero. |

---

# 3. Tokens de Bordes (Border Radius)

Curvaturas para esquinas redondeadas controladas.
- `radius-sm`: `4px` (`border-radius: 4px;` - Badges e indicadores pequeños).
- `radius-md`: `8px` (`border-radius: 8px;` - Botones, inputs y controles estándar).
- `radius-lg`: `12px` (`border-radius: 12px;` - Tarjetas de torneos y perfiles).
- `radius-xl`: `16px` (`border-radius: 16px;` - Modales y popups).
- `radius-full`: `9999px` (Avatares circulares).

---

# 4. Tokens de Sombras (Shadows)

Generan niveles de elevación y jerarquía visual en modo oscuro.
- `shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.3)` (Controles e inputs).
- `shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4)` (Tarjetas).
- `shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.6)` (Dropdowns).
- `shadow-xl`: `0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.7)` (Modales).

---

# 5. Tokens de Tipografía (Typography)

### Font Families
- `font-display`: `"Outfit"`, sans-serif (Títulos, acentos de eSports).
- `font-sans`: `"Inter"`, sans-serif (Textos de lectura, tablas, formularios).

### Font Sizes
- `text-xs`: `12px` (line-height: `16px`)
- `text-sm`: `14px` (line-height: `20px`) (Base para textos de lectura)
- `text-base`: `16px` (line-height: `24px`)
- `text-lg`: `18px` (line-height: `28px`)
- `text-xl`: `20px` (line-height: `28px`)
- `text-2xl`: `24px` (line-height: `32px`)
- `text-3xl`: `30px` (line-height: `36px`)
- `text-4xl`: `36px` (line-height: `40px`)
- `text-5xl`: `48px` (line-height: `48px`)

---

# 6. Mapeo para `tailwind.config.js`

Estos tokens se inyectarán directamente en el archivo de configuración de Tailwind CSS para el frontend:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        background: '#0B0C10',
        surface: {
          primary: '#15161E',
          secondary: '#1F212D',
          border: '#2D3142',
        },
        brand: {
          blue: '#1D3557',
          red: '#E63946',
          white: '#F1FAEE',
        },
        state: {
          success: '#2A9D8F',
          warning: '#F4A261',
          error: '#E76F51',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'Outfit', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.7)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.8)',
      }
    },
  },
}
```
