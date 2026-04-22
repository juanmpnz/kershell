import type { Metadata } from "next";
import { Inter, Syne, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { routing } from "@/i18n/routing";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });

  const isEs = locale === "es";

  return {
    title: "Kershell TI | AI-Powered Software Consulting — Velocity, Quality, Security",
    description: isEs
      ? "Consultoría de software empresarial acelerada por IA. SaaS, plataformas web y automatización. Entrega 3× más rápida con revisión humana."
      : "Enterprise software consulting accelerated by AI. Custom SaaS, web platforms, and automation. 3x faster delivery, human-reviewed quality.",
    keywords: [
      "software consulting",
      "AI development",
      "SaaS development",
      "IT consulting",
      "web development",
      "automation",
      "Kershell TI",
      "consultoría software",
      "desarrollo IA",
    ],
    authors: [{ name: "Kershell TI" }],
    creator: "Kershell TI",
    openGraph: {
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      alternateLocale: locale === "es" ? "en_US" : "es_ES",
      title: "Kershell TI | AI-Powered Software Consulting",
      description: isEs
        ? "Consultoría de software empresarial acelerada por IA. Velocidad, Calidad, Seguridad."
        : "Enterprise software consulting accelerated by AI. Velocity, Quality, Security.",
      siteName: "Kershell TI",
    },
    twitter: {
      card: "summary_large_image",
      title: "Kershell TI | AI-Powered Software Consulting",
      description: isEs
        ? "Consultoría de software empresarial acelerada por IA."
        : "Enterprise software consulting accelerated by AI.",
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

function JsonLd({ locale }: { locale: string }) {
  const isEs = locale === "es";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kershell TI",
    description: isEs
      ? "Consultoría de software empresarial acelerada por IA"
      : "Enterprise software consulting accelerated by AI",
    url: "https://kershell.io",
    logo: "https://kershell.io/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@kershell.io",
      contactType: "sales",
      availableLanguage: ["English", "Spanish"],
    },
    sameAs: [
      "https://linkedin.com/company/kershell",
      "https://github.com/kershell",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kershell TI",
    url: "https://kershell.io",
    inLanguage: isEs ? "es" : "en",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://kershell.io/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Software Consulting",
    provider: {
      "@type": "Organization",
      name: "Kershell TI",
    },
    description: isEs
      ? "Desarrollo de software, integración de IA, automatización y consultoría TI"
      : "Software development, AI integration, automation, and IT consulting",
    areaServed: "Worldwide",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: isEs ? "Servicios de Consultoría" : "Consulting Services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Custom SaaS Development" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Integration & Automation" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Web Presence & Landing Pages" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Process Automation" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "IT Project Management" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Market Analysis & Outreach" } },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  );
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
    <html lang={locale} className="dark">
      <head>
        <JsonLd locale={locale} />
      </head>
      <body
        className={`${inter.variable} ${syne.variable} ${jetbrainsMono.variable} font-[var(--font-inter)] bg-[#0A0A0F] text-white antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
