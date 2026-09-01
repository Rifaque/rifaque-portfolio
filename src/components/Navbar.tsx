import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { cn } from "@/lib/utils";

const sectionLinks = [
  { name: "Work", id: "work" },
  { name: "Experience", id: "experience" },
  { name: "Skills", id: "skills" },
  { name: "About", id: "about" },
  { name: "Contact", id: "contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const onHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
      if (!onHome) return;
      // Topmost section whose heading has passed the nav gets marked current.
      let current = "";
      for (const link of sectionLinks) {
        const el = document.getElementById(link.id);
        if (el && el.getBoundingClientRect().top <= 140) current = link.id;
      }
      setActiveSection(current);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [onHome]);

  // Publish the real header height so the mobile panel and the hero's top
  // padding follow it instead of hard-coding a pixel value that drifts.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || typeof ResizeObserver === "undefined") return;
    const publish = () =>
      document.documentElement.style.setProperty(
        "--header-h",
        `${bar.getBoundingClientRect().height}px`
      );
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Escape closes; focus is trapped inside the panel while it is open.
  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])"
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKey);
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen, closeMenu]);

  // A viewport wide enough for the desktop nav must not leave the mobile
  // dialog mounted and body scroll locked behind it.
  useEffect(() => {
    if (!menuOpen) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [menuOpen]);

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  /*
   * Closing the panel and following the hash in the same tick does not work:
   * the browser performs the jump while <body> is still overflow:hidden from
   * the scroll lock, so nothing moves and the position is lost.
   *
   * The lock is released synchronously here rather than waiting for React's
   * effect cleanup, so the scroll happens in the same tick as the tap. The
   * effect cleanup then sets the same value again, which is harmless.
   */
  const goToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!onHome) {
      setMenuOpen(false);
      return; // different route: let the browser navigate to /#id
    }
    const target = document.getElementById(id);
    if (!target) return; // no such section: fall back to default anchor behaviour

    e.preventDefault();
    document.body.style.overflow = "";
    setMenuOpen(false);

    // Scroll the window directly. scrollIntoView resolves against the nearest
    // scroll container, which is not always the page.
    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      (parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-h")
      ) || 56) -
      16;
    // Smooth scrolling is driven by requestAnimationFrame; honour the user's
    // motion preference explicitly rather than relying on the CSS default.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <header
      className={cn(
        "rail fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        "pt-[var(--safe-top)]",
        isScrolled
          ? "border-b border-foreground/[0.07] bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div
        ref={barRef}
        className="rail-inner flex items-center justify-between gap-4 py-3 sm:py-4"
      >
        <Link
          to="/"
          className="tap-target rounded-sm font-mono text-sm tracking-tight text-foreground transition-colors hover:text-aurora-teal focus-ring"
        >
          rifaque<span className="text-foreground/40">.ahmed</span>
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Sections" className="hidden items-center gap-0.5 md:flex lg:gap-1">
          {sectionLinks.map((link) => (
            <a
              key={link.id}
              href={href(link.id)}
              aria-current={onHome && activeSection === link.id ? "true" : undefined}
              className={cn(
                "rounded-md px-2.5 py-2 text-sm transition-colors focus-ring lg:px-3",
                onHome && activeSection === link.id
                  ? "text-foreground"
                  : "text-foreground/55 hover:text-foreground"
              )}
            >
              {link.name}
            </a>
          ))}
          <Link
            to="/archive"
            className="rounded-md px-2.5 py-2 text-sm text-foreground/55 transition-colors hover:text-foreground focus-ring lg:px-3"
          >
            Archive
          </Link>
          <a
            href="mailto:rifaque.rs@gmail.com"
            className="ml-2 rounded-md border border-foreground/15 px-3.5 py-2 text-sm text-foreground/90 transition-colors hover:border-aurora-teal/40 hover:text-foreground focus-ring"
          >
            Email
          </a>
        </nav>

        {/* Mobile toggle — always visible, never an invisible tap target */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          className="-mr-1 rounded-md border border-foreground/15 p-2.5 text-foreground focus-ring md:hidden"
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          {menuOpen ? <HiX size={20} aria-hidden /> : <HiMenu size={20} aria-hidden />}
        </button>
      </div>

      {/* Mobile panel. Unmounted when closed, so nothing lingers in the tab order. */}
      {menuOpen && (
        <div
          id="mobile-nav"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className={[
            "fixed inset-x-0 z-50 flex flex-col gap-1 overflow-y-auto md:hidden",
            "top-[calc(var(--header-h)+var(--safe-top))] bottom-0",
            "border-t border-foreground/[0.07] bg-background/[0.98] backdrop-blur-xl",
            // Padding matches the rail so the panel's links line up with the
            // logo above them, and clears the home indicator at the bottom.
            "px-[max(1rem,var(--safe-left))] pt-5",
            "pb-[calc(1.5rem+var(--safe-bottom))]",
          ].join(" ")}
        >
          {sectionLinks.map((link) => (
            <a
              key={link.id}
              href={href(link.id)}
              onClick={(e) => goToSection(e, link.id)}
              className="rounded-md px-2 py-3.5 text-lg text-foreground/80 transition-colors hover:text-foreground focus-ring"
            >
              {link.name}
            </a>
          ))}
          <Link
            to="/archive"
            onClick={() => setMenuOpen(false)}
            className="rounded-md px-2 py-3.5 text-lg text-foreground/80 transition-colors hover:text-foreground focus-ring"
          >
            Archive
          </Link>
          <a
            href="mailto:rifaque.rs@gmail.com"
            onClick={() => setMenuOpen(false)}
            className="mt-4 rounded-md border border-foreground/15 px-4 py-3.5 text-center text-base text-foreground focus-ring"
          >
            rifaque.rs@gmail.com
          </a>
        </div>
      )}
    </header>
  );
};

export default Navbar;
