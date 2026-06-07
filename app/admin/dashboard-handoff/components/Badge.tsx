// dashboard-handoff/components/Badge.tsx
// Chip de estado/categoría. Spec §3.2.

import type { ReactNode } from 'react';

type Tone = 'neutral' | 'accent' | 'warn' | 'danger' | 'ok' | 'info';

const TONES: Record<Tone, { bg: string; fg: string; dot: string; border: string }> = {
  neutral: { bg: 'var(--surface-3)',           fg: 'var(--text-dim)', dot: 'var(--muted)',  border: 'var(--border)' },
  accent:  { bg: 'rgba(180,242,63,0.12)',      fg: 'var(--accent)',   dot: 'var(--accent)', border: 'transparent'   },
  warn:    { bg: 'rgba(245,166,35,0.14)',      fg: '#F5A623',         dot: '#F5A623',       border: 'transparent'   },
  danger:  { bg: 'rgba(242,107,92,0.14)',      fg: '#F26B5C',         dot: '#F26B5C',       border: 'transparent'   },
  ok:      { bg: 'rgba(122,226,161,0.12)',     fg: '#7AE2A1',         dot: '#7AE2A1',       border: 'transparent'   },
  info:    { bg: 'rgba(122,208,255,0.12)',     fg: '#7AD0FF',         dot: '#7AD0FF',       border: 'transparent'   },
};

type Props = {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
};

export function Badge({ tone = 'neutral', dot, children, className }: Props) {
  const c = TONES[tone];
  return (
    <span
      className={`inline-flex items-center gap-[6px] rounded-[4px] border px-2 py-[3px] font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] ${className ?? ''}`}
      style={{ background: c.bg, color: c.fg, borderColor: c.border }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: 99, background: c.dot }} />}
      {children}
    </span>
  );
}
