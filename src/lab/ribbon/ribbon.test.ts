import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { pick, selectedSlugs } from "../../content/projects";
import {
  DWELL,
  ENTRY_CLEAR,
  EXIT_CLEAR,
  FADE_VISIBLE,
  LEAD,
  PERSPECTIVE,
  REACH,
  apparentScale,
  buildTrack,
  cardSize,
  displacement,
  firstSentence,
  indexToProgress,
  onStage,
  poseFor,
  progressToIndex,
  projectedBox,
  scrollSteps,
  type CardSize,
} from "./ribbonLayout";
import { RIBBON_QUERY } from "./ribbonController";
import { ProjectRibbon } from "./ProjectRibbon";

const stages: [number, number][] = [
  [1200, 680],
  [1440, 900],
  [1920, 1080],
  [1180, 820],
  [1024, 660],
  [2560, 1080],
  [1366, 1366],
];

describe("ribbon track", () => {
  for (const [w, h] of stages) {
    it(`fits a ${w}×${h} stage: enters bottom-left, focus mid-stage, leaves top-right`, () => {
      const t = buildTrack(w, h);
      const start = t.at(0);
      const end = t.at(t.length);
      const focus = t.at(t.focus);
      expect(start.x).toBeLessThan(0);
      expect(start.y).toBeGreaterThan(h);
      expect(end.x).toBeGreaterThan(w);
      expect(end.y).toBeLessThan(0);
      expect(Math.abs(focus.x - w / 2)).toBeLessThan(0.01);
      expect(focus.y / h).toBeGreaterThan(0.45);
      expect(focus.y / h).toBeLessThan(0.6);
      // Nearly level through the focus.
      expect(Math.abs((focus.angle * 180) / Math.PI)).toBeLessThan(8);
    });

    it(`moves at an even speed along the ${w}×${h} path`, () => {
      const t = buildTrack(w, h);
      const step = t.length / 400;
      let prev = t.at(0);
      for (let i = 1; i <= 400; i++) {
        const p = t.at(i * step);
        const d = Math.hypot(p.x - prev.x, p.y - prev.y);
        // Chords are never longer than the arc and barely shorter on curves.
        expect(d).toBeLessThanOrEqual(step + 1e-6);
        expect(d).toBeGreaterThan(step * 0.97);
        prev = p;
      }
    });
  }
});

describe("card poses", () => {
  const t = buildTrack(1440, 900);

  it("rests flat, full size and opaque at the focus, through the dwell", () => {
    for (const offset of [0, DWELL * 0.9, -DWELL * 0.9]) {
      const p = poseFor(t, offset);
      expect(p).toMatchObject({ scale: 1, rotateY: 0, rotateZ: 0, z: 0, opacity: 1, shade: 0 });
      expect(Math.abs(p.x - t.at(t.focus).x)).toBeLessThan(1e-6);
    }
  });

  it("travels left to right along the path as the offset falls", () => {
    let prevX = -Infinity;
    for (let o = 2; o >= -2; o -= 0.05) {
      const { x } = poseFor(t, o);
      expect(x).toBeGreaterThanOrEqual(prevX - 1e-6);
      prevX = x;
    }
  });

  it("puts neighbours on the entry diagonal and the exit curve, visible and inside the stage", () => {
    const focus = t.at(t.focus);
    const next = poseFor(t, 1);
    const prev = poseFor(t, -1);
    expect(next.y).toBeGreaterThan(focus.y);
    expect(prev.y).toBeLessThan(focus.y);
    for (const p of [next, prev]) {
      expect(p.opacity).toBe(1);
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(1440);
      expect(p.scale).toBeGreaterThanOrEqual(0.7);
      expect(Math.abs(p.rotateY)).toBeLessThanOrEqual(16);
    }
  });

  it("fades out before reaching either end, and stays restrained in every pose", () => {
    for (const o of [REACH, -REACH, 3, -3]) expect(poseFor(t, o).opacity).toBe(0);
    // Depth shades only the picture, and lightly.
    for (let o = -3; o <= 3; o += 0.1) expect(poseFor(t, o).shade).toBeLessThanOrEqual(0.4);
    for (let o = -3; o <= 3; o += 0.1) {
      const p = poseFor(t, o);
      expect(p.scale).toBeGreaterThanOrEqual(0.7);
      expect(Math.abs(p.rotateY)).toBeLessThanOrEqual(16);
      expect(Math.abs(p.rotateZ)).toBeLessThanOrEqual(20);
    }
  });

  it("eases out of the dwell without a jump, on both sides", () => {
    for (const sign of [1, -1]) {
      const side = sign > 0 ? t.focus : t.length - t.focus;
      expect(displacement(t, sign * DWELL)).toBe(0);
      expect(displacement(t, sign * (DWELL + 0.01))).toBeLessThan(0.005 * side);
      expect(displacement(t, sign * REACH)).toBeCloseTo(side, 6);
    }
  });

  it("appears centred on the line at any depth", () => {
    for (const o of [-1.2, -0.6, 0.4, 1, 1.3]) {
      const p = poseFor(t, o);
      const f = PERSPECTIVE / (PERSPECTIVE - p.z);
      expect(720 + (p.x - 720) * f).toBeCloseTo(p.px, 6);
      expect(450 + (p.y - 450) * f).toBeCloseTo(p.py, 6);
      const box = projectedBox(t, { ...p, rotateY: 0, rotateZ: 0 }, cardSize(1440));
      expect((box.left + box.right) / 2).toBeCloseTo(p.px, 6);
    }
  });
});

