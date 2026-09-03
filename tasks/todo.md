# Kershell Platform task list

## Task 1: Confirmar configuracion de seguridad e infraestructura

**Status:** completada el 2026-09-02; quedan verificaciones operativas de solo
lectura antes del despliegue.

**Acceptance:** dominio Workspace, owner, hostname, Better Auth/Drizzle, 2SV,
politica de secretos, SO, Docker y reverse proxy quedan registrados sin secretos.

**Verify:** ADR-002/003/004 y `apps/site/.env.example` son coherentes.

**Dependencies:** ninguna.

**Files:** `docs/spec-platform.md`, `docs/decisions/*`, `apps/site/.env.example`.

## Task 2: Parchear runtime y dependencias criticas

**Status:** completada el 2026-09-02.

**Acceptance:** Next.js pasa a la linea 16.3.x parcheada, React queda compatible,
Node 24 LTS queda fijado y no se mezclan otras actualizaciones mayores.

**Verify:** `pnpm audit --prod`, `pnpm run typecheck`, `pnpm run build`.

**Dependencies:** Task 1 solo para version de runtime del VPS.

**Files:** `package.json`, `pnpm-lock.yaml`, `.nvmrc`, docs de runtime.

## Task 3: Incorporar lint y tests unitarios

**Status:** completada el 2026-09-02. La deuda previa queda cuantificada en
`apps/site/eslint-suppressions.json` y las nuevas infracciones fallan el gate.

**Acceptance:** existen scripts `lint` y `test`; un test deliberadamente RED
demuestra el runner antes de implementar el primer contrato y despues queda GREEN.

**Verify:** `pnpm lint`, `pnpm test`, `pnpm run typecheck`.

**Dependencies:** Task 2.

**Files:** `package.json`, lockfile, configuracion ESLint, configuracion Vitest.

## Task 4: Caracterizar rutas actuales

**Status:** completada el 2026-09-02; tests cubren localizacion, redirect privado
y 401 de API. El smoke HTTP confirma landing 200 sin marcadores de secretos.

**Acceptance:** tests cubren landing localizado, redirect privado, 401 de API y
ausencia de secretos en pagina publica.

**Verify:** focused HTTP tests y build.

**Dependencies:** Task 3.

**Files:** maximo cuatro archivos bajo `apps/site/tests/characterization`.

## Task 5: Endurecer cabeceras y configuracion Next

**Status:** completada el 2026-09-02; politica verificada contra el servidor de
produccion local y documentada para el futuro endurecimiento con nonces.

**Acceptance:** CSP gradual, HSTS en produccion, anti-framing, no-sniff y
referrer policy aparecen; `X-Powered-By` y remote image wildcard desaparecen.

**Verify:** test HTTP RED/GREEN y build.

**Dependencies:** Task 4.

**Files:** `apps/site/next.config.ts`, tests de headers, documentacion CSP.

## Task 6: Crear workspace raiz

**Status:** completada el 2026-09-02; pnpm reconoce los futuros paquetes y todos
los gates del runtime raiz permanecen verdes.

**Acceptance:** pnpm reconoce `apps/*` y `packages/*` sin cambiar rutas actuales.

**Verify:** install congelado, scripts raiz, typecheck y build existentes.

**Dependencies:** Checkpoint 1.

**Files:** `pnpm-workspace.yaml`, `package.json`, configuracion TS raiz.

## Task 7: Mover runtime actual a `apps/site`

**Status:** completada el 2026-09-02; runtime y configuracion viven en
`apps/site`, los comandos raiz delegan al paquete y las 23 rutas se conservan.

**Acceptance:** configuracion y package del Next actual viven en `apps/site`; el
movimiento es mecanico y la salida caracterizada no cambia.

**Verify:** tests de Task 4 y `pnpm --filter @kershell/site build`.

**Dependencies:** Task 6.

**Files:** configuracion Next/PostCSS/TS/package; movimiento revisado aparte.

## Task 8: Mover landing publico

