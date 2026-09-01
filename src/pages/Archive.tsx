import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FiGithub, FiArrowLeft } from "react-icons/fi";
import AuroraBackground from "@/components/AuroraBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import SkipLink from "@/components/SkipLink";
import CMDTerminal from "@/components/CMDTerminal";
import { Reveal } from "@/components/Section";
import { archiveProjects, archiveIntro, site } from "@/data/portfolio";

const Archive = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `Archive — ${site.title}`;
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <AuroraBackground>
      <SkipLink />
      <Navbar />
      <main
        id="main"
        className="rail pb-16 pt-[calc(var(--header-h)+3.5rem+var(--safe-top))] sm:pb-24 sm:pt-[calc(var(--header-h)+5rem+var(--safe-top))]"
      >
        {/* Left-aligned inside the same rail the nav and sections use. */}
        <div className="rail-inner">
          <div className="max-w-3xl">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-aurora-teal/80">
              Archive
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Older work
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/60">
              {archiveIntro}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/60">
              This page exists so the main portfolio can stay selective. Nothing
              here is deleted and nothing here is oversold.
            </p>
          </Reveal>

          <ol className="mt-14 space-y-10 sm:mt-20 sm:space-y-12">
            {archiveProjects.map((entry, i) => (
              <li key={entry.id}>
                <Reveal delay={i * 0.05}>
                  <article className="border-t border-foreground/[0.1] pt-6">
                    <p className="font-mono text-xs text-foreground/40">
                      {entry.dates}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                      {entry.name}
                    </h2>
                    <p className="mt-3 text-[0.95rem] leading-relaxed text-foreground/60">
                      {entry.description}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {entry.technologies.map((tech) => (
                        <li
                          key={tech}
                          className="max-w-full break-words rounded border border-foreground/10 px-2 py-0.5 text-[0.7rem] text-foreground/50"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                    {entry.githubUrl && (
                      <a
                        href={entry.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tap-target mt-4 inline-flex items-center gap-1.5 text-sm text-foreground/55 transition-colors hover:text-foreground focus-ring"
                      >
                        <FiGithub className="h-4 w-4" aria-hidden />
                        Source
                        <span className="sr-only"> — {entry.name}</span>
                      </a>
                    )}
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal delay={0.1}>
            <div className="mt-16 border-t border-foreground/[0.1] pt-8">
              <Link
                to="/"
                className="tap-target inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors hover:text-foreground focus-ring"
              >
                <FiArrowLeft className="h-4 w-4" aria-hidden />
                Back to the current work
              </Link>
            </div>
          </Reveal>
          </div>
        </div>
      </main>
      <Footer />
      <CMDTerminal />
    </AuroraBackground>
  );
};

export default Archive;
