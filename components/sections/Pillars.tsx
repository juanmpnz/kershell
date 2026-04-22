"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Zap, CheckCircle, Shield } from "lucide-react";
import Tilt3D from "@/components/animations/Tilt3D";

const PILLARS = [
  { key: "velocity" as const, icon: Zap, color: "#00D9FF" },
  { key: "quality" as const, icon: CheckCircle, color: "#6C63FF" },
  { key: "security" as const, icon: Shield, color: "#00FF88" },
];

export default function Pillars() {
  const t = useTranslations("pillars");

  return (
    <section className="py-24 lg:py-32 bg-[#0A0A0F]">
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

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.key}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.12 }}
              >
                <Tilt3D className="h-full">
                  <div
                    className="card p-8 h-full transition-all hover:bg-[#16203A]"
                    style={{ borderLeftWidth: 3, borderLeftColor: pillar.color }}
                  >
                    {/* Icon */}
                    <div
                      className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg border"
                      style={{
                        backgroundColor: `${pillar.color}10`,
                        borderColor: `${pillar.color}33`,
                      }}
                    >
                      <Icon className="h-6 w-6" style={{ color: pillar.color }} strokeWidth={1.8} />
                    </div>

                    {/* Stat */}
                    <div
                      className="mb-2 font-[var(--font-syne)] text-2xl font-bold"
                      style={{ color: pillar.color }}
                    >
                      {t(`${pillar.key}.stat`)}
                    </div>

                    {/* Title */}
                    <h3 className="mb-3 font-[var(--font-syne)] text-xl font-bold text-white">
                      {t(`${pillar.key}.title`)}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-[#94A3B8] leading-relaxed">
                      {t(`${pillar.key}.description`)}
                    </p>
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
