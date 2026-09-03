import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@kershell/ui/cn";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-[38px] w-full rounded-md border border-border bg-[var(--ink-2)] px-3 text-[13px] text-text outline-none transition focus:border-accent disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
