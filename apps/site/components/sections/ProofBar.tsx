"use client";

import { useTranslations } from "next-intl";
import { Eyebrow } from "@kershell/ui/eyebrow";

const TECHS = [
  "React",
  "Next.js",
  "TypeScript",
  "Python",
  "Node.js",
  "PostgreSQL",
  "AWS",
  "OpenAI",
  "Tailwind CSS",
  "Docker",
  "Prisma",
  "Vercel",
  "Redis",
  "GraphQL",
  "FastAPI",
];

export default function ProofBar() {
  const t = useTranslations("proof_bar");
  const loop = [...TECHS, ...TECHS];

  return (
    <section className="overflow-hidden border-b border-border bg-ink py-10">
      <div className="console-container mb-5">
        <Eyebrow>{t("label")}</Eyebrow>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink to-transparent" />
        <div className="flex overflow-hidden">
          <div className="animate-marquee flex min-w-max gap-3 whitespace-nowrap px-3">
            {loop.map((tech, index) => (
              <span
                key={`${tech}-${index}`}
                className="select-none rounded-md border border-border bg-surface px-4 py-2.5 font-mono text-sm text-text-dim"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
