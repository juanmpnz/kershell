import { createProjectSchema, type CreateProject } from "@kershell/domain";

export type ProjectActionState = {
  fieldErrors?: Partial<Record<keyof CreateProject, string[]>>;
  message?: string;
};

export const initialProjectActionState: ProjectActionState = {};

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function parseProjectFormData(formData: FormData) {
  const technologies = readText(formData, "technologies")
    .split(",")
    .map((technology) => technology.trim())
    .filter(Boolean);
  const startedOn = readText(formData, "startedOn").trim();

  return createProjectSchema.safeParse({
    code: readText(formData, "code"),
    color: readText(formData, "color"),
    name: readText(formData, "name"),
    stage: readText(formData, "stage"),
    startedOn: startedOn || null,
    status: readText(formData, "status"),
    summary: readText(formData, "summary"),
    technologies,
  });
}
