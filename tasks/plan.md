# Implementation Plan: Kershell Platform

Estado: pendiente de revision humana

## Overview

Transformar la aplicacion actual en un workspace pnpm con landing publico y
administrador privado independientes. El administrador usara Google Workspace,
sesiones revocables y PostgreSQL self-hosted. Los seeds sanitizados inicializaran
proyectos, proveedores, suscripciones y referencias de credenciales.

El trabajo se entrega en cortes verificables. No se conecta ni modifica el VPS
hasta completar inventario, backup y ensayo local/staging.

## Decisiones confirmadas

- `apps/site` y `apps/admin` en un unico repositorio `kershell-platform`.
- PostgreSQL y aplicaciones en infraestructura propia; Supabase se elimina.
- Google Workspace continua como proveedor de identidad.
- Admin accesible desde Internet con HTTPS y controles de aplicacion.
- No hay datos reales: el seed sanitizado es la carga inicial.
- El servidor actual (2 vCPU, 4 GB RAM, 40 GB) sirve para el MVP de bajo trafico;
  imagenes y backups se construyen/guardan fuera del VPS.

## Decisiones pendientes

- Better Auth + Drizzle como combinacion concreta.
- Dominio Workspace, email owner y hostname del admin.
- Sistema operativo, Docker/Compose, reverse proxy y PostgreSQL existentes.
- Google Workspace 2-Step Verification obligatorio.
- Referencias externas versus un futuro vault propio.

## Dependency graph

```text
decisiones pendientes
       |
runtime parcheado + tests de caracterizacion
       |
workspace site/admin
       |
contratos de dominio
       |
PostgreSQL + migraciones + seed
       |
Google auth + sesiones
       |
proyectos CRUD
       |
suscripciones CRUD
       |
referencias de credenciales + auditoria
       |
retiro de mocks/admin antiguo
       |
contenedores + backup + CI + despliegue
```

## Phase 1: Safety baseline

1. Cerrar decisiones de auth, dominio, secretos y VPS.
2. Actualizar Next.js/React a versiones parcheadas y fijar Node.js 24 LTS.
3. Incorporar lint, Vitest y pruebas de caracterizacion HTTP.
4. Añadir cabeceras seguras y eliminar configuracion remota no utilizada.

### Checkpoint 1

- `pnpm audit --prod` sin hallazgos altos alcanzables.
- Typecheck, tests y build correctos.
- Landing, login y redirecciones conservan comportamiento documentado.

## Phase 2: Repository boundaries

5. Crear el workspace raiz sin mover codigo funcional.
6. Mover configuracion/runtime del Next actual a `apps/site`.
7. Mover landing, assets, i18n y componentes publicos a `apps/site`.
8. Crear `apps/admin` y trasladar solo el dashboard nuevo y sus componentes.
9. Extraer paquetes compartidos solo despues de observar duplicacion real.

Los movimientos son mecanicos: ninguna ruta cambia de comportamiento en el mismo
corte. Durante la transicion el admin anterior permanece inaccesible en
produccion mediante un feature flag seguro.

### Checkpoint 2

- Ambos builds se ejecutan independientemente.
- El site no importa codigo de auth, DB ni dashboard.
- El admin no contiene SEO, contacto ni rutas localizadas del landing.

## Phase 3: Data foundation

10. Definir contratos runtime de proyectos/suscripciones con tests RED primero.
11. Crear schema PostgreSQL/Drizzle y primera migracion revisable.
12. Crear seed idempotente, sanitizado y verificable.
13. Implementar DAL server-only y DTOs sin secretos.

### Checkpoint 3

- Una base vacia migra y recibe el seed dos veces sin duplicar datos.
- Constraints e integracion PostgreSQL pasan contra una instancia real local.
- Reiniciar la app no cambia ni pierde registros.

## Phase 4: Authentication

14. Integrar Google Workspace con Better Auth y sesiones PostgreSQL.
15. Añadir allowlist exacta, validacion de `sub`/`hd`/email verificado y owner.
16. Proteger cada DAL, Route Handler y Server Action; Proxy solo redirige.
17. Probar revocacion, logout, usuario incorrecto y callback manipulado.

### Checkpoint 4

- Solo el owner Workspace entra.
- Una sesion revocada deja de autorizar inmediatamente.
- Invocar endpoints directamente no evita autorizacion.

## Phase 5: Vertical product slices

18. Listar/crear/editar/archivar proyectos end-to-end.
19. Listar/crear/editar/archivar suscripciones end-to-end.
20. Asociar suscripciones a varios proyectos y calcular totales en DB.
21. Gestionar referencias de credenciales sin valores secretos.
22. Persistir settings no sensibles y audit events append-only.

Cada slice incluye schema si hace falta, DAL, accion/API, UI y tests antes de
avanzar al siguiente.

### Checkpoint 5

- El dashboard funciona exclusivamente sobre PostgreSQL.
- Todos los estados loading/empty/error/success estan cubiertos.
- Acciones sensibles aparecen en auditoria sin cuerpos ni secretos.

## Phase 6: Removal and operations

23. Retirar `/admin`, el JSONB `admin_records`, fallback local y mock store.
24. Eliminar o archivar fuera del runtime handoffs y seeds inseguros duplicados.
25. Crear imagenes multi-stage y Compose sin publicar PostgreSQL.
26. Configurar HTTPS/reverse proxy, firewall, health checks y resource limits.
27. Automatizar backup cifrado externo y probar restauracion.
28. Añadir CI con build fuera del VPS, tests, audit y escaneo de secretos.
29. Desplegar staging, ejecutar smoke/E2E y promover con rollback preparado.

## Capacity plan

En el VPS actual:

- reservar memoria para PostgreSQL y evitar builds locales de produccion;
- limitar contenedores y rotar logs;
- no almacenar la unica copia de backups en los 40 GB locales;
- medir RAM, CPU, disco y latencia antes de ampliar;
- escalar primero recursos verticales; separar PostgreSQL solo cuando metricas,
  disponibilidad o mantenimiento lo justifiquen.

## Risks and mitigations

| Riesgo | Impacto | Mitigacion |
| --- | --- | --- |
| Admin publico con auth incompleta | Critico | No desplegar hasta Checkpoint 4 y 2SV obligatorio |
| Secretos en seeds/browser | Critico | Sanitizar antes del workspace; DTO sin valores |
| Perdida de DB/disco lleno | Alto | Backup externo, alertas de disco y restore drill |
| OOM durante build | Alto | Construir imagen en CI, no en VPS |
| Dependencia auth vulnerable | Alto | Version fijada, audit, tests de abuso y upgrade policy |
| Refactor rompe landing | Medio | Caracterizacion previa y movimientos sin conducta |
| Dos fuentes de verdad | Alto | PostgreSQL unico; fallos visibles sin fallback |

## Review gate

No comenzar cambios de dependencias, estructura, schema ni servidor hasta que el
propietario apruebe este plan y resuelva las decisiones pendientes aplicables al
Checkpoint 1.
