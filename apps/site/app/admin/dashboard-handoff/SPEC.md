# Kershell Dashboard — Design Spec

Sistema completo del dashboard interno. Hereda **todos** los foundations del landing (paleta Console, tipografía Geist, radii, easings — ver `handoff/SPEC.md`). Acá solo lo nuevo: estructura, pantallas y componentes propios del dashboard.

---

## 1. Information architecture

```
/login                                 (público)
/dashboard                             → Overview
/dashboard/subscriptions               → Suscripciones (lista + CRUD)
/dashboard/vault                       → Lista de proyectos
/dashboard/vault/[projectId]           → Detalle de proyecto (creds + subs + notas)
/dashboard/settings                    → Configuración (perfil, workspace, security, etc)
```

Todo `/dashboard/*` comparte el layout `AppShell` (sidebar + topbar).

---

## 2. App shell

### 2.1 Sidebar
- Width: **232px** expandida, **64px** colapsada (transición width 180ms ease).
- Background: `--ink-2` (`#070809`), border-right 1px `--border`.
- Estructura vertical:
  1. **Brand block** (64px de alto) — `<Logo />` cuando expandida; `<KMonogram />` cuando colapsada. Border-bottom 1px.
  2. **Workspace chip** (solo expandida) — cuadrito 22×22 lima con "K" + nombre "Kershell" + meta "internal · prod".
  3. **Nav links** — `Overview`, `Suscripciones`, `Vault`, `Settings`. Cada item:
     - Padding `9px 10px`, gap 12px, radius 6, font Geist 13/500.
     - Inactive: text `--text-dim`, icon `--muted`, sin background.
     - Active: text `--text`, background `--surface-2`, border 1px `--border`, **una barra vertical lima 2px en el flanco izquierdo** (posicionada `left: -12px`). Icon `--accent`.
     - Sufijo `01..04` mono 10px en el extremo derecho cuando expandida.
  4. **Trial banner** (solo expandida, opcional) — card con icon alert + "N trials vencen" + descripción + CTA "Revisar →".
  5. **User chip** (mt-auto) — avatar 26×26 con iniciales + nombre + rol "Owner" + icon "more". Border-top 1px.

### 2.2 Topbar
- Height: **64px**, background `--ink`, border-bottom 1px `--border`, padding `0 28px`.
- Estructura:
  - **Breadcrumb** izquierda: `Kershell / Vault / Campos Inmobiliaria`. Mono 12px, separador `chevronR`. Último crumb en `--text`.
  - **Search button** centro-derecha: `min-width 280, h-34, bg --surface, border 1px, radius 6`. Icon `search` + placeholder "Buscar suscripciones, credenciales…" + chip `⌘ K` a la derecha (`--surface-3` background, mono 10px).
  - **Notification bell** (IconButton surface).
  - **Logout** (icon-only ghost mono 11px).

### 2.3 PageHeader
- Padding `28px 32px 20px`, border-bottom 1px `--border`.
- Layout `flex justify-between align-end`:
  - Izquierda: eyebrow accent + h1 28/500/-0.02em + sub opcional 14/text-dim.
  - Derecha: row de botones (outline + primary).
- Foot opcional: row de meta horizontal (Eyebrow + valor) para el detalle de proyecto.

---

## 3. Componentes nuevos

### 3.1 KPI card
- Card surface, pad 20, radius 10, min-height 132.
- Top row: `Eyebrow` (label) + icon `--muted` derecho opcional.
- Value row: número mono **34/500/-0.02em**. Sub mono 12 muted al lado, baseline alineada.
- Children slot (gráficos sparkline opcionales).
- Foot 12/text-dim al pie. Variante `accent` colorea el value con lima.

### 3.2 Badge
- Inline-flex chip, mono **10.5/500/0.06em uppercase**, padding `3px 8px`, radius 4.
- Tonos: `neutral` (surface-3 + textDim), `accent` (lima soft + lima), `warn` (naranja soft + naranja), `danger` (rojo soft + rojo), `ok` (verde soft + verde), `info` (azul soft + azul).
- Prop `dot` muestra un círculo 6×6 del color del tono al inicio.

### 3.3 Modal
- Overlay `rgba(8,9,11,0.72)` + `backdrop-filter: blur(4px)`.
- Card centrada: width prop (default 560), max 90vh, background `--surface`, border 1px, radius 10, shadow `0 30px 60px -20px rgba(0,0,0,0.6)`.
- Header: `eyebrow accent` + título 20/500 + IconButton X. Border-bottom 1px.
- Body: padding 24.
- Footer (opcional): border-top 1px, bg `--ink-2`, row de buttons alineada derecha. Botón "Eliminar" ghost danger empujado a la izquierda con `margin-right: auto`.

