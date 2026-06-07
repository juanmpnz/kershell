"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/dashboard/ui/Badge";
import { Field } from "@/components/dashboard/ui/Field";
import { Icon } from "@/components/dashboard/ui/Icon";
import { IconButton } from "@/components/dashboard/ui/IconButton";
import { Input } from "@/components/dashboard/ui/Input";
import { Modal } from "@/components/dashboard/ui/Modal";
import { Select } from "@/components/dashboard/ui/Select";
import { useToast } from "@/components/dashboard/ui/Toast";
import { deleteSubscription, upsertSubscription } from "@/lib/dashboard/store";
import type { Project, Subscription, SubscriptionCategory, SubscriptionStatus } from "@/lib/dashboard/schema";

const CATEGORIES: SubscriptionCategory[] = ["Hosting", "Dev tools", "IA", "Comunicación", "Dominios", "Monitoring", "Diseño"];
const STATUSES: SubscriptionStatus[] = ["active", "trial", "paused"];

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: "Activa",
  trial: "En trial",
  paused: "Pausada",
};

type DraftSubscription = Subscription;

type SubscriptionsTableProps = {
  projects: Project[];
  subscriptions: Subscription[];
  today: string;
};

function asDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function daysBetween(fromIso: string, toIso: string) {
  const from = asDate(fromIso);
  const to = asDate(toIso);

  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);

  return Math.ceil((to.getTime() - from.getTime()) / 86_400_000);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(asDate(iso))
    .replaceAll(".", "");
}

function formatMoney(value: number) {
  return `$${Number(value).toLocaleString("es-ES", { maximumFractionDigits: 2 })}`;
}

function relativeDays(days: number) {
  if (days < 0) {
    return "vencido";
  }

  if (days === 0) {
    return "hoy";
  }

  if (days === 1) {
    return "mañana";
  }

  return `en ${days}d`;
}

function initials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function createEmptySubscription(projects: Project[]): DraftSubscription {
  return {
    id: `s-${crypto.randomUUID().slice(0, 8)}`,
    name: "",
    plan: "",
    category: "Dev tools",
    cost: 0,
    period: "mensual",
    nextCharge: new Date().toISOString().slice(0, 10),
    cycle: "Mensual",
    status: "active",
    project: projects[0]?.id ?? null,
    payment: "",
    owner: "team@kershell.dev",
    url: "",
    notes: "",
  };
}

