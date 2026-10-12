"use client";

import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

export default function WhyKershell() {
  const t = useTranslations("studio");
  return (
    <section id="why" className="cinema-section cinema-studio">
      <div className="cinema-container">
        <p className="cinema-label">{t("badge")}</p>
        <h2 className="studio-statement">{t("title1")} <span>{t("title2")}</span></h2>
        <div className="studio-bottom"><span className="studio-word" aria-hidden="true">kershell<span>_</span></span><div><p>{t("description")}</p><a className="cinema-link" href="#contact">{t("cta")}<ArrowUpRight aria-hidden="true" size={20} /></a></div></div>
      </div>
    </section>
  );
}
