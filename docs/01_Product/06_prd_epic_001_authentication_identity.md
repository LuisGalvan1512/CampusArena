# Campus Arena

## Product Requirements Document (PRD)
### Épica 001 — Autenticación e Identidad

- **Versión:** 1.0
- **Estado:** Aprobado para diseño
- **Prioridad:** Crítica

---

# Objetivo
Permitir que cualquier estudiante pueda crear una cuenta, verificar su identidad básica, iniciar sesión y administrar su perfil de manera segura para participar en torneos. Este módulo es la puerta de entrada a Campus Arena.

---

# Problema
Actualmente los torneos suelen gestionarse mediante formularios, grupos de WhatsApp y hojas de cálculo. Esto provoca:
- Suplantación de identidad.
- Participantes duplicados.
- Dificultad para contactar jugadores.
- Falta de historial.
- Mala experiencia general.

Campus Arena solucionará este problema mediante una cuenta única para cada competidor.

---

# Objetivos de Negocio
- Tener un único perfil por competidor.
- Reducir inscripciones falsas.
- Centralizar el historial.
- Facilitar futuras participaciones.
- Construir el legado competitivo del usuario.

---

# Actores

## Visitante
- **Puede:** Explorar la plataforma, registrarse.
- **No puede:** Inscribirse a torneos, comentar, participar.

## Competidor
- **Puede:** Iniciar sesión, editar su perfil, vincular cuentas de juego, inscribirse a torneos, consultar su historial competitivo.

## Administrador
- **Puede:** Suspender cuentas, restablecer contraseñas, gestionar usuarios.

---

# Historias de Usuario

### HU-001: Registro de Cuenta
Como **visitante**,  
quiero **crear una cuenta**,  
para **poder participar en torneos**.

### HU-002: Verificación de Correo
Como **competidor**,  
quiero **verificar mi correo**,  
para **asegurar que mi cuenta es válida**.

### HU-003: Inicio de Sesión
Como **competidor**,  
quiero **iniciar sesión**,  
para **acceder a mi perfil y mis torneos**.

### HU-004: Recuperación de Contraseña
Como **competidor**,  
quiero **recuperar mi contraseña**,  
para **no perder el acceso a mi cuenta**.

### HU-005: Edición de Perfil
Como **competidor**,  
quiero **editar mi perfil**,  
para **mantener mi información actualizada**.

### HU-006: Vinculación de Cuentas de Juego
Como **competidor**,  
quiero **vincular mis cuentas de juego**,  
para **participar en torneos sin tener que volver a escribir mis datos**.

---

# Flujo Principal

```text
Landing
   │
   ▼
Crear cuenta
   │
   ▼
Verificar correo
   │
   ▼
Completa tu perfil
   │
   ▼
Seleccionar juegos favoritos
   │
   ▼
Vincular cuentas de juego (Clash Royale / Brawl Stars Player Tags)
   │
   ▼
Dashboard de Competidor
```

---

# Datos Solicitados

## Registro
- Nombre.
- Apellidos.
- Correo institucional o personal.
- Contraseña.
- Confirmación de contraseña.

*No se solicitarán datos innecesarios durante el registro.*

## Perfil
- Foto de perfil.
- Código de estudiante (opcional al inicio, obligatorio para torneos de instituciones que lo requieran).
- Organización (ejemplo: Tecsup).
- Carrera.
- Ciclo.
- Sede.
- Juegos favoritos.
- Biografía (opcional).

## Cuentas de Juego
- **Para Clash Royale:** Player Tag.
- **Para Brawl Stars:** Player Tag.

*En el futuro podrán añadirse otros juegos sin modificar la estructura principal.*

---

# Reglas de Negocio

- **RN-001:** Un correo solo puede estar asociado a una cuenta.
- **RN-002:** Un competidor solo puede tener un perfil.
- **RN-003:** Las contraseñas nunca se almacenan en texto plano (cifrado obligatorio).
- **RN-004:** El correo debe verificarse antes de permitir inscripciones.
- **RN-005:** Los Player Tag deben ser únicos por juego.
- **RN-006:** Un competidor puede vincular múltiples juegos.
- **RN-007:** El usuario puede cambiar su foto de perfil en cualquier momento.
- **RN-008:** La organización principal podrá modificarse si el usuario cambia de institución.

---

# Casos Límite
- Correo ya registrado.
- Contraseña incorrecta.
- Enlace de verificación expirado.
- Player Tag inexistente en el juego.
- Player Tag ya asociado a otro usuario.
- Sesión expirada.
- Bloqueo por demasiados intentos fallidos de inicio de sesión.

---

# Criterios de Aceptación
- El registro debe completarse en menos de dos minutos.
- El inicio de sesión no debe requerir más de dos pasos.
- El usuario debe poder editar su perfil sin intervención del administrador.
- Todas las acciones importantes (registro exitoso, cambios guardados) deberán mostrar confirmación visual.

---

# Requisitos No Funcionales
- Contraseñas cifradas con algoritmo robusto (ej: bcrypt).
- Autenticación mediante JWT con Refresh Token.
- Protección contra ataques de fuerza bruta (rate limiting).
- Validación de esquemas en todos los formularios (frontend y backend).
- Sesiones seguras.
- Diseño totalmente responsivo (móvil y escritorio).
- Cumplimiento de accesibilidad WCAG AA.

---

# Métricas
- Tiempo promedio de registro.
- Porcentaje de correos verificados.
- Tiempo promedio de inicio de sesión.
- Usuarios activos diarios/mensuales.
- Tasa de abandono durante el registro.

---

# Dependencias
Este módulo es un requisito obligatorio para el funcionamiento de:
- Perfil.
- Torneos.
- Inscripciones.
- Medallas.
- Historial.
- Notificaciones.
