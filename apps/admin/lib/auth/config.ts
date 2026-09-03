import "server-only";

import type { BetterAuthOptions } from "better-auth";
import { z } from "zod";

import { authorizeGoogleIdentity } from "./google-identity";

const rawEnvironmentSchema = z.object({
  ADMIN_ALLOWED_EMAILS: z.string().min(1),
  ADMIN_OWNER_ID: z.uuid(),
  ADMIN_WORKSPACE_DOMAIN: z.string().trim().min(1).max(253),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_TRUSTED_ORIGINS: z.string().min(1),
  BETTER_AUTH_URL: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().trim().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
});

export type AuthEnvironment = {
  allowedEmails: string[];
  baseUrl: string;
  databaseUrl: string;
  googleClientId: string;
  googleClientSecret: string;
  ownerId: string;
  secret: string;
  trustedOrigins: string[];
  workspaceDomain: string;
};

function parseOrigin(value: string): string {
  const url = new URL(value);
  const isLocalHttp =
    url.protocol === "http:" &&
    (url.hostname === "localhost" || url.hostname === "127.0.0.1");

  if (
    (url.protocol !== "https:" && !isLocalHttp) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error("Invalid origin.");
  }

  return url.origin;
}

function parseDatabaseUrl(value: string): string {
  const url = new URL(value);

  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new Error("Invalid database URL.");
  }

  return value;
}

function parseUniqueList(value: string, transform: (item: string) => string) {
  const items = value.split(",").map((item) => transform(item.trim()));

  if (items.some((item) => !item) || new Set(items).size !== items.length) {
    throw new Error("Invalid list.");
  }

  return items;
}

export function parseAuthEnvironment(
  input: Record<string, string | undefined>,
): AuthEnvironment {
  try {
    const raw = rawEnvironmentSchema.parse(input);
    const workspaceDomain = raw.ADMIN_WORKSPACE_DOMAIN.toLowerCase();
    const allowedEmails = parseUniqueList(
      raw.ADMIN_ALLOWED_EMAILS,
      (email) => z.email().parse(email).toLowerCase(),
    );
    const trustedOrigins = parseUniqueList(
      raw.BETTER_AUTH_TRUSTED_ORIGINS,
      parseOrigin,
    );
    const baseUrl = parseOrigin(raw.BETTER_AUTH_URL);
    const workspaceIdentities = allowedEmails.filter((email) =>
      email.endsWith(`@${workspaceDomain}`),
    );

    if (
      allowedEmails.length !== 2 ||
      workspaceIdentities.length !== 1 ||
      !trustedOrigins.includes(baseUrl)
    ) {
      throw new Error("Invalid owner policy.");
    }

    return {
      allowedEmails,
      baseUrl,
      databaseUrl: parseDatabaseUrl(raw.DATABASE_URL),
      googleClientId: raw.GOOGLE_CLIENT_ID,
      googleClientSecret: raw.GOOGLE_CLIENT_SECRET,
      ownerId: raw.ADMIN_OWNER_ID,
      secret: raw.BETTER_AUTH_SECRET,
      trustedOrigins,
      workspaceDomain,
    };
  } catch {
    throw new Error("Invalid admin authentication configuration.");
  }
}

export function createAuthOptions(
  environment: AuthEnvironment,
) {
  const workspaceEmail = environment.allowedEmails.find((email) =>
    email.endsWith(`@${environment.workspaceDomain}`),
  );
  const personalEmail = environment.allowedEmails.find(
    (email) => email !== workspaceEmail,
  );

  if (!workspaceEmail || !personalEmail) {
    throw new Error("Invalid admin authentication configuration.");
  }

  return {
    account: {
      accountLinking: { enabled: false },
      encryptOAuthTokens: true,
      storeAccountCookie: false,
      storeStateStrategy: "database",
    },
    advanced: {
      database: { generateId: "uuid" },
    },
    appName: "Kershell Admin",
    baseURL: environment.baseUrl,
    databaseHooks: {
      account: {
        create: {
          before: async (account) => ({
            data: { ...account, idToken: null },
          }),
        },
        update: {
          before: async (account) => ({
            data: { ...account, idToken: null },
          }),
        },
      },
    },
    emailAndPassword: { enabled: false },
    secret: environment.secret,
    socialProviders: {
      google: {
        clientId: environment.googleClientId,
        clientSecret: environment.googleClientSecret,
        prompt: "select_account",
        requireEmailVerification: true,
      },
    },
    telemetry: { enabled: false },
    trustedOrigins: environment.trustedOrigins,
    user: {
      validateUserInfo: ({ source, user }) => {
        const identity =
          source.oauth?.providerId === "google"
            ? authorizeGoogleIdentity(source.oauth.profile, {
                personalEmail,
                workspaceDomain: environment.workspaceDomain,
                workspaceEmail,
              })
            : null;

        if (
          !identity ||
          user.email?.toLowerCase() !== identity.email ||
          user.emailVerified !== true
        ) {
          return {
            error: "access_denied",
            errorDescription: "This Google identity is not authorized.",
          };
        }
      },
    },
  } satisfies BetterAuthOptions;
}
