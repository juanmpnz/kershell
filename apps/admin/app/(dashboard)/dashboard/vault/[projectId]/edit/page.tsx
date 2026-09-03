import { getDatabase } from "@kershell/db/client";
import { getProjectOverview } from "@kershell/db/repositories/projects";
import { projectIdSchema } from "@kershell/domain";
import { notFound } from "next/navigation";

import {
  archiveProjectAction,
  updateProjectAction,
} from "@/app/(dashboard)/dashboard/vault/actions";
import { ArchiveProjectForm } from "@/components/dashboard/ArchiveProjectForm";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProjectForm } from "@/components/dashboard/ProjectForm";
import { requireOwner } from "@/lib/auth/owner-session";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const owner = await requireOwner();
  const parsedProjectId = projectIdSchema.safeParse(projectId);

  if (!parsedProjectId.success) {
    notFound();
  }

  const project = await getProjectOverview(
    getDatabase(),
    owner.ownerId,
    parsedProjectId.data,
  );

  if (!project) {
    notFound();
  }

  const updateAction = updateProjectAction.bind(null, project.id);
  const archiveAction = archiveProjectAction.bind(null, project.id);

  return (
    <>
      <PageHeader
        actions={
          <ArchiveProjectForm
            action={archiveAction}
            projectName={project.name}
          />
        }
        eyebrow={`${project.code} · configuración`}
        sub="Los cambios se validan en el servidor y conservan el aislamiento por owner."
        title={`Editar ${project.name}`}
      />
      <ProjectForm
        action={updateAction}
        cancelHref={`/dashboard/vault/${project.id}`}
        project={project}
      />
    </>
  );
}
