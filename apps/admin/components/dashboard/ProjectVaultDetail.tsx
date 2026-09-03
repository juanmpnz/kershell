"use client";

import type { ProjectOverviewDto } from "@kershell/db/repositories/projects";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CredentialCard } from "@/components/dashboard/CredentialCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge, type BadgeTone } from "@/components/dashboard/ui/Badge";
import { Field } from "@/components/dashboard/ui/Field";
import { Icon } from "@/components/dashboard/ui/Icon";
import { IconButton } from "@/components/dashboard/ui/IconButton";
import { Input } from "@/components/dashboard/ui/Input";
import { Modal } from "@/components/dashboard/ui/Modal";
import { Select } from "@/components/dashboard/ui/Select";
import { useToast } from "@/components/dashboard/ui/Toast";
import { deleteCredential, upsertCredential } from "@/lib/dashboard/store";
import type {
  Credential,
  CredentialEnv,
  CredentialField,
  CredentialType,
  Subscription,
} from "@/lib/dashboard/schema";

type ActiveTab = "credentials" | "subscriptions" | "notes";

type ProjectVaultDetailProps = {
  credentials: Credential[];
  project: ProjectOverviewDto;
  subscriptions: Subscription[];
  today: string;
};

const STATUS_TONE: Record<ProjectOverviewDto["status"], BadgeTone> = {
  LIVE: "ok",
  BETA: "info",
  PAUSED: "neutral",
};

const STATUS_LABEL: Record<ProjectOverviewDto["status"], string> = {
  LIVE: "Producción",
  BETA: "Beta",
  PAUSED: "Pausado",
};

const CREDENTIAL_TYPES: CredentialType[] = [
  "API key",
  "Login",
  "Connection string",
  "Deploy token",
  "DSN",
  "OAuth client",
  "SSH key",
];
const CREDENTIAL_ENVS: CredentialEnv[] = ["prod", "staging", "dev", "shared"];
const ROTATION_OPTIONS = ["30", "60", "90", "180", "never"] as const;

