# 04 — Vault detail (proyecto)

**Ruta:** `/dashboard/vault/[projectId]`
**Spec base:** `SPEC.md §3.5 (CredentialCard)`, `§3.8 (CredentialEditModal)`, `§4.5`

## PageHeader

| Slot | Contenido |
|------|-----------|
| Eyebrow | `[← Vault] / ${project.code}` — el `← Vault` es un button-link a `/dashboard/vault`. |
| Title | `■ ${project.name}` — cuadradito 14×14 del color del proyecto + nombre. |
| Sub | `project.summary` |
| Actions | `Editar proyecto` (outline) · `Nueva credencial` (primary) |
| **Foot** (meta horizontal, paddingTop 8) | row de 6 grupos `[Eyebrow] [Valor]`:<br/>**Estado** → Badge<br/>**Stack** → `Next.js · Supabase · Vercel · Resend`<br/>**Credenciales** → `8 items`<br/>**Suscripciones** → `4 servicios`<br/>**Gasto mensual** → `$51`<br/>**Creado** → `11 feb 2024` |

## Tabs (`0 32px`, border-bottom)

```
[ Credenciales (8) ] [ Suscripciones (4) ] [ Notas (3) ]
```

- Item activo: text color `--text`, border-bottom 2px `--accent`.
- Item inactivo: text `--muted`.
- Count: chip mono 10.5 bg `--ink-2` border `--border` radius 3.

## Tab 1 — Credenciales

Padding 32. Stack vertical de `<CredentialCard>` con gap 14 (ver componente en `components/CredentialCard.tsx`).

Al final: botón dashed full-width:
```
+ Agregar nueva credencial a ${project.name}
```
- Padding 18, border 1px dashed `--border`, color `--muted`.
- Click abre `<CredentialEditModal mode="new">`.

### Acciones en cada card

- `Reveal all`: cambia el estado de la card a revealed (un solo toggle, no per-field).
- `Edit`: abre el modal con la cred precargada.
- `Delete`: abre confirm modal.
- `Copy` por par: copia al clipboard + toast `${key} copiado`.

## Tab 2 — Suscripciones

Tabla simple `2fr 1fr 1fr 1fr`:

| Servicio | Plan | Próx. cobro | Costo |
|----------|------|-------------|-------|

Solo las subs con `project === projectId`.

## Tab 3 — Notas

Por ahora una card simple con texto editable (textarea). Cuando llegue el backend, persistir.

## Modal — CredentialEditModal

Width 680.

| Slot | Contenido |
|------|-----------|
| Eyebrow | `${project.code} · ${cred.id ?? 'nueva credencial'}` |
| Title | `${cred.name ?? 'Nueva credencial'}` |

**Form 1fr/1fr:** Nombre · Servicio · Tipo (select) · Entorno (select prod/staging/dev/shared).

**Repetidor de pares clave/valor:**
- Container bg `--ink-2`, border, radius 8, pad 8.
- Sub-header mono: `CLAVE / VALOR / SECRET / ·`.
- Cada fila grid `160px 1fr 90px 32px`: Input mono clave, Input mono valor, Toggle "secret", IconButton X.
- Botón ghost sm `+ Agregar campo` arriba a la derecha.

**Extras:** Input Tags · Select Rotar cada (30/60/90/180/no rotar).

**Notas:** textarea.

**Footer:** `Eliminar` (si edit) + `Cancelar` + `Guardar credencial`/`Guardar cambios`.

## Confirmación de borrado de credencial

Modal width 420:
- Eyebrow danger `Confirmar`.
- Title `¿Eliminar "${cred.name}"?`
- Body: lista en mono de las keys que se van a perder.
- Footer: Cancelar + Eliminar (button danger lleno).
