/**
 * The project ribbon's path, in units of its box (x and y from 0 to 1, y
 * down). It enters beyond the bottom-left, rises diagonally, runs almost
 * level across the middle, curves up from about 75% of the width and leaves
 * beyond the top-right. The joins are tangent-continuous: each segment's
 * first control point continues the previous segment's last direction.
 *
 * The hero draws the last two segments as its motif, so the line it
 * introduces is the line the ribbon later follows.
 */

export type Point = readonly [x: number, y: number];
/** A cubic Bézier from the previous end point: two control points and an end. */
export type Segment = readonly [c1: Point, c2: Point, end: Point];

export const RIBBON_START: Point = [-0.12, 1.12];

export const RIBBON_SEGMENTS: readonly Segment[] = [
  // Entry: up the bottom-left diagonal.
  [
    [0.0, 0.9],
    [0.08, 0.62],
    [0.22, 0.58],
  ],
  // The long, nearly level run.
  [
    [0.36, 0.54],
    [0.62, 0.53],
    [0.74, 0.5],
  ],
  // Curving up and out through the top-right.
  [
    [0.86, 0.47],
    [0.98, 0.2],
    [1.1, -0.16],
  ],
];

/** Maps ribbon units into another box. */
export type Mapping = (p: Point) => Point;

/**
 * SVG path data for the segments from index `from` on, mapped and rounded.
 * Paired with viewBox="0 0 1 1" and preserveAspectRatio="none" it stretches
 * to any box; vector-effect="non-scaling-stroke" keeps the line a hairline.
 */
export function ribbonPath(from = 0, map: Mapping = (p) => p, dy = 0): string {
  const start = from === 0 ? RIBBON_START : RIBBON_SEGMENTS[from - 1][2];
  const fmt = ([x, y]: Point) => {
    const [mx, my] = map([x, y]);
    return `${round(mx)} ${round(my + dy)}`;
  };
  return `M${fmt(start)}${RIBBON_SEGMENTS.slice(from)
    .map(([c1, c2, end]) => `C${fmt(c1)} ${fmt(c2)} ${fmt(end)}`)
    .join("")}`;
}

/** An affine map taking ribbon point `a` to `A` and `b` to `B`, per axis. */
export function fit(a: Point, b: Point, A: Point, B: Point): Mapping {
  const sx = (B[0] - A[0]) / (b[0] - a[0]);
  const sy = (B[1] - A[1]) / (b[1] - a[1]);
  return ([x, y]) => [A[0] + (x - a[0]) * sx, A[1] + (y - a[1]) * sy];
}

function round(n: number) {
  return Math.round(n * 10000) / 10000;
}
