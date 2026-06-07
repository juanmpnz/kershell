import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  label: string;
  size?: "sm" | "md";
  variant?: "ghost" | "surface";
};

export function IconButton({
  children,
  className,
  label,
  size = "md",
  variant = "surface",
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md border transition disabled:pointer-events-none disabled:opacity-45",
        size === "sm" ? "size-[26px]" : "size-[34px]",
        variant === "surface"
          ? "border-border bg-surface text-text-dim hover:bg-surface-2 hover:text-text"
          : "border-transparent bg-transparent text-text-dim hover:bg-surface hover:text-text",
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
