# Campus Arena

## UX Blueprint & User Journey v1.0

### Propósito
Definir la experiencia completa del usuario en Campus Arena, mapeando el recorrido emocional y funcional de tres perfiles clave (Competidor, Organizador y Administrador). Establece los momentos "WOW" y los principios de experiencia (UX) que guiarán el diseño de la interfaz.

---

# 1. User Personas

## USER PERSONA 1: Luis (Competidor)
- **Edad:** 19 años
- **Estudia:** Tecsup
- **Juega:** Clash Royale, Brawl Stars
- **Objetivo:** Participar en torneos fácilmente.
- **Necesidades (Quiere):**
  - Registrarse rápido.
  - Saber cuándo juega.
  - Ver las llaves.
  - Tener historial.
  - Mostrar sus logros.
- **Frustraciones actuales:**
  - Formularios de Google.
  - Pagos por WhatsApp.
  - No saber si quedó inscrito.
  - Llaves enviadas como imágenes.
  - Resultados desordenados.

### Recorrido de Luis
```
Instagram
   │
   ▼
Ve un anuncio
   │
   ▼
Entra a Campus Arena
   │
   ▼
Explora el torneo
   │
   ▼
Ve premios e información
   │
   ▼
Ve reglamento
   │
   ▼
Decide participar
   │
   ▼
Crea su cuenta
   │
   ▼
Verifica correo
   │
   ▼
Completa perfil
   │
   ▼
Vincula Clash Royale
   │
   ▼
Se inscribe al torneo
   │
   ▼
Sube comprobante de pago
   │
   ▼
Espera aprobación
   │
   ▼
Recibe notificación
   │
   ▼
Inscripción aceptada
   │
   ▼
Cuenta regresiva para el torneo
   │
   ▼
Sorteo automático
   │
   ▼
Se publican las llaves
   │
   ▼
Consulta su rival
   │
   ▼
Juega la partida
   │
   ▼
Se registra el resultado
   │
   ▼
Obtiene una medalla
   │
   ▼
Comparte su logro
   │
   ▼
Regresa para el siguiente torneo
```

### Recorrido Emocional de Luis
| Etapa | Emoción | Oportunidad de diseño |
| :--- | :--- | :--- |
| **Descubre el torneo** | Curiosidad | Hero atractivo y premios sumamente visibles. |
| **Registro** | Motivación | Formulario corto, directo y claro. |
| **Pago** | Duda | Confirmación inmediata y estado de validación visible. |
| **Espera** | Expectativa | Cuenta regresiva dinámica y barra de progreso de inscripción. |
| **Llaves** | Emoción | Animación fluida de revelación de emparejamientos. |
| **Partida** | Nervios | Informacion de rival y canal de comunicación claros y accesibles. |
| **Resultado** | Alegría / Frustración | Mensajes positivos, reconocimiento al esfuerzo y próximos pasos. |
| **Historial** | Orgullo | Perfil legado que muestre su evolución y logros en la arena. |

---

## USER PERSONA 2: Andrea (Organizadora)
- **Objetivo:** Crear y gestionar torneos de forma eficiente y automatizada.
- **Herramientas actuales:** Google Forms, Excel, WhatsApp, Challonge.
- **Problemas:**
  - Revisión manual de pagos (pérdida de tiempo y errores).
  - Elaboración manual de listas de participantes.
  - Creación y actualización de llaves de forma manual.
  - Complejidad para compartir resultados actualizados con la comunidad.
- **Propósito en Campus Arena:** Reducir la carga operativa automatizando el flujo de registro, validación y gestión de bracket.

### Recorrido de Andrea
```
Login
   │
   ▼
Dashboard de Organizador
   │
   ▼
Crear Temporada
   │
   ▼
Crear Torneo
   │
   ▼
Configurar reglas y categoría
   │
   ▼
Abrir inscripciones
   │
   ▼
Revisar y validar pagos (Inbox centralizado)
   │
   ▼
Aprobar participantes
   │
   ▼
Cerrar inscripciones
   │
   ▼
Generar llaves (Bracket automático)
   │
   ▼
Registrar resultados de partidas
   │
   ▼
Publicar campeón del torneo
   │
   ▼
Archivar torneo en el Histórico
```

---

## USER PERSONA 3: Carlos (Administrador)
- **Objetivo:** Moderar y mantener la plataforma estable y segura a nivel global.
- **Responsabilidades:**
  - Gestionar usuarios y roles.
  - Crear e integrar nuevas organizaciones.
  - Moderar contenido público.
  - Revisar estadísticas generales y analíticas de la plataforma.
  - Gestionar el catálogo de juegos disponibles.
  - Consultar logs de auditoría y seguridad.

---

# 2. Momentos "WOW" (Diferenciadores Clave)

1. **Bienvenida Épica:** Al finalizar el registro, en lugar de un "Registro exitoso", se muestra un mensaje inspirador: *"Bienvenido a la Arena. Tu historia comienza hoy."*
2. **Sorteo Animado:** La generación del bracket no es un simple refresco de pantalla o PDF. Se implementa una animación donde las posiciones de los competidores se sortean y revelan en vivo.
3. **Legado Evolutivo:** Al finalizar un torneo, el perfil del competidor se actualiza automáticamente con sus nuevas estadísticas, medallas obtenidas, récord y un indicador de progreso hacia el siguiente logro.
4. **Memoria Histórica Activa:** Las páginas de torneos finalizados nunca desaparecen; se archivan de manera rica con estadísticas de partidas, fotos de los ganadores y llaves interactivas para consulta eterna.

---

# 3. Principios de Experiencia (UX Principles)

1. **Feedback Inmediato:** Cada acción del usuario tiene una respuesta clara. Si sube un comprobante, el sistema notifica que fue recibido y está en validación.
2. **Siguiente Paso Claro:** El usuario nunca debe adivinar qué hacer después; siempre hay un Call-to-Action o mensaje indicando la siguiente acción sugerida.
3. **Visibilidad de Progreso:** Los flujos complejos (como las inscripciones) muestran visualmente los pasos completados, actuales y pendientes:
   `[✔ Cuenta creada] ➔ [✔ Perfil completo] ➔ [✔ Pago enviado] ➔ [⏳ Verificación] ➔ [⬜ Confirmado]`
4. **Interfaz Viva:** Implementar transiciones suaves, micro-animaciones fluidas y actualizaciones en tiempo real para evitar la sensación de una web estática.
5. **Construcción de Legado:** Cada interacción debe evocar progreso. El competidor no solo participa en torneos aislados, sino que alimenta su historial y reputación competitiva.
