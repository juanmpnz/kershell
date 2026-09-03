"use client";

import { useTranslations } from "next-intl";
import Reveal from "@/components/animations/Reveal";
import { Eyebrow } from "@kershell/ui/eyebrow";

const PILLARS = ["velocity", "quality", "security"] as const;

export default function Pillars() {
  const t = useTranslations("pillars");

  return (
    <section className="console-section bg-ink">
      <div className="console-container">
        <div className="mb-12 max-w-3xl">
          <Eyebrow variant="accent">{t("badge")}</Eyebrow>
          <h2 className="mt-5 text-[36px] font-semibold leading-[1.06] tracking-[-0.03em] text-text md:text-h2">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-2xl text-lead text-text-dim">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <Reveal
              as="article"
              key={pillar}
              delay={index * 80}
              className="min-h-[280px] rounded-lg border border-border bg-surface p-8 transition duration-200 hover:-translate-y-0.5 hover:bg-surface-2"
            >
              <span className="inline-flex rounded-full border border-accent bg-accent-soft px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                {t(`${pillar}.stat`)}
              </span>
              <h3 className="mt-8 text-h3 font-semibold text-text">{t(`${pillar}.title`)}</h3>
              <p className="mt-4 text-sm leading-relaxed text-text-dim">
                {t(`${pillar}.description`)}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
