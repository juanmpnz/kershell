"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@kershell/ui/logo";

const NAV_LINKS = [
  { key: "portfolio", href: "#portfolio" },
  { key: "why", href: "#why" },
] as const;

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setMobileOpen(false); menuButtonRef.current?.focus(); } };
    window.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [mobileOpen]);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      return;
    }
    router.push(`/${locale}${href}`);
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
    <header className="cinema-nav fixed inset-x-0 top-0 z-50">
      <nav className="cinema-container flex h-16 items-center justify-between gap-6">
        <Logo href={`/${locale}`} size={28} />

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.key}
              onClick={() => scrollTo(link.href)}
              className="text-[13px] text-text-dim transition-colors hover:text-accent"
            >
              {t(link.key)}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={switchLocale}
            aria-label={t("switch_language")}
            className="cinema-nav-language"
          >
            {languageLabel}
          </button>
          <button className="cinema-nav-cta" onClick={() => scrollTo("#contact")}>
            {t("cta")}<ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </div>

        <button
          ref={menuButtonRef}
          aria-controls="mobile-navigation"
          aria-label={t(mobileOpen ? "close_menu" : "open_menu")}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-text-dim transition-colors hover:border-accent hover:text-accent md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen ? (
        <div id="mobile-navigation" className="border-t border-border bg-ink md:hidden">
          <div className="cinema-container flex flex-col gap-2 py-5">
            {NAV_LINKS.map((link) => (
              <button
                key={link.key}
                onClick={() => scrollTo(link.href)}
                className="rounded-md px-2 py-3 text-left text-sm text-text-dim hover:bg-surface hover:text-text"
              >
                {t(link.key)}
              </button>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                onClick={switchLocale}
                aria-label={t("switch_language")}
                className="rounded-md border border-border px-3 py-3 text-[11px] uppercase tracking-[0.16em] text-text-dim"
              >
                {languageLabel}
              </button>
              <button className="cinema-nav-cta" onClick={() => scrollTo("#contact")}>
                {t("cta")}<ArrowUpRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
