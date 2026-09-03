# Kershell Platform

Sitio publico bilingue y administrador privado de Kershell en un workspace.

> Estado: el landing funciona, pero el administrador todavia no es una fuente de
> verdad de produccion. `/dashboard` es la unica interfaz administrativa; las
> rutas `/admin` antiguas solo redirigen por compatibilidad. No guardar
> credenciales reales hasta completar la migracion de seguridad y persistencia.

## Stack actual

- Next.js 16 App Router, React 19 y TypeScript estricto.
- Tailwind CSS 4, Radix UI y Framer Motion.
- `next-intl` para ingles y espanol.
- Resend para el formulario de contacto.
- Workspace pnpm 9 con builds independientes.

## Inicio rapido

```bash
pnpm install --ignore-scripts --frozen-lockfile
cp apps/site/.env.example apps/site/.env.local
pnpm dev
```

El administrador usa `pnpm dev:admin` y su configuracion local vive en
`apps/admin/.env.local`. Permanece cerrado con `404` hasta configurar
`ADMIN_ENABLED=true`; cualquier otro valor mantiene cerradas la UI y las APIs.

No copies valores reales a ningun `.env.example` ni leas/imprimas archivos
`.env.local` en salidas de agentes o CI.

## Comandos

| Comando | Uso |
| --- | --- |
| `pnpm dev` | Servidor local |
| `pnpm dev:admin` | Administrador local en el puerto 3001 |
| `pnpm build:site` | Build aislado del landing |
| `pnpm build:admin` | Build aislado del administrador |
| `pnpm run lint` | ESLint estricto para codigo nuevo |
| `pnpm run test` | Tests automatizados con Vitest |
| `pnpm run typecheck` | Comprobacion TypeScript |
| `pnpm run build` | Build de produccion |
| `pnpm db:generate` | Genera migraciones SQL revisables desde Drizzle |
| `pnpm db:check` | Migra y prueba una base PostgreSQL 16 local desechable |
| `pnpm db:seed` | Carga fixtures sanitizadas en una base ya migrada |
| `pnpm audit --prod` | Auditoria de dependencias runtime |

La deuda de lint previa queda cuantificada por app en sus archivos
`eslint-suppressions.json`; cualquier infraccion nueva hace fallar el comando.

## Mapa actual

- `apps/site/app/[locale]`: landing publico localizado.
- `apps/admin/app/(dashboard)/dashboard`: administrador canonico conectado aun a seeds.
- `apps/admin/lib/dashboard`: tipos y store mock en memoria.
- `apps/site/app/api/contact`: unica API del sitio publico.
- `packages/config`: politica HTTP compartida por ambos despliegues.
- `packages/domain`: contratos runtime estrictos y DTOs seguros del negocio.
- `packages/db`: esquema Drizzle, migraciones SQL y tests PostgreSQL reales.
- `packages/ui`: tokens CSS compartidos.
- `handoff` y `logo-handoff`: material de diseno historico fuera del runtime.

## Arquitectura y trabajo futuro

- [Auditoria del repositorio](docs/repository-audit-2026-09-02.md)
- [Especificacion propuesta](docs/spec-platform.md)
- [Modelo de datos propuesto](docs/data-model-proposal.md)
- [Decisiones de arquitectura](docs/decisions)

Las reglas persistentes para agentes viven en [AGENTS.md](AGENTS.md) y
[CLAUDE.md](CLAUDE.md). Las skills canonicas estan en `.agents/skills`; las
skills de Claude referencian esa misma fuente desde `.claude/skills`.
