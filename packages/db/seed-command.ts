import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import { seedDatabase } from "./seed";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run the database seed.");
}

let protocol: string;

try {
  protocol = new URL(databaseUrl).protocol;
} catch {
  throw new Error("DATABASE_URL must be a valid PostgreSQL URL.");
}

if (protocol !== "postgres:" && protocol !== "postgresql:") {
  throw new Error("DATABASE_URL must use the postgres or postgresql protocol.");
}

const client = postgres(databaseUrl, { max: 1 });

try {
  await seedDatabase(drizzle(client, { schema }));
  console.info("Sanitized database seed completed.");
} finally {
  await client.end();
}
