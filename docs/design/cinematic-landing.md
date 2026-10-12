# Kershell viewport gallery

Approved correction, 2026-10-12: a single-viewport interactive 3D experience.
The previous long landing and 2.5D image plate did not fulfill the request.
Retain the architectural direction, logo and lime/graphite palette.

## Navigation and layout

The homepage mounts one fixed `100dvh` experience, with no vertical page flow.
Projects, capabilities, studio, process, questions and contact are views inside
that viewport. Clicks change the URL fragment and the active content; they do
not call scrollIntoView or navigate down the page. Back/forward and shareable
project URLs work. Existing #portfolio, #why and #process bookmarks resolve to
the appropriate new views. Legal and commercial pages retain their existing
standalone layouts.

The translated catalogue is the authority for the four projects. Their deep
URLs also feed JSON-LD. Off-view content stays in the server-rendered HTML,
but is hidden and inert; selecting the corresponding navigation shows it.
Contact uses three steps and the existing /api/contact endpoint. No automatic
messages or changes to the mail backend are introduced.

## Actual 3D scene

The active scene contains real geometry, not a projection of the gallery image.
`buildGallery.ts` constructs concrete slabs, columns, ceiling, an open doorway,
distant faceted landscape, luminous paths, exhibition plinths, materials,
lighting, reflections and four native exhibits:

- Ediflow: residential volumes, window panes and lit community spaces.
- Operational 3D: instanced containers and ribs, gantry crane, moving hoist/truck.
- Futscan: 3D pitch lines/goals and instanced animated player markers.
- Campos: cantilevered volumes, glass fronts, terraces and architectural lights.

These are conceptual product exhibits, not simulations of customer data or
claims about the live products. The image plate is only a loading/WebGL fallback.
Procedural models reproduce the direction and spatial logic of the reference;
they do not promise photorealistic or pixel-identical reproduction of that render.

Selecting a project interpolates a perspective camera and target to its plinth.
After the camera settles, OrbitControls allow dragging around the model. Wheel
zoom is disabled. Content uses opacity/blur/translation transitions. Project
previous/next links wrap around the four exhibits. No wheel-based navigation.

## Quality and accessibility

Render at 30 FPS and DPR <=1.5 on desktop or 1 on mobile. Desktop uses a 512px
planar floor reflection and shadows; mobile uses lighter materials without that
reflection or shadow pass. Containers/ribs and players are instanced. Stop when
the tab is hidden. Pause and reduced-motion preferences stop ambient animations;
view changes then snap the camera. Dispose geometries, materials, render targets,
textures, controls, observers and listeners on unmount.

Keyboard links/buttons remain the primary navigation. Focus moves to the main
view after navigation; Escape closes the menu and returns focus. Inactive panels
are inert. Content adapts to smaller viewport heights; contact shows at most two
fields per step. Browser verification should include scroll extent, each view,
camera transitions, drag, pause, history and form error states without sending
live test mail.

## Validation and release

Run site lint, typecheck, tests and production build. Publish to the existing
main branch under the user's earlier authorization. Verify remote file/tree
hashes; do not overwrite concurrent commits. Rollback is the previous main
commit. No database migrations or admin changes.

Validation completed: site lint, typecheck, 20 tests and production build pass.
The deployed homepage's document height equals the 936px browser viewport;
project navigation, all seven views, menu and required contact field validation
were exercised without submitting mail. This cloud browser has WebGL disabled
(GL_VENDOR/GL_RENDERER Disabled), so its compatibility view was observed.
GPU rendering, camera flights, reflections and model drag remain unverified
visually in a WebGL-capable browser. Do not present the fallback screenshot as
proof of the native 3D render.
