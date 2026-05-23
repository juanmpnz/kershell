// components/ui/Button.tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'ghost';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  arrow?: boolean;
  children: ReactNode;
};

const base =
  'inline-flex items-center gap-2 px-[18px] py-3 text-sm font-medium ' +
  'tracking-[-0.005em] rounded-md transition ' +
  'focus-visible:outline-none focus-visible:shadow-focus';

const styles: Record<Variant, string> = {
  primary:
    'bg-accent text-accent-ink hover:brightness-110 active:brightness-95',
  ghost:
    'bg-transparent text-text border border-border hover:bg-surface ' +
    'active:bg-surface-2',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'ghost', arrow, children, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${base} ${styles[variant]} ${className ?? ''}`}
      {...rest}
    >
      {children}
      {arrow ? <span className="font-mono text-sm">→</span> : null}
    </button>
  );
});