/* ---------- handoffs ---------- */

type Box = ReturnType<typeof projectedBox>;
const overlaps = (a: Box, b: Box) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/** Four cards' poses and on-screen boxes across the whole scroll, sampled finely. */
function sweep(w: number, h: number, size: CardSize) {
  const track = buildTrack(w, h);
  const f = track.at(track.focus);
  // The focal box: where the active card rests.
  const focal: Box = { left: f.x - size.w / 2, right: f.x + size.w / 2, top: f.y - size.h / 2, bottom: f.y + size.h / 2 };
  const frames = [];
  for (let n = 0; n <= 1000; n++) {
    const index = -LEAD + (n / 1000) * (3 + 2 * LEAD);
    const poses = [0, 1, 2, 3].map((i) => poseFor(track, i - index, size));
    frames.push({ index, poses, boxes: poses.map((p) => projectedBox(track, p, size)) });
  }
  return { track, focal, frames };
}

describe("handoffs", () => {
  // The tallest card as rendered (Atlas, measured in Chromium), at four supported stages.
  const tallest: [number, number, CardSize][] = [
    [1200, 680, { w: 340, h: 569 }],
    [1366, 768, { w: 382, h: 578 }],
    [1440, 900, { w: 403, h: 593 }],
    [1920, 1080, { w: 420, h: 586 }],
  ];
  // Every supported stage with the stylesheet's nominal card size, and the tallest real cards.
  const cases: [number, number, CardSize][] = [
    ...stages.filter(([w, h]) => w >= 1200 && h >= 680).map(([w, h]): [number, number, CardSize] => [w, h, cardSize(w)]),
    ...tallest,
  ];

  for (const [w, h, size] of [...cases, [1200, 680, { w: 340, h: 508 }] as [number, number, CardSize]]) {
    it(`rests each neighbour wholly on stage (${w}×${h}, ${Math.round(size.w)}×${size.h} cards)`, () => {
      const track = buildTrack(w, h);
      for (const o of [1, -1]) {
        const b = projectedBox(track, poseFor(track, o, size), size);
        expect(b.left, `offset ${o}`).toBeGreaterThanOrEqual(12 - 1e-6);
        expect(b.top, `offset ${o}`).toBeGreaterThanOrEqual(12 - 1e-6);
        expect(w - b.right, `offset ${o}`).toBeGreaterThanOrEqual(12 - 1e-6);
        expect(h - b.bottom, `offset ${o}`).toBeGreaterThanOrEqual(12 - 1e-6);
      }
    });
  }

  for (const [w, h, size] of cases) {
    const label = `${w}×${h}, ${Math.round(size.w)}×${size.h} cards`;

    it(`never has two cards in the focal box (${label})`, () => {
      const { focal, frames } = sweep(w, h, size);
      for (const { index, poses, boxes } of frames) {
        const inFocus = boxes.filter((b, i) => poses[i].opacity > 0 && overlaps(b, focal));
        expect(inFocus.length, `index ${index.toFixed(3)}`).toBeLessThanOrEqual(1);
      }
    });

    it(`keeps every other card off the active one (${label})`, () => {
      const { frames } = sweep(w, h, size);
      for (const { index, poses, boxes } of frames) {
        const active = Math.min(3, Math.max(0, Math.round(index)));
        for (let i = 0; i < 4; i++) {
          if (i === active || poses[i].opacity === 0) continue;
          expect(overlaps(boxes[i], boxes[active]), `index ${index.toFixed(3)}: card ${i} on ${active}`).toBe(false);
        }
      }
    });

    it(`lets the outgoing card leave before the incoming one arrives (${label})`, () => {
      const { track, focal } = sweep(w, h, size);
      for (let x = 0; x <= 1.0001; x += 0.01) {
        const out = projectedBox(track, poseFor(track, -x, size), size);
        const inc = projectedBox(track, poseFor(track, 1 - x, size), size);
        expect(overlaps(out, focal) && overlaps(inc, focal), `x ${x.toFixed(2)}`).toBe(false);
        if (x >= EXIT_CLEAR) expect(overlaps(out, focal), `out at x ${x.toFixed(2)}`).toBe(false);
        if (1 - x >= ENTRY_CLEAR) expect(overlaps(inc, focal), `in at x ${x.toFixed(2)}`).toBe(false);
      }
    });

    it(`is opaque while mostly on stage, and moves without jumps (${label})`, () => {
      const { track, frames } = sweep(w, h, size);
      for (let f = 0; f < frames.length; f++) {
        const { index, poses, boxes } = frames[f];
        poses.forEach((p, i) => {
          if (p.opacity < 1) expect(onStage(track, boxes[i]), `index ${index.toFixed(3)} card ${i}`).toBeLessThan(FADE_VISIBLE);
          if (f === 0) return;
          const q = frames[f - 1].poses[i];
          const step = index - frames[f - 1].index;
          // Bounded speeds per card step of scroll: position, scale, opacity.
          expect(Math.hypot(p.px - q.px, p.py - q.py) / step).toBeLessThan(6 * size.w);
          expect(Math.abs(p.scale - q.scale) / step).toBeLessThan(1);
          expect(Math.abs(p.opacity - q.opacity) / step).toBeLessThan(10);
        });
      }
    });
  }

  it("only ever shows the focus point a card at its natural size", () => {
    const track = buildTrack(1440, 900);
    for (let o = -REACH; o <= REACH; o += 0.005) {
      const p = poseFor(track, o);
      if (Math.abs(p.px - 720) < 1) expect(p.scale).toBeGreaterThan(0.999);
    }
  });

  it("never draws an opaque card smaller than 0.7 of its natural size", () => {
    let min = 1;
    for (const [w, h] of stages) {
      const track = buildTrack(w, h);
      for (let o = -REACH; o <= REACH; o += 0.01) {
        if (poseFor(track, o).opacity === 1) min = Math.min(min, apparentScale(Math.abs(o)));
      }
    }
    // 13px limitation text is then never drawn below 9px.
    expect(min).toBeGreaterThanOrEqual(0.7);
  });
});

