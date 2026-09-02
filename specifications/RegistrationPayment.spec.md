# Campus Arena — Specifications Pack

# Specification: Registration & Payment Flow (RegistrationPayment.spec.md) v1.0

- **Contexto:** Dominios de Registro (`registration` schema) y Pagos (`payment` schema).
- **Dependencias:** Auth, Profile, Tournament, Organization, Storage, Notifications, Audit, Competition Engine.
- **Sustento de Diseño:**
  - Glosario Ubicuo: [Project_Glossary.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/00_Project/Project_Glossary.md)
  - Especificaciones UI de Pantallas: [13_mvp_wireframes_specification.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/03_UX/13_mvp_wireframes_specification.md#L159) (Secciones 11 y 12) y [13_mvp_wireframes_specification.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/03_UX/13_mvp_wireframes_specification.md#L329) (Sección 20)
  - Reglas del Ecosistema IA: [AI_Database_Rules.md](file:///c:/Users/Luis%20Galvan/Documents/Expe/CampusArena/docs/08_AI/AI_Database_Rules.md)

---

# 1. Objetivo del Módulo
Definir de forma autocontenida y ejecutable el proceso mediante el cual un competidor solicita participar en un torneo, utiliza una cuenta de juego vinculada, acepta el reglamento, realiza el pago de inscripción, carga un comprobante y espera la validación de un organizador autorizado.

---

# 2. Alcance del MVP & Exclusiones

### ✅ Incluido en el MVP
- Solicitud de inscripción individual (una inscripción por competidor y torneo).
- Confirmación de una cuenta de juego previamente vinculada (Clash Royale / Brawl Stars).
- Aceptación explícita y versionada del reglamento del torneo.
- Pago manual por transferencia bancaria (Yape, Plin o cuenta bancaria) con carga de captura (comprobante).
- Inbox del organizador para aprobar, rechazar o solicitar corrección de comprobantes.
- Reservación de cupo transaccional al momento de la **aprobación del pago**.
- Entrada automática a lista de espera si el cupo se llena mientras se revisa el pago.
- Auditoría histórica en cada cambio de estado o revisión.

### ❌ Excluido del MVP (Backlog)
- Pasarelas automáticas de pago (Stripe, Culqi, Mercado Pago).
- Devolución automatizada de dinero.
- Inscripción por equipos (2vs2, 5vs5).
- Descuentos por cupones o inscripciones gratuitas patrocinadas.
- Transferencia de cupos entre competidores.
- Lectura u OCR automático de comprobantes (Google Vision API).

---

# 3. Principios Obligatorios
1. **Unicidad:** Un competidor solo puede poseer una solicitud de inscripción activa (estados no finales) por torneo.
2. **Sin Garantías:** El inicio del proceso de inscripción o la subida de evidencia de pago no reserva cupo; la reserva solo se confirma al aprobarse el pago.
3. **Inmutabilidad y Auditoría:** Toda aprobación de pago congela el monto y la referencia de la operación. Ningún registro se edita ni elimina sin dejar un rastro en `AuditLog`.
4. **Privacidad de Evidencias:** Los comprobantes de pago subidos son privados y accesibles únicamente por el organizador y el competidor propietario mediante URLs firmadas temporales.

---

# 4. Lenguaje Ubicuo (Local Context)
- **Registration (Inscripción):** Registro formal del competidor que representa su intención de participar en un torneo específico.
- **Payment Obligation (Obligación de Pago):** Monto económico e instrucciones de pago creados al iniciar la inscripción.
- **Payment Evidence (Comprobante de Pago):** Archivo digital subido por el alumno que demuestra la transferencia.
- **Confirmed Participant (Participante Confirmado):** Competidor cuya inscripción y pago fueron aprobados exitosamente.
- **Waiting List (Lista de Espera):** Cola de participantes aprobados que no obtuvieron cupo directo en el bracket.

---

# 5. Entidades y Value Objects (Sistemas de Persistencia)

## Entidades Principales

### `Registration`
- `id` (UUID, PRIMARY KEY)
- `tournament_id` (UUID, FOREIGN KEY)
- `competitor_id` (UUID, FOREIGN KEY)
- `game_profile_id` (UUID, FOREIGN KEY)
- `status` (ENUM: PENDING_PAYMENT, PAYMENT_UNDER_REVIEW, CORRECTION_REQUIRED, CONFIRMED, WAITLISTED, REJECTED, CANCELLED)
- `rules_version` (VARCHAR(20), NOT NULL)
- `rules_accepted_at` (TIMESTAMP, NOT NULL)
- `rules_acceptance_ip` (VARCHAR(45), NOT NULL)
- `confirmed_at` (TIMESTAMP, NULL)
- `waitlisted_at` (TIMESTAMP, NULL)
- `cancelled_at` (TIMESTAMP, NULL)
- `created_at` (TIMESTAMP, DEFAULT NOW())
- `updated_at` (TIMESTAMP, DEFAULT NOW())
- `deleted_at` (TIMESTAMP, NULL)

*Decisión de modelado:* `RuleAcceptance` se modela como un **Value Object** inline dentro de `Registration` por simplicidad en el MVP, ya que la aceptación es inmutable y está indisolublemente atada a la creación de esa inscripción específica.

### `Payment`
- `id` (UUID, PRIMARY KEY)
- `registration_id` (UUID, FOREIGN KEY, UNIQUE)
- `amount` (DECIMAL(10,2), NOT NULL)
- `currency` (VARCHAR(10), NOT NULL, DEFAULT 'PEN')
- `method` (ENUM: YAPE, PLIN, TRANSFER)
- `status` (ENUM: PENDING, EVIDENCE_SUBMITTED, UNDER_REVIEW, CORRECTION_REQUIRED, APPROVED, REJECTED, CANCELLED)
- `operation_reference` (VARCHAR(100), NULL)
- `submitted_at` (TIMESTAMP, NULL)
- `reviewed_at` (TIMESTAMP, NULL)
- `created_at` (TIMESTAMP, DEFAULT NOW())

### `PaymentEvidence`
- `id` (UUID, PRIMARY KEY)
- `payment_id` (UUID, FOREIGN KEY)
- `storage_key` (VARCHAR(255), NOT NULL)
- `original_filename` (VARCHAR(255), NOT NULL)
- `mime_type` (VARCHAR(100), NOT NULL)
- `size_bytes` (INTEGER, NOT NULL)
- `checksum` (VARCHAR(64), NOT NULL)
- `uploaded_at` (TIMESTAMP, DEFAULT NOW())
- `replaced_at` (TIMESTAMP, NULL)

### `PaymentReview`
- `id` (UUID, PRIMARY KEY)
- `payment_id` (UUID, FOREIGN KEY)
- `reviewer_id` (UUID, FOREIGN KEY)
- `decision` (ENUM: APPROVE, REJECT, REQUEST_CORRECTION)
- `public_observation` (VARCHAR(500), NULL)
- `internal_observation` (VARCHAR(500), NULL)
- `created_at` (TIMESTAMP, DEFAULT NOW())

---

# 6. Máquina de Estados (State Machines)

## Máquina de Estados de `Registration`
```
 [ PENDING_PAYMENT ] (Esperando que suba comprobante)
        │
        ├── (Evidencia subida) ➔ [ PAYMENT_UNDER_REVIEW ]
        └── (Cancelación por usuario) ➔ [ CANCELLED ]
        
 [ PAYMENT_UNDER_REVIEW ]
        │
        ├── (Revisor pide corrección) ➔ [ CORRECTION_REQUIRED ]
        ├── (Revisor rechaza) ➔ [ REJECTED ]
        └── (Revisor aprueba pago)
                 │
                 ├── [ Cupo Disponible ] ➔ [ CONFIRMED ] (Confirmado en torneo)
                 └── [ Cupo Lleno ] ➔ [ WAITLISTED ] (Lista de espera)

 [ CORRECTION_REQUIRED ]
        │
        └── (Evidencia nueva subida) ➔ [ PAYMENT_UNDER_REVIEW ]
```

## Máquina de Estados de `Payment`
```
 [ PENDING ] ➔ [ EVIDENCE_SUBMITTED ] ➔ [ UNDER_REVIEW ] ➔ [ APPROVED ] / [ REJECTED ] / [ CORRECTION_REQUIRED ]
```

---

# 7. Reglas de Negocio (Business Rules)

1. **Verificación Obligatoria:** El correo del competidor debe estar verificado (`email_verified = true`) antes de permitir la inscripción.
2. **Requisitos de Perfil:** El competidor debe pertenecer a la institución del torneo si éste es cerrado, y tener carrera y ciclo completos si el torneo lo exige.
3. **Cuentas de Juego Vinculadas:** El competidor debe usar un `GameProfile` activo y validado para Clash Royale o Brawl Stars antes de inscribirse.
4. **Validación de Cupos y Periodo:** La fecha del servidor debe ser mayor o igual a `registration_open_at` y menor o igual a `registration_close_at`. El estado del torneo debe ser `REGISTRATION_OPEN`.
5. **Una Inscripción Activa:** Un competidor no puede crear una nueva inscripción en un torneo si ya tiene una activa en estados `PENDING_PAYMENT`, `PAYMENT_UNDER_REVIEW` o `CORRECTION_REQUIRED`.
6. **Monto Fijo (Snapshot):** El costo (`cost`) y la moneda (`currency`) del torneo se copian inmutablemente en `Payment` al crearse la obligación. Modificaciones posteriores al costo del torneo no alteran las obligaciones ya emitidas.
7. **Privacidad de Evidencias:** No se almacenan URLs públicas directas del comprobante. Se accede mediante `storage_key` con URLs firmadas temporales (máximo 15 minutos).
8. **Autorización Multitenant:** Un organizador solo puede revisar, aprobar o rechazar pagos de torneos creados bajo su misma `organization_id`.
9. **Auditoría de Acciones:** Cada cambio de estado de pago genera una entrada en la tabla `AuditLog` del sistema, registrando IP, usuario y acción.

---

# 8. Concurrencia y Control de Cupos
Para evitar la sobreasignación de cupos bajo alta concurrencia de aprobaciones de pago:
- **Estrategia Elegida:** **Reserva al momento de la Aprobación del Pago** mediante una transacción de base de datos con nivel de aislamiento **Serializable** o bloqueo pesimista en el registro del torneo (`SELECT FOR UPDATE`).
- **Lógica de Confirmación:**
  1. El organizador aprueba el pago.
  2. El backend inicia transacción:
     - Bloquea la fila del torneo en base de datos.
     - Cuenta el número de inscripciones en estado `CONFIRMED`.
     - Si `confirmed_count < max_slots`: Cambia estado de inscripción a `CONFIRMED` y actualiza `confirmed_at`.
     - Si `confirmed_count >= max_slots`: Cambia estado de inscripción a `WAITLISTED` y actualiza `waitlisted_at`.
  3. Finaliza transacción.

---

# 9. Idempotencia en Acciones Críticas
Para evitar duplicidad en clicks rápidos del organizador o reintentos de red del competidor:
- **Idempotency Key:** Las peticiones de aprobación (`POST /payments/:id/approve`) e inscripción (`POST /tournaments/:id/registrations`) deben admitir una cabecera `X-Idempotency-Key` (UUIDv4) provista por el frontend.
- **Validación:** El backend validará que no exista una respuesta previa guardada para esa llave en Redis/Cache con vigencia de 24 horas antes de procesar el flujo.

---

# 10. Contrato de Base de Datos (PostgreSQL & Prisma)

### Esquema: `registration`
- **`registration.registrations`:**
  - `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
  - `tournament_id` (UUID, NOT NULL)
  - `competitor_id` (UUID, NOT NULL)
  - `game_profile_id` (UUID, NOT NULL)
  - `status` (VARCHAR(50), NOT NULL)
  - `rules_version` (VARCHAR(20), NOT NULL)
  - `rules_accepted_at` (TIMESTAMP, NOT NULL)
  - `rules_acceptance_ip` (VARCHAR(45), NOT NULL)
  - `confirmed_at` (TIMESTAMP, NULL)
  - `waitlisted_at` (TIMESTAMP, NULL)
  - `cancelled_at` (TIMESTAMP, NULL)
  - `created_at` (TIMESTAMP, DEFAULT NOW())
  - `updated_at` (TIMESTAMP, DEFAULT NOW())
  - `deleted_at` (TIMESTAMP, NULL)

### Esquema: `payment`
- **`payment.payments`:**
  - `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
  - `registration_id` (UUID, UNIQUE, NOT NULL)
  - `amount` (DECIMAL(10,2), NOT NULL)
  - `currency` (VARCHAR(10), NOT NULL, DEFAULT 'PEN')
  - `method` (VARCHAR(50), NOT NULL)
  - `status` (VARCHAR(50), NOT NULL)
  - `operation_reference` (VARCHAR(100), NULL)
  - `submitted_at` (TIMESTAMP, NULL)
  - `reviewed_at` (TIMESTAMP, NULL)
  - `created_at` (TIMESTAMP, DEFAULT NOW())
  - `updated_at` (TIMESTAMP, DEFAULT NOW())

- **`payment.payment_evidences`:**
  - `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
  - `payment_id` (UUID, NOT NULL)
  - `storage_key` (VARCHAR(255), NOT NULL)
  - `original_filename` (VARCHAR(255), NOT NULL)
  - `mime_type` (VARCHAR(100), NOT NULL)
  - `size_bytes` (INTEGER, NOT NULL)
  - `checksum` (VARCHAR(64), NOT NULL)
  - `uploaded_at` (TIMESTAMP, DEFAULT NOW())

- **`payment.payment_reviews`:**
  - `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
  - `payment_id` (UUID, NOT NULL)
  - `reviewer_id` (UUID, NOT NULL)
  - `decision` (VARCHAR(50), NOT NULL)
  - `public_observation` (VARCHAR(500), NULL)
  - `internal_observation` (VARCHAR(500), NULL)
  - `created_at` (TIMESTAMP, DEFAULT NOW())

### Índices y Restricciones
1. `registrations` ➔ `tournament_id` & `competitor_id` (UNIQUE INDEX) donde `deleted_at IS NULL` y `status NOT IN ('CANCELLED', 'REJECTED')`: Impide doble inscripción activa en el mismo torneo.
2. `payments` ➔ `registration_id` (INDEX).
3. `payment_evidences` ➔ `payment_id` (INDEX).

---

# 11. Seguridad de Archivos (Upload Policies)
- **Formatos Permitidos:** `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
- **Tamaño Máximo:** 5 MB (`5,242,880 bytes`).
- **Validación:** Se debe validar el Magic Number del archivo en el backend (ej: primeros bytes para firmas PNG/JPG), nunca confiar únicamente en la extensión enviada por el cliente.
- **Path Traversal Protection:** El archivo se guarda en Storage renombrado a un UUIDv4 ciego (ej: `evidences/a5b902c1-....png`). Nunca conservar el nombre original en la ruta física.

---

# 12. Contrato de API REST

### `POST /api/v1/tournaments/:tournamentId/registrations`
- **Rol:** `COMPETITOR` (autenticado).
- **Body DTO:** `CreateRegistrationDto`.
- **Response JSON (HTTP 201):**
  ```json
  {
    "success": true,
    "data": {
      "registration_id": "a9b80d11-...",
      "payment_id": "c7a8d011-...",
      "amount": 10.00,
      "currency": "PEN",
      "status": "PENDING_PAYMENT"
    }
  }
  ```

### `POST /api/v1/registrations/:registrationId/payment-evidence`
- **Rol:** `COMPETITOR` propietario.
- **Headers:** `X-Idempotency-Key` (UUID).
- **Payload:** `Multipart/form-data` con archivo `evidence` y opcionalmente `operation_reference`.
- **Response JSON (HTTP 200):** Cambia estado a `PAYMENT_UNDER_REVIEW`.

### `POST /api/v1/payments/:paymentId/approve`
- **Rol:** `ORGANIZER` de la misma institución.
- **Headers:** `X-Idempotency-Key` (UUID).
- **Body DTO:** `ReviewPaymentDto` (opcionalmente `internal_observation`).
- **Response JSON (HTTP 200):** Cambia estado de pago a `APPROVED` y de inscripción a `CONFIRMED` (o `WAITLISTED` si no hay cupo).

---

# 13. Eventos de Dominio (Domain Events)

1. **`RegistrationCreated`:** Emisor: `RegistrationService`. Ocurre al crearse la solicitud en borrador. Payload: `{ registration_id, competitor_id, tournament_id }`.
2. **`PaymentEvidenceSubmitted`:** Emisor: `PaymentService`. Ocurre al subir exitosamente el archivo de comprobante. Alerta al dashboard del organizador. Payload: `{ payment_id, registration_id, uploaded_at }`.
3. **`PaymentApproved`:** Emisor: `PaymentService` (dentro de transacción). Cambia el estado del pago. Payload: `{ payment_id, registration_id, amount, currency }`.
4. **`RegistrationConfirmed`:** Emisor: `RegistrationService`. Disparado por la transacción de reserva de cupo exitosa. Agrega al participante al bracket. Payload: `{ registration_id, competitor_id, tournament_id }`.
5. **`RegistrationWaitlisted`:** Emisor: `RegistrationService`. Disparado al confirmarse pago pero sin cupos directos disponibles. Payload: `{ registration_id, competitor_id, position }`.

---

# 14. UI del Competidor (Wizard de Inscripción)
- **Pasos Visuales:**
  1. *Paso 1: Identidad:* Confirmar nombres, código e institución.
  2. *Paso 2: Cuenta:* Seleccionar e ingresar el Player Tag del juego.
  3. *Paso 3: Reglamento:* Lectura y scroll obligatorio de reglas, con botón de aceptación.
  4. *Paso 4: Pago:* Explicar métodos de transferencia y mostrar código QR de Yape/Plin.
  5. *Paso 5: Comprobante:* Cargador de archivos arrastrar-y-soltar (drag & drop) con previsualización de imagen y campo de referencia.
  6. *Paso 6: Confirmación:* Visualización del estado *"Tu comprobante está en revisión"*.

---

# 15. UI del Organizador (Bandeja de Pagos)
- **Layout Split View:**
  - *Izquierda:* Tabla responsive de solicitudes filtrada por `PAYMENT_UNDER_REVIEW`, detalles de la inscripción del competidor, nickname del juego y código de alumno.
  - *Derecha:* Visor del comprobante de pago cargado desde storage seguro con opción de lupa/zoom y rotación.
  - *Panel inferior:* Botón verde `Aprobar Pago` (abre diálogo de confirmación) y botón rojo `Rechazar / Solicitar corrección` (abre campo de observaciones públicas).

---

# 16. Criterios de Aceptación (DOD & QA Plan)
- [ ] La transacción de aprobación de pago garantiza que no se sobrepasen los cupos del torneo.
- [ ] La carga de comprobantes valida el formato real del archivo (Magic Number) y limita la subida a un tamaño máximo de 5MB.
- [ ] Un competidor con sesión activa no puede duplicar solicitudes de inscripción en el mismo torneo.
- [ ] El organizador de una universidad X no puede visualizar ni aprobar pagos pertenecientes a la universidad Y.
- [ ] El competidor puede cancelar voluntariamente su inscripción en estado `PENDING_PAYMENT` liberando su solicitud.
