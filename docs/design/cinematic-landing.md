# Kershell cinematic landing

Approved direction: cinematic transformation, selected on 2026-10-12.
Refactor the existing public site; preserve the logo, lime/graphite palette,
localization, contact flow and the separate admin application.

## Experience

- Opening: editorial headline over bespoke metallic ribbon art, enhanced with
  an actual Three.js ribbon scene. Scroll separates and turns the geometry;
  pointer input adds restrained parallax. The poster remains beneath the scene.
- Selected work: Ediflow, Operational 3D, Futscan and Campos Inmobiliaria.
  Each receives conceptual art, a concise description and disciplines.
  No interface screenshots. Only Campos has an established public destination;
  the other products show their development status without placeholder links.
- Alternate dark, neutral and lime sections with different density and layouts.
  Services and FAQs use native keyboard-accessible disclosure controls.
- All FAQ structured answers remain present in the page. Portfolio JSON-LD
  derives from the same localized project catalogue as the visible section.

## Rendering and performance

Direct Three.js uses the existing dependency rather than adding a second scene
framework. The local RoomEnvironment supplies reflections without external HDR
assets. There are 16 low-poly extruded ribbons, two materials and two lights.
No bloom, shadows, external image textures or per-frame geometry allocations in the live scene.
A visible pause/resume control freezes or restarts the scene. The animation is capped at 30 frames/second and pixel ratio at 1.5. It pauses
outside the hero and when the tab is hidden. Event listeners, GPU resources and
observers are disposed when the component unmounts.

Below 768px, with reduced motion, on import failure, or after context loss, the
optimized poster retains the design. Dynamic motion preferences are respected.
HTML content and links remain available independently of the renderer.

Five original assets were generated with the built-in ImageGen tool, not taken
from Lusion and not based on product screenshots. Sources remain in the task's
generated image outputs; WebP files in `apps/site/public/art` are the production
assets, optimized using Sharp. The portfolio artwork is conceptual illustration,
not evidence of shipped functionality or a visualization of customer data.

## Asset briefs

Shared: landscape, no text/logo/UI/screenshot, photorealistic graphite metal and
smoked glass, sophisticated studio reflections, near-black background, restrained
lime #b4f23f accents, no multicolor neon.

- hero.webp: a flowing wave of fine metallic ribbons converging into an engineered
  fold at right; dark negative space on the left for the headline.
- ediflow.webp: three miniature residential volumes around a connected courtyard.
- operational.webp: a miniature container terminal, crane, truck and lit lane.
- futscan.webp: smoked-glass tactical football pitch and minimal player markers.
- campos.webp: contemporary residential architectural volumes and terraces.

## Validation and release

Run site lint, typecheck, tests and production build. Review `/es` and `/en` on
mobile and desktop, with reduced motion, without WebGL, and with the menu and
accordion controls operated by keyboard. Confirm the external Campos link and
contact success/error feedback. Browser visual QA is still required when an
approved browser surface is available.

Do not treat code preparation as proof of production deployment. The earlier
main-branch publication was blocked by automatic review; publication requires
explicit user authorization. Rollback is the preceding site image/commit; this
change has no database migrations or admin behavior changes.

Validation performed: site ESLint, 16 Vitest tests, TypeScript and production
build passed. The environment runs Node 24.19.0, slightly below the repository
minimum 24.20.0; the checks completed despite the engine warning. Visual browser
QA and deployed contact delivery have not been exercised in this environment.
