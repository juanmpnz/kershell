import type { Metadata } from "next";
import { useTranslations } from "next-intl";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isSpanish = locale === "es";
  const pagePath = `/${locale}/terms`;

  return {
    title: isSpanish ? "Términos del servicio | Kershell TI" : "Terms of service | Kershell TI",
    description: isSpanish ? "Condiciones que regulan el uso del sitio web y los servicios de Kershell TI." : "Terms governing the use of Kershell TI's website and services.",
    alternates: {
      canonical: pagePath,
      languages: {
        en: "/en/terms",
        es: "/es/terms",
      },
    },
  };
}

export default function TermsPage() {
  const t = useTranslations("legal");

  return (
    <main className="min-h-screen bg-[#0A0A0F] pt-28 pb-16 sm:pt-32 sm:pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10">
        <h1 className="mb-8 text-3xl font-bold leading-tight text-white sm:text-4xl">
          {t("terms_title")}
        </h1>
        <div className="prose prose-invert prose-sm max-w-none text-[#94A3B8] space-y-6">
          <p className="text-xs text-[#4B5563]">{t("last_updated")}: 2026-04-01</p>

          <h2 className="text-xl font-semibold text-white">{t("acceptance_title")}</h2>
          <p>{t("acceptance_body")}</p>

          <h2 className="text-xl font-semibold text-white">{t("services_title")}</h2>
          <p>{t("services_body")}</p>

          <h2 className="text-xl font-semibold text-white">{t("liability_title")}</h2>
          <p>{t("liability_body")}</p>

          <h2 className="text-xl font-semibold text-white">{t("governing_title")}</h2>
          <p>{t("governing_body")}</p>
        </div>
      </div>
    </main>
  );
}
