# Kershell — Design Spec (Dirección A · Console)

Sistema de diseño completo. Cada sección incluye tokens, comportamiento responsivo y referencia visual al canvas de diseño.

---

## 1. Foundations

### 1.1 Palette

| Token        | Hex        | Uso |
|--------------|------------|-----|
| `--ink`      | `#0A0B0D`  | Background principal |
| `--surface`  | `#111316`  | Cards, áreas elevadas |
| `--surface-2`| `#1A1D21`  | Cards más elevadas, hovers |
| `--border`   | `#262B33`  | Bordes 1px, dividers |
| `--text`     | `#ECEEF0`  | Texto principal |
| `--text-dim` | `#B6BBC2`  | Texto secundario, sub-headlines |
| `--muted`    | `#7B8088`  | Metadata, labels, footer |
| `--accent`   | `#B4F23F`  | Signal lime — CTAs, focus, highlight |
| `--accent-ink` | `#0A0B0D` | Texto sobre `--accent` |
| `--accent-soft` | `rgba(180,242,63,0.14)` | Backgrounds suaves del accent |

**Regla:** el accent solo en CTAs, indicadores de estado, hover de links activos y datos numéricos clave. **Nunca** en backgrounds grandes ni en bloques de texto.

### 1.2 Typography

- **Geist Sans** (Google Fonts) — pesos 400, 500, 600, 700
- **Geist Mono** (Google Fonts) — pesos 400, 500

```typescript
// app/layout.tsx
import { Geist, Geist_Mono } from 'next/font/google';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });
```

#### Escala

| Token | Tamaño | Line-height | Letter-spacing | Uso |
|-------|--------|-------------|----------------|-----|
| `text-display` | 92px / 5.75rem | 1.0 | -0.035em | Hero h1 |
| `text-h2` | 56px / 3.5rem | 1.05 | -0.03em | Section title |
| `text-h3` | 32px / 2rem | 1.1 | -0.02em | Promise card title |
| `text-h4` | 24px | 1.15 | -0.015em | Service card title |
| `text-lead` | 18px | 1.55 | -0.005em | Hero sub |
| `text-body` | 15-16px | 1.55 | -0.005em | Párrafos |
| `text-small` | 13-14px | 1.55 | — | Card bodies |
| `text-eyebrow` | 11px mono | 1 | 0.16em uppercase | Eyebrows, eyelabels |
| `text-data` | 52-56px | 1 | -0.03em | Stats grandes |

**Headlines responsive:** clamp en mobile. Hero h1 → 48px / 1.02 / -0.03em. h2 → 36px.

### 1.3 Spacing & layout

- Container max-width: **1440px** (luego 56-64px de padding lateral)
- Mobile padding lateral: **24px**
- Section padding vertical: **100-140px desktop**, **56-64px mobile**
- Gap entre tarjetas: **1px** (con background border-color, para grids tipo "tabla") o **16-24px** (para cards separadas)

### 1.4 Radii

- `--radius-sm`: 4px (badges, tags)
- `--radius-md`: 6px (botones, inputs)
- `--radius-lg`: 12px (cards grandes)
- Pills: `100px` (badges suaves)

### 1.5 Easings & durations

- `--ease-out`: `cubic-bezier(0.16, 1, 0.3, 1)` — para entradas suaves
- `--ease-in-out`: `cubic-bezier(0.4, 0, 0.2, 1)` — transiciones generales
- Durations: 150ms (micro), 250ms (hover), 400ms (entradas grandes)
- Marquee del stack ticker: 40s lineal infinito
- Cursor blink: 1.1s steps(1) infinite, alterna opacity 1/0

---

## 2. Brand mark

### 2.1 Geometría

