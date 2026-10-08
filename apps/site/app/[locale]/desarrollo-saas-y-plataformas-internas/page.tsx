import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const spanish = {
  eyebrow: "Kershell TI · SaaS y plataformas internas",
  title: "Desarrollo de SaaS y plataformas internas para empresas",
  lead: "Construimos el software que conecta personas, datos y reglas de negocio cuando una operación necesita dejar de depender de herramientas genéricas.",
  sections: [
    ["Un SaaS no empieza por las pantallas", "Definimos el producto alrededor de usuarios, permisos, datos, integraciones y reglas que deben mantenerse consistentes a medida que el negocio crece."],
    ["Plataformas que el equipo adopta", "Portales para clientes o proveedores, backoffice, dashboards, workflows y automatizaciones. Cada módulo responde a una decisión operativa concreta."],
    ["Preparado para evolucionar", "La arquitectura no obliga a elegir entre rapidez y futuro: entregamos una primera versión útil y una base que permite sumar procesos, equipos e integraciones sin rehacerlo todo."],
  ],
  cta: "Hablemos de la plataforma que tu operación necesita.",
  button: "Contarnos el problema",
};

const english = {
  eyebrow: "Kershell TI · SaaS and internal platforms",
  title: "SaaS and internal platform development for companies",
  lead: "We build the software that connects people, data, and business rules when an operation needs to move beyond generic tools.",
  sections: [
    ["A SaaS product does not start with screens", "We define the product around users, permissions, data, integrations, and rules that must stay consistent as the business grows."],
    ["Platforms teams actually adopt", "Customer and supplier portals, backoffice systems, dashboards, workflows, and automation. Every module serves a specific operating decision."],
    ["Built to evolve", "The architecture does not force a choice between speed and the future: we deliver a useful first version and a base that can absorb processes, teams, and integrations without starting again."],
  ],
  cta: "Let us discuss the platform your operation needs.",
  button: "Tell us the problem",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isSpanish = locale === "es";
  return {
    title: isSpanish ? "Desarrollo de SaaS y plataformas internas" : "SaaS and internal platform development",
    description: isSpanish ? "Desarrollo de SaaS, portales y plataformas internas para empresas que necesitan conectar procesos, datos y equipos." : "SaaS, portal, and internal platform development for companies that need to connect processes, data, and teams.",
    alternates: { canonical: "/es/desarrollo-saas-y-plataformas-internas" },
    robots: isSpanish ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function SaaSPlatformsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const copy = locale === "es" ? spanish : english;
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink pt-16">
        <section className="console-section border-b border-border"><div className="console-container max-w-5xl"><p className="font-mono text-eyebrow uppercase text-accent">{copy.eyebrow}</p><h1 className="mt-6 max-w-4xl text-[44px] font-semibold leading-[1.02] tracking-[-0.035em] text-text md:text-display">{copy.title}</h1><p className="mt-7 max-w-3xl text-lead text-text-dim">{copy.lead}</p><Link href={`/${locale}#contact`} className="mt-9 inline-flex rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-ink">{copy.button} <span aria-hidden className="ml-2">→</span></Link></div></section>
        <section className="console-section"><div className="console-container grid gap-4 lg:grid-cols-3">{copy.sections.map(([title, description], index) => <article key={title} className="rounded-lg border border-border bg-surface p-7"><p className="font-mono text-eyebrow text-accent">0{index + 1}</p><h2 className="mt-7 text-h3 font-semibold text-text">{title}</h2><p className="mt-5 text-sm leading-relaxed text-text-dim">{description}</p></article>)}</div></section>
        <section className="console-section bg-surface"><div className="console-container max-w-4xl"><p className="font-mono text-eyebrow uppercase text-accent">Next step</p><h2 className="mt-5 text-h2 font-semibold text-text">{copy.cta}</h2><Link href={`/${locale}#contact`} className="mt-8 inline-flex rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-ink">{copy.button} <span aria-hidden className="ml-2">→</span></Link></div></section>
      </main>
      <Footer />
    </>
  );
}
