# Spec propuesta: Kershell Platform

Estado: direccion aprobada; decisiones de auth, secretos e infraestructura pendientes

## Decisiones confirmadas el 2026-09-02

- El repositorio se renombrara a `kershell-platform` y separara `site`/`admin`.
- El admin seguira usando Google Workspace, sin Supabase.
- Aplicacion, sesiones y PostgreSQL se alojaran en infraestructura propia.
- El admin sera accesible desde Internet, siempre mediante HTTPS y autenticacion.
- No existen datos reales que migrar: los seeds sanitizados inicializaran la base.
- El servidor actual ofrece 2 vCPU, 4 GB RAM y 40 GB de disco local. Es suficiente
  para una primera version de bajo trafico, pero los backups deben salir de esa
  maquina y el build de imagen no deberia competir con PostgreSQL en produccion.

## Objetivo

Convertir el repositorio actual en la plataforma operativa privada de Kershell,
manteniendo el landing publico. El unico usuario inicial del administrador es el
propietario. La plataforma debe centralizar proyectos, suscripciones, proveedores,
notas y referencias de credenciales con persistencia PostgreSQL durable.

Exito significa que los datos sobreviven reinicios y despliegues, toda mutacion
esta autenticada, hay backup restaurable y ningun secreto llega al navegador
antes de una accion explicita y auditada.

## Alcance inicial

Incluye:

- landing publico bilingue y formulario de contacto;
- acceso privado de un unico owner;
- proyectos, proveedores y suscripciones;
- configuracion basica y audit log;
- referencias a credenciales gestionadas fuera de la aplicacion;
- importacion controlada de datos no sensibles desde los seeds actuales.

No incluye inicialmente:

- equipos, invitaciones ni roles multiples;
- facturacion a clientes;
- un gestor de passwords propio;
- microservicios, colas o bus de eventos;
- sincronizaciones automaticas con terceros.

## Stack propuesto

- Workspace pnpm con dos aplicaciones Next.js sobre la ultima linea parcheada
  compatible de Next 16 y React 19.
- TypeScript estricto y validacion runtime en cada frontera.
- Tailwind CSS 4, componentes Radix existentes y tokens Kershell compartidos.
- PostgreSQL en el servidor del propietario, sin publicar su puerto en Internet.
- Drizzle ORM + migraciones SQL revisables como propuesta inicial; Prisma queda
  como alternativa si se prioriza una consola/cliente mas opinado.
- Better Auth con Google OIDC y sesiones PostgreSQL como propuesta de auth; debe
  validar `sub`, `email_verified`, el claim Workspace `hd` y una allowlist exacta.
- Node.js 24 LTS parcheado como runtime propuesto.
- Vitest para unidad/integracion y Playwright para flujos criticos.
- Contenedores y reverse proxy solo despues de conocer el servidor real.

La biblioteca de autenticacion y la politica de secretos quedan abiertas: ver
preguntas al final y ADR-004.

## Comandos actuales

```bash
pnpm install --ignore-scripts --frozen-lockfile
pnpm run typecheck
pnpm run build
pnpm audit --prod
pnpm dev
```

Comandos requeridos antes de considerar terminada la primera fase:

```bash
pnpm lint
pnpm test
pnpm test:e2e
pnpm db:check
pnpm db:migrate
```

Estos ultimos aun no existen y no deben documentarse como operativos hasta ser
implementados.

## Estructura objetivo

```text
apps/
  site/                 landing, i18n, SEO, contacto
  admin/                UI privada, auth y composicion server-side
packages/
  db/                   schema Drizzle, cliente server-only, migraciones
  domain/               contratos, validacion y reglas de negocio
  ui/                   tokens y componentes compartidos justificados
  config/               configuracion de TypeScript, lint y tests
docs/
  decisions/            ADRs
  runbooks/              deploy, backup, restore e incidentes
```

No mover carpetas y cambiar comportamiento en el mismo commit. Primero se crean
pruebas de caracterizacion; despues se mueve; finalmente se conecta persistencia.

## Estilo de codigo

