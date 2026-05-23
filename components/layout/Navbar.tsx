"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

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

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  const switchLocale = () => {
    const next = locale === "en" ? "es" : "en";
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    setMobileOpen(false);
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
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10 lg:py-4">
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="flex min-w-0 items-center gap-2.5 sm:gap-3"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#6C63FF]">
            <span className="text-[11px] font-extrabold text-white leading-none">K</span>
          </div>
          <span className="truncate text-sm font-bold uppercase tracking-[0.1em] text-white">
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
            className="rounded border border-white/[0.1] px-3 py-1.5 text-xs font-semibold text-[#94A3B8] tracking-widest uppercase transition-all hover:border-white/25 hover:text-white"
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
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="relative z-[70] flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.07] bg-[#0A0A0F]/50 text-[#94A3B8] backdrop-blur transition-colors hover:border-white/15 hover:text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              aria-label="Close menu overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-[55] cursor-default bg-black/55 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-[60] flex h-[100svh] w-full max-w-[22rem] flex-col border-r border-white/[0.08] bg-[#0A0A0F] shadow-2xl shadow-black/50 md:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-[#6C63FF]">
                    <span className="text-xs font-extrabold leading-none text-white">K</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold uppercase tracking-[0.1em] text-white">
                      Kershell
                    </div>
                    <div className="mt-0.5 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#4B5563]">
                      AI + Human Expertise
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between overflow-y-auto px-5 pb-6 pt-8">
                <nav className="space-y-2">
                  {NAV_LINKS.map((link, index) => (
                    <motion.button
                      key={link.key}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.28, delay: 0.08 + index * 0.04 }}
                      onClick={() => scrollTo(link.href)}
                      className="group flex w-full items-center justify-between rounded-xl border border-transparent px-4 py-4 text-left text-lg font-semibold text-[#F1F5F9] transition-all hover:border-white/[0.07] hover:bg-white/[0.04]"
                    >
                      <span>{t(link.key)}</span>
                      <ArrowRight className="h-4 w-4 text-[#4B5563] transition-all group-hover:translate-x-1 group-hover:text-[#6C63FF]" />
                    </motion.button>
                  ))}
                </nav>

                <div className="space-y-4 border-t border-white/[0.07] pt-5">
                  <button
                    onClick={() => scrollTo("#contact")}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#6C63FF] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5A52E0]"
                  >
                    {t("cta")}
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={switchLocale}
                    className="flex min-h-11 w-full items-center justify-center rounded-lg border border-white/[0.1] px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-[#94A3B8] transition-all hover:border-white/25 hover:text-white"
                  >
                    {locale === "en" ? "Español" : "English"}
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
