import { getTranslations } from "next-intl/server";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.heykershell.com");

export default async function HomeJsonLd({ locale }: { locale: string }) {
  const isEs = locale === "es";
  const translations = await getTranslations({ locale, namespace: "aeo" });
  const answers = translations.raw("answers") as Array<{ question: string; answer: string }>;

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
    sameAs: ["https://linkedin.com/company/kershell"],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl.origin}/#website`,
    name: "Kershell TI",
    url: siteUrl.origin,
    inLanguage: isEs ? "es" : "en",
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
        name: "Ediflow",
        url: `${siteUrl.origin}/${locale}#portfolio`,
        description: isEs
          ? "Plataforma de gestión para administradores de fincas y comunidades: incidencias, presupuestos, decisiones, votaciones y derramas en un único flujo."
          : "Management platform for property managers and residential communities: incidents, quotes, decisions, votes, and assessments in one connected flow.",
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
    mainEntity: answers.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
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
