import { describe, expect, it } from "vitest";
import { adjacentProject, locationHash, parseLocation, PROJECT_IDS } from "@/lib/experience/navigation";

describe("viewport navigation", () => {
  it("opens each project from a shareable URL without scrolling to a section", () => {
    for (const id of PROJECT_IDS) expect(parseLocation(locationHash("project", id))).toEqual({ view: "project", project: id });
  });
  it("retains existing bookmarked section destinations", () => {
    expect(parseLocation("#portfolio").view).toBe("project");
    expect(parseLocation("#why").view).toBe("studio");
    expect(parseLocation("#process").view).toBe("approach");
  });
  it("falls back safely from unknown destinations", () => {
    expect(parseLocation("#project-missing").view).toBe("home");
  });
  it("wraps project navigation in both directions", () => {
    expect(adjacentProject("ediflow", -1)).toBe("campos");
    expect(adjacentProject("campos", 1)).toBe("ediflow");
  });
});
