# ADR-004: Identidades Google con autenticacion self-hosted

## Estado

Aceptado

## Fecha

2026-09-02

## Contexto

El propietario quiere conservar Google Workspace como identidad, retirar
Supabase y servir el administrador desde infraestructura propia accesible por
Internet. Se necesitan sesiones revocables y una autorizacion estricta de un
unico owner.

## Decision

Usar Better Auth con su adaptador Drizzle/PostgreSQL y proveedor Google. La base
de datos propia almacenara usuarios, cuentas y sesiones revocables.

Las identidades permitidas son una cuenta Workspace corporativa y una cuenta
Google personal, configuradas mediante una allowlist privada en Coolify. Ambas
representan al mismo propietario logico, aunque Better Auth mantenga cuentas
externas distintas. La autorizacion exigira:

- issuer y audience validos verificados por la biblioteca;
- `sub` de Google como identificador externo estable;
- `email_verified = true`;
- email normalizado incluido en `ADMIN_ALLOWED_EMAILS`;
- usuario local activo.

Para la identidad corporativa tambien se exige el claim `hd=heykershell.com`.
La cuenta personal no pertenece a un hosted domain y no debe fallar por la
ausencia de `hd`. Esta excepcion se vincula al email exacto de la allowlist y no
permite cualquier cuenta personal.

Solo se habilita Google; email/password, signup publico, account linking y otros
providers permanecen desactivados. `trustedOrigins` contiene una lista explicita.
Cada DAL/Route Handler/Server Action vuelve a verificar sesion y owner.

La version fijada `better-auth@1.7.2` crea el namespace sintetico
`local:oauth:google` para la identidad de cuenta directamente en su runtime. Los
tipos publicados por esa version no exponen la opcion documental
`account.identityStrategy`; no se fuerza mediante cast y el namespace requerido
queda protegido por constraint y prueba de integracion PostgreSQL.

Las dos cuentas autorizadas tienen 2-Step Verification. La funcionalidad TOTP de
Better Auth no se asume como segunda capa para OAuth social, porque no bloquea
esos flujos por defecto.

## Alternativas consideradas

### Auth.js

- Proyecto maduro y ampliamente conocido en Next.js.
- Tambien resolveria Google + adaptador PostgreSQL; se descarta solo si Better
  Auth pasa la prueba de integracion y auditoria con menos codigo propio.

### OAuth manual

- Menos dependencias.
- Eleva mucho el riesgo en state/nonce, callbacks, cookies, vinculacion de cuentas
  y revocacion; no se justifica.

### Mantener Supabase Auth

- Ya estaba especificado y ofrece flujo SSR conocido.
- Contradice la decision de autocontener datos y sesiones en el servidor propio.

## Consecuencias

- Se añade una dependencia sensible que requiere version fijada, auditoria y
  pruebas de callback/session revocation.
- Se requieren credenciales OAuth en Google Cloud y URLs finales antes de probar
  produccion.
- El identificador interno nunca sera el email; el email sigue siendo una barrera
  adicional y dato actualizable.
- La politica de 2-Step Verification se administra en Google Workspace.

## Fuentes

- Better Auth para Next.js: https://better-auth.com/docs/integrations/next
- Better Auth con Drizzle: https://better-auth.com/docs/adapters/drizzle
- Seguridad y 2FA de Better Auth: https://better-auth.com/docs/reference/security y
  https://better-auth.com/docs/plugins/2fa
- Validacion OAuth previa a emitir sesion:
  https://better-auth.com/docs/concepts/oauth#validate-oauth-user-info
- Claims OIDC de Google:
  https://developers.google.com/identity/openid-connect/reference
