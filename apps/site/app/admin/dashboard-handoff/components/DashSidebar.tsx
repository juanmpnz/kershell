// dashboard-handoff/components/DashSidebar.tsx
// Sidebar del dashboard. Reusa <Logo /> y <KMonogram /> del handoff/ original.
// Spec: SPEC.md §2.1
//
// Adaptá los imports a las rutas de tu repo.

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { KMonogram } from '@/components/brand/KMonogram';
import { Icon } from '@/components/dashboard/ui/Icon'; // implementar como en dashboard-ui.jsx
import { Eyebrow } from '@/components/ui/Eyebrow';

const NAV = [
  { id: 'overview', label: 'Overview',      href: '/dashboard',               icon: 'home'     },
  { id: 'subs',     label: 'Suscripciones', href: '/dashboard/subscriptions', icon: 'card'     },
  { id: 'vault',    label: 'Vault',         href: '/dashboard/vault',         icon: 'vault'    },
  { id: 'settings', label: 'Settings',      href: '/dashboard/settings',      icon: 'settings' },
] as const;

type Props = {
  /** N trials por vencer en los próximos 7 días. Se calcula afuera. */
  trialsExpiring?: number;
  /** Email del usuario actual. */
  userName?: string;
  userInitials?: string;
  userRole?: string;
};

export function DashSidebar({
  trialsExpiring = 0,
  userName = 'Usuario',
  userInitials = 'U',
  userRole = 'Member',
}: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Persistir en localStorage
  useEffect(() => {
    const stored = localStorage.getItem('dash-sidebar-collapsed');
    if (stored === '1') setCollapsed(true);
  }, []);
  useEffect(() => {
    localStorage.setItem('dash-sidebar-collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);

  return (
    <aside
      data-collapsed={collapsed}
      className="flex flex-col flex-shrink-0 border-r border-border bg-[var(--ink-2)] transition-[width] duration-200"
      style={{ width: collapsed ? 64 : 232 }}
    >
      {/* Brand */}
      <div
        className="flex items-center border-b border-border"
        style={{ height: 64, padding: collapsed ? 0 : '0 18px', justifyContent: collapsed ? 'center' : 'flex-start' }}
      >
        {collapsed ? <KMonogram size={22} /> : <Logo size={20} />}
      </div>

      {/* Workspace */}
      {!collapsed && (
        <div className="px-[18px] pb-2 pt-[18px]">
          <Eyebrow>Workspace</Eyebrow>
          <div className="mt-2 flex items-center gap-2 rounded-[6px] border border-border bg-surface px-[10px] py-2">
            <span className="inline-flex h-[22px] w-[22px] items-center justify-center bg-accent text-[var(--accent-ink)] font-mono text-[11px] font-semibold">
              K
            </span>
            <div className="flex flex-col leading-[1.15]">
              <span className="text-[12.5px] font-medium text-text">Kershell</span>
              <span className="font-mono text-[10.5px] text-muted">internal · prod</span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex flex-col gap-[2px]" style={{ padding: collapsed ? '12px 8px' : '8px 12px' }}>
        {!collapsed && (
          <div className="px-[6px] pt-[14px] pb-[6px]">
            <Eyebrow>Navegación</Eyebrow>
          </div>
        )}
        {NAV.map((item, i) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.label}
              className={`relative flex items-center rounded-[6px] border text-[13px] font-medium ${
                active ? 'border-border bg-surface-2 text-text' : 'border-transparent text-text-dim'
              }`}
              style={{
                gap: collapsed ? 0 : 12,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '10px 0' : '9px 10px',
              }}
            >
              {active && !collapsed && (
                <span className="absolute left-[-12px] top-2 bottom-2 w-[2px] bg-accent" />
              )}
              <Icon name={item.icon} size={16} className={active ? 'text-accent' : 'text-muted'} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && (
                <span className="ml-auto font-mono text-[10px] text-[var(--muted-soft)]">
                  0{i + 1}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Trial banner */}
      {!collapsed && trialsExpiring > 0 && (
        <div className="px-[18px] pb-2 pt-5">
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-[14px]">
            <div className="flex items-center gap-2">
              <Icon name="alert" size={14} className="text-warn" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-warn">
                {trialsExpiring} trial{trialsExpiring === 1 ? '' : 's'} vencen
              </span>
            </div>
            <div className="text-[12px] leading-[1.45] text-text-dim">
              Revisá los trials que vencen en los próximos 7 días.
            </div>
            <Link
              href="/dashboard/subscriptions?status=trial"
              className="inline-flex items-center gap-1 self-start font-mono text-[12px] text-accent"
            >
              Revisar <Icon name="arrowRight" size={11} />
            </Link>
          </div>
        </div>
      )}

      {/* User */}
      <div className="mt-auto border-t border-border" style={{ padding: collapsed ? '14px 8px' : '14px 12px' }}>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex w-full items-center gap-[10px] rounded-[6px] border border-border bg-surface px-[10px] py-2"
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-[4px] bg-[var(--surface-3)] font-mono text-[11px] font-semibold text-text">
            {userInitials}
          </div>
          {!collapsed && (
            <>
              <div className="flex flex-1 flex-col overflow-hidden leading-[1.15]">
                <span className="truncate text-[12px] font-medium text-text">{userName}</span>
                <span className="font-mono text-[10.5px] text-muted">{userRole}</span>
              </div>
              <Icon name="more" size={14} className="text-muted" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
