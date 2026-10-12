import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

describe("approved public portfolio", () => {
  for (const [locale, messages] of Object.entries({ en, es })) {
    it(`${locale} includes all four selected projects with matching artwork identifiers`, () => {
      expect(messages.portfolio.items.map(item => item.id)).toEqual([
        "ediflow", "operational", "futscan", "campos",
      ]);
      expect(messages.portfolio.items.find(item => item.id === "campos")?.url).toBe("https://www.camposinmobiliaria.com/");
    });
    it(`${locale} does not expose pending products as working external links`, () => {
      for (const item of messages.portfolio.items.filter(item => item.id !== "campos")) {
        expect(item.url).toBeNull();
        expect(item.description.length).toBeGreaterThan(30);
      }
    });
  }
});
