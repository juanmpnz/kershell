# 03 — Vault (lista de proyectos)

**Ruta:** `/dashboard/vault`
**Spec base:** `SPEC.md §4.4`

## PageHeader

| Slot | Contenido |
|------|-----------|
| Eyebrow accent | `Vault · proyectos` |
| Title | `Vault de proyectos` |
| Sub | `Bóveda de credenciales por proyecto. Las claves se mantienen ocultas por defecto — un click revela, dos clicks copian.` |
| Actions | `Importar .env` (outline) · `Nuevo proyecto` (primary) |

## Toolbar

- Input search 360 (placeholder `Buscar proyecto`).
- Derecha: count mono + toggle Grid/List (segmento de 2 IconButtons en un wrapper con border).

## Grid view (default)

`grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))`, gap 16, min-height card 240.

Cada card es un `<Link href={'/dashboard/vault/' + project.id}>`:

```
┌────────────────────────────────────┐
│  ■■                  [● Producción]│
│  ■■                                │
│                                    │
│  Campos Inmobiliaria               │
│  CAMPOS                            │
│                                    │
│  Plataforma de listings y gestión  │
│  de leads para inmobiliaria…       │
│                                    │
│  Next.js  Supabase  Vercel  Resend │
│                                    │
│  ─────────────────────────────────── │
│  CREDS  SUBS         MENSUAL        │
│  8      4            $51            │
└────────────────────────────────────┘
```

- Cuadrado 40×40 arriba-izquierda con `color` del proyecto, contiene `code.slice(0,2)` en mono 14/600 sobre `--ink`.
- Badge `ok` para `live`, `info` para `beta`, `neutral` para `paused`.
- Stack chips: bg `--ink-2`, border 1px, radius 3, mono 10.5, padding `3px 7px`.
- Foot grid 3 col con eyebrow + valor.

## List view

Tabla simple `2fr 1fr 1fr 1fr 80px`:

| Proyecto | Estado | Credenciales | Gasto | → |
|----------|--------|--------------|-------|---|

Cada fila es un link al detalle. Hover: bg `--surface-2`.

## Persistencia del view

Guardar la preferencia en localStorage (`dash-vault-view = 'grid' | 'list'`).

## Empty state

Sin proyectos: card centrada con icon `box` + `Sin proyectos todavía` + sub `Creá tu primer proyecto para empezar a guardar credenciales.` + button primary `Nuevo proyecto`.
