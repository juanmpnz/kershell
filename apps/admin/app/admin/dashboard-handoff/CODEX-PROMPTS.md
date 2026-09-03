# CODEX-PROMPTS — Kershell Dashboard

**Modo de uso:** copiar y pegar cada prompt en Codex en orden. **No saltees pasos**. Después de cada uno: revisar diff, correr la app, validar visualmente.

Cada prompt asume que Codex tiene acceso a `dashboard-handoff/` Y al `handoff/` original del landing (ya aplicado).

---

## Prompt 0 — Briefing inicial

```
Te paso un paquete completo de dashboard interno en /dashboard-handoff.
El sistema de diseño base (Console) ya está en el repo (paleta, fuentes, branding del handoff/ original).

Antes de tocar nada:

1. Leé dashboard-handoff/README.md
2. Leé dashboard-handoff/SPEC.md
3. Listá los archivos screens/*.md y dame el resumen de cada pantalla.
4. Hacé un PLAN en bullets de:
   - Rutas nuevas en /app/(dashboard)/...
   - Layout compartido (AppShell con sidebar + topbar)
   - Componentes nuevos que voy a crear (en orden de implementación)
   - Tipos de data que vas a poner en /lib/dashboard/
   - Qué archivos del repo existente puede que tengas que tocar (middleware, layout root, etc)
5. NO escribas código todavía. Solo el plan.
```

→ Validá el plan. Si propone agregar libs pesadas (charts, tables) sin necesidad, decile que use lo nativo + componentes propios.

---

## Prompt 1 — Tipos + seed data

```
Implementá el modelo de datos del dashboard:

1. Copiá dashboard-handoff/data/schema.ts → lib/dashboard/schema.ts
2. Copiá dashboard-handoff/data/seed.ts → lib/dashboard/seed.ts
3. Exportá un módulo lib/dashboard/store.ts con:
   - getProjects() / getProject(id)
   - getSubscriptions(filter?) / getSubscription(id)
   - getCredentials(projectId)
   - upsertSubscription(...) / deleteSubscription(id)
   - upsertCredential(projectId, cred) / deleteCredential(projectId, credId)
   Por ahora todo es **en memoria** (módulo con un objeto que muta). Cuando metamos backend lo reemplazamos.

4. Tipá bien todo. Sin `any`.
5. Validá con `tsc --noEmit` que compila limpio.
```

---

## Prompt 2 — Login (público)

```
Implementá la pantalla de login en /app/login/page.tsx.

Spec: dashboard-handoff/SPEC.md §4.1 + dashboard-handoff/screens/00-login.md.

Detalles:
- Layout split 2 columnas a pantalla completa (grid 1fr 1fr).
- Izquierda: form con Email + Password + button primary "Continuar →" + button outline "Continuar con Google Workspace".
- Derecha: visual con grid background, KConsoleMark, headline grande, y 3 mini-stats en grid 3 col.
- Mobile: stack vertical, derecha primero solo si tenés contenido para mostrar (opcional simplificar).
- KConsoleMark = K monograma + bloque cursor lima (8×16 al lado). Reusá <KMonogram /> y agregá el cursor al lado.
- El form NO autentica nada todavía. Al hacer submit, redirige a /dashboard.

Validame con un screenshot.
```

→ Validar contra el artboard del canvas.

---

## Prompt 3 — AppShell (sidebar + topbar + layout)

```
Implementá el layout compartido del dashboard.

1. Crear /app/(dashboard)/layout.tsx con el AppShell:
   - <DashSidebar /> izquierda (sticky, full height)
   - <DashTopbar /> arriba
   - Slot {children} con scroll propio

2. Crear componentes:
   - components/dashboard/AppShell.tsx
   - components/dashboard/DashSidebar.tsx (copiá la lógica de dashboard-handoff/components/DashSidebar.tsx)
   - components/dashboard/DashTopbar.tsx
   - components/dashboard/PageHeader.tsx

3. Sidebar:
   - Width 232 expandida, 64 colapsada (state local en client component, persistir en localStorage 'dash-sidebar-collapsed').
   - Items: Overview, Suscripciones, Vault, Settings.
   - usePathname() para marcar el item activo.
   - Trial banner: por ahora hardcodear "2 trials vencen" con un mock. Cuando esté el backend, leerlo de getSubscriptions({ status: 'trial', daysToEnd: 7 }).

4. Topbar:
   - Breadcrumb derivado del pathname (usá un mapping simple por segmento).
   - Search button placeholder (sin lógica de búsqueda todavía).
   - Logout button → redirige a /login.

5. PageHeader es un componente puro que reciben: eyebrow, title, sub, actions, foot.

Spec: SPEC.md §2.

Validame con un screenshot de /dashboard tal como está (vacío, solo shell).
```

---

## Prompt 4 — Atoms reutilizables

