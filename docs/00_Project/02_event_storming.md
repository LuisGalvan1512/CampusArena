# Campus Arena

## Event Storming v1.0

### ¿Qué es un Event Storming?

Un Event Storming describe todos los eventos importantes que ocurren en el negocio, en el orden en que suceden.

Cada evento representa un cambio de estado dentro del sistema.

Ejemplo:
- Un competidor se registra.
- Un pago es aprobado.
- Se generan las llaves.
- Se registra un campeón.

No hablamos de pantallas ni de tablas. Hablamos del funcionamiento real del producto.

---

# Flujo Principal

```
Visitante
   │
   ▼
Crea una cuenta
   │
   ▼
Verifica su correo
   │
   ▼
Completa su perfil
   │
   ▼
Vincula sus cuentas de juego
   │
   ▼
Explora torneos
   │
   ▼
Se inscribe
   │
   ▼
Realiza el pago
   │
   ▼
Pago verificado
   │
   ▼
Inscripción confirmada
   │
   ▼
Cierran las inscripciones
   │
   ▼
Se generan las llaves
   │
   ▼
Comienza el torneo
   │
   ▼
Se juegan las partidas
   │
   ▼
Se registran resultados
   │
   ▼
Se determina un campeón
   │
   ▼
Se otorgan medallas
   │
   ▼
Se actualiza el legado
   │
   ▼
El torneo pasa al Archivo Histórico
```

---

# Dominio: Autenticación

## Evento: Competidor registrado
Provoca:
- Creación de cuenta.
- Envío de correo de verificación.

---

## Evento: Correo verificado
Provoca:
- Activación de la cuenta.

---

## Evento: Perfil completado
Provoca:
- El usuario puede inscribirse en torneos.

---

# Dominio: Juegos

## Evento: Cuenta de juego vinculada
Provoca:
- Validación del Player Tag.
- Sincronización de información (cuando exista integración oficial).

---

# Dominio: Torneos

- **Evento:** Torneo creado.
- **Evento:** Torneo publicado.
- **Evento:** Inscripciones abiertas.
- **Evento:** Competidor inscrito.
- **Evento:** Pago recibido.
- **Evento:** Pago aprobado.
- **Evento:** Inscripción confirmada.
- **Evento:** Inscripciones cerradas.
- **Evento:** Llaves generadas.
- **Evento:** Torneo iniciado.
- **Evento:** Ronda iniciada.
- **Evento:** Partida finalizada.
- **Evento:** Resultado registrado.
- **Evento:** Ronda finalizada.
- **Evento:** Campeón definido.
- **Evento:** Torneo finalizado.
- **Evento:** Archivo histórico actualizado.

---

# Dominio: Medallas

## Evento: Competidor obtiene medalla
Provoca:
- Actualización del perfil.
- Actualización del legado.

---

# Dominio: Legado

- **Evento:** Participación registrada.
- **Evento:** Victoria registrada.
- **Evento:** Derrota registrada.
- **Evento:** Nuevo campeonato obtenido.
- **Evento:** Récord actualizado.

---

# Dominio: Organización

- **Evento:** Nueva temporada creada.
- **Evento:** Organizadores asignados.
- **Evento:** Noticias publicadas.
- **Evento:** Nueva edición iniciada.

---

# Dominios Futuros

## Streaming
- **Evento:** Streaming iniciado.
- **Evento:** Streaming finalizado.

## IA
- **Evento:** IA genera resumen del torneo.
- **Evento:** Resumen publicado.

## Equipos
- **Evento:** Equipo creado.
- **Evento:** Jugador agregado.
- **Evento:** Equipo inscrito.
- **Evento:** Equipo campeón.

---

# Reglas de Negocio

- No puede existir una inscripción sin un competidor.
- No puede existir un pago sin una inscripción.
- No puede existir un resultado sin una partida.
- No puede existir una partida sin una llave.
- No puede existir una llave sin un torneo.
- No puede existir un torneo sin una temporada.
- No puede existir una temporada sin una organización.

---

# Eventos Críticos

Los siguientes eventos nunca deben perderse:
- Registro de competidor.
- Pago aprobado.
- Llaves generadas.
- Resultado registrado.
- Campeón definido.
- Medalla otorgada.

Estos eventos forman parte permanente del historial competitivo de la plataforma.

---

# Principios

- Todo cambio importante genera un evento.
- Los eventos construyen la historia del competidor.
- Ningún evento histórico debe eliminarse.
- El sistema debe ser capaz de reconstruir el historial completo de un torneo a partir de sus eventos.