### 3.4 Toast
- Hook `useToast()` retorna `{ push(msg, tone), Toaster }`.
- Posicionado bottom-right, gap 8.
- Cada toast: background `--surface-2`, border 1px, **left border 2px del color del tono**, radius 6, pad `10px 14px`, icon check + texto.
- Autoclose 2400ms.

### 3.5 CredentialCard
Tarjeta para mostrar una credencial (1 key con N pares clave-valor).

**Header (`14px 20px`, border-bottom 1px):**
- Avatar 28×28 surface-2 con icon `key` lima.
- Nombre 14/500 + Badge `env` (danger=prod, warn=staging, info=dev/shared) + Badge `type` neutral.
- Meta mono 11 muted: `${service} · actualizado ${date} · por ${addedBy}`.
- Acciones derecha: IconButton `eye`/`eyeOff` (revelar TODO), `edit`, `trash`.

**Body (`8px 12px 12px`):**
- Grid `160px 1fr auto` por par clave-valor.
- Clave: mono 11/0.14em uppercase muted.
- Valor: mono 12.5, text-color text. Cuando `secret: true` y `revealed: false`, mostrar `••••••••••••••••••••` con `letter-spacing: 0.18em`.
- Acciones derecha por fila: IconButton `eye`/`eyeOff` (solo si secret) y `copy`. Size 26.
- Separadores: `border-bottom: 1px dashed --border` entre filas (sin la última).

**Estado:** `revealed` puede ser global (a la card) o per-field. Recomendado **global** para simplicidad y para audit (un click = un evento de reveal).

### 3.6 SubsTable
- Card pad 0, overflow hidden.
- **Header row** (`12px 18px`, bg `--ink-2`, border-bottom 1px, mono 10.5/0.14em uppercase muted):
  Columnas → `Servicio · Plan · Categoría · Próx. cobro · Proyecto · Costo · ·`.
  Grid: `1.6fr 1.1fr 1fr 1.1fr 0.9fr 0.9fr 80px`.
- **Body row** (height 56 normal / 44 compact, padding `0 18px`):
  - Servicio: avatar 28×28 (iniciales mono) + nombre 13/500 + Badge `trial` si aplica.
  - Plan: mono 12.5 text-dim.
  - Categoría: Badge neutral.
  - Próx. cobro: fecha mono 12.5 + tiempo restante "hoy"/"en 3d"/"vencido" en warn si <=3d.
  - Proyecto: dot 6×6 del color del proyecto + nombre, o `—` muted.
  - Costo: mono 13 text "$NN" + "/mo" muted.
  - Acciones: IconButton edit + more.
  - Toda la fila es un `<button>` que abre el modal de edición.
- **Footer row** (`14px 18px`, bg `--ink-2`, border-top): `N suscripciones` izquierda + total mensual derecha.

### 3.7 SubscriptionEditModal
- Width 620.
- Eyebrow `id · s-xxx` o `Nueva suscripción`. Título = nombre del servicio.
- Si `status === 'trial'`: banner warn al tope (icon alert + texto "Trial vence el X (Nd). Después se cobrarán $N /mes.").
- Form en grid 1fr/1fr: Servicio, Plan, Categoría (select), Estado (select), Costo (mono), Próx. cobro (mono + icon cal), Ciclo (full-width), Método de pago, Proyecto (select).
- Notes textarea full-width.
- Audit row (footer dentro del body): mono 11 muted, "creada · ..." y "última edición · ..." en flex justify-between.
- Footer: Eliminar (ghost danger, margin-right auto) + Cancelar (outline) + Guardar (primary).

### 3.8 CredentialEditModal
- Width 680.
- Eyebrow `${projectCode} · ${nueva | id}`.
- Form 1fr/1fr: Nombre, Servicio, Tipo (select), Entorno (select prod/staging/dev/shared).
- **Repetidor de pares clave/valor**:
  - Container con bg `--ink-2`, border, radius 8, pad 8.
  - Sub-header mono 10 muted: `clave / valor / secret / ·`.
  - Cada fila grid `160px 1fr 90px 32px`: Input mono clave, Input mono valor, Toggle "secret", IconButton X (eliminar).
  - Botón "+ Agregar campo" arriba a la derecha del bloque.
- Tags + Rotar cada (select 30/90/180/no rotar).
- Notas textarea.
- Footer: Eliminar (si edit) + Cancelar + Guardar.

---

## 4. Pantallas

