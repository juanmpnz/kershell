"use client";

import { useLocale, useTranslations } from "next-intl";
import { Linkedin, Mail } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export default function Footer() {
  const t = useTranslations("footer");
  const navT = useTranslations("nav");
  const locale = useLocale();

  const navLinks = [
    { label: navT("services"), href: "#services" },
    { label: navT("process"), href: "#process" },
    { label: navT("portfolio"), href: "#portfolio" },
    { label: navT("why"), href: "#why" },
    { label: navT("contact"), href: "#contact" },
  ];

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border bg-surface">
      <div className="console-container py-14">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Logo href={`/${locale}`} size={20} />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-text-dim">{t("tagline")}</p>
            <span className="mt-5 inline-flex rounded-full border border-accent bg-accent-soft px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
              AI + human expertise
            </span>
            <div className="mt-6 flex items-center gap-2">
              {[
                { icon: Linkedin, href: "https://linkedin.com/company/kershell-ti", label: "Kershell on LinkedIn" },
                { icon: Mail, href: "mailto:info@heykershell.com", label: "Email Kershell" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={href}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              {t("links")}
            </h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-sm text-text-dim transition-colors hover:text-accent"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              {t("legal")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href={`/${locale}/privacy`} className="text-sm text-text-dim transition-colors hover:text-accent">
                  {t("privacy")}
                </a>
              </li>
              <li>
                <a href={`/${locale}/terms`} className="text-sm text-text-dim transition-colors hover:text-accent">
                  {t("terms")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-border pt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-muted md:flex-row">
          <p>&copy; {new Date().getFullYear()} Kershell. {t("copyright")}</p>
          <p>v0.console</p>
        </div>
      </div>
    </footer>
  );
}
