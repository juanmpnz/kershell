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
    <section className="relative overflow-hidden border-y border-white/[0.07] bg-[#12121A] py-7 sm:py-9">
      <div className="mx-auto mb-5 max-w-7xl px-4 text-center sm:mb-6 sm:px-6 lg:px-10">
        <p className="text-[0.65rem] font-semibold uppercase leading-relaxed tracking-[0.12em] text-[#4B5563] sm:text-[0.7rem] sm:tracking-[0.18em]">
          {t("label")}
        </p>
      </div>

      {/* Fade masks */}
      <div className="pointer-events-none absolute left-0 top-1/2 z-10 h-full w-12 -translate-y-1/2 bg-gradient-to-r from-[#12121A] to-transparent sm:w-28" />
      <div className="pointer-events-none absolute right-0 top-1/2 z-10 h-full w-12 -translate-y-1/2 bg-gradient-to-l from-[#12121A] to-transparent sm:w-28" />

      <div className="flex overflow-hidden">
        <div className="flex animate-scroll-left gap-3 whitespace-nowrap">
          {TECHS.map((tech, i) => (
            <div
              key={`${tech}-${i}`}
              className="flex select-none items-center rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-xs font-medium text-[#4B5563] sm:px-5 sm:text-sm"
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
