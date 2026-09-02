# Campus Arena

## MVP Wireframes & Screen Specification v1.0

- **Estado:** Listo para diseño de interfaz
- **Alcance:** MVP para lanzamiento inicial en una institución educativa (Tecsup)
- **Objetivo:** Definir las pantallas mínimas necesarias para que competidores y organizadores puedan completar un torneo de principio a fin de forma intuitiva y fluida.

---

# 1. Principios de los Wireframes

Todas las pantallas del MVP deberán cumplir de manera estricta las siguientes reglas:
1. **Ubicación Clara:** El usuario siempre debe saber exactamente en qué sección se encuentra (breadcrumbs, títulos claros).
2. **Llamados a la Acción Destacados (CTA):** Las acciones principales deben estar identificadas inequívocamente con el color de acento.
3. **Optimización de Flujo:** Ningún flujo crítico (ej. registro, subida de pago, reporte de partida) debe requerir pasos innecesarios.
4. **Enfoque Multiplataforma:** La experiencia en móviles tiene la misma importancia que en computadoras de escritorio.
5. **Aislamiento del MVP:** Las funcionalidades futuras del backlog no ocuparán espacio visual ni causarán confusión en el diseño del MVP.
6. **Estados de UI:** Cada pantalla debe contemplar estados de carga, vacío, error, éxito y accesibilidad.
7. **Confirmación de Acciones:** Las acciones irreversibles (descalificar, borrar borrador, finalizar torneo) solicitarán una confirmación obligatoria.

---

# 2. Mapa de Pantallas del MVP

```text
Área Pública
├── Landing Page (Portada)
├── Lista de Torneos
├── Detalle del Torneo (Información, Reglamento)
├── Participantes (Lista de aprobados)
├── Llaves (Bracket interactivo)
├── Resultados (Historial deportivo)
├── Perfil Público del Competidor (Legado)
├── Iniciar Sesión (Login)
├── Crear Cuenta (Registro)
└── Recuperar Contraseña

Área del Competidor (Privado)
├── Dashboard del Competidor
├── Mi Perfil (Información académica)
├── Editar Perfil
├── Mis Juegos (Vinculación de Player Tags)
├── Mis Inscripciones
├── Detalle de Inscripción
├── Subir Comprobante (Yape / Plin)
├── Mis Torneos (Historial y en curso)
├── Mis Medallas (Gamificación)
├── Mi Historial de Partidas
└── Configuración de Privacidad

Área del Organizador (Gestión)
├── Dashboard del Organizador (Indicadores clave)
├── Mis Torneos (Bandeja de gestión)
├── Crear Torneo (Asistente paso a paso)
├── Editar Torneo (Bloqueado post-inscripciones)
├── Participantes (Inbox de inscripciones enviadas)
├── Verificación de Pagos (Inbox de comprobantes)
├── Generar Llaves (Sorteador de Brackets)
├── Gestión de Partidas (Rondas de juego)
├── Registrar Resultado (Marcadores enriquecidos)
├── Finalizar Torneo (Declaración de ganadores)
└── Resumen del Torneo
```

---

# 3. Navegación Pública

### Navbar (Escritorio)
- Logo de Campus Arena (Enlace a Landing).
- Enlaces: Inicio, Torneos, Juegos, Campeones (Hall of Champions).
- CTA 1: Iniciar Sesión (Secundario).
- CTA 2: Registrarse (Primario - Rojo).

### Navbar (Móvil)
- Logo de Campus Arena.
- Acceso rápido a Iniciar Sesión.
- Botón de Menú lateral (Hamburguesa) para acceder a los otros enlaces.

---

# 4. Pantalla: Landing Page

- **Objetivo:** Presentar Campus Arena, destacar los torneos disponibles e invitar al registro de cuentas.
- **Estructura:**
  - *Navbar pública.*
  - *Hero principal:* Título épico ("Construye tu legado"), descripción breve orientada al estudiante, CTA primario ("Explorar torneos") y CTA secundario ("Crear cuenta").
  - *Sección "Cómo funciona":* 4 pasos (Crea tu perfil ➔ Vincula tu juego ➔ Compite ➔ Construye tu historial).
  - *Próximos torneos:* Rejilla con las 3 tarjetas de torneos más cercanas a cerrar inscripciones.
  - *Últimos campeones:* Bloque visual tipo "Hall of Champions" con avatares de ganadores recientes.
  - *Estadísticas de la plataforma:* Contador de participantes registrados, partidas jugadas e instituciones activas.
  - *Llamado final a la acción:* Banner grande con el eslogan de marca y botón de registro.
  - *Footer institucional.*
