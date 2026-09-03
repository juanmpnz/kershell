"use client";

import { useTranslations } from "next-intl";
import { ExternalLink, Lock } from "lucide-react";
import Reveal from "@/components/animations/Reveal";
import { KMonogram } from "@/components/brand/KMonogram";
import { Eyebrow } from "@kershell/ui/eyebrow";

type PortfolioItem = {
  title: string;
  subtitle?: string;
  description: string;
  tags: string[];
  url: string;
  urlLabel: string;
  cta: string;
};

function WorkPreview({ domain }: { domain: string }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-ink">
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0, transparent 12px, rgba(180,242,63,0.14) 12px, rgba(180,242,63,0.14) 13px)",
        }}
      />
      <div className="absolute left-4 top-4 font-mono text-[11px] text-muted">{domain}</div>
      <KMonogram className="absolute bottom-[-18px] left-4 h-28 w-28 text-border" />
    </div>
  );
}

export default function Portfolio() {
  const t = useTranslations("portfolio");
  const items = (t.raw("items") as PortfolioItem[]).slice(0, 3);

  return (
    <section id="portfolio" className="console-section bg-ink">
      <div className="console-container">
        <div className="mb-12 max-w-3xl">
          <Eyebrow>{t("badge")}</Eyebrow>
          <h2 className="mt-5 text-[36px] font-semibold leading-[1.06] tracking-[-0.03em] text-text md:text-h2">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-2xl text-lead text-text-dim">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {items.map((item, index) => {
            const isPending = item.url === "#";
            const body = (
              <>
                <WorkPreview domain={item.urlLabel} />
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-sm border border-border px-2 py-1 font-mono text-[11px] text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-semibold text-text">{item.title}</h3>
                  {item.subtitle ? (
                    <p className="mt-1 font-mono text-[12px] text-accent">{item.subtitle}</p>
                  ) : null}
                  <p className="mb-6 mt-4 text-[13px] leading-relaxed text-text-dim">{item.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-4">
                    <span className="truncate font-mono text-[11px] text-muted">{item.urlLabel}</span>
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em] text-accent">
                      {item.cta}
                      {!isPending ? <ExternalLink className="h-3.5 w-3.5" /> : null}
                    </span>
                  </div>
                </div>
              </>
            );

            return isPending ? (
              <Reveal
                as="article"
                key={item.title}
                delay={index * 80}
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition duration-200 hover:scale-[1.01] hover:bg-surface-2"
              >
                {body}
              </Reveal>
            ) : (
              <Reveal key={item.title} delay={index * 80} className="h-full">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition duration-200 hover:scale-[1.01] hover:bg-surface-2"
                >
                  {body}
                </a>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-8 flex max-w-3xl items-start gap-2 text-sm leading-relaxed text-muted">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          {t("nda_note")}
        </p>
      </div>
    </section>
  );
}
