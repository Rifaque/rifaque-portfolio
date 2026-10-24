import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { projects, type Stage } from "./projects";
import { roleTreatment, stageTreatment } from "./stages";
import { StatusBadge } from "../components/StatusBadge";

/** The approved stage for each project, and its status line exactly as published. */
const expected: Record<string, { stage: Stage; status: string }> = {
  nexus: { stage: "private-alpha", status: "Private alpha · active development" },
  atlas: { stage: "released", status: "v1.0.3 released · not in active development" },
  reflux: { stage: "pre-release", status: "Pre-release · source-available, not open source" },
  extendspace: { stage: "in-development", status: "In development · Connect still disabled" },
  "bhatkal-time-luxe": { stage: "delivered", status: "Delivered · HubZero's first paid client project" },
  querycraft: { stage: "retired", status: "Final-year project · retired" },
  bluetap: { stage: "pre-release", status: "Pre-release · foundation complete" },
  layers: { stage: "pre-release", status: "Pre-release · no public release" },
};

/** What the visible wording must say for each stage. A guard, not a parser. */
const wording: Record<Stage, RegExp> = {
  released: /(?<!pre-)\breleased\b/i,
  "pre-release": /^Pre-release\b/,
  "in-development": /^In development\b/,
  "private-alpha": /^Private alpha\b/,
  delivered: /^Delivered\b/,
  retired: /\bretired\b/i,
};

describe("project stages", () => {
  it("every project has its approved stage and unchanged status wording", () => {
    expect(projects.map((p) => p.slug).sort()).toEqual(Object.keys(expected).sort());
    for (const p of projects) {
      expect({ stage: p.stage, status: p.status }, p.slug).toEqual(expected[p.slug]);
    }
  });

  it("each stage agrees with what its status line says", () => {
    for (const p of projects) {
      expect(p.status, p.slug).toMatch(wording[p.stage]);
      for (const [other, re] of Object.entries(wording)) {
        if (other !== p.stage) expect(p.status, `${p.slug} vs ${other}`).not.toMatch(re);
      }
    }
  });

  it("stage and maturity stay separate fields", () => {
    for (const p of projects) {
      expect(["released", "active", "delivered", "retired"]).toContain(p.maturity);
      expect(Object.keys(stageTreatment)).toContain(p.stage);
    }
  });

  it("every stage has its own glyph shape, so colour is never the only signal", () => {
    const glyphs = [...Object.values(stageTreatment).map((t) => t.glyph), roleTreatment.glyph];
    expect(new Set(glyphs).size).toBe(glyphs.length);
    expect(stageTreatment).toEqual({
      released: { glyph: "filled", token: "--status-released" },
      "pre-release": { glyph: "half", token: "--status-prerelease" },
      "in-development": { glyph: "ring-tick", token: "--status-development" },
      "private-alpha": { glyph: "dashed-ring", token: "--status-alpha" },
      delivered: { glyph: "check", token: "--status-delivered" },
      retired: { glyph: "hollow-ring", token: "--status-retired" },
    });
  });
});

describe("StatusBadge", () => {
  it("renders the status text verbatim beside a decorative glyph", () => {
    for (const p of projects) {
      const html = renderToStaticMarkup(createElement(StatusBadge, { stage: p.stage, text: p.status }));
      const escaped = p.status.replace(/&/g, "&amp;").replace(/'/g, "&#x27;");
      expect(html, p.slug).toContain(escaped);
      expect(html).toContain(`data-stage="${p.stage}"`);
      expect(html).toMatch(new RegExp(`<svg class="glyph glyph--${p.stage}"[^>]*aria-hidden="true"`));
    }
  });

  it("gives a role a neutral glyph, not a project stage", () => {
    const html = renderToStaticMarkup(createElement(StatusBadge, { stage: "role", text: "Co-founder" }));
    expect(html).toContain('class="glyph glyph--role"');
    expect(html).toContain("Co-founder");
  });
});
