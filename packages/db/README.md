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

## Sources

- [Drizzle schema declaration](https://orm.drizzle.team/docs/sql-schema-declaration)
- [Drizzle indexes and constraints](https://orm.drizzle.team/docs/indexes-constraints)
- [Drizzle migration generation](https://orm.drizzle.team/docs/drizzle-kit-generate)
- [PostgreSQL 16 constraints](https://www.postgresql.org/docs/16/ddl-constraints.html)
