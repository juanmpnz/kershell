import {
  billingIntervals,
  credentialEnvironments,
  credentialTypes,
  projectStatuses,
  secretProviders,
  subscriptionCategories,
  subscriptionStatuses,
} from "@kershell/domain";
import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  char,
  check,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true })
  .defaultNow()
  .notNull();
const updatedAt = timestamp("updated_at", { withTimezone: true })
  .defaultNow()
  .notNull();

export const ownerStatus = pgEnum("owner_status", ["ACTIVE", "DISABLED"]);
export const identityProvider = pgEnum("identity_provider", ["GOOGLE"]);
export const identityStatus = pgEnum("identity_status", ["ACTIVE", "DISABLED"]);
export const projectStatus = pgEnum("project_status", projectStatuses);
export const subscriptionCategory = pgEnum(
  "subscription_category",
  subscriptionCategories,
);
export const subscriptionStatus = pgEnum(
  "subscription_status",
  subscriptionStatuses,
);
export const billingInterval = pgEnum(
  "billing_interval",
  billingIntervals,
);
export const credentialEnvironment = pgEnum(
  "credential_environment",
  credentialEnvironments,
);
export const credentialType = pgEnum(
  "credential_type",
  credentialTypes,
);
export const secretProvider = pgEnum(
  "secret_provider",
  secretProviders,
);

export const owners = pgTable(
  "owners",
  {
    id: uuid().defaultRandom().primaryKey(),
    displayName: text("display_name").notNull(),
    status: ownerStatus().default("ACTIVE").notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    check("owners_display_name_not_blank", sql`btrim(${table.displayName}) <> ''`),
    check("owners_timestamps_ordered", sql`${table.updatedAt} >= ${table.createdAt}`),
  ],
);

export const adminIdentities = pgTable(
  "admin_identities",
  {
    id: uuid().defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => owners.id, { onDelete: "cascade" }),
    authUserId: text("auth_user_id").notNull(),
    provider: identityProvider().default("GOOGLE").notNull(),
    providerSubject: text("provider_subject").notNull(),
    email: text().notNull(),
    hostedDomain: text("hosted_domain"),
    status: identityStatus().default("ACTIVE").notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    unique("admin_identities_auth_user_unique").on(table.authUserId),
    unique("admin_identities_provider_subject_unique").on(
      table.provider,
      table.providerSubject,
    ),
    unique("admin_identities_email_unique").on(table.email),
    index("admin_identities_owner_idx").on(table.ownerId),
    check("admin_identities_email_lowercase", sql`${table.email} = lower(${table.email})`),
    check("admin_identities_timestamps_ordered", sql`${table.updatedAt} >= ${table.createdAt}`),
  ],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid().defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => owners.id, { onDelete: "cascade" }),
    name: text().notNull(),
    code: text().notNull(),
    summary: text().notNull(),
    status: projectStatus().notNull(),
    stage: text().notNull(),
    color: char({ length: 7 }).notNull(),
    startedOn: date("started_on", { mode: "string" }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (table) => [
    unique("projects_id_owner_unique").on(table.id, table.ownerId),
    uniqueIndex("projects_owner_active_code_unique")
      .on(table.ownerId, table.code)
      .where(sql`${table.archivedAt} is null`),
    index("projects_owner_status_idx").on(table.ownerId, table.status),
    check("projects_name_not_blank", sql`btrim(${table.name}) <> ''`),
    check("projects_code_format", sql`${table.code} ~ '^[A-Z0-9][A-Z0-9_-]{1,31}$'`),
    check("projects_color_format", sql`${table.color} ~ '^#[0-9A-Fa-f]{6}$'`),
    check("projects_timestamps_ordered", sql`${table.updatedAt} >= ${table.createdAt}`),
  ],
);

export const projectTechnologies = pgTable(
  "project_technologies",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text().notNull(),
    position: integer().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.name] }),
    unique("project_technologies_position_unique").on(
      table.projectId,
      table.position,
    ),
    check("project_technologies_name_not_blank", sql`btrim(${table.name}) <> ''`),
    check("project_technologies_position_nonnegative", sql`${table.position} >= 0`),
  ],
);

