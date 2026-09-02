import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge, type BadgeTone } from "@/components/dashboard/ui/Badge";
import { Icon } from "@/components/dashboard/ui/Icon";
import { KPI } from "@/components/dashboard/ui/KPI";
import { getDashboardData } from "@/lib/dashboard/store";
import type { Project, ProjectStatus, Subscription, SubscriptionCategory } from "@/lib/dashboard/schema";

const CATEGORY_COLORS: Record<SubscriptionCategory, string> = {
  Hosting: "#B4F23F",
  "Dev tools": "#7AD0FF",
  IA: "#C9A8FF",
  Comunicación: "#F5A623",
  Dominios: "#E07AC0",
  Monitoring: "#7AE2A1",
  Diseño: "#7AD0FF",
};

const STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  live: "ok",
  beta: "info",
  paused: "neutral",
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  live: "Producción",
  beta: "Beta",
  paused: "Pausado",
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

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString("es-ES")}`;
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
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

function monthlySubscriptions(subscriptions: Subscription[]) {
  return subscriptions.filter((subscription) => subscription.status !== "paused");
}

function projectSubscriptions(projectId: string, subscriptions: Subscription[]) {
  return subscriptions.filter((subscription) => subscription.project === projectId);
}

function DashboardCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`overflow-hidden rounded-[10px] border border-border bg-surface ${className}`}>{children}</section>;
}

function CardHeader({
  action,
  children,
  meta,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
      <div>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">{children}</p>
        {meta ? <p className="mt-1 text-sm text-text-dim">{meta}</p> : null}
      </div>
      {action}
    </div>
  );
}

export default function DashboardPage() {
  const data = getDashboardData();
  const activeSubscriptions = monthlySubscriptions(data.subs);
  const monthlyTotal = activeSubscriptions.reduce((total, subscription) => total + subscription.cost, 0);
  const annualTotal = monthlyTotal * 12;
  const trialSubscriptions = data.subs.filter((subscription) => subscription.status === "trial");
  const trialsExpiring = trialSubscriptions
    .map((subscription) => ({
      ...subscription,
      daysToTrialEnd: daysBetween(data.today, subscription.trialEnds ?? subscription.nextCharge),
    }))
    .filter((subscription) => subscription.daysToTrialEnd >= 0 && subscription.daysToTrialEnd <= 7);
  const upcomingCharges = [...activeSubscriptions]
    .map((subscription) => ({
      ...subscription,
      daysToCharge: daysBetween(data.today, subscription.nextCharge),
    }))
    .filter((subscription) => subscription.daysToCharge >= 0)
    .sort((a, b) => a.daysToCharge - b.daysToCharge)
    .slice(0, 5);
  const activeProjects = data.projects.filter((project) => project.status !== "paused");
  const betaProjects = data.projects.filter((project) => project.status === "beta").length;
  const liveProjects = data.projects.filter((project) => project.status === "live").length;
  const userFirstName = data.user.name.split(" ")[0] ?? data.user.name;
  const categoryTotals = Object.entries(
    activeSubscriptions.reduce(
      (totals, subscription) => {
        totals[subscription.category] = (totals[subscription.category] ?? 0) + subscription.cost;
        return totals;
      },
      {} as Record<SubscriptionCategory, number>,
    ),
  )
    .map(([category, total]) => ({
      category: category as SubscriptionCategory,
      percent: monthlyTotal ? (total / monthlyTotal) * 100 : 0,
      total,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <>
      <PageHeader
        actions={
          <>
            <button className="rounded-md border border-border px-3 py-2 text-sm text-text-dim transition hover:bg-surface" type="button">
              Exportar
            </button>
            <Link
              className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-ink transition hover:brightness-110"
              href="/dashboard/subscriptions?new=1"
            >
              Nueva suscripción
            </Link>
          </>
        }
        eyebrow={`Overview · ${formatDate(data.today)}`}
        sub={`Hoy hay ${trialsExpiring.length} trials por vencer y ${upcomingCharges.length} cobros agendados en los próximos días.`}
        title={`Buen día, ${userFirstName}.`}
      />

      <div className="grid gap-6 p-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KPI accent foot={`${formatMoney(annualTotal)} proyectado anual`} icon="money" label="Gasto mensual" sub="/ mes" value={formatMoney(monthlyTotal)} />
          <KPI
            foot={`${trialSubscriptions.length} en trial · ${activeSubscriptions.length - trialSubscriptions.length} productivas`}
            icon="card"
            label="Suscripciones activas"
            sub={`/ ${data.subs.length} totales`}
            value={activeSubscriptions.length.toString().padStart(2, "0")}
          />
          <KPI
            foot={trialsExpiring.length ? <span className="text-warn">Acción requerida</span> : "Sin urgencias"}
            icon="alert"
            label="Trials por vencer"
            sub="en 7 días"
            value={trialsExpiring.length.toString().padStart(2, "0")}
          />
          <KPI
            foot={`${betaProjects} en beta · ${liveProjects} en producción`}
            icon="vault"
            label="Proyectos activos"
            sub="vivos"
            value={activeProjects.length.toString().padStart(2, "0")}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <DashboardCard>
            <CardHeader
              action={
                <div className="flex rounded-md border border-border bg-[var(--ink-2)] p-1 font-mono text-[10px] text-muted">
                  {["1M", "3M", "6M", "1A"].map((period, index) => (
                    <span className={`rounded px-2 py-1 ${index === 0 ? "bg-[var(--surface-3)] text-text" : ""}`} key={period}>
                      {period}
                    </span>
                  ))}
                </div>
              }
              meta={formatMoney(monthlyTotal)}
            >
              Gasto por categoría
            </CardHeader>
            <div className="p-5">
              {categoryTotals.length ? (
                <>
                  <div className="flex h-3 overflow-hidden rounded-full bg-[var(--ink-2)]">
                    {categoryTotals.map((item) => (
                      <span
                        aria-label={`${item.category} ${formatPercent(item.percent)}`}
                        key={item.category}
                        style={{
                          background: CATEGORY_COLORS[item.category],
                          width: `${item.percent}%`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-5 grid gap-x-6 gap-y-3 md:grid-cols-2">
                    {categoryTotals.map((item) => (
                      <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 text-sm" key={item.category}>
                        <span className="size-2.5 rounded-sm" style={{ background: CATEGORY_COLORS[item.category] }} />
                        <span className="text-text-dim">{item.category}</span>
                        <span className="font-mono text-muted">{formatPercent(item.percent)}</span>
                        <span className="font-mono text-text">{formatMoney(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-text-dim">Sin gasto registrado.</p>
              )}
            </div>
          </DashboardCard>

          <DashboardCard>
            <CardHeader
              action={<Icon className="text-muted" name="calendar" size={16} />}
              meta={`${upcomingCharges.length} cargos próximos`}
            >
              Próximos cobros
            </CardHeader>
            <div className="divide-y divide-border">
              {upcomingCharges.length ? (
                upcomingCharges.map((subscription) => (
                  <Link
                    className="grid grid-cols-[36px_1fr_auto] items-center gap-3 px-5 py-3 transition hover:bg-surface-2"
                    href={`/dashboard/subscriptions?edit=${subscription.id}`}
                    key={subscription.id}
                  >
                    <span className="flex size-9 items-center justify-center rounded-md border border-border bg-[var(--ink-2)] font-mono text-[11px] text-text">
                      {initials(subscription.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-text">{subscription.name}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span className="font-mono">{formatDate(subscription.nextCharge)}</span>
                        <span className={subscription.daysToCharge <= 3 ? "text-warn" : ""}>{relativeDays(subscription.daysToCharge)}</span>
                        <Badge tone="neutral">{subscription.category}</Badge>
                      </span>
                    </span>
                    <span className="font-mono text-sm text-text">{formatMoney(subscription.cost)}</span>
                  </Link>
                ))
              ) : (
                <p className="px-5 py-10 text-center text-sm text-text-dim">Sin cobros agendados.</p>
              )}
            </div>
          </DashboardCard>
        </section>

        <section className={`grid gap-4 ${trialsExpiring.length ? "xl:grid-cols-[1fr_1.4fr]" : ""}`}>
          {trialsExpiring.length ? (
            <DashboardCard>
              <CardHeader meta={`${trialsExpiring.length} pendientes`}>
                <span className="text-warn">● Atención</span>
              </CardHeader>
              <div className="divide-y divide-border">
                {trialsExpiring.map((subscription) => (
                  <div className="grid gap-3 px-5 py-4" key={subscription.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge tone="warn">trial · {subscription.daysToTrialEnd}d</Badge>
                        <p className="mt-2 text-sm font-medium text-text">{subscription.name}</p>
                        <p className="mt-1 text-sm leading-5 text-text-dim">{subscription.notes}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink" type="button">
                        Confirmar
                      </button>
                      <button className="rounded-md border border-border px-3 py-1.5 text-xs text-text-dim hover:bg-surface-2" type="button">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          ) : null}

          <DashboardCard>
            <CardHeader
              action={
                <Link className="inline-flex items-center gap-1 font-mono text-[12px] text-accent" href="/dashboard/vault">
                  Ir al vault <Icon name="arrowRight" size={12} />
                </Link>
              }
              meta={`${activeProjects.length} activos`}
            >
              Proyectos activos
            </CardHeader>
            <div className="grid gap-3 p-5 lg:grid-cols-3">
              {activeProjects.length ? (
                activeProjects.map((project) => (
                  <ProjectOverviewCard dataToday={data.today} key={project.id} project={project} subscriptions={data.subs} />
                ))
              ) : (
                <Link className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-text-dim" href="/dashboard/vault">
                  Crear primer proyecto
                </Link>
              )}
            </div>
          </DashboardCard>
        </section>
      </div>
    </>
  );
}

function ProjectOverviewCard({
  project,
  subscriptions,
}: {
  dataToday: string;
  project: Project;
  subscriptions: Subscription[];
}) {
  const linkedSubscriptions = projectSubscriptions(project.id, subscriptions);

  return (
    <Link className="flex min-h-[220px] flex-col rounded-lg border border-border bg-[var(--ink-2)] p-4 transition hover:bg-surface-2" href={`/dashboard/vault/${project.id}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="size-3 rounded-sm" style={{ background: project.color }} />
        <Badge dot tone={STATUS_TONE[project.status]}>
          {STATUS_LABEL[project.status]}
        </Badge>
      </div>
      <h3 className="mt-5 text-base font-medium text-text">{project.name}</h3>
      <p className="mt-1 font-mono text-[11px] uppercase text-muted">{project.code}</p>
      <p className="mt-3 line-clamp-2 text-sm leading-5 text-text-dim">{project.summary}</p>
      <div className="mt-auto grid grid-cols-3 gap-3 border-t border-border pt-4">
        <ProjectMetric label="creds" value={project.credentialsCount.toString()} />
        <ProjectMetric label="subs" value={linkedSubscriptions.length.toString()} />
        <ProjectMetric label="mensual" value={formatMoney(project.monthly)} />
      </div>
    </Link>
  );
}

function ProjectMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 font-mono text-sm text-text">{value}</p>
    </div>
  );
}
