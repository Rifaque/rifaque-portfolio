import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { routeFor } from "../../content/routes";
import { applyHead } from "../../lib/head";
import { isTypingTarget } from "../../lib/dom";
import { scrollToId } from "../../hooks/useGoTo";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { CommandPalette } from "./CommandPalette";

type Props = { children: ReactNode; notFound?: boolean };

export function Layout({ children, notFound }: Props) {
  const { pathname, hash } = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const first = useRef(true);

  // Head tags after in-app navigation. On first load they are already in the
  // prerendered HTML, and this writes the same values.
  useEffect(() => {
    applyHead(notFound ? routeFor("/404") : routeFor(pathname));
  }, [pathname, notFound]);

  // Hash targets once the page has rendered; otherwise start at the top.
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const frame = requestAnimationFrame(() => scrollToId(id));
      first.current = false;
      return () => cancelAnimationFrame(frame);
    }
    if (!first.current) window.scrollTo(0, 0);
    first.current = false;
  }, [pathname, hash]);

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
