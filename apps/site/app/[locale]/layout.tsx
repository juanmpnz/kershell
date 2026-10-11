import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { routing } from "@/i18n/routing";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.heykershell.com");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });

  const isEs = locale === "es";

  return {
    metadataBase: siteUrl,
    title: "Kershell TI | Enterprise Systems, SaaS & Applied AI",
    description: isEs
      ? "Ingeniería senior para SaaS profesionales, sistemas TI internos, motores de IA en tiempo real y plataformas empresariales complejas."
      : "Senior software engineering for professional SaaS, internal IT systems, real-time AI engines, and complex enterprise platforms.",
    keywords: [
      "software consulting",
      "AI development",
      "SaaS development",
      "enterprise systems",
      "real-time AI",
      "internal platforms",
      "AI engines",
      "IT consulting",
      "web development",
      "automation",
      "Kershell TI",
      "consultoría software",
      "desarrollo IA",
    ],
    authors: [{ name: "Kershell TI" }],
    creator: "Kershell TI",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      alternateLocale: locale === "es" ? "en_US" : "es_ES",
      title: "Kershell TI | Enterprise Systems, SaaS & Applied AI",
      description: isEs
        ? "SaaS profesionales, sistemas internos e IA aplicada para problemas empresariales complejos."
        : "Professional SaaS, internal systems, and applied AI for complex enterprise problems.",
      siteName: "Kershell TI",
      images: [
        {
          url: "/og/default.svg",
          width: 1200,
          height: 630,
          alt: "Kershell TI",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Kershell TI | Enterprise Systems, SaaS & Applied AI",
      description: isEs
        ? "SaaS profesionales, sistemas internos e IA aplicada."
        : "Professional SaaS, internal systems, and applied AI.",
      images: ["/og/default.svg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        es: "/es",
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "es")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${geist.variable} ${geistMono.variable} dark`}>
      <head>
        <link rel="alternate" type="text/plain" title="LLMs.txt" href="/llms.txt" />
      </head>
      <body className="bg-ink font-sans text-text antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