export const vendors = pgTable(
  "vendors",
  {
    id: uuid().defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => owners.id, { onDelete: "cascade" }),
    name: text().notNull(),
    websiteUrl: text("website_url"),
    notes: text(),
    createdAt,
    updatedAt,
  },
  (table) => [
    unique("vendors_id_owner_unique").on(table.id, table.ownerId),
    uniqueIndex("vendors_owner_name_unique").on(table.ownerId, sql`lower(${table.name})`),
    index("vendors_owner_idx").on(table.ownerId),
    check("vendors_name_not_blank", sql`btrim(${table.name}) <> ''`),
    check(
      "vendors_website_http",
      sql`${table.websiteUrl} is null or ${table.websiteUrl} ~ '^https?://'`,
    ),
    check("vendors_timestamps_ordered", sql`${table.updatedAt} >= ${table.createdAt}`),
  ],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid().defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull(),
    vendorId: uuid("vendor_id").notNull(),
    name: text().notNull(),
    plan: text().notNull(),
    category: subscriptionCategory().notNull(),
    status: subscriptionStatus().notNull(),
    amountMinor: bigint("amount_minor", { mode: "bigint" }).notNull(),
    currency: char({ length: 3 }).notNull(),
    billingInterval: billingInterval("billing_interval").notNull(),
    nextChargeOn: date("next_charge_on", { mode: "string" }),
    trialEndsOn: date("trial_ends_on", { mode: "string" }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    accountEmail: text("account_email"),
    paymentMethodLabel: text("payment_method_label"),
    websiteUrl: text("website_url"),
    notes: text(),
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      name: "subscriptions_vendor_owner_fk",
      columns: [table.vendorId, table.ownerId],
      foreignColumns: [vendors.id, vendors.ownerId],
    }).onDelete("restrict"),
    unique("subscriptions_id_owner_unique").on(table.id, table.ownerId),
    index("subscriptions_owner_status_idx").on(table.ownerId, table.status),
    index("subscriptions_owner_next_charge_idx").on(
      table.ownerId,
      table.nextChargeOn,
    ),
    index("subscriptions_vendor_idx").on(table.vendorId),
    check("subscriptions_name_not_blank", sql`btrim(${table.name}) <> ''`),
    check("subscriptions_amount_nonnegative", sql`${table.amountMinor} >= 0`),
    check("subscriptions_currency_uppercase", sql`${table.currency} ~ '^[A-Z]{3}$'`),
    check(
      "subscriptions_trial_has_end",
      sql`${table.status} <> 'TRIAL' or ${table.trialEndsOn} is not null`,
    ),
    check(
      "subscriptions_cancelled_timestamp",
      sql`(${table.status} = 'CANCELLED') = (${table.cancelledAt} is not null)`,
    ),
    check(
      "subscriptions_payment_label_masked",
      sql`${table.paymentMethodLabel} is null or length(regexp_replace(${table.paymentMethodLabel}, '\\D', '', 'g')) not between 13 and 19`,
    ),
    check(
      "subscriptions_website_http",
      sql`${table.websiteUrl} is null or ${table.websiteUrl} ~ '^https?://'`,
    ),
    check("subscriptions_timestamps_ordered", sql`${table.updatedAt} >= ${table.createdAt}`),
  ],
);

export const projectSubscriptions = pgTable(
  "project_subscriptions",
  {
    ownerId: uuid("owner_id").notNull(),
    projectId: uuid("project_id").notNull(),
    subscriptionId: uuid("subscription_id").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.subscriptionId] }),
    foreignKey({
      name: "project_subscriptions_project_owner_fk",
      columns: [table.projectId, table.ownerId],
      foreignColumns: [projects.id, projects.ownerId],
    }).onDelete("cascade"),
    foreignKey({
      name: "project_subscriptions_subscription_owner_fk",
      columns: [table.subscriptionId, table.ownerId],
      foreignColumns: [subscriptions.id, subscriptions.ownerId],
    }).onDelete("cascade"),
    index("project_subscriptions_owner_idx").on(table.ownerId),
    index("project_subscriptions_subscription_idx").on(table.subscriptionId),
  ],
);

