export const PROJECT_IDS = ["ediflow", "operational", "futscan", "campos"] as const;
export type ProjectId = (typeof PROJECT_IDS)[number];
export type View = "home" | "project" | "services" | "studio" | "approach" | "faq" | "contact";
export type ExperienceLocation = { view: View; project: ProjectId };

export function parseLocation(hash: string): ExperienceLocation {
  const value = hash.replace(/^#/, "");
  const project = PROJECT_IDS.find(id => value === `project-${id}`);
  if (project) return { view: "project", project };
  if (value === "portfolio") return { view: "project", project: "ediflow" };
  if (value === "why" || value === "studio") return { view: "studio", project: "ediflow" };
  if (value === "process" || value === "approach") return { view: "approach", project: "ediflow" };
  if (value === "services" || value === "faq" || value === "contact") return { view: value, project: "ediflow" };
  return { view: "home", project: "ediflow" };
}

export function locationHash(view: View, project: ProjectId = "ediflow"): string {
  return view === "project" ? `#project-${project}` : `#${view}`;
}

export function adjacentProject(project: ProjectId, direction: -1 | 1): ProjectId {
  return PROJECT_IDS[(PROJECT_IDS.indexOf(project) + direction + PROJECT_IDS.length) % PROJECT_IDS.length];
}
