import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import AuroraBackground from "@/components/AuroraBackground";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import SkipLink from "@/components/SkipLink";
import CMDTerminal from "@/components/CMDTerminal";

const routes = [
  { to: "/", label: "Home", note: "Nexus, Atlas, and the rest of the work" },
  { to: "/#work", label: "Work", note: "Signature and selected projects" },
  { to: "/archive", label: "Archive", note: "Earlier experiments and academic work" },
  { to: "/desktop", label: "Desktop", note: "A small operating system, for no practical reason" },
];

const NotFound = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "404 — Rifaque Ahmed";
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
        className="rail pb-24 pt-[calc(var(--header-h)+3.5rem+var(--safe-top))] sm:pt-[calc(var(--header-h)+5rem+var(--safe-top))]"
      >
        <div className="rail-inner">
          <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-aurora-teal/80">
            404 — Not found
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Nothing is routed here
          </h1>
          <p className="mt-5 text-base leading-relaxed text-foreground/60">
            <code className="rounded border border-foreground/10 px-1.5 py-0.5 font-mono text-sm text-foreground/70">
              {pathname}
            </code>{" "}
            does not match any route on this site. No redirect guessing — here
            is everything that does exist.
          </p>

          <ul className="mt-10 divide-y divide-foreground/[0.08] border-y border-foreground/[0.08]">
            {routes.map((route) => (
              <li key={route.to}>
                <Link
                  to={route.to}
                  className="group flex items-center justify-between gap-4 py-4 focus-ring sm:py-5"
                >
                  <span>
                    <span className="text-base font-medium text-foreground transition-colors group-hover:text-aurora-teal">
                      {route.label}
                    </span>
                    <span className="mt-0.5 block text-sm text-foreground/50">
                      {route.note}
                    </span>
                  </span>
                  <FiArrowRight
                    className="h-4 w-4 shrink-0 text-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-aurora-teal"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
          </div>
        </div>
      </main>
      <Footer />
      <CMDTerminal />
    </AuroraBackground>
  );
};

export default NotFound;
