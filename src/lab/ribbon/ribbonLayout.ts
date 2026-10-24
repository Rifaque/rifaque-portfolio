import { RIBBON_SEGMENTS, RIBBON_START, type Point } from "../../components/motion/ribbonGeometry";

/*
 * Pure layout for the ribbon prototype: the shared ribbon path in pixels,
 * an arc-length table so cards travel at an even speed along diagonal,
 * level and curved parts alike, and a pose for a card at a given distance
 * from the focus. No DOM access; RibbonController applies the results.
 */

export type Sample = { x: number; y: number; angle: number };

export type RibbonTrack = {
  width: number;
  height: number;
  /** Total length in px. */
  length: number;
  /** Arc length (px) of the focus point: where the level run crosses mid-width. */
  focus: number;
  at(arc: number): Sample;
  /** Arc length (px) where the path crosses x (x only ever increases along it). */
  arcAtX(x: number): number;
};

const SAMPLES_PER_SEGMENT = 160;

function cubic(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

/** Builds the arc-length table for the ribbon stretched over a width × height stage. */
export function buildTrack(width: number, height: number, focusX = 0.5): RibbonTrack {
  const scale = ([x, y]: Point): Point => [x * width, y * height];
  const xs: number[] = [];
  const ys: number[] = [];
  const arcs: number[] = [];
  let prev = scale(RIBBON_START);
  let total = 0;
  xs.push(prev[0]);
  ys.push(prev[1]);
  arcs.push(0);
  let from = RIBBON_START;
  for (const [c1, c2, end] of RIBBON_SEGMENTS) {
    for (let i = 1; i <= SAMPLES_PER_SEGMENT; i++) {
      const p = scale(cubic(from, c1, c2, end, i / SAMPLES_PER_SEGMENT));
      total += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
      xs.push(p[0]);
      ys.push(p[1]);
      arcs.push(total);
      prev = p;
    }
    from = end;
  }

  // The focus is on the level run, exactly where it crosses focusX of the
  // width (interpolated between samples).
  let focus = 0;
  const targetX = focusX * width;
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] >= targetX) {
      const t = (targetX - xs[i - 1]) / (xs[i] - xs[i - 1] || 1);
      focus = arcs[i - 1] + t * (arcs[i] - arcs[i - 1]);
      break;
    }
  }

  const at = (arc: number): Sample => {
    const a = Math.min(Math.max(arc, 0), total);
    let lo = 0;
    let hi = arcs.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (arcs[mid] <= a) lo = mid;
      else hi = mid;
    }
    const span = arcs[hi] - arcs[lo] || 1;
    const t = (a - arcs[lo]) / span;
    return {
      x: xs[lo] + (xs[hi] - xs[lo]) * t,
      y: ys[lo] + (ys[hi] - ys[lo]) * t,
      angle: Math.atan2(ys[hi] - ys[lo], xs[hi] - xs[lo]),
    };
  };

  const arcAtX = (x: number) => {
    if (x <= xs[0]) return 0;
    let lo = 0;
    let hi = xs.length - 1;
    if (x >= xs[hi]) return total;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (xs[mid] <= x) lo = mid;
      else hi = mid;
    }
    return arcs[lo] + ((x - xs[lo]) / (xs[hi] - xs[lo] || 1)) * (arcs[hi] - arcs[lo]);
  };

  return { width, height, length: total, focus, at, arcAtX };
}

/* ---------- poses ---------- */

/** Cards hold still at the focus while |offset| is below this. */
export const DWELL = 0.16;
/** By this offset the outgoing card has left the focal box (the resting card's footprint). */
export const EXIT_CLEAR = 0.48;
/** Until this offset the incoming card stays outside the focal box. */
export const ENTRY_CLEAR = 0.52;
/** At |offset| = REACH a card has travelled to the end of the path, out of view. */
export const REACH = 1.7;
/** The stage's CSS perspective (px); keep equal to ribbon.css. */
export const PERSPECTIVE = 1600;
/** Clear space (px) between the focal box and a card that has left it. */
const GAP = 24;
/** How far (px) a fully receded card sits behind the focus. */
const MAX_DEPTH = 180;
/** How much a fully receded card shrinks (before perspective). */
const SHRINK = 0.2;

