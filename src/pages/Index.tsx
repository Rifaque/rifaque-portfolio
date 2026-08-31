import AuroraBackground from "@/components/AuroraBackground";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Education from "@/components/sections/Education";
import Skills from "@/components/sections/Skills";
import GitHub from "@/components/sections/GitHub";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import CMDTerminal from "@/components/CMDTerminal";

const Index = () => {
  return (
    <AuroraBackground>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Education />
        <Skills />
        <GitHub />
        <Contact />
      </main>
      <Footer />
      <CMDTerminal />
    </AuroraBackground>
  );
};

export default Index;
