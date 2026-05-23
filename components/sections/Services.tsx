"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Code2, Bot, Globe, Workflow, FolderKanban, BarChart3, ArrowRight } from "lucide-react";
import Tilt3D from "@/components/animations/Tilt3D";

const ICONS = [Code2, Bot, Globe, Workflow, FolderKanban, BarChart3];

const TAG_STYLES: Record<string, string> = {
  "Most Popular": "text-[#B4ADFF] border-[#6C63FF]/30 bg-[#6C63FF]/10",
  "Más Popular":  "text-[#B4ADFF] border-[#6C63FF]/30 bg-[#6C63FF]/10",
  "New":          "text-[#00FF88] border-[#00FF88]/30 bg-[#00FF88]/10",
  "Nuevo":        "text-[#00FF88] border-[#00FF88]/30 bg-[#00FF88]/10",
};

export default function Services() {
  const t = useTranslations("services");
  const items = t.raw("items") as { title: string; description: string; tag: string }[];

  return (
    <section id="services" className="py-16 sm:py-20 lg:py-32 bg-[#12121A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
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

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
              >
                <Tilt3D className="h-full" intensity={7}>
                  <div className="group card h-full p-5 transition-all hover:border-[#6C63FF]/25 hover:bg-[#16203A] sm:p-7">
                    <div className="mb-5 flex min-h-11 items-start justify-between gap-3">
                      {/* Icon */}
                      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#6C63FF]/20 bg-[#6C63FF]/10 transition-colors group-hover:border-[#6C63FF]/35 group-hover:bg-[#6C63FF]/18">
                        <Icon className="h-5 w-5 text-[#6C63FF]" strokeWidth={1.7} />
                      </div>

                      {/* Tag */}
                      {item.tag && (
                        <span
                          className={`max-w-[8.5rem] rounded-full border px-2.5 py-0.5 text-right text-[10px] font-semibold uppercase leading-snug tracking-wider ${TAG_STYLES[item.tag] ?? "text-[#94A3B8] border-white/[0.07] bg-white/[0.03]"}`}
                        >
                          {item.tag}
                        </span>
                      )}
                    </div>

                    <h3 className="mb-2 text-lg font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">{item.description}</p>

                    {/* Hover arrow */}
                    <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-[#6C63FF] opacity-100 transition-all sm:opacity-0 sm:group-hover:opacity-100">
                      <span>Learn more</span>
                      <ArrowRight className="h-3.5 w-3.5 translate-x-0 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Tilt3D>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
