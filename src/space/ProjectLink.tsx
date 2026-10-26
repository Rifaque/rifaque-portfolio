import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { reducedMotion } from "../lib/prefs";
import { spaceBySlug } from "./data";

/**
 * A link to a project from elsewhere on the page (How I work, the bill of
 * materials). A featured project is selected in Project Space, which is
 * brought into view with its list entry focused; any other project leads to
 * its case study. Without JavaScript the link still selects it (?project=).
 */
export function ProjectLink({ slug, children, className }: { slug: string; children: ReactNode; className?: string }) {
  const navigate = useNavigate();
  if (!spaceBySlug(slug))
    return (
      <Link className={className} to={`/work/${slug}`} data-sound="press">
        {children}
      </Link>
    );
  const href = `/?project=${slug}#work`;
  return (
    <a
      className={className}
      href={href}
      data-sound="press"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate({ pathname: "/", search: `?project=${slug}`, hash: "#work" }, { preventScrollReset: true });
        const instant = reducedMotion();
        requestAnimationFrame(() => document.getElementById("work")?.scrollIntoView({ behavior: instant ? "auto" : "smooth" }));
        setTimeout(() => document.querySelector<HTMLElement>(`#work .ps-sd-btn[data-slug="${slug}"]`)?.focus({ preventScroll: true }), instant ? 0 : 450);
      }}
    >
      {children}
    </a>
  );
}
