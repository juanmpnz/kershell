"use client";

import { useTranslations, useLocale } from "next-intl";
import { Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  const navLinks = [
    { label: "Services", href: "#services" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Process", href: "#process" },
    { label: "Contact", href: "#contact" },
  ];

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-white/[0.07] bg-[#0A0A0F]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-10">
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 md:grid-cols-3 md:gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-[#6C63FF]">
                <span className="text-[11px] font-extrabold text-white leading-none">K</span>
              </div>
              <span className="text-sm font-bold tracking-[0.1em] text-white uppercase">
                Kershell
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[#4B5563]">
              {t("tagline")}
            </p>
            <div className="flex items-center gap-2.5">
              {[
                { icon: Linkedin, href: "https://linkedin.com" },
                { icon: Github, href: "https://github.com" },
                { icon: Mail, href: "mailto:kershellit@gmail.com" },
              ].map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] text-[#4B5563] transition-all hover:border-[#6C63FF]/35 hover:text-[#6C63FF]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-4 text-[0.7rem] font-semibold text-[#4B5563] uppercase tracking-[0.14em]">
              {t("links")}
            </h4>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-sm text-[#4B5563] transition-colors hover:text-[#94A3B8]"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-[0.7rem] font-semibold text-[#4B5563] uppercase tracking-[0.14em]">
              {t("legal")}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href={`/${locale}/privacy`} className="text-sm text-[#4B5563] transition-colors hover:text-[#94A3B8]">
                  {t("privacy")}
                </a>
              </li>
              <li>
                <a href={`/${locale}/terms`} className="text-sm text-[#4B5563] transition-colors hover:text-[#94A3B8]">
                  {t("terms")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/[0.07] pt-7 sm:mt-12 sm:pt-8 md:flex-row md:items-center">
          <p className="text-xs leading-relaxed text-[#4B5563]">
            &copy; {new Date().getFullYear()} Kershell. {t("copyright")}
          </p>
          <span className="text-xs uppercase tracking-wider text-[#6C63FF]">
            AI + Human Expertise
          </span>
        </div>
      </div>
    </footer>
  );
}
