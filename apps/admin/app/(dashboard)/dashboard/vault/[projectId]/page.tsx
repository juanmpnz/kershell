import { getDatabase } from "@kershell/db/client";
import { listCredentialReferences } from "@kershell/db/repositories/credential-references";
import { getProjectOverview } from "@kershell/db/repositories/projects";
import { projectIdSchema } from "@kershell/domain";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionNotice } from "@/components/dashboard/ActionNotice";
import { CredentialReferenceList } from "@/components/dashboard/CredentialReferenceList";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { requireOwner } from "@/lib/auth/owner-session";

export default async function VaultProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const owner = await requireOwner();
  const rawProjectId = (await params).projectId;
  const { notice } = await searchParams;
  const projectId = projectIdSchema.safeParse(rawProjectId);

  if (!projectId.success) {
    notFound();
  }

  const database = getDatabase();
  const [project, references] = await Promise.all([
    getProjectOverview(database, owner.ownerId, projectId.data),
    listCredentialReferences(database, owner.ownerId, projectId.data),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <>
      <PageHeader
        actions={
          <>
            <Link
              className="rounded-md border border-border px-3 py-2 text-sm text-text-dim"
              href={`/dashboard/vault/${project.id}/edit`}
            >
              Editar proyecto
            </Link>
            <Link
              className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-ink"
              href={`/dashboard/vault/${project.id}/credentials/new`}
            >
              Nueva referencia
            </Link>
          </>
        }
        eyebrow={
          <>
            <Link className="text-accent" href="/dashboard/vault">
              ← Vault
            </Link>{" "}
            / {project.code}
          </>
        }
        sub={project.summary}
        title={project.name}
      />
      <ActionNotice
        notice={typeof notice === "string" ? notice : undefined}
      />
      <CredentialReferenceList
        projectId={project.id}
        references={references}
      />
    </>
  );
}
