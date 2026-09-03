"use server";

import { getDatabase } from "@kershell/db/client";
import { createProject } from "@kershell/db/repositories/projects";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOwner } from "@/lib/auth/owner-session";
import {
  parseProjectFormData,
  type ProjectActionState,
} from "@/lib/projects/project-form";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export async function createProjectAction(
  _previousState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const owner = await requireOwner();
  const parsed = parseProjectFormData(formData);

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revisá los campos marcados antes de guardar.",
    };
  }

  try {
    await createProject(getDatabase(), owner.ownerId, parsed.data);
  } catch (error) {
    return {
      message: isUniqueViolation(error)
        ? "Ya existe un proyecto activo con ese código."
        : "No se pudo guardar el proyecto. Intentá nuevamente.",
    };
  }

  revalidatePath("/dashboard/vault");
  redirect("/dashboard/vault");
}
