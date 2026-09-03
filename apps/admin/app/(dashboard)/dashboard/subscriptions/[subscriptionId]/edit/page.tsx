import { getDatabase } from "@kershell/db/client";
import { listProjectOverviews } from "@kershell/db/repositories/projects";
import { getSubscriptionOverview, listVendorOptions } from "@kershell/db/repositories/subscriptions";
import { subscriptionIdSchema } from "@kershell/domain";
import { notFound } from "next/navigation";

import { archiveSubscriptionAction, updateSubscriptionAction } from "@/app/(dashboard)/dashboard/subscriptions/actions";
import { ArchiveSubscriptionForm } from "@/components/dashboard/ArchiveSubscriptionForm";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SubscriptionForm } from "@/components/dashboard/SubscriptionForm";
import { requireOwner } from "@/lib/auth/owner-session";

export default async function EditSubscriptionPage({ params }: { params: Promise<{ subscriptionId: string }> }) {
  const { subscriptionId } = await params;
  const owner = await requireOwner();
  const id = subscriptionIdSchema.safeParse(subscriptionId);
  if (!id.success) notFound();
  const [subscription, projects, vendors] = await Promise.all([getSubscriptionOverview(getDatabase(), owner.ownerId, id.data), listProjectOverviews(getDatabase(), owner.ownerId), listVendorOptions(getDatabase(), owner.ownerId)]);
  if (!subscription) notFound();
  return <><PageHeader actions={<ArchiveSubscriptionForm action={archiveSubscriptionAction.bind(null, subscription.id)} name={subscription.name} />} eyebrow={`${subscription.vendorName} · ${subscription.currency}`} sub="Edición protegida y limitada al owner autenticado." title={`Editar ${subscription.name}`} /><SubscriptionForm action={updateSubscriptionAction.bind(null, subscription.id)} projects={projects} subscription={subscription} vendors={vendors} /></>;
}
