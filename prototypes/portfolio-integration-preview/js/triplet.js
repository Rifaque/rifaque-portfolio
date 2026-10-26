/*
 * The RSX solid.
 *
 * One object built from 9 × 9 × 9 cells. A cell is filled only where three
 * extruded letters overlap, so the solid's silhouette along each axis is
 * exactly one letter:
 *
 *   seen along x (from +x):        R    image row = 8 - j, col = 8 - k
 *   seen along z (from +z):        X    image row = 8 - j, col = i
 *   seen from above (from +y):     S    image row = k,     col = i
 *
 * The letter bitmaps were chosen by an exhaustive search (all letter-to-axis
 * assignments, several bold glyph cuts, four floor orientations) for a set
 * whose three projections are exact, not approximate: 183 cells, 0 missing
 * pixels. `verify()` re-checks that at runtime in the prototype's self-test.
 * The floor S is stored rotated; the top-down camera turns it upright.
 */
export const N = 9;

const R = [
  "########.",
  "#########",
  "##.....##",
  "##.....##",
  "#########",
  "########.",
  "##...###.",
  "##....###",
  "##.....##",
];
const X = [
  "##.....##",
  "###...###",
  ".###.###.",
  "..#####..",
  "...###...",
  "..#####..",
  ".###.###.",
  "###...###",
  "##.....##",
];
const S = [
  ".#..####.",
  "##.######",
  "##.##..##",
  "##.##..##",
  "##.##..##",
  "##.##..##",
  "##.##..##",
  "#####..##",
  ".###...#.",
];

const bits = (rows) => rows.map((r) => [...r].map((c) => c === "#"));
export const glyphs = { R: bits(R), X: bits(X), S: bits(S) };

/** Cells as [i, j, k] (x, y, z indices), bottom layer first. */
export const cells = (() => {
  const out = [];
  const { R: r, X: x, S: s } = glyphs;
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++)
      for (let k = 0; k < N; k++)
        if (r[N - 1 - j][N - 1 - k] && x[N - 1 - j][i] && s[k][i]) out.push([i, j, k]);
  return out;
})();

/** Number of letter pixels the solid fails to cover (0 means exact). */
export function verify() {
  const has = new Set(cells.map((c) => c.join(",")));
  const at = (i, j, k) => has.has(`${i},${j},${k}`);
  let miss = 0;
  for (let row = 0; row < N; row++)
    for (let col = 0; col < N; col++) {
      const any = (f) => { for (let t = 0; t < N; t++) if (f(t)) return true; return false; };
      if (glyphs.R[row][col] && !any((i) => at(i, N - 1 - row, N - 1 - col))) miss++;
      if (glyphs.X[row][col] && !any((k) => at(col, N - 1 - row, k))) miss++;
      if (glyphs.S[row][col] && !any((j) => at(col, j, row))) miss++;
    }
  return miss;
}
