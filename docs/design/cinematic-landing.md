# Kershell viewport experience

Approved correction, 2026-10-16: remove the Three.js environments, models,
volumetric mist and architectural backgrounds. Use a quiet, full-bleed video
background inspired by the slow optical movement on https://payloadcms.com/.
Keep Kershell's logo, graphite/lime palette and the single-viewport navigation.

## Background

Use an original 20-second, seamless, silent optical film. Broad curved folds,
soft highlights and a restrained lime reflection leave room for typography.
The film is pre-rendered with `scripts/render-brand-film.py`; no WebGL, canvas,
Three.js or frame-by-frame animation runs in the visitor's browser. Desktop
and portrait MP4s and matching WebP posters are self-hosted under `/film/`.
Payload's video is a reference only and is not redistributed or hotlinked.

Use native muted, looping, inline playback. Only the chosen responsive asset
is requested. Pause stops playback; reduced-motion and data-saving preferences
show the poster without requesting the film. Hidden tabs pause. Failed or
blocked playback leaves the poster visible and offers the normal play control.
No diagnostic renderer text is shown to visitors.

## Navigation and layout

One fixed `100dvh` experience contains home, services, studio, project, process,
questions and contact views. Hash links change the active panel, not scroll
position. Back/forward, direct project URLs and existing bookmarks are retained.
Projects remain secondary and contain editorial information, without screenshots
or models. Four projects: Ediflow, Operational 3D, Futscan and Campos Inmobiliaria.
Only Campos has an external website link.

Header, content and footer occupy explicit rows. Home capabilities and project
selection occupy their own bottom row. Small screens use compact layouts;
services and questions reveal one detail at a time, and contact retains three
steps. Controls respect safe-area insets and keyboard focus. Inactive sections
are inert but retained in server-rendered HTML. Legal pages keep their existing
standalone layout; no backend/admin behavior changes.

## Validation and release

Run site lint, typecheck, tests, production build and dependency audit. Verify
all views in desktop, portrait and short landscape viewports when browser QA
is available. Check actual video time advancement, pause, hash history, contact
validation, absence of canvas/WebGL and document scroll extent. Do not send test
email. Publish to the existing main branch with a checked expected-head lease.
Rollback: restore the previous main tree (53d4d61). No database migrations.

Validation, 2026-10-16: both silent H.264 assets contain 480 frames at 24 FPS
and exactly 20 seconds. The desktop film is 565,259 bytes and the portrait film
254,516 bytes. Sampled decoded frames confirm movement and a small loop seam.
Site lint, TypeScript, 20 characterization tests and production build passed.
The managed preview supervisor could not start because its command cannot find
pnpm; browser layout checks remain pending rather than claimed as passed.

Dependency audit reports existing findings in the locked stack. The critical
next/og advisory GHSA-vcvr-r3jv-pc5j requires attacker-controlled SVG passed to
ImageResponse; this application has no next/og or ImageResponse route. The high
Image Optimization advisory GHSA-cjq9-62q9-8jv4 requires an allow-listed remote
URL; this app configures no remotePatterns. The high librsvg/sharp advisory
GHSA-wq5f-xc86-pv6w requires SVG decoding; the landing uses native picture/video,
no uploads, no untrusted image processing, and Next's SVG optimization remains
disabled by default. The high source-map-js advisory GHSA-68fv-2mgg-jv7q requires
parsing an attacker-controlled indexed source map; no public route accepts source
maps. No new dependency is introduced and the removal does not update versions.
These production entry points remain absent; review and patch these existing
dependencies in a separate maintenance change by 2026-10-23. This is a bounded
reachability assessment for the public site, not an audit of the private admin.
