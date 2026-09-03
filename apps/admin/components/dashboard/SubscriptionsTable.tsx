"use client";

import type { SubscriptionOverviewDto } from "@kershell/db/repositories/subscriptions";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/dashboard/ui/Badge";
import { Input } from "@/components/dashboard/ui/Input";
import { Select } from "@/components/dashboard/ui/Select";

const STATUS_LABEL = { ACTIVE: "Activa", CANCELLED: "Cancelada", PAUSED: "Pausada", TRIAL: "Trial" } as const;

function formatMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("es-ES", { currency, style: "currency" }).format(amountMinor / 100);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", timeZone: "UTC", year: "numeric" })
    .format(new Date(`${value}T00:00:00.000Z`)).replaceAll(".", "");
}

export function SubscriptionsTable({ subscriptions }: { subscriptions: SubscriptionOverviewDto[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return subscriptions.filter((subscription) =>
      (status === "ALL" || subscription.status === status) &&
      (!needle || [subscription.name, subscription.plan, subscription.vendorName].join(" ").toLowerCase().includes(needle)),
    );
  }, [query, status, subscriptions]);
  const totals = useMemo(() => {
    const values = new Map<string, number>();
    for (const subscription of filtered) {
      if (subscription.status === "CANCELLED" || subscription.status === "PAUSED") continue;
      values.set(subscription.currency, (values.get(subscription.currency) ?? 0) + subscription.monthlyAmountMinor);
    }
    return [...values].map(([currency, amount]) => formatMoney(amount, currency));
  }, [filtered]);

  return (
    <div className="p-8"><div className="overflow-hidden rounded-[10px] border border-border bg-surface">
      <div className="flex flex-col gap-3 border-b border-border p-5 md:flex-row">
        <Input className="md:max-w-sm" onChange={(event) => setQuery(event.target.value)} placeholder="Buscar servicio, plan o proveedor" value={query} />
        <Select onChange={(event) => setStatus(event.target.value)} value={status}>
          <option value="ALL">Todos los estados</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Select>
      </div>
      <div className="overflow-x-auto"><div className="min-w-[960px]">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr_1fr] bg-[var(--ink-2)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          <span>Servicio</span><span>Estado</span><span>Proveedor</span><span>Próximo cobro</span><span>Proyectos</span><span>Mensual</span>
        </div>
        {filtered.map((subscription) => <Link className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr_1fr] items-center border-t border-border px-5 py-4 text-sm transition hover:bg-surface-2" href={`/dashboard/subscriptions/${subscription.id}/edit`} key={subscription.id}>
          <span className="min-w-0"><strong className="block truncate text-text">{subscription.name}</strong><small className="text-muted">{subscription.plan}</small></span>
          <span><Badge tone={subscription.status === "TRIAL" ? "warn" : "neutral"}>{STATUS_LABEL[subscription.status]}</Badge></span>
          <span className="truncate text-text-dim">{subscription.vendorName}</span>
          <span className="font-mono text-text-dim">{formatDate(subscription.nextChargeOn)}</span>
          <span className="truncate text-text-dim">{subscription.projects.map(({ name }) => name).join(", ") || "—"}</span>
          <span className="font-mono text-text">{formatMoney(subscription.monthlyAmountMinor, subscription.currency)}</span>
        </Link>)}
        {!filtered.length ? <p className="border-t border-border p-12 text-center text-sm text-text-dim">No hay suscripciones para estos filtros.</p> : null}
        <div className="flex justify-between border-t border-border bg-[var(--ink-2)] px-5 py-3 font-mono text-xs text-muted"><span>{filtered.length} suscripciones</span><span>{totals.join(" + ") || "Sin gasto activo"} / mes</span></div>
      </div></div>
    </div></div>
  );
}
