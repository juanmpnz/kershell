# Kershell Dashboard — Handoff a Codex

Paquete para que Codex (o cualquier agente AI de coding) implemente el **Dashboard interno de Kershell** sobre tu stack Next.js + Tailwind, reusando el sistema de diseño Console que ya migraste para el landing.

> **Pre-requisito.** Asumimos que ya aplicaste el handoff del landing (`/handoff` original). Tokens (`globals.css`, `tailwind.config`), fuentes (Geist + Geist Mono) y branding (`KMonogram`, `Logo`) **ya están en tu repo**. Acá NO los repetimos.

## Qué hay acá

```
dashboard-handoff/
├── README.md              ← este archivo (empezá acá)
├── SPEC.md                ← spec completo de pantallas + componentes
├── CODEX-PROMPTS.md       ← prompts secuenciales para Codex
├── data/
│   ├── schema.ts          ← tipos TypeScript (Project, Subscription, Credential)
│   └── seed.ts            ← datos demo (los mismos del canvas)
├── components/
│   ├── DashSidebar.tsx    ← sidebar del dashboard
│   ├── DashTopbar.tsx     ← topbar con breadcrumb + search
│   ├── PageHeader.tsx     ← cabecera de cada pantalla
│   ├── KPI.tsx            ← tarjeta de KPI
│   ├── Badge.tsx          ← chip de estado / categoría
│   ├── Modal.tsx          ← modal genérico
│   ├── Toast.tsx          ← hook + render de toasts
│   ├── CredentialCard.tsx ← tarjeta de credencial (reveal/copy)
│   └── SubsTable.tsx      ← tabla de suscripciones
└── screens/
    ├── 00-login.md
    ├── 01-overview.md
    ├── 02-subscriptions.md
    ├── 03-vault-list.md
    ├── 04-vault-detail.md
    └── 05-settings.md
```

## Cómo usarlo

### 1. Pegá la carpeta entera en la raíz de tu repo
Quedará algo así:
```
mi-repo/
├── app/
├── components/
├── handoff/                ← el del landing
└── dashboard-handoff/      ← este
```

### 2. Abrí Codex en la raíz y arrancá con el Prompt 0
Cada prompt en `CODEX-PROMPTS.md` es una tarea acotada. Validá después de cada uno.

### 3. Decisión clave de routing
El dashboard vive bajo `/app/(dashboard)/...` (route group) detrás de auth.
- Login en `/login` (público)
- Resto en `/dashboard`, `/dashboard/subscriptions`, `/dashboard/vault`, `/dashboard/vault/[projectId]`, `/dashboard/settings`
- Layout específico con sidebar + topbar persistentes

### 4. Referencia visual
- El prototipo del canvas está en `dashboard.html` del proyecto Claude. Si Codex tiene dudas de un layout, mandale un screenshot del artboard correspondiente.

## Tips para Codex

- **NO le des SPEC.md entero de una.** Es mucho contexto. Mejor un prompt por pantalla (CODEX-PROMPTS.md ya viene cortado así).
- **Backend no está en este paquete.** Las pantallas son visuales + estado local. Cuando metas backend (Supabase / Postgres + Drizzle / Prisma), pasale los tipos de `data/schema.ts` y pedile que mantenga la forma.
- **El vault es lo sensible.** Antes de meter encryption-at-rest, server-side reveal, audit log etc., dejá las pantallas funcionando con datos mock. Iterá UX primero, seguridad después.
- **Container queries:** seguí usándolas como en el landing, especialmente en main + sidebar.

## Stack sugerido cuando llegue el backend
- **Auth:** Clerk, NextAuth o Supabase Auth — recomendado Supabase porque ya servirá tabla
- **DB:** Supabase Postgres
- **Encryption del vault:** valores `secret` cifrados en server, key en env. Reveal pasa por una server action que loguea quién y cuándo.
- **i18n:** mismo sistema que el landing (ES por default).