**Status:** completada el 2026-09-03; el build publico contiene solo landing,
i18n, SEO y contacto. La API administrativa responde 404 en este despliegue.

**Acceptance:** rutas localizadas, mensajes, componentes y public assets estan en
`apps/site`; no hay imports de dashboard/auth/DB.

**Verify:** tests de landing, build y smoke `/`, `/en`, `/es`, `/api/contact`.

**Dependencies:** Task 7.

**Files:** un grupo de directorio por incremento (`app`, `components`, i18n,
assets), verificado despues de cada movimiento.

## Task 9: Crear y extraer `apps/admin`

**Status:** completada el 2026-09-03; el dashboard y auth temporal compilan de
forma aislada, el administrador legado fue sustituido por redirecciones y la
app responde `404` salvo que `ADMIN_ENABLED=true` se configure explicitamente.

**Acceptance:** dashboard nuevo compila como app independiente tras una bandera
deshabilitada; `/admin` antiguo no se copia como segunda implementacion.

**Verify:** build admin y test de que la bandera falla cerrada.

**Dependencies:** Task 8.

**Files:** package/config admin y un grupo de rutas/componentes por incremento.

## Task 10: Definir contratos de dominio

**Status:** completada el 2026-09-03 con schemas Zod estrictos y tests de
proyectos, vendors, suscripciones y referencias externas de credenciales.

**Acceptance:** proyectos, vendors, suscripciones y credential references tienen
schemas runtime unicos, enums canonicos y DTOs sin valores secretos.

**Verify:** tests RED/GREEN de inputs validos, invalidos y estados imposibles.

**Dependencies:** Task 6.

**Files:** `packages/domain` con maximo un modulo y test por entidad/incremento.

## Task 11: Crear schema PostgreSQL y migracion inicial

**Status:** completada el 2026-09-03; migracion Drizzle inicial revisada y
probada desde cero contra PostgreSQL 16.15 local, limitado a loopback.

**Acceptance:** tablas, claves, checks e indices del modelo aprobado existen en
una migracion SQL revisable; PostgreSQL no queda publicado.

**Verify:** migrar desde cero y tests de constraints contra PostgreSQL real local.

**Dependencies:** Tasks 1 y 10; aprobacion Drizzle.

**Files:** `packages/db` schema/config, una migracion, un test de integracion.

## Task 12: Crear seed sanitizado e idempotente

**Status:** completada el 2026-09-03; dos ejecuciones conservan conteos,
asociaciones y total mensual, sin valores secretos ni emails reales.

**Acceptance:** dos ejecuciones producen mismos conteos; no contiene tokens,
passwords ni connection strings; asociaciones y totales coinciden con fixtures.

**Verify:** test RED/GREEN de idempotencia y escaneo de secretos.

**Dependencies:** Task 11.

**Files:** seed DB, fixture segura, test de importacion.

## Task 13: Implementar DAL server-only

**Status:** completada el 2026-09-03 para la primera entidad (proyectos): scope
por owner obligatorio, metricas derivadas, DTO minimo y fallos DB visibles.

**Acceptance:** queries requieren owner y devuelven DTOs minimos; importar el DAL
desde cliente falla en build; errores DB no activan fallback.

**Verify:** integration tests de scope, DTO y fallo visible.

**Dependencies:** Tasks 11 y 12.

**Files:** DB client, owner context, DAL de una entidad, tests.

## Task 14: Integrar Google Workspace auth

**Status:** completada el 2026-09-03; Better Auth esta montado con Google como
unico proveedor, sesiones y estado OAuth PostgreSQL, tokens OAuth cifrados e ID
token no persistido. El login temporal por password fue retirado.

**Acceptance:** Better Auth monta handler Google, usa sesiones PostgreSQL y solo
origins configurados; password/signup publico estan desactivados.

**Verify:** tests de configuracion, callback y sesion con provider stub.

**Dependencies:** Tasks 1, 11 y aprobacion ADR-004.

