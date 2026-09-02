---
name: kershell-security
description: Threat-model and secure Kershell authentication, authorization, secrets, admin data, public forms, integrations, and deployment boundaries. Use for any security-sensitive change or audit; not for purely visual work with no data boundary.
---

# Kershell Security

Read the security findings in `docs/repository-audit-2026-09-02.md` and ADR-003
when credentials or vault behavior are in scope.

## Invariants

- Proxy redirects are optimistic UX only. Every DAL function, Route Handler and
  Server Action authenticates, authorizes the active owner and validates input.
- Add `server-only` to DB, session and secret modules; return minimal DTOs.
- Never put real or realistic token values in code, fixtures, logs, errors, RSC
  payloads or client props.
- Do not store auth/session/company data in `localStorage`. Display preferences
  are the only allowed browser-persistent state.
- Until ADR-003 is replaced, store secret references and metadata, not values.
- Never read or print `.env.local`; discover names from `apps/site/.env.example`.

## Threat-model checklist

For each boundary, name the asset and cover spoofing, tampering, repudiation,
disclosure, denial of service and privilege escalation. Include at least these
abuse cases where relevant:

- password/OAuth brute force, session theft and session replay;
- direct invocation of a hidden action or route;
- oversized or malformed JSON and lost-update overwrites;
- secret leakage through serialization, logs, exports, backups or errors;
- public form spam and forged proxy headers;
- compromised dependency or vulnerable framework version.

Use revocable secure cookies, exact owner allowlists and defense in depth at the
private ingress. Validate origin/CSRF as appropriate, cap body sizes, use shared
rate limiting when more than one process can serve traffic, and add restrictive
security headers.

## Verification

- Test unauthenticated, authenticated-but-not-owner and revoked-session cases.
- Inspect HTTP responses and browser payloads for headers and secret absence.
- Run `pnpm audit --prod`; triage reachability and never force an audit fix.
- Search staged changes for credentials before commit.
- Confirm security events are audit logged without sensitive values.
