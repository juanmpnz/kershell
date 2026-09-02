---
name: kershell-design-system
description: Preserve and extend Kershell's visual language, components, accessibility, and responsive behavior. Use for landing/admin UI design or component-system changes; do not use for backend-only work.
---

# Kershell Design System

Inspect `apps/site/app/globals.css`, `apps/site/components/ui`,
`apps/site/components/dashboard/ui` and an
existing nearby screen before editing. Treat handoff directories as historical
references, not runtime component sources.

## Visual direction

- Preserve the dark console-inspired brand, Geist typography, mono metadata,
  accent green, restrained borders and dense admin information hierarchy.
- The landing may be expressive and motion-led; the admin prioritizes scan speed,
  predictable placement and low interaction cost.
- Promote a component to `packages/ui` only when both future apps actually share
  it. Admin-only tables and vault controls stay with the admin.

## Interaction and accessibility

- Meet WCAG 2.2 AA contrast, focus visibility, keyboard order and target sizes.
- Use semantic controls, associated labels, live regions for async feedback and
  accessible dialogs with focus restore.
- Respect reduced motion. Animation must communicate hierarchy/state, not delay
  work.
- Design responsive tables with deliberate column priority; do not hide critical
  actions or financial meaning on small screens.
- Include loading, empty, error, disabled, success and destructive-confirmation
  states in each feature.

For credentials, distinguish metadata, masked state and authorized reveal. Never
solve data security with blur, CSS, hidden text or client-only toggles.

## Verification

- Keyboard-only path completes the primary flow.
- Focus and dialog behavior are correct at runtime.
- Mobile, desktop and reduced-motion states are checked.
- Landing visual/SEO behavior and admin density are reviewed independently.
