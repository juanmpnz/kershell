import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export type KershellDatabase = ReturnType<typeof createDatabase>;

function readDatabaseUrl() {
  const value = process.env.DATABASE_URL;

  if (!value) {
    throw new Error("DATABASE_URL is required.");
  }

  let protocol: string;

  try {
    protocol = new URL(value).protocol;
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL URL.");
  }

  if (protocol !== "postgres:" && protocol !== "postgresql:") {
    throw new Error("DATABASE_URL must use the postgres or postgresql protocol.");
  }

  return value;
}

function readPoolSize() {
  const value = process.env.DB_POOL_MAX ?? "5";
  const poolSize = Number(value);

  if (!Number.isInteger(poolSize) || poolSize < 1 || poolSize > 10) {
    throw new Error("DB_POOL_MAX must be an integer between 1 and 10.");
  }

  return poolSize;
}

function createDatabase() {
  const client = postgres(readDatabaseUrl(), {
    connect_timeout: 10,
    idle_timeout: 20,
    max: readPoolSize(),
  });

  return drizzle(client, { schema });
}

const databaseGlobal = globalThis as typeof globalThis & {
  kershellDatabase?: KershellDatabase;
};

export function getDatabase(): KershellDatabase {
  databaseGlobal.kershellDatabase ??= createDatabase();
  return databaseGlobal.kershellDatabase;
}