- **Estado Vacío:** Si no hay torneos disponibles, se muestra: *"La próxima competencia está por comenzar. Crea tu cuenta y prepárate para entrar a la Arena."*

---

# 5. Pantalla: Lista de Torneos

- **Objetivo:** Permitir a visitantes y competidores encontrar torneos disponibles de forma rápida.
- **Elementos:**
  - Buscador textual.
  - Filtro rápido por videojuego (Clash Royale, Brawl Stars).
  - Filtro por estado (Inscripciones abiertas, En curso, Finalizados).
  - Filtro por organización (Tecsup).
  - Rejilla de tarjetas de torneos con paginación fluida.
- **Estados Visibles en las Tarjetas:** `Próximamente`, `Inscripciones abiertas`, `Cupos agotados`, `En curso`, `Finalizado`, `Cancelado`.

---

# 6. Pantalla: Detalle del Torneo

- **Objetivo:** Concentrar toda la información pública, reglamento y estado deportivo del torneo.
- **Estructura:**
  - *Hero de Torneo:* Banner, nombre, tag de estado, cuenta regresiva dinámica, cupos disponibles, costo y botón principal de inscripción.
  - *Menú de Navegación Interna (Pestañas):*
    1. **Información:** Fechas, horarios, formato competitivo, premios distribuidos y contacto del organizador.
    2. **Reglamento:** Reglamento oficial detallado en texto enriquecido.
    3. **Participantes:** Lista de competidores aprobados para jugar.
    4. **Llaves:** Visualización interactiva del Bracket (revelación secuencial).
    5. **Resultados:** Historial de resultados de las partidas jugadas.
- **Estados del Botón Principal de Inscripción:**
  - *Iniciar sesión para inscribirse* (Visitante).
  - *Completar perfil* (Si faltan datos académicos requeridos).
  - *Vincular cuenta de juego* (Si no tiene registrado el Player Tag para ese videojuego).
  - *Inscribirme* (Estado activo por defecto).
  - *Pago pendiente* / *Inscripción en revisión* (Estados de espera).
  - *Confirmado* (Inscripción validada).
  - *Inscripciones cerradas* / *Cupos agotados* (Botón deshabilitado).

---

# 7. Pantalla: Registro

- **Objetivo:** Crear una cuenta en menos de dos minutos.
- **Campos del Formulario:** Nombres, Apellidos, Correo institucional o personal, Contraseña y Confirmar contraseña, Casilla de aceptación de términos de uso.
- **Validaciones en tiempo real:** Correo con formato válido, coincidencia de contraseñas, longitud de contraseña (mínimo 8 caracteres, 1 número, 1 mayúscula).
- **Mensaje Post-Registro:** *"Bienvenido a la Arena. Revisa tu correo para activar tu cuenta."*

---

# 8. Pantalla: Iniciar Sesión

- **Campos:** Correo y Contraseña.
- **Acciones:** Iniciar sesión, Recuperar contraseña, Crear una cuenta nueva.
- **Manejo de Errores:** Mensajes específicos ante credenciales incorrectas, cuenta no verificada (con botón de reenvío de correo), cuenta suspendida o bloqueo por demasiados intentos.

---

# 9. Pantalla: Completar Perfil

- **Objetivo:** Recopilar datos requeridos por la institución del alumno antes de permitir inscripciones.
- **Campos:** Foto de perfil, Código de estudiante, Organización/Institución principal, Sede/Campus, Carrera, Ciclo académico actual, Selección de juegos favoritos.
- **Indicador de Progreso en Cabecera:**
  `[Cuenta creada: ✔] ➔ [Correo verificado: ✔] ➔ [Perfil: En Progreso ⏳] ➔ [Cuenta de juego: Pendiente ⬜]`

---

# 10. Pantalla: Mis Juegos

