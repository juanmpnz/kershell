# 02 — Suscripciones

**Ruta:** `/dashboard/subscriptions`
**Spec base:** `SPEC.md §3.6 (tabla)`, `§3.7 (modal)`, `§4.3`

## PageHeader

| Slot | Contenido |
|------|-----------|
| Eyebrow accent | `Finanzas · suscripciones` |
| Title | `Suscripciones` |
| Sub | `Servicios de terceros y proveedores. Edita cualquier fila para ver detalle, próximos cobros y notas del equipo.` |
| Actions | `Exportar CSV` (outline) · `Nueva` (primary) |

## Toolbar (`20px 32px`, border-bottom)

- Input search (320px, icon `search`, placeholder `Buscar por nombre o plan`).
- Select Categoría (180px, primer opt `Todas las categorías`).
- Select Estado (160px, opciones: `Todos los estados / Activas / En trial / Pausadas`).
- Derecha: `${filtered.length} de ${total} · $N/mes` (mono).

## Tabla

Grid columnas: `1.6fr 1.1fr 1fr 1.1fr 0.9fr 0.9fr 80px`.

| # | Columna | Render |
|---|---------|--------|
| 1 | Servicio | Avatar 28 con iniciales mono + nombre 13/500 + Badge warn `trial · Nd` si aplica (debajo del nombre). |
| 2 | Plan | mono 12.5 text-dim |
| 3 | Categoría | Badge neutral |
| 4 | Próx. cobro | fecha mono + tiempo restante (`hoy` / `mañana` / `en Nd` / `vencido`). Si <= 3d, color warn. |
| 5 | Proyecto | dot 6×6 del color del proyecto + nombre, o `—` muted si null. |
| 6 | Costo | mono 13, `$NN` + `/mo` muted |
| 7 | Acciones | IconButton `edit` + `more` |

- Cada `<tr>` es un `<button>` que llama a `openEdit(sub.id)`.
- Filas: height 56 normal / 44 compact.
- Footer row: `N suscripciones` izquierda, total `$N/mo` derecha.

## URL state

- `?edit=<id>` abre el modal con esa sub al montar.
- `?new=1` abre modal en modo nuevo.
- `?status=trial` aplica el filtro al cargar.

Codex: usá `useSearchParams` + `useRouter` para sincronizar.

## Modal de edición (SubscriptionEditModal)

Width 620. Estructura:

1. **Eyebrow:** `id · ${id}` o `Nueva suscripción`.
2. **Título:** nombre del servicio o "Nueva suscripción".
3. **Banner warn** (solo si `status === 'trial'`): `Trial vence el ${date} (${Nd} días). Después se cobrarán $${cost} /mes.`
4. **Form grid 1fr/1fr:**
   - Servicio (Input)
   - Plan (Input)
   - Categoría (Select)
   - Estado (Select: Activa / En trial / Pausada)
   - Costo mensual (Input mono)
   - Próximo cobro (Input mono + icon cal)
   - Ciclo (Input, full-width col-span-2)
   - Método de pago (Input)
   - Proyecto asociado (Select con `— Ninguno —` primero)
5. **Notas:** textarea.
6. **Audit footer** (dentro del body, no del Modal footer): mono 11 muted con `creada · YYYY-MM-DD` y `última edición · ${relative} · ${addedBy}`.
7. **Modal footer:** `Eliminar` (ghost danger, mr-auto) + `Cancelar` (outline) + `Guardar` (primary).

### Confirmación de borrado

Modal pequeño width 420:
- Eyebrow danger `Confirmar`
- Título `¿Eliminar ${sub.name}?`
- Body: `Esta acción no se puede deshacer. Se removerá del overview y de los proyectos asociados.`
- Footer: `Cancelar` + `Eliminar` (button danger lleno).

## Empty state

Sin suscripciones (filtros aplicados sin match): card grande centrada con icon `card` + `Sin resultados` + sub `Probá ajustar los filtros o crear una nueva.` + button outline `Limpiar filtros`.
