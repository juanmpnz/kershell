import { getDatabase } from "@kershell/db/client";
import { listSubscriptionOverviews } from "@kershell/db/repositories/subscriptions";
import Link from "next/link";

import { ActionNotice } from "@/components/dashboard/ActionNotice";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SubscriptionsTable } from "@/components/dashboard/SubscriptionsTable";
import { requireOwner } from "@/lib/auth/owner-session";

export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<{ notice?: string | string[] }> }) {
  const owner = await requireOwner();
  const { notice } = await searchParams;
  const subscriptions = await listSubscriptionOverviews(getDatabase(), owner.ownerId);

  return <>
    <PageHeader actions={<Link className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-ink" href="/dashboard/subscriptions/new">Nueva</Link>} eyebrow="Finanzas · suscripciones" sub="Servicios, proveedores, renovaciones y asociaciones a proyectos." title="Suscripciones" />
    <ActionNotice entity="subscription" notice={typeof notice === "string" ? notice : undefined} />
    <SubscriptionsTable subscriptions={subscriptions} />
  </>;
}
