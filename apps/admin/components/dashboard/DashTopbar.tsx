"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@/components/dashboard/ui/Icon";
import { IconButton } from "@/components/dashboard/ui/IconButton";
import { authClient } from "@/lib/auth/client";

const LABELS: Record<string, string> = {
  dashboard: "Overview",
  subscriptions: "Suscripciones",
  vault: "Vault",
  settings: "Settings",
};

function getCrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const dashboardSegments = segments[0] === "dashboard" ? segments : ["dashboard", ...segments];

  return ["Kershell", ...dashboardSegments.map((segment) => LABELS[segment] ?? segment)];
}

export function DashTopbar() {
  const pathname = usePathname();
  const crumbs = getCrumbs(pathname);

  async function logout() {
    const result = await authClient.signOut();

    if (!result.error) {
      window.location.assign("/login");
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-5 border-b border-border bg-ink px-7">
      <nav className="min-w-0 flex-1 overflow-hidden" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 overflow-hidden font-mono text-[12px] text-muted">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;

            return (
              <li className="flex min-w-0 items-center gap-2" key={`${crumb}-${index}`}>
                {index > 0 ? <Icon className="shrink-0 text-[var(--muted-soft)]" name="arrowRight" size={12} /> : null}
                <span className={`truncate ${isLast ? "text-text" : ""}`}>{crumb}</span>
              </li>
            );
          })}
        </ol>
      </nav>

      <button
        className="hidden h-[34px] min-w-[280px] items-center gap-2 rounded-md border border-border bg-surface px-3 text-left text-[12.5px] text-muted transition hover:bg-surface-2 lg:flex"
        type="button"
      >
        <Icon name="search" size={14} />
        <span className="min-w-0 flex-1 truncate">Buscar suscripciones, credenciales...</span>
        <span className="rounded bg-[var(--surface-3)] px-1.5 py-0.5 font-mono text-[10px] text-text-dim">⌘ K</span>
      </button>

      <IconButton label="Notificaciones">
        <Icon name="bell" size={15} />
      </IconButton>
      <IconButton label="Cerrar sesión" onClick={logout} variant="ghost">
        <Icon name="logout" size={15} />
      </IconButton>
    </header>
  );
}
