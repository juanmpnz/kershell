"use client";

import type { ProjectOverviewDto } from "@kershell/db/repositories/projects";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge, type BadgeTone } from "@/components/dashboard/ui/Badge";
import { Icon } from "@/components/dashboard/ui/Icon";
import { IconButton } from "@/components/dashboard/ui/IconButton";
import { Input } from "@/components/dashboard/ui/Input";

type VaultView = "grid" | "list";

type VaultProjectsProps = {
  projects: ProjectOverviewDto[];
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

function formatMoney(amountMinor: number) {
  return new Intl.NumberFormat("es-ES", {
    currency: "USD",
    style: "currency",
  }).format(amountMinor / 100);
}

export function VaultProjects({ projects }: VaultProjectsProps) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<VaultView>("grid");

  useEffect(() => {
    const stored = localStorage.getItem("dash-vault-view");

    if (stored === "grid" || stored === "list") {
      setView(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dash-vault-view", view);
  }, [view]);

  const filteredProjects = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return projects;
    }

    return projects.filter((project) =>
      [project.name, project.code, project.summary, project.technologies.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [projects, query]);

  return (
    <div className="grid gap-5 p-8">
      <div className="flex flex-col justify-between gap-4 rounded-[10px] border border-border bg-surface px-5 py-4 md:flex-row md:items-center">
        <div className="relative w-full md:w-[360px]">
          <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" name="search" size={14} />
          <Input className="pl-9" onChange={(event) => setQuery(event.target.value)} placeholder="Buscar proyecto" value={query} />
        </div>
        <div className="flex items-center gap-3">
          <p className="font-mono text-[12px] text-muted">
            {filteredProjects.length} de {projects.length}
          </p>
          <div className="flex rounded-md border border-border bg-[var(--ink-2)] p-1">
            <IconButton
              className={view === "grid" ? "bg-surface-2 text-accent" : ""}
              label="Vista grid"
              onClick={() => setView("grid")}
              size="sm"
              variant="ghost"
            >
              <Icon name="grid" size={13} />
            </IconButton>
            <IconButton
              className={view === "list" ? "bg-surface-2 text-accent" : ""}
              label="Vista lista"
              onClick={() => setView("list")}
              size="sm"
              variant="ghost"
            >
              <Icon name="list" size={13} />
            </IconButton>
          </div>
        </div>
      </div>

      {filteredProjects.length ? (
        view === "grid" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <ProjectList projects={filteredProjects} />
        )
      ) : (
        <div className="grid place-items-center rounded-[10px] border border-border bg-surface px-6 py-16 text-center">
          <Icon className="mb-3 text-muted" name="box" size={28} />
          <p className="text-sm font-medium text-text">Sin proyectos todavía</p>
          <p className="mt-1 max-w-[360px] text-sm text-text-dim">Creá tu primer proyecto para empezar a guardar credenciales.</p>
          <Link className="mt-5 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-ink" href="/dashboard/vault/new">
            Nuevo proyecto
          </Link>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectOverviewDto }) {
  return (
    <Link
      className="flex h-[340px] flex-col rounded-[10px] border border-border bg-surface p-5 transition hover:bg-surface-2"
      href={`/dashboard/vault/${project.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className="flex size-10 items-center justify-center rounded-md font-mono text-sm font-semibold text-ink"
          style={{ background: project.color }}
        >
          {project.code.slice(0, 2)}
        </span>
        <Badge dot tone={STATUS_TONE[project.status]}>
          {STATUS_LABEL[project.status]}
        </Badge>
      </div>

      <h2 className="mt-7 truncate text-lg font-medium text-text">{project.name}</h2>
      <p className="mt-1 font-mono text-[11px] uppercase text-muted">{project.code}</p>
      <p className="mt-4 line-clamp-2 text-[13px] leading-5 text-text-dim">{project.summary}</p>

      <div className="mt-5 flex max-h-[58px] flex-wrap gap-2 overflow-hidden">
        {project.technologies.map((item) => (
          <span className="rounded border border-border bg-[var(--ink-2)] px-[7px] py-[3px] font-mono text-[10.5px] text-text-dim" key={item}>
            {item}
          </span>
        ))}
      </div>

      <div className="mt-auto grid grid-cols-3 gap-3 border-t border-border pt-4">
        <ProjectMetric label="creds" value={project.credentialReferenceCount.toString()} />
        <ProjectMetric label="subs" value={project.subscriptionCount.toString()} />
        <ProjectMetric label="mensual" value={formatMoney(project.monthlyAmountMinor)} />
      </div>
    </Link>
  );
}

function ProjectList({ projects }: { projects: ProjectOverviewDto[] }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
      <div className="grid min-w-[760px] grid-cols-[2fr_1fr_1fr_1fr_80px] bg-[var(--ink-2)] px-[18px] py-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
        <span>Proyecto</span>
        <span>Estado</span>
        <span>Credenciales</span>
        <span>Gasto</span>
        <span />
      </div>
      <div className="overflow-x-auto">
        {projects.map((project) => (
          <Link
            className="grid min-w-[760px] grid-cols-[2fr_1fr_1fr_1fr_80px] items-center border-t border-border px-[18px] py-4 transition hover:bg-surface-2"
            href={`/dashboard/vault/${project.id}`}
            key={project.id}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="size-2.5 rounded-sm" style={{ background: project.color }} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-text">{project.name}</span>
                <span className="mt-1 block font-mono text-[11px] text-muted">{project.code}</span>
              </span>
            </span>
            <span>
              <Badge dot tone={STATUS_TONE[project.status]}>
                {STATUS_LABEL[project.status]}
              </Badge>
            </span>
            <span className="font-mono text-sm text-text-dim">{project.credentialReferenceCount}</span>
            <span className="font-mono text-sm text-text">{formatMoney(project.monthlyAmountMinor)}</span>
            <span className="justify-self-end text-accent">
              <Icon name="arrowRight" size={16} />
            </span>
          </Link>
        ))}
      </div>
    </div>
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
