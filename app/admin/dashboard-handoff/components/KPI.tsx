// dashboard-handoff/components/KPI.tsx
// Tarjeta de KPI. Spec §3.1.

import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Icon } from '@/components/dashboard/ui/Icon';

type Props = {
  label: string;
  value: ReactNode;
  sub?: string;
  /** Si true, value en color accent. */
  accent?: boolean;
  icon?: string;
  foot?: ReactNode;
  children?: ReactNode;
};

export function KPI({ label, value, sub, accent, icon, foot, children }: Props) {
  return (
    <div
      className="flex flex-col gap-[14px] rounded-[10px] border border-border bg-surface p-5"
      style={{ minHeight: 132 }}
    >
      <div className="flex items-center justify-between">
        <Eyebrow>{label}</Eyebrow>
        {icon && <Icon name={icon} size={14} className="text-muted" />}
      </div>

      <div className="flex items-baseline gap-2">
        <div
          className="font-mono"
          style={{
            fontSize: 34,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: accent ? 'var(--accent)' : 'var(--text)',
            fontWeight: 500,
          }}
        >
          {value}
        </div>
        {sub && <div className="font-mono text-[12px] text-muted">{sub}</div>}
      </div>

      {children}

      {foot && <div className="mt-auto text-[12px] text-text-dim">{foot}</div>}
    </div>
  );
}
