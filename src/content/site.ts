/**
 * Identity and links. Every public string about who this is lives here.
 *
 * Sources, in order of authority: the owner's explicit decisions (Oct 2026),
 * the current resume (public/resume/Rifaque_Resume.pdf, phone removed), then
 * each project's own repository. Nothing here is copied from older copy
 * without being re-checked.
 */

export const site = {
  name: "RSX Develops",
  person: "Rifaque Ahmed Akrami",
  url: "https://rsxdevelops.dev",
  locale: "en_GB",
  role: "Product-minded software engineer",
  positioning: "Product-minded engineer building full-stack software and practical AI systems.",
  description:
    "Rifaque Ahmed Akrami (RSX Develops) is a product-minded software engineer building full-stack software, local-first AI tools and developer systems. Nexus, Atlas, Reflux and ExtendSpace, plus client work through HubZero.",
  location: "Bhatkal, Karnataka, India",
  availability: "Open to relocation and remote roles",
  email: "rifaque.rs@gmail.com",
  resume: "/resume/Rifaque_Resume.pdf",
  ogImage: "/og-image.png",
  ogImageAlt: "RSX Develops: Rifaque Ahmed Akrami, product-minded software engineer.",
} as const;

export const profiles = {
  github: "https://github.com/Rifaque",
  linkedin: "https://www.linkedin.com/in/rifaque-akrami/",
} as const;

/** Kept deliberately quiet: footer only, never in the contact call to action. */
export const support = [
  { label: "GitHub Sponsors", href: "https://github.com/sponsors/Rifaque" },
  { label: "Buy Me a Coffee", href: "https://www.buymeacoffee.com/rsxdevelops" },
] as const;
