import { site, profiles } from "./site";
import { caseStudySlugs, pick, type Project } from "./projects";
import { experiences } from "./experience";

/**
 * The single route manifest. The router, the prerender step, the sitemap,
 * robots.txt, the command palette and the build checks all read from here,
 * so a page cannot exist without metadata, or appear in the sitemap without
 * existing.
 */

export type RouteMeta = {
  path: string;
  /** Output file relative to dist/, served by Vercel with cleanUrls. */
  file: string;
  title: string;
  description: string;
  indexable: boolean;
  ogType: "website" | "article" | "profile";
  /** Extra JSON-LD nodes for this page. */
  jsonLd?: Record<string, unknown>[];
};

const personId = `${site.url}/#person`;
const websiteId = `${site.url}/#website`;

export const personJsonLd = {
  "@type": "Person",
  "@id": personId,
  name: site.person,
  alternateName: site.name,
  url: `${site.url}/`,
  jobTitle: "Software Engineer",
  email: `mailto:${site.email}`,
  sameAs: [profiles.github, profiles.linkedin],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Visvesvaraya Technological University",
  },
  worksFor: {
    "@type": "Organization",
    name: "HubZero",
    url: experiences[0].url,
  },
};

const websiteJsonLd = {
  "@type": "WebSite",
  "@id": websiteId,
  name: site.name,
  alternateName: site.person,
  url: `${site.url}/`,
  publisher: { "@id": personId },
};

const caseStudyRoute = (p: Project): RouteMeta => ({
  path: `/work/${p.slug}`,
  file: `work/${p.slug}.html`,
  title: `${p.title}: ${p.kicker} · ${site.name}`,
  description: p.description,
  indexable: true,
  ogType: "article",
  jsonLd: [
    {
      "@type": "WebPage",
      "@id": `${site.url}/work/${p.slug}#page`,
      url: `${site.url}/work/${p.slug}`,
      name: `${p.title}: ${p.kicker}`,
      description: p.description,
      isPartOf: { "@id": websiteId },
      author: { "@id": personId },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
          { "@type": "ListItem", position: 2, name: p.title, item: `${site.url}/work/${p.slug}` },
        ],
      },
    },
  ],
});

export const routes: RouteMeta[] = [
  {
    path: "/",
    file: "index.html",
    title: `${site.person} · ${site.name} · ${site.role}`,
    description: site.description,
    indexable: true,
    ogType: "profile",
    jsonLd: [websiteJsonLd, personJsonLd],
  },
  ...pick(caseStudySlugs).map(caseStudyRoute),
  {
    path: "/archive",
    file: "archive.html",
    title: `Archive: earlier projects · ${site.name}`,
    description:
      "Earlier and academic projects by Rifaque Ahmed Akrami: DevPilot, ZeroLink and coursework, kept for the record rather than as current work.",
    indexable: true,
    ogType: "website",
  },
  {
    path: "/lab",
    file: "lab.html",
    title: `Selected work prototype · ${site.name} lab`,
    description: "Design prototype of the selected-work carousel. Not part of the public site.",
    indexable: false,
    ogType: "website",
  },
];

export const notFoundRoute: RouteMeta = {
  path: "/404",
  file: "404.html",
  title: `Page not found · ${site.name}`,
  description: "This page does not exist on rsxdevelops.dev. The home page, selected work and archive are linked from here.",
  indexable: false,
  ogType: "website",
};

/** Paths that permanently redirect elsewhere (mirrored in vercel.json). */
export const redirects = [
  { from: "/desktop", to: "/" },
  { from: "/desktop/:path*", to: "/" },
] as const;

export const routeFor = (pathname: string): RouteMeta => {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return routes.find((r) => r.path === clean) ?? notFoundRoute;
};

export const canonicalFor = (route: RouteMeta) => (route.path === "/" ? `${site.url}/` : `${site.url}${route.path}`);
