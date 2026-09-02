import { describe, expect, it } from "vitest";

import { routing } from "@/i18n/routing";

describe("current public localization", () => {
  it("keeps English and Spanish with English as the default", () => {
    expect(routing.locales).toEqual(["en", "es"]);
    expect(routing.defaultLocale).toBe("en");
  });
});
