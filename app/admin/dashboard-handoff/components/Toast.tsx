// dashboard-handoff/components/Toast.tsx
// Hook + Toaster para feedback de acciones. Spec §3.4.

'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { Icon } from '@/components/dashboard/ui/Icon';

type Tone = 'ok' | 'warn' | 'danger' | 'info';

const TONE_COLOR: Record<Tone, string> = {
  ok:     '#7AE2A1',
  warn:   '#F5A623',
  danger: '#F26B5C',
  info:   '#7AD0FF',
};

type ToastItem = { id: string; msg: ReactNode; tone: Tone };

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((msg: ReactNode, tone: Tone = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  }, []);

  const Toaster = () => (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[2000] flex flex-col gap-2">
      {toasts.map((x) => (
        <div
          key={x.id}
          className="flex min-w-[220px] items-center gap-[10px] rounded-[6px] border border-border bg-surface-2 px-[14px] py-[10px] text-[13px] text-text shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]"
          style={{ borderLeft: `2px solid ${TONE_COLOR[x.tone]}` }}
        >
          <Icon name="check" size={14} style={{ color: TONE_COLOR[x.tone] }} />
          {x.msg}
        </div>
      ))}
    </div>
  );

  return { push, Toaster };
}
