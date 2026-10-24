import { describe, expect, it } from "vitest";
import { caseStudySlugs, pick, projects, selectedSlugs, smallerSlugs, studioSlugs } from "./projects";
import { experiences, education } from "./experience";
import { archive } from "./archive";
import { canonicalFor, notFoundRoute, redirects, routeFor, routes } from "./routes";
import { commands, filterCommands } from "./commands";
import { profiles, site, support } from "./site";
import { fieldLayouts, NODE_COUNT } from "../components/work/fieldLayouts";

const allText = JSON.stringify({ projects, experiences, education, archive, site, routes });

describe("projects", () => {
  it("every project states its status, maturity, role, period and limits", () => {
    for (const p of projects) {
      expect(p.status, p.slug).toBeTruthy();
      expect(["released", "active", "delivered", "retired"]).toContain(p.maturity);
      expect(p.role, p.slug).toBeTruthy();
      expect(p.period, p.slug).toBeTruthy();
      expect(p.limits.length, p.slug).toBeGreaterThan(20);
    }
  });

  it("client and team work is attributed", () => {
    for (const p of pick(studioSlugs)) {
      expect(p.attribution, p.slug).toMatch(/HubZero|three-person/);
    }
    expect(pick(["bhatkal-time-luxe"])[0].attribution).toMatch(/co-founder handled the visual design/);
    expect(pick(["querycraft"])[0].attribution).toMatch(/three-person/);
  });

  it("slugs are unique and every list refers to real projects", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of [...selectedSlugs, ...studioSlugs, ...smallerSlugs]) expect(slugs).toContain(s);
  });

  it("external links are https, and no live or demo link appears without a real URL", () => {
    for (const p of projects) {
      for (const l of p.links) {
        expect(l.href, `${p.slug}: ${l.label}`).toMatch(/^https:\/\/[^\s]+\.[a-z]{2,}/);
        if (/live|demo|site/i.test(l.label)) expect(l.href).not.toMatch(/example|localhost|#$/);
      }
    }
  });

  it("follows the owner's link decisions", () => {
    const linksOf = (slug: string) => pick([slug])[0].links.map((l) => l.href).join(" ");
    expect(linksOf("nexus")).toBe(""); // private: no source, no demo
    expect(linksOf("reflux")).not.toMatch(/github/); // public repo lags; no link yet
    expect(linksOf("layers")).not.toMatch(/github/); // private repository
  });

  it("licence claims match the repositories", () => {
    const reflux = pick(["reflux"])[0];
    expect(reflux.status).toMatch(/not open source/);
    expect(reflux.role).toMatch(/proprietary/);
    for (const slug of ["atlas", "extendspace", "bluetap"]) expect(pick([slug])[0].role).toMatch(/MIT/);
  });

  it("does not republish claims that were removed or never verified", () => {
    expect(allText).not.toMatch(/signed (Windows|installer)/i);
    expect(allText).not.toMatch(/no BM25/i);
    expect(allText).not.toMatch(/60%/);
    expect(allText).not.toMatch(/\bCEO\b/);
    expect(allText).not.toMatch(/discontinued/i);
    expect(allText).not.toMatch(/Easy Apply|Django REST/);
    expect(pick(["atlas"])[0].status).toMatch(/v1\.0\.3/);
  });

  it("selected projects with diagrams have a matching nine-node layout and a spoken description", () => {
    for (const p of pick(selectedSlugs)) {
      const layout = fieldLayouts[p.slug];
      expect(layout, p.slug).toBeTruthy();
      expect(layout.nodes).toHaveLength(NODE_COUNT);
      expect(p.diagramLabel, p.slug).toMatch(/^Illustration/);
      for (const [from, to] of layout.edges) {
        expect(layout.nodes[from], `${p.slug} edge ${from}`).toBeTruthy();
        expect(layout.nodes[to], `${p.slug} edge ${to}`).toBeTruthy();
      }
    }
  });

  it("only real screenshots are used as media, with captions that say so", () => {
    for (const p of projects.filter((x) => x.media)) {
      expect(p.media!.caption).toMatch(/^Screenshot/);
      expect(p.media!.alt.length).toBeGreaterThan(40);
    }
  });
});

