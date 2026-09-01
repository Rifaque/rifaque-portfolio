import AuroraBackground from "@/components/AuroraBackground";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Work from "@/components/sections/Work";
import Experience from "@/components/sections/Experience";
import Skills from "@/components/sections/Skills";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import CMDTerminal from "@/components/CMDTerminal";
import SkipLink from "@/components/SkipLink";
import { useHashScroll } from "@/hooks/useHashScroll";

const Index = () => {
  useHashScroll();

  return (
    <AuroraBackground>
      <SkipLink />
      <Navbar />
      <main id="main">
        <Hero />
        <Work />
        <Experience />
        <Skills />
        <About />
        <Contact />
      </main>
      <Footer />
      <CMDTerminal />
    </AuroraBackground>
  );
};

export default Index;
