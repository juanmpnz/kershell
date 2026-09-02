import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  arrow?: boolean;
  children: ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-[18px] py-3 text-sm font-medium " +
  "tracking-[-0.005em] transition duration-200 focus-visible:outline-none focus-visible:shadow-focus " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-ink hover:brightness-110 hover:shadow-focus active:brightness-95",
  ghost:
    "border border-border bg-transparent text-text hover:bg-surface active:bg-surface-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "ghost", arrow, children, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${className ?? ""}`}
      {...rest}
    >
      {children}
      {arrow ? <span className="font-mono text-sm">-&gt;</span> : null}
    </button>
  );
});
