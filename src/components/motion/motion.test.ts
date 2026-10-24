import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RIBBON_SEGMENTS, RIBBON_START, fit, ribbonPath, type Point } from "./ribbonGeometry";
import { MAX_STAGGER, isPastOrVisible, revealProps, staggerIndex } from "./reveal";
import { MAX_TILT, tiltFor } from "../../hooks/usePointerTilt";

const css = (f: string) => readFileSync(join(__dirname, "..", "..", "styles", f), "utf8");

describe("ribbon geometry", () => {
  it("enters beyond the bottom-left and leaves beyond the top-right", () => {
    expect(RIBBON_START[0]).toBeLessThan(0);
    expect(RIBBON_START[1]).toBeGreaterThan(1);
    const end = RIBBON_SEGMENTS.at(-1)![2];
    expect(end[0]).toBeGreaterThan(1);
    expect(end[1]).toBeLessThan(0);
  });

  it("joins segments without a kink (tangent-continuous)", () => {
    const direction = (a: Point, b: Point) => Math.atan2(b[1] - a[1], b[0] - a[0]);
    for (let i = 1; i < RIBBON_SEGMENTS.length; i++) {
      const [, c2, join] = RIBBON_SEGMENTS[i - 1];
      const [c1] = RIBBON_SEGMENTS[i];
      expect(Math.abs(direction(c2, join) - direction(join, c1)), `join ${i}`).toBeLessThan(1e-6);
    }
  });

  it("runs almost level through the middle and turns up after 70% of the width", () => {
    const [, , runEnd] = RIBBON_SEGMENTS[1];
    const [, , runStart] = RIBBON_SEGMENTS[0];
    expect(Math.abs(runEnd[1] - runStart[1])).toBeLessThan(0.1);
    expect(runEnd[0]).toBeGreaterThan(0.7);
  });

  it("builds stable path data, optionally fitted into another box", () => {
    expect(ribbonPath(2)).toBe("M0.74 0.5C0.86 0.47 0.98 0.2 1.1 -0.16");
    const map = fit([0.74, 0.5], [1.1, -0.16], [0, 1], [1, 0]);
    expect(ribbonPath(2, map)).toMatch(/^M0 1C.* 1 0$/);
    expect(ribbonPath(2, map, 0.1)).toMatch(/^M0 1\.1C.* 1 0\.1$/);
  });
});

describe("reveal", () => {
  it("caps and sanitises the stagger index", () => {
    expect(staggerIndex(0)).toBe(0);
    expect(staggerIndex(3.4)).toBe(3);
    expect(staggerIndex(-2)).toBe(0);
    expect(staggerIndex(40)).toBe(MAX_STAGGER);
    expect(staggerIndex(NaN)).toBe(0);
    expect(revealProps(2)).toEqual({ "data-reveal": "", style: { "--reveal-index": 2 } });
  });

  it("treats anything on screen or already scrolled past as revealed", () => {
    expect(isPastOrVisible({ top: 100 }, 800)).toBe(true);
    expect(isPastOrVisible({ top: -2000 }, 800)).toBe(true);
    expect(isPastOrVisible({ top: 801 }, 800)).toBe(false);
  });

  it("hides content only under html.motion-ready with motion allowed", () => {
    const motion = css("motion.css");
    const hidden = motion.match(/([^{}]+)\{\s*opacity: 0;/g) ?? [];
    expect(hidden.length).toBeGreaterThan(0);
    for (const rule of hidden) expect(rule).toMatch(/\.motion-ready \[data-reveal\]:not\(\[data-revealed\]\)/);
    expect(motion).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.motion-ready \[data-reveal\] \{/);
  });
});

describe("pointer tilt", () => {
  it("is flat at the centre and at most 3° at the edges", () => {
    expect(tiltFor(0.5, 0.5)).toEqual({ rotateX: 0, rotateY: 0 });
    expect(tiltFor(1, 0)).toEqual({ rotateX: MAX_TILT, rotateY: MAX_TILT });
    expect(tiltFor(0, 1)).toEqual({ rotateX: -MAX_TILT, rotateY: -MAX_TILT });
  });

  it("clamps pointers outside the element and bad input", () => {
    expect(tiltFor(4, -3)).toEqual({ rotateX: 3, rotateY: 3 });
    expect(tiltFor(NaN, Infinity)).toEqual({ rotateX: 0, rotateY: 0 });
    expect(tiltFor(0.75, 0.25, 2)).toEqual({ rotateX: 1, rotateY: 1 });
  });
});

describe("hero entrance CSS", () => {
  const pages = css("pages.css");

  it("never fades the headline: its keyframes move it only", () => {
    const lift = pages.match(/@keyframes hero-lift \{([\s\S]*?)\n\}/)![1];
    expect(lift).toContain("transform");
    expect(lift).not.toContain("opacity");
    expect(pages).toMatch(/\.hero-title \{\s*animation: hero-lift /);
  });

  it("plays only with JavaScript, motion allowed and before intro-done", () => {
    const block = pages.slice(pages.indexOf("@keyframes hero-rise"));
    const animated = block.match(/^\s*[^{}@]+\{\s*animation:/gm) ?? [];
    expect(animated.length).toBeGreaterThanOrEqual(5);
    for (const rule of animated) expect(rule).toMatch(/\.js:not\(\.intro-done\)/);
    expect(block).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*\.js:not\(\.intro-done\)/);
  });

  it("keeps the whole headline warm white", () => {
    expect(pages).toMatch(/\.hero-title \{[^}]*color: var\(--fg\);/);
    expect(pages).not.toMatch(/\.hero-title em \{[^}]*color:/);
  });
});
