import { getDatabase } from "@kershell/db/client";
import { listProjectOverviews } from "@kershell/db/repositories/projects";
import { listVendorOptions } from "@kershell/db/repositories/subscriptions";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { SubscriptionForm } from "@/components/dashboard/SubscriptionForm";
import { requireOwner } from "@/lib/auth/owner-session";

export default async function NewSubscriptionPage() {
  const owner = await requireOwner();
  const [projects, vendors] = await Promise.all([listProjectOverviews(getDatabase(), owner.ownerId), listVendorOptions(getDatabase(), owner.ownerId)]);
  return <><PageHeader eyebrow="Finanzas · suscripciones" sub="Importes almacenados en unidades menores y asociaciones múltiples validadas." title="Nueva suscripción" /><SubscriptionForm projects={projects} vendors={vendors} /></>;
}
