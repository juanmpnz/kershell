import type { ReactNode } from "react";

type FieldProps = {
  children: ReactNode;
  description?: ReactNode;
  label: ReactNode;
};

export function Field({ children, description, label }: FieldProps) {
  return (
    <label className="block">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">{label}</span>
      <span className="mt-2 block">{children}</span>
      {description ? <span className="mt-1.5 block text-xs text-muted">{description}</span> : null}
    </label>
  );
}
