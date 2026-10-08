import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const spanish = {
  eyebrow: "Kershell TI · Barcelona",
  title: "Desarrollo de software a medida para empresas en Barcelona",
  lead: "Diseñamos y construimos plataformas, SaaS y herramientas internas para empresas que necesitan ordenar una operación real, no solo renovar una pantalla.",
  problemTitle: "Cuando el problema ya no se resuelve con otra hoja de cálculo",
  problems: [
    "Información crítica repartida entre Excel, correos, WhatsApp y varias herramientas.",
    "Un proceso operativo depende de seguimientos manuales y conocimiento disperso.",
    "Necesitás un portal, SaaS o sistema interno con reglas, usuarios e integraciones propias.",
  ],
  approachTitle: "Un equipo senior, de problema a sistema operativo",
  approach: "Trabajamos desde Barcelona con empresas que necesitan una solución a medida: mapeamos el flujo, definimos datos, permisos e integraciones, y entregamos iteraciones que el equipo puede usar y medir. La IA acelera nuestro trabajo cuando aporta valor; la arquitectura y las decisiones siguen teniendo revisión senior.",
  proofTitle: "Un ejemplo: Ediflow",
  proof: "Ediflow conecta incidencias, presupuestos comparables, decisiones, votaciones, derramas y ejecución para administradores de fincas y comunidades. No es una colección de pantallas: cada caso conserva el contexto desde que aparece el problema hasta el cierre.",
  ctaTitle: "¿Tenés un proceso que ya pide software propio?",
  cta: "Contanos el contexto en una primera conversación de 20 minutos.",
  ctaButton: "Evaluar mi proyecto",
};

const english = {
  eyebrow: "Kershell TI · Barcelona",
  title: "Custom software development for companies in Barcelona",
  lead: "We design and build platforms, SaaS products, and internal tools for companies that need to bring order to real operations, not simply refresh a screen.",
  problemTitle: "When another spreadsheet is no longer the answer",
  problems: [
    "Critical information is split across spreadsheets, email, WhatsApp, and disconnected tools.",
    "An operational process relies on manual follow-up and scattered knowledge.",
    "You need a portal, SaaS product, or internal system with your own rules, users, and integrations.",
  ],
  approachTitle: "A senior team, from problem to operating system",
  approach: "From Barcelona, we work with companies that need a tailored solution: we map the flow, define data, permissions, and integrations, then ship iterations the team can use and measure. AI accelerates our work where it adds value; architecture and decisions remain senior-reviewed.",
  proofTitle: "One example: Ediflow",
  proof: "Ediflow connects incidents, comparable quotes, decisions, votes, assessments, and execution for property managers and communities. It is not a collection of screens: each case keeps its context from the first issue through to closure.",
  ctaTitle: "Do you have a process that needs its own software?",
  cta: "Tell us the context in a first 20-minute conversation.",
  ctaButton: "Discuss your project",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isSpanish = locale === "es";

  return {
    title: isSpanish
      ? "Desarrollo de software a medida en Barcelona"
      : "Custom software development in Barcelona",
    description: isSpanish
      ? "Kershell TI diseña SaaS, plataformas internas y automatización para empresas en Barcelona con operaciones complejas."
      : "Kershell TI designs SaaS products, internal platforms, and automation for companies in Barcelona with complex operations.",
    alternates: { canonical: "/es/desarrollo-software-a-medida-barcelona" },
    robots: isSpanish ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function CustomSoftwareBarcelonaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const copy = locale === "es" ? spanish : english;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink pt-16">
        <section className="console-section border-b border-border">
          <div className="console-container max-w-5xl">
            <p className="font-mono text-eyebrow uppercase text-accent">{copy.eyebrow}</p>
            <h1 className="mt-6 max-w-4xl text-[44px] font-semibold leading-[1.02] tracking-[-0.035em] text-text md:text-display">{copy.title}</h1>
            <p className="mt-7 max-w-3xl text-lead text-text-dim">{copy.lead}</p>
            <Link href={`/${locale}#contact`} className="mt-9 inline-flex rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90">
              {copy.ctaButton} <span aria-hidden className="ml-2">→</span>
            </Link>
          </div>
        </section>
        <section className="console-section">
          <div className="console-container grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <p className="font-mono text-eyebrow uppercase text-accent">01 · Context</p>
              <h2 className="mt-5 text-h2 font-semibold text-text">{copy.problemTitle}</h2>
            </div>
            <ul className="space-y-4">
              {copy.problems.map((problem) => <li key={problem} className="border-l border-accent pl-5 text-lead text-text-dim">{problem}</li>)}
            </ul>
          </div>
        </section>
        <section className="console-section bg-surface">
          <div className="console-container grid gap-12 lg:grid-cols-2">
            <article><p className="font-mono text-eyebrow uppercase text-accent">02 · Approach</p><h2 className="mt-5 text-h2 font-semibold text-text">{copy.approachTitle}</h2><p className="mt-6 text-lead text-text-dim">{copy.approach}</p></article>
            <article className="rounded-lg border border-border bg-ink p-7"><p className="font-mono text-eyebrow uppercase text-accent">03 · Product case</p><h2 className="mt-5 text-h3 font-semibold text-text">{copy.proofTitle}</h2><p className="mt-5 text-sm leading-relaxed text-text-dim">{copy.proof}</p></article>
          </div>
        </section>
        <section className="console-section">
          <div className="console-container max-w-4xl"><p className="font-mono text-eyebrow uppercase text-accent">Next step</p><h2 className="mt-5 text-h2 font-semibold text-text">{copy.ctaTitle}</h2><p className="mt-5 text-lead text-text-dim">{copy.cta}</p><Link href={`/${locale}#contact`} className="mt-8 inline-flex rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-ink">{copy.ctaButton} <span aria-hidden className="ml-2">→</span></Link></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
