"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import CountUp from "@/components/animations/CountUp";

export default function Testimonials() {
  const t = useTranslations("testimonials");
  const items = t.raw("items") as {
    quote: string;
    name: string;
    role: string;
    company: string;
    pending: boolean;
  }[];
  const stats = t.raw("stats") as { value: number; suffix: string; label: string }[];

  return (
    <section className="py-16 sm:py-20 lg:py-32 bg-[#12121A]">
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

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="mb-10 grid grid-cols-2 gap-3 sm:mb-16 sm:grid-cols-4 sm:gap-5"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.07] bg-[#111827] p-4 text-center sm:p-6"
            >
              <div className="text-2xl font-bold text-[#6C63FF] sm:text-3xl">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-1 text-[0.68rem] uppercase leading-snug tracking-[0.08em] text-[#4B5563] sm:text-xs sm:tracking-[0.12em]">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-xl border p-5 sm:p-7 ${
                item.pending
                  ? "border-dashed border-white/[0.07] bg-white/[0.015]"
                  : "border-white/[0.07] bg-[#111827]"
              }`}
            >
              {item.pending ? (
                <div className="flex min-h-[150px] flex-col items-center justify-center gap-3 text-center sm:min-h-[180px]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03]">
                    <Quote className="h-5 w-5 text-[#4B5563]" />
                  </div>
                  <span className="text-sm text-[#4B5563] font-medium italic">{item.quote}</span>
                </div>
              ) : (
                <>
                  {/* Stars */}
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className="h-4 w-4 fill-[#00D9FF] text-[#00D9FF]"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="mb-6 text-sm leading-relaxed text-[#94A3B8] italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 border-t border-white/[0.07] pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/20">
                      <span className="text-sm font-bold text-[#6C63FF]">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{item.name}</div>
                      <div className="text-xs leading-relaxed text-[#4B5563]">
                        {item.role}, {item.company}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