export type CardSize = { w: number; h: number };

/** The card size ribbon.css gives a stage of this width, for when none is measured. */
export function cardSize(stageWidth: number): CardSize {
  const w = Math.min(420, Math.max(340, stageWidth * 0.28));
  return { w, h: Math.round(w * 1.4) };
}

export type Pose = {
  /** Where the card's centre is translated to, before perspective. */
  x: number;
  y: number;
  /** Where its centre appears, after perspective: on the path. */
  px: number;
  py: number;
  scale: number;
  rotateY: number;
  rotateZ: number;
  z: number;
  opacity: number;
  /** 0..1 strength of the shade over the card's picture (never its text). */
  shade: number;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (t: number) => t * t * (3 - 2 * t);

/** 0 at the focus, 1 fully receded; eases out of the dwell. */
const depthAt = (t: number) => smooth(clamp01((t - DWELL) / 1.2));

/** On-screen size relative to a resting card: scale times the perspective shrink. */
export function apparentScale(t: number) {
  const d = depthAt(t);
  return (1 - SHRINK * d) * (PERSPECTIVE / (PERSPECTIVE + MAX_DEPTH * d));
}

/**
 * Monotone cubic through (xs, ys) (Fritsch–Butland slopes), level at the
 * first knot so a card eases out of the dwell with no jolt.
 */
function monotone(xs: number[], ys: number[], x: number) {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  const h = xs.slice(1).map((v, i) => v - xs[i]);
  const d = h.map((hi, i) => (ys[i + 1] - ys[i]) / hi);
  const m = [0];
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) m.push(0);
    else {
      const w1 = 2 * h[i] + h[i - 1];
      const w2 = h[i] + 2 * h[i - 1];
      m.push((w1 + w2) / (w1 / d[i - 1] + w2 / d[i]));
    }
  }
  m.push(d[n - 2]);
  let i = 0;
  while (x > xs[i + 1]) i++;
  const u = (x - xs[i]) / h[i];
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    (2 * u3 - 3 * u2 + 1) * ys[i] +
    (u3 - 2 * u2 + u) * h[i] * m[i] +
    (-2 * u3 + 3 * u2) * ys[i + 1] +
    (u3 - u2) * h[i] * m[i + 1]
  );
}

/**
 * How far (arc px) a card `offset` cards from the focus has moved from it.
 * The handoff is staggered: the outgoing card clears the focal box by
 * EXIT_CLEAR, while the incoming one waits outside it on the approach until
 * ENTRY_CLEAR and only then moves in. So two cards never share the focus.
 * Clearances are in pixels of this stage and card, so it holds for any size.
 */
export function displacement(track: RibbonTrack, offset: number, size: CardSize = cardSize(track.width)) {
  const entering = offset >= 0;
  const t = Math.abs(offset);
  const side = entering ? track.focus : track.length - track.focus;
  const anchor = entering ? ENTRY_CLEAR : EXIT_CLEAR;
  const reach = size.w / 2 + (apparentScale(anchor) * size.w) / 2 + GAP;
  const fx = track.at(track.focus).x;
  const clear = Math.min(0.6 * side, Math.abs(track.arcAtX(entering ? fx - reach : fx + reach) - track.focus));
  // Where a neighbour waits at |offset| 1: a little beyond clear, but never
  // so far that this card (at its own measured size) leaves the stage.
  const rest = restFor(track, size, entering, clear, Math.min(0.8 * side, clear + (entering ? 0.3 : 0.35) * size.w));
  // Beyond that, cards hurry off: by |offset| 1.4 a card is far enough out
  // that it never touches the next one handing over behind it.
  const away = Math.max(rest, Math.min(0.95 * side, clear + 1.8 * size.w));
  return monotone([DWELL, anchor, 1, 1.4, REACH], [0, clear, rest, away, side], t);
}

