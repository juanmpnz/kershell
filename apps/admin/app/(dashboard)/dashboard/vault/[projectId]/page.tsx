import { getDatabase } from "@kershell/db/client";
import { getProjectOverview } from "@kershell/db/repositories/projects";
import { projectIdSchema } from "@kershell/domain";
import { notFound } from "next/navigation";
import { ActionNotice } from "@/components/dashboard/ActionNotice";
import { ProjectVaultDetail } from "@/components/dashboard/ProjectVaultDetail";
import { requireOwner } from "@/lib/auth/owner-session";
import { getCredentials, getDashboardData } from "@/lib/dashboard/store";

export default async function VaultProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const { projectId } = await params;
  const { notice } = await searchParams;
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

  const data = getDashboardData();
  const credentials = getCredentials(project.id);
  const subscriptions = data.subs.filter((subscription) => subscription.project === project.id);

  return (
    <>
      <ActionNotice notice={typeof notice === "string" ? notice : undefined} />
      <ProjectVaultDetail
        credentials={credentials}
        project={project}
        subscriptions={subscriptions}
        today={data.today}
      />
    </>
  );
}
