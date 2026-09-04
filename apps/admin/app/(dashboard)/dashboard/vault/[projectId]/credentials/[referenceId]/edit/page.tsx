import { getDatabase } from "@kershell/db/client";
import { getCredentialReference } from "@kershell/db/repositories/credential-references";
import { getProjectOverview } from "@kershell/db/repositories/projects";
import {
  credentialReferenceIdSchema,
  projectIdSchema,
} from "@kershell/domain";
import { notFound } from "next/navigation";

import { deleteCredentialAction, updateCredentialAction } from "@/app/(dashboard)/dashboard/vault/[projectId]/credentials/actions";
import { CredentialReferenceForm } from "@/components/dashboard/CredentialReferenceForm";
import { DeleteCredentialReferenceForm } from "@/components/dashboard/DeleteCredentialReferenceForm";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { requireOwner } from "@/lib/auth/owner-session";

export default async function EditCredentialPage({
  params,
}: {
  params: Promise<{ projectId: string; referenceId: string }>;
}) {
  const owner = await requireOwner();
  const rawParams = await params;
  const projectId = projectIdSchema.safeParse(rawParams.projectId);
  const referenceId = credentialReferenceIdSchema.safeParse(
    rawParams.referenceId,
  );

  if (!projectId.success || !referenceId.success) {
    notFound();
  }

  const database = getDatabase();
  const [project, reference] = await Promise.all([
    getProjectOverview(database, owner.ownerId, projectId.data),
    getCredentialReference(database, owner.ownerId, referenceId.data),
  ]);

  if (!project || !reference || reference.projectId !== project.id) {
    notFound();
  }

  return (
    <>
      <PageHeader
        actions={
          <DeleteCredentialReferenceForm
            action={deleteCredentialAction.bind(
              null,
              project.id,
              reference.id,
            )}
            name={reference.name}
          />
        }
        eyebrow={`${reference.service} · ${reference.secretProvider}`}
        sub="Esta operación no lee ni modifica el secreto externo."
        title={`Editar ${reference.name}`}
      />
      <CredentialReferenceForm
        action={updateCredentialAction.bind(
          null,
          project.id,
          reference.id,
        )}
        projectId={project.id}
        reference={reference}
      />
    </>
  );
}
