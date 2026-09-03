import "server-only";

import {
  createSubscriptionSchema,
  subscriptionSchema,
  type CreateSubscription,
  type Subscription,
} from "@kershell/domain";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";

import type { KershellDatabase } from "../client";
import {
  projects,
  projectSubscriptions,
  subscriptions,
  vendors,
} from "../schema";

export type SubscriptionProjectDto = {
  color: string;
  id: string;
  name: string;
};

export type SubscriptionOverviewDto = Pick<
  Subscription,
  | "id"
  | "vendorId"
  | "name"
  | "plan"
  | "category"
  | "status"
  | "amountMinor"
  | "currency"
  | "billingInterval"
  | "nextChargeOn"
  | "trialEndsOn"
  | "cancelledAt"
  | "accountEmail"
  | "paymentMethodLabel"
  | "websiteUrl"
  | "notes"
  | "createdAt"
  | "updatedAt"
> & {
  monthlyAmountMinor: number;
  projects: SubscriptionProjectDto[];
  vendorName: string;
};

export type VendorOptionDto = {
  id: string;
  name: string;
};

type KershellTransaction = Parameters<
  Parameters<KershellDatabase["transaction"]>[0]
>[0];

function toDatabaseValues(input: CreateSubscription) {
  const subscription = createSubscriptionSchema.parse(input);
  const { projectIds, ...fields } = subscription;

  return {
    fields: {
      ...fields,
      amountMinor: BigInt(fields.amountMinor),
      cancelledAt: fields.cancelledAt
        ? new Date(fields.cancelledAt)
        : null,
    },
    projectIds,
  };
}

async function validateReferences(
  db: KershellTransaction,
  ownerId: string,
  vendorId: string,
  projectIds: string[],
) {
  const [vendorMatches, projectMatches] = await Promise.all([
    db
      .select({ id: vendors.id })
      .from(vendors)
      .where(and(eq(vendors.id, vendorId), eq(vendors.ownerId, ownerId)))
      .limit(1),
    projectIds.length > 0
      ? db
          .select({ id: projects.id })
          .from(projects)
          .where(
            and(
              eq(projects.ownerId, ownerId),
              isNull(projects.archivedAt),
              inArray(projects.id, projectIds),
            ),
          )
      : Promise.resolve([]),
  ]);

  if (
    vendorMatches.length !== 1 ||
    projectMatches.length !== projectIds.length
  ) {
    throw new Error("Subscription references are outside the owner scope.");
  }
}

export async function createSubscription(
  db: KershellDatabase,
  ownerId: string,
  input: CreateSubscription,
): Promise<string> {
  const { fields, projectIds } = toDatabaseValues(input);

  return db.transaction(async (transaction) => {
    await validateReferences(
      transaction,
      ownerId,
      fields.vendorId,
      projectIds,
    );
    const [created] = await transaction
      .insert(subscriptions)
      .values({ ownerId, ...fields })
      .returning({ id: subscriptions.id });

    if (!created) {
      throw new Error("Subscription insert did not return an identifier.");
    }

    if (projectIds.length > 0) {
      await transaction.insert(projectSubscriptions).values(
        projectIds.map((projectId) => ({
          ownerId,
          projectId,
          subscriptionId: created.id,
        })),
      );
    }

    return created.id;
  });
}

export async function updateSubscription(
  db: KershellDatabase,
  ownerId: string,
  subscriptionId: string,
  input: CreateSubscription,
): Promise<boolean> {
  const { fields, projectIds } = toDatabaseValues(input);

  return db.transaction(async (transaction) => {
    await validateReferences(
      transaction,
      ownerId,
      fields.vendorId,
      projectIds,
    );
    const [updated] = await transaction
      .update(subscriptions)
      .set({ ...fields, updatedAt: new Date() })
      .where(
        and(
          eq(subscriptions.id, subscriptionId),
          eq(subscriptions.ownerId, ownerId),
          isNull(subscriptions.archivedAt),
        ),
      )
      .returning({ id: subscriptions.id });

    if (!updated) {
      return false;
    }

    await transaction
      .delete(projectSubscriptions)
      .where(
        and(
          eq(projectSubscriptions.subscriptionId, updated.id),
          eq(projectSubscriptions.ownerId, ownerId),
        ),
      );

    if (projectIds.length > 0) {
      await transaction.insert(projectSubscriptions).values(
        projectIds.map((projectId) => ({
          ownerId,
          projectId,
          subscriptionId: updated.id,
        })),
      );
    }

    return true;
  });
}

export async function archiveSubscription(
  db: KershellDatabase,
  ownerId: string,
  subscriptionId: string,
): Promise<boolean> {
  const now = new Date();
  const archived = await db
    .update(subscriptions)
    .set({ archivedAt: now, updatedAt: now })
    .where(
      and(
        eq(subscriptions.id, subscriptionId),
        eq(subscriptions.ownerId, ownerId),
        isNull(subscriptions.archivedAt),
      ),
    )
    .returning({ id: subscriptions.id });

  return archived.length === 1;
}