- **Objetivo:** Administrar las cuentas y Player Tags de videojuegos.
- **Estructura:** Listado de videojuegos con estado de vinculación y campos para agregar identificadores:
  - *Clash Royale / Brawl Stars:* Campo para ingresar el Player Tag (`#XXXXXX`). Al enviar, el sistema muestra el nombre de jugador encontrado (IGN), trofeos y clan/club para validar que la cuenta pertenece al usuario.
- **Estados de Vinculación:** `Sin vincular`, `Validando...`, `Vinculado`, `Error de validación`, `API no disponible`.

---

# 11. Pantalla: Inscripción al Torneo (Asistente Paso a Paso)

- **Objetivo:** Flujo lineal guiado para inscribirse a un torneo.
- **Pasos:**
  1. **Paso 1: Confirmar Perfil:** Verificar nombre, código de estudiante e institución.
  2. **Paso 2: Cuenta del Juego:** Confirmar el Player Tag e IGN que se usará en el torneo.
  3. **Paso 3: Reglamento:** Lectura obligatoria y casilla de aceptación de términos del torneo.
  4. **Paso 4: Pago:** Instrucciones para realizar el pago (monto, número de Yape/Plin o QR).
  5. **Paso 5: Comprobante:** Subida de imagen (PNG/JPG) de la captura de pago y campo opcional para número de operación.
- **Mensaje de Éxito:** *"Recibimos tu inscripción. El organizador revisará el pago antes de confirmar tu participación."*

---

# 12. Pantalla: Detalle de Inscripción

- **Objetivo:** Monitorear el progreso y la validación de la solicitud de inscripción.
- **Elementos:** Estado de la solicitud, detalles del pago cargado, observaciones del organizador y línea de tiempo de progreso:
  `[Solicitud enviada] ➔ [Pago recibido] ➔ [Pago en revisión] ➔ [Inscripción confirmada] ➔ [Esperando sorteo]`

---

# 13. Pantalla: Dashboard del Competidor

- **Objetivo:** Concentrar la actividad del jugador al iniciar sesión.
- **Secciones:**
  - Saludo personalizado con avatar.
  - Tarjeta de "Próximo torneo" (con enlace al bracket o detalles).
  - Listado de inscripciones activas y sus estados.
  - Horarios de próximas partidas programadas.
  - Feed de medallas obtenidas recientemente y actividad del jugador.
  - Accesos rápidos: Buscar torneos, Vincular juegos, Editar perfil.

---

# 14. Pantalla: Perfil Público del Competidor

- **Objetivo:** El legado del jugador visible para la comunidad.
- **Elementos Públicos:** Foto, nombre, organización, carrera, fecha de registro y biografía.
- **Métricas Destacadas:** Participaciones totales, torneos ganados (copas), partidas jugadas, win rate acumulado y galería de medallas obtenidas.
- **Línea de Tiempo:** Camino del competidor (hitos logrados en orden cronológico).
- **Políticas de Privacidad:** Correo, código de estudiante, teléfono e información de pagos nunca serán públicos.

---

# 15. Pantalla: Llaves del Torneo (Bracket)

- **Objetivo:** Navegar e interactuar con el bracket de eliminación simple.
- **Especificaciones de Diseño:**
  - *Escritorio:* Layout horizontal con conectores visuales claros entre las llaves de cada ronda.
  - *Móvil:* Layout filtrable por ronda con scroll lateral fluido y botones para saltar de octavos a cuartos, semifinal y final.
  - Al hacer clic sobre un enfrentamiento (Match Card), se abre una ventana modal con el detalle del enfrentamiento.
- **Estado Pre-Sorteo:** *"Las inscripciones ya cerraron. El sorteo de las llaves se publicará próximamente."*

---

# 16. Pantalla: Detalle de Partida (Modal / Vista)

- **Objetivo:** Detallar el resultado y control de un Matchup en curso o finalizado.
- **Información:** Nombre de la ronda, jugadores enfrentados, fecha y hora de la partida, árbitro a cargo y marcador global (ej: 2 - 1).
- **Lógica Específica de Clash Royale (GameSets):**
  - Desglose de cada partida de la serie (Partida 1, Partida 2, Partida 3).
  - Ganador de cada set, coronas obtenidas, mazos de cartas utilizados por ambos contrincantes y screenshot de evidencia de victoria.
