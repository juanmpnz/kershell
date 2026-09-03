"use client";

import { useTranslations } from "next-intl";
import Reveal from "@/components/animations/Reveal";
import { Eyebrow } from "@kershell/ui/eyebrow";

type ServiceItem = {
  title: string;
  description: string;
  tag: string;
};

export default function Services() {
  const t = useTranslations("services");
  const items = t.raw("items") as ServiceItem[];

  return (
    <section id="services" className="console-section bg-surface">
      <div className="console-container">
        <div className="mb-12 max-w-3xl">
          <Eyebrow>{t("badge")}</Eyebrow>
          <h2 className="mt-5 text-[36px] font-semibold leading-[1.06] tracking-[-0.03em] text-text md:text-h2">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-2xl text-lead text-text-dim">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Reveal
              as="article"
              key={item.title}
              delay={index * 80}
              className="group flex min-h-[280px] flex-col bg-ink p-8 transition duration-200 hover:scale-[1.01] hover:bg-surface"
            >
              <div className="mb-10 flex items-start justify-between gap-4">
                <span className="font-mono text-[13px] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="max-w-[10rem] rounded-full border border-accent/60 bg-accent-soft px-2.5 py-1 text-right font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
                  {item.tag}
                </span>
              </div>
              <h3 className="text-h4 font-semibold text-text">{item.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-text-dim">{item.description}</p>
              <span className="mt-auto pt-8 font-mono text-xs uppercase tracking-[0.14em] text-accent transition-transform group-hover:translate-x-1">
                learn more -&gt;
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
