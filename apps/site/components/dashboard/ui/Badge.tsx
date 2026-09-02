import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "accent" | "warn" | "danger" | "ok" | "info";

const TONES: Record<BadgeTone, { bg: string; fg: string; dot: string; border: string }> = {
  neutral: { bg: "var(--surface-3)", fg: "var(--text-dim)", dot: "var(--muted)", border: "var(--border)" },
  accent: { bg: "rgba(180,242,63,0.12)", fg: "var(--accent)", dot: "var(--accent)", border: "transparent" },
  warn: { bg: "rgba(245,166,35,0.14)", fg: "var(--warn)", dot: "var(--warn)", border: "transparent" },
  danger: { bg: "rgba(242,107,92,0.14)", fg: "var(--danger)", dot: "var(--danger)", border: "transparent" },
  ok: { bg: "rgba(122,226,161,0.12)", fg: "var(--ok)", dot: "var(--ok)", border: "transparent" },
  info: { bg: "rgba(122,208,255,0.12)", fg: "var(--info)", dot: "var(--info)", border: "transparent" },
};

type BadgeProps = {
  children: ReactNode;
  className?: string;
  dot?: boolean;
  tone?: BadgeTone;
};

export function Badge({ children, className, dot, tone = "neutral" }: BadgeProps) {
  const color = TONES[tone];

  return (
    <span
      className={`inline-flex items-center gap-[6px] rounded px-2 py-[3px] font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] ${className ?? ""}`}
      style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.fg }}
    >
      {dot ? <span className="size-1.5 rounded-full" style={{ background: color.dot }} /> : null}
      {children}
    </span>
  );
}
