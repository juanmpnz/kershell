---
name: kershell-database
description: Design and evolve Kershell PostgreSQL schemas, Drizzle access, migrations, imports, backups, and restore procedures. Use whenever persistent models or queries change; do not use for client-only state.
---

# Kershell Database

Read `docs/data-model-proposal.md` and ADR-002. They are proposals: obtain
approval before installing Drizzle or applying a schema to a real server.

## Data rules

- PostgreSQL is authoritative; do not add a second durable fallback.
- Use relational tables and constraints for projects, vendors, subscriptions,
  ownership and audit. Use JSONB only for bounded metadata with an explicit shape.
- Use UUIDs, UTC timestamps, ISO currency and integer minor units for money.
- Derive counts/totals rather than maintaining denormalized values in UI code.
- Store masked payment labels only. Credential records hold external references,
  not secret values.
- Database clients and queries live in server-only modules.

## Migration workflow

1. Update the approved model/spec first.
2. Add a forward migration and integration tests for constraints and queries.
3. Review generated SQL; never use automatic push against production.
4. Back up and prove restore on an equivalent database.
5. Apply in staging, validate counts/invariants, then schedule production.
6. Prefer forward-fix for data migrations; document rollback limits.

Use transactions for multi-table invariants and imports. Make imports idempotent
or record a durable import key. Bound connection pools for the actual deployment
topology and set query/statement timeouts.

## Verification

- Fresh database migrates from zero and existing database migrates forward.
- Foreign keys, checks, uniqueness and indexes match domain invariants.
- Queries always scope by authorized owner even in a single-user release.
- Backup restore and post-migration counts are documented and tested.
- No migration, fixture or dump contains secrets.
