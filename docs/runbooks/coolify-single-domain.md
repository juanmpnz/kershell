# Coolify: landing y admin en un dominio

## Rutas

- `apps/site`: `https://heykershell.com`
- `apps/admin`: `https://heykershell.com/admin`
- En el recurso admin, desactivar `Strip Prefixes`. Next.js debe recibir
  `/admin/...` completo.

Coolify prioriza la ruta `/admin` sobre la raiz. Ambos recursos deben estar
saludables; el site no debe usarse como fallback del admin.

## Autenticacion

En el recurso admin:

```dotenv
BETTER_AUTH_URL=https://heykershell.com
BETTER_AUTH_TRUSTED_ORIGINS=https://heykershell.com
```

Estas variables son origenes y no llevan `/admin`. La URI autorizada en Google
Cloud es:

```text
https://heykershell.com/admin/api/auth/callback/google
```

Next.js retira su `basePath` antes de invocar el Route Handler. La ruta de
autenticacion restaura `/admin` en la URL que entrega a Better Auth, sin duplicar
el prefijo ni perder cuerpo, cookies o parametros del callback. Esto no cambia
la configuracion de Coolify: `Strip Prefixes` debe seguir desactivado.

## Comprobacion posterior al despliegue

```bash
curl -I https://heykershell.com/
curl -I https://heykershell.com/admin/login
curl -I https://heykershell.com/admin/dashboard
curl -i https://heykershell.com/admin/api/auth/get-session
```

La raiz debe servir el landing, login debe responder y dashboard sin sesion debe
redirigir a `/admin/login`. `get-session` sin cookies debe devolver `200` con
cuerpo JSON `null`. Que el login cargue no basta para verificar la API de auth.
