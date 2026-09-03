# ADR-005: Despliegue sin entorno de staging persistente

## Estado

Aceptado

## Fecha

2026-09-03

## Contexto

Kershell tendra inicialmente un unico propietario, poco trafico y una sola
infraestructura operativa. Mantener un entorno de staging permanente duplicaria
configuracion, secretos y trabajo operativo antes de que esa complejidad aporte
valor suficiente.

## Decision

No mantener un entorno de staging desplegado. El unico entorno remoto sera
produccion y no se desplegara hasta que el codigo alcance los criterios de
aceptacion de la primera version.

La ausencia de staging no elimina las verificaciones previas. Antes de cada
cambio de produccion se debe:

- ejecutar la suite completa y los smoke tests contra contenedores locales;
- crear una base PostgreSQL efimera desde cero, aplicar todas las migraciones y
  verificar los invariantes y seeds aprobados;
- construir y probar localmente la misma imagen inmutable que se promovera;
- disponer de un backup externo reciente y haber probado su restauracion;
- documentar rollback o forward-fix antes de aplicar una migracion real;
- desplegar con el administrador deshabilitado cuando el cambio lo permita y
  realizar un smoke HTTPS antes de habilitarlo.

Las migraciones de produccion requieren confirmacion humana explicita. Nunca se
ejecutan automaticamente al arrancar la aplicacion.

## Consecuencias

- Se reduce el consumo y la carga operativa del servidor inicial.
- Las pruebas locales reproducibles, las imagenes inmutables y el restore drill
  pasan a ser barreras obligatorias de promocion.
- Algunas diferencias exclusivas de la infraestructura remota solo se detectan
  durante un despliegue controlado, por lo que se exige bandera fail-closed,
  observabilidad, smoke inmediato y capacidad de rollback.
- Se reconsiderara un staging persistente cuando haya mas usuarios, integraciones,
  cambios frecuentes o evidencia de que el riesgo operativo lo justifica.