**Files:** auth config, route handler, env schema/example, tests.

## Task 15: Aplicar allowlist y owner authorization

**Acceptance:** `sub`, `email_verified`, `hd`, email exacto y usuario activo son
obligatorios en cada login; casos incorrectos no crean sesion valida.

**Verify:** tests RED/GREEN para cada claim y usuario revocado.

**Dependencies:** Task 14.

**Files:** policy auth, config schema, tests de policy.

## Task 16: Proteger todas las entradas del admin

**Acceptance:** DAL, acciones y handlers verifican owner; Proxy solo optimiza
redirect; logout/revocacion invalidan acceso directo.

**Verify:** HTTP tests 401/403, direct action invocation y revoked session.

**Dependencies:** Tasks 13 y 15.

**Files:** auth DAL, Proxy, una ruta/accion por incremento, tests.

## Task 17: Entregar proyectos CRUD

**Acceptance:** owner lista, crea, edita y archiva proyectos persistidos; estados
loading/empty/error/success y validacion estan visibles.

**Verify:** tests DB/API/UI y Playwright del flujo.

**Dependencies:** Task 16.

**Files:** un DAL/action/page/component/test por corte vertical.

## Task 18: Entregar suscripciones CRUD

**Acceptance:** CRUD persistido con dinero/currency/fechas validos, vendor y
proyectos multiples; totales se derivan de DB.

**Verify:** tests de precision, renovacion, asociaciones y Playwright.

**Dependencies:** Task 17.

**Files:** un DAL/action/page/component/test por corte vertical.

## Task 19: Entregar referencias de credenciales

**Acceptance:** CRUD solo de metadata/referencia opaca; HTML, RSC, APIs, logs y
exportaciones no contienen valores secretos.

**Verify:** tests de DTO, payload y escaneo E2E de no divulgacion.

**Dependencies:** Task 16 y decision ADR-003.

**Files:** contrato, DAL, page/component, tests.

## Task 20: Auditoria y settings

**Acceptance:** eventos append-only cubren auth y CRUD; settings no sensibles
persisten; metadata tiene allowlist y redaccion.

**Verify:** tests de inmutabilidad, cobertura de eventos y ausencia de secretos.

**Dependencies:** Tasks 17-19.

**Files:** schema/migration, DAL, UI settings, tests por incremento.

## Task 21: Retirar implementaciones temporales

**Acceptance:** desaparecen `/admin`, JSONB `admin_records`, fallback local,
store mock y seeds token-like; redirects temporales estan documentados.

**Verify:** busqueda sin referencias, tests de redirect, full suite y builds.

**Dependencies:** Checkpoint 5.

**Files:** una eliminacion logica por incremento; no mezclar con features.

## Task 22: Contenedores y red privada de datos

**Acceptance:** imagenes multi-stage ejecutan como non-root; Compose publica solo
80/443, PostgreSQL usa red/volume interno y health checks.

**Verify:** build de imagen, compose config y smoke local.

**Dependencies:** Tasks 16 y 21; inventario del VPS.

**Files:** Dockerfiles, Compose, ignore files, runbook.

## Task 23: Backup, restore y capacidad

**Acceptance:** backup cifrado sale del VPS, tiene retencion y alerta; restore en
base vacia reproduce conteos; disco/logs tienen limites.

**Verify:** restore drill documentado con timestamp y resultado.

**Dependencies:** Task 22 y destino de backup aprobado.

**Files:** scripts/runbook/configuracion de backup sin secretos.

## Task 24: CI y despliegue

**Acceptance:** CI construye imagen fuera del VPS y ejecuta lint, types, tests,
build, audit y secret scan; la imagen candidata pasa E2E contra PostgreSQL local
efimero antes de promoverse al unico entorno remoto, produccion.

**Verify:** pipeline verde, smoke HTTPS y rollback probado.

**Dependencies:** Tasks 22-23.

**Files:** workflow CI, scripts de smoke, runbook de deploy.
