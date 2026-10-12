import { getTranslations } from "next-intl/server";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.heykershell.com");

export default async function HomeJsonLd({ locale }: { locale: string }) {
  const isEs = locale === "es";
  const translations = await getTranslations({ locale, namespace: "aeo" });
  const portfolioTranslations = await getTranslations({ locale, namespace: "portfolio" });
  const projects = portfolioTranslations.raw("items") as Array<{ id: string; title: string; description: string; url: string | null }>;
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
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: project.title,
        description: project.description,
        url: project.url ?? `${siteUrl.origin}/${locale}#portfolio`,
      },
    })),
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
