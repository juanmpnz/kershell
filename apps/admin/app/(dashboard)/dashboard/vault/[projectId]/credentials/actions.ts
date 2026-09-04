"use server";

import { getDatabase } from "@kershell/db/client";
import {
  createCredentialReference,
  deleteCredentialReference,
  updateCredentialReference,
} from "@kershell/db/repositories/credential-references";
import {
  credentialReferenceIdSchema,
  projectIdSchema,
} from "@kershell/domain";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/auth/owner-session";
import {
  parseCredentialFormData,
  type CredentialActionState,
} from "@/lib/credentials/credential-form";

export async function createCredentialAction(
  projectId: string,
  _previousState: CredentialActionState,
  formData: FormData,
): Promise<CredentialActionState> {
  const owner = await requireOwner();
  const project = projectIdSchema.safeParse(projectId);

  if (!project.success) {
    return { message: "Proyecto inválido." };
  }

  const parsed = parseCredentialFormData(formData, project.data);

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revisá los campos.",
    };
  }

  try {
    await createCredentialReference(getDatabase(), owner.ownerId, parsed.data);
  } catch {
    return { message: "No se pudo guardar la referencia." };
  }

  revalidatePath(`/dashboard/vault/${project.data}`);
  redirect(`/dashboard/vault/${project.data}?notice=credential-created`);
}

export async function updateCredentialAction(
  projectId: string,
  referenceId: string,
  _previousState: CredentialActionState,
  formData: FormData,
): Promise<CredentialActionState> {
  const owner = await requireOwner();
  const project = projectIdSchema.safeParse(projectId);
  const reference = credentialReferenceIdSchema.safeParse(referenceId);

  if (!project.success || !reference.success) {
    return { message: "Referencia inválida." };
  }

  const parsed = parseCredentialFormData(formData, project.data);

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revisá los campos.",
    };
  }

  try {
    const updated = await updateCredentialReference(
      getDatabase(),
      owner.ownerId,
      reference.data,
      parsed.data,
    );

    if (!updated) {
      return { message: "La referencia ya no está disponible." };
    }
  } catch {
    return { message: "No se pudo actualizar la referencia." };
  }

  revalidatePath(`/dashboard/vault/${project.data}`);
  redirect(`/dashboard/vault/${project.data}?notice=credential-updated`);
}

export async function deleteCredentialAction(
  projectId: string,
  referenceId: string,
): Promise<void> {
  const owner = await requireOwner();
  const project = projectIdSchema.safeParse(projectId);
  const reference = credentialReferenceIdSchema.safeParse(referenceId);

  if (project.success && reference.success) {
    await deleteCredentialReference(
      getDatabase(),
      owner.ownerId,
      reference.data,
    );
  }

  if (project.success) {
    revalidatePath(`/dashboard/vault/${project.data}`);
    redirect(`/dashboard/vault/${project.data}?notice=credential-deleted`);
  }

  redirect("/dashboard/vault");
}
