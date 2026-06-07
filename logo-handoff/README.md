# Kershell — Logo "underline signature" (kershell_)

Paquete para reemplazar el logo en **landing + dashboard**. El nuevo logotipo es el wordmark `kershell` en Geist 600 con un **underscore lima** al final — referencia al cursor de terminal / "todavía escribiendo".

## Qué hay acá

```
logo-handoff/
├── README.md         ← este archivo
├── PROMPT.md         ← prompt para pegar en Codex
├── Logo.tsx          ← componente React/TSX oficial (reemplaza KLockup / KLockupTile)
├── logo.svg          ← versión SVG estática (OG, emails, swag)
└── favicon.svg       ← K_ monograma 32px para la tab
```

## Especificación

| Token | Valor |
|-------|-------|
| Wordmark | `kershell` (minúsculas) |
| Tipografía | Geist 600 |
| Letter-spacing | `-0.025em` |
| Color wordmark | `--text` (#ECEEF0) sobre dark · `--ink` sobre lima |
| Underscore | bloque sólido lima `--accent` (#B4F23F) |
| Underscore size | `width: size×0.42`, `height: size×0.08` (mín 2px), `margin-left: size×0.06` |
| Posición underscore | apoyado en baseline, `translateY(-size×0.04)` |
| Variante mark | `K_` (misma regla, una sola letra mayúscula) — para sidebar colapsada y favicon |

**Reglas:**
- El wordmark va en **minúsculas** siempre (`kershell`, no `Kershell`). Es parte de la identidad del logotipo. El nombre en prosa sigue siendo "Kershell".
- El underscore es un **bloque** (`<span>` / `<rect>`), NO el carácter `_`, para tener control exacto del grosor y que no dependa de la fuente.
- No animar el underscore en el header (distrae). Sí podés hacerlo parpadear (blink) en el hero del landing como brand moment.
- Clearspace: 1× la altura del underscore en cada lado.

## Dónde reemplazar

### Dashboard
- Sidebar header expandida → `<Logo size={24} />`
- Sidebar header colapsada → `<Logo variant="mark" size={22} />`
- Login (panel izquierdo, top) → `<Logo size={28} />`
- Login (panel derecho, hero) → podés usar `<Logo size={64} />` con blink en el underscore

### Landing
- Nav header → `<Logo size={22} />`
- Footer → `<Logo size={20} />`
- Cualquier uso actual de `KLockup`, `KLockupTile` o `KMonogram` como logo → reemplazar por `<Logo />`

### Favicon / OG
- `favicon.svg` → `/app/favicon.svg` (o `/public`)
- Generar PNG 32/180/512 desde el SVG si tu setup los pide

## Notas

- El componente NO depende de ningún SVG de la K vieja. Es puro texto + bloque.
- Mantené `KMonogram` (la K geométrica) en el repo si la usás para otras cosas (watermarks, patrones) — este logo NO la reemplaza, reemplaza solo los **lockups de logo**.