async function querySubscriptionOverviews(
  db: KershellDatabase,
  ownerId: string,
  subscriptionId?: string,
): Promise<SubscriptionOverviewDto[]> {
  const [rows, projectRows] = await Promise.all([
    db
      .select({
        accountEmail: subscriptions.accountEmail,
        amountMinor: subscriptions.amountMinor,
        archivedAt: subscriptions.archivedAt,
        billingInterval: subscriptions.billingInterval,
        cancelledAt: subscriptions.cancelledAt,
        category: subscriptions.category,
        createdAt: subscriptions.createdAt,
        currency: subscriptions.currency,
        id: subscriptions.id,
        name: subscriptions.name,
        nextChargeOn: subscriptions.nextChargeOn,
        notes: subscriptions.notes,
        ownerId: subscriptions.ownerId,
        paymentMethodLabel: subscriptions.paymentMethodLabel,
        plan: subscriptions.plan,
        status: subscriptions.status,
        trialEndsOn: subscriptions.trialEndsOn,
        updatedAt: subscriptions.updatedAt,
        vendorId: subscriptions.vendorId,
        vendorName: vendors.name,
        websiteUrl: subscriptions.websiteUrl,
      })
      .from(subscriptions)
      .innerJoin(
        vendors,
        and(
          eq(vendors.id, subscriptions.vendorId),
          eq(vendors.ownerId, subscriptions.ownerId),
        ),
      )
      .where(
        and(
          eq(subscriptions.ownerId, ownerId),
          isNull(subscriptions.archivedAt),
          subscriptionId ? eq(subscriptions.id, subscriptionId) : undefined,
        ),
      )
      .orderBy(asc(subscriptions.name)),
    db
      .select({
        color: projects.color,
        id: projects.id,
        name: projects.name,
        subscriptionId: projectSubscriptions.subscriptionId,
      })
      .from(projectSubscriptions)
      .innerJoin(
        projects,
        and(
          eq(projects.id, projectSubscriptions.projectId),
          eq(projects.ownerId, projectSubscriptions.ownerId),
        ),
      )
      .where(
        and(
          eq(projectSubscriptions.ownerId, ownerId),
          subscriptionId
            ? eq(projectSubscriptions.subscriptionId, subscriptionId)
            : undefined,
        ),
      )
      .orderBy(asc(projectSubscriptions.subscriptionId), asc(projects.name)),
  ]);
  const projectsBySubscription = new Map<string, SubscriptionProjectDto[]>();

  for (const project of projectRows) {
    const current = projectsBySubscription.get(project.subscriptionId) ?? [];
    current.push({ color: project.color, id: project.id, name: project.name });
    projectsBySubscription.set(project.subscriptionId, current);
  }

  return rows.map((row) => {
    const { vendorName, ...subscriptionRow } = row;
    const projectIds = (projectsBySubscription.get(row.id) ?? []).map(
      ({ id }) => id,
    );
    const subscription = subscriptionSchema.parse({
      ...subscriptionRow,
      amountMinor: Number(row.amountMinor),
      archivedAt: row.archivedAt?.toISOString() ?? null,
      cancelledAt: row.cancelledAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      projectIds,
      updatedAt: row.updatedAt.toISOString(),
    });
    const monthlyAmountMinor =
      subscription.billingInterval === "YEARLY"
        ? Math.round(subscription.amountMinor / 12)
        : subscription.amountMinor;

    return {
      accountEmail: subscription.accountEmail,
      amountMinor: subscription.amountMinor,
      billingInterval: subscription.billingInterval,
      cancelledAt: subscription.cancelledAt,
      category: subscription.category,
      createdAt: subscription.createdAt,
      currency: subscription.currency,
      id: subscription.id,
      monthlyAmountMinor,
      name: subscription.name,
      nextChargeOn: subscription.nextChargeOn,
      notes: subscription.notes,
      paymentMethodLabel: subscription.paymentMethodLabel,
      plan: subscription.plan,
      projects: projectsBySubscription.get(subscription.id) ?? [],
      status: subscription.status,
      trialEndsOn: subscription.trialEndsOn,
      updatedAt: subscription.updatedAt,
      vendorId: subscription.vendorId,
      vendorName,
      websiteUrl: subscription.websiteUrl,
    };
  });
}

export async function listSubscriptionOverviews(
  db: KershellDatabase,
  ownerId: string,
): Promise<SubscriptionOverviewDto[]> {
  return querySubscriptionOverviews(db, ownerId);
}

export async function getSubscriptionOverview(
  db: KershellDatabase,
  ownerId: string,
  subscriptionId: string,
): Promise<SubscriptionOverviewDto | null> {
  const matches = await querySubscriptionOverviews(
    db,
    ownerId,
    subscriptionId,
  );
  return matches.length === 1 ? matches[0] : null;
}

export async function listVendorOptions(
  db: KershellDatabase,
  ownerId: string,
): Promise<VendorOptionDto[]> {
  return db
    .select({ id: vendors.id, name: vendors.name })
    .from(vendors)
    .where(eq(vendors.ownerId, ownerId))
    .orderBy(asc(vendors.name));
}
