"use client";

import { useTranslations } from "next-intl";
import Reveal from "@/components/animations/Reveal";
import CountUp from "@/components/animations/CountUp";

export default function Testimonials() {
  const t = useTranslations("testimonials");
  const stats = t.raw("stats") as { value: number; suffix: string; label: string }[];

  return (
    <section className="border-y border-border bg-surface">
      <div className="console-container">
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 80} className="px-0 py-8 sm:px-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                {String(index + 1).padStart(2, "0")} / {String(stats.length).padStart(2, "0")}
              </div>
              <div className="mt-4 text-data font-semibold text-accent">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-3 max-w-[14rem] text-sm leading-relaxed text-text-dim">
                {stat.label}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
