import { site, profiles } from "./site";
import { projects } from "./projects";

/**
 * The route manifest. The router, the prerender step, the sitemap and the
 * build checks all read it, so a page cannot exist without metadata or appear
 * in the sitemap without existing.
 */
export type Env = "ink" | "paper";

export type RouteMeta = {
  path: string;
  /** Output file relative to dist/ (served with clean URLs). */
  file: string;
  title: string;
  description: string;
  indexable: boolean;
  ogType: "website" | "article" | "profile";
  env: Env;
  jsonLd?: Record<string, unknown>[];
};

const personId = `${site.url}/#person`;
const websiteId = `${site.url}/#website`;

const person = {
  "@type": "Person",
  "@id": personId,
  name: site.fullName,
  alternateName: [site.displayName, site.name],
  url: `${site.url}/`,
  jobTitle: "Software Engineer",
  email: `mailto:${site.email}`,
  sameAs: [profiles.github, profiles.linkedin],
  alumniOf: { "@type": "CollegeOrUniversity", name: "Visvesvaraya Technological University" },
  worksFor: { "@type": "Organization", name: "HubZero", url: profiles.hubzero },
};

const website = {
  "@type": "WebSite",
  "@id": websiteId,
  name: site.name,
  alternateName: site.displayName,
  url: `${site.url}/`,
  publisher: { "@id": personId },
};

const page = (path: string, name: string, description: string, crumb?: string) => ({
  "@type": "WebPage",
  "@id": `${site.url}${path}#page`,
  url: `${site.url}${path}`,
  name,
  description,
  isPartOf: { "@id": websiteId },
  author: { "@id": personId },
  ...(crumb
    ? {
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
            { "@type": "ListItem", position: 2, name: crumb, item: `${site.url}${path}` },
          ],
        },
      }
    : {}),
});

const suffix = ` · ${site.name}`;

export const routes: RouteMeta[] = [
  {
    path: "/",
    file: "index.html",
    title: `${site.displayName} · ${site.name} · ${site.role}`,
    description: site.description,
    indexable: true,
    ogType: "profile",
    env: "ink",
    jsonLd: [website, person],
  },
  ...projects.map(
    (p): RouteMeta => ({
      path: `/work/${p.slug}`,
      file: `work/${p.slug}.html`,
      title: p.seo.title + suffix,
      description: p.seo.description,
      indexable: true,
      ogType: "article",
      env: "paper",
      jsonLd: [page(`/work/${p.slug}`, p.seo.title, p.seo.description, p.title)],
    }),
  ),
  {
    path: "/about",
    file: "about.html",
    title: `About ${site.displayName}${suffix}`,
    description:
      "About Rifaque Akrami (RSX Develops): how I work, experience at HubZero and RG SmartDiscovery, education, and the skills behind the projects.",
    indexable: true,
    ogType: "profile",
    env: "paper",
    jsonLd: [page("/about", `About ${site.displayName}`, "Profile, experience and education.", "About"), person],
  },
  {
    path: "/archive",
    file: "archive.html",
    title: `Archive: earlier projects${suffix}`,
    description:
      "Earlier and academic projects by Rifaque Akrami: DevPilot, ZeroLink and coursework, kept for the record rather than as current work.",
    indexable: true,
    ogType: "website",
    env: "paper",
    jsonLd: [page("/archive", "Archive: earlier projects", "Earlier and academic projects.", "Archive")],
  },
];

export const notFoundRoute: RouteMeta = {
  path: "/404",
  file: "404.html",
  title: `Page not found${suffix}`,
  description: "This page does not exist on rsxdevelops.dev. The home page, the work and the archive are linked from here.",
  indexable: false,
  ogType: "website",
  env: "ink",
};

/** Permanent redirects, mirrored in vercel.json and scripts/serve.mjs. */
export const redirects = [
  { from: "/desktop", to: "/" },
  { from: "/desktop/:path*", to: "/" },
] as const;

export const routeFor = (pathname: string): RouteMeta => {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return routes.find((r) => r.path === clean) ?? notFoundRoute;
};

export const canonicalFor = (r: RouteMeta) => (r.path === "/" ? `${site.url}/` : `${site.url}${r.path}`);
