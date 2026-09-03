import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@kershell/ui/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-[38px] w-full rounded-md border border-border bg-[var(--ink-2)] px-3 text-[13px] text-text outline-none transition placeholder:text-muted focus:border-accent disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
});
