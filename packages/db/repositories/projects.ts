import "server-only";

import { projectSchema, type Project } from "@kershell/domain";
import {
  and,
  asc,
  count,
  eq,
  isNull,
  notInArray,
  sql,
} from "drizzle-orm";

import type { KershellDatabase } from "../client";
import {
  credentialReferences,
  projects,
  projectSubscriptions,
  projectTechnologies,
  subscriptions,
} from "../schema";

export type ProjectOverviewDto = Pick<
  Project,
  | "id"
  | "name"
  | "code"
  | "status"
  | "stage"
  | "summary"
  | "color"
  | "startedOn"
  | "createdAt"
  | "updatedAt"
> & {
  credentialReferenceCount: number;
  monthlyAmountMinor: number;
  technologies: string[];
};

export async function listProjectOverviews(
  db: KershellDatabase,
  ownerId: string,
): Promise<ProjectOverviewDto[]> {
  const [projectRows, technologyRows, credentialRows, subscriptionRows] =
    await Promise.all([
      db
        .select({
          id: projects.id,
          ownerId: projects.ownerId,
          name: projects.name,
          code: projects.code,
          status: projects.status,
          stage: projects.stage,
          summary: projects.summary,
          color: projects.color,
          startedOn: projects.startedOn,
          archivedAt: projects.archivedAt,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
        })
        .from(projects)
        .where(and(eq(projects.ownerId, ownerId), isNull(projects.archivedAt)))
        .orderBy(asc(projects.name)),
      db
        .select({
          projectId: projectTechnologies.projectId,
          name: projectTechnologies.name,
        })
        .from(projectTechnologies)
        .innerJoin(
          projects,
          eq(projectTechnologies.projectId, projects.id),
        )
        .where(and(eq(projects.ownerId, ownerId), isNull(projects.archivedAt)))
        .orderBy(
          asc(projectTechnologies.projectId),
          asc(projectTechnologies.position),
        ),
      db
        .select({
          projectId: credentialReferences.projectId,
          total: count(credentialReferences.id),
        })
        .from(credentialReferences)
        .where(eq(credentialReferences.ownerId, ownerId))
        .groupBy(credentialReferences.projectId),
      db
        .select({
          projectId: projectSubscriptions.projectId,
          monthlyAmountMinor: sql<string>`coalesce(sum(
            case ${subscriptions.billingInterval}
              when 'YEARLY' then ${subscriptions.amountMinor} / 12
              else ${subscriptions.amountMinor}
            end
          ), 0)`,
        })
        .from(projectSubscriptions)
        .innerJoin(
          subscriptions,
          and(
            eq(projectSubscriptions.subscriptionId, subscriptions.id),
            eq(projectSubscriptions.ownerId, subscriptions.ownerId),
          ),
        )
        .where(
          and(
            eq(projectSubscriptions.ownerId, ownerId),
            isNull(subscriptions.archivedAt),
            notInArray(subscriptions.status, ["PAUSED", "CANCELLED"]),
          ),
        )
        .groupBy(projectSubscriptions.projectId),
    ]);

  const technologiesByProject = new Map<string, string[]>();
  const credentialsByProject = new Map(
    credentialRows
      .filter((row): row is typeof row & { projectId: string } =>
        Boolean(row.projectId),
      )
      .map((row) => [row.projectId, row.total]),
  );
  const subscriptionsByProject = new Map(
    subscriptionRows.map((row) => [
      row.projectId,
      Number(row.monthlyAmountMinor),
    ]),
  );

  for (const technology of technologyRows) {
    const current = technologiesByProject.get(technology.projectId) ?? [];
    current.push(technology.name);
    technologiesByProject.set(technology.projectId, current);
  }

  return projectRows.map((row) => {
    const project = projectSchema.parse({
      ...row,
      archivedAt: row.archivedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      technologies: technologiesByProject.get(row.id) ?? [],
    });

    return {
      id: project.id,
      name: project.name,
      code: project.code,
      status: project.status,
      stage: project.stage,
      summary: project.summary,
      color: project.color,
      startedOn: project.startedOn,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      technologies: project.technologies,
      credentialReferenceCount: credentialsByProject.get(project.id) ?? 0,
      monthlyAmountMinor: subscriptionsByProject.get(project.id) ?? 0,
    };
  });
}
