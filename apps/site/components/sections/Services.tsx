"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

type ServiceItem = { title: string; description: string; tag: string };
export default function Services() {
  const t = useTranslations("services");
  const items = t.raw("items") as ServiceItem[];
  return (
    <section id="services" className="cinema-section cinema-capabilities">
      <div className="cinema-container capabilities-layout">
        <div className="capabilities-intro"><p className="cinema-label">{t("badge")}</p><h2 className="cinema-heading">{t("title")}</h2><p>{t("subtitle")}</p></div>
        <div className="capabilities-list">{items.map((item, index) => (
          <details key={item.title} className="capability">
            <summary><span className="capability-number">{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><Plus aria-hidden="true" size={22} /></summary>
            <div className="capability-body"><span>{item.tag}</span><p>{item.description}</p></div>
          </details>
        ))}</div>
      </div>
    </section>
  );
}
