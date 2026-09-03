"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@kershell/ui/logo";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { key: "services", href: "#services" },
  { key: "process", href: "#process" },
  { key: "portfolio", href: "#portfolio" },
  { key: "why", href: "#why" },
  { key: "contact", href: "#contact" },
] as const;

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const switchLocale = () => {
    const next = locale === "en" ? "es" : "en";
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    setMobileOpen(false);
    router.push(`/${next}${pathWithoutLocale}`);
  };
  const languageLabel = locale === "en" ? "EN - ES" : "ES - EN";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-ink/70 backdrop-blur-md">
      <nav className="console-container flex h-16 items-center justify-between gap-6">
        <Logo href={`/${locale}`} size={22} />

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.key}
              onClick={() => scrollTo(link.href)}
              className="font-mono text-[13px] text-text-dim transition-colors hover:text-accent"
            >
              {t(link.key)}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={switchLocale}
            aria-label={`${languageLabel} switch language`}
            className="rounded-md border border-border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-dim transition-colors hover:border-accent hover:text-accent"
          >
            {languageLabel}
          </button>
          <Button variant="primary" arrow onClick={() => scrollTo("#contact")}>
            {t("cta")}
          </Button>
        </div>

        <button
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-text-dim transition-colors hover:border-accent hover:text-accent md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-border bg-ink md:hidden">
          <div className="console-container flex flex-col gap-2 py-5">
            {NAV_LINKS.map((link) => (
              <button
                key={link.key}
                onClick={() => scrollTo(link.href)}
                className="rounded-md px-2 py-3 text-left font-mono text-sm text-text-dim hover:bg-surface hover:text-text"
              >
                {t(link.key)}
              </button>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                onClick={switchLocale}
                aria-label={`${languageLabel} switch language`}
                className="rounded-md border border-border px-3 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-text-dim"
              >
                {languageLabel}
              </button>
              <Button variant="primary" arrow onClick={() => scrollTo("#contact")}>
                {t("cta")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
