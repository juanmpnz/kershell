"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Icon } from "@/components/dashboard/ui/Icon";

type ToastTone = "ok" | "warn" | "danger" | "info";

type ToastItem = {
  id: string;
  message: ReactNode;
  tone: ToastTone;
};

const TONE_COLOR: Record<ToastTone, string> = {
  ok: "var(--ok)",
  warn: "var(--warn)",
  danger: "var(--danger)",
  info: "var(--info)",
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: ReactNode, tone: ToastTone = "ok") => {
    const id = crypto.randomUUID();

    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2400);
  }, []);

  const Toaster = useCallback(
    () => (
      <div className="pointer-events-none fixed bottom-5 right-5 z-[2000] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            className="flex min-w-[220px] items-center gap-[10px] rounded-md border border-border bg-surface-2 px-[14px] py-[10px] text-[13px] text-text shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]"
            key={toast.id}
            style={{ borderLeft: `2px solid ${TONE_COLOR[toast.tone]}` }}
          >
            <Icon className="shrink-0" name="check" size={14} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    ),
    [toasts],
  );

  return { push, Toaster };
}