export const credentialReferences = pgTable(
  "credential_references",
  {
    id: uuid().defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull(),
    projectId: uuid("project_id"),
    name: text().notNull(),
    service: text().notNull(),
    environment: credentialEnvironment().notNull(),
    credentialType: credentialType("credential_type").notNull(),
    secretProvider: secretProvider("secret_provider").notNull(),
    externalItemId: text("external_item_id").notNull(),
    lastRotatedAt: timestamp("last_rotated_at", { withTimezone: true }),
    rotationIntervalDays: integer("rotation_interval_days"),
    notes: text(),
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      name: "credential_references_project_owner_fk",
      columns: [table.projectId, table.ownerId],
      foreignColumns: [projects.id, projects.ownerId],
    }).onDelete("restrict"),
    unique("credential_references_owner_provider_item_unique").on(
      table.ownerId,
      table.secretProvider,
      table.externalItemId,
    ),
    index("credential_references_owner_project_idx").on(
      table.ownerId,
      table.projectId,
    ),
    check("credential_references_name_not_blank", sql`btrim(${table.name}) <> ''`),
    check("credential_references_service_not_blank", sql`btrim(${table.service}) <> ''`),
    check(
      "credential_references_external_id_opaque",
      sql`${table.externalItemId} ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{2,199}$' and ${table.externalItemId} not like '%://%'`,
    ),
    check(
      "credential_references_rotation_positive",
      sql`${table.rotationIntervalDays} is null or ${table.rotationIntervalDays} between 1 and 3650`,
    ),
    check("credential_references_timestamps_ordered", sql`${table.updatedAt} >= ${table.createdAt}`),
  ],
);

export const settings = pgTable(
  "settings",
  {
    ownerId: uuid("owner_id")
      .primaryKey()
      .references(() => owners.id, { onDelete: "cascade" }),
    locale: text().default("es").notNull(),
    timezone: text().default("Europe/Madrid").notNull(),
    defaultCurrency: char("default_currency", { length: 3 })
      .default("EUR")
      .notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    check("settings_locale_allowed", sql`${table.locale} in ('es', 'en')`),
    check("settings_currency_uppercase", sql`${table.defaultCurrency} ~ '^[A-Z]{3}$'`),
    check("settings_timezone_not_blank", sql`btrim(${table.timezone}) <> ''`),
    check("settings_timestamps_ordered", sql`${table.updatedAt} >= ${table.createdAt}`),
  ],
);

type AuditMetadata = {
  changedFields?: string[];
  outcome?: "SUCCESS" | "FAILURE";
  reason?: string;
};

export const auditEvents = pgTable(
  "audit_events",
  {
    id: bigserial({ mode: "bigint" }).primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => owners.id, { onDelete: "restrict" }),
    actorIdentityId: uuid("actor_identity_id").references(
      () => adminIdentities.id,
      { onDelete: "set null" },
    ),
    action: text().notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    requestId: text("request_id"),
    ipHash: text("ip_hash"),
    userAgentSummary: text("user_agent_summary"),
    metadata: jsonb().$type<AuditMetadata>().default({}).notNull(),
    createdAt,
  },
  (table) => [
    index("audit_events_owner_created_idx").on(table.ownerId, table.createdAt),
    index("audit_events_entity_idx").on(table.entityType, table.entityId),
    check("audit_events_action_not_blank", sql`btrim(${table.action}) <> ''`),
    check("audit_events_entity_type_not_blank", sql`btrim(${table.entityType}) <> ''`),
    check("audit_events_metadata_object", sql`jsonb_typeof(${table.metadata}) = 'object'`),
  ],
);
