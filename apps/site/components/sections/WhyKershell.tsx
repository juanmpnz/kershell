"use client";

import { useTranslations } from "next-intl";
import { KMonogram } from "@/components/brand/KMonogram";
import { Eyebrow } from "@/components/ui/Eyebrow";

type CompareRow = {
  aspect: string;
  kershell: string;
};

export default function WhyKershell() {
  const t = useTranslations("why");
  const rows = t.raw("rows") as CompareRow[];

  return (
    <section id="why" className="console-section bg-surface">
      <div className="console-container">
        <div className="mb-12 max-w-3xl">
          <Eyebrow>{t("badge")}</Eyebrow>
          <h2 className="mt-5 text-[36px] font-semibold leading-[1.06] tracking-[-0.03em] text-text md:text-h2">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-2xl text-lead text-text-dim">{t("subtitle")}</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-ink">
          <div className="hidden grid-cols-[0.7fr_1.4fr] border-b border-border bg-ink font-mono text-[11px] uppercase tracking-[0.16em] text-muted md:grid">
            <div className="px-6 py-4">{t("aspect")}</div>
            <div className="flex items-center gap-2 border-l border-border px-6 py-4 text-accent">
              <KMonogram size={14} />
              {t("kershell")}
            </div>
          </div>

          {rows.map((row) => (
            <div
              key={row.aspect}
              className="grid grid-cols-1 border-b border-border last:border-b-0 md:grid-cols-[0.7fr_1.4fr]"
            >
              <div className="bg-surface px-5 py-4 text-sm font-semibold text-text md:bg-transparent md:px-6">
                {row.aspect}
              </div>
              <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-text md:border-l md:border-t-0 md:px-6">
                <span className="mr-2 text-accent">-&gt;</span>
                {row.kershell}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
