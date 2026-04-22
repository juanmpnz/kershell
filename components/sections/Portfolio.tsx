"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ExternalLink, Clock } from "lucide-react";

export default function Portfolio() {
  const t = useTranslations("portfolio");
  const items = t.raw("items") as {
    title: string;
    description: string;
    tags: string[];
    url: string;
    cta: string;
  }[];

  return (
    <section id="portfolio" className="py-24 lg:py-32 bg-[#12121A]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
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

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Real projects */}
          {items.map((item, i) => (
            <motion.a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group card p-7 block transition-all hover:border-[#6C63FF]/25 hover:bg-[#16203A]"
            >
              {/* Visual */}
              <div className="mb-6 aspect-video rounded-lg bg-[#0A0A0F] border border-white/[0.07] flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <div className="font-[var(--font-syne)] text-2xl font-bold text-[#6C63FF] mb-1">
                    {item.title.split(" ")[0]}
                  </div>
                  <div className="text-xs text-[#4B5563]">Real Estate Platform</div>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-4 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-0.5 text-[11px] font-medium text-[#94A3B8]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h3 className="mb-2 font-[var(--font-syne)] text-lg font-bold text-white">
                {item.title}
              </h3>
              <p className="mb-5 text-sm text-[#94A3B8] leading-relaxed">{item.description}</p>

              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#6C63FF] group-hover:text-[#B4ADFF] transition-colors">
                {item.cta}
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </motion.a>
          ))}

          {/* Coming soon */}
          {[1, 2].map((n) => (
            <motion.div
              key={`placeholder-${n}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (items.length + n - 1) * 0.1 }}
              className="rounded-xl border border-dashed border-white/[0.07] bg-white/[0.015] p-7 flex flex-col items-center justify-center text-center min-h-[280px] gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03]">
                <Clock className="h-5 w-5 text-[#4B5563]" />
              </div>
              <span className="text-sm text-[#4B5563] font-medium">{t("coming_soon")}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
