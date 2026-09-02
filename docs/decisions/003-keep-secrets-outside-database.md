# ADR-003: Mantener secretos fuera de la base de la aplicacion

## Estado

Propuesto

## Fecha

2026-09-02

## Contexto

El diseño del dashboard incluye un vault. La UI nueva recibe valores completos y
solo los mascara visualmente. El administrador antiguo implementa cifrado en el
navegador y guarda el blob dentro del mismo estado JSONB. Construir y operar un
password manager cambia de forma sustancial el riesgo del producto.

## Decision

La primera version almacena solo metadata y referencias opacas a un gestor de
secretos externo. La aplicacion no almacena passwords, API keys, private keys ni
connection strings.

Si se solicita un vault propio en el futuro, se diseña en un ADR nuevo con threat
model, gestion de claves externa a PostgreSQL, cifrado por envolvente,
reautenticacion, TTL de revelado, audit log append-only, rotacion y recuperacion.

## Alternativas consideradas

### Cifrado del lado cliente con passphrase

- El servidor no conoce el plaintext.
- Complica recuperacion, rotacion, auditoria y UX; una implementacion propia es
  facil de debilitar y el cliente sigue siendo una superficie de exfiltracion.

### AES-GCM server-side con una unica key de entorno

- Implementacion relativamente simple.
- La key y la aplicacion comparten dominio de compromiso; rotacion y backup son
  delicados y no ofrece las propiedades de un KMS/secret manager.

## Consecuencias

- Menor alcance y riesgo para poner en marcha proyectos/suscripciones primero.
- El dashboard enlaza al secreto sin recibir su valor.
- Exportaciones, logs, seeds y backups de la app no contienen secretos reales.
- Requiere seleccionar un gestor externo compatible con el flujo del propietario.