/**
 * Pose for a card `offset` cards ahead of (positive: not yet arrived, on the
 * entry side) or behind (negative: leaving) the focus. At the focus the card
 * is flat, full size and fully opaque; away from it, it shrinks, turns a
 * little with the path and recedes in depth. Its text is never dimmed: it
 * only fades while crossing the edge of the stage, on its way out.
 */
export function poseFor(
  track: RibbonTrack,
  offset: number,
  size: CardSize = cardSize(track.width),
  fade = true,
): Pose {
  return {
    ...placeAt(track, offset, displacement(track, offset, size)),
    opacity: fade ? fadeAt(track, size, offset >= 0, Math.abs(offset)) : 1,
  };
}

/** A card's pose `offset` cards from the focus, moved `d` arc px along the path; fully opaque. */
function placeAt(track: RibbonTrack, offset: number, d: number): Pose {
  const t = Math.abs(offset);
  const arc = track.focus + (offset >= 0 ? -1 : 1) * d;
  const { x, y, angle } = track.at(arc);
  const depth = depthAt(t);
  const z = -MAX_DEPTH * depth || 0;
  // Push the card out from the perspective origin (the stage centre) by as
  // much as depth pulls it in, so it appears centred on the line.
  const k = (PERSPECTIVE - z) / PERSPECTIVE;
  const cx = track.width / 2;
  const cy = track.height / 2;
  return {
    x: cx + (x - cx) * k,
    y: cy + (y - cy) * k,
    px: x,
    py: y,
    scale: 1 - SHRINK * depth,
    rotateY: (offset >= 0 ? 16 : -16) * depth || 0,
    // Follow the path's slope gently; the level run keeps the active card flat.
    rotateZ: t <= DWELL ? 0 : ((angle * 180) / Math.PI) * 0.32 * depth,
    z,
    opacity: 1,
    shade: 0.4 * depth,
  };
}

const fades = new WeakMap<RibbonTrack, Map<string, number>>();
const rests = new WeakMap<RibbonTrack, Map<string, number>>();

/** Space (px) kept between a resting neighbour and the edge of the stage. */
const EDGE = 12;

/**
 * The resting displacement for a neighbour: `wanted`, or less if that would
 * put any part of this card (projected, turned and tilted) within EDGE of the
 * stage's edge. Never less than `clear`: it must still be out of the focus.
 */
function restFor(track: RibbonTrack, size: CardSize, entering: boolean, clear: number, wanted: number) {
  let cache = rests.get(track);
  if (!cache) rests.set(track, (cache = new Map()));
  const key = `${size.w}x${size.h}:${entering}`;
  let found = cache.get(key);
  if (found === undefined) {
    const offset = entering ? 1 : -1;
    const fits = (d: number) => {
      const b = projectedBox(track, placeAt(track, offset, d), size);
      return b.left >= EDGE && b.top >= EDGE && b.right <= track.width - EDGE && b.bottom <= track.height - EDGE;
    };
    if (fits(wanted) || !fits(clear)) found = fits(wanted) ? wanted : clear;
    else {
      let lo = clear;
      let hi = wanted;
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        if (fits(mid)) lo = mid;
        else hi = mid;
      }
      found = lo;
    }
    cache.set(key, found);
  }
  return found;
}

/** Below this share of its box on stage, a leaving card starts to fade. */
export const FADE_VISIBLE = 0.6;
/** A fade takes between these many card steps: never a cut, never lingering. */
const MIN_FADE = 0.15;
const MAX_FADE = 0.3;

