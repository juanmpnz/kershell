# ADR-002: PostgreSQL como fuente de verdad y Drizzle como capa propuesta

## Estado

Aceptado

## Fecha

2026-09-02

## Contexto

El administrador antiguo guarda un agregado completo en JSONB y el nuevo usa un
store en memoria. La informacion es relacional: proyectos, proveedores,
suscripciones, renovaciones, credenciales y eventos de auditoria. El propietario
dispone de servidor propio y quiere PostgreSQL.

## Decision

Usar PostgreSQL como unica fuente de verdad. El propietario confirmo que base y
aplicacion se alojaran en su servidor y que Supabase se retira.

Drizzle ORM con migraciones SQL versionadas esta aprobado. La conexion existira
solo en modulos server-only. Un DAL autenticara al owner,
ejecutara queries y devolvera DTOs minimos.

El VPS dispone de un recurso PostgreSQL 16 de Coolify usado por ediFlow y de la
instancia interna PostgreSQL 15 `coolify-db`. Kershell no usara `coolify-db` ni
la base `ediflow_demo`: tendra base y rol exclusivos. Compartir la instancia 16
o crear otro recurso se decidira tras medir memoria y conexiones. Aplicar
migraciones en produccion requiere backup y prueba previa en una base equivalente.

## Alternativas consideradas

### Mantener el documento JSONB de Supabase

- Permite avanzar rapido con la UI existente.
- Pierde integridad referencial, consultas, concurrencia y auditoria granular.

### Prisma

- Ecosistema maduro y cliente muy guiado.
- Añade generacion y una abstraccion mas pesada; sigue siendo una alternativa
  valida si el propietario prioriza esas herramientas.

### SQL manual con `pg`

- Maximo control y pocas abstracciones.
- Exige mantener a mano tipos, mapeos y disciplina de queries en toda la app.

## Consecuencias

- Cada cambio de datos tiene schema, migracion, pruebas y rollback/forward-fix.
- Se elimina el fallback a `localStorage`.
- Las metricas derivadas se calculan con queries, no se sincronizan manualmente.
- La dependencia nueva se instalara con version fijada y auditoria previa.
