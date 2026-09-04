# Inventario actual del servidor

Estado: informado por el propietario el 2026-09-02; pendiente de verificacion de
solo lectura antes del primer despliegue.

## Host

- Hetzner Cloud CX23 en Nuremberg.
- Ubuntu 24.04.1 LTS, kernel 6.8.0-52-generic, x86_64.
- 2 vCPU, 4 GB RAM, 40 GB de disco local.
- 4 GB de swap configurados manualmente; confirmar persistencia tras reinicio con
  `free -h`.

## Plataforma de contenedores

- Docker 27.5.1 con BuildKit y Buildx.
- Docker Compose plugin v2 (`docker compose`).
- Coolify 4.3.14 autoalojado.
- Traefik 3.6 gestionado por el contenedor `coolify-proxy`.
- Configuracion del proxy en `/data/coolify/proxy/docker-compose.yml`.
- IPv6 desactivado en `/etc/docker/daemon.json` por compatibilidad operativa con
  Coolify en este host.
- Certificados Let's Encrypt gestionados por Coolify. El dominio propio
  seleccionado es `heykershell.com`; su resolucion hacia este servidor debe
  verificarse antes de emitir el certificado definitivo.

Coolify ejecuta `coolify`, `coolify-db`, `coolify-redis`, `coolify-realtime` y
`coolify-proxy`. Antes de añadir servicios se mediran memoria, swap, disco,
contenedores y conexiones existentes sin imprimir variables o secretos.

## PostgreSQL

- Recurso PostgreSQL 16 de Coolify para ediFlow, solo en red Docker interna.
- Base de ediFlow: `ediflow_demo`.
- `coolify-db` es otra instancia, PostgreSQL 15 Alpine, privada de Coolify.
- La base `postgres` se considera la base administrativa estandar y no se elimina
  sin demostrar que es un artefacto prescindible y tener backup.
- Kershell tendra base y rol exclusivos. No reutilizara `ediflow_demo` ni
  `coolify-db`.

La decision entre otra base dentro de la instancia PostgreSQL 16 o un recurso
Coolify separado depende de las metricas. Compartir proceso ahorra RAM; separar
recurso reduce acoplamiento operativo. En ambos casos, roles, base, backups y
limites de conexiones seran independientes.

## Comprobaciones previas al despliegue

Ejecutar de forma interactiva en el VPS, sin copiar variables de entorno:

```bash
free -h
df -h
docker stats --no-stream
docker compose version
docker version
```

No ejecutar comandos de borrado, no publicar 5432 y no inspeccionar el contenido
de variables o archivos de secretos durante este inventario.