> Cada pantalla tiene su archivo en `screens/` con copy + estructura más detallada. Acá el resumen.

### 4.1 Login (`/login`)
Split 2 columnas a pantalla completa.

**Izquierda** (border-right 1px):
- Top row: `<Logo />` izquierda + Eyebrow "internal · prod" derecha.
- Centro vertical (max-width 380):
  - Eyebrow accent "Acceso"
  - h1 36/500/-0.025em: "Entrar a la consola."
  - Sub 14 text-dim
  - Field "Correo" (Input con icon user)
  - Field "Contraseña" (Input password mono) con hint "Token de hardware solicitado tras este paso."
  - Button primary full "Continuar →"
  - Button outline full "Continuar con Google Workspace"
- Foot: mono 11 muted `kershell.dev/console` izquierda + `v0.4.1` derecha, border-top.

**Derecha** (bg `--ink-2`):
- Background grid 48×48 (border lines + mask radial al 60/40).
- Top row: Eyebrow `[ console ]` + fecha ISO derecha.
- Centro: `<KConsoleMark size={120} />` + headline 44/500/-0.025em "La consola interna del **equipo Kershell**." (la segunda parte en `--accent`) + sub 15.
- Foot: 3 mini-stats (subs activas / gasto mensual / trials por vencer), grid 3 col, gap 16. Cada card surface, pad 14, eyebrow + mono 26.

### 4.2 Overview (`/dashboard`)
PageHeader: eyebrow "Overview · DD MMM YYYY" + greeting "Buen día, Jero." + sub dinámica + actions (Exportar outline / Nueva suscripción primary).

Body grid (padding 32, gap 24):
1. **4 KPIs** (grid 4 col):
   - Gasto mensual (accent, foot "$XX,XXX proyectado anual")
   - Suscripciones activas (foot "N en trial · M productivas")
   - Trials por vencer (icon alert, foot warn "Acción requerida")
   - Proyectos activos (foot "X en beta · Y en producción")
2. **Gasto por categoría** + **Próximos cobros** (grid 1.4fr / 1fr):
   - Categoría: card pad 0. Header con eyebrow + total mes + tabs `1M/3M/6M/1A` derecha (chips mono). Body: stacked bar 12px + lista 2-col (color dot + nombre + % + $).
   - Próximos cobros: card pad 0. 5 filas clickable que llevan al modal de la sub. Cada fila: avatar 36 + nombre + fecha + tiempo + costo + Badge categoría.
3. **Trial alerts** + **Proyectos** (grid 1fr / 1.4fr):
   - Trials: card pad 0, header eyebrow warn "● Atención" + count. Body: fila por trial con badge warn + descripción + buttons Confirmar/Cancelar.
   - Proyectos: card pad 0, header eyebrow + CTA "Ir al vault →". Body grid 3 col, cada proyecto clickable a su detalle. Dot color + Badge estado + nombre + code mono + summary + foot grid 3 (creds/subs/mensual).

### 4.3 Subscriptions (`/dashboard/subscriptions`)
PageHeader + actions (Exportar CSV / Nueva).

Toolbar (`20px 32px`, border-bottom): Input search 320 + Select categoría 180 + Select estado 160. Derecha: `N de M` mono + `· $N/mes`.

Tabla (ver §3.6) + footer total + modal de edición (ver §3.7).

### 4.4 Vault list (`/dashboard/vault`)
PageHeader + actions (Importar .env / Nuevo proyecto).

Toolbar: Input search 360. Derecha: count + toggle grid/list (2 botones segmentados).

**Grid view:** `repeat(auto-fill, minmax(320px, 1fr))`. Cada proyecto card clickable:
- Top: cuadrado 40×40 del color del proyecto con `code.slice(0,2)` + Badge estado.
- Nombre 18/500 + code mono 11.
- Summary 13 text-dim.
- Stack tags chips (mono 10.5, bg `--ink-2`, border, radius 3, pad `3px 7px`).
- Foot grid 3 col (creds / subs / mensual), mono.

**List view:** Tabla simple `2fr 1fr 1fr 1fr 80px` (Proyecto/Estado/Credenciales/Gasto/→).

### 4.5 Vault detail (`/dashboard/vault/[projectId]`)
PageHeader con eyebrow "← Vault / CODE" (botón) + título "■ Nombre" (cuadradito de color + nombre) + sub summary + actions (Editar proyecto / Nueva credencial).

PageHeader foot: row de meta horizontal (Estado · Stack · Credenciales · Suscripciones · Gasto mensual · Creado).

**Tabs** (`0 32px`, border-bottom 1px): `Credenciales (N) / Suscripciones (N) / Notas (N)`. Tab activo: border-bottom 2px `--accent`.

