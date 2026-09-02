# 01 — Overview

**Ruta:** `/dashboard`
**Spec base:** `SPEC.md §4.2`

## PageHeader

| Slot | Contenido |
|------|-----------|
| Eyebrow accent | `Overview · 29 may 2026` (formato `dd MMM yyyy` localizado ES) |
| Title | `Buen día, ${userFirstName}.` |
| Sub | `Hoy hay N trial${s} por vencer y M cobros agendados en los próximos días.` |
| Actions | `Exportar` (outline) · `Nueva suscripción` (primary) |

## Body

### Bloque 1 — KPIs (grid 4 col, gap 16)

1. **Gasto mensual** — value mono accent `$321` · sub `/ mes` · foot `$3.852 proyectado anual`
2. **Suscripciones activas** — value `14` · sub `/ 14 totales` · foot `2 en trial · 12 productivas`
3. **Trials por vencer** — value `02` · sub `en 7 días` · foot warn `Acción requerida` · icon `alert`
4. **Proyectos activos** — value `03` · sub `vivos` · foot `1 en beta · 2 en producción`

> Cálculos en el server component. No usar charts library.

### Bloque 2 — grid `1.4fr 1fr`, gap 16

**Card "Gasto por categoría":**
- Header: Eyebrow + total mes + tabs `1M / 3M / 6M / 1A` (chips mono).
- Stacked bar 12px de altura, dividida en segmentos por categoría (% del total mensual).
- Lista 2-col debajo: cada fila = `■ color | nombre | %% | $valor`.
- Colores: `Hosting #B4F23F`, `Dev tools #7AD0FF`, `IA #C9A8FF`, `Comunicación #F5A623`, `Dominios #E07AC0`, `Monitoring #7AE2A1`, `Diseño #7AD0FF`.

**Card "Próximos cobros":**
- Header: Eyebrow + "5 cargos · 7 días" + icon `cal`.
- 5 filas clickables. Cada fila → `/dashboard/subscriptions?edit=<id>`.
- Cada fila: avatar 36 (iniciales) + nombre + fecha + tiempo restante + costo + Badge categoría.
- Si `daysUntil <= 3`: el tiempo restante en color warn.

### Bloque 3 — grid `1fr 1.4fr`, gap 16

**Card "Atención" (trials):**
- Header: Eyebrow warn `● Atención` + count.
- Filas con badge warn `trial · Nd` + descripción de la sub + buttons `Confirmar` (primary sm) / `Cancelar` (outline sm).

**Card "Proyectos activos":**
- Header: Eyebrow + "Ir al vault →".
- Grid 3 col, cada celda clickable → `/dashboard/vault/<id>`.
- Cada celda: `■ color | Badge estado` arriba, nombre 16/500, code mono, summary, foot grid 3 (creds / subs / mensual).

## Estados vacíos

- Sin trials → ocultá el bloque entero (no muestres card vacía).
- Sin proyectos → en lugar del grid, mostrá un CTA "Crear primer proyecto".
- Sin subs → KPIs en `00` y `$0`, mensaje en "Próximos cobros": "Sin cobros agendados".
