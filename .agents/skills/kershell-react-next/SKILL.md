---
name: kershell-react-next
description: Implement Kershell UI and full-stack flows with the repository's React 19 and Next.js App Router conventions. Use for routes, Server Components, Client Components, forms, actions, i18n, caching, and rendering boundaries.
---

# Kershell React Next

Check `package.json` and official version-matched Next.js/React docs before using
framework APIs. Upgrade to a patched Next line as a separate change before admin
production work.

## Rendering and data flow

- Server Components are the default for reads. Keep Client Components small and
  limited to interaction or browser APIs.
- Fetch through a server-only DAL and serialize explicit DTOs. Never import the
  current in-memory store into Client Components.
- Treat Server Actions and Route Handlers as public endpoints: authenticate,
  authorize, validate and return stable errors.
- After mutations, update the authoritative DB in a transaction and revalidate
  the narrowest route/tag. Do not rely on client memory as confirmation.
- Make loading, empty, error and retry states explicit.

The landing retains `next-intl`, metadata and public caching. The admin is
Spanish-first initially and never exposes data through static generation.
Browser storage is limited to sidebar/view preferences.

## Component rules

- Use existing Kershell tokens and primitives before adding a library.
- Forms have labels, keyboard support, pending/disabled state and field-level
  errors. Destructive actions require confirmation.
- Secret metadata DTOs never include a hidden plaintext field.
- Avoid global client providers unless state is genuinely cross-route and
  transient.

## Verification

- Typecheck and production build pass on the locked versions.
- Test page navigation plus direct invocation of actions/routes.
- Inspect RSC/HTML/network payloads when sensitive data is involved.
- Verify localized landing routes and authenticated admin flows separately.