describe("identity", () => {
  it("uses the current name, domain, email and profiles", () => {
    expect(site.person).toBe("Rifaque Ahmed Akrami");
    expect(site.url).toBe("https://rsxdevelops.dev");
    expect(site.email).toBe("rifaque.rs@gmail.com");
    expect(profiles.linkedin).toBe("https://www.linkedin.com/in/rifaque-akrami/");
    expect(allText).not.toMatch(/rifaque\.hubzero\.in/);
    // No phone numbers, and no email address other than the public one.
    expect(allText).not.toMatch(/\+\d{1,3}[\s-]?\d{5}[\s-]?\d{5}|\b\d{5}[\s-]\d{5}\b/);
    for (const email of allText.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? []) expect(email).toBe(site.email);
  });

  it("support links stay the two official ones", () => {
    expect(support.map((s) => s.href)).toEqual([
      "https://github.com/sponsors/Rifaque",
      "https://www.buymeacoffee.com/rsxdevelops",
    ]);
  });

  it("experience matches the resume", () => {
    const rg = experiences.find((x) => x.id === "rg-smartdiscovery")!;
    expect(rg.role).toBe("Software Engineer Intern");
    expect(rg.period).toBe("Aug 2025 – May 2026");
    const hz = experiences.find((x) => x.id === "hubzero")!;
    expect(hz.role).toBe("Co-founder & Software Engineer");
    expect(education.cgpa).toBe("8.36 / 10");
  });
});

describe("routes", () => {
  it("paths and output files are unique", () => {
    const paths = routes.map((r) => r.path);
    const files = [...routes, notFoundRoute].map((r) => r.file);
    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(files).size).toBe(files.length);
  });

  it("every case study has a route, and only case studies do", () => {
    const work = routes.filter((r) => r.path.startsWith("/work/")).map((r) => r.path.slice(6));
    expect(work.sort()).toEqual([...caseStudySlugs].sort());
  });

  it("titles and descriptions are unique among indexable pages", () => {
    const idx = routes.filter((r) => r.indexable);
    expect(new Set(idx.map((r) => r.title)).size).toBe(idx.length);
    expect(new Set(idx.map((r) => r.description)).size).toBe(idx.length);
  });

  it("/lab and the 404 page are noindex; everything else is indexable", () => {
    expect(routeFor("/lab").indexable).toBe(false);
    expect(notFoundRoute.indexable).toBe(false);
    expect(routes.filter((r) => !r.indexable).map((r) => r.path)).toEqual(["/lab"]);
  });

  it("canonicals are absolute and on the canonical host", () => {
    for (const r of routes) expect(canonicalFor(r)).toMatch(/^https:\/\/rsxdevelops\.dev\//);
    expect(canonicalFor(routeFor("/"))).toBe("https://rsxdevelops.dev/");
  });

  it("unknown and retired paths resolve to the 404 metadata, and /desktop redirects to /", () => {
    expect(routeFor("/nope")).toBe(notFoundRoute);
    expect(routeFor("/work/bluetap")).toBe(notFoundRoute);
    expect(routeFor("/archive/")).toBe(routeFor("/archive"));
    expect(redirects.find((r) => r.from === "/desktop")?.to).toBe("/");
  });
});

describe("command palette", () => {
  it("every navigation command points at a real route", () => {
    const paths = new Set(routes.map((r) => r.path));
    for (const c of commands) {
      if (c.action.type !== "navigate") continue;
      const path = c.action.to.split("#")[0] || "/";
      expect(paths.has(path), `${c.id} -> ${c.action.to}`).toBe(true);
    }
  });

  it("covers every case study and the useful actions", () => {
    for (const s of caseStudySlugs) expect(commands.some((c) => c.id === `project-${s}`)).toBe(true);
    const ids = commands.map((c) => c.id);
    for (const id of ["copy-email", "resume", "now", "github", "linkedin"]) expect(ids).toContain(id);
  });

  it("filters on every term", () => {
    expect(filterCommands("atlas").map((c) => c.id)).toContain("project-atlas");
    expect(filterCommands("copy email").map((c) => c.id)).toEqual(["copy-email"]);
    expect(filterCommands("zzzz")).toHaveLength(0);
    expect(filterCommands("   ")).toHaveLength(commands.length);
  });
});
