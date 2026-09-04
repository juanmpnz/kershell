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

## Comprobacion posterior al despliegue

```bash
curl -I https://heykershell.com/
curl -I https://heykershell.com/admin/login
curl -I https://heykershell.com/admin/dashboard
```

La raiz debe servir el landing, login debe responder y dashboard sin sesion debe
redirigir a `/admin/login`.
