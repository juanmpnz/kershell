"use client";

import { useTranslations } from "next-intl";

const TECHS = [
  "React", "Next.js", "TypeScript", "Python", "Node.js",
  "PostgreSQL", "AWS", "OpenAI", "Tailwind CSS", "Docker",
  "Prisma", "Vercel", "Redis", "GraphQL", "FastAPI",
  "React", "Next.js", "TypeScript", "Python", "Node.js",
  "PostgreSQL", "AWS", "OpenAI", "Tailwind CSS", "Docker",
  "Prisma", "Vercel", "Redis", "GraphQL", "FastAPI",
];

export default function ProofBar() {
  const t = useTranslations("proof_bar");

  return (
    <section className="relative border-y border-white/[0.07] bg-[#12121A] py-9 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 mb-6 text-center">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#4B5563]">
          {t("label")}
        </p>
      </div>

      {/* Fade masks */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-28 h-full bg-gradient-to-r from-[#12121A] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-28 h-full bg-gradient-to-l from-[#12121A] to-transparent z-10 pointer-events-none" />

      <div className="flex overflow-hidden">
        <div className="flex animate-scroll-left gap-3 whitespace-nowrap">
          {TECHS.map((tech, i) => (
            <div
              key={`${tech}-${i}`}
              className="flex items-center rounded-full border border-white/[0.07] bg-white/[0.03] px-5 py-2 text-sm font-medium text-[#4B5563] select-none"
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
