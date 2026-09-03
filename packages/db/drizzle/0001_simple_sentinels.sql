CREATE TABLE "auth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issuer" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_accounts_issuer_account_unique" UNIQUE("issuer","account_id"),
	CONSTRAINT "auth_accounts_google_only" CHECK ("auth_accounts"."provider_id" = 'google'),
	CONSTRAINT "auth_accounts_issuer_google" CHECK ("auth_accounts"."issuer" = 'local:oauth:google'),
	CONSTRAINT "auth_accounts_no_password" CHECK ("auth_accounts"."password" is null),
	CONSTRAINT "auth_accounts_subject_not_blank" CHECK (btrim("auth_accounts"."account_id") <> ''),
	CONSTRAINT "auth_accounts_timestamps_ordered" CHECK ("auth_accounts"."updated_at" >= "auth_accounts"."created_at")
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_sessions_token_unique" UNIQUE("token"),
	CONSTRAINT "auth_sessions_token_not_blank" CHECK (btrim("auth_sessions"."token") <> ''),
	CONSTRAINT "auth_sessions_timestamps_ordered" CHECK ("auth_sessions"."updated_at" >= "auth_sessions"."created_at")
);
--> statement-breakpoint
CREATE TABLE "auth_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_users_email_unique" UNIQUE("email"),
	CONSTRAINT "auth_users_name_not_blank" CHECK (btrim("auth_users"."name") <> ''),
	CONSTRAINT "auth_users_email_lowercase" CHECK ("auth_users"."email" = lower("auth_users"."email")),
	CONSTRAINT "auth_users_email_not_blank" CHECK (btrim("auth_users"."email") <> ''),
	CONSTRAINT "auth_users_timestamps_ordered" CHECK ("auth_users"."updated_at" >= "auth_users"."created_at")
);
--> statement-breakpoint
CREATE TABLE "auth_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_verifications_identifier_not_blank" CHECK (btrim("auth_verifications"."identifier") <> ''),
	CONSTRAINT "auth_verifications_value_not_blank" CHECK (btrim("auth_verifications"."value") <> ''),
	CONSTRAINT "auth_verifications_timestamps_ordered" CHECK ("auth_verifications"."updated_at" >= "auth_verifications"."created_at")
);
--> statement-breakpoint
ALTER TABLE "admin_identities" ALTER COLUMN "auth_user_id" SET DATA TYPE uuid USING "auth_user_id"::uuid;--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_accounts_user_idx" ON "auth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_sessions_user_idx" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_sessions_expires_idx" ON "auth_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "auth_verifications_identifier_idx" ON "auth_verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "auth_verifications_expires_idx" ON "auth_verifications" USING btree ("expires_at");--> statement-breakpoint
ALTER TABLE "admin_identities" ADD CONSTRAINT "admin_identities_auth_user_id_auth_users_id_fk" FOREIGN KEY ("auth_user_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;
