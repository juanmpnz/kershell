# Kershell Platform

Sitio publico bilingue y prototipos del administrador privado de Kershell.

> Estado: el landing funciona, pero el administrador todavia no es una fuente de
> verdad de produccion. Conviven un prototipo en `/admin` y otro en `/dashboard`.
> No guardar credenciales reales hasta completar la migracion de seguridad y
> persistencia descrita en la especificacion.

## Stack actual

- Next.js 16 App Router, React 19 y TypeScript estricto.
- Tailwind CSS 4, Radix UI y Framer Motion.
- `next-intl` para ingles y espanol.
- Resend para el formulario de contacto.
- Supabase REST como persistencia transitoria de un documento JSONB en `/admin`.
- pnpm 9 como package manager.

## Inicio rapido

```bash
pnpm install --ignore-scripts --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

No copies valores reales a `.env.example` ni leas/imprimas `.env.local` en
salidas de agentes o CI.

## Comandos

| Comando | Uso |
| --- | --- |
| `pnpm dev` | Servidor local |
| `pnpm run typecheck` | Comprobacion TypeScript |
| `pnpm run build` | Build de produccion |
| `pnpm audit --prod` | Auditoria de dependencias runtime |

Todavia no existen scripts de lint ni tests. Ambos son requisitos del refactor,
no pasos que puedan darse por cumplidos hoy.

## Mapa actual

- `app/[locale]`: landing publico localizado.
- `app/admin`: administrador antiguo con persistencia JSONB y fallback local.
- `app/(dashboard)/dashboard`: administrador nuevo conectado a datos seed.
- `lib/dashboard`: tipos y store mock en memoria.
- `app/api`: contacto, login administrativo y estado JSONB.
- `supabase/admin-records.sql`: tabla transitoria, no modelo relacional final.
- `handoff`, `logo-handoff`, `app/admin/dashboard-handoff`: material de diseno
  historico que debe archivarse fuera del runtime durante el refactor.

## Arquitectura y trabajo futuro

- [Auditoria del repositorio](docs/repository-audit-2026-09-02.md)
- [Especificacion propuesta](docs/spec-platform.md)
- [Modelo de datos propuesto](docs/data-model-proposal.md)
- [Decisiones de arquitectura](docs/decisions)

Las reglas persistentes para agentes viven en [AGENTS.md](AGENTS.md) y
[CLAUDE.md](CLAUDE.md). Las skills canonicas estan en `.agents/skills`; las
skills de Claude referencian esa misma fuente desde `.claude/skills`.
