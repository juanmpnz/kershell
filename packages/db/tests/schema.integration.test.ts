import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { readFile } from "node:fs/promises";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import * as schema from "../schema";
import {
  authorizeAndProvisionOwner,
  getAuthorizedOwner,
} from "../repositories/auth";
import {
  archiveProject,
  createProject,
  listProjectOverviews,
  updateProject,
} from "../repositories/projects";
import { seedDatabase, seedExpectations, seedFixture } from "../seed";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for database integration tests.");
}

const client = postgres(databaseUrl, { max: 1 });
const db = drizzle(client, { schema });

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" });
  await migrate(db, { migrationsFolder: "./drizzle" });
});

afterAll(async () => {
  await client.end();
});

describe("initial PostgreSQL schema", () => {
  it("stores revocable Better Auth sessions with constrained Google accounts", async () => {
    const [authUser] = await client<[{ id: string }]>`
      insert into auth_users (name, email, email_verified)
      values ('Kershell Owner', 'owner@example.invalid', true)
      returning id
    `;

    await client`
      insert into auth_sessions (token, expires_at, user_id)
      values ('opaque-session-one', now() + interval '1 hour', ${authUser.id})
    `;
    await client`
      insert into auth_accounts (issuer, account_id, provider_id, user_id)
      values ('https://accounts.google.com', 'google-subject-one', 'google', ${authUser.id})
    `;

    await expect(
      client`
        insert into auth_accounts (issuer, account_id, provider_id, user_id)
        values ('https://accounts.google.com', 'google-subject-one', 'google', ${authUser.id})
      `,
    ).rejects.toMatchObject({ code: "23505" });

    await client`delete from auth_users where id = ${authUser.id}`;

    const [remaining] = await client<
      [{ accounts: number; sessions: number }]
    >`
      select
        (select count(*)::int from auth_accounts where user_id = ${authUser.id}) as accounts,
        (select count(*)::int from auth_sessions where user_id = ${authUser.id}) as sessions
    `;

    expect(remaining).toEqual({ accounts: 0, sessions: 0 });
  });

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

describe("sanitized initial seed", () => {
  it("is idempotent and preserves fixture counts and monthly totals", async () => {
    await seedDatabase(db);
    await seedDatabase(db);

    const [counts] = await client<
      [{
        projects: number;
        vendors: number;
        subscriptions: number;
        credentials: number;
        projectSubscriptions: number;
        technologies: number;
      }]
    >`
      select
        (select count(*)::int from projects where owner_id = ${seedFixture.owner.id}) as projects,
        (select count(*)::int from vendors where owner_id = ${seedFixture.owner.id}) as vendors,
        (select count(*)::int from subscriptions where owner_id = ${seedFixture.owner.id}) as subscriptions,
        (select count(*)::int from credential_references where owner_id = ${seedFixture.owner.id}) as credentials,
        (select count(*)::int from project_subscriptions where owner_id = ${seedFixture.owner.id}) as "projectSubscriptions",
        (select count(*)::int from project_technologies where project_id in (
          select id from projects where owner_id = ${seedFixture.owner.id}
        )) as technologies
    `;
    const [totals] = await client<[{ monthly_total_minor: number }]>`
      select sum(
        case billing_interval
          when 'YEARLY' then amount_minor / 12
          else amount_minor
        end
      )::int as monthly_total_minor
      from subscriptions
      where owner_id = ${seedFixture.owner.id}
        and archived_at is null
    `;

    expect(counts).toEqual({
      projects: seedExpectations.projects,
      vendors: seedExpectations.vendors,
      subscriptions: seedExpectations.subscriptions,
      credentials: seedExpectations.credentialReferences,
      projectSubscriptions: seedExpectations.projectSubscriptions,
      technologies: seedExpectations.technologies,
    });
    expect(totals.monthly_total_minor).toBe(
      seedExpectations.monthlyTotalMinor,
    );
  });

  it("contains no secret-bearing keys or token-like fixture values", () => {
    const forbiddenKeys = new Set([
      "connectionstring",
      "fields",
      "password",
      "privatekey",
      "secretvalue",
      "token",
    ]);

    function visit(value: unknown): void {
      if (Array.isArray(value)) {
        value.forEach(visit);
        return;
      }

      if (value && typeof value === "object") {
        for (const [key, child] of Object.entries(value)) {
          expect(forbiddenKeys.has(key.toLowerCase())).toBe(false);
          visit(child);
        }
      }
    }

    visit(seedFixture);
    expect(JSON.stringify(seedFixture)).not.toMatch(
      /(eyJhbGciOi|postgres(?:ql)?:\/\/|redis:\/\/|sk-(?:ant|live|proj)-|-----BEGIN)/,
    );
  });
});

describe("project data access", () => {
  it("requires an owner scope and derives project metrics without secrets", async () => {
    await seedDatabase(db);

    const [otherOwner] = await client<[{ id: string }]>`
      insert into owners (display_name)
      values ('Isolated owner')
      returning id
    `;
    await client`
      insert into projects (owner_id, name, code, summary, status, stage, color)
      values (${otherOwner.id}, 'Isolated project', 'ISOLATED', 'Must stay isolated', 'LIVE', 'Production', '#FFFFFF')
    `;

    const projects = await listProjectOverviews(db, seedFixture.owner.id);
    const isolatedProjects = await listProjectOverviews(db, otherOwner.id);
    const campos = projects.find((project) => project.code === "CAMPOS");

    expect(projects).toHaveLength(seedExpectations.projects);
    expect(isolatedProjects.map(({ code }) => code)).toEqual(["ISOLATED"]);
    expect(campos).toMatchObject({
      credentialReferenceCount: 5,
      monthlyAmountMinor: 6_500,
      subscriptionCount: 3,
      technologies: ["Next.js", "Supabase", "Vercel", "Resend"],
    });
    expect(JSON.stringify(projects)).not.toMatch(
      /password|privateKey|secretValue|token/i,
    );
  });

  it("creates, updates and archives projects only inside the owner scope", async () => {
    await seedDatabase(db);
    const [otherOwner] = await client<[{ id: string }]>`
      insert into owners (display_name)
      values ('Project mutation boundary')
      returning id
    `;
    const projectId = await createProject(db, seedFixture.owner.id, {
      code: "private_ops",
      color: "#123ABC",
      name: "Private Operations",
      stage: "Planning",
      startedOn: null,
      status: "BETA",
      summary: "Owner-scoped project mutation test.",
      technologies: ["Next.js", "PostgreSQL"],
    });

    await expect(
      updateProject(db, otherOwner.id, projectId, {
        code: "HIJACKED",
        color: "#FFFFFF",
        name: "Hijacked",
        stage: "Unknown",
        startedOn: null,
        status: "PAUSED",
        summary: "Must never be written.",
        technologies: [],
      }),
    ).resolves.toBe(false);
    await expect(archiveProject(db, otherOwner.id, projectId)).resolves.toBe(
      false,
    );

    await expect(
      updateProject(db, seedFixture.owner.id, projectId, {
        code: "private_ops",
        color: "#ABC123",
        name: "Private Operations Updated",
        stage: "Production",
        startedOn: "2026-09-03",
        status: "LIVE",
        summary: "Updated through the owner-scoped repository.",
        technologies: ["PostgreSQL", "Next.js"],
      }),
    ).resolves.toBe(true);

    const updated = (
      await listProjectOverviews(db, seedFixture.owner.id)
    ).find((project) => project.id === projectId);

    expect(updated).toMatchObject({
      code: "PRIVATE_OPS",
      color: "#ABC123",
      name: "Private Operations Updated",
      status: "LIVE",
      technologies: ["PostgreSQL", "Next.js"],
    });
    await expect(
      archiveProject(db, seedFixture.owner.id, projectId),
    ).resolves.toBe(true);
    expect(
      (await listProjectOverviews(db, seedFixture.owner.id)).some(
        (project) => project.id === projectId,
      ),
    ).toBe(false);
  });

  it("propagates database outages instead of returning mock data", async () => {
    const unavailableClient = postgres(
      "postgres://unavailable:unavailable@127.0.0.1:1/unavailable",
      { connect_timeout: 1, max: 1 },
    );
    const unavailableDb = drizzle(unavailableClient, { schema });

    try {
      await expect(
        listProjectOverviews(unavailableDb, seedFixture.owner.id),
      ).rejects.toBeDefined();
    } finally {
      await unavailableClient.end();
    }
  });

  it("marks database clients and repositories as server-only", async () => {
    const sources = await Promise.all([
      readFile(new URL("../client.ts", import.meta.url), "utf8"),
      readFile(
        new URL("../repositories/projects.ts", import.meta.url),
        "utf8",
      ),
    ]);

    for (const source of sources) {
      expect(source.startsWith('import "server-only";')).toBe(true);
    }
  });
});

describe("owner identity data access", () => {
  it("maps an allowed Google user to the sole active owner and honors revocation", async () => {
    await seedDatabase(db);
    const [authUser] = await client<[{ id: string }]>`
      insert into auth_users (name, email, email_verified)
      values ('Personal Owner', 'personal-owner@example.invalid', true)
      returning id
    `;

    await client`
      insert into auth_accounts (issuer, account_id, provider_id, user_id)
      values (
        'https://accounts.google.com',
        'personal-google-subject',
        'google',
        ${authUser.id}
      )
    `;

    const admission = await authorizeAndProvisionOwner(db, {
      allowedEmails: [
        "owner@workspace.example.invalid",
        "personal-owner@example.invalid",
      ],
      authUserId: authUser.id,
      ownerId: seedFixture.owner.id,
      workspaceDomain: "workspace.example.invalid",
    });

    expect(admission).toEqual({ ownerId: seedFixture.owner.id });

    const [identity] = await client<
      [{ email: string; hosted_domain: string | null; owner_id: string }]
    >`
      select email, hosted_domain, owner_id
      from admin_identities
      where auth_user_id = ${authUser.id}
    `;

    expect(identity).toEqual({
      email: "personal-owner@example.invalid",
      hosted_domain: null,
      owner_id: seedFixture.owner.id,
    });
    await expect(getAuthorizedOwner(db, authUser.id)).resolves.toEqual({
      ownerId: seedFixture.owner.id,
    });

    await client`
      update admin_identities
      set status = 'DISABLED'
      where auth_user_id = ${authUser.id}
    `;

    await expect(
      authorizeAndProvisionOwner(db, {
        allowedEmails: [
          "owner@workspace.example.invalid",
          "personal-owner@example.invalid",
        ],
        authUserId: authUser.id,
        ownerId: seedFixture.owner.id,
        workspaceDomain: "workspace.example.invalid",
      }),
    ).resolves.toBeNull();
    await expect(getAuthorizedOwner(db, authUser.id)).resolves.toBeNull();
  });
});
