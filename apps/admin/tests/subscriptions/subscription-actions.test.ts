import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  archive: vi.fn(), create: vi.fn(), database: vi.fn(() => "db"),
  redirect: vi.fn(() => { throw new Error("NEXT_REDIRECT"); }),
  revalidate: vi.fn(), requireOwner: vi.fn(), update: vi.fn(),
}));

vi.mock("@kershell/db/client", () => ({ getDatabase: mocks.database }));
vi.mock("@kershell/db/repositories/subscriptions", () => ({ archiveSubscription: mocks.archive, createSubscription: mocks.create, updateSubscription: mocks.update }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth/owner-session", () => ({ requireOwner: mocks.requireOwner }));

import {
  archiveSubscriptionAction,
  createSubscriptionAction,
  updateSubscriptionAction,
} from "@/app/(dashboard)/dashboard/subscriptions/actions";

const subscriptionId = "40000000-0000-4000-8000-000000000001";

function payload() {
  const data = new FormData();
  data.set("vendorId", "30000000-0000-4000-8000-000000000001");
  data.set("name", "Hetzner"); data.set("plan", "CX23");
  data.set("category", "HOSTING"); data.set("status", "ACTIVE");
  data.set("amount", "5.49"); data.set("currency", "EUR");
  data.set("billingInterval", "MONTHLY"); data.set("nextChargeOn", "2026-10-03");
  return data;
}

describe("subscription server actions", () => {
  beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

  it("rejects direct invocation before database access", async () => {
    mocks.requireOwner.mockRejectedValue(new Error("unauthorized"));
    await expect(createSubscriptionAction({}, payload())).rejects.toThrow("unauthorized");
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("writes validated input with the authenticated owner", async () => {
    mocks.requireOwner.mockResolvedValue({ ownerId: "owner-one" });
    mocks.create.mockResolvedValue("subscription-one");
    await expect(createSubscriptionAction({}, payload())).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.create).toHaveBeenCalledWith("db", "owner-one", expect.objectContaining({ amountMinor: 549, currency: "EUR" }));
    expect(mocks.redirect).toHaveBeenCalledWith(
      "/dashboard/subscriptions?notice=created",
    );
  });

  it("scopes updates and archives to the authenticated owner", async () => {
    mocks.requireOwner.mockResolvedValue({ ownerId: "owner-one" });
    mocks.update.mockResolvedValue(true);
    mocks.archive.mockResolvedValue(true);

    await expect(updateSubscriptionAction(subscriptionId, {}, payload())).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.update).toHaveBeenCalledWith("db", "owner-one", subscriptionId, expect.objectContaining({ amountMinor: 549 }));
    expect(mocks.redirect).toHaveBeenCalledWith(
      "/dashboard/subscriptions?notice=updated",
    );

    mocks.redirect.mockClear();
    await expect(archiveSubscriptionAction(subscriptionId)).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.archive).toHaveBeenCalledWith("db", "owner-one", subscriptionId);
    expect(mocks.redirect).toHaveBeenCalledWith(
      "/dashboard/subscriptions?notice=archived",
    );
  });
});
