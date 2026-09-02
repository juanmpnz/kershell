# Kershell agent instructions

## Mission

Evolve this repository from a public landing plus two mocked admin prototypes
into a secure, single-owner company operations platform. The public site and
private admin have different trust boundaries even while they share a repo.

## Read first

1. Read the approved `docs/spec-platform.md` before beginning a platform change.
2. Read `docs/repository-audit-2026-09-02.md` for current risks and duplicate
   implementations.
3. Load only the project skills relevant to the change:
   - `.agents/skills/kershell-architecture/SKILL.md`
   - `.agents/skills/kershell-security/SKILL.md`
   - `.agents/skills/kershell-database/SKILL.md`
   - `.agents/skills/kershell-react-next/SKILL.md`
   - `.agents/skills/kershell-type-safety/SKILL.md`
   - `.agents/skills/kershell-design-system/SKILL.md`
   - `.agents/skills/kershell-quality/SKILL.md`

## Current commands

```bash
pnpm run lint
pnpm run test
pnpm run typecheck
pnpm run build
pnpm audit --prod
```

Existing lint debt is recorded with exact per-file counts in
`eslint-suppressions.json`. New violations must fail the gate; prune a
suppression when its underlying issue is fixed.

## Non-negotiable boundaries

- Never commit, log, render, seed, or send real credentials to the browser.
- Do not inspect or print `.env.local`; use `.env.example` to discover variable
  names and ask for values only when an approved deployment needs them.
- Proxy redirects are navigation helpers, not authorization. Authenticate and
  authorize at every data access, Route Handler, and Server Action.
- Browser storage may hold display preferences only. It may not be a fallback
  source of truth for company records, sessions, or vault material.
- Database access belongs in server-only modules and returns minimal DTOs.
- Validate every request payload at runtime; TypeScript casts are not validation.
- Do not create a custom password manager. Until ADR-003 is accepted and
  implemented, store only secret metadata or references to an external manager.
- Treat `docs/spec-google-workspace-auth.md` as historical. The accepted auth
  decision is ADR-004: Better Auth, PostgreSQL sessions and two exact Google
  identities mapped to one logical owner.

## Change discipline

- Use pnpm and the committed lockfile. Do not introduce a second package manager.
- Keep dependency upgrades, structural moves, schema migrations, and feature
  behavior in separate reviewable changes.
- Add a migration for every schema change and define backup/rollback before
  applying it to a real server.
- Prefer Server Components for reads and small Client Components for interaction.
- Preserve the current visual language unless the task explicitly changes it.
- Update the relevant spec or ADR before implementing a changed architectural
  decision.

## Known temporary code

- `/admin` and `/dashboard` are competing prototypes, not two supported admins.
- `lib/dashboard/store.ts` is a mock and must not be extended as persistence.
- `supabase/admin-records.sql` is a transition mechanism, not the target schema.
- Token-like values in seed files are fictional examples; replace them with
  obvious placeholders before enabling any vault workflow.
