"use client";

import { useTranslations } from "next-intl";
import Reveal from "@/components/animations/Reveal";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@kershell/ui/eyebrow";

function TerminalBlock({ lines }: { lines: string[] }) {
  const terminalLines = [
    { kind: "command", text: "init --domain enterprise" },
    { kind: "output", text: lines[0] ?? "Enterprise SaaS" },
    { kind: "command", text: "map --rules --data --risk" },
    { kind: "output", text: lines[2] ?? "Real-Time AI" },
    { kind: "command", text: "ship --senior-reviewed" },
  ];

  return (
    <div className="shadow-card rounded-[10px] border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#3A4048]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3A4048]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#3A4048]" />
        <span className="ml-3 font-mono text-[11px] text-muted">kershell.console</span>
      </div>
      <div className="space-y-1 px-5 py-5 font-mono text-[13px] leading-[1.7]">
        {terminalLines.map((line, index) => (
          <div key={`${line.kind}-${index}`} className={line.kind === "output" ? "text-muted" : "text-text"}>
            {line.kind === "command" ? <span className="mr-2 text-accent">$</span> : null}
            {line.text}
          </div>
        ))}
        <div className="flex items-center gap-2 text-text">
          <span className="text-accent">$</span>
          <span>ready</span>
          <span aria-hidden className="animate-blink inline-block h-4 w-2 bg-accent" />
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const t = useTranslations("hero");
  const typingTexts = t.raw("typing") as string[];

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[calc(100svh-1px)] overflow-hidden bg-ink pt-16">
      <div aria-hidden className="console-grid-bg absolute inset-0 opacity-70" />
      <div className="console-container relative grid min-h-[calc(100svh-4rem)] grid-cols-1 items-center gap-12 py-16 md:grid-cols-[1.4fr_1fr] md:py-24">
        <div className="max-w-4xl">
          <Eyebrow variant="accent">{t("badge")}</Eyebrow>
          <Reveal delay={80}>
            <h1 className="mt-7 max-w-[11ch] text-[48px] font-semibold leading-[1.02] tracking-[-0.03em] text-text md:text-display">
              {t("title1")}
              <br />
              <span className="text-text-dim">{t("title2")}</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-[560px] text-lead text-text-dim">{t("subtitle")}</p>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-4 max-w-[560px] border-l border-accent pl-4 text-sm leading-relaxed text-muted">
              {t("differential")}
            </p>
          </Reveal>
          <Reveal delay={320}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button variant="primary" arrow onClick={() => scrollTo("#contact")}>
                {t("cta_primary")}
              </Button>
              <Button variant="ghost" arrow onClick={() => scrollTo("#portfolio")}>
                {t("cta_secondary")}
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal className="relative" delay={160}>
          <div aria-hidden className="absolute -inset-4 border border-border/50" />
          <TerminalBlock lines={typingTexts} />
        </Reveal>
      </div>
    </section>
  );
}
