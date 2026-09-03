# Kershell database

`schema.ts` is the typed source for the initial PostgreSQL schema. Generated SQL
and Drizzle metadata are committed under `drizzle/`; production never uses an
automatic schema push.

## Local verification

From the repository root:

```bash
pnpm db:generate
pnpm db:check
```

`db:check` creates a disposable PostgreSQL 16.15 container, binds it only to
`127.0.0.1:55432`, migrates an empty database, verifies constraints, and removes
the container/network/test data on exit. It does not connect to Coolify or any
remote database.

After applying migrations to an explicitly selected database, `pnpm db:seed`
loads the sanitized placeholder dataset. The command requires `DATABASE_URL`,
does not print it, and is idempotent. Credential rows are metadata with
`pending-reference-*` identifiers; they must be linked to an external secret
manager before use.

## Server-only data access

`client.ts` validates `DATABASE_URL`, limits each application process to at most
five connections by default (`DB_POOL_MAX`, allowed range 1-10), and reuses its
Drizzle client. Repository functions require an explicit `ownerId`; they throw
database errors and never switch to mock data. Both the client and repositories
import `server-only`, so Next.js rejects accidental use from a Client Component.

## Sources

- [Drizzle schema declaration](https://orm.drizzle.team/docs/sql-schema-declaration)
- [Drizzle indexes and constraints](https://orm.drizzle.team/docs/indexes-constraints)
- [Drizzle migration generation](https://orm.drizzle.team/docs/drizzle-kit-generate)
- [PostgreSQL 16 constraints](https://www.postgresql.org/docs/16/ddl-constraints.html)
- [Next.js server-only modules](https://nextjs.org/docs/app/getting-started/server-and-client-components#preventing-environment-poisoning)
