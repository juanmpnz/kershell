import { describe, expect, it } from "vitest";

import { createSubscriptionSchema } from "../subscriptions";

const validSubscription = {
  vendorId: "018f47a8-43dc-7c49-9800-bc8f5ca12aa2",
  name: "Hetzner Cloud",
  plan: "CX23",
  category: "HOSTING",
  status: "ACTIVE",
  amountMinor: 549,
  currency: "EUR",
  billingInterval: "MONTHLY",
  nextChargeOn: "2026-10-03",
  trialEndsOn: null,
  cancelledAt: null,
  accountEmail: null,
  paymentMethodLabel: "Visa •• 4421",
  websiteUrl: "https://console.hetzner.cloud",
  notes: null,
  projectIds: ["018f47a8-43dc-7c49-9800-bc8f5ca12aa3"],
};

describe("createSubscriptionSchema", () => {
  it("accepts integer minor units and a masked payment label", () => {
    expect(createSubscriptionSchema.safeParse(validSubscription).success).toBe(true);
  });

  it("requires a trial end date for trial subscriptions", () => {
    expect(
      createSubscriptionSchema.safeParse({
        ...validSubscription,
        status: "TRIAL",
        trialEndsOn: null,
      }).success,
    ).toBe(false);
  });

  it("rejects decimals, raw card numbers and duplicate project links", () => {
    expect(
      createSubscriptionSchema.safeParse({
        ...validSubscription,
        amountMinor: 5.49,
      }).success,
    ).toBe(false);
    expect(
      createSubscriptionSchema.safeParse({
        ...validSubscription,
        paymentMethodLabel: "4111 1111 1111 1111",
      }).success,
    ).toBe(false);
    expect(
      createSubscriptionSchema.safeParse({
        ...validSubscription,
        projectIds: [validSubscription.projectIds[0], validSubscription.projectIds[0]],
      }).success,
    ).toBe(false);
  });
});
