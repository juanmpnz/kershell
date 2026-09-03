import { notFound } from "next/navigation";
import { ProjectVaultDetail } from "@/components/dashboard/ProjectVaultDetail";
import { getCredentials, getDashboardData, getProject } from "@/lib/dashboard/store";

export default async function VaultProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = getProject(projectId);

  if (!project) {
    notFound();
  }

  const data = getDashboardData();
  const credentials = getCredentials(project.id);
  const subscriptions = data.subs.filter((subscription) => subscription.project === project.id);

  return (
    <ProjectVaultDetail
      credentials={credentials}
      project={project}
      subscriptions={subscriptions}
      today={data.today}
    />
  );
}