- **Acciones Permitidas al Organizador:** Registrar marcador, editar puntuación, validar captura de pantalla de evidencia, declarar Walkover (W.O.) o descalificar a un jugador.

---

# 17. Dashboard del Organizador

- **Objetivo:** Panel de control para gestionar torneos y temporadas.
- **Indicadores Clave:** Torneos activos, inscripciones en espera, pagos pendientes de verificación, partidas activas por resolver.
- **Acciones Rápidas:** Crear nuevo torneo, Bandeja de pagos por revisar, Administrar brackets.

---

# 18. Pantalla: Crear Torneo (Asistente de Creación)

Formulario de cinco pasos para evitar la sobrecarga visual del organizador:
1. **Paso 1: Información Básica:** Nombre, juego, temporada, descripción y banner.
2. **Paso 2: Fechas:** Apertura y cierre de registros, fecha oficial de la competencia.
3. **Paso 3: Participación:** Costo de inscripción, cupo mínimo y máximo de competidores.
4. **Paso 4: Formato Competitivo:** Tipo de bracket (Eliminación simple), regla de sets (Bo1, Bo3) y tiempo de tolerancia para W.O.
5. **Paso 5: Reglamento:** Subida o redacción de las reglas oficiales y detalle de premios.
- **Guardado:** Permite guardar en borrador (`Draft`) o publicar inmediatamente (`Published`).

---

# 19. Pantalla: Gestión de Participantes

- **Objetivo:** Listado y control de solicitudes de inscripción.
- **Campos:** Nombre del competidor, organización, Player Tag, fecha de envío, estado del pago, estado de participación.
- **Acciones:** Aprobar, rechazar, pedir nueva foto de comprobante, descalificar jugador o mandar a lista de espera.

---

# 20. Pantalla: Verificación de Pagos

- **Objetivo:** Inbox administrativo dedicado exclusivamente a validar comprobantes.
- **Interfaz:** Pantalla dividida. A la izquierda, datos de la inscripción y campos de texto (monto, número de operación). A la derecha, visualizador ampliado con zoom del comprobante de pago subido.
- **Acciones:** Botones de `Aprobar Pago` (mueve inscripción a Confirmada) y `Rechazar Pago` (abre modal para detallar la observación/motivo al alumno).

---

# 21. Pantalla: Generar Llaves (Sorteador)

- **Objetivo:** Crear el emparejamiento oficial y generar el bracket.
- **Opciones de Sorteo:** Aleatorio, Manual.
- **Vista Previa:** Muestra el bracket borrador antes de hacerlo público. El organizador puede barajar de nuevo (`Volver a sortear`) o mover las posiciones.
- **Publicación:** Al confirmar, el torneo cambia al estado `In Progress` y se bloquea el bracket.

---

# 22. Pantalla: Gestión de Partidas

- **Objetivo:** Tablero de control de enfrentamientos activos por ronda para el organizador.
- **Filtros rápidos:** Pendientes de jugar, En curso, Pendientes de resultado (esperando registrar marcador), Finalizadas.

---

# 23. Pantalla: Registrar Resultado

- **Objetivo:** Formulario para reportar los marcadores oficiales de una llave.
- **Campos:** Ganador del match, marcador final, y desglose de coronas, mazos y capturas de victoria para cada GameSet.
- **Validaciones:** El sistema bloquea el envío si el marcador no coincide con el ganador o si se intentan reportar más sets de los establecidos por la configuración del torneo (ej: reportar 4 partidas en un Bo3).

---

# 24. Pantalla: Finalizar Torneo

- **Objetivo:** Concluir el evento competitivo y actualizar el histórico.
- **Validaciones del Sistema:** Bloquear el botón si existen partidas pendientes de jugar, resultados sin registrar o disputas abiertas.
- **Efectos al Finalizar:**
  - Asignar campeonatos y podios.
  - Otorgar automáticamente las medallas a los participantes.
  - Actualizar el legado competitivo en los perfiles de los jugadores.
  - Mover el torneo al estado `Archived` e inhabilitar modificaciones de brackets o resultados.
