"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { ProjectOverviewDto } from "@kershell/db/repositories/projects";

import { createProjectAction } from "@/app/(dashboard)/dashboard/vault/actions";
import { Field } from "@/components/dashboard/ui/Field";
import { Input } from "@/components/dashboard/ui/Input";
import { Select } from "@/components/dashboard/ui/Select";
import {
  initialProjectActionState,
  type ProjectActionState,
} from "@/lib/projects/project-form";

type ProjectFormProps = {
  action?: (
    previousState: ProjectActionState,
    formData: FormData,
  ) => Promise<ProjectActionState>;
  cancelHref?: string;
  project?: ProjectOverviewDto;
};

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.length ? (
    <p className="mt-1 text-xs text-danger">{messages[0]}</p>
  ) : null;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Guardando…" : label}
    </button>
  );
}

export function ProjectForm({
  action = createProjectAction,
  cancelHref = "/dashboard/vault",
  project,
}: ProjectFormProps) {
  const [state, formAction] = useActionState(
    action,
    initialProjectActionState,
  );

  return (
    <form action={formAction} className="grid gap-6 p-8">
      {state.message ? (
        <div
          className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-5 rounded-[10px] border border-border bg-surface p-5 md:grid-cols-2">
        <Field label="Nombre">
          <Input autoComplete="off" defaultValue={project?.name} maxLength={120} name="name" required />
          <FieldError messages={state.fieldErrors?.name} />
        </Field>
        <Field label="Código">
          <Input
            autoCapitalize="characters"
            autoComplete="off"
            defaultValue={project?.code}
            maxLength={32}
            name="code"
            pattern="[A-Za-z0-9][A-Za-z0-9_-]{1,31}"
            placeholder="KERSHELL"
            required
          />
          <FieldError messages={state.fieldErrors?.code} />
        </Field>
        <Field label="Estado">
          <Select defaultValue={project?.status ?? "BETA"} name="status">
            <option value="LIVE">Producción</option>
            <option value="BETA">Beta</option>
            <option value="PAUSED">Pausado</option>
          </Select>
          <FieldError messages={state.fieldErrors?.status} />
        </Field>
        <Field label="Etapa">
          <Input defaultValue={project?.stage} maxLength={120} name="stage" placeholder="Planning" required />
          <FieldError messages={state.fieldErrors?.stage} />
        </Field>
        <Field label="Fecha de inicio">
          <Input defaultValue={project?.startedOn ?? ""} name="startedOn" type="date" />
          <FieldError messages={state.fieldErrors?.startedOn} />
        </Field>
        <Field label="Color">
          <Input defaultValue={project?.color ?? "#B4F23F"} name="color" type="color" />
          <FieldError messages={state.fieldErrors?.color} />
        </Field>
        <Field label="Tecnologías (separadas por coma)">
          <Input
            autoComplete="off"
            defaultValue={project?.technologies.join(", ")}
            name="technologies"
            placeholder="Next.js, PostgreSQL"
          />
          <FieldError messages={state.fieldErrors?.technologies} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Resumen">
            <textarea
              className="min-h-32 w-full resize-y rounded-md border border-border bg-[var(--ink-2)] px-3 py-2 text-sm text-text outline-none transition focus:border-accent"
              maxLength={2000}
              name="summary"
              required
              defaultValue={project?.summary}
            />
            <FieldError messages={state.fieldErrors?.summary} />
          </Field>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          className="rounded-md border border-border px-4 py-2 text-sm text-text-dim transition hover:bg-surface"
          href={cancelHref}
        >
          Cancelar
        </Link>
        <SubmitButton label={project ? "Guardar cambios" : "Crear proyecto"} />
      </div>
    </form>
  );
}
