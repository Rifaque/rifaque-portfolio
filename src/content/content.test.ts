import { describe, expect, it } from "vitest";
import { featuredSlugs, hubzeroSlugs, projects, smallerSlugs } from "./projects";
import { archive, education, experience, stackSwitches } from "./profile";
import { routes } from "./routes";
import { site } from "./site";

/** Every outbound link, as recorded in knowledge-base/portfolio.md. */
const verifiedLinks = new Set([
  "https://github.com/Rifaque/atlas",
  "https://github.com/Rifaque/atlas/releases/tag/v1.0.3",
  "https://atlas.rsxdevelops.dev",
  "https://github.com/Rifaque/blue-tap",
  "https://github.com/HubZeroHQ/querycraft",
  "https://github.com/Rifaque/querycraft",
  "https://github.com/Rifaque/querycraft-frontend",
  "https://github.com/Rifaque/querycraft-backend",
  "https://github.com/Rifaque/querycraft-llm",
  "https://btl.hubzero.in",
]);

const allText = (o: unknown): string => JSON.stringify(o);

describe("projects", () => {
  it("has the eight projects, each placed exactly once on the homepage", () => {
    expect(projects.map((p) => p.slug).sort()).toEqual(
      ["atlas", "bhatkal-time-luxe", "bluetap", "extendspace", "layers-by-rsx", "nexus", "querycraft", "reflux"],
    );
    expect([...featuredSlugs, ...hubzeroSlugs, ...smallerSlugs].sort()).toEqual(projects.map((p) => p.slug).sort());
  });

  it("states status, role, ownership and limits for every project", () => {
    for (const p of projects) {
      expect(p.status, p.slug).toBeTruthy();
      expect(p.role, p.slug).toBeTruthy();
      expect(p.ownership.label, p.slug).toBeTruthy();
      expect(p.limits.length, p.slug).toBeGreaterThan(0);
      expect(p.how.length, p.slug).toBeGreaterThan(0);
      expect(p.decisions.length, p.slug).toBeGreaterThan(0);
      expect(p.caseStudy.length, p.slug).toBeGreaterThan(0);
      expect(p.media.length, p.slug).toBeGreaterThan(0);
      if (!p.links.length) expect(p.linksNote, p.slug).toBeTruthy();
    }
  });

  it("attributes HubZero work to HubZero and never as an RSX product", () => {
    for (const slug of hubzeroSlugs) {
      const p = projects.find((x) => x.slug === slug)!;
      expect(p.ownership.kind).toBe("hubzero");
      expect(allText(p.ownership)).toContain("HubZero");
      expect(p.ownership.label).not.toMatch(/RSX Develops/);
    }
    const btl = projects.find((x) => x.slug === "bhatkal-time-luxe")!;
    // Owner's correction (31 Oct 2026): a genuine paid client project, redesigned on a
    // co-founder's foundation; Kuwait or the GCC named only as later prospective-client demo work.
    expect(btl.role).toMatch(/end to end through HubZero/);
    expect(allText(btl)).not.toMatch(/60\s?%|I built the frontend|not necessarily my implementation/);
    expect(btl.summary).toMatch(/Bhatkal-based/);
    expect(btl.summary).toMatch(/India-wide/);
    expect(allText(btl)).not.toMatch(/\bconcept\b/i);
    expect(allText(btl.ownership)).toMatch(/foundation established by the co-founder/);
    const gulf = allText(btl).match(/[^."]*(Kuwait|GCC)[^."]*/g) ?? [];
    for (const sentence of gulf) expect(sentence).toMatch(/prospective client/);
    const qc = projects.find((x) => x.slug === "querycraft")!;
    expect(qc.period).toBe("Aug 2025 – Jan 2026");
    expect(allText(qc)).toMatch(/three/);
  });

  it("shows only verified licences", () => {
    const lic = Object.fromEntries(projects.map((p) => [p.slug, p.licence ?? null]));
    expect(lic).toEqual({
      nexus: "Closed source",
      atlas: "MIT",
      reflux: "Proprietary",
      extendspace: "MIT",
      "layers-by-rsx": null,
      bluetap: "MIT",
      querycraft: null,
      "bhatkal-time-luxe": null,
    });
  });

  it("never calls a proprietary project open source", () => {
    for (const p of projects.filter((x) => x.licence === "Proprietary" || x.licence === "Closed source")) {
      expect(allText(p).replace(/not open source/g, ""), p.slug).not.toMatch(/open[- ]source/i);
    }
  });

  it("keeps the conservative wording for unresolved questions", () => {
    const nexus = projects.find((x) => x.slug === "nexus")!;
    expect(nexus.links).toEqual([]);
    const reflux = projects.find((x) => x.slug === "reflux")!;
    expect(reflux.links).toEqual([]);
    expect(allText(reflux)).toMatch(/Physical phone testing has not been completed/);
    expect(allText(reflux)).not.toMatch(/physical phone and/i);
    const layers = projects.find((x) => x.slug === "layers-by-rsx")!;
    expect(allText(layers)).toMatch(/Ten first-party widget families are implemented/);
    for (const family of ["Clock", "Battery", "Music", "Calendar", "Countdown", "Shortcuts", "Device", "Notes", "Photos", "Weather"]) expect(allText(layers)).toContain(family);
    expect(allText(layers)).toMatch(/non-commercial use only/);
    const bluetap = projects.find((x) => x.slug === "bluetap")!;
    expect(allText(bluetap)).toMatch(/not implemented/);
    const es = projects.find((x) => x.slug === "extendspace")!;
    expect(es.status).toMatch(/Connect still disabled/);
  });

  it("labels every visual and gives it a description", () => {
    for (const p of projects)
      for (const m of p.media) {
        expect(["screenshot", "illustration"]).toContain(m.kind);
        if (m.kind === "screenshot") expect(m.alt.length, p.slug).toBeGreaterThan(20);
        else expect(m.label.length, p.slug).toBeGreaterThan(20);
      }
    // Only Atlas and Bhatkal Time Luxe have real screenshots.
    const withShots = projects.filter((p) => p.media.some((m) => m.kind === "screenshot")).map((p) => p.slug);
    expect(withShots.sort()).toEqual(["atlas", "bhatkal-time-luxe"]);
  });

  it("links only to verified URLs", () => {
    for (const p of projects) for (const l of p.links) expect(verifiedLinks.has(l.href), `${p.slug}: ${l.href}`).toBe(true);
    for (const a of archive) expect(a.source).toMatch(/^https:\/\/github\.com\/Rifaque\//);
  });
});

describe("stack switchboard", () => {
  it("every switch lights at least one project, from the projects' own stack entries", () => {
    for (const s of stackSwitches) {
      const hits = projects.filter((p) => p.stack.some((e) => e.name.includes(s.match)));
      expect(hits.length, s.label).toBeGreaterThan(0);
    }
  });
});

describe("site-wide content", () => {
  const everything = allText({ projects, archive, education, experience, site });

  it("contains no retired accent, private detail or forbidden domain", () => {
    expect(everything).not.toMatch(/3abeff/i);
    expect(everything).not.toMatch(/\+91|6364282251|rifaque123|LPA|Dubai|Tata Consultancy/);
    expect(everything).not.toMatch(/rifaque\.hubzero\.in|bhatkaltimeluxe\.in|atlas\.rifaque\.dev/);
  });

  it("uses the approved education facts", () => {
    expect(education.cgpa).toBe("8.36 / 10");
    expect(education.institution).toMatch(/^Anjuman Institute of Technology and Management \(AITM\), affiliated with Visvesvaraya Technological University \(VTU\)/);
  });

  it("gives every route a unique title and description", () => {
    expect(new Set(routes.map((r) => r.title)).size).toBe(routes.length);
    expect(new Set(routes.map((r) => r.description)).size).toBe(routes.length);
    for (const r of routes) expect(r.description.length, r.path).toBeLessThanOrEqual(240);
  });
});
