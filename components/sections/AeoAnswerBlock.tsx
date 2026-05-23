"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { BrainCircuit, Building2, RadioTower, ShieldCheck } from "lucide-react";

const ICONS = [Building2, BrainCircuit, RadioTower, ShieldCheck];

export default function AeoAnswerBlock() {
  const t = useTranslations("aeo");
  const answers = t.raw("answers") as { question: string; answer: string }[];
  const useCases = t.raw("use_cases") as string[];

  return (
    <section className="bg-[#0A0A0F] py-16 sm:py-20 lg:py-28" aria-labelledby="aeo-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 section-label">{t("badge")}</div>
            <h2 id="aeo-title" className="max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#94A3B8] sm:text-lg">
              {t("summary")}
            </p>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {useCases.map((useCase, index) => {
                const Icon = ICONS[index] ?? BrainCircuit;
                return (
                  <div
                    key={useCase}
                    className="flex items-start gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#6C63FF]/25 bg-[#6C63FF]/10">
                      <Icon className="h-4 w-4 text-[#6C63FF]" />
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-[#F1F5F9]">{useCase}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-xl border border-white/[0.07] bg-[#111827] p-5 sm:p-7"
          >
            <div className="space-y-5">
              {answers.map((item) => (
                <article key={item.question} className="border-b border-white/[0.06] pb-5 last:border-0 last:pb-0">
                  <h3 className="text-sm font-semibold leading-relaxed text-white">{item.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{item.answer}</p>
                </article>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
