import { Layout } from "../components/layout/Layout";
import { Hero } from "../components/home/Hero";
import { Experience } from "../components/home/Experience";
import { SmallerBuilds } from "../components/home/SmallerBuilds";
import { About } from "../components/home/About";
import { Contact } from "../components/home/Contact";
import { SelectedWork } from "../components/work/SelectedWork";
import { pick, selectedSlugs } from "../content/projects";

export default function Home() {
  return (
    <Layout>
      <Hero />
      <section id="work" className="section" aria-labelledby="work-title">
        <div className="container">
          <header className="section-head">
            <h2 id="work-title" className="h2">
              Selected work
            </h2>
            <p>
              Four personal projects, each with its status and its limits. Diagrams are explanatory illustrations; the
              one screenshot is labelled as such.
            </p>
          </header>
          <SelectedWork projects={pick(selectedSlugs)} />
        </div>
      </section>
      <Experience />
      <SmallerBuilds />
      <About />
      <Contact />
    </Layout>
  );
}
