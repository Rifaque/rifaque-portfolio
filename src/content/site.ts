/**
 * Identity, contact and links. Source: knowledge-base/portfolio.md
 * (published, public). Display name and full name follow
 * the owner's Milestone 0 decision: "Rifaque Akrami" displayed, "Rifaque Ahmed
 * Akrami" as the full name.
 */
export const site = {
  name: "RSX Develops",
  displayName: "Rifaque Akrami",
  fullName: "Rifaque Ahmed Akrami",
  url: "https://rsxdevelops.dev",
  locale: "en_GB",
  role: "Product-minded software engineer",
  positioning: "Product-minded engineer building full-stack software and practical AI systems.",
  lede: "I build local-first AI tools, developer systems and client products, from the architecture to the servers they run on, and I say plainly what each one does not do yet.",
  description:
    "Rifaque Akrami (RSX Develops) is a product-minded software engineer building full-stack software, local-first AI tools and developer systems: Nexus, Atlas, Reflux and ExtendSpace, plus client work through HubZero.",
  location: "Bhatkal, Karnataka, India",
  availability: "Open to relocation and remote roles",
  email: "rifaque.rs@gmail.com",
  resume: "/resume/Rifaque_Resume.pdf",
  ogImage: "/og-image.png",
  ogImageAlt: "The RSX Develops wordmark in white on near-black, above the address rsxdevelops.dev.",
} as const;

export const profiles = {
  github: "https://github.com/Rifaque",
  linkedin: "https://www.linkedin.com/in/rifaque-akrami/",
  hubzero: "https://hubzero.in",
} as const;

/** Kept quiet: footer only, never in a call to action. */
export const support = [
  { label: "GitHub Sponsors", href: "https://github.com/sponsors/Rifaque" },
  { label: "Buy Me a Coffee", href: "https://www.buymeacoffee.com/rsxdevelops" },
] as const;

/** Header navigation: sections of the home page. */
export const nav = [
  { label: "Work", to: "/#work" },
  { label: "About", to: "/#about" },
  { label: "Experience", to: "/#experience" },
  { label: "Contact", to: "/#contact" },
] as const;

/** Quieter pages, linked from the footer. */
export const footerNav = [
  { label: "About", to: "/about" },
  { label: "Archive", to: "/archive" },
] as const;
