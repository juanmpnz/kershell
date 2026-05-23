"use client";

import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Answer = {
  question: string;
  answer: string;
};

export default function AeoAnswerBlock() {
  const t = useTranslations("aeo");
  const answers = t.raw("answers") as Answer[];
  const useCases = t.raw("use_cases") as string[];

  return (
    <section className="console-section bg-ink" aria-labelledby="aeo-title">
      <div className="console-container grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <Eyebrow variant="accent">{t("badge")}</Eyebrow>
          <h2
            id="aeo-title"
            className="mt-5 text-[36px] font-semibold leading-[1.06] tracking-[-0.03em] text-text md:text-h2"
          >
            {t("title")}
          </h2>
          <p className="mt-4 max-w-2xl text-lead text-text-dim">{t("summary")}</p>
          <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {useCases.map((useCase, index) => (
              <div key={useCase} className="bg-surface p-5">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-text-dim">{useCase}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6">
          {answers.map((item) => (
            <article key={item.question} className="border-b border-border py-5 first:pt-0 last:border-0 last:pb-0">
              <h3 className="font-mono text-sm text-text">{item.question}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-dim">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