```ts
import "server-only";

import { CreateProject } from "@kershell/domain/projects";
import { requireOwner } from "@/lib/auth/require-owner";
import { db } from "@kershell/db";

export async function createProject(input: unknown) {
  const owner = await requireOwner();
  const command = CreateProject.parse(input);

  return db.transaction(async (tx) => {
    const project = await tx.projects.create({ ...command, ownerId: owner.id });
    await tx.auditEvents.create({ action: "project.created", entityId: project.id });
    return { id: project.id, name: project.name };
  });
}
```

Reglas:

- nombres de dominio en ingles y textos visibles localizados;
- modulos server-only para base, auth y secretos;
- DTOs explicitos, sin devolver filas completas por comodidad;
- fechas ISO/UTC y dinero como unidades menores + moneda ISO;
- sin default exports fuera de convenciones exigidas por Next;
- sin `as SomeType` para cuerpos HTTP o respuestas externas.

## Estrategia de pruebas

- Unidad: validacion, calculos de renovacion, autorizacion y mapeos DTO.
- Integracion PostgreSQL: constraints, transacciones, migraciones y queries.
- HTTP: login, 401/403, validacion, CSRF/origen y limites de cuerpo.
- E2E: visitante no entra; owner crea/edita/elimina; logout invalida sesion;
  secretos no aparecen en HTML ni respuestas previas al reveal.
- Seguridad: auditoria de dependencias, busqueda de secretos y cabeceras.
- Restauracion: recuperar una copia en una base vacia y verificar conteos.

## Limites

### Siempre

- Verificar owner junto a cada lectura o mutacion sensible.
- Validar input antes de tocar la base.
- Usar migraciones versionadas y transacciones.
- Registrar acciones destructivas y accesos a material sensible.
- Ejecutar typecheck, tests, build y audit antes de desplegar.

### Requiere confirmacion

- Proveedor y flujo de autenticacion.
- Cambios de schema o migraciones sobre el servidor real.
- Nuevas dependencias, servicios externos o puertos publicos.
- Almacenar valores secretos dentro de la aplicacion.
- Renombrar el repositorio remoto y dominios de produccion.

### Nunca

- Guardar sesion o datos de empresa como fallback en `localStorage`.
- Exponer la base PostgreSQL directamente a Internet.
- Usar una service-role key desde cliente o como autorizacion universal.
- Enviar secretos en props/RSC payload para luego ocultarlos con CSS.
- Registrar passwords, tokens, connection strings o cuerpos sensibles.
- Aplicar una migracion sin backup y estrategia de rollback/forward-fix.

## Criterios de aceptacion de la primera version

- Hay un solo administrador canonico y las rutas antiguas se retiran o redirigen.
- El owner es el unico usuario autorizado y puede revocar todas sus sesiones.
- Proyectos y suscripciones tienen CRUD PostgreSQL con validacion y auditoria.
- Reiniciar aplicacion y base no pierde datos confirmados.
- El landing se despliega independientemente y conserva contenido/SEO/i18n.
- Un fallo de base muestra error; nunca conmuta a almacenamiento local.
- Existe backup automatizado y una restauracion probada.
- CI ejecuta lint, TypeScript, tests, build y audit sin hallazgos altos
  alcanzables no mitigados.
- Ningun secreto real esta en Git, logs, seeds, HTML ni bundles.

## Preguntas abiertas que bloquean fases concretas

1. ¿Que sistema operativo y arquitectura usa el VPS? ¿Docker y Docker Compose
   estan disponibles y existe ya Caddy, Traefik, Nginx u otro reverse proxy?
2. ¿PostgreSQL ya esta instalado? Si existe, indicar solo version y topologia,
   nunca passwords en el repositorio o chat.
3. ¿Cual es el dominio Workspace exacto, el correo owner y el dominio/subdominio
   canonico del admin?
4. ¿Se aprueba Better Auth + Drizzle para Google OIDC y sesiones PostgreSQL?
5. ¿Google Workspace obliga 2-Step Verification para la cuenta owner? Si no,
   debe habilitarse antes de publicar el admin.
6. Para credenciales: ¿se aprueba guardar inicialmente solo referencias, o se
   solicita construir un vault propio con una fase de seguridad independiente?
