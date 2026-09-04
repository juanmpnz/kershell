"use client";

import type { CredentialReferenceDto } from "@kershell/db/repositories/credential-references";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Field } from "@/components/dashboard/ui/Field";
import { Input } from "@/components/dashboard/ui/Input";
import { Select } from "@/components/dashboard/ui/Select";
import {
  initialCredentialActionState,
  type CredentialActionState,
} from "@/lib/credentials/credential-form";

type CredentialReferenceFormProps = {
  action: (
    state: CredentialActionState,
    formData: FormData,
  ) => Promise<CredentialActionState>;
  projectId: string;
  reference?: CredentialReferenceDto;
};

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.length ? (
    <p className="mt-1 text-xs text-danger">{messages[0]}</p>
  ) : null;
}

function SubmitButton({ edit }: { edit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Guardando…" : edit ? "Guardar cambios" : "Crear referencia"}
    </button>
  );
}

export function CredentialReferenceForm({
  action,
  projectId,
  reference,
}: CredentialReferenceFormProps) {
  const [state, formAction] = useActionState(
    action,
    initialCredentialActionState,
  );

  return (
    <form action={formAction} className="grid gap-6 p-8">
      {state.message ? (
        <p
          className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <div className="rounded-md border border-warn/30 bg-warn/10 p-4 text-sm text-warn">
        No pegues aquí contraseñas, tokens ni connection strings. Solo el
        identificador opaco del elemento externo.
      </div>

      <div className="grid gap-5 rounded-[10px] border border-border bg-surface p-5 md:grid-cols-2">
        <Field label="Nombre">
          <Input
            autoComplete="off"
            defaultValue={reference?.name}
            maxLength={120}
            name="name"
            required
          />
          <FieldError messages={state.fieldErrors?.name} />
        </Field>
        <Field label="Servicio">
          <Input
            autoComplete="off"
            defaultValue={reference?.service}
            maxLength={120}
            name="service"
            required
          />
          <FieldError messages={state.fieldErrors?.service} />
        </Field>
        <Field label="Entorno">
          <Select
            defaultValue={reference?.environment ?? "PRODUCTION"}
            name="environment"
          >
            <option value="PRODUCTION">Producción</option>
            <option value="STAGING">Staging</option>
            <option value="DEVELOPMENT">Desarrollo</option>
            <option value="SHARED">Compartido</option>
          </Select>
          <FieldError messages={state.fieldErrors?.environment} />
        </Field>
        <Field label="Tipo">
          <Select
            defaultValue={reference?.credentialType ?? "LOGIN"}
            name="credentialType"
          >
            <option value="API_KEY">API key</option>
            <option value="LOGIN">Login</option>
            <option value="CONNECTION_STRING">Connection string</option>
            <option value="DEPLOY_TOKEN">Deploy token</option>
            <option value="DSN">DSN</option>
            <option value="OAUTH_CLIENT">OAuth client</option>
            <option value="SSH_KEY">SSH key</option>
          </Select>
          <FieldError messages={state.fieldErrors?.credentialType} />
        </Field>
        <Field label="Gestor externo">
          <Select
            defaultValue={reference?.secretProvider ?? "ONEPASSWORD"}
            name="secretProvider"
          >
            <option value="ONEPASSWORD">1Password</option>
            <option value="BITWARDEN">Bitwarden</option>
            <option value="KEEPASSXC">KeePassXC</option>
            <option value="OTHER">Otro</option>
          </Select>
          <FieldError messages={state.fieldErrors?.secretProvider} />
        </Field>
        <Field label="ID opaco externo">
          <Input
            autoComplete="off"
            defaultValue={reference?.externalItemId}
            maxLength={200}
            name="externalItemId"
            pattern="[A-Za-z0-9][A-Za-z0-9._:-]+"
            required
          />
          <FieldError messages={state.fieldErrors?.externalItemId} />
        </Field>
        <Field label="Última rotación">
          <Input
            defaultValue={reference?.lastRotatedAt?.slice(0, 10) ?? ""}
            name="lastRotatedOn"
            type="date"
          />
          <FieldError messages={state.fieldErrors?.lastRotatedAt} />
        </Field>
        <Field label="Rotar cada (días)">
          <Input
            defaultValue={reference?.rotationIntervalDays ?? ""}
            max={3650}
            min={1}
            name="rotationIntervalDays"
            type="number"
          />
          <FieldError messages={state.fieldErrors?.rotationIntervalDays} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Notas sin secretos">
            <textarea
              className="min-h-24 w-full rounded-md border border-border bg-[var(--ink-2)] p-3 text-sm text-text"
              defaultValue={reference?.notes ?? ""}
              maxLength={5000}
              name="notes"
            />
            <FieldError messages={state.fieldErrors?.notes} />
          </Field>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          className="rounded-md border border-border px-4 py-2 text-sm text-text-dim"
          href={`/dashboard/vault/${projectId}`}
        >
          Cancelar
        </Link>
        <SubmitButton edit={Boolean(reference)} />
      </div>
    </form>
  );
}
