# Auditoria tecnica del repositorio

Fecha: 2026-09-02

## Resumen ejecutivo

El landing esta en buen estado como presentacion publica y el proyecto compila,
pero el administrador no debe recibir datos reales todavia. Existen dos
implementaciones incompatibles: `/admin` persiste un documento JSONB completo y
puede caer a almacenamiento local; `/dashboard` usa datos seed y mutaciones en
memoria. Ninguna constituye un modelo PostgreSQL relacional ni una fuente de
verdad durable.

La recomendacion es conservar el stack React/Next/TypeScript, actualizarlo a una
version con parches de seguridad y convertir el repositorio en una plataforma
con dos aplicaciones desplegables: sitio publico y admin privado. El admin debe
usar una capa de acceso a datos exclusivamente de servidor, PostgreSQL con
migraciones y autenticacion con defensa en profundidad.

## Lo que funciona

- `pnpm run typecheck`: correcto.
- `pnpm run build`: correcto; genera 23 rutas.
- El landing publico esta localizado en ingles y espanol.
- El formulario de contacto limita tamano, escapa HTML, comprueba origen y usa
  un honeypot.
- Las paginas `/dashboard` y `/admin` redirigen a `/login` sin sesion.
- `/api/admin/state` rechaza una peticion sin sesion con `401`.
- `.env.local`, `.vercel`, artefactos de TypeScript y `.DS_Store` estan
  ignorados correctamente.

## Hallazgos criticos

### 1. Dependencias vulnerables

`pnpm audit --prod` informa 39 avisos: 18 altos, 17 moderados y 4 bajos. El foco
es `next@16.1.6`; el propio audit indica parches posteriores y `pnpm outdated`
ofrece `16.3.4`. La actualizacion debe ser un cambio aislado, seguida de build,
tests HTTP y una nueva auditoria. No usar una reparacion forzada.

### 2. Dos administradores sin una fuente de verdad comun

- `app/admin/AdminDashboard.tsx` contiene un administrador monolitico de mas de
  1200 lineas, con sus propios tipos y cifrado en cliente.
- `app/(dashboard)/dashboard` contiene la UI nueva y usa otro conjunto de tipos
  desde `lib/dashboard/schema.ts`.
- Ambos modelos usan vocabularios diferentes (`activa`/`active`,
  `activo`/`live`) y no son intercambiables.

La ruta final debe ser una sola. No conviene conectar ambas a la base de datos.

### 3. Persistencia transitoria y fragil

`supabase/admin-records.sql` crea una unica fila por email cuyo campo `state`
contiene todo el administrador como JSONB. Esto impide claves foraneas,
restricciones por entidad, consultas eficientes, auditoria fina y actualizaciones
concurrentes seguras.

El `PUT /api/admin/state`:

- acepta un cast TypeScript sin validacion runtime;
- reemplaza el agregado completo;
- no limita el tamano del cuerpo;
- no implementa versionado ni control de escrituras perdidas;
- usa la service-role key para todas las operaciones.

Si Supabase falla, el administrador antiguo cambia silenciosamente a
`localStorage`, creando dos fuentes de verdad y riesgo de perdida de datos.

### 4. El dashboard nuevo sigue siendo mock

`lib/dashboard/store.ts` clona un seed en una variable global. En un runtime con
varios procesos o reinicios, ese estado no es durable. Ademas, componentes
cliente importan funciones mutadoras de ese modulo, por lo que las ediciones
solo actualizan memoria del navegador y se pierden.

El build prerenderiza varias rutas del dashboard como estaticas, confirmando que
los datos actuales se incorporan al resultado de build y no se leen desde una
base real por peticion.

### 5. El vault nuevo expone el secreto antes de revelarlo

Los campos `CredentialField.v` completos llegan a componentes cliente. El boton
de revelar solo alterna la mascara visual. Los valores ya estan disponibles en
el HTML/RSC payload o JavaScript del navegador. Los seeds tambien contienen
cadenas con apariencia de tokens y passwords; aunque sean ficticias, entrenan un
patron inseguro y disparan escaneres de secretos.

No se deben introducir secretos reales en esta implementacion. Para la primera
version, guardar metadatos y una referencia a un gestor de secretos externo. Si
mas adelante se aprueba un vault propio, necesitara cifrado por envolvente con
una clave fuera de PostgreSQL, revelado server-side, reautenticacion y auditoria.

### 6. Autenticacion insuficiente para el objetivo

