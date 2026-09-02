# Campus Arena

## Information Architecture v1.0

### Principios de Diseño

Toda la arquitectura de Campus Arena se basa en cinco principios:

1. La navegación debe ser intuitiva.
2. Ninguna funcionalidad importante debe requerir más de tres clics desde el Dashboard.
3. El competidor siempre será el centro de la experiencia.
4. La plataforma debe escalar sin modificar la navegación principal.
5. Cada usuario verá únicamente aquello que necesita.

---

# 1. Tipos de Usuarios

## Visitante
No necesita iniciar sesión.

Puede:
- Ver la Landing.
- Explorar juegos.
- Explorar torneos públicos.
- Consultar el Hall of Champions.
- Leer noticias.
- Ver organizaciones.
- Crear una cuenta.

---

## Competidor
Puede:
- Administrar su perfil.
- Inscribirse a torneos.
- Consultar resultados.
- Ver sus medallas.
- Consultar su legado.
- Seguir su actividad.

---

## Organizador
Además de lo anterior:
- Crear torneos.
- Gestionar inscripciones.
- Aprobar pagos.
- Generar llaves.
- Registrar resultados.
- Publicar noticias.
- Administrar temporadas.

---

## Administrador
Control total de la plataforma.

---

# 2. Navegación Principal

```text
Campus Arena

├── Inicio
├── Torneos
├── Juegos
├── Organizaciones
├── Hall of Champions
├── Noticias
├── Acerca de
└── Iniciar sesión
```

Cuando el usuario inicia sesión:

```text
Campus Arena

├── Dashboard
├── Torneos
├── Juegos
├── Mi Perfil
├── Mi Legado
├── Comunidad
├── Notificaciones
└── Configuración
```

---

# 3. Landing Page

```text
Landing
   │
   ├── Hero
   ├── CTA Principal
   ├── Próximos Torneos
   ├── Juegos
   ├── Organizaciones
   ├── Hall of Champions
   ├── Estadísticas Globales
   ├── Cómo Funciona
   ├── Testimonios
   ├── FAQ
   └── Footer
```

---

# 4. Dashboard del Competidor

```text
Dashboard
   │
   ├── Bienvenida
   ├── Próximo Torneo
   ├── Mis Inscripciones
   ├── Actividad Reciente
   ├── Medallas
   ├── Camino del Competidor
   ├── Noticias
   ├── Estadísticas
   └── Accesos Rápidos
```

---

# 5. Perfil del Competidor

```text
Mi Perfil
   │
   ├── Información Personal
   ├── Foto
   ├── Biografía
   ├── Juegos Favoritos
   ├── Cuentas de Juego
   ├── Historial
   ├── Medallas
   ├── Logros
   ├── Estadísticas
   ├── Participaciones
   ├── Configuración
   └── Privacidad
```

---

# 6. Módulo de Torneos

```text
Torneos
   │
   ├── Todos
   ├── Próximos
   ├── En Curso
   ├── Finalizados
   ├── Mis Torneos
   └── Históricos
```

Cada torneo contiene:

```text
Detalle
   │
   ├── Información
   ├── Reglamento
   ├── Premios
   ├── Participantes
   ├── Inscripción
   ├── Llaves
   ├── Partidas
   ├── Resultados
   ├── Galería
   └── Estadísticas
```

---

# 7. Módulo de Juegos

```text
Juegos
   │
   ├── Clash Royale
   ├── Brawl Stars
   ├── EA FC
   ├── Valorant
   ├── Rocket League
   └── Próximamente
```

Cada juego posee:

```text
Juego
   │
   ├── Descripción
   ├── Torneos
   ├── Campeones
   ├── Estadísticas
   ├── Reglas
   └── Noticias
```

---

# 8. Hall of Champions

```text
Hall of Champions
   │
   ├── Temporadas
   ├── Juegos
   ├── Campeones
   ├── MVP
   ├── Récords
   └── Galería
```

---

# 9. Archivo Histórico

```text
Archivo Histórico
   │
   ├── Año
   ├── Temporada
   ├── Torneo
   ├── Llaves
   ├── Partidas
   ├── Resultados
   ├── Campeones
   ├── Estadísticas
   └── Multimedia
```

---

# 10. Comunidad

```text
Comunidad
   │
   ├── Feed
   ├── Noticias
   ├── Actividad
   ├── Reconocimientos
   └── Próximos Eventos
```

---

# 11. Panel del Organizador

```text
Dashboard Organizador
   │
   ├── Mis Torneos
   ├── Crear Torneo
   ├── Temporadas
   ├── Inscripciones
   ├── Pagos
   ├── Llaves
   ├── Resultados
   ├── Noticias
   ├── Reportes
   └── Configuración
```

---

# 12. Panel del Administrador

```text
Administración
   │
   ├── Usuarios
   ├── Organizaciones
   ├── Juegos
   ├── Torneos
   ├── Temporadas
   ├── Roles
   ├── Permisos
   ├── Moderación
   ├── Auditoría
   ├── Configuración Global
   └── Analytics
```

---

# 13. Navegación Secundaria

Cada módulo mantiene una navegación consistente:
- Breadcrumbs (Inicio > Torneos > Clash Royale > Final).
- Buscador global.
- Filtros.
- Ordenamiento.
- Acciones rápidas.

---

# 14. Reglas de Navegación

- El usuario siempre sabe dónde está.
- Nunca se pierde el contexto.
- Las acciones importantes están visibles.
- La navegación es consistente entre escritorio y móvil.
- El diseño prioriza claridad antes que cantidad de opciones.

---

# 15. Preparación para Escalabilidad

La arquitectura permite añadir nuevos módulos sin modificar la navegación principal.
Ejemplos:
- Equipos.
- Ligas.
- Marketplace.
- Streaming.
- IA.
- API Pública.

Estos aparecerán como módulos independientes conectados a la estructura existente.
