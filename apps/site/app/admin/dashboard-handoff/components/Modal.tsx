// dashboard-handoff/components/Modal.tsx
// Modal genérico. Spec §3.3.

'use client';

import { useEffect, type ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { IconButton } from '@/components/dashboard/ui/IconButton';

type Props = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  eyebrow?: ReactNode;
  width?: number;
  footer?: ReactNode;
  children: ReactNode;
};

export function Modal({ open, onClose, title, eyebrow, width = 560, footer, children }: Props) {
  // Esc para cerrar
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-[4px]"
      style={{ background: 'rgba(8,9,11,0.72)' }}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full flex-col overflow-auto rounded-[10px] border border-border bg-surface shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
        style={{ maxWidth: width }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            {eyebrow && <Eyebrow accent>{eyebrow}</Eyebrow>}
            <div
              className="text-[20px] font-medium text-text"
              style={{ marginTop: eyebrow ? 8 : 0, letterSpacing: '-0.01em' }}
            >
              {title}
            </div>
          </div>
          <IconButton icon="x" onClick={onClose} title="Cerrar" />
        </div>

        {/* Body */}
        <div className="flex-1 p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-[10px] border-t border-border bg-[var(--ink-2)] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
