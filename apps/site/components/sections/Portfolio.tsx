"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

export type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  url: string | null;
  urlLabel: string;
  cta: string;
};

export default function Portfolio() {
  const t = useTranslations("portfolio");
  const items = t.raw("items") as PortfolioItem[];
  return (
    <section id="portfolio" className="cinema-work" aria-labelledby="work-title">
      <div className="cinema-container work-intro">
        <p className="cinema-label">{t("badge")} / 04</p>
        <div><h2 id="work-title" className="cinema-heading">{t("title")}</h2><p>{t("subtitle")}</p></div>
      </div>
      <div className="cinema-container">
        {items.map((item, index) => (
          <article id={`project-${item.id}`} key={item.id} className={`cinema-project project-${item.id}`}>
            <div className="project-art">
              <Image src={`/art/${item.id}.webp`} alt="" fill sizes="(max-width: 767px) 100vw, 65vw" />
              <span className="project-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="project-copy">
              <p className="cinema-label">{item.category}</p>
              <h3>{item.title}</h3>
              <p className="project-description">{item.description}</p>
              <ul className="project-tags" aria-label={t("categories_label")}>
                {item.tags.map(tag => <li key={tag}>{tag}</li>)}
              </ul>
              {item.url ? <a className="cinema-link" href={item.url} target="_blank" rel="noopener noreferrer">{item.cta}<ArrowUpRight aria-hidden="true" size={20} /><span className="sr-only"> ({item.urlLabel})</span></a> : <p className="project-status">{t("in_development")}</p>}
            </div>
          </article>
        ))}
        <p className="work-note">{t("nda_note")}</p>
      </div>
    </section>
  );
}