export function SubscriptionsTable({ projects, subscriptions, today }: SubscriptionsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push, Toaster } = useToast();
  const [items, setItems] = useState(subscriptions);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<SubscriptionCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "all">("all");
  const [draft, setDraft] = useState<DraftSubscription | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Subscription | null>(null);

  useEffect(() => {
    const status = searchParams.get("status");

    if (status === "trial" || status === "active" || status === "paused") {
      setStatusFilter(status);
    }

    const editId = searchParams.get("edit");
    const shouldCreate = searchParams.get("new") === "1";

    if (editId) {
      const subscription = items.find((item) => item.id === editId);

      if (subscription) {
        setDraft({ ...subscription });
      }
    } else if (shouldCreate) {
      setDraft(createEmptySubscription(projects));
    }
  }, [items, projects, searchParams]);

  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return items.filter((subscription) => {
      const matchesQuery =
        !needle || [subscription.name, subscription.plan, subscription.category].join(" ").toLowerCase().includes(needle);
      const matchesCategory = categoryFilter === "all" || subscription.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || subscription.status === statusFilter;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, items, query, statusFilter]);
  const monthlyTotal = filtered
    .filter((subscription) => subscription.status !== "paused")
    .reduce((total, subscription) => total + subscription.cost, 0);

  function openEdit(subscription: Subscription) {
    setDraft({ ...subscription });
    router.replace(`/dashboard/subscriptions?edit=${subscription.id}`, { scroll: false });
  }

  function openNew() {
    setDraft(createEmptySubscription(projects));
    router.replace("/dashboard/subscriptions?new=1", { scroll: false });
  }

  function closeModal() {
    setDraft(null);
    router.replace("/dashboard/subscriptions", { scroll: false });
  }

  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft) {
      return;
    }

    const next = {
      ...draft,
      cost: Number(draft.cost),
      trialEnds: draft.status === "trial" ? draft.trialEnds || draft.nextCharge : undefined,
    };

    upsertSubscription(next);
    setItems((current) => {
      const exists = current.some((subscription) => subscription.id === next.id);
      return exists
        ? current.map((subscription) => (subscription.id === next.id ? next : subscription))
        : [next, ...current];
    });
    push("Suscripción guardada", "ok");
    closeModal();
  }

  function removeSubscription(subscription: Subscription) {
    deleteSubscription(subscription.id);
    setItems((current) => current.filter((item) => item.id !== subscription.id));
    setConfirmDelete(null);
    setDraft(null);
    router.replace("/dashboard/subscriptions", { scroll: false });
    push("Suscripción eliminada", "danger");
  }

  function clearFilters() {
    setQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
    router.replace("/dashboard/subscriptions", { scroll: false });
  }

  return (
    <div className="p-8">
      <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
        <div className="flex flex-col justify-between gap-4 border-b border-border px-8 py-5 xl:flex-row xl:items-center">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative w-full md:w-80">
              <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" name="search" size={14} />
              <Input className="pl-9" onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o plan" value={query} />
            </div>
            <Select
              className="w-full md:w-[180px]"
              onChange={(event) => setCategoryFilter(event.target.value as SubscriptionCategory | "all")}
              value={categoryFilter}
            >
              <option value="all">Todas las categorías</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            <Select
              className="w-full md:w-[160px]"
              onChange={(event) => setStatusFilter(event.target.value as SubscriptionStatus | "all")}
              value={statusFilter}
            >
              <option value="all">Todos los estados</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-mono text-[12px] text-muted">
              {filtered.length} de {items.length} · {formatMoney(monthlyTotal)}/mes
            </p>
            <button className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-ink" onClick={openNew} type="button">
              Nueva
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1040px]">
            <div className="grid grid-cols-[1.6fr_1.1fr_1fr_1.1fr_0.9fr_0.9fr_80px] bg-[var(--ink-2)] px-[18px] py-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
              <span>Servicio</span>
              <span>Plan</span>
              <span>Categoría</span>
              <span>Próx. cobro</span>
              <span>Proyecto</span>
              <span>Costo</span>
              <span />
            </div>

            {filtered.length ? (
              filtered.map((subscription) => {
                const project = subscription.project ? projectsById.get(subscription.project) : null;
                const days = daysBetween(today, subscription.nextCharge);
                const trialDays = subscription.trialEnds ? daysBetween(today, subscription.trialEnds) : null;

                return (
                  <div
                    className="grid min-h-14 grid-cols-[1.6fr_1.1fr_1fr_1.1fr_0.9fr_0.9fr_80px] items-center border-t border-border px-[18px] py-2 text-left transition hover:bg-surface-2"
                    key={subscription.id}
                  >
                    <button className="grid min-w-0 grid-cols-[28px_1fr] items-center gap-3 text-left" onClick={() => openEdit(subscription)} type="button">
                      <span className="flex size-7 items-center justify-center rounded border border-border bg-[var(--ink-2)] font-mono text-[10px] text-text">
                        {initials(subscription.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-text">{subscription.name}</span>
                        {subscription.status === "trial" && trialDays !== null ? (
                          <span className="mt-1 block">
                            <Badge tone="warn">trial · {trialDays}d</Badge>
                          </span>
                        ) : null}
                      </span>
                    </button>
                    <button className="truncate text-left font-mono text-[12.5px] text-text-dim" onClick={() => openEdit(subscription)} type="button">
                      {subscription.plan}
                    </button>
                    <button className="text-left" onClick={() => openEdit(subscription)} type="button">
                      <Badge tone="neutral">{subscription.category}</Badge>
                    </button>
                    <button className="text-left" onClick={() => openEdit(subscription)} type="button">
                      <span className="block font-mono text-[12.5px] text-text-dim">{formatDate(subscription.nextCharge)}</span>
                      <span className={`mt-1 block text-xs ${days <= 3 ? "text-warn" : "text-muted"}`}>{relativeDays(days)}</span>
                    </button>
                    <button className="min-w-0 text-left" onClick={() => openEdit(subscription)} type="button">
                      {project ? (
                        <span className="flex items-center gap-2 text-sm text-text-dim">
                          <span className="size-1.5 rounded-full" style={{ background: project.color }} />
                          <span className="truncate">{project.name}</span>
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </button>
                    <button className="text-left font-mono text-[13px] text-text" onClick={() => openEdit(subscription)} type="button">
                      {formatMoney(subscription.cost)} <span className="text-muted">/mo</span>
                    </button>
                    <div className="flex gap-1">
                      <IconButton label="Editar" onClick={() => openEdit(subscription)} size="sm">
                        <Icon name="edit" size={13} />
                      </IconButton>
                      <IconButton label="Más" size="sm">
                        <Icon name="more" size={13} />
                      </IconButton>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="grid place-items-center px-5 py-14 text-center">
                <Icon className="mb-3 text-muted" name="card" size={26} />
                <p className="text-sm font-medium text-text">Sin resultados</p>
                <p className="mt-1 text-sm text-text-dim">Probá ajustar los filtros o crear una nueva.</p>
                <button className="mt-4 rounded-md border border-border px-3 py-2 text-sm text-text-dim hover:bg-surface-2" onClick={clearFilters} type="button">
                  Limpiar filtros
                </button>
              </div>
            )}

            <div className="flex justify-between border-t border-border bg-[var(--ink-2)] px-[18px] py-3 font-mono text-[12px] text-muted">
              <span>{filtered.length} suscripciones</span>
              <span className="text-text">{formatMoney(monthlyTotal)}/mo</span>
            </div>
          </div>
        </div>
      </div>

      {draft ? (
        <SubscriptionEditModal
          canDelete={items.some((subscription) => subscription.id === draft.id)}
          draft={draft}
          onChange={setDraft}
          onClose={closeModal}
          onConfirmDelete={() => setConfirmDelete(draft)}
          onSubmit={saveDraft}
          projects={projects}
          today={today}
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
              onClick={() => confirmDelete && removeSubscription(confirmDelete)}
              type="button"
            >
              Eliminar
            </button>
          </>
        }
        onClose={() => setConfirmDelete(null)}
        open={Boolean(confirmDelete)}
        title={confirmDelete ? `¿Eliminar ${confirmDelete.name}?` : "Eliminar suscripción"}
        width={420}
      >
        <p className="text-sm leading-6 text-text-dim">
          Esta acción no se puede deshacer. Se removerá del overview y de los proyectos asociados.
        </p>
      </Modal>

      <Toaster />
    </div>
  );
}

function SubscriptionEditModal({
  canDelete,
  draft,
  onChange,
  onClose,
  onConfirmDelete,
  onSubmit,
  projects,
  today,
}: {
  canDelete: boolean;
  draft: DraftSubscription;
  onChange: (draft: DraftSubscription) => void;
  onClose: () => void;
  onConfirmDelete: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  projects: Project[];
  today: string;
}) {
  const trialDays = draft.trialEnds ? daysBetween(today, draft.trialEnds) : daysBetween(today, draft.nextCharge);

  return (
    <Modal
      eyebrow={draft.id ? `id · ${draft.id}` : "Nueva suscripción"}
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
          <button className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-ink hover:brightness-110" form="subscription-edit-form" type="submit">
            Guardar
          </button>
        </>
      }
      onClose={onClose}
      open
      title={draft.name || "Nueva suscripción"}
      width={620}
    >
      <form className="grid gap-5" id="subscription-edit-form" onSubmit={onSubmit}>
        {draft.status === "trial" ? (
          <div className="flex gap-3 rounded-md border border-warn/30 bg-warn/10 p-3 text-sm text-warn">
            <Icon className="mt-0.5 shrink-0" name="alert" size={15} />
            <p>
              Trial vence el {formatDate(draft.trialEnds ?? draft.nextCharge)} ({trialDays} días). Después se cobrarán {formatMoney(draft.cost)} /mes.
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Servicio">
            <Input required value={draft.name} onChange={(event) => onChange({ ...draft, name: event.target.value })} />
          </Field>
          <Field label="Plan">
            <Input required value={draft.plan} onChange={(event) => onChange({ ...draft, plan: event.target.value })} />
          </Field>
          <Field label="Categoría">
            <Select value={draft.category} onChange={(event) => onChange({ ...draft, category: event.target.value as SubscriptionCategory })}>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Estado">
            <Select value={draft.status} onChange={(event) => onChange({ ...draft, status: event.target.value as SubscriptionStatus })}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Costo mensual">
            <Input className="font-mono" min="0" step="0.01" type="number" value={String(draft.cost)} onChange={(event) => onChange({ ...draft, cost: Number(event.target.value) })} />
          </Field>
          <Field label="Próximo cobro">
            <Input className="font-mono" type="date" value={draft.nextCharge} onChange={(event) => onChange({ ...draft, nextCharge: event.target.value })} />
          </Field>
          <Field label="Ciclo">
            <Input value={draft.cycle} onChange={(event) => onChange({ ...draft, cycle: event.target.value })} />
          </Field>
          <Field label="Método de pago">
            <Input value={draft.payment} onChange={(event) => onChange({ ...draft, payment: event.target.value })} />
          </Field>
          <Field label="Proyecto asociado">
            <Select value={draft.project ?? ""} onChange={(event) => onChange({ ...draft, project: event.target.value || null })}>
              <option value="">— Ninguno —</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Trial ends">
            <Input type="date" value={draft.trialEnds ?? ""} onChange={(event) => onChange({ ...draft, trialEnds: event.target.value || undefined })} />
          </Field>
        </div>

        <Field label="Notas">
          <textarea
            className="min-h-24 w-full rounded-md border border-border bg-[var(--ink-2)] px-3 py-2 text-[13px] text-text outline-none transition placeholder:text-muted focus:border-accent"
            value={draft.notes}
            onChange={(event) => onChange({ ...draft, notes: event.target.value })}
          />
        </Field>

        <div className="flex flex-col justify-between gap-2 border-t border-border pt-4 font-mono text-[11px] text-muted md:flex-row">
          <span>creada · seed</span>
          <span>última edición · hoy · {draft.owner}</span>
        </div>
      </form>
    </Modal>
  );
}
