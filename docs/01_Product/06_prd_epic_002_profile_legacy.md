# Campus Arena

## Product Requirements Document (PRD)
### Épica 002 — Perfil del Competidor y Legado Competitivo

- **Versión:** 1.0
- **Estado:** Aprobado para diseño
- **Prioridad:** Crítica

---

# Objetivo
Construir un perfil dinámico que represente la identidad, trayectoria y logros de cada competidor dentro de Campus Arena. El perfil no es una ficha estática de datos personales; es el historial competitivo e histórico vivo del usuario (su legado).

---

# Problema
Los participantes de torneos suelen perder su historial entre ediciones. Cada torneo comienza desde cero y los logros anteriores desaparecen. Campus Arena conservará toda la trayectoria del competidor, permitiendo construir un legado permanente y visible.

---

# Objetivos de Negocio
- Centralizar el historial competitivo del usuario.
- Incentivar la participación recurrente mediante recompensas y gamificación.
- Reconocer el esfuerzo de los competidores mediante medallas y podios.
- Facilitar la consulta de estadísticas e indicadores de desempeño.
- Fortalecer el sentido de comunidad a través de perfiles públicos compartibles.

---

# Actores

## Competidor
- **Puede:** Consultar su propio perfil, editar su información personal y redes sociales, vincular cuentas de juego, ver estadísticas segmentadas por juego y compartir su perfil.

## Visitante
- **Puede:** Ver únicamente la información pública del perfil, respetando la configuración de privacidad del competidor.

## Administrador
- **Puede:** Moderar la información pública del competidor (foto, biografía), suspender perfiles y revisar el historial de auditoría del usuario.

---

# Historias de Usuario

### HU-201: Personalización de Perfil
Como **competidor**,  
quiero **personalizar mi perfil**,  
para **representar mi identidad dentro de la comunidad**.

### HU-202: Visualización de Historial (Legado)
Como **competidor**,  
quiero **visualizar mi historial de torneos**,  
para **conocer mi evolución y posición final a lo largo del tiempo**.

### HU-203: Obtención de Medallas y Logros
Como **competidor**,  
quiero **obtener medallas y reconocimientos**,  
para **mostrar mis logros competitivos a los demás**.

### HU-204: Consulta de Trayectoria Ajena
Como **visitante**,  
quiero **consultar el perfil de otros competidores**,  
para **conocer su trayectoria y estadísticas**.

### HU-205: Configuración de Privacidad
Como **competidor**,  
quiero **configurar la privacidad de mi perfil**,  
para **decidir qué información es pública y cuál es privada**.

---

# Secciones del Perfil

## 1. Encabezado
- Foto de perfil.
- Nombre y apellidos.
- Organización principal (ejemplo: Tecsup).
- Detalles académicos: Carrera y ciclo actual.
- Fecha de ingreso a la plataforma.
- Juegos favoritos vinculados.
- Biografía descriptiva del jugador.

## 2. Tarjeta de Competidor
Información consolidada de alto nivel:
- Participaciones totales.
- Campeonatos obtenidos (Primeros lugares).
- Victorias totales en partidas.
- Derrotas totales en partidas.
- Medallas desbloqueadas.
- Última actividad registrada.

## 3. Camino del Competidor
Línea de tiempo cronológica autogenerada que cuenta la historia del jugador:
- Fecha de registro.
- Primera participación.
- Primera victoria en partida.
- Primer podio.
- Primer campeonato ganado.
- Récord personal.

## 4. Historial de Torneos
Listado completo de torneos disputados ordenado cronológicamente:
- Videojuego.
- Temporada.
- Organización anfitriona.
- Posición final (ej: Campeón, Top 4, Participante).
- Récord de partidas en ese torneo (ej: 5 victorias - 1 derrota).
- Fecha de finalización.

## 5. Medallas
Reconocimientos visuales obtenidos de manera automática. Ejemplos de medallas base:
- *Primera Participación* (Desbloqueado al jugar el primer torneo).
- *Campeón* / *Subcampeón* / *Top 4* (Posiciones finales destacadas).
- *Jugador Constante* (Haber participado en 10 torneos).
- *Veterano* (Haber participado en 25 torneos).

*El sistema debe permitir que los administradores agreguen nuevas medallas de manera extensible sin alterar el código central.*

## 6. Estadísticas
Indicadores de desempeño cuantitativo segmentados por videojuego:
- Torneos jugados.
- Partidas disputadas.
- Victorias / Derrotas.
- Win Rate (Porcentaje de victorias en partidas).
- Mejor posición histórica lograda.
- Juegos y temporadas más activos.

## 7. Actividad Reciente
Feed cronológico de los últimos eventos del jugador:
- "Inscrito en el torneo X".
- "Resultado registrado: Victoria contra Rival Y".
- "Medalla desbloqueada: Campeón".

## 8. Configuración
Formulario para editar:
- Foto de perfil.
- Biografía.
- Juegos favoritos.
- Enlaces a redes sociales/canales de gaming (opcional).
- Opciones de Privacidad (Perfil público, Solo amigos/organización, Privado).

---

# Reglas de Negocio

- **RN-201:** Todo competidor posee un único perfil consolidado.
- **RN-202:** El historial competitivo e histórico de partidas nunca se elimina (integridad del legado).
- **RN-203:** Las medallas se asignan automáticamente al momento de registrar el evento que cumple con sus condiciones.
- **RN-204:** Las estadísticas de victorias, derrotas y win rate se recalculan en tiempo real tras la publicación de cada resultado oficial.
- **RN-205:** La visibilidad de la información en búsquedas públicas dependerá de la configuración de privacidad definida por el usuario.
- **RN-206:** Cada participación en un torneo actualiza de forma automática el Camino del Competidor y el Legado.

---

# Casos Límite
- **Usuario nuevo:** Perfil sin participaciones ni estadísticas (se debe mostrar un estado vacío interactivo que invite a inscribirse a su primer torneo).
- **Usuario sin foto:** Mostrar avatar por defecto con la inicial del usuario o silueta de juego genérica.
- **Usuario con perfil privado:** Ocultar estadísticas y logros a visitantes, mostrando únicamente información de identificación básica y organización.
- **Usuario suspendido:** Perfil bloqueado para visitantes, con mensaje de moderación correspondiente.
- **Usuario eliminado administrativamente:** Se elimina la cuenta de usuario, pero sus partidas y participación histórica se conservan con el nombre anonimizado para no romper la integridad de las llaves (brackets) de torneos pasados.

---

# Criterios de Aceptación
- La carga del perfil debe ser menor a 1 segundo, incluso para competidores veteranos con cientos de partidas.
- Todos los indicadores cuantitativos deben calcularse con datos de partidas oficialmente publicadas.
- El usuario debe contar con un botón rápido para copiar el enlace de su perfil público y compartirlo en redes sociales.

---

# Requisitos No Funcionales
- Diseño responsivo adaptable a dispositivos móviles, tablets y pantallas de escritorio.
- Accesibilidad WCAG AA.
- Caching de estadísticas calculadas para optimizar base de datos.

---

# Métricas
- Porcentaje de perfiles completados (foto + biografía).
- Vinculación de cuentas de juegos (tasa de conversión).
- Frecuencia con la que los usuarios consultan o comparten sus perfiles.
- Número de medallas otorgadas por temporada.
