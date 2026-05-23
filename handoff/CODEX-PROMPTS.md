# CODEX-PROMPTS — Kershell rebrand sequence

**Modo de uso:** copiar y pegar cada prompt en Codex (o tu agente AI) en orden. **No saltees pasos**. Después de cada prompt, revisá el diff, corré la app, validá visualmente, y solo entonces pasá al siguiente.

Cada prompt asume que Codex tiene acceso a este folder `handoff/` y a tu repo de Next.js.

---

## Prompt 0 — Briefing inicial (un único mensaje)

```
Te paso un paquete de rediseño completo en /handoff. Antes de tocar nada:

1. Leé handoff/README.md
2. Leé handoff/SPEC.md
3. Hacé un resumen en bullets de:
   - Qué cambia (paleta, tipografía, layout principal)
   - Qué se mantiene (estructura de contenido, rutas)
   - Qué archivos nuevos necesito crear
   - Qué archivos existentes vas a modificar
4. NO escribas código todavía. Solo el plan.

Cuando confirme el plan, vamos paso a paso.
```

→ Validá el plan antes de seguir. Si Codex propone reorganización agresiva, decile que respete tu estructura actual.

---

## Prompt 1 — Tokens, fuentes y base

```
Implementá los tokens del nuevo sistema:

1. Pegá handoff/tokens/globals.css al inicio de app/globals.css (reemplazando los :root vars existentes).
2. Mergeá handoff/tokens/tailwind.config.snippet.js en tailwind.config.{js,ts}. Mantené cualquier plugin existente.
3. En app/layout.tsx instalá Geist + Geist Mono vía next/font/google con variables --font-geist y --font-mono. Aplicálas al <html> o <body>.
4. Remové cualquier font-family hardcoded que entre en conflicto.
5. Sin tocar componentes todavía, levantá la app y mostrame:
   - Un screenshot de la home tal como está ahora (con los nuevos tokens cargados pero los componentes viejos).
   - El output de `next build` para confirmar 0 errores.
```

→ Validar: la página ahora se ve oscura (ink), con tipografía Geist, pero el layout sigue siendo el viejo. Sin errores de build.

---

## Prompt 2 — Branding: logo, favicon, OG

```
Migrá el branding completo:

1. Copiá los SVGs:
   - handoff/assets/favicon.svg → public/favicon.svg
   - handoff/assets/kershell-mark.svg → public/logo.svg
   - handoff/assets/og-default.svg → public/og/default.svg (creá la carpeta)
2. Actualizá app/layout.tsx (o app/icon.tsx) para:
   - Usar /favicon.svg como icon
   - Setear openGraph.images por defecto a /og/default.svg (o renderizar el OG con vercel/og si ya lo usás — en ese caso, replicá la estética usando el SVG como referencia)
   - apple-touch-icon: generá un PNG 180×180 con el K sobre fondo accent (#B4F23F) y la K en #0A0B0D. Si no podés generar PNG, dejá el SVG y avisame.
3. Creá components/brand/KMonogram.tsx y components/brand/Logo.tsx copiando los archivos de handoff/components/.
4. Buscá todos los lugares donde el logo viejo se renderiza (probablemente en Nav y Footer) y reemplazalo por <Logo />.

Cuando termines: screenshot de la home + screenshot de la pestaña del navegador mostrando favicon.
```

→ Validar: la K aparece en la nav, footer y favicon. El lockup tiene proporciones limpias.

---

## Prompt 3 — Refactor de componentes UI base

```
Antes de tocar las secciones, necesito los componentes UI atómicos:

1. components/ui/Button.tsx — copiá handoff/components/Button.tsx. Asegurate de que cualquier botón existente en la app use este (buscá <button> manuales y migralos cuando tenga sentido).
2. components/ui/Eyebrow.tsx — creá un componente para los "eyebrows" (la etiqueta mono uppercase con un cuadrito o línea al lado). Variantes: muted (default) y accent. Spec en SPEC.md §3.

Para cada componente:
- Tipado TS estricto
- Props mínimas, pasá className y ...rest
- Sin lógica de estado interna
- Storybook NO (no quiero overhead). Solo el componente.

Cuando termines, listame todos los componentes que ya existen en components/ui/ y components/brand/.
```

→ Validar: componentes existen, tipean, importan sin error.

---

## Prompt 4 — Migrar Hero

```
Refactorizá el Hero con la nueva estética. Spec exacto en handoff/SPEC.md §3.3 (Hero) y §3.3.1 (Terminal block).

Reglas:
- Mantené el mismo copy que ya está en la app (ES/EN).
- Layout: grid 2 col desktop, 1 col mobile. Usá container queries (section { container-type: inline-size }) y @container (max-width: 800px) — no media queries.
- Eyebrow + h1 92px con segunda línea en text-dim + sub 18px + 2 botones.
- Terminal block a la derecha:
  - Card surface, border 1px, radius 10
  - 3 dots fake-mac arriba (color #3A4048)
  - 4-5 líneas mono 13/1.7: prompt $ en accent, comandos en text, output en muted
  - Cursor parpadeante: span 8×16 background accent, animate-blink (definido en tailwind.config)
- Background: grid decorativo 80×80 con mask radial.

Validame visualmente comparando con el screenshot que te paso del canvas.

NO toques otras secciones todavía.
```

