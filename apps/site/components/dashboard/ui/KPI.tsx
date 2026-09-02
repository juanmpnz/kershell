import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon, type IconName } from "@/components/dashboard/ui/Icon";

type KPIProps = {
  accent?: boolean;
  children?: ReactNode;
  foot?: ReactNode;
  icon?: IconName;
  label: string;
  sub?: string;
  value: ReactNode;
};

export function KPI({ accent, children, foot, icon, label, sub, value }: KPIProps) {
  return (
    <div className="flex min-h-[132px] flex-col gap-[14px] rounded-[10px] border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <Eyebrow>{label}</Eyebrow>
        {icon ? <Icon className="text-muted" name={icon} size={14} /> : null}
      </div>

      <div className="flex items-baseline gap-2">
        <div className={`font-mono text-[34px] font-medium leading-none ${accent ? "text-accent" : "text-text"}`}>
          {value}
        </div>
        {sub ? <div className="font-mono text-[12px] text-muted">{sub}</div> : null}
      </div>

      {children}

      {foot ? <div className="mt-auto text-[12px] text-text-dim">{foot}</div> : null}
    </div>
  );
}