describe("scroll mapping", () => {
  it("runs from the first card arriving to the last card leaving", () => {
    expect(progressToIndex(0, 4)).toBeCloseTo(-LEAD);
    expect(progressToIndex(1, 4)).toBeCloseTo(3 + LEAD);
    expect(progressToIndex(-1, 4)).toBeCloseTo(-LEAD);
    expect(progressToIndex(2, 4)).toBeCloseTo(3 + LEAD);
    for (let i = 0; i < 4; i++) expect(progressToIndex(indexToProgress(i, 4), 4)).toBeCloseTo(i);
  });

  it("gives four cards a deliberate, bounded scroll length", () => {
    const steps = scrollSteps(4);
    expect(steps).toBeGreaterThan(3);
    expect(steps).toBeLessThan(4.5);
  });

  it("uses the same live-layout query as the stylesheet: at least 1200×680, motion allowed", () => {
    const css = readFileSync(join(__dirname, "ribbon.css"), "utf8");
    expect(RIBBON_QUERY).toBe("(min-width: 1200px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)");
    expect(css).toContain(`@media ${RIBBON_QUERY} {`);
    // No other rule keys off the window's height or motion preference.
    const media = [...css.matchAll(/@media ([^{]+) \{/g)].map((m) => m[1]);
    expect(media.filter((q) => /height|motion/.test(q))).toEqual([RIBBON_QUERY]);
  });

  it("shares its perspective and card width with the stylesheet", () => {
    const css = readFileSync(join(__dirname, "ribbon.css"), "utf8");
    expect(css).toContain(`perspective: ${PERSPECTIVE}px;`);
    expect(css).toContain("width: clamp(340px, 28vw, 420px);");
    expect(cardSize(1000).w).toBe(340);
    expect(cardSize(1440).w).toBeCloseTo(403.2);
    expect(cardSize(2000).w).toBe(420);
  });

  it("never dims a card's text: the only shade is over its picture", () => {
    const css = readFileSync(join(__dirname, "ribbon.css"), "utf8");
    const rules = css.replace(/\/\*[\s\S]*?\*\//g, "");
    const shaded = [...rules.matchAll(/([^{}]+)\{[^}]*var\(--shade/g)].map((m) => m[1].trim());
    expect(shaded).toEqual([".js .ribbon-visual::before"]);
    expect(css).not.toMatch(/ribbon-(article|copy|card)[^{]*::(after|before)/);
    expect(css).not.toMatch(/filter:/);
  });
});

describe("ribbon content", () => {
  const projects = pick(selectedSlugs);
  const html = renderToStaticMarkup(
    createElement(StaticRouter, { location: "/lab" }, createElement(ProjectRibbon, { projects })),
  );
  const decode = (s: string) => s.replace(/&#x27;/g, "'").replace(/&amp;/g, "&");

  it("shows the four selected projects in order, with their own content", () => {
    const titles = [...html.matchAll(/<h3 id="ribbon-[^"]+" class="ribbon-title">([^<]+)<\/h3>/g)].map((m) => m[1]);
    expect(titles).toEqual(["Nexus", "Atlas", "Reflux", "ExtendSpace"]);
    for (const p of projects) {
      expect(decode(html)).toContain(p.status);
      expect(decode(html)).toContain(p.question!);
      expect(decode(html)).toContain(firstSentence(p.limits));
      expect(html).toContain(`href="/work/${p.slug}"`);
      expect(html).toContain(`>Read the ${p.title} case study</a>`);
    }
  });

  it("labels the one real screenshot as such and every drawing as an illustration", () => {
    expect([...html.matchAll(/<figcaption class="tag">Screenshot<\/figcaption>/g)]).toHaveLength(1);
    expect([...html.matchAll(/<figcaption class="tag">Illustration<\/figcaption>/g)]).toHaveLength(3);
    expect(html).toContain('src="/images/atlas/atlas-1.0-ask.webp"');
  });

  it("quotes each limitation as a whole first sentence", () => {
    for (const p of projects) {
      const s = firstSentence(p.limits);
      expect(p.limits.startsWith(s)).toBe(true);
      expect(s).toMatch(/[.!?]$/);
    }
    expect(firstSentence("Version 1.0.3 shipped. Next.")).toBe("Version 1.0.3 shipped.");
  });
});