→ Validar contra el artboard "Landing A · Console / Desktop · 1440" → sección hero.

---

## Prompt 5 — Migrar secciones de a una

Repetí esta plantilla, cambiando la sección:

```
Migrá la sección [Stats / Stack ticker / Promise / Services / Process / Work / Compare / Contact / Footer].

Spec en handoff/SPEC.md §[3.4 / 3.5 / 3.6 / 3.7 / 3.8 / 3.9 / 3.10 / 3.11 / 3.12].

Mantené el copy existente. Usá los componentes ya creados (Button, Eyebrow, Logo, KMonogram). Container queries para responsive.

Cuando termines:
- Screenshot de la sección
- Confirmá que no rompiste otras secciones
- Confirmá tipados y build limpio
```

**Orden recomendado:**
1. Stats strip
2. Stack ticker (animación marquee — usá `animate-marquee` del tailwind config)
3. Promise (3 cards)
4. Services (grid 3×2 con borders 1px — ojo, es `gap: 1px` + `bg-border` en el contenedor)
5. Process (4 steps)
6. Work (3 cards con preview placeholder)
7. Compare (tabla 2 col)
8. Contact form
9. Footer

---

## Prompt 6 — Animaciones y micro-interacciones

```
Sumá las animaciones del spec (SPEC.md §6):

1. Cursor blink en terminal block (ya existe con animate-blink, validá que esté funcionando).
2. Marquee del stack ticker (ya implementado en prompt 5.2).
3. Hover scale 1.01 en cards de services y work — usar transition + group-hover.
4. Reveal on scroll opcional: fade-up 20px translate, 400ms ease-out, usando Intersection Observer (NO instales framer-motion si no lo usás ya). Aplicalo a:
   - h1 del hero
   - Cada card de promise, service, work
   - Stats strip (en cascada con stagger 80ms)
5. Respetá prefers-reduced-motion: el bloque CSS en globals.css ya lo cubre. Validá que blink y marquee se detengan cuando esté activo.

Mostrame un screen recording de 5 segundos haciendo scroll por la página.
```

---

## Prompt 7 — i18n robusto

```
Mejorá el sistema ES/EN:

1. Estructura propuesta:
   lib/i18n/en.ts  (objeto con todos los strings)
   lib/i18n/es.ts  (idem)
   lib/i18n/index.ts (helpers: getDictionary(lang), Lang type)
2. Routing: app/[lang]/... con generateStaticParams (['en', 'es']).
3. Lang switcher en nav:
   - Componente <LangSwitch /> con botón mono 11px tipo "EN · ES" / "ES · EN"
   - Cambia ruta a /{newLang}/{currentPath}
   - Persistí preferencia en cookie NEXT_LOCALE para que /  redirija al lang preferido
4. Strings: si tu copy actual ya está duplicado, consolidalo en estos diccionarios. Si tenés una solución existente (next-intl, lingui), respetala y solo asegurate de que cubra todos los strings de las nuevas secciones.

NO uses una librería pesada si no es necesaria. Diccionarios + hooks simples bastan.
```

---

## Prompt 8 — Limpieza y QA

```
Pase final:

1. Lighthouse (modo desktop y mobile) — meta:
   - Performance: ≥ 95
   - Accessibility: 100
   - Best practices: ≥ 95
   - SEO: 100
2. Validá metadatos:
   - title / description en cada página
   - openGraph.images apunta a /og/default.svg (o tu Vercel OG)
   - twitter:card = summary_large_image
   - canonical correctos por idioma
3. axe-core o lighthouse para accesibilidad. Especial atención a:
   - Contraste (debería pasar AAA, los tokens están calibrados)
   - Focus visible en todo interactivo
   - Labels en formulario de contacto
4. Build production: `next build && next start`. Probá la home, una página de servicio (si la hay), y el flow de contacto.
5. Mostrame:
   - El report de Lighthouse
   - El diff total de archivos
   - Lista de TODOs o assets pendientes (apple-touch-icon PNG, etc.)
```

---

## Tips finales

- **Una sección por commit.** Si Codex te entrega cinco cambios juntos, pedile que los separe.
- **Si una sección no cuadra**, mandá un screenshot del artboard del canvas y la pantalla actual, lado a lado.
- **Container queries vs media queries:** el spec usa container queries (más robustas con sidebars/embeds). Si tu Tailwind no las soporta, agregá el plugin `@tailwindcss/container-queries` o caé a media queries equivalentes.
- **El terminal block del hero es el "wow moment".** Si Codex se lo saltea o lo simplifica, devolvele el prompt 4.

**Si algo rompe el branding (especialmente el K monogram), parálo todo y volvé al prompt 2.** No avances con un logo torcido.