```
Implementá los componentes UI nuevos que usan todas las pantallas.

En components/dashboard/ui/:
- KPI.tsx (SPEC §3.1)
- Badge.tsx (SPEC §3.2)
- Modal.tsx (SPEC §3.3)
- Toast.tsx — hook useToast + Toaster (SPEC §3.4)
- IconButton.tsx — ya existe quizás en components/ui/, reutilizá. Si no, creá: button 32×32 con icon.
- Input.tsx, Select.tsx, Field.tsx — formularios. Background --ink-2, border --border, height 38, radius 6, font Geist 13.
- Eyebrow.tsx — ya debería existir del landing. Reutilizá.

Reglas:
- Sin lógica de negocio.
- Tipados estrictos.
- Estilá con tailwind usando los tokens existentes (bg-ink, border-border, text-text-dim, accent, etc).

Validá con un mini playground en /dashboard temporal: mostrá un KPI, 3 Badges (cada tono), un Modal abierto, un toast.
```

---

## Prompt 5 — Overview

```
Implementá /app/(dashboard)/dashboard/page.tsx con el Overview completo.

Spec: SPEC.md §4.2 + screens/01-overview.md.

Componés con:
- KPIs (4 cards en grid 4 col)
- Card "Gasto por categoría" con stacked bar + lista por categoría
- Card "Próximos cobros" con 5 filas clickables
- Card "Trial alerts" + Card "Proyectos activos"

Importante:
- Para el gráfico stacked bar: NO uses una librería de charts. Es un div con flex y N spans con width: %. Cada categoría tiene un color hardcodeado (ver canvas: Hosting=#B4F23F, Dev tools=#7AD0FF, IA=#C9A8FF, Comunicación=#F5A623, Dominios=#E07AC0, Monitoring=#7AE2A1, Diseño=#7AD0FF).
- Cálculos: hacelos en server component (no hace falta `'use client'` para el overview en sí). Solo el modal y las interacciones son client.
- Links "Próximo cobro" → /dashboard/subscriptions?edit=<id>
- Links proyecto → /dashboard/vault/<id>

Validame con un screenshot.
```

---

## Prompt 6 — Subscriptions (lista + modal)

```
Implementá /app/(dashboard)/dashboard/subscriptions/page.tsx + el modal de edición.

Spec: SPEC.md §3.6 (tabla), §3.7 (modal), §4.3 + screens/02-subscriptions.md.

1. SubsTable como client component:
   - Estado local: query, category filter, status filter.
   - Filtra el array recibido por props.
   - Al click en fila, abre el modal.
2. SubscriptionEditModal:
   - Form controlado (useState con la suscripción que se está editando).
   - Botón Eliminar con confirmación (otro Modal pequeño "¿Eliminar X?").
   - On save: llamar al store y refrescar; mostrar toast.
3. URL state: si la query ?edit=<id> está presente, abrir modal con esa sub. ?new=1 abre el modal vacío.
4. CSV export: por ahora dejá un button sin handler con un TODO inline.

Validame con screenshot de la lista + modal abierto.
```

---

## Prompt 7 — Vault list

```
Implementá /app/(dashboard)/dashboard/vault/page.tsx.

Spec: SPEC.md §4.4 + screens/03-vault-list.md.

Detalles:
- Toolbar con search + toggle grid/list (estado local en client component wrapper).
- Grid view: las tarjetas son links a /dashboard/vault/<id>.
- List view: tabla simple, mismas filas como botones-link.

Server component para la página + client component para el toggle.

Validame screenshot grid y list.
```

---

## Prompt 8 — Vault detail + CredentialCard + modal

```
Implementá /app/(dashboard)/dashboard/vault/[projectId]/page.tsx.

Spec: SPEC.md §3.5 (CredentialCard), §3.8 (CredentialEditModal), §4.5 + screens/04-vault-detail.md.

1. Page header con eyebrow breadcrumb-style ("← Vault / CODE"), título con dot color del proyecto, meta row.
2. Tabs Credenciales / Suscripciones / Notas (estado local).
3. Tab Credenciales: lista de CredentialCards.
4. CredentialCard:
   - Estado revealed: boolean (toggle global por card, NO per-field).
   - Cuando revealed=true mostrar valores en mono; cuando false, ocultar SOLO los que tienen secret=true (los demás siempre visibles).
   - Botón copy: usa navigator.clipboard.writeText(value) y dispara un toast "X copiado".
   - IMPORTANTE: cuando llegue backend, el valor secreto NO debe estar en el HTML hasta que se haga reveal. Hoy con mocks está bien. Dejá un comentario en el componente: "// TODO: reemplazar fields[].v por { masked: '••••' } y traer plain solo on reveal via server action".
5. CredentialEditModal con el repetidor de pares clave/valor (state local con array).
6. Botón "+ Agregar credencial" al final de la lista abre el modal en modo nuevo.

Validame con screenshots: lista con todas ocultas, una revelada, modal de edición.
```

