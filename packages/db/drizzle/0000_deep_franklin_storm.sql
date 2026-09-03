CREATE TYPE "public"."billing_interval" AS ENUM('MONTHLY', 'YEARLY', 'USAGE');--> statement-breakpoint
CREATE TYPE "public"."credential_environment" AS ENUM('PRODUCTION', 'STAGING', 'DEVELOPMENT', 'SHARED');--> statement-breakpoint
CREATE TYPE "public"."credential_type" AS ENUM('API_KEY', 'LOGIN', 'CONNECTION_STRING', 'DEPLOY_TOKEN', 'DSN', 'OAUTH_CLIENT', 'SSH_KEY');--> statement-breakpoint
CREATE TYPE "public"."identity_provider" AS ENUM('GOOGLE');--> statement-breakpoint
CREATE TYPE "public"."identity_status" AS ENUM('ACTIVE', 'DISABLED');--> statement-breakpoint
CREATE TYPE "public"."owner_status" AS ENUM('ACTIVE', 'DISABLED');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('LIVE', 'BETA', 'PAUSED');--> statement-breakpoint
CREATE TYPE "public"."secret_provider" AS ENUM('ONEPASSWORD', 'BITWARDEN', 'KEEPASSXC', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."subscription_category" AS ENUM('HOSTING', 'DEVELOPER_TOOLS', 'AI', 'COMMUNICATIONS', 'DOMAINS', 'MONITORING', 'DESIGN', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('ACTIVE', 'TRIAL', 'PAUSED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "admin_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"auth_user_id" text NOT NULL,
	"provider" "identity_provider" DEFAULT 'GOOGLE' NOT NULL,
	"provider_subject" text NOT NULL,
	"email" text NOT NULL,
	"hosted_domain" text,
	"status" "identity_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_identities_auth_user_unique" UNIQUE("auth_user_id"),
	CONSTRAINT "admin_identities_provider_subject_unique" UNIQUE("provider","provider_subject"),
	CONSTRAINT "admin_identities_email_unique" UNIQUE("email"),
	CONSTRAINT "admin_identities_email_lowercase" CHECK ("admin_identities"."email" = lower("admin_identities"."email")),
	CONSTRAINT "admin_identities_timestamps_ordered" CHECK ("admin_identities"."updated_at" >= "admin_identities"."created_at")
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"actor_identity_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"request_id" text,
	"ip_hash" text,
	"user_agent_summary" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audit_events_action_not_blank" CHECK (btrim("audit_events"."action") <> ''),
	CONSTRAINT "audit_events_entity_type_not_blank" CHECK (btrim("audit_events"."entity_type") <> ''),
	CONSTRAINT "audit_events_metadata_object" CHECK (jsonb_typeof("audit_events"."metadata") = 'object')
);
--> statement-breakpoint
CREATE TABLE "credential_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"project_id" uuid,
	"name" text NOT NULL,
	"service" text NOT NULL,
	"environment" "credential_environment" NOT NULL,
	"credential_type" "credential_type" NOT NULL,
	"secret_provider" "secret_provider" NOT NULL,
	"external_item_id" text NOT NULL,
	"last_rotated_at" timestamp with time zone,
	"rotation_interval_days" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credential_references_owner_provider_item_unique" UNIQUE("owner_id","secret_provider","external_item_id"),
	CONSTRAINT "credential_references_name_not_blank" CHECK (btrim("credential_references"."name") <> ''),
	CONSTRAINT "credential_references_service_not_blank" CHECK (btrim("credential_references"."service") <> ''),
	CONSTRAINT "credential_references_external_id_opaque" CHECK ("credential_references"."external_item_id" ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{2,199}$' and "credential_references"."external_item_id" not like '%://%'),
	CONSTRAINT "credential_references_rotation_positive" CHECK ("credential_references"."rotation_interval_days" is null or "credential_references"."rotation_interval_days" between 1 and 3650),
	CONSTRAINT "credential_references_timestamps_ordered" CHECK ("credential_references"."updated_at" >= "credential_references"."created_at")
);
--> statement-breakpoint
CREATE TABLE "owners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text NOT NULL,
	"status" "owner_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "owners_display_name_not_blank" CHECK (btrim("owners"."display_name") <> ''),
	CONSTRAINT "owners_timestamps_ordered" CHECK ("owners"."updated_at" >= "owners"."created_at")
);
--> statement-breakpoint
CREATE TABLE "project_subscriptions" (
	"owner_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"subscription_id" uuid NOT NULL,
	CONSTRAINT "project_subscriptions_project_id_subscription_id_pk" PRIMARY KEY("project_id","subscription_id")
);
--> statement-breakpoint
CREATE TABLE "project_technologies" (
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "project_technologies_project_id_name_pk" PRIMARY KEY("project_id","name"),
	CONSTRAINT "project_technologies_position_unique" UNIQUE("project_id","position"),
	CONSTRAINT "project_technologies_name_not_blank" CHECK (btrim("project_technologies"."name") <> ''),
	CONSTRAINT "project_technologies_position_nonnegative" CHECK ("project_technologies"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"summary" text NOT NULL,
	"status" "project_status" NOT NULL,
	"stage" text NOT NULL,
	"color" char(7) NOT NULL,
	"started_on" date,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_id_owner_unique" UNIQUE("id","owner_id"),
	CONSTRAINT "projects_name_not_blank" CHECK (btrim("projects"."name") <> ''),
	CONSTRAINT "projects_code_format" CHECK ("projects"."code" ~ '^[A-Z0-9][A-Z0-9_-]{1,31}$'),
	CONSTRAINT "projects_color_format" CHECK ("projects"."color" ~ '^#[0-9A-Fa-f]{6}$'),
	CONSTRAINT "projects_timestamps_ordered" CHECK ("projects"."updated_at" >= "projects"."created_at")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"owner_id" uuid PRIMARY KEY NOT NULL,
	"locale" text DEFAULT 'es' NOT NULL,
	"timezone" text DEFAULT 'Europe/Madrid' NOT NULL,
	"default_currency" char(3) DEFAULT 'EUR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "settings_locale_allowed" CHECK ("settings"."locale" in ('es', 'en')),
	CONSTRAINT "settings_currency_uppercase" CHECK ("settings"."default_currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "settings_timezone_not_blank" CHECK (btrim("settings"."timezone") <> ''),
	CONSTRAINT "settings_timestamps_ordered" CHECK ("settings"."updated_at" >= "settings"."created_at")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"vendor_id" uuid NOT NULL,
	"name" text NOT NULL,
	"plan" text NOT NULL,
	"category" "subscription_category" NOT NULL,
	"status" "subscription_status" NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" char(3) NOT NULL,
	"billing_interval" "billing_interval" NOT NULL,
	"next_charge_on" date,
	"trial_ends_on" date,
	"cancelled_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"account_email" text,
	"payment_method_label" text,
	"website_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_id_owner_unique" UNIQUE("id","owner_id"),
	CONSTRAINT "subscriptions_name_not_blank" CHECK (btrim("subscriptions"."name") <> ''),
	CONSTRAINT "subscriptions_amount_nonnegative" CHECK ("subscriptions"."amount_minor" >= 0),
	CONSTRAINT "subscriptions_currency_uppercase" CHECK ("subscriptions"."currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "subscriptions_trial_has_end" CHECK ("subscriptions"."status" <> 'TRIAL' or "subscriptions"."trial_ends_on" is not null),
	CONSTRAINT "subscriptions_cancelled_timestamp" CHECK (("subscriptions"."status" = 'CANCELLED') = ("subscriptions"."cancelled_at" is not null)),
	CONSTRAINT "subscriptions_payment_label_masked" CHECK ("subscriptions"."payment_method_label" is null or length(regexp_replace("subscriptions"."payment_method_label", '\D', '', 'g')) not between 13 and 19),
	CONSTRAINT "subscriptions_website_http" CHECK ("subscriptions"."website_url" is null or "subscriptions"."website_url" ~ '^https?://'),
	CONSTRAINT "subscriptions_timestamps_ordered" CHECK ("subscriptions"."updated_at" >= "subscriptions"."created_at")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"website_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vendors_id_owner_unique" UNIQUE("id","owner_id"),
	CONSTRAINT "vendors_name_not_blank" CHECK (btrim("vendors"."name") <> ''),
	CONSTRAINT "vendors_website_http" CHECK ("vendors"."website_url" is null or "vendors"."website_url" ~ '^https?://'),
	CONSTRAINT "vendors_timestamps_ordered" CHECK ("vendors"."updated_at" >= "vendors"."created_at")
);
--> statement-breakpoint
ALTER TABLE "admin_identities" ADD CONSTRAINT "admin_identities_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_identity_id_admin_identities_id_fk" FOREIGN KEY ("actor_identity_id") REFERENCES "public"."admin_identities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_references" ADD CONSTRAINT "credential_references_project_owner_fk" FOREIGN KEY ("project_id","owner_id") REFERENCES "public"."projects"("id","owner_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_subscriptions" ADD CONSTRAINT "project_subscriptions_project_owner_fk" FOREIGN KEY ("project_id","owner_id") REFERENCES "public"."projects"("id","owner_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_subscriptions" ADD CONSTRAINT "project_subscriptions_subscription_owner_fk" FOREIGN KEY ("subscription_id","owner_id") REFERENCES "public"."subscriptions"("id","owner_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_vendor_owner_fk" FOREIGN KEY ("vendor_id","owner_id") REFERENCES "public"."vendors"("id","owner_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_identities_owner_idx" ON "admin_identities" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "audit_events_owner_created_idx" ON "audit_events" USING btree ("owner_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_events_entity_idx" ON "audit_events" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "credential_references_owner_project_idx" ON "credential_references" USING btree ("owner_id","project_id");--> statement-breakpoint
CREATE INDEX "project_subscriptions_owner_idx" ON "project_subscriptions" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "project_subscriptions_subscription_idx" ON "project_subscriptions" USING btree ("subscription_id");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_owner_active_code_unique" ON "projects" USING btree ("owner_id","code") WHERE "projects"."archived_at" is null;--> statement-breakpoint
CREATE INDEX "projects_owner_status_idx" ON "projects" USING btree ("owner_id","status");--> statement-breakpoint
CREATE INDEX "subscriptions_owner_status_idx" ON "subscriptions" USING btree ("owner_id","status");--> statement-breakpoint
CREATE INDEX "subscriptions_owner_next_charge_idx" ON "subscriptions" USING btree ("owner_id","next_charge_on");--> statement-breakpoint
CREATE INDEX "subscriptions_vendor_idx" ON "subscriptions" USING btree ("vendor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vendors_owner_name_unique" ON "vendors" USING btree ("owner_id",lower("name"));--> statement-breakpoint
CREATE INDEX "vendors_owner_idx" ON "vendors" USING btree ("owner_id");