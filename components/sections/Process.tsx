"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function Process() {
  const t = useTranslations("process");
  const steps = t.raw("steps") as { number: string; title: string; description: string }[];

  return (
    <section id="process" className="py-24 lg:py-32 bg-[#0A0A0F]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4 section-label"
          >
            {t("badge")}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="font-[var(--font-syne)] text-4xl font-bold text-white sm:text-5xl"
          >
            {t("title")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-[#94A3B8] text-lg"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-[1.75rem] left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-px bg-white/[0.07]" />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.12 }}
                className="relative flex flex-col items-center text-center lg:items-start lg:text-left"
              >
                {/* Number */}
                <div className="relative z-10 mb-7 flex h-14 w-14 items-center justify-center rounded-full border border-[#6C63FF]/30 bg-[#0A0A0F]">
                  <span className="font-[var(--font-syne)] text-lg font-bold text-[#6C63FF] tabular-nums">
                    {step.number}
                  </span>
                </div>

                {/* Vertical connector (mobile) */}
                {i < steps.length - 1 && (
                  <div className="lg:hidden absolute top-14 left-1/2 -translate-x-1/2 w-px h-12 bg-white/[0.07]" />
                )}

                <h3 className="mb-3 font-[var(--font-syne)] text-xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
