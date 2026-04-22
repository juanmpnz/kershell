"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import NetworkCanvas from "@/components/animations/NetworkCanvas";
import CountUp from "@/components/animations/CountUp";

function Typewriter({ texts, speed = 80, pause = 2000 }: { texts: string[]; speed?: number; pause?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[index];
    if (!deleting && charIndex < current.length) {
      const timer = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (!deleting && charIndex === current.length) {
      const timer = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(timer);
    } else if (deleting && charIndex > 0) {
      const timer = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, speed / 2);
      return () => clearTimeout(timer);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setIndex((index + 1) % texts.length);
    }
  }, [charIndex, deleting, index, texts, speed, pause]);

  return (
    <span className="text-[#00D9FF]">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}

export default function Hero() {
  const t = useTranslations("hero");
  const typingTexts = t.raw("typing") as string[];

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0F]">
      {/* Network animation */}
      <NetworkCanvas />

      {/* Radial glow — center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(108,99,255,0.10) 0%, rgba(108,99,255,0.03) 45%, transparent 70%)",
        }}
      />

      {/* Cyan glow — secondary */}
      <div
        className="absolute top-1/3 right-1/4 w-[400px] h-[300px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,217,255,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-40 pb-28 text-center lg:px-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#6C63FF]/35 bg-[#6C63FF]/09 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#B4ADFF]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF] animate-pulse" />
          {t("badge")}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="font-[var(--font-syne)] text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-[5.25rem] leading-[1.05]"
        >
          {t("title1")}
          <br />
          <span className="glitch-text text-[#6C63FF]" data-text={t("title2")}>
            {t("title2")}
          </span>
        </motion.h1>

        {/* Subtitle with typewriter */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mt-7 max-w-xl"
        >
          <p className="text-[1.0625rem] text-[#94A3B8] leading-relaxed">
            {t("subtitle")}
          </p>
          <div className="mt-3 font-[var(--font-jetbrains)] text-sm">
            <span className="text-[#4B5563]">{">"} </span>
            <Typewriter texts={typingTexts} />
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => scrollTo("#contact")}
            className="flex items-center gap-2 rounded-lg bg-[#6C63FF] px-7 py-3.5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[#5A52E0]"
          >
            {t("cta_primary")}
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => scrollTo("#portfolio")}
            className="flex items-center gap-2 rounded-lg border border-white/20 px-7 py-3.5 text-[0.9375rem] font-semibold text-[#F1F5F9] transition-all hover:border-white/40 hover:bg-white/[0.05]"
          >
            {t("cta_secondary")}
          </button>
        </motion.div>

        {/* Stats with animated counters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-20 border-t border-white/[0.07] pt-10"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-20">
            <div className="flex flex-col items-center gap-1.5">
              <span className="font-[var(--font-syne)] text-3xl font-bold text-white">
                <CountUp end={3} suffix="×" />
              </span>
              <span className="text-[0.7rem] text-[#4B5563] uppercase tracking-[0.14em]">
                Faster Delivery
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="font-[var(--font-syne)] text-3xl font-bold text-white">
                <CountUp end={100} suffix="%" />
              </span>
              <span className="text-[0.7rem] text-[#4B5563] uppercase tracking-[0.14em]">
                Human-Reviewed
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="font-[var(--font-syne)] text-3xl font-bold text-white">
                <CountUp end={6} suffix="+" />
              </span>
              <span className="text-[0.7rem] text-[#4B5563] uppercase tracking-[0.14em]">
                Years Experience
              </span>
            </div>
          </div>
        </motion.div>

        {/* Scroll arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="mt-14 flex justify-center"
        >
          <button
            onClick={() => scrollTo("#services")}
            className="animate-bounce-y text-white/20 hover:text-white/45 transition-colors"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
