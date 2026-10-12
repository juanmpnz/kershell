"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import CinematicScene from "@/components/backgrounds/CinematicScene";

export default function Hero() {
  const t = useTranslations("hero");
  const [paused, setPaused] = useState(false);
  return (
    <section className="cinema-hero" aria-labelledby="hero-title">
      <div className="cinema-hero-stage">
        <div className="cinema-hero-art" aria-hidden="true">
          <Image src="/art/hero.webp" alt="" fill preload sizes="100vw" className="cinema-hero-poster" />
          <CinematicScene paused={paused} />
        </div>
        <div className="cinema-hero-shade" aria-hidden="true" />
        <div className="cinema-hero-copy cinema-container">
          <p className="cinema-label hero-eyebrow">{t("badge")}</p>
          <h1 id="hero-title"><span>{t("title1")}</span><span>{t("title2")}</span><span className="hero-last-line">{t("title3")}</span></h1>
          <div className="hero-description"><p>{t("subtitle")}</p><a className="cinema-link" href="#portfolio">{t("cta_secondary")}<ArrowUpRight aria-hidden="true" size={22} /></a></div>
        </div>
        <div className="cinema-hero-bottom cinema-container">
          <span>{t("discipline")}</span>
          <div className="hero-bottom-actions"><a href="#portfolio" className="hero-scroll"><span>{t("scroll")}</span><ArrowDown aria-hidden="true" size={18} /></a><button className="hero-motion-control" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}{t(paused ? "play" : "pause")}</button></div>
          <span className="hero-location">{t("location")}</span>
        </div>
      </div>
    </section>
  );
}