**Tab Credenciales:** stack vertical de CredentialCards (ver §3.5), gap 14. Al final: botón dashed "+ Agregar nueva credencial".

**Tab Suscripciones:** tabla simplificada `2fr 1fr 1fr 1fr` (Servicio/Plan/Próx. cobro/Costo).

**Tab Notas:** card con texto.

Modal de credencial al hacer click en edit (ver §3.8).

### 4.6 Settings (`/dashboard/settings`)
PageHeader simple.

Layout `220px 1fr` debajo del header:
- **Sidebar interna** (border-right 1px, pad `24px 16px`): items `Perfil / Workspace / Equipo / Seguridad / Facturación / Integraciones / Notificaciones`. Igual styling que la nav principal pero sin numeritos.
- **Contenido** (pad 32, max-width 760, gap 24).

Cada bloque (`SettingsBlock`) = card pad 0:
- Header (`18px 22px`, border-bottom): título 15/500 + descripción 12.5 muted.
- Body (pad 22, flex-col gap 14) con `SettingsRow`s.

`SettingsRow`: flex con label + descripción a la izquierda, control a la derecha (Toggle / Select / Input / Button).

Final del contenido: row de botones (Descartar outline / Guardar primary), justify-end.

---

## 5. Data model

Ver `data/schema.ts`. Resumen:

```typescript
type Project = {
  id: string; name: string; code: string;
  status: 'live' | 'beta' | 'paused';
  stage: string; // descripción humana
  summary: string;
  stack: string[];
  created: string; // ISO
  owner: string;
  monthly: number;
  credentialsCount: number;
  color: string; // hex del project tag
};

type Subscription = {
  id: string; name: string; plan: string;
  category: 'Hosting' | 'Dev tools' | 'IA' | 'Comunicación' | 'Dominios' | 'Monitoring' | 'Diseño';
  cost: number; period: string;
  nextCharge: string; // ISO
  cycle: string;
  status: 'active' | 'trial' | 'paused';
  trialEnds?: string;
  project: string | null; // Project.id
  payment: string;
  owner: string;
  url: string;
  notes: string;
};

type CredentialField = { k: string; v: string; secret: boolean };

type Credential = {
  id: string; name: string;
  type: string; // 'API key' | 'Login' | 'Connection string' | ...
  service: string;
  env: 'prod' | 'staging' | 'dev' | 'shared';
  updated: string; addedBy: string;
  fields: CredentialField[];
  // backend-only
  tags?: string[];
  rotateEvery?: '30' | '60' | '90' | '180' | 'never';
  notes?: string;
};
```

Credenciales se agrupan **por proyecto** (`Record<projectId, Credential[]>` en mock, foreign key en backend).

---

## 6. Responsive

Mismas reglas que el landing (container queries, breakpoint 800px). En dashboard:
- Sidebar colapsa a 64px <= 1100px (forzado por toggle del usuario o automático).
- KPIs 4 col → 2 col en tablet → 1 col en mobile.
- Tablas: scroll horizontal en mobile en vez de stack vertical (es UI interna, no marketing).
- Modal: width responsivo, max-w 90vw, padding lateral 16.

---

## 7. Estados que faltan (para Codex)

Cuando llegue el backend, codex tiene que cubrir:
- **Empty state** por pantalla (sin subs, sin proyectos, sin trials, sin notas).
- **Loading skeletons** que respeten el grid (KPI, tabla, lista).
- **Error states** con retry.
- **Optimistic updates** en CRUD (suscripciones, credenciales, settings).
- **Confirmation modal** antes de eliminar (sub o credencial). Patrón: `<Modal>` con icon trash danger + título "Eliminar X" + descripción de qué se pierde + buttons Cancelar/Eliminar.

---

## 8. Seguridad — checklist para el vault

(Para Codex cuando implemente backend.)

- [ ] Valores `secret: true` cifrados en DB (AES-256 con key en env, no en client).
- [ ] Reveal pasa por **server action** que registra (`who, when, credentialId, fieldKey`) en tabla `vault_audit_log`.
- [ ] Settings → Seguridad "Re-autenticación al revelar" actúa: si está activo, server action exige password antes de devolver el plaintext.
- [ ] RLS en Supabase (o equivalente) para que ningún cliente pueda leer la tabla `credentials` directamente.
- [ ] No loguear secretos en server logs, Sentry, ni en analytics.
- [ ] Copy: cuando se copia al clipboard, hacer `setTimeout(() => navigator.clipboard.writeText(''), 30000)` para limpiar.
