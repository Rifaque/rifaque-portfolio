import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { stageTreatment } from "../content/stages";

const read = (p: string) => readFileSync(join(__dirname, "..", "..", p), "utf8");
const tokensCss = read("src/styles/tokens.css");
const baseCss = read("src/styles/base.css");

function token(name: string): string {
  const m = tokensCss.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})\\b`, "i"));
  if (!m) throw new Error(`${name} is not a hex token`);
  return m[1];
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const surfaces = ["--bg", "--bg-raised", "--bg-graphite"];

/** The retired decorative accent, in hex or rgb notation. */
const retiredAccent = /#3abeff|58\s*,?\s*190\s*,?\s*255/i;

describe("monochrome tokens", () => {
  it("use the approved palette", () => {
    expect(token("--bg")).toBe("#0b0b0c");
    expect(token("--bg-raised")).toBe("#141415");
    expect(token("--bg-graphite")).toBe("#1c1c1e");
    expect(token("--fg")).toBe("#f2efe9");
    expect(token("--fg-muted")).toBe("#a8a39b");
    expect(token("--fg-faint")).toBe("#8a857e");
  });

  it("text meets WCAG AA (4.5:1) on every surface", () => {
    for (const fg of ["--fg", "--fg-muted", "--fg-faint"]) {
      for (const bg of surfaces) expect(contrast(token(fg), token(bg)), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
    // Primary buttons: near-black ink on warm white.
    expect(contrast(token("--ink"), token("--fg"))).toBeGreaterThanOrEqual(7);
  });

  it("every status colour meets 4.5:1 on every surface", () => {
    for (const { token: name } of Object.values(stageTreatment)) {
      for (const bg of surfaces) expect(contrast(token(name), token(bg)), `${name} on ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("each stage's glyph class uses that stage's token", () => {
    for (const [stage, { token: name }] of Object.entries(stageTreatment)) {
      expect(baseCss, stage).toMatch(new RegExp(`\\.glyph--${stage} \\{\\s*color: var\\(${name}\\);`));
    }
  });

  it("keeps blue only as the semantic pre-release colour", () => {
    expect(token("--status-prerelease")).toBe("#7cb2ff");
    expect(tokensCss).not.toMatch(/--accent\b/);
  });

  it("the retired accent is gone from styles, components and brand sources", () => {
    const files = [
      ...readdirSync(join(__dirname)).filter((f) => f.endsWith(".css")).map((f) => `src/styles/${f}`),
      "src/index.css",
      "index.html",
      "scripts/og-image.html",
      "public/site.webmanifest",
    ];
    for (const f of files) expect(read(f), f).not.toMatch(retiredAccent);
    expect(read("index.html")).toContain('<meta name="theme-color" content="#0b0b0c" />');
  });
});
