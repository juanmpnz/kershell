"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

export default function Portfolio() {
  const t = useTranslations("portfolio");
  const items = t.raw("items") as {
    title: string;
    description: string;
    tags: string[];
    url: string;
    urlLabel: string;
    image: string;
    cta: string;
  }[];

  return (
    <section id="portfolio" className="py-16 sm:py-20 lg:py-32 bg-[#12121A]">
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
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
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
              className="group card block overflow-hidden p-0 transition-all hover:border-[#6C63FF]/25 hover:bg-[#16203A]"
            >
              {/* Visual */}
              <div className="relative aspect-video overflow-hidden border-b border-white/[0.07] bg-[#0A0A0F]">
                <Image
                  src={item.image}
                  alt={`${item.title} website screenshot`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.035]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/60 via-transparent to-transparent opacity-75" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 sm:bottom-3 sm:left-3 sm:right-3 sm:gap-3">
                  <span className="truncate rounded-full border border-white/10 bg-[#0A0A0F]/80 px-3 py-1 text-[11px] font-medium text-[#F1F5F9] backdrop-blur-md">
                    {item.urlLabel}
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0A0A0F]/80 text-white backdrop-blur-md">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                {/* Tags */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-[#94A3B8] sm:px-3"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="mb-2 text-lg font-bold leading-snug text-white">
                  {item.title}
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-[#94A3B8]">{item.description}</p>

                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#6C63FF] transition-colors group-hover:text-[#B4ADFF]">
                  {item.cta}
                  <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