K monograma sobre grid 100×100u:
- Stem vertical: `x=30, y=6→94`, stroke 16u, linecap butt
- Brazo superior: `(38, 50) → (82, 8)`, mismo stroke
- Brazo inferior: `(38, 50) → (82, 92)`, mismo stroke
- Ángulo de los brazos: ≈39°
- Minimum size: 16px digital, 8mm impreso
- Clearspace: 1× stem-width en todos los lados

SVG canónico:
```svg
<svg viewBox="0 0 100 100" fill="none">
  <g stroke="currentColor" stroke-width="16" stroke-linejoin="miter">
    <path d="M 30 6 L 30 94"/>
    <path d="M 38 50 L 82 8"/>
    <path d="M 38 50 L 82 92"/>
  </g>
</svg>
```

### 2.2 Lockup

- Mark + wordmark "Kershell" en Geist 600, letter-spacing -0.025em
- Gap entre mark y wordmark: 0.32× del tamaño de fuente
- Mark scale: 1.0× del tamaño de fuente

### 2.3 Variantes

- **Standalone mark** — K solo, sin cursor
- **Console mark** — K + bloque cursor lima a la derecha (homepage, OG, app icon)
- **Wordmark only** — para footers muy comprimidos
- **Inverso** — sobre `--accent` (K en `--ink`)

---

## 3. Components

### 3.1 Button

Variantes: `primary`, `ghost`. Tamaños: `md` (14px / 12px 18px padding).

- **Primary:** `bg-accent`, `text-accent-ink`, sin border, radius 6px. Hover: leve scale 1.01 o brillo.
- **Ghost:** `bg-transparent`, `text-text`, `border 1px border-border`, radius 6px. Hover: `bg-surface`.
- Ambos: icon arrow `→` a la derecha, opcional. Gap 8px.

### 3.2 Nav

- Sticky top, `bg-rgba(10,11,13,0.7)` + `backdrop-filter: blur(8px)`, border-bottom 1px border.
- Logo izquierda (lockup 22px).
- Links centro en Geist Mono 13px, color text-dim.
- Derecha: language switcher (mono 11px, border 1px en chip) + CTA primary.
- Mobile: nav links escondidos, mostrar hamburguesa.

### 3.3 Hero

Grid 2 columnas (1.4fr / 1fr) en desktop, 1 col en mobile.
- Eyebrow accent.
- H1 92px, segunda línea en `text-dim`.
- Sub 18px text-dim, max-width 560px.
- Botones primary + ghost en row, gap 12px.
- Sidebar derecho: **terminal block** (ver 3.3.1).
- Background: grid decorativo 80×80 con mask radial.

#### 3.3.1 Terminal block

