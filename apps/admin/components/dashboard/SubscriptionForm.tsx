"use client";

import type { ProjectOverviewDto } from "@kershell/db/repositories/projects";
import type { SubscriptionOverviewDto, VendorOptionDto } from "@kershell/db/repositories/subscriptions";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createSubscriptionAction } from "@/app/(dashboard)/dashboard/subscriptions/actions";
import { Field } from "@/components/dashboard/ui/Field";
import { Input } from "@/components/dashboard/ui/Input";
import { Select } from "@/components/dashboard/ui/Select";
import { initialSubscriptionActionState, type SubscriptionActionState } from "@/lib/subscriptions/subscription-form";

type Action = (state: SubscriptionActionState, formData: FormData) => Promise<SubscriptionActionState>;

function Submit({ edit }: { edit: boolean }) {
  const { pending } = useFormStatus();
  return <button className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-60" disabled={pending} type="submit">{pending ? "Guardando…" : edit ? "Guardar cambios" : "Crear suscripción"}</button>;
}

export function SubscriptionForm({ action = createSubscriptionAction, projects, subscription, vendors }: { action?: Action; projects: ProjectOverviewDto[]; subscription?: SubscriptionOverviewDto; vendors: VendorOptionDto[] }) {
  const [state, formAction] = useActionState(action, initialSubscriptionActionState);
  const selectedProjects = new Set(subscription?.projects.map(({ id }) => id));

  return <form action={formAction} className="grid gap-6 p-8">
    {state.message ? <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger" role="alert">{state.message}</p> : null}
    <div className="grid gap-5 rounded-[10px] border border-border bg-surface p-5 md:grid-cols-2">
      <Field label="Servicio"><Input defaultValue={subscription?.name} maxLength={120} name="name" required /></Field>
      <Field label="Plan"><Input defaultValue={subscription?.plan} maxLength={160} name="plan" required /></Field>
      <Field label="Proveedor"><Select defaultValue={subscription?.vendorId} name="vendorId" required><option value="">Seleccionar…</option>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</Select></Field>
      <Field label="Categoría"><Select defaultValue={subscription?.category ?? "DEVELOPER_TOOLS"} name="category"><option value="HOSTING">Hosting</option><option value="DEVELOPER_TOOLS">Dev tools</option><option value="AI">IA</option><option value="COMMUNICATIONS">Comunicación</option><option value="DOMAINS">Dominios</option><option value="MONITORING">Monitoring</option><option value="DESIGN">Diseño</option><option value="OTHER">Otra</option></Select></Field>
      <Field label="Estado"><Select defaultValue={subscription?.status ?? "ACTIVE"} name="status"><option value="ACTIVE">Activa</option><option value="TRIAL">Trial</option><option value="PAUSED">Pausada</option><option value="CANCELLED">Cancelada</option></Select></Field>
      <Field label="Intervalo"><Select defaultValue={subscription?.billingInterval ?? "MONTHLY"} name="billingInterval"><option value="MONTHLY">Mensual</option><option value="YEARLY">Anual</option><option value="USAGE">Por uso</option></Select></Field>
      <Field label="Importe"><Input defaultValue={subscription ? (subscription.amountMinor / 100).toFixed(2) : "0.00"} inputMode="decimal" name="amount" pattern="[0-9]+([.,][0-9]{1,2})?" required /></Field>
      <Field label="Moneda"><Input defaultValue={subscription?.currency ?? "EUR"} maxLength={3} minLength={3} name="currency" required /></Field>
      <Field label="Próximo cobro"><Input defaultValue={subscription?.nextChargeOn ?? ""} name="nextChargeOn" type="date" /></Field>
      <Field label="Fin de trial"><Input defaultValue={subscription?.trialEndsOn ?? ""} name="trialEndsOn" type="date" /></Field>
      <Field label="Email de cuenta"><Input defaultValue={subscription?.accountEmail ?? ""} name="accountEmail" type="email" /></Field>
      <Field label="Método enmascarado"><Input defaultValue={subscription?.paymentMethodLabel ?? ""} name="paymentMethodLabel" placeholder="Visa •• 4421" /></Field>
      <Field label="URL"><Input defaultValue={subscription?.websiteUrl ?? ""} name="websiteUrl" type="url" /></Field>
      <div className="md:col-span-2"><Field label="Proyectos"><div className="grid gap-2 rounded-md border border-border bg-[var(--ink-2)] p-3 md:grid-cols-2">{projects.map((project) => <label className="flex items-center gap-2 text-sm text-text-dim" key={project.id}><input defaultChecked={selectedProjects.has(project.id)} name="projectIds" type="checkbox" value={project.id} />{project.name}</label>)}</div></Field></div>
      <div className="md:col-span-2"><Field label="Notas"><textarea className="min-h-24 w-full rounded-md border border-border bg-[var(--ink-2)] p-3 text-sm text-text" defaultValue={subscription?.notes ?? ""} maxLength={5000} name="notes" /></Field></div>
    </div>
    <div className="flex justify-end gap-3"><Link className="rounded-md border border-border px-4 py-2 text-sm text-text-dim" href="/dashboard/subscriptions">Cancelar</Link><Submit edit={Boolean(subscription)} /></div>
  </form>;
}
