# Campus Arena

## UI Kit (Catálogo de Componentes) v1.0

**Propósito:** Especificar la estructura visual, datos requeridos y clases de Tailwind CSS sugeridas para los componentes exclusivos de Campus Arena. Este catálogo funciona como el catálogo de bloques interactivos para construir todas las páginas.

---

# 1. Componente: Tournament Card (Tarjeta de Torneo)

Se utiliza en el listado general de torneos y en el dashboard.
- **Estructura Visual:**
  - **Header Image:** Banner del torneo (16:9 ratio) con el logo del videojuego superpuesto.
  - **Status Tag:** Badge de estado flotante (ej: `Inscripciones Abiertas`).
  - **Body:** Nombre del torneo, Organización, Temporada, Fecha y Cupo disponible (barra de progreso).
  - **Footer:** Contador de participantes y Botón de acción (`Inscribirse` o `Ver Detalles`).
- **Clases Tailwind Sugeridas:**
  ```html
  <div class="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden hover:border-brand-red transition-all duration-200 shadow-md">
    <!-- Banner -->
    <div class="relative h-48 bg-cover bg-center">
      <span class="absolute top-4 left-4 bg-state-success/15 text-state-success text-xs font-bold px-2 py-1 rounded-full">
        Inscripciones Abiertas
      </span>
    </div>
    <!-- Contenido -->
    <div class="p-4 flex flex-col gap-2">
      <h3 class="font-display text-lg text-brand-white">Copa Tecsup - Clash Royale</h3>
      <p class="text-xs text-brand-white/50">Tecsup Lima • Temporada 2027-I</p>
      <!-- Barra de progreso de cupos -->
      <div class="w-full bg-gray-800 h-2 rounded-full mt-2">
        <div class="bg-brand-red h-2 rounded-full" style="width: 75%"></div>
      </div>
      <div class="flex justify-between text-xs text-brand-white/70 mt-1">
        <span>48 / 64 Participantes</span>
        <span>Cierra en 2d 12h</span>
      </div>
    </div>
  </div>
  ```

---

# 2. Componente: Match Card (Tarjeta de Enfrentamiento)

El nodo central de visualización del bracket (Competition Engine).
- **Estructura Visual:**
  - Caja con dos filas (una para cada competidor).
  - Cada fila muestra: Avatar del jugador, IGN (nombre en juego), Organización, marcador numérico y estado (ganador resaltado, perdedor opaco).
  - Indicador de estado central (ej: `Bo3`, `En juego`, `Finalizado`).
- **Clases Tailwind Sugeridas:**
  ```html
  <div class="bg-gray-900 border border-gray-700 rounded-md w-64 divide-y divide-gray-800 shadow-lg">
    <!-- Jugador A (Ganador) -->
    <div class="flex items-center justify-between p-3 bg-brand-blue/10">
      <div class="flex items-center gap-2">
        <img class="w-6 h-6 rounded-full" src="/avatars/user1.jpg" alt="Luis" />
        <span class="text-sm font-semibold text-brand-white">Luis</span>
      </div>
      <span class="text-sm font-bold text-state-success">2</span>
    </div>
    <!-- Jugador B (Perdedor) -->
    <div class="flex items-center justify-between p-3 opacity-50">
      <div class="flex items-center gap-2">
        <img class="w-6 h-6 rounded-full" src="/avatars/user2.jpg" alt="Carlos" />
        <span class="text-sm font-semibold text-brand-white">Carlos</span>
      </div>
      <span class="text-sm font-bold text-brand-white">1</span>
    </div>
  </div>
  ```

---

# 3. Componente: Countdown Timer (Cuenta Regresiva)

Muestra de forma dinámica la expectativa del torneo en la Hero section.
- **Estructura Visual:** cuatro bloques separados (Días, Horas, Minutos, Segundos) con etiquetas inferiores y un borde de acento.
- **Clases Tailwind Sugeridas:**
  ```html
  <div class="flex gap-4 text-center">
    <div class="bg-gray-900 border border-gray-700 px-4 py-3 rounded-lg min-w-[70px]">
      <span class="font-display text-2xl font-bold text-brand-red">02</span>
      <p class="text-[10px] uppercase text-brand-white/50">Días</p>
    </div>
    <div class="bg-gray-900 border border-gray-700 px-4 py-3 rounded-lg min-w-[70px]">
      <span class="font-display text-2xl font-bold text-brand-red">14</span>
      <p class="text-[10px] uppercase text-brand-white/50">Horas</p>
    </div>
    <div class="bg-gray-900 border border-gray-700 px-4 py-3 rounded-lg min-w-[70px]">
      <span class="font-display text-2xl font-bold text-brand-red">45</span>
      <p class="text-[10px] uppercase text-brand-white/50">Minutos</p>
    </div>
  </div>
  ```

---

# 4. Componente: Medal (Medalla Competitiva)

Iconografía e insignia interactiva que representa los logros del jugador.
- **Estructura Visual:** Icono circular con borde metálico (Oro, Plata, Bronce, Platino) según rareza, y tooltip de detalles al hover.
- **Clases Tailwind Sugeridas:**
  ```html
  <div class="group relative flex items-center justify-center w-12 h-12 bg-gray-900 border-2 border-amber-500 rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform duration-200">
    <span class="text-amber-500 text-lg">🏆</span>
    <!-- Tooltip -->
    <div class="absolute bottom-14 hidden group-hover:block bg-gray-900 border border-gray-700 text-xs p-2 rounded shadow-xl w-40 text-center z-10">
      <p class="font-bold text-brand-white">Campeón Supremo</p>
      <p class="text-[10px] text-brand-white/60">1er puesto en un torneo oficial.</p>
    </div>
  </div>
  ```

---

# 5. Componente: Ranking Row (Tabla de Clasificación)

Fila interactiva utilizada para mostrar tablas de posiciones o líderes de la temporada.
- **Estructura Visual:** Posición numérica con indicador de tendencia (flecha arriba/abajo), avatar, nombre del competidor, organización, porcentaje de victorias (win rate) y total de medallas.
- **Clases Tailwind Sugeridas:**
  ```html
  <tr class="hover:bg-gray-800 transition-colors duration-150">
    <td class="p-4 text-center font-display font-bold text-brand-white">1</td>
    <td class="p-4">
      <div class="flex items-center gap-3">
        <img class="w-8 h-8 rounded-full" src="/avatars/user1.jpg" alt="Luis" />
        <div>
          <p class="text-sm font-semibold text-brand-white">Luis Galvan</p>
          <p class="text-xs text-brand-white/50">Tecsup Lima</p>
        </div>
      </div>
    </td>
    <td class="p-4 text-sm text-brand-white">Clash Royale</td>
    <td class="p-4 text-sm font-bold text-state-success">85.4%</td>
    <td class="p-4 text-right">
      <span class="bg-gray-900 px-3 py-1 rounded text-xs border border-gray-700 text-brand-white">
        🥇 3 Medallas
      </span>
    </td>
  </tr>
  ```

---

# 6. Componente: Player Card (Tarjeta del Jugador)

Una miniatura interactiva del perfil que sirve para explorar contrincantes.
- **Estructura:** Avatar, apodo, organización, win rate destacado, y fila de últimas 3 medallas obtenidas.
