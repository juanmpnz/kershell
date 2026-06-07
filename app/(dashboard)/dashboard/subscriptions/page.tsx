import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SubscriptionsTable } from "@/components/dashboard/SubscriptionsTable";
import { getDashboardData } from "@/lib/dashboard/store";

export default function SubscriptionsPage() {
  const data = getDashboardData();

  return (
    <>
      <PageHeader
        actions={
          <>
            {/* TODO: wire CSV export once persistence moves out of the in-memory store. */}
            <button className="rounded-md border border-border px-3 py-2 text-sm text-text-dim transition hover:bg-surface" type="button">
              Exportar CSV
            </button>
            <a
              className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-ink transition hover:brightness-110"
              href="/dashboard/subscriptions?new=1"
            >
              Nueva
            </a>
          </>
        }
        eyebrow="Finanzas · suscripciones"
        sub="Servicios de terceros y proveedores. Edita cualquier fila para ver detalle, próximos cobros y notas del equipo."
        title="Suscripciones"
      />
      <Suspense fallback={<div className="p-8 text-sm text-text-dim">Cargando suscripciones...</div>}>
        <SubscriptionsTable projects={data.projects} subscriptions={data.subs} today={data.today} />
      </Suspense>
    </>
  );
}
