import "server-only";

import {
  createProjectSchema,
  projectSchema,
  type CreateProject,
  type Project,
} from "@kershell/domain";
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
  subscriptionCount: number;
  technologies: string[];
};

function toProjectValues(input: CreateProject) {
  const project = createProjectSchema.parse(input);

  return {
    project,
    values: {
      code: project.code,
      color: project.color,
      name: project.name,
      stage: project.stage,
      startedOn: project.startedOn,
      status: project.status,
      summary: project.summary,
    },
  };
}

export async function createProject(
  db: KershellDatabase,
  ownerId: string,
  input: CreateProject,
): Promise<string> {
  const { project, values } = toProjectValues(input);

  return db.transaction(async (transaction) => {
    const [created] = await transaction
      .insert(projects)
      .values({ ownerId, ...values })
      .returning({ id: projects.id });

    if (!created) {
      throw new Error("Project insert did not return an identifier.");
    }

    if (project.technologies.length > 0) {
      await transaction.insert(projectTechnologies).values(
        project.technologies.map((name, position) => ({
          name,
          position,
          projectId: created.id,
        })),
      );
    }

    return created.id;
  });
}

export async function updateProject(
  db: KershellDatabase,
  ownerId: string,
  projectId: string,
  input: CreateProject,
): Promise<boolean> {
  const { project, values } = toProjectValues(input);

  return db.transaction(async (transaction) => {
    const [updated] = await transaction
      .update(projects)
      .set({ ...values, updatedAt: new Date() })
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.ownerId, ownerId),
          isNull(projects.archivedAt),
        ),
      )
      .returning({ id: projects.id });

    if (!updated) {
      return false;
    }

    await transaction
      .delete(projectTechnologies)
      .where(eq(projectTechnologies.projectId, updated.id));

    if (project.technologies.length > 0) {
      await transaction.insert(projectTechnologies).values(
        project.technologies.map((name, position) => ({
          name,
          position,
          projectId: updated.id,
        })),
      );
    }

    return true;
  });
}

export async function archiveProject(
  db: KershellDatabase,
  ownerId: string,
  projectId: string,
): Promise<boolean> {
  const now = new Date();
  const archived = await db
    .update(projects)
    .set({ archivedAt: now, updatedAt: now })
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.ownerId, ownerId),
        isNull(projects.archivedAt),
      ),
    )
    .returning({ id: projects.id });

  return archived.length === 1;
}

async function queryProjectOverviews(
  db: KershellDatabase,
  ownerId: string,
  projectId?: string,
): Promise<ProjectOverviewDto[]> {
  const activeProjectScope = and(
    eq(projects.ownerId, ownerId),
    isNull(projects.archivedAt),
    projectId ? eq(projects.id, projectId) : undefined,
  );
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
        .where(activeProjectScope)
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
        .where(activeProjectScope)
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
        .where(
          and(
            eq(credentialReferences.ownerId, ownerId),
            projectId
              ? eq(credentialReferences.projectId, projectId)
              : undefined,
          ),
        )
        .groupBy(credentialReferences.projectId),
      db
        .select({
          projectId: projectSubscriptions.projectId,
          subscriptionCount: count(projectSubscriptions.subscriptionId),
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
            projectId
              ? eq(projectSubscriptions.projectId, projectId)
              : undefined,
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
  const subscriptionMetricsByProject = new Map(
    subscriptionRows.map((row) => [
      row.projectId,
      {
        monthlyAmountMinor: Number(row.monthlyAmountMinor),
        subscriptionCount: row.subscriptionCount,
      },
    ]),
  );

  for (const technology of technologyRows) {
    const current = technologiesByProject.get(technology.projectId) ?? [];
    current.push(technology.name);
    technologiesByProject.set(technology.projectId, current);
  }

  return projectRows.map((row) => {
    const subscriptionMetrics = subscriptionMetricsByProject.get(row.id);
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
      monthlyAmountMinor: subscriptionMetrics?.monthlyAmountMinor ?? 0,
      subscriptionCount: subscriptionMetrics?.subscriptionCount ?? 0,
    };
  });
}

export async function listProjectOverviews(
  db: KershellDatabase,
  ownerId: string,
): Promise<ProjectOverviewDto[]> {
  return queryProjectOverviews(db, ownerId);
}

export async function getProjectOverview(
  db: KershellDatabase,
  ownerId: string,
  projectId: string,
): Promise<ProjectOverviewDto | null> {
  const matches = await queryProjectOverviews(db, ownerId, projectId);
  return matches.length === 1 ? matches[0] : null;
}
