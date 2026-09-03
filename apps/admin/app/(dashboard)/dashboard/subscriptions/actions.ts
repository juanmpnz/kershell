"use server";

import { getDatabase } from "@kershell/db/client";
import {
  archiveSubscription,
  createSubscription,
  updateSubscription,
} from "@kershell/db/repositories/subscriptions";
import { subscriptionIdSchema } from "@kershell/domain";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/auth/owner-session";
import {
  parseSubscriptionFormData,
  type SubscriptionActionState,
} from "@/lib/subscriptions/subscription-form";

export async function createSubscriptionAction(
  _state: SubscriptionActionState,
  formData: FormData,
): Promise<SubscriptionActionState> {
  const owner = await requireOwner();
  const parsed = parseSubscriptionFormData(formData);

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revisá los campos antes de guardar.",
    };
  }

  try {
    await createSubscription(getDatabase(), owner.ownerId, parsed.data);
  } catch {
    return { message: "No se pudo guardar la suscripción." };
  }

  revalidatePath("/dashboard/subscriptions");
  revalidatePath("/dashboard/vault");
  redirect("/dashboard/subscriptions?notice=created");
}

export async function updateSubscriptionAction(
  subscriptionId: string,
  _state: SubscriptionActionState,
  formData: FormData,
): Promise<SubscriptionActionState> {
  const owner = await requireOwner();
  const id = subscriptionIdSchema.safeParse(subscriptionId);
  const parsed = parseSubscriptionFormData(formData);

  if (!id.success || !parsed.success) {
    return {
      fieldErrors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
      message: "Revisá los campos antes de guardar.",
    };
  }

  try {
    const updated = await updateSubscription(
      getDatabase(), owner.ownerId, id.data, parsed.data,
    );
    if (!updated) return { message: "La suscripción ya no está disponible." };
  } catch {
    return { message: "No se pudo actualizar la suscripción." };
  }

  revalidatePath("/dashboard/subscriptions");
  revalidatePath("/dashboard/vault");
  redirect("/dashboard/subscriptions?notice=updated");
}

export async function archiveSubscriptionAction(subscriptionId: string) {
  const owner = await requireOwner();
  const id = subscriptionIdSchema.safeParse(subscriptionId);

  if (id.success) {
    await archiveSubscription(getDatabase(), owner.ownerId, id.data);
  }

  revalidatePath("/dashboard/subscriptions");
  revalidatePath("/dashboard/vault");
  redirect("/dashboard/subscriptions?notice=archived");
}
