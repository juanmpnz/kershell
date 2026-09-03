import { describe, expect, it } from "vitest";

import { parseProjectFormData } from "@/lib/projects/project-form";

function validFormData() {
  const formData = new FormData();
  formData.set("code", " private_ops ");
  formData.set("color", "#B4F23F");
  formData.set("name", "Private Operations");
  formData.set("stage", "Planning");
  formData.set("startedOn", "");
  formData.set("status", "BETA");
  formData.set("summary", "Private operations platform.");
  formData.set("technologies", "Next.js, PostgreSQL");
  return formData;
}

describe("parseProjectFormData", () => {
  it("normalizes a valid server action payload", () => {
    const result = parseProjectFormData(validFormData());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        code: "PRIVATE_OPS",
        startedOn: null,
        technologies: ["Next.js", "PostgreSQL"],
      });
    }
  });

  it("rejects duplicate technologies and unexpected file values", () => {
    const duplicateTechnologies = validFormData();
    duplicateTechnologies.set("technologies", "Next.js, next.js");
    const fileValue = validFormData();
    fileValue.set("name", new File(["unsafe"], "project.txt"));

    expect(parseProjectFormData(duplicateTechnologies).success).toBe(false);
    expect(parseProjectFormData(fileValue).success).toBe(false);
  });
});
