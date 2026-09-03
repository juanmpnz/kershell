import { describe, expect, it } from "vitest";

import { createProjectSchema } from "../projects";

const validProject = {
  name: "Kershell Platform",
  code: "KERSHELL",
  status: "LIVE",
  stage: "Production",
  summary: "Private operations platform.",
  technologies: ["Next.js", "PostgreSQL"],
  color: "#B4F23F",
  startedOn: "2026-09-03",
};

describe("createProjectSchema", () => {
  it("accepts a valid project and normalizes its code", () => {
    const result = createProjectSchema.parse({
      ...validProject,
      code: " kershell ",
    });

    expect(result.code).toBe("KERSHELL");
  });

  it("rejects duplicate technologies and invalid calendar dates", () => {
    expect(
      createProjectSchema.safeParse({
        ...validProject,
        technologies: ["Next.js", "next.js"],
      }).success,
    ).toBe(false);
    expect(
      createProjectSchema.safeParse({
        ...validProject,
        startedOn: "2026-02-30",
      }).success,
    ).toBe(false);
  });
});
