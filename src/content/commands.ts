import { site, profiles } from "./site";
import { caseStudySlugs, pick, smallerSlugs } from "./projects";

/**
 * Command palette entries, derived from the same content as the pages, so a
 * command can never point at a page or project that does not exist.
 */

export type CommandAction =
  | { type: "navigate"; to: string }
  | { type: "external"; href: string }
  | { type: "copy"; value: string; done: string };

export type Command = {
  id: string;
  group: "Go to" | "Projects" | "Actions";
  label: string;
  hint?: string;
  keywords?: string;
  action: CommandAction;
};

export const commands: Command[] = [
  { id: "home", group: "Go to", label: "Home", action: { type: "navigate", to: "/" } },
  {
    id: "now",
    group: "Go to",
    label: "Current project status",
    hint: "What is released, in alpha or in development",
    keywords: "right now status maturity",
    action: { type: "navigate", to: "/#now" },
  },
  { id: "work", group: "Go to", label: "Selected work", keywords: "projects portfolio", action: { type: "navigate", to: "/#work" } },
  { id: "experience", group: "Go to", label: "Experience", keywords: "hubzero rg smartdiscovery internship job", action: { type: "navigate", to: "/#experience" } },
  { id: "smaller", group: "Go to", label: "Smaller builds", keywords: "bluetap layers android", action: { type: "navigate", to: "/#smaller" } },
  { id: "education", group: "Go to", label: "Education", keywords: "degree vtu aitm cgpa", action: { type: "navigate", to: "/#about" } },
  { id: "contact", group: "Go to", label: "Contact", keywords: "email hire", action: { type: "navigate", to: "/#contact" } },
  { id: "archive", group: "Go to", label: "Archive", hint: "Earlier and academic projects", keywords: "devpilot zerolink old", action: { type: "navigate", to: "/archive" } },
  ...pick(caseStudySlugs).map(
    (p): Command => ({
      id: `project-${p.slug}`,
      group: "Projects",
      label: p.title,
      hint: p.status,
      keywords: `${p.kicker} case study`,
      action: { type: "navigate", to: `/work/${p.slug}` },
    }),
  ),
  ...pick(smallerSlugs).map(
    (p): Command => ({
      id: `project-${p.slug}`,
      group: "Projects",
      label: p.title,
      hint: p.status,
      keywords: p.kicker,
      action: { type: "navigate", to: `/#smaller-${p.slug}` },
    }),
  ),
  {
    id: "copy-email",
    group: "Actions",
    label: "Copy email address",
    hint: site.email,
    keywords: "contact mail",
    action: { type: "copy", value: site.email, done: `Copied ${site.email}` },
  },
  { id: "resume", group: "Actions", label: "Open resume (PDF)", keywords: "cv", action: { type: "external", href: site.resume } },
  { id: "github", group: "Actions", label: "Open GitHub profile", hint: "github.com/Rifaque", action: { type: "external", href: profiles.github } },
  { id: "linkedin", group: "Actions", label: "Open LinkedIn profile", keywords: "linkedin", action: { type: "external", href: profiles.linkedin } },
];

/** Every whitespace-separated term must appear somewhere in the command. */
export function filterCommands(query: string, list: Command[] = commands) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return list;
  return list.filter((c) => {
    const hay = `${c.label} ${c.hint ?? ""} ${c.keywords ?? ""} ${c.group}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}
