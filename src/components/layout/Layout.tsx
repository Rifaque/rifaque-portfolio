import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { routeFor } from "../../content/routes";
import { applyHead } from "../../lib/head";
import { isTypingTarget } from "../../lib/dom";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { CommandPalette } from "./CommandPalette";

type Props = { children: ReactNode; notFound?: boolean };

export function Layout({ children, notFound }: Props) {
  const { pathname } = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Head tags after in-app navigation. On first load they are already in the
  // prerendered HTML, and this writes the same values.
  useEffect(() => {
    applyHead(notFound ? routeFor("/404") : routeFor(pathname));
  }, [pathname, notFound]);

  // Scrolling on navigation belongs to ScrollManager, which outlives this
  // per-page layout.

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      // Optional shortcut, ignored while typing or with modifiers held.
      if (e.key === "`" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTypingTarget(e.target)) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader onOpenPalette={openPalette} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </>
  );
}
