import type { ReactNode } from "react";
import { Eyebrow } from "@kershell/ui/eyebrow";

type PageHeaderProps = {
  actions?: ReactNode;
  eyebrow: ReactNode;
  foot?: ReactNode;
  sub?: ReactNode;
  title: ReactNode;
};

export function PageHeader({ actions, eyebrow, foot, sub, title }: PageHeaderProps) {
  return (
    <header className="border-b border-border px-8 pb-5 pt-7">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="min-w-0">
          <Eyebrow variant="accent">{eyebrow}</Eyebrow>
          <h1 className="mt-3 text-[28px] font-medium leading-tight text-text">{title}</h1>
          {sub ? <p className="mt-2 max-w-[760px] text-sm leading-6 text-text-dim">{sub}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {foot ? <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">{foot}</div> : null}
    </header>
  );
}
