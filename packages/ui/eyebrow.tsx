import type { HTMLAttributes, ReactNode } from "react";

type EyebrowProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: "muted" | "accent";
};

export function Eyebrow({
  children,
  variant = "muted",
  className,
  ...rest
}: EyebrowProps) {
  return (
    <div
      className={[
        "inline-flex items-center gap-3 font-mono text-eyebrow font-medium uppercase",
        variant === "accent" ? "text-accent" : "text-muted",
        className ?? "",
      ].join(" ")}
      {...rest}
    >
      <span
        aria-hidden
        className={variant === "accent" ? "h-2 w-2 bg-accent" : "h-px w-6 bg-border"}
      />
      {children}
    </div>
  );
}
