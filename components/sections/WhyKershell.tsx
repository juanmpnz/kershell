"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

export default function WhyKershell() {
  const t = useTranslations("why");
  const points = t.raw("points") as { traditional: string; kershell: string }[];

  return (
    <section className="py-16 sm:py-20 lg:py-32 bg-[#0A0A0F]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-16">
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
            className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl"
          >
            {t("title")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base leading-relaxed text-[#94A3B8] sm:text-lg"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Mobile comparison cards */}
        <div className="space-y-4 sm:hidden">
          {points.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#111827]"
            >
              <div className="flex gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-4">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-[#4B5563]" />
                <div>
                  <div className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#4B5563]">
                    {t("traditional")}
                  </div>
                  <p className="text-sm leading-relaxed text-[#6B7280]">{point.traditional}</p>
                </div>
              </div>

              <div className="flex gap-3 border-l-[3px] border-l-[#6C63FF] bg-[#6C63FF]/[0.05] px-4 py-4">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6C63FF]" />
                <div>
                  <div className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#B4ADFF]">
                    {t("kershell")}
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-[#F1F5F9]">{point.kershell}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop/tablet comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="hidden overflow-hidden rounded-xl border border-white/[0.07] sm:block"
        >
          {/* Header row */}
          <div className="grid grid-cols-2 border-b border-white/[0.07]">
            <div className="border-r border-white/[0.07] bg-white/[0.02] px-5 py-4 lg:px-6">
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-[#4B5563]" />
                <span className="text-sm font-semibold text-[#4B5563]">{t("traditional")}</span>
              </div>
            </div>
            <div className="border-l-[3px] border-l-[#6C63FF] bg-[#6C63FF]/08 px-5 py-4 lg:px-6">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6C63FF]">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-bold text-[#B4ADFF]">
                  {t("kershell")}
                </span>
              </div>
            </div>
          </div>

          {/* Rows */}
          {points.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.25 + i * 0.06 }}
              className={`grid grid-cols-2 ${i < points.length - 1 ? "border-b border-white/[0.05]" : ""}`}
            >
              <div className="flex items-center gap-3 border-r border-white/[0.05] px-5 py-4 lg:px-6">
                <X className="h-3.5 w-3.5 shrink-0 text-[#4B5563]" />
                <span className="text-sm text-[#4B5563]">{point.traditional}</span>
              </div>
              <div className="flex items-center gap-3 border-l-[3px] border-l-[#6C63FF] bg-[#6C63FF]/[0.04] px-5 py-4 lg:px-6">
                <Check className="h-3.5 w-3.5 shrink-0 text-[#6C63FF]" />
                <span className="text-sm font-medium text-[#F1F5F9]">{point.kershell}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
