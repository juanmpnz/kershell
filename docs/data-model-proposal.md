# Modelo PostgreSQL propuesto

Estado: direccion y Drizzle aprobados; el esquema inicial se implementa y prueba
localmente antes de aplicar cualquier migracion al servidor.

## Principios

- Modelo relacional para entidades consultables; JSONB solo para metadata
  acotada, no para todo el estado de la aplicacion.
- UUID generados en servidor, `created_at`/`updated_at` en UTC y constraints
  explicitos.
- Dinero en unidades menores (`amount_minor bigint`) y `currency char(3)`.
- Borrado fisico solo cuando el dominio lo exige; usar `archived_at` para
  proyectos y suscripciones que deben conservar historia.
- Todas las tablas operativas pertenecen a un `owner_id`, aunque al principio
  exista un solo owner.
- Valores secretos quedan fuera de estas tablas en la primera version.

## Entidades iniciales

### `owners`

- `id uuid primary key`
- `display_name text not null`
- `status text check (status in ('active', 'disabled'))`
- timestamps

La aplicacion impone un unico owner activo inicialmente. No se modelan roles ni
invitaciones hasta que exista un caso real.

### `admin_identities`

- `id uuid primary key`
- `owner_id uuid references owners on delete cascade`
- `auth_user_id text unique not null`
- `provider text check (provider = 'google')`
- `provider_subject text unique not null`
- `email citext unique not null`
- `hosted_domain text nullable`
- `status text check (status in ('active', 'disabled'))`
- timestamps

Permite que las dos cuentas Google aprobadas representen al mismo propietario
sin usar el email como identificador externo estable.

### `auth_sessions`

- `id uuid primary key`
- `identity_id uuid references admin_identities on delete cascade`
- `token_hash text unique not null`
- `expires_at`, `revoked_at`, `last_seen_at`, timestamps
- metadata minima de seguridad; nunca el token plano

Se omite de la migracion inicial: Better Auth creara sus propias tablas de sesion
revocable en la fase de autenticacion. No se mantendra una segunda tabla de
sesiones Kershell en paralelo.

### `projects`

- `id`, `owner_id`, `name`, `code`, `summary`
- `status` con enum/check estable
- `stage`, `color`, `started_on`, `archived_at`, timestamps

El costo mensual y cantidad de credenciales son derivados, no columnas que se
actualizan manualmente.

### `project_technologies`

- `project_id`, `name`, `position`
- primary key compuesta (`project_id`, `name`)

Evita arrays de stack dificiles de consultar y mantiene el orden visual.

### `vendors`

- `id`, `owner_id`, `name`, `website_url`, `notes`, timestamps
- unique (`owner_id`, `name`)

### `subscriptions`

- `id`, `owner_id`, `vendor_id`
- `name`, `plan`, `category`, `status`
- `amount_minor`, `currency`, `billing_interval`
- `next_charge_on`, `trial_ends_on`, `cancelled_at`, `archived_at`
- `account_email`, `payment_method_label`, `website_url`, `notes`, timestamps

`payment_method_label` solo admite una descripcion enmascarada; nunca PAN, CVV ni
datos completos de pago.

### `project_subscriptions`

- `owner_id`, `project_id`, `subscription_id`
- primary key compuesta

Permite que una suscripcion compartida sirva a varios proyectos sin duplicarla.
Las claves foraneas compuestas `(id, owner_id)` impiden asociaciones entre owners.

### `credential_references`

- `id`, `owner_id`, `project_id nullable`
- `name`, `service`, `environment`, `credential_type`
- `secret_provider`, `external_item_id`
- `last_rotated_at`, `rotation_interval_days`, `notes`, timestamps

No incluye password, token, private key ni connection string. El
`external_item_id` debe ser un identificador opaco, no una URL con secreto.

### `settings`

- `owner_id primary key`
- preferencias no sensibles tipadas o columnas explicitas
- timestamps

No guardar flags de seguridad que el cliente pueda cambiar sin reautenticacion.

### `audit_events`

- `id bigserial primary key`, `owner_id`, `actor_user_id`
- `action`, `entity_type`, `entity_id`
- `request_id`, `ip_hash`, `user_agent_summary`
- `metadata jsonb` con allowlist y sin secretos
- `created_at`

Esta tabla es append-only para el rol de aplicacion. Eventos minimos: login,
logout, fallo de auth, CRUD, exportacion, acceso/revelado de secreto y cambios de
seguridad.

## Constraints e indices

- Checks para status, intervalos, currency y montos no negativos.
- Indices por `owner_id`, fechas de renovacion, status y claves foraneas.
- Unique parciales para codigos activos por owner cuando corresponda.
- FKs compuestas en relaciones operativas para que vendor, proyecto, suscripcion
  y referencia pertenezcan siempre al mismo owner.
- `updated_at` controlado de forma consistente por la capa de persistencia.
- Version optimista (`version integer`) en entidades editables si las pruebas
  confirman riesgo de sobrescritura concurrente.

## Migracion desde el estado actual

1. Exportar el JSONB y cualquier fallback local con una herramienta explicita.
2. Validar contra un schema de importacion y generar un informe de errores.
3. Importar owner, proyectos, vendors y suscripciones en una transaccion.
4. Convertir asociaciones de proyecto a la tabla puente.
5. Importar solo metadata de credenciales; nunca seeds/token-like values.
6. Comparar conteos y totales antes de declarar el nuevo sistema fuente de verdad.
7. Mantener el estado antiguo en solo lectura durante una ventana acordada.