function formatDate(iso: string) {
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00.000Z` : iso);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  })
    .format(date)
    .replaceAll(".", "");
}

function formatMoney(amountMinor: number) {
  return new Intl.NumberFormat("es-ES", {
    currency: "USD",
    style: "currency",
  }).format(amountMinor / 100);
}

function createEmptyCredential(today: string): Credential {
  return {
    id: `c-${crypto.randomUUID().slice(0, 8)}`,
    name: "",
    type: "API key",
    service: "",
    env: "prod",
    updated: today,
    addedBy: "jero@kershell.dev",
    fields: [{ k: "", v: "", secret: true }],
    tags: [],
    rotateEvery: "never",
    notes: "",
  };
}

export function ProjectVaultDetail({ credentials, project, subscriptions, today }: ProjectVaultDetailProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("credentials");
  const [items, setItems] = useState(credentials);
  const [draft, setDraft] = useState<Credential | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Credential | null>(null);
  const [notes, setNotes] = useState(
    `Notas operativas de ${project.name}.\n\nRevisar rotación de credenciales productivas cada 90 días.`,
  );
  const { push, Toaster } = useToast();

  async function copyCredential(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    push(`${label} copiado`, "ok");
  }

  function openNewCredential() {
    setDraft(createEmptyCredential(today));
  }

  function saveCredential(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft) {
      return;
    }

    const nextCredential: Credential = {
      ...draft,
      fields: draft.fields.filter((field) => field.k.trim()),
      updated: today,
    };

    upsertCredential(project.id, nextCredential);
    setItems((current) => {
      const exists = current.some((credential) => credential.id === nextCredential.id);
      return exists
        ? current.map((credential) => (credential.id === nextCredential.id ? nextCredential : credential))
        : [nextCredential, ...current];
    });
    setDraft(null);
    push("Credencial guardada", "ok");
  }

  function removeCredential(credential: Credential) {
    deleteCredential(project.id, credential.id);
    setItems((current) => current.filter((item) => item.id !== credential.id));
    setConfirmDelete(null);
    setDraft(null);
    push("Credencial eliminada", "danger");
  }

  const canDeleteDraft = draft ? items.some((credential) => credential.id === draft.id) : false;

  return (
    <>
      <PageHeader
        actions={
          <>
            <Link className="rounded-md border border-border px-3 py-2 text-sm text-text-dim transition hover:bg-surface" href={`/dashboard/vault/${project.id}/edit`}>
              Editar proyecto
            </Link>
            <button className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-ink transition hover:brightness-110" onClick={openNewCredential} type="button">
              Nueva credencial
            </button>
          </>
        }
        eyebrow={
          <>
            <Link className="text-accent hover:underline" href="/dashboard/vault">
              ← Vault
            </Link>{" "}
            / {project.code}
          </>
        }
        foot={
          <>
            <MetaItem label="Estado">
              <Badge dot tone={STATUS_TONE[project.status]}>
                {STATUS_LABEL[project.status]}
              </Badge>
            </MetaItem>
            <MetaItem label="Stack">{project.technologies.join(" · ")}</MetaItem>
            <MetaItem label="Credenciales">{items.length} items</MetaItem>
            <MetaItem label="Suscripciones">{subscriptions.length} servicios</MetaItem>
            <MetaItem label="Gasto mensual">{formatMoney(project.monthlyAmountMinor)}</MetaItem>
            <MetaItem label="Creado">{formatDate(project.createdAt)}</MetaItem>
          </>
        }
        sub={project.summary}
        title={
          <span className="inline-flex items-center gap-3">
            <span className="size-3.5 rounded-sm" style={{ background: project.color }} />
            {project.name}
          </span>
        }
      />

      <div className="border-b border-border px-8">
        <div className="flex gap-5">
          <TabButton active={activeTab === "credentials"} count={items.length} onClick={() => setActiveTab("credentials")}>
            Credenciales
          </TabButton>
          <TabButton active={activeTab === "subscriptions"} count={subscriptions.length} onClick={() => setActiveTab("subscriptions")}>
            Suscripciones
          </TabButton>
          <TabButton active={activeTab === "notes"} count={notes.trim() ? 1 : 0} onClick={() => setActiveTab("notes")}>
            Notas
          </TabButton>
        </div>
      </div>

      <div className="p-8">
        {activeTab === "credentials" ? (
          <div className="grid gap-[14px]">
            {items.map((credential) => (
              <CredentialCard
                credential={credential}
                key={credential.id}
                onCopy={copyCredential}
                onDelete={() => setConfirmDelete(credential)}
                onEdit={() => setDraft({ ...credential, fields: credential.fields.map((field) => ({ ...field })) })}
              />
            ))}
            <button
              className="rounded-[10px] border border-dashed border-border px-5 py-[18px] text-sm text-muted transition hover:bg-surface hover:text-text"
              onClick={openNewCredential}
              type="button"
            >
              + Agregar nueva credencial a {project.name}
            </button>
          </div>
        ) : null}

        {activeTab === "subscriptions" ? <ProjectSubscriptions subscriptions={subscriptions} /> : null}

        {activeTab === "notes" ? (
          <div className="rounded-[10px] border border-border bg-surface p-5">
            <textarea
              className="min-h-[260px] w-full resize-y rounded-md border border-border bg-[var(--ink-2)] px-3 py-3 text-sm leading-6 text-text outline-none transition focus:border-accent"
              onChange={(event) => setNotes(event.target.value)}
              value={notes}
            />
          </div>
        ) : null}
      </div>

      {draft ? (
        <CredentialEditModal
          canDelete={canDeleteDraft}
          credential={draft}
          onChange={setDraft}
          onClose={() => setDraft(null)}
          onConfirmDelete={() => setConfirmDelete(draft)}
          onSubmit={saveCredential}
          projectCode={project.code}
        />
      ) : null}

      <Modal
        eyebrow={<span className="text-danger">Confirmar</span>}
        footer={
          <>
            <button className="rounded-md border border-border px-3 py-2 text-sm text-text-dim hover:bg-surface" onClick={() => setConfirmDelete(null)} type="button">
              Cancelar
            </button>
            <button
              className="rounded-md bg-danger px-3 py-2 text-sm font-semibold text-white hover:brightness-110"
              onClick={() => confirmDelete && removeCredential(confirmDelete)}
              type="button"
            >
              Eliminar
            </button>
          </>
        }
        onClose={() => setConfirmDelete(null)}
        open={Boolean(confirmDelete)}
        title={confirmDelete ? `¿Eliminar "${confirmDelete.name}"?` : "Eliminar credencial"}
        width={420}
      >
        <p className="text-sm text-text-dim">Se van a perder estas claves:</p>
        <ul className="mt-3 grid gap-1 font-mono text-[12px] text-text">
          {confirmDelete?.fields.map((field) => <li key={field.k}>{field.k}</li>)}
        </ul>
      </Modal>

      <Toaster />
    </>
  );
}

function MetaItem({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{label}</span>
      <span className="text-sm text-text-dim">{children}</span>
    </div>
  );
}

function TabButton({
  active,
  children,
  count,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      className={`border-b-2 px-0 py-4 text-sm transition ${active ? "border-accent text-text" : "border-transparent text-muted hover:text-text"}`}
      onClick={onClick}
      type="button"
    >
      {children}{" "}
      <span className="ml-1 rounded border border-border bg-[var(--ink-2)] px-1.5 py-0.5 font-mono text-[10.5px] text-text-dim">
        {count}
      </span>
    </button>
  );
}

function ProjectSubscriptions({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
      <div className="grid min-w-[720px] grid-cols-[2fr_1fr_1fr_1fr] bg-[var(--ink-2)] px-[18px] py-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
        <span>Servicio</span>
        <span>Plan</span>
        <span>Próx. cobro</span>
        <span>Costo</span>
      </div>
      <div className="overflow-x-auto">
        {subscriptions.length ? (
          subscriptions.map((subscription) => (
            <div
              className="grid min-w-[720px] grid-cols-[2fr_1fr_1fr_1fr] border-t border-border px-[18px] py-4 text-sm"
              key={subscription.id}
            >
              <span className="font-medium text-text">{subscription.name}</span>
              <span className="font-mono text-text-dim">{subscription.plan}</span>
              <span className="font-mono text-text-dim">{formatDate(subscription.nextCharge)}</span>
              <span className="font-mono text-text">{formatMoney(subscription.cost)}</span>
            </div>
          ))
        ) : (
          <div className="px-5 py-10 text-center text-sm text-text-dim">No hay suscripciones asociadas.</div>
        )}
      </div>
    </div>
  );
}

function CredentialEditModal({
  canDelete,
  credential,
  onChange,
  onClose,
  onConfirmDelete,
  onSubmit,
  projectCode,
}: {
  canDelete: boolean;
  credential: Credential;
  onChange: (credential: Credential) => void;
  onClose: () => void;
  onConfirmDelete: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  projectCode: string;
}) {
  function updateField(index: number, patch: Partial<CredentialField>) {
    onChange({
      ...credential,
      fields: credential.fields.map((field, currentIndex) => (currentIndex === index ? { ...field, ...patch } : field)),
    });
  }

  function removeField(index: number) {
    onChange({
      ...credential,
      fields: credential.fields.filter((_, currentIndex) => currentIndex !== index),
    });
  }

  return (
    <Modal
      eyebrow={`${projectCode} · ${canDelete ? credential.id : "nueva credencial"}`}
      footer={
        <>
          {canDelete ? (
            <button className="mr-auto rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10" onClick={onConfirmDelete} type="button">
              Eliminar
            </button>
          ) : null}
          <button className="rounded-md border border-border px-3 py-2 text-sm text-text-dim hover:bg-surface" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-ink hover:brightness-110" form="credential-edit-form" type="submit">
            {canDelete ? "Guardar cambios" : "Guardar credencial"}
          </button>
        </>
      }
      onClose={onClose}
      open
      title={credential.name || "Nueva credencial"}
      width={680}
    >
      <form className="grid gap-5" id="credential-edit-form" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre">
            <Input required value={credential.name} onChange={(event) => onChange({ ...credential, name: event.target.value })} />
          </Field>
          <Field label="Servicio">
            <Input required value={credential.service} onChange={(event) => onChange({ ...credential, service: event.target.value })} />
          </Field>
          <Field label="Tipo">
            <Select value={credential.type} onChange={(event) => onChange({ ...credential, type: event.target.value as CredentialType })}>
              {CREDENTIAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Entorno">
            <Select value={credential.env} onChange={(event) => onChange({ ...credential, env: event.target.value as CredentialEnv })}>
              {CREDENTIAL_ENVS.map((env) => (
                <option key={env} value={env}>
                  {env}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="rounded-lg border border-border bg-[var(--ink-2)] p-2">
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <div className="grid flex-1 grid-cols-[160px_1fr_90px_32px] gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              <span>Clave</span>
              <span>Valor</span>
              <span>Secret</span>
              <span />
            </div>
            <button
              className="rounded-md border border-border px-2 py-1 text-xs text-text-dim hover:bg-surface"
              onClick={() => onChange({ ...credential, fields: [...credential.fields, { k: "", v: "", secret: true }] })}
              type="button"
            >
              + Agregar campo
            </button>
          </div>
          <div className="grid gap-2">
            {credential.fields.map((field, index) => (
              <div className="grid grid-cols-[160px_1fr_90px_32px] items-center gap-2" key={`${field.k}-${index}`}>
                <Input className="font-mono" value={field.k} onChange={(event) => updateField(index, { k: event.target.value })} />
                <Input className="font-mono" value={field.v} onChange={(event) => updateField(index, { v: event.target.value })} />
                <label className="flex items-center gap-2 text-xs text-text-dim">
                  <input checked={field.secret} onChange={(event) => updateField(index, { secret: event.target.checked })} type="checkbox" />
                  secret
                </label>
                <IconButton label="Eliminar campo" onClick={() => removeField(index)} size="sm">
                  <Icon name="x" size={12} />
                </IconButton>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tags">
            <Input
              value={credential.tags?.join(", ") ?? ""}
              onChange={(event) =>
                onChange({
                  ...credential,
                  tags: event.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>
          <Field label="Rotar cada">
            <Select
              value={credential.rotateEvery ?? "never"}
              onChange={(event) => onChange({ ...credential, rotateEvery: event.target.value as Credential["rotateEvery"] })}
            >
              {ROTATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "never" ? "no rotar" : `${option} días`}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Notas">
          <textarea
            className="min-h-24 w-full rounded-md border border-border bg-[var(--ink-2)] px-3 py-2 text-[13px] text-text outline-none transition focus:border-accent"
            onChange={(event) => onChange({ ...credential, notes: event.target.value })}
            value={credential.notes ?? ""}
          />
        </Field>
      </form>
    </Modal>
  );
}
