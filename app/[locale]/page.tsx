import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import ProofBar from "@/components/sections/ProofBar";
import Pillars from "@/components/sections/Pillars";
import Services from "@/components/sections/Services";
import AeoAnswerBlock from "@/components/sections/AeoAnswerBlock";
import Process from "@/components/sections/Process";
import Portfolio from "@/components/sections/Portfolio";
import Testimonials from "@/components/sections/Testimonials";
import WhyKershell from "@/components/sections/WhyKershell";
import Contact from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProofBar />
        <Pillars />
        <Services />
        <AeoAnswerBlock />
        <Process />
        <Portfolio />
        <Testimonials />
        <WhyKershell />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
