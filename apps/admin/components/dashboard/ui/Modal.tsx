"use client";

import { useEffect, type ReactNode } from "react";
import { Eyebrow } from "@kershell/ui/eyebrow";
import { Icon } from "@/components/dashboard/ui/Icon";
import { IconButton } from "@/components/dashboard/ui/IconButton";

type ModalProps = {
  children: ReactNode;
  eyebrow?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  title: ReactNode;
  width?: number;
};

export function Modal({ children, eyebrow, footer, onClose, open, title, width = 560 }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur"
      onClick={onClose}
      role="dialog"
      style={{ background: "rgba(8,9,11,0.72)" }}
    >
      <div
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[10px] border border-border bg-surface shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
        onClick={(event) => event.stopPropagation()}
        style={{ maxWidth: width }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            {eyebrow ? <Eyebrow variant="accent">{eyebrow}</Eyebrow> : null}
            <div className="mt-2 text-[20px] font-medium text-text">{title}</div>
          </div>
          <IconButton label="Cerrar" onClick={onClose}>
            <Icon name="x" size={16} />
          </IconButton>
        </div>

        <div className="flex-1 overflow-auto p-6">{children}</div>

        {footer ? (
          <div className="flex justify-end gap-[10px] border-t border-border bg-[var(--ink-2)] px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
