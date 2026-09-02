# Spec: acceso administrativo con Google Workspace

## Objetivo

Sustituir el acceso administrativo por email y contraseña por Google OAuth,
usando Supabase Auth como proveedor de sesión. Sólo podrán entrar cuentas de
Google Workspace incluidas en una lista explícita de correos autorizados.

La primera persona usuaria es el propietario de Kershell. El flujo debe proteger
`/dashboard`, `/admin` y todas las APIs administrativas, y debe quedar preparado
para usar la misma identidad en las futuras tablas de Supabase.

## Decisiones de arquitectura

- Supabase Auth gestionará Google OAuth y la sesión SSR mediante cookies.
- `GOOGLE_WORKSPACE_ALLOWED_EMAILS` será una lista de correos normalizados,
  separada por comas y evaluada siempre en el servidor.
- El parámetro OAuth `hd=heykershell.com` mejorará la selección de cuenta, pero
  no será una barrera de seguridad. La autorización real comprobará el correo
  verificado devuelto por Google contra la lista permitida.
- La autenticación anterior por `ADMIN_PASSWORD` quedará deshabilitada y sus
  endpoints no seguirán aceptando credenciales.
- La migración de los datos demo a tablas reales es la siguiente fase. Esta fase
  sólo cambia identidad, sesión y protección de rutas.

## Stack

- Next.js 16, App Router y Proxy.
- React 19 y TypeScript.
- `@supabase/supabase-js` y `@supabase/ssr`, en sus versiones estables.
- Google OAuth configurado desde Supabase Auth.
- Vercel para producción y variables de entorno.

Antes de la integración se actualizará Next.js, como cambio aislado, a una
versión que corrija los avisos de seguridad detectados en 16.1.6.

## Contratos

### Configuración

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
GOOGLE_WORKSPACE_ALLOWED_EMAILS=owner@heykershell.com
```

Los secretos OAuth de Google se guardarán en Supabase, no en el repositorio ni
en variables públicas de Vercel.

### Rutas

```text
GET  /login                 Pantalla pública con "Continuar con Google"
GET  /auth/callback         Intercambia el código OAuth y valida el correo
POST /api/admin/logout      Cierra la sesión de Supabase
GET  /dashboard/**          Requiere una cuenta autorizada
GET  /admin/**              Requiere una cuenta autorizada
ALL  /api/admin/**          Requiere una cuenta autorizada, salvo logout
```

Los errores visibles usarán códigos estables en la URL de login:

```text
oauth_failed      No se pudo completar el intercambio OAuth
not_allowed       La cuenta Google no está autorizada
configuration     Falta configuración del servidor
```

### Autorización

```ts
export function isAllowedWorkspaceEmail(
  email: string | null | undefined,
  allowedEmails: ReadonlySet<string>,
) {
  return Boolean(email && allowedEmails.has(email.trim().toLowerCase()));
}
```

La UI nunca decidirá si una cuenta está autorizada. El callback, el Proxy y
las rutas API utilizarán el mismo helper del servidor.

## Comandos

```bash
pnpm install --ignore-scripts --frozen-lockfile
pnpm test
pnpm run typecheck
pnpm run build
pnpm audit --prod
pnpm dev
```

## Estructura del cambio

```text
app/login/                    Pantalla y botón de Google
app/auth/callback/            Callback OAuth del servidor
app/api/admin/logout/         Cierre de sesión
lib/supabase/                 Clientes SSR/browser y refresco de sesión
lib/auth/                     Configuración y autorización compartida
proxy.ts                      Protección de rutas y renovación de cookies
tests/auth/                   Pruebas de allowlist y redirecciones
docs/                         Especificación y configuración operativa
```

## Estilo de código

- TypeScript estricto, funciones pequeñas y nombres descriptivos.
- Configuración validada al arrancar o al cruzar la frontera de una petición.
- Errores genéricos hacia el navegador; detalles sólo en logs del servidor.
- Componentes visuales alineados con los tokens existentes de Kershell.

## Estrategia de pruebas

- Pruebas unitarias para normalización y allowlist de correos.
- Pruebas de rutas para callback rechazado, usuario no permitido y logout.
- Prueba HTTP local: visitante sin sesión redirige a `/login`.
- Verificación manual del OAuth real en Preview antes de promover a producción.
- Build, TypeScript y auditoría de dependencias como puertas de salida.

Se propone Vitest como runner porque el repositorio no tiene infraestructura de
pruebas. Su incorporación se hará en un cambio separado de las dependencias de
Supabase.

## Límites

### Siempre

- Validar el correo en servidor con una allowlist exacta.
- Usar `getUser()` o una verificación equivalente contra Supabase Auth para
  decisiones de autorización.
- Usar cookies seguras y preservar las cabeceras de respuesta de Supabase.
- Probar primero en un deployment Preview.

### Requiere confirmación

- El correo exacto que formará la allowlist inicial.
- Crear el proyecto Supabase y el cliente OAuth en Google Cloud.
- Añadir las dependencias de Supabase y Vitest.
- Promover la versión verificada a producción.

### Nunca

- Autorizar a cualquiera sólo por terminar en `@heykershell.com`.
- Confiar en el parámetro `hd` como control de acceso.
- Guardar client secrets, tokens o contraseñas en Git.
- Usar `localStorage` para la sesión.
- Mantener el login por contraseña como puerta alternativa oculta.

## Criterios de aceptación

- `/login` ofrece exclusivamente el acceso con Google Workspace.
- Una cuenta autorizada entra y llega a `/dashboard`.
- Una cuenta Google no incluida recibe `not_allowed` y no conserva sesión.
- Las rutas y APIs administrativas rechazan peticiones sin usuario autorizado.
- Cerrar sesión invalida las cookies y devuelve a `/login`.
- No aparece ningún secreto nuevo en Git o en el bundle del navegador.
- Las pruebas, TypeScript y build terminan correctamente.
- El deployment Preview funciona antes de modificar producción.

## Preguntas abiertas

1. ¿Cuál es el correo personal exacto de Google Workspace que será Owner?
2. ¿Ya existe un proyecto Supabase para Kershell o hay que crearlo?

## Fuentes oficiales

- Supabase SSR para Next.js:
  https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs
- Login con Google en Supabase Auth:
  https://supabase.com/docs/guides/auth/social-login/auth-google
- Proxy de Next.js:
  https://nextjs.org/docs/app/getting-started/proxy
- Google OpenID Connect y validación de `hd`:
  https://developers.google.com/identity/openid-connect/openid-connect
