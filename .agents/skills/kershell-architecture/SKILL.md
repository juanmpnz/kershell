---
name: kershell-architecture
description: Design or review Kershell module boundaries, repository structure, deployments, and architectural decisions. Use for cross-cutting changes to the public site, private admin, auth, persistence, or infrastructure; do not use for isolated component edits.
---

# Kershell Architecture

Read `docs/spec-platform.md` before planning a significant change. If the task
touches a current weakness, also read `docs/repository-audit-2026-09-02.md`. Read
only the relevant ADR from `docs/decisions/`.

## Target shape

- Treat public site and private admin as distinct trust/deployment boundaries.
- Prefer the proposed pnpm workspace (`apps/site`, `apps/admin`, focused shared
  packages) after ADR-001 is accepted.
- Keep a modular monolith. Require concrete load or ownership evidence before
  adding a service, queue, event bus, or repository.
- PostgreSQL is the single source of truth; browser storage is UI preference only.
- Keep database, auth, and secret access server-only behind a DAL.

## Decision process

1. Map affected entry points, data owners and trust boundaries.
2. State conflicts with the proposed spec instead of silently resolving them.
3. For an expensive-to-reverse choice, create or update a proposed ADR before
   code and obtain approval.
4. Design the smallest vertical slice that proves the boundary end to end.
5. Separate structural moves, dependency changes, migrations and behavior.

Do not extend either current mock store as an architectural foundation. During
migration, designate one route as canonical and make the other read-only or
redirected only after its data has been inventoried.

## Verification

- The change has one clear data owner and no new duplicate model.
- Public traffic cannot reach admin data without infrastructure and app auth.
- Failure behavior is explicit; there is no silent fallback source of truth.
- Relevant ADR/spec and deployment/rollback effects are updated.
