"use client";

import { useTranslations } from "next-intl";
import { Eyebrow } from "@kershell/ui/eyebrow";

type Step = {
  number: string;
  title: string;
  description: string;
};

export default function Process() {
  const t = useTranslations("process");
  const steps = t.raw("steps") as Step[];

  return (
    <section id="process" className="console-section bg-ink">
      <div className="console-container">
        <div className="mb-12 max-w-3xl">
          <Eyebrow variant="accent">{t("badge")}</Eyebrow>
          <h2 className="mt-5 text-[36px] font-semibold leading-[1.06] tracking-[-0.03em] text-text md:text-h2">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-2xl text-lead text-text-dim">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <article key={step.number} className="min-h-[270px] bg-surface p-8">
              <div className="font-mono text-[13px] text-accent">{step.number}</div>
              <div className="my-8 flex items-center gap-3">
                <span className="h-2 w-2 bg-accent" />
                <span className="h-px flex-1 bg-border" />
              </div>
              <h3 className="text-[22px] font-semibold leading-[1.15] text-text">{step.title}</h3>
              <p className="mt-4 text-[13px] leading-relaxed text-text-dim">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