- Card surface, border 1px, radius 10px.
- Header: 3 dots (#3A4048) + filename mono 11px muted.
- Líneas mono 13px, line-height 1.7.
- Prompt `$` en color accent, comandos en text, output en muted.
- Cursor parpadeante: bloque 8×16px accent, animation `blink 1.1s steps(1) infinite`.

### 3.4 Stats strip

- 4 columnas, gap 0, divisores 1px border verticales.
- Cada celda: padding 32px 24px.
- Eyebrow mono `01 / 04`, valor 52px display, label 13px text-dim.

### 3.5 Stack ticker

- Section padding vertical 40px, border-bottom.
- Eyebrow arriba a la izquierda.
- Track horizontal infinito: tags mono 14px en chips (border 1px, bg surface, radius 6, padding 10px 16px).
- Animation `marquee 40s linear infinite`, duplicar el array para loop seamless.

### 3.6 Promise (3 cards)

- Grid 3 columnas, gap 16px.
- Card: bg surface, border 1px, radius 12px, padding 32px, min-height 280px.
- Tag chip accent (border accent, bg accent-soft, mono 11px uppercase).
- H3 32px display, body 14px text-dim.

### 3.7 Services grid (6 items, 3×2)

- **Grid sin gap, separado por bordes 1px**. Background del grid = `--border`, cards en `--ink`.
- Cada celda: padding 36px, min-height 280px.
- Top-left: número `01` mono. Top-right: tag opcional (accent chip).
- H3 24px, body 14px text-dim, CTA "learn more →" mono 12px accent en bottom.

### 3.8 Process (4 steps)

- Grid 4 columnas con divisores 1px (mismo pattern que services).
- Número `01` accent mono 13px.
- Línea horizontal 1px con dot accent al inicio.
- H4 22px, body 13px text-dim.

### 3.9 Work (3 cards)

- Grid 3 col, gap 16px.
- Card: bg surface, border 1px, radius 12px.
- **Preview placeholder** arriba (aspect 16/10): gradient surface→ink + diagonal stripes pattern, K monogram grande abajo izquierda, dominio mono arriba izquierda.
- Body: tags chip, h4 20px, body 13px text-dim.

### 3.10 Compare table

- Section sobre bg surface.
- Table 2 col, border 1px border, radius 12, overflow hidden.
- Header row: bg ink, padding 18px 24px, mono 11px uppercase. Columna derecha en accent con K monogram inline.
- Body rows: 20px 24px padding. Izquierda muted con strikethrough accent. Derecha text con flecha `→` accent.

### 3.11 Contact form

- Grid 2 col (1fr / 1.4fr).
- Inputs: bg surface, border 1px border, radius 6, padding 14px 16px, font-family Geist.
- Focus state: border accent, outline none, ring 2px accent-soft.
- Select igual a inputs, opciones bg surface.
- Submit: button primary con arrow.

### 3.12 Footer

- Bg surface, border-top 1px border.
- Grid 2fr / 1fr / 1fr.
- Columna 1: lockup + tagline + badge "AI + human expertise" en accent mono.
- Columnas 2-3: headings mono 11px muted, links 14px text-dim.
- Bottom row: copyright + version mono 11px muted, border-top 1px.

---

## 4. Responsive

- **Container queries** sobre el root de cada sección (`container-type: inline-size`).
- Breakpoint principal: **800px**. Por debajo:
  - Padding lateral 24px
  - Grids 3/4 col → 1 col
  - Nav links → hamburguesa
  - h1 92px → 48px
  - h2 56px → 36px
  - Section padding vertical → 56-64px
- Tablet (800-1100px): variantes de 2 columnas para promise/work/services.

---

## 5. i18n

- Toggle ES/EN en nav (mono chip).
- Persistir en cookie o localStorage.
- Estructura: `lib/i18n/{en,es}.ts` exportando un objeto idéntico al de `i18n.js` en el canvas.
- Path-based routing: `/en/...` y `/es/...` con redirect según preferencia.

---

## 6. Animations

- **Cursor blink** en terminal block.
- **Marquee** del stack ticker.
- **Hover scale 1.01** en cards de services y work.
- **Reveal on scroll** opcional: fade-up 20px translate, 400ms ease-out. Usar Intersection Observer o `framer-motion`.
- **Hero entrance** opcional: eyebrow → h1 → sub → buttons en cascada 80ms stagger.
- **CTA hover:** primary button gana 2px de brillo (box-shadow `0 0 0 4px accent-soft`).

---

## 7. Accessibility

- Contraste: text/ink 17.4:1, accent/ink 13.9:1 — pasan AAA.
- Focus visible obligatorio en todos los interactivos (ring 2px accent).
- Reduce motion: respetar `prefers-reduced-motion` — disable marquee y blink.
- Lang switcher: `aria-label="Switch language"`, semántica `<button>`.
- Form: labels asociados, error states con `aria-invalid`.

---

## 8. Performance

- Fuentes: `next/font/google` con `display: 'swap'` y subset latin solo.
- SVGs: inline para mark pequeño, file en `/public` para OG.
- Marquee: usar `transform: translateX` (compositor, no layout).
- Imágenes de portfolio: `next/image` con `priority` solo en hero.
- Lighthouse target: 95+ en performance, 100 en accessibility.
