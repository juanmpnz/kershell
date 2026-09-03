"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Eyebrow } from "@kershell/ui/eyebrow";
import { Logo } from "@kershell/ui/logo";
import { Icon, type IconName } from "@/components/dashboard/ui/Icon";

const NAV: Array<{
  id: string;
  href: string;
  icon: IconName;
  label: string;
}> = [
  { id: "overview", label: "Overview", href: "/dashboard", icon: "home" },
  { id: "subs", label: "Suscripciones", href: "/dashboard/subscriptions", icon: "card" },
  { id: "vault", label: "Vault", href: "/dashboard/vault", icon: "vault" },
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: "settings" },
];

type DashSidebarProps = {
  trialsExpiring?: number;
  userInitials?: string;
  userName?: string;
  userRole?: string;
};

export function DashSidebar({
  trialsExpiring = 0,
  userInitials = "JC",
  userName = "Jerónimo",
  userRole = "Owner",
}: DashSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("dash-sidebar-collapsed") === "1");
  }, []);

  useEffect(() => {
    localStorage.setItem("dash-sidebar-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  return (
    <aside
      className="sticky top-0 flex h-svh shrink-0 flex-col border-r border-border bg-[var(--ink-2)] transition-[width] duration-200"
      style={{ width: collapsed ? 64 : 232 }}
    >
      <div
        className="flex h-16 items-center border-b border-border"
        style={{
          justifyContent: collapsed ? "center" : "flex-start",
          paddingInline: collapsed ? 0 : 18,
        }}
      >
        {collapsed ? <Logo href="/dashboard" size={22} variant="mark" /> : <Logo href="/dashboard" size={24} />}
      </div>

      {!collapsed ? (
        <div className="px-[18px] pb-2 pt-[18px]">
          <Eyebrow>Workspace</Eyebrow>
          <div className="mt-2 flex items-center gap-2 rounded-md border border-border bg-surface px-[10px] py-2">
            <span className="inline-flex size-[22px] items-center justify-center bg-accent font-mono text-[11px] font-semibold text-accent-ink">
              K
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[12.5px] font-medium text-text">Kershell</span>
              <span className="font-mono text-[10.5px] text-muted">internal · prod</span>
            </div>
          </div>
        </div>
      ) : null}

      <nav className="flex flex-col gap-0.5" style={{ padding: collapsed ? "12px 8px" : "8px 12px" }}>
        {!collapsed ? (
          <div className="px-1.5 pb-1.5 pt-3.5">
            <Eyebrow>Navegación</Eyebrow>
          </div>
        ) : null}

        {NAV.map((item, index) => {
          const active = isActive(item.href);

          return (
            <Link
              className={`relative flex items-center rounded-md border text-[13px] font-medium transition ${
                active
                  ? "border-border bg-surface-2 text-text"
                  : "border-transparent text-text-dim hover:bg-surface hover:text-text"
              }`}
              href={item.href}
              key={item.id}
              style={{
                gap: collapsed ? 0 : 12,
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "10px 0" : "9px 10px",
              }}
              title={item.label}
            >
              {active && !collapsed ? <span className="absolute bottom-2 left-[-12px] top-2 w-0.5 bg-accent" /> : null}
              <Icon className={active ? "text-accent" : "text-muted"} name={item.icon} size={16} />
              {!collapsed ? <span>{item.label}</span> : null}
              {!collapsed ? <span className="ml-auto font-mono text-[10px] text-[var(--muted-soft)]">0{index + 1}</span> : null}
            </Link>
          );
        })}
      </nav>

      {!collapsed && trialsExpiring > 0 ? (
        <div className="px-[18px] pb-2 pt-5">
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-[14px]">
            <div className="flex items-center gap-2">
              <Icon className="text-warn" name="alert" size={14} />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-warn">
                {trialsExpiring} trials vencen
              </span>
            </div>
            <p className="text-[12px] leading-snug text-text-dim">Revisá los trials que vencen en los próximos 7 días.</p>
            <Link className="inline-flex items-center gap-1 self-start font-mono text-[12px] text-accent" href="/dashboard/subscriptions?status=trial">
              Revisar <Icon name="arrowRight" size={11} />
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-auto border-t border-border" style={{ padding: collapsed ? "14px 8px" : "14px 12px" }}>
        <button
          className="flex w-full items-center gap-2.5 rounded-md border border-border bg-surface px-[10px] py-2"
          onClick={() => setCollapsed((current) => !current)}
          style={{ justifyContent: collapsed ? "center" : "flex-start" }}
          title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          type="button"
        >
          <span className="flex size-[26px] items-center justify-center rounded bg-[var(--surface-3)] font-mono text-[11px] font-semibold text-text">
            {userInitials}
          </span>
          {!collapsed ? (
            <>
              <span className="flex min-w-0 flex-1 flex-col overflow-hidden text-left leading-tight">
                <span className="truncate text-[12px] font-medium text-text">{userName}</span>
                <span className="font-mono text-[10.5px] text-muted">{userRole}</span>
              </span>
              <Icon className="text-muted" name="more" size={14} />
            </>
          ) : null}
        </button>
      </div>
    </aside>
  );
}
