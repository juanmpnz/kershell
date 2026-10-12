import HomeJsonLd from "@/components/seo/HomeJsonLd";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import AeoAnswerBlock from "@/components/sections/AeoAnswerBlock";
import Process from "@/components/sections/Process";
import Portfolio from "@/components/sections/Portfolio";
import WhyKershell from "@/components/sections/WhyKershell";
import Contact from "@/components/sections/Contact";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <HomeJsonLd locale={locale} />
      <Navbar />
      <main className="cinematic-site">
        <Hero />
        <Portfolio />
        <Services />
        <Process />
        <WhyKershell />
        <AeoAnswerBlock />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