/** Share (0..1) of a box that lies on the stage. */
export function onStage(track: RibbonTrack, b: { left: number; right: number; top: number; bottom: number }) {
  const w = Math.max(0, Math.min(b.right, track.width) - Math.max(b.left, 0));
  const h = Math.max(0, Math.min(b.bottom, track.height) - Math.max(b.top, 0));
  return (w * h) / ((b.right - b.left) * (b.bottom - b.top));
}

/**
 * The |offset| at which a card on this side has less than FADE_VISIBLE of
 * itself on stage. It fades only from there to REACH: a card that is mostly
 * on stage is always fully opaque (clipped by the edge, never translucent).
 */
function fadeFrom(track: RibbonTrack, size: CardSize, entering: boolean) {
  let cache = fades.get(track);
  if (!cache) fades.set(track, (cache = new Map()));
  const key = `${size.w}x${size.h}:${entering}`;
  let found = cache.get(key);
  if (found === undefined) {
    const sign = entering ? 1 : -1;
    const inside = (t: number) => {
      return onStage(track, projectedBox(track, poseFor(track, sign * t, size, false), size)) >= FADE_VISIBLE;
    };
    let lo = DWELL;
    let hi = REACH;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inside(mid)) lo = mid;
      else hi = mid;
    }
    // Short of REACH by enough that the fade never becomes a cut.
    found = Math.min(lo, REACH - MIN_FADE);
    cache.set(key, found);
  }
  return found;
}

function fadeAt(track: RibbonTrack, size: CardSize, entering: boolean, t: number) {
  const from = fadeFrom(track, size, entering);
  return 1 - smooth(clamp01((t - from) / Math.min(MAX_FADE, REACH - from)));
}

/**
 * The on-screen bounding box of a card in a pose, as the browser draws it:
 * scale, rotateY, rotateZ, translate (the controller's order), then the
 * stage's perspective about its centre.
 */
export function projectedBox(track: RibbonTrack, pose: Pose, size: CardSize) {
  const ry = (pose.rotateY * Math.PI) / 180;
  const rz = (pose.rotateZ * Math.PI) / 180;
  const cx = track.width / 2;
  const cy = track.height / 2;
  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  let bottom = -Infinity;
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    let px = (sx * size.w * pose.scale) / 2;
    let py = (sy * size.h * pose.scale) / 2;
    let pz = -px * Math.sin(ry);
    px = px * Math.cos(ry);
    [px, py] = [px * Math.cos(rz) - py * Math.sin(rz), px * Math.sin(rz) + py * Math.cos(rz)];
    px += pose.x;
    py += pose.y;
    pz += pose.z;
    const f = PERSPECTIVE / (PERSPECTIVE - pz);
    const X = cx + (px - cx) * f;
    const Y = cy + (py - cy) * f;
    left = Math.min(left, X);
    right = Math.max(right, X);
    top = Math.min(top, Y);
    bottom = Math.max(bottom, Y);
  }
  return { left, right, top, bottom };
}

/* ---------- scroll ---------- */

/** Offsets of the first card at the start and the last card at the end of the stage. */
export const LEAD = 0.65;

/** Progress through the pinned stage (0..1) to the focus index: −LEAD … count−1+LEAD. */
export function progressToIndex(progress: number, count: number) {
  const p = clamp01(progress);
  return -LEAD + p * (count - 1 + 2 * LEAD);
}

/** Inverse of progressToIndex: the progress at which card `index` is at the focus. */
export function indexToProgress(index: number, count: number) {
  return (index + LEAD) / (count - 1 + 2 * LEAD);
}

/** Scroll steps (in stage heights) the track adds below the pinned stage. */
export function scrollSteps(count: number, perCard = 0.85) {
  return (count - 1 + 2 * LEAD) * perCard;
}

/** The first sentence of a passage: a complete claim, not a truncation. */
export function firstSentence(text: string) {
  const m = text.match(/^.*?[.!?](?=\s|$)/);
  return m ? m[0] : text;
}
