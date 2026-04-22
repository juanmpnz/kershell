"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { key: "services", href: "#services" },
  { key: "portfolio", href: "#portfolio" },
  { key: "process", href: "#process" },
  { key: "contact", href: "#contact" },
] as const;

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const switchLocale = () => {
    const next = locale === "en" ? "es" : "en";
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    router.push(`/${next}${pathWithoutLocale}`);
  };

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0A0F]/90 backdrop-blur-xl border-b border-white/[0.07]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="flex items-center gap-3"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#6C63FF]">
            <span className="font-[var(--font-syne)] text-[11px] font-black text-white leading-none">K</span>
          </div>
          <span className="font-[var(--font-syne)] text-sm font-bold tracking-[0.1em] text-white uppercase">
            Kershell
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.key}
              onClick={() => scrollTo(link.href)}
              className="text-sm font-medium text-[#94A3B8] transition-colors hover:text-white"
            >
              {t(link.key)}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={switchLocale}
            className="rounded border border-white/[0.1] px-3 py-1.5 font-[var(--font-syne)] text-xs font-semibold text-[#94A3B8] tracking-widest uppercase transition-all hover:border-white/25 hover:text-white"
          >
            {locale === "en" ? "ES" : "EN"}
          </button>

          <button
            onClick={() => scrollTo("#contact")}
            className="rounded bg-[#6C63FF] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5A52E0]"
          >
            {t("cta")}
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex md:hidden p-2 text-[#94A3B8] hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden bg-[#0A0A0F]/95 backdrop-blur-xl border-t border-white/[0.07] md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.key}
                  onClick={() => scrollTo(link.href)}
                  className="rounded-lg px-4 py-3 text-left text-sm text-[#94A3B8] transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  {t(link.key)}
                </button>
              ))}
              <div className="mt-3 flex items-center gap-3 pt-3 border-t border-white/[0.07]">
                <button
                  onClick={switchLocale}
                  className="rounded border border-white/[0.1] px-3 py-1.5 text-xs font-semibold text-[#94A3B8] uppercase tracking-widest"
                >
                  {locale === "en" ? "ES" : "EN"}
                </button>
                <button
                  onClick={() => scrollTo("#contact")}
                  className="flex-1 rounded bg-[#6C63FF] py-2 text-sm font-semibold text-white text-center"
                >
                  {t("cta")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