---

## Prompt 9 — Settings

```
Implementá /app/(dashboard)/dashboard/settings/page.tsx.

Spec: SPEC.md §4.6 + screens/05-settings.md.

1. Layout 220px 1fr con sidebar de secciones.
2. Estado local: selected section.
3. Componentes auxiliares: SettingsBlock, SettingsRow, Toggle.
4. Por ahora todos los inputs/toggles son UI, sin persistencia. Botón "Guardar cambios" dispara un toast.

Validame screenshot de cada sección.
```

---

## Prompt 10 — Auth + middleware

```
Conectá auth real.

Sugerencia: Supabase Auth (porque luego usaremos Supabase para DB).
Alternativa: Clerk o NextAuth — si preferís otro, decímelo.

1. Instalá la lib de Supabase Auth.
2. Configurá variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.
3. /app/login → llamá a signInWithPassword. On success, push a /dashboard.
4. /app/login → button "Continuar con Google Workspace" → signInWithOAuth({ provider: 'google' }) y restringí en Supabase para que solo emails @kershell.dev pasen.
5. middleware.ts → protegé /dashboard/*. Si no hay sesión, redirect a /login.
6. Logout en topbar → signOut + push /login.
7. Mostrá el email real del usuario en el sidebar (chip user).

Validame el flow: visitar /dashboard sin sesión → /login → login → /dashboard.
```

---

## Prompt 11 — Backend del vault (lo sensible)

```
Migrá del store en memoria a Supabase Postgres con encryption del vault.

1. Migrations (sql/0001_init.sql):
   - projects (id, name, code, status, stage, summary, stack[], created_at, owner, monthly, color)
   - subscriptions (id, name, plan, category, cost, period, next_charge, cycle, status, trial_ends, project_id, payment, owner, url, notes, created_at, updated_at)
   - credentials (id, project_id, name, type, service, env, updated_at, added_by, tags[], rotate_every, notes)
   - credential_fields (id, credential_id, k, v_ciphertext, v_iv, secret, sort_order)
     → los secret se almacenan cifrados (AES-256-GCM, key en env VAULT_KEY)
     → los no-secret se almacenan en claro
   - vault_audit_log (id, user_id, credential_id, field_id?, action: 'reveal'|'copy'|'edit', at, ip, user_agent)

2. RLS en todas las tablas: solo usuarios autenticados @kershell.dev.

3. Server actions:
   - revealCredentialField(id) → desencripta, loguea en vault_audit_log, devuelve plaintext.
   - copyCredentialField(id) → mismo flujo, devuelve plaintext.
   - upsertCredential(...) → cifra los secret.

4. Frontend:
   - CredentialCard ya no recibe `v` en el HTML inicial. Recibe `vPreview` (siempre "••••" si secret).
   - Al hacer click en reveal: llama a la server action, recibe el plaintext, lo guarda en state local SOLO durante esa sesión.
   - Implementá el setting "Re-autenticación al revelar": si está activo, la server action exige `passwordConfirm` y la UI abre un mini-modal de password.

5. Migrá el store.ts: reemplazá las funciones in-memory por queries a Supabase.

6. Tests:
   - vitest unit test del cifrado/descifrado.
   - playwright e2e del reveal flow.

Validame:
- SQL aplicado limpio.
- Reveal de una credencial dispara un row en vault_audit_log.
- Si arranco la app con VAULT_KEY equivocada, el reveal falla con error controlado.
```

---

## Prompt 12 — QA final

```
Pase final.

1. Lighthouse desktop sobre /dashboard, /dashboard/subscriptions, /dashboard/vault, /dashboard/vault/<id>, /dashboard/settings.
   Meta: Performance ≥ 90 (es un dashboard, está bien algo menor que landing), A11y 100, BP ≥ 95.
2. axe-core sobre cada pantalla.
3. Probá teclado:
   - Tab sigue un orden lógico.
   - Modal trap focus.
   - Esc cierra modal.
   - Atajos: ⌘K abre search (aunque la search no haga nada todavía, el atajo debe enfocar el botón).
4. Probá responsive: 1440 / 1280 / 1024 / 768 / 375.
5. Build production y deploy preview. Pasame la URL.

Mostrame el report.
```

---

## Tips finales

- **Una pantalla por commit.** Si Codex te entrega 3 cambios juntos, pedile separar.
- **Cuando dude del layout**: pasale un screenshot del artboard del canvas + el componente actual lado a lado.
- **Mock primero, backend después.** No mezcles. Iterá la UX con mocks hasta que esté limpia, después migrá a Supabase.
- **El vault es lo crítico.** Antes de cualquier deploy con datos reales, validá el prompt 11 con un security review (que sea otra persona si podés).
