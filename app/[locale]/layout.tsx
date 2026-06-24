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

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://kershell.io");

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

function JsonLd({ locale }: { locale: string }) {
  const isEs = locale === "es";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl.origin}/#organization`,
    name: "Kershell TI",
    alternateName: ["Dr. Kershell TI", "Kershell TI"],
    description: isEs
      ? "Ingeniería senior para sistemas empresariales, SaaS e IA aplicada"
      : "Senior engineering for enterprise systems, SaaS, and applied AI",
    url: siteUrl.origin,
    logo: `${siteUrl.origin}/favicon.svg`,
    foundingDate: "2026",
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: 2,
    },
    knowsAbout: [
      "Enterprise software engineering",
      "Professional SaaS development",
      "Applied AI systems",
      "Real-time AI analytics",
      "Internal IT platforms",
      "Operational automation",
      "Banking software",
      "Logistics software",
      "Technical architecture",
    ],
    slogan: isEs
      ? "Sistemas empresariales, SaaS e IA aplicada para problemas complejos."
      : "Enterprise systems, SaaS, and applied AI for complex problems.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@heykershell.com",
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
    "@id": `${siteUrl.origin}/#website`,
    name: "Kershell TI",
    url: siteUrl.origin,
    inLanguage: isEs ? "es" : "en",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl.origin}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteUrl.origin}/${locale}#services`,
    serviceType: "Enterprise software engineering, SaaS development, and applied AI systems",
    provider: {
      "@type": "Organization",
      "@id": `${siteUrl.origin}/#organization`,
      name: "Kershell TI",
    },
    description: isEs
      ? "Desarrollo de SaaS, sistemas TI internos, motores de IA y plataformas empresariales complejas"
      : "SaaS development, internal IT systems, AI engines, and complex enterprise platforms",
    areaServed: "Worldwide",
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Large companies, enterprise teams, operations teams, technology leaders, SaaS founders",
    },
    keywords: [
      "enterprise systems",
      "professional SaaS",
      "applied AI",
      "real-time AI analytics",
      "internal IT systems",
      "AI engines",
      "operational automation",
      "technical architecture",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: isEs ? "Servicios de Consultoría" : "Consulting Services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Custom SaaS Development" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Real-Time Applied AI" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Internal IT Systems with AI" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Operational Automation" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Architecture & Technical Leadership" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "High-Impact Web Platforms" } },
      ],
    },
  };

  const portfolioSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${siteUrl.origin}/${locale}#public-portfolio`,
    name: isEs ? "Casos públicos de Kershell TI" : "Kershell TI public portfolio",
    itemListElement: [
      {
        "@type": "CreativeWork",
        position: 1,
        name: "SpecOps",
        url: "https://specops.kershell.dev/",
        description: isEs
          ? "Plataforma interna de desarrollo orquestada por IA con análisis de código, PRs automáticos y streaming en tiempo real."
          : "Internal AI-orchestrated development operations platform with code analysis, automated PRs, and real-time streaming.",
      },
      {
        "@type": "CreativeWork",
        position: 2,
        name: "Live Match Analytics",
        url: "https://analytics.kershell.dev/",
        description: isEs
          ? "Motor de análisis de fútbol en tiempo real con ingesta de datos, detección de eventos e insights generados por IA."
          : "Real-time football analytics engine with live data ingestion, event detection, and AI-powered insights.",
      },
      {
        "@type": "CreativeWork",
        position: 3,
        name: "Campos Inmobiliaria",
        url: "https://www.camposinmobiliaria.com/",
        description: isEs
          ? "Plataforma web inmobiliaria con listados, búsqueda avanzada y captación de leads."
          : "Real estate web platform with listings, advanced search, and lead capture.",
      },
      {
        "@type": "CreativeWork",
        position: 4,
        name: "PJ Tornquist",
        url: "https://www.pjtornquist.ar/",
        description: isEs
          ? "Portal institucional y de noticias con gestión de contenido y presencia digital."
          : "Institutional news portal with content management and digital presence.",
      },
      {
        "@type": "CreativeWork",
        position: 5,
        name: "Salones de Fiestas",
        url: "https://salonesdefiestas.ar/",
        description: isEs
          ? "Marketplace nacional para espacios y proveedores de eventos."
          : "National marketplace for event venues and providers.",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl.origin}/${locale}#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: isEs
          ? "¿Qué es Kershell TI?"
          : "What is Kershell TI?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isEs
            ? "Kershell TI es un estudio de ingeniería de software fundado por dos senior developers con más de 7 años construyendo sistemas en banca, logística y operaciones críticas. Usa IA como acelerador interno para entregar software enterprise a velocidad de startup."
            : "Kershell TI is a software engineering studio founded by two senior developers with 7+ years building systems in banking, logistics, and critical operations. It uses AI as an internal accelerator to deliver enterprise-grade software at startup speed.",
        },
      },
      {
        "@type": "Question",
        name: isEs
          ? "¿Para qué tipo de empresa es Kershell TI?"
          : "What type of company is Kershell TI for?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isEs
            ? "Kershell TI trabaja con empresas que tienen un problema técnico real: su primer SaaS, una plataforma interna con IA o un sistema legacy que necesita modernizarse. Atiende empresas medianas, equipos de innovación, líderes de operaciones y founders B2B."
            : "Kershell TI works with companies that have a real technical problem to solve: a first SaaS product, an internal AI platform, or a legacy system that needs modernization. It serves mid-market companies, innovation teams, operations leaders, and B2B founders.",
        },
      },
      {
        "@type": "Question",
        name: isEs
          ? "¿Qué diferencia a Kershell TI de una agencia tradicional?"
          : "How is Kershell TI different from a traditional agency?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isEs
            ? "Kershell TI no vende pantallas: construye productos que operan. Trabaja sin capas de account managers o coordinadores, con dos ingenieros senior tomando decisiones técnicas directas e IA acelerando la ejecución."
            : "Kershell TI does not sell screens: it builds operating products. It works without account-manager layers or project coordinators, with two senior engineers making direct technical decisions and AI accelerating execution.",
        },
      },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
    <html lang={locale} className={`${geist.variable} ${geistMono.variable} dark`}>
      <head>
        <link rel="alternate" type="text/plain" title="LLMs.txt" href="/llms.txt" />
        <JsonLd locale={locale} />
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
