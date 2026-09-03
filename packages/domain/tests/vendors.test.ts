import { describe, expect, it } from "vitest";

import { createVendorSchema } from "../vendors";

describe("createVendorSchema", () => {
  it("accepts an HTTPS vendor URL", () => {
    expect(
      createVendorSchema.safeParse({
        name: "Hetzner",
        websiteUrl: "https://www.hetzner.com",
        notes: null,
      }).success,
    ).toBe(true);
  });

  it("rejects relative URLs and unknown fields", () => {
    expect(
      createVendorSchema.safeParse({
        name: "Hetzner",
        websiteUrl: "/billing",
        notes: null,
      }).success,
    ).toBe(false);
    expect(
      createVendorSchema.safeParse({
        name: "Hetzner",
        websiteUrl: null,
        notes: null,
        apiToken: "must-not-cross-the-boundary",
      }).success,
    ).toBe(false);
  });
});
