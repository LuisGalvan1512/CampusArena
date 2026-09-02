# Campus Arena

## Product Requirements Document (PRD)
### Épica 003 — Gestión de Torneos y Temporadas

- **Versión:** 1.0
- **Estado:** Aprobado para diseño
- **Prioridad:** Crítica

---

# Objetivo
Permitir a los organizadores crear, administrar y finalizar torneos de manera sencilla, manteniendo un historial permanente y una experiencia atractiva para los competidores. Cada torneo será tratado como un evento digital con estados automatizados dentro de Campus Arena.

---

# Objetivos de Negocio
- Centralizar la gestión de torneos en una única plataforma integrada.
- Reducir tareas manuales y administrativas para los organizadores.
- Automatizar procesos repetitivos como el sorteo y la publicación de brackets.
- Mejorar la experiencia y la comunicación para los participantes.
- Conservar el historial competitivo completo en un archivo histórico digital.

---

# Actores

## Visitante
- **Puede:** Explorar torneos públicos, consultar información general (reglas, premios), ver resultados históricos de torneos archivados.
- **No puede:** Inscribirse a torneos.

## Competidor
- **Puede:** Inscribirse en torneos abiertos, consultar la lista de participantes aprobados, ver brackets interactivos, consultar resultados de partidas y compartir la página del torneo.

## Organizador
- **Puede:** Crear temporadas y torneos, editar metadatos, publicar torneos, revisar y aprobar solicitudes de inscripción, generar brackets de partidas automáticamente, registrar resultados oficiales de enfrentamientos y marcar el torneo como finalizado.

## Administrador
- **Puede:** Administrar o moderar cualquier torneo, temporada o información publicada en la plataforma.

---

# Estados del Torneo
Todo torneo pasa de manera lineal por los siguientes estados:
1. **Borrador:** Edición inicial por el organizador; no es visible al público.
2. **Publicado:** Visible al público general; permite explorar la información, pero no acepta registros.
3. **Inscripciones abiertas:** Los competidores pueden enviar solicitudes de inscripción y subir comprobantes.
4. **Inscripciones cerradas:** No se aceptan más solicitudes; los cupones quedan congelados.
5. **Verificación de participantes:** Periodo de revisión administrativa de los pagos pendientes.
6. **Sorteo de llaves:** Fase en la que se generan los emparejamientos y se publica el bracket oficial.
7. **En curso:** El torneo ha iniciado. Se juegan y registran los resultados de las partidas.
8. **Finalizado:** Se determina un campeón oficial.
9. **Archivado:** El torneo pasa al Archivo Histórico de forma permanente para consulta.

*Cada estado habilita o deshabilita acciones de forma automática (por ejemplo, no es posible editar reglas si el estado no es Borrador/Publicado).*

---

# Información General del Torneo
Todo torneo registrado debe contener como mínimo:
- Nombre descriptivo.
- Videojuego oficial.
- Organización anfitriona.
- Temporada asociada.
- Banner publicitario.
- Descripción detallada.
- Reglamento oficial (PDF o formato de texto enriquecido).
- Fecha y hora de inicio.
- Fecha y hora de cierre de inscripciones.
- Fecha y hora oficial del torneo.
- Cupo mínimo y máximo de participantes.
- Modalidad competitiva (1vs1, 2vs2, Equipos).
- Tipo de eliminación (Eliminación simple, doble eliminación, formato suizo).
- Detalle de Premios.
- Estado actual de la competencia.

---

# Página del Torneo (Estructura de la Interfaz)

## 1. Hero
- Banner visual de cabecera.
- Nombre y juego del torneo.
- Tag de estado dinámico (Inscripciones abiertas, En curso, etc.).
- Cuenta regresiva animada para el inicio del torneo o cierre de inscripciones.
- Botón interactivo de inscripción.

## 2. Información
- Pestañas con la descripción, reglamento detallado, requisitos académicos/técnicos, premios y cronograma del evento.

## 3. Participantes
- Lista detallada de competidores inscritos y oficialmente aprobados (con sus respectivas organizaciones).

