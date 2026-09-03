import "server-only";

import { getDatabase, type KershellDatabase } from "@kershell/db/client";
import {
  authAccounts,
  authSessions,
  authUsers,
  authVerifications,
} from "@kershell/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { GoogleOptions } from "better-auth/social-providers";

import {
  createAuthOptions,
  parseAuthEnvironment,
  type AuthEnvironment,
} from "./config";

const authSchema = {
  account: authAccounts,
  session: authSessions,
  user: authUsers,
  verification: authVerifications,
};

type GoogleProviderOverrides = Pick<GoogleOptions, "getUserInfo">;

export function createKershellAuth(
  environment: AuthEnvironment,
  database: KershellDatabase,
  googleProviderOverrides?: GoogleProviderOverrides,
) {
  const options = createAuthOptions(environment);

  return betterAuth({
    ...options,
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: authSchema,
    }),
    socialProviders: {
      google: {
        ...options.socialProviders.google,
        ...googleProviderOverrides,
      },
    },
  });
}

export type KershellAuth = ReturnType<typeof createKershellAuth>;

const authGlobal = globalThis as typeof globalThis & {
  kershellAuth?: KershellAuth;
};

export function getAuth(): KershellAuth {
  authGlobal.kershellAuth ??= createKershellAuth(
    parseAuthEnvironment(process.env),
    getDatabase(),
  );

  return authGlobal.kershellAuth;
}
