---
name: kershell-quality
description: Establish and enforce Kershell tests, CI gates, performance budgets, observability, dependency hygiene, and release evidence. Use when adding behavior, preparing deployment, or assessing readiness.
---

# Kershell Quality

Never claim lint or tests pass while the scripts do not exist. Introduce quality
tooling as reviewable infrastructure before relying on it.

## Test pyramid

- Unit: validation, calculations, DTO mapping and authorization decisions.
- PostgreSQL integration: migrations, constraints, transactions and DAL queries.
- HTTP integration: auth, validation, body limits, error contracts and headers.
- Playwright: landing contact happy path with provider stub; admin access, CRUD,
  logout and secret non-disclosure.
- Restore drill: load a backup into an empty database and verify invariants.

Each bug fix starts with a reproducing test. Avoid tests that assert
implementation details or generated wording.

## Gates

The target CI sequence is frozen install, lint, typecheck, unit/integration tests,
production build, E2E smoke and production dependency audit. Block on reachable
critical/high issues or document a time-bounded mitigation.

Measure before optimizing. Track landing Core Web Vitals, server/DAL latency,
database errors and auth failures. Logs are structured, correlated by request ID
and scrubbed of request bodies, emails where unnecessary, tokens and secrets.

## Release evidence

- Exact commit/image and migration version are recorded.
- Backup exists and restore was recently exercised.
- Health/readiness checks cover app and DB dependencies without leaking details.
- Rollback or forward-fix steps are written before promotion.
- A post-deploy smoke confirms public landing, private redirect, authorized CRUD
  and logout.