## 4. Llaves (Bracket)
- Visualización interactiva y dinámica del bracket (árbol de eliminación). Actualización en tiempo real.

## 5. Resultados
- Registro de puntuaciones de cada partida y ronda del torneo.

## 6. Estadísticas
- Datos consolidados del torneo: Total de participantes, partidas jugadas, duración promedio, campeón coronado y MVP (si aplica).

## 7. Galería
- Sección multimedia donde el organizador o competidores pueden subir fotos y videos del evento físico o digital.

---

# Historias de Usuario

### HU-301: Creación de Torneo
Como **organizador**,  
quiero **crear un torneo con sus detalles**,  
para **poder abrir inscripciones y convocar competidores**.

### HU-302: Consulta de Información
Como **competidor**,  
quiero **consultar la página de detalles del torneo**,  
para **decidir si deseo participar**.

### HU-303: Notificaciones de Estado
Como **competidor**,  
quiero **recibir notificaciones inmediatas**,  
para **saber cuándo cambia el estado del torneo (ej: llaves generadas)**.

### HU-304: Edición Pre-Inscripción
Como **organizador**,  
quiero **modificar la información y reglas del torneo**,  
para **corregir errores antes de abrir inscripciones**.

### HU-305: Finalización y Archivo
Como **organizador**,  
quiero **marcar el torneo como finalizado**,  
para **que pase automáticamente al histórico y asigne medallas/legado**.

---

# Reglas de Negocio

- **RN-301:** Todo torneo pertenece obligatoriamente a una temporada activa.
- **RN-302:** Todo torneo pertenece a una única organización autorizada.
- **RN-303:** No se puede publicar ni abrir inscripciones de un torneo que no tenga un reglamento cargado.
- **RN-304:** Las reglas y reglamentos quedan completamente bloqueados una vez que se abren las inscripciones.
- **RN-305:** Las llaves del bracket se generan únicamente cuando el torneo está en estado de "Inscripciones cerradas" y todos los participantes están validados.
- **RN-306:** No se puede finalizar el torneo ni declarar un campeón oficial si existen partidas pendientes de registrar.
- **RN-307:** Todo torneo finalizado pasa automáticamente al Archivo Histórico para asegurar la preservación del legado.
- **RN-308:** La publicación del resultado oficial del torneo actualiza automáticamente el ranking, las medallas y el Camino del Competidor de los participantes.

---

# Casos Límite
- **Cupo completo:** Deshabilitar automáticamente el botón de inscripciones al alcanzar el cupo máximo de participantes validados.
- **Torneo cancelado:** Habilitar flujo de cancelación que notifique a los competidores registrados y procese devoluciones o archive el torneo como cancelado.
- **Participante descalificado:** Permitir al organizador descalificar a un jugador en curso, otorgándole una victoria técnica por default a su oponente.
- **Cambio de fechas de última hora:** Notificación masiva por correo y feed a todos los inscritos en caso de reprogramación.
- **Participante ausente (Walkover):** Permitir registrar un walkover (victoria por W.O. del rival) si un participante no se presenta en el tiempo establecido.

---

# Criterios de Aceptación
- La creación de un torneo debe poder realizarse en menos de 10 minutos a través de un asistente paso a paso en el panel del organizador.
- La página del torneo debe actualizarse en tiempo real para todos los usuarios conectados cuando un organizador guarde cambios o actualice el bracket (mediante WebSocket o similar).
- Adaptabilidad al 100% de la visualización del bracket en dispositivos móviles (scroll lateral y zoom fluidos).

---

# Requisitos No Funcionales
- Arquitectura multisitio preparada para escalar y albergar múltiples organizaciones universitarias y de empresa con dominios separados.
- Soporte multijuego flexible, preparado para admitir cualquier formato de juego en el futuro (1vs1, 5vs5, etc.).
- Soporte para alto tráfico y lectura simultánea durante los días del evento competitivo.

---

# Métricas
- Cantidad de torneos creados y finalizados por temporada.
- Promedio de participantes por torneo y tasa de ocupación (participantes reales / cupo máximo).
- Tiempo de retención de los visitantes en las páginas de torneos en curso.
