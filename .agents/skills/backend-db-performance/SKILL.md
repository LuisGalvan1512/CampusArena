---
name: backend-db-performance
description: >-
  Backend and database performance optimization for NestJS, Prisma ORM, and PostgreSQL (Supabase).
  Use this skill when designing APIs, creating or optimizing database schemas/migrations, writing Prisma queries,
  implementing transactions, avoiding N+1 bottlenecks, or tuning backend response times.
---

# Backend & Database Performance (Campus Arena)

Este estándar define las mejores prácticas para que la API en **NestJS** y la base de datos en **PostgreSQL (Supabase)** vía **Prisma ORM** respondan en milisegundos, soporten picos de concurrencia durante torneos en vivo y mantengan la integridad transaccional.

---

## 1. Optimización de Consultas en Prisma (Anti-N+1)

### Prohibido el patrón N+1
- ❌ **Nunca ejecutes consultas dentro de un bucle `map` o `forEach`:**
  ```typescript
  // ❌ ANTI-PATRÓN: N consultas adicionales a la BD
  const tournaments = await prisma.tournament.findMany();
  const withParticipants = await Promise.all(
    tournaments.map(t => prisma.registration.count({ where: { tournament_id: t.id } }))
  );
  ```
- ✅ **Usa relaciones agrupadas o agregaciones directas:**
  ```typescript
  // ✅ CORRECTO: 1 sola consulta eficiente
  const tournaments = await prisma.tournament.findMany({
    include: {
      _count: {
        select: { registrations: true }
      }
    }
  });
  ```

### Proyección Selectiva (`select` vs `include`)
- Nunca traigas todas las columnas si solo necesitas un subconjunto (ej. al listar torneos no traigas las reglas largas en markdown de 20KB).
- **Seguridad y Payload:** Jamás selecciones `password_hash`, tokens de sesión o datos sensibles en endpoints públicos. Usa `select` explícito.

---

## 2. Índices y Modelado en PostgreSQL

### Índices Obligatorios para Campus Arena
En el esquema de Prisma (`schema.prisma`), toda columna que participe en `WHERE`, `JOIN` o `ORDER BY` frecuente debe tener un índice `@index`:
- `tournament_id` y `status` en `registrations` (`@@index([tournament_id, status])`).
- `user_id` en tablas de relación (`registrations`, `signatures`, `appeals`).
- `game_code` y `status` en `tournaments`.
- `created_at` en muros de firmas y publicaciones de comunidad para paginación rápida.

---

## 3. Transacciones Atómicas Seguras (`$transaction`)

Para operaciones críticas de torneos donde participan múltiples tablas:
1. **Inscripción con creación de equipo/roster.**
2. **Generación automática de brackets (sorteo de llaves y matchups).**
3. **Aprobación de pagos y confirmación de cupo.**

Usa siempre transacciones interactivas para evitar estados inconsistentes (ej. cupo descontado sin registro creado):
```typescript
await this.prisma.$transaction(async (tx) => {
  // 1. Validar cupos disponibles con bloqueo si aplica
  // 2. Crear registro
  // 3. Crear miembros del roster
  // 4. Emitir notificación in-app
});
```

---

## 4. Pool de Conexiones y Resiliencia en Supabase

- **Connection Pooler:** En entornos de producción y serverless, usa el pooler de Supabase (puerto 6543 en modo `transaction` para queries cortas) para evitar agotar las conexiones máximas de PostgreSQL.
- **Timeouts:** Configura timeouts explícitos en llamadas a APIs externas (Supercell, Steam, Brevo SMTP) para que un servicio de terceros caído nunca congele la API de Campus Arena.
- **DTOs y Validación Rápida:** Usa `ValidationPipe({ transform: true, whitelist: true })` para descartar payloads maliciosos o pesados antes de tocar la base de datos.