El login actual compara un SHA-256 rapido de una password. SHA-256 no es una
funcion adecuada para almacenar passwords, no existe rate limit del login y las
sesiones HMAC no se pueden revocar en servidor antes de expirar. La cookie tiene
buenas opciones basicas (`httpOnly`, `sameSite`, `secure` en produccion), pero no
compensa esas carencias.

Existe una especificacion no confirmada para Google Workspace + Supabase Auth.
La direccion nueva de servidor propio puede implicar otro proveedor o sesiones
propias en PostgreSQL. Esta decision debe cerrarse antes de implementar auth.

## Hallazgos altos y medios

- No hay Content Security Policy, HSTS, `X-Content-Type-Options`, politica de
  framing ni `Referrer-Policy`; se expone `X-Powered-By`.
- El rate limit de contacto es un `Map` local: se reinicia y no se comparte entre
  replicas. La IP se toma de headers que solo son fiables detras de un proxy
  controlado.
- `next.config.ts` permite imagenes remotas desde cualquier host aunque no se usa
  `next/image`; es una superficie innecesaria.
- No existen tests, runner, lint ni CI. El `package.json` solo ofrece dev, build,
  start y typecheck.
- No hay logs estructurados, metricas, trazas ni alertas.
- No hay estrategia de backup, restauracion probada ni migraciones versionadas.
- El runtime no esta fijado: la auditoria se ejecuto con Node `24.1.0`, mientras
  el proyecto declara tipos de Node 20 y no incluye `engines`, `.nvmrc` ni
  configuracion equivalente.
- El README original no describia el sistema real.
- La misma UI/handoff esta duplicada en `handoff`, `logo-handoff` y
  `app/admin/dashboard-handoff`.
- El nombre del paquete y repositorio (`kershell-landing`) ya no representa el
  producto.
- Hay configuracion de dominio inconsistente entre `kershell.io`,
  `heykershell.com`, `kershell.dev` y el nombre de la organizacion GitHub. Debe
  confirmarse el dominio canonico antes de auth, cookies, CSP y SEO.

## Arquitectura recomendada

```text
Internet
   |
   +--> site (publico, cacheable) ------> contacto/Resend
   |
   `--> acceso privado/VPN ------------> admin Next.js
                                             |
                                      DAL server-only
                                             |
                                        PostgreSQL
                                             |
                                  backups + audit log
```

El destino de repositorio propuesto es:

```text
apps/site       landing publico
apps/admin      administrador privado
packages/db     schema, cliente y migraciones PostgreSQL
packages/domain contratos y reglas sin React
packages/ui     tokens y componentes realmente compartidos
packages/config configuracion comun de TypeScript y tooling
```

Es un monorepo pequeno, no microservicios. Cada app puede desplegarse de forma
independiente y el admin no queda acoplado al trafico ni superficie del landing.

## Orden seguro del refactor

1. Resolver las preguntas abiertas de `docs/spec-platform.md`.
2. Actualizar Next/React y cerrar vulnerabilidades sin mover carpetas.
3. Introducir tests, lint y CI sobre el comportamiento existente.
4. Crear el workspace y mover primero el landing sin cambiar su salida.
5. Mover solo `/dashboard` como admin canonico; mantener `/admin` en solo lectura
   hasta migrar cualquier dato real y despues retirarlo.
6. Crear PostgreSQL, migraciones y DAL; importar seed no sensible.
7. Conectar proyectos y suscripciones como primer corte vertical.
8. Implementar autenticacion elegida y proteccion de infraestructura.
9. Migrar configuracion, notas y auditoria.
10. Integrar referencias de secretos; no construir el vault como CRUD comun.
11. Ejecutar migracion verificada, backup y prueba de restauracion.

## Fuentes oficiales usadas

- Next.js recomienda un DAL server-only, DTOs minimos y autorizacion junto a la
  fuente de datos: https://nextjs.org/docs/app/guides/authentication
- Next.js 16.3 incorpora mejoras de rendimiento y documentacion versionada para
  agentes: https://nextjs.org/blog/next-16-3
- El programa de seguridad de Next exige mantenerse en versiones parcheadas:
  https://nextjs.org/blog/nextjs-security-release-august-2026-update
- Supabase documenta clientes separados server/browser y RLS cuando se expone su
  Data API: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Drizzle soporta transacciones y savepoints en PostgreSQL:
  https://orm.drizzle.team/docs/transactions
