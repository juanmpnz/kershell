# Content Security Policy rollout

## Current phase

The shared runtime uses an enforced, self-hosted CSP from `next.config.ts`.
Scripts, styles, images, fonts, connections, forms and workers default to local
resources. Objects and framing are blocked. Production also upgrades insecure
requests and enables HSTS.

The current landing remains statically renderable. Next.js needs inline script
and style allowances for this CSP mode, so this is a meaningful baseline rather
than the final policy. Development additionally needs `unsafe-eval` for React
debugging; production does not receive that allowance.

## Strict admin phase

Before real company data is available in the private admin:

1. Move the admin to its own app and origin.
2. Generate an unpredictable nonce for each admin request in its proxy.
3. Replace inline allowances with nonce-based `script-src` and `style-src`.
4. Keep the public landing static instead of forcing it into per-request
   rendering solely for the admin policy.
5. Add automated browser checks for CSP violations before enforcement changes.

Any new third-party browser origin must be documented and narrowly added to the
specific directive it needs. Server-to-server integrations such as PostgreSQL,
Better Auth provider calls and Resend do not belong in browser CSP directives.
