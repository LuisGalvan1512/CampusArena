# Campus Arena

## Domain Model v1.0

**Propósito:** Definir el lenguaje del negocio, las entidades principales, sus responsabilidades y las relaciones entre ellas. Este documento es independiente de cualquier tecnología o lenguaje de programación.

---

# 1. Lenguaje Ubicuo (Ubiquitous Language)

Todos los miembros del equipo utilizarán los mismos términos.

| Término         | Definición                                                                            |
| --------------- | ------------------------------------------------------------------------------------- |
| Competidor      | Persona registrada que participa en torneos.                                          |
| Organizador     | Usuario autorizado para crear y gestionar torneos dentro de una organización.         |
| Administrador   | Responsable de administrar una organización o la plataforma.                          |
| Organización    | Institución o comunidad que organiza torneos (Tecsup, UPC, empresa, comunidad, etc.). |
| Temporada       | Conjunto de torneos agrupados dentro de un periodo determinado.                       |
| Torneo          | Competencia oficial de un juego.                                                      |
| Juego           | Videojuego disponible dentro de la plataforma.                                        |
| Inscripción     | Solicitud de participación de un competidor en un torneo.                             |
| Pago            | Evidencia y estado del pago de una inscripción.                                       |
| Bracket (Llave) | Estructura eliminatoria o competitiva del torneo.                                     |
| Partida         | Enfrentamiento entre dos competidores o equipos.                                      |
| Resultado       | Resultado oficial de una partida.                                                     |
| Medalla         | Reconocimiento otorgado por participación o logros.                                   |
| Logro           | Distinción especial obtenida por un competidor.                                       |
| Legado          | Historial competitivo completo del competidor.                                        |

---

# 2. Dominios Principales

Campus Arena se divide en nueve dominios de negocio.

- Identidad
- Competencia
- Organización
- Comunidad
- Estadísticas
- Administración
- Contenido
- Integraciones
- Infraestructura

Cada dominio podrá evolucionar de forma independiente.

---

# 3. Dominio: Identidad

Este dominio responde a una pregunta:

**¿Quién eres dentro de Campus Arena?**

## Entidades

- Competidor
- Perfil
- Cuenta
- Juego Favorito
- Cuenta de Juego
- Configuración
- Medallas
- Logros
- Legado

### Responsabilidades

- Registro.
- Inicio de sesión.
- Gestión del perfil.
- Vinculación de cuentas de juego.
- Historial personal.
- Estadísticas personales.

---

# 4. Dominio: Competencia

Responde a:

**¿Cómo se desarrolla un torneo?**

## Entidades

- Temporada
- Torneo
- Categoría
- Reglamento
- Inscripción
- Pago
- Bracket
- Ronda
- Partida
- Resultado
- Campeón

### Responsabilidades

- Crear torneos.
- Gestionar inscripciones.
- Sortear llaves.
- Registrar partidas.
- Publicar resultados.
- Determinar campeones.

---

# 5. Dominio: Organización

Responde a:

**¿Quién organiza las competencias?**

## Entidades

- Organización
- Campus
- Administradores
- Organizadores
- Staff
- Árbitros
- Sponsors (futuro)

### Responsabilidades

- Gestionar torneos.
- Administrar temporadas.
- Publicar noticias.
- Gestionar miembros del staff.

---

# 6. Dominio: Comunidad

Responde a:

**¿Cómo interactúan los competidores?**

## Entidades

- Noticias
- Feed
- Comentarios (futuro)
- Reacciones (futuro)
- Hall of Champions
- Archivo Histórico

### Responsabilidades

- Mostrar actividad.
- Difundir novedades.
- Preservar la historia.
- Destacar campeones.

---

# 7. Dominio: Estadísticas

Responde a:

**¿Cómo medimos el desempeño?**

## Entidades

- Estadísticas del Competidor
- Estadísticas del Torneo
- Récords
- Historial
- Participaciones

### Responsabilidades

- Calcular indicadores.
- Generar rankings.
- Mostrar evolución.
- Construir el legado.

---

# 8. Dominio: Administración

Entidades:

- Usuario Administrativo
- Roles
- Permisos
- Auditoría
- Logs
- Configuración Global

Responsabilidades:

- Seguridad.
- Moderación.
- Gestión de permisos.
- Configuración de la plataforma.

---

# 9. Dominio: Contenido

Entidades:

- Noticias
- Banners
- Galería
- Reglamentos
- Preguntas Frecuentes

Responsabilidades:

- Mantener la información pública.
- Gestionar recursos multimedia.
- Comunicar eventos.

---

# 10. Dominio: Integraciones

Entidades lógicas:

- API Clash Royale
- API Brawl Stars
- Correo electrónico
- Notificaciones
- Pasarela de pago (futuro)

Responsabilidades:

- Obtener información de juegos.
- Enviar correos.
- Sincronizar datos externos.

---

# 11. Dominio: Infraestructura

Responsabilidades:

- Autenticación.
- Almacenamiento.
- Seguridad.
- Monitoreo.
- Copias de seguridad.

---

# 12. Relaciones de Alto Nivel

```
Organización
      │
      ├── organiza ─────────► Temporada
      │                           │
      │                           ├── contiene ─────► Torneos
      │                                                 │
      │                                                 ├── reciben ──► Inscripciones
      │                                                 │                   │
      │                                                 │                   ├── tienen ─► Pago
      │                                                 │
      │                                                 ├── generan ─────► Bracket
      │                                                 │                   │
      │                                                 │                   └── contiene ─► Partidas
      │                                                 │                                   │
      │                                                 │                                   └── producen ─► Resultados
      │
Competidor ────────────────────────────────────────────────────────────────┘
      │
      ├── posee ─► Perfil
      ├── vincula ─► Cuentas de Juego
      ├── obtiene ─► Medallas
      ├── consigue ─► Logros
      └── construye ─► Legado
```

---

# 13. Reglas Fundamentales del Negocio

1. Un competidor puede pertenecer a varias organizaciones.
2. Una organización puede tener múltiples temporadas.
3. Una temporada contiene varios torneos.
4. Un torneo pertenece a una sola temporada.
5. Un competidor solo puede inscribirse una vez por torneo.
6. Una inscripción requiere un estado de pago.
7. Solo las inscripciones aprobadas participan en el sorteo.
8. El bracket se genera únicamente cuando cierran las inscripciones.
9. Cada partida genera un resultado oficial.
10. Todo torneo finalizado pasa al Archivo Histórico y forma parte del legado de sus participantes.

---

# 14. Principios del Dominio

- El competidor es el centro del sistema.
- Ningún dato histórico se elimina.
- Todo torneo deja un registro permanente.
- Las organizaciones son independientes entre sí.
- El modelo debe soportar múltiples juegos.
- El modelo debe ser escalable y extensible.

---

# 15. Evolución del Dominio

Este modelo está preparado para incorporar en el futuro:

- Equipos.
- Ligas.
- Clasificatorias.
- Árbitros avanzados.
- Streaming.
- Inteligencia Artificial.
- APIs públicas.
- Organizaciones internacionales.
- Aplicaciones móviles.

La incorporación de estas funciones no debe requerir rediseñar el dominio existente, sino extenderlo respetando los principios definidos.
