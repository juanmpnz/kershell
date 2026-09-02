# ADR-001: Separar sitio publico y administrador

## Estado

Aceptado

## Fecha

2026-09-02

## Contexto

El repositorio nacio como landing y ahora contiene un administrador privado. El
sitio tiene trafico anonimo, SEO, contenido cacheable y un formulario publico.
El admin maneja informacion operativa, sesiones y potencialmente referencias a
secretos. Compartir deployment mezcla superficies de ataque, ciclos de release
y configuracion.

## Decision

Convertir el repositorio en un workspace pnpm llamado `kershell-platform` con
`apps/site` y `apps/admin`. Compartir solo paquetes con una frontera real:
contratos de dominio, acceso PostgreSQL server-only, tokens/componentes visuales
y configuracion de tooling.

Seguir siendo un monolito modular: no introducir microservicios ni colas.

## Alternativas consideradas

### Una sola aplicacion Next.js con route groups

- Menos movimiento inicial y un solo deployment.
- Mantiene el admin expuesto en la misma aplicacion publica y acopla releases.
- Es aceptable como transicion, no como destino recomendado para un admin
  descrito como super privado.

### Repositorios independientes

- Aislamiento maximo y ciclos separados.
- Duplica configuracion, componentes y mantenimiento demasiado pronto.

## Consecuencias

- Dos builds/deployments, un unico lockfile y una sola estrategia de calidad.
- El admin puede vivir en un dominio/red privada y el site conservar CDN/cache.
- El movimiento debe hacerse con pruebas de caracterizacion y sin cambiar
  comportamiento en el mismo commit.

## Confirmacion

El propietario aprobo el renombrado y la separacion el 2026-09-02.
