"use client";

import { useTranslations } from "next-intl";

type Step = { number: string; title: string; description: string };
export default function Process() {
  const t = useTranslations("process");
  const steps = t.raw("steps") as Step[];
  return (
    <section id="process" className="cinema-section cinema-process">
      <div className="cinema-container"><p className="cinema-label">{t("badge")}</p><h2 className="cinema-heading">{t("title")}</h2><p className="process-intro">{t("subtitle")}</p>
        <ol className="process-steps">{steps.map(step => (
          <li key={step.number}><span className="process-number" aria-hidden="true">{step.number}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></li>
        ))}</ol>
      </div>
    </section>
  );
}
