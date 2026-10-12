"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

type Answer = { question: string; answer: string };
export default function AeoAnswerBlock() {
  const t = useTranslations("aeo");
  const answers = t.raw("answers") as Answer[];
  return (
    <section id="faq" className="cinema-section cinema-faq" aria-labelledby="aeo-title">
      <div className="cinema-container faq-layout"><div><p className="cinema-label">{t("badge")}</p><h2 id="aeo-title" className="cinema-heading">{t("title")}</h2><p>{t("summary")}</p></div>
        <div>{answers.map(item => <details key={item.question} className="capability"><summary><h3>{item.question}</h3><Plus size={20} aria-hidden="true" /></summary><p className="faq-answer">{item.answer}</p></details>)}</div>
      </div>
    </section>
  );
}
