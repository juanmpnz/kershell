import { describe, expect, it } from "vitest";

import {
  parseMoneyToMinorUnits,
  parseSubscriptionFormData,
} from "@/lib/subscriptions/subscription-form";

function formData() {
  const data = new FormData();
  data.set("vendorId", "30000000-0000-4000-8000-000000000001");
  data.set("name", "Hetzner");
  data.set("plan", "CX23");
  data.set("category", "HOSTING");
  data.set("status", "ACTIVE");
  data.set("amount", "5,49");
  data.set("currency", "eur");
  data.set("billingInterval", "MONTHLY");
  data.set("nextChargeOn", "2026-10-03");
  data.set("trialEndsOn", "");
  data.set("accountEmail", "");
  data.set("paymentMethodLabel", "Visa •• 4421");
  data.set("websiteUrl", "https://console.hetzner.cloud");
  data.set("notes", "");
  data.append("projectIds", "20000000-0000-4000-8000-000000000001");
  data.append("projectIds", "20000000-0000-4000-8000-000000000002");
  return data;
}

describe("subscription form boundary", () => {
  it("parses decimal money exactly into minor units", () => {
    expect(parseMoneyToMinorUnits("5.49")).toBe(549);
    expect(parseMoneyToMinorUnits("5,4")).toBe(540);
    expect(parseMoneyToMinorUnits("5.499")).toBeNull();
    expect(parseMoneyToMinorUnits("1e3")).toBeNull();
  });

  it("normalizes nullable fields, currency and multiple projects", () => {
    const result = parseSubscriptionFormData(formData());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        amountMinor: 549,
        currency: "EUR",
        notes: null,
        projectIds: [
          "20000000-0000-4000-8000-000000000001",
          "20000000-0000-4000-8000-000000000002",
        ],
      });
    }
  });

  it("rejects raw card numbers and trials without an end date", () => {
    const rawCard = formData();
    rawCard.set("paymentMethodLabel", "4111 1111 1111 1111");
    const trial = formData();
    trial.set("status", "TRIAL");

    expect(parseSubscriptionFormData(rawCard).success).toBe(false);
    expect(parseSubscriptionFormData(trial).success).toBe(false);
  });
});
