import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for database integration tests.");
}

const client = postgres(databaseUrl, { max: 1 });
const db = drizzle(client);

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" });
  await migrate(db, { migrationsFolder: "./drizzle" });
});

afterAll(async () => {
  await client.end();
});

describe("initial PostgreSQL schema", () => {
  it("enforces money, ownership and active project code invariants", async () => {
    const [ownerA, ownerB] = await client<[{ id: string }, { id: string }]>`
      insert into owners (display_name)
      values ('Owner A'), ('Owner B')
      returning id
    `;
    const [vendorA] = await client<[{ id: string }]>`
      insert into vendors (owner_id, name)
      values (${ownerA.id}, 'Hetzner')
      returning id
    `;

    await client`
      insert into projects (owner_id, name, code, summary, status, stage, color)
      values (${ownerA.id}, 'Kershell', 'KERSHELL', 'Operations', 'LIVE', 'Production', '#B4F23F')
    `;

    await expect(
      client`
        insert into projects (owner_id, name, code, summary, status, stage, color)
        values (${ownerA.id}, 'Duplicate', 'KERSHELL', 'Duplicate', 'BETA', 'Beta', '#B4F23F')
      `,
    ).rejects.toMatchObject({ code: "23505" });

    await expect(
      client`
        insert into subscriptions (
          owner_id, vendor_id, name, plan, category, status,
          amount_minor, currency, billing_interval
        ) values (
          ${ownerA.id}, ${vendorA.id}, 'Invalid money', 'Test', 'HOSTING',
          'ACTIVE', -1, 'EUR', 'MONTHLY'
        )
      `,
    ).rejects.toMatchObject({ code: "23514" });

    await expect(
      client`
        insert into subscriptions (
          owner_id, vendor_id, name, plan, category, status,
          amount_minor, currency, billing_interval
        ) values (
          ${ownerB.id}, ${vendorA.id}, 'Cross owner', 'Test', 'HOSTING',
          'ACTIVE', 549, 'EUR', 'MONTHLY'
        )
      `,
    ).rejects.toMatchObject({ code: "23503" });

    await expect(
      client`
        insert into subscriptions (
          owner_id, vendor_id, name, plan, category, status,
          amount_minor, currency, billing_interval, payment_method_label
        ) values (
          ${ownerA.id}, ${vendorA.id}, 'Unsafe card', 'Test', 'HOSTING',
          'ACTIVE', 549, 'EUR', 'MONTHLY', '4111 1111 1111 1111'
        )
      `,
    ).rejects.toMatchObject({ code: "23514" });

    await expect(
      client`
        insert into subscriptions (
          owner_id, vendor_id, name, plan, category, status,
          amount_minor, currency, billing_interval
        ) values (
          ${ownerA.id}, ${vendorA.id}, 'Incomplete trial', 'Test', 'HOSTING',
          'TRIAL', 0, 'EUR', 'MONTHLY'
        )
      `,
    ).rejects.toMatchObject({ code: "23514" });
  });

  it("contains references, not secret value columns", async () => {
    const columns = await client<{ column_name: string }[]>`
      select column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'credential_references'
    `;

    expect(columns.map(({ column_name: name }) => name)).toEqual(
      expect.arrayContaining(["secret_provider", "external_item_id"]),
    );
    expect(columns.map(({ column_name: name }) => name)).not.toEqual(
      expect.arrayContaining(["password", "token", "secret_value", "private_key"]),
    );
  });
});
