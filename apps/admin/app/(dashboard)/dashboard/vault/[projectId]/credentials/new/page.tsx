import { getDatabase } from "@kershell/db/client";
import { getProjectOverview } from "@kershell/db/repositories/projects";
import { projectIdSchema } from "@kershell/domain";
import { notFound } from "next/navigation";

import { createCredentialAction } from "@/app/(dashboard)/dashboard/vault/[projectId]/credentials/actions";
import { CredentialReferenceForm } from "@/components/dashboard/CredentialReferenceForm";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { requireOwner } from "@/lib/auth/owner-session";

export default async function NewCredentialPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const owner = await requireOwner();
  const projectId = projectIdSchema.safeParse((await params).projectId);

  if (!projectId.success) {
    notFound();
  }

  const project = await getProjectOverview(
    getDatabase(),
    owner.ownerId,
    projectId.data,
  );

  if (!project) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow={`${project.code} · referencia externa`}
        sub="Guarda metadatos y un ID opaco; el valor permanece en tu gestor de secretos."
        title="Nueva referencia"
      />
      <CredentialReferenceForm
        action={createCredentialAction.bind(null, project.id)}
        projectId={project.id}
      />
    </>
  );
}
