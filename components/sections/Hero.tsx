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
  const statsT = useTranslations("stats");
  const typingTexts = t.raw("typing") as string[];

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0A0A0F]">
      {/* Network animation */}
      <NetworkCanvas />

      {/* Radial glow — center */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-[500px] sm:w-[800px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(108,99,255,0.10) 0%, rgba(108,99,255,0.03) 45%, transparent 70%)",
        }}
      />

      {/* Cyan glow — secondary */}
      <div
        className="pointer-events-none absolute right-[-160px] top-1/3 h-[240px] w-[320px] rounded-full sm:right-1/4 sm:h-[300px] sm:w-[400px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,217,255,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-28 text-center sm:px-6 sm:pb-24 sm:pt-36 lg:px-10 lg:pb-28 lg:pt-40">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-7 inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-[#6C63FF]/35 bg-[#6C63FF]/09 px-3.5 py-1.5 text-center text-[0.65rem] font-semibold uppercase leading-relaxed tracking-[0.08em] text-[#B4ADFF] sm:mb-8 sm:gap-2.5 sm:px-4 sm:text-[0.7rem] sm:tracking-[0.14em]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF] animate-pulse" />
          {t("badge")}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="mx-auto max-w-[11ch] text-[2.6rem] font-bold leading-[1.05] tracking-tight text-white sm:max-w-none sm:text-6xl lg:text-7xl xl:text-[5.25rem]"
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
          className="mx-auto mt-6 max-w-xl sm:mt-7"
        >
          <p className="text-base leading-relaxed text-[#94A3B8] sm:text-[1.0625rem]">
            {t("subtitle")}
          </p>
          <div className="mx-auto mt-3 min-h-[2.75rem] max-w-sm text-sm leading-relaxed sm:min-h-0 sm:max-w-none">
            <span className="text-[#4B5563]">{">"} </span>
            <Typewriter texts={typingTexts} />
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto mt-9 flex max-w-sm flex-col items-stretch justify-center gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center sm:gap-4"
        >
          <button
            onClick={() => scrollTo("#contact")}
            className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#6C63FF] px-7 py-3.5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[#5A52E0]"
          >
            {t("cta_primary")}
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => scrollTo("#portfolio")}
            className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/20 px-7 py-3.5 text-[0.9375rem] font-semibold text-[#F1F5F9] transition-all hover:border-white/40 hover:bg-white/[0.05]"
          >
            {t("cta_secondary")}
          </button>
        </motion.div>

        {/* Stats with animated counters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mx-auto mt-12 max-w-xl border-t border-white/[0.07] pt-7 sm:mt-20 sm:max-w-none sm:pt-10"
        >
          <div className="grid grid-cols-3 gap-3 sm:flex sm:items-center sm:justify-center sm:gap-20">
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              <span className="text-2xl font-bold text-white sm:text-3xl">
                <CountUp end={3} suffix="×" />
              </span>
              <span className="text-center text-[0.62rem] uppercase leading-snug tracking-[0.08em] text-[#4B5563] sm:text-[0.7rem] sm:tracking-[0.14em]">
                {statsT("faster")}
              </span>
            </div>
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              <span className="text-2xl font-bold text-white sm:text-3xl">
                <CountUp end={100} suffix="%" />
              </span>
              <span className="text-center text-[0.62rem] uppercase leading-snug tracking-[0.08em] text-[#4B5563] sm:text-[0.7rem] sm:tracking-[0.14em]">
                {statsT("reviewed")}
              </span>
            </div>
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              <span className="text-2xl font-bold text-white sm:text-3xl">
                <CountUp end={6} suffix="+" />
              </span>
              <span className="text-center text-[0.62rem] uppercase leading-snug tracking-[0.08em] text-[#4B5563] sm:text-[0.7rem] sm:tracking-[0.14em]">
                {statsT("experience")}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Scroll arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="mt-10 hidden justify-center sm:flex lg:mt-14"
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
