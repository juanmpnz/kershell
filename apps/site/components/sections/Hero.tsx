"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import CinematicScene, { type GalleryProject } from "@/components/backgrounds/CinematicScene";


export default function Hero() {
  const t = useTranslations("hero");
  const portfolio = useTranslations("portfolio");
  const exhibits = portfolio.raw("items") as Array<{ id: GalleryProject; title: string }>;
  const [paused,setPaused] = useState(false);
  const [activeProject,setActiveProject] = useState<GalleryProject | null>(null);
  return (
    <section className="cinema-hero gallery-hero" aria-labelledby="hero-title">
      <div className="cinema-hero-stage">
        <div className="cinema-hero-art" aria-hidden="true">
          <Image src="/art/gallery.webp" alt="" fill preload unoptimized sizes="100vw" className="cinema-hero-poster" />
          <CinematicScene paused={paused} activeProject={activeProject} />
        </div>
        <div className="cinema-hero-shade" aria-hidden="true" />
        <div className="cinema-hero-copy cinema-container">
          <h1 id="hero-title"><span>{t("title1")}</span><span>{t("title2")} {t("title3")}</span></h1>
          <div className="hero-description"><p>{t("subtitle")}</p><a className="cinema-link" href="#portfolio">{t("cta_secondary")}<ArrowUpRight aria-hidden="true" size={20} /></a></div>
        </div>
        <div className="gallery-project-dock cinema-container">
          <div className="gallery-dock-caption"><p>{t("work_label")}</p><button className="hero-motion-control" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}{t(paused ? "play" : "pause")}</button></div>
          <nav aria-label={t("project_navigation")} className="gallery-project-links">
            {exhibits.map((project,index) => <a key={project.id} href={`#project-${project.id}`} onPointerEnter={() => setActiveProject(project.id)} onPointerLeave={() => setActiveProject(null)} onFocus={() => setActiveProject(project.id)} onBlur={() => setActiveProject(null)}><span>{project.title}</span><small aria-hidden="true">{String(index+1).padStart(2,"0")}</small><ArrowUpRight className="gallery-project-arrow" size={16} aria-hidden="true" /></a>)}
          </nav>
        </div>
      </div>
    </section>
  );
}
