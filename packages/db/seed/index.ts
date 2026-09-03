import {
  createCredentialReferenceSchema,
  createProjectSchema,
  createSubscriptionSchema,
  createVendorSchema,
} from "@kershell/domain";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "../schema";
import { seedFixture } from "./fixture";

export { seedExpectations, seedFixture } from "./fixture";

export async function seedDatabase(
  db: PostgresJsDatabase<typeof schema>,
): Promise<void> {
  const ownerId = seedFixture.owner.id;
  const projectIds = seedFixture.projects.map(({ id }) => id);
  const vendorIds = seedFixture.vendors.map(([id]) => id);

  await db.transaction(async (transaction) => {
    await transaction
      .insert(schema.owners)
      .values(seedFixture.owner)
      .onConflictDoUpdate({
        target: schema.owners.id,
        set: { displayName: seedFixture.owner.displayName },
      });

    for (const fixture of seedFixture.projects) {
      const { id, technologies, ...input } = fixture;
      const project = createProjectSchema.parse({ ...input, technologies });

      await transaction
        .insert(schema.projects)
        .values({
          id,
          ownerId,
          name: project.name,
          code: project.code,
          status: project.status,
          stage: project.stage,
          summary: project.summary,
          color: project.color,
          startedOn: project.startedOn,
        })
        .onConflictDoUpdate({
          target: schema.projects.id,
          set: {
            name: project.name,
            code: project.code,
            status: project.status,
            stage: project.stage,
            summary: project.summary,
            color: project.color,
            startedOn: project.startedOn,
          },
        });

      for (const [position, name] of project.technologies.entries()) {
        await transaction
          .insert(schema.projectTechnologies)
          .values({ projectId: id, name, position })
          .onConflictDoUpdate({
            target: [
              schema.projectTechnologies.projectId,
              schema.projectTechnologies.name,
            ],
            set: { position },
          });
      }
    }

    for (const [id, name, websiteUrl] of seedFixture.vendors) {
      const vendor = createVendorSchema.parse({ name, websiteUrl, notes: null });

      await transaction
        .insert(schema.vendors)
        .values({ id, ownerId, ...vendor })
        .onConflictDoUpdate({
          target: schema.vendors.id,
          set: vendor,
        });
    }

    for (const fixture of seedFixture.subscriptions) {
      const [
        id,
        vendorIndex,
        name,
        plan,
        category,
        status,
        amountMinor,
        billingInterval,
        nextChargeOn,
        projectIndexes,
      ] = fixture;
      const subscription = createSubscriptionSchema.parse({
        vendorId: vendorIds[vendorIndex],
        name,
        plan,
        category,
        status,
        amountMinor,
        currency: "USD",
        billingInterval,
        nextChargeOn,
        trialEndsOn: status === "TRIAL" ? nextChargeOn : null,
        cancelledAt: null,
        accountEmail: null,
        paymentMethodLabel: null,
        websiteUrl: seedFixture.vendors[vendorIndex][2],
        notes: null,
        projectIds: projectIndexes.map((index) => projectIds[index]),
      });
      const {
        projectIds: linkedProjectIds,
        cancelledAt,
        ...subscriptionValues
      } = subscription;
      const databaseSubscriptionValues = {
        ...subscriptionValues,
        amountMinor: BigInt(subscriptionValues.amountMinor),
        cancelledAt: cancelledAt ? new Date(cancelledAt) : null,
      };

      await transaction
        .insert(schema.subscriptions)
        .values({
          ...databaseSubscriptionValues,
          id,
          ownerId,
        })
        .onConflictDoUpdate({
          target: schema.subscriptions.id,
          set: {
            ...databaseSubscriptionValues,
          },
        });

      for (const projectId of linkedProjectIds) {
        await transaction
          .insert(schema.projectSubscriptions)
          .values({ ownerId, projectId, subscriptionId: id })
          .onConflictDoNothing();
      }
    }

    for (const [index, fixture] of seedFixture.credentialReferences.entries()) {
      const [id, projectIndex, name, service, environment, credentialType] =
        fixture;
      const reference = createCredentialReferenceSchema.parse({
        projectId: projectIds[projectIndex],
        name,
        service,
        environment,
        credentialType,
        secretProvider: "OTHER",
        externalItemId: `pending-reference-${String(index + 1).padStart(2, "0")}`,
        lastRotatedAt: null,
        rotationIntervalDays: null,
        notes: "Link this metadata to an external secret manager before use.",
      });
      const { lastRotatedAt, ...referenceValues } = reference;
      const databaseReferenceValues = {
        ...referenceValues,
        lastRotatedAt: lastRotatedAt ? new Date(lastRotatedAt) : null,
      };

      await transaction
        .insert(schema.credentialReferences)
        .values({ id, ownerId, ...databaseReferenceValues })
        .onConflictDoUpdate({
          target: schema.credentialReferences.id,
          set: databaseReferenceValues,
        });
    }

    await transaction
      .insert(schema.settings)
      .values({
        ownerId,
        locale: "es",
        timezone: "Europe/Madrid",
        defaultCurrency: "USD",
      })
      .onConflictDoUpdate({
        target: schema.settings.ownerId,
        set: {
          locale: "es",
          timezone: "Europe/Madrid",
          defaultCurrency: "USD",
        },
      });
  });
}
