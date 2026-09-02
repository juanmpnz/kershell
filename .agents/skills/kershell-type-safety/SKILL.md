---
name: kershell-type-safety
description: Define and review Kershell TypeScript contracts and runtime validation across database, domain, API, and React boundaries. Use when adding or changing models, inputs, DTOs, states, or external responses.
---

# Kershell Type Safety

The current `/admin` and `/dashboard` types are incompatible duplicates. Do not
add a third representation or bridge them with casts.

## Contract layers

1. Database schema defines persisted shape and constraints.
2. Runtime schemas validate untrusted input and external responses.
3. Domain types model valid business states.
4. DTOs expose the minimal client-safe projection.
5. View models add formatting only; they do not redefine domain truth.

Prefer one runtime schema source for input plus inferred TypeScript types. Use
discriminated unions for status-dependent data and exhaustive switches. Parse
dates/URLs/currency at the boundary rather than passing strings indefinitely.

## Prohibited shortcuts

- Casting `request.json()` or external JSON with `as`.
- `unknown[]` or whole-state JSON at a persistence boundary.
- Optional fields that create impossible states instead of a union.
- Reusing DB row types as public DTOs.
- Including secret values in a type merely so the UI can mask them.
- Divergent Spanish/English enum values for the same domain state.

## Verification

- Invalid boundary inputs have tests and stable validation errors.
- Domain state cannot represent invalid status/field combinations.
- DTO snapshots or structural assertions prove sensitive columns are absent.
- `pnpm run typecheck` passes without new suppression or broader `any`.
