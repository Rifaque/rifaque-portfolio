import { Hero } from "../hero/HeroSection";
import { ProjectSpace } from "../space/ProjectSpace";
import { BillOfMaterials, Contact, Experience, HowIWork } from "../components/HomeSections";

/**
 * The homepage, in the accepted order: the RSX solid as the landing gate,
 * Projects (Project Space with Also built and Archive builds), How I work,
 * Experience and education, the bill of materials, and contact.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <ProjectSpace />
      <HowIWork />
      <Experience />
      <BillOfMaterials />
      <Contact />
    </>
  );
}
