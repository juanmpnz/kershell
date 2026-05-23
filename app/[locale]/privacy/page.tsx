import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("legal");

  return (
    <main className="min-h-screen bg-[#0A0A0F] pt-28 pb-16 sm:pt-32 sm:pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10">
        <h1 className="mb-8 text-3xl font-bold leading-tight text-white sm:text-4xl">
          {t("privacy_title")}
        </h1>
        <div className="prose prose-invert prose-sm max-w-none text-[#94A3B8] space-y-6">
          <p className="text-xs text-[#4B5563]">{t("last_updated")}: 2026-04-01</p>

          <h2 className="text-xl font-semibold text-white">{t("info_collect_title")}</h2>
          <p>{t("info_collect_body")}</p>

          <h2 className="text-xl font-semibold text-white">{t("info_use_title")}</h2>
          <p>{t("info_use_body")}</p>

          <h2 className="text-xl font-semibold text-white">{t("data_security_title")}</h2>
          <p>{t("data_security_body")}</p>

          <h2 className="text-xl font-semibold text-white">{t("contact_title")}</h2>
          <p>{t("contact_body")}</p>
        </div>
      </div>
    </main>
  );
}
