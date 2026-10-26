/*
 * Pure geometry for the connected ribbon ("receding corridor").
 *
 * The segments form one chain: each segment's left edge sits on the previous
 * segment's right edge. A fractional selection `s` sets every segment's yaw:
 * the selected segment faces the viewer; earlier segments fold steeply away
 * out of frame on the left; later segments turn progressively further, so
 * they recede along a wall that narrows into depth. Positions accumulate
 * along the chain, so the band is connected at every fold for any `s`,
 * including mid-animation and mid-drag.
 *
 * Positions are in units of one segment width, so the same pose can be
 * rendered on the server (CSS calc with --seg-w) and on the client.
 */

export type Pose = {
  /** Left-edge offset from the focus point, in segment widths. */
  x: number;
  z: number;
  /** Yaw in degrees; positive turns the right edge away from the viewer. */
  angle: number;
  /** 0..1 darkness for segments turned away or far down the wall. */
  shade: number;
};

export type Fold = { max: number; curve: number };
export type RibbonShape = { past: Fold; next: Fold };

export const DESKTOP_SHAPE: RibbonShape = { past: { max: 64, curve: 1.1 }, next: { max: 62, curve: 0.55 } };
export const COMPACT_SHAPE: RibbonShape = { past: { max: 60, curve: 1.1 }, next: { max: 60, curve: 0.6 } };

export function angleFor(d: number, shape: RibbonShape) {
  return d < 0 ? -shape.past.max * Math.tanh(-d * shape.past.curve) : shape.next.max * Math.tanh(d * shape.next.curve);
}

export function poses(count: number, s: number, shape: RibbonShape = DESKTOP_SHAPE): Pose[] {
  const angles: number[] = [];
  const left: { x: number; z: number }[] = [{ x: 0, z: 0 }];
  for (let i = 0; i < count; i++) {
    const a = angleFor(i - s, shape);
    const r = (a * Math.PI) / 180;
    angles.push(a);
    left.push({ x: left[i].x + Math.cos(r), z: left[i].z - Math.sin(r) });
  }
  // Focus: the centre of the (fractionally) selected segment.
  const t = Math.min(count, Math.max(0, s + 0.5));
  const i0 = Math.min(count - 1, Math.floor(t));
  const f = t - i0;
  const r0 = (angles[i0] * Math.PI) / 180;
  const fx = left[i0].x + f * Math.cos(r0);
  const fz = left[i0].z - f * Math.sin(r0);
  return angles.map((angle, i) => {
    const d = i - s;
    const turn = Math.abs(Math.sin((angle * Math.PI) / 180));
    const shade = d < 0 ? Math.min(0.8, turn * 0.95) : Math.min(0.62, turn * 0.55 + Math.max(0, d - 1) * 0.1);
    return { x: left[i].x - fx, z: left[i].z - fz, angle, shade: Math.max(0, shade) };
  });
}

/** The CSS transform for a pose, scaled by the --seg-w custom property. */
export function poseTransform(p: Pose): string {
  const n = (v: number) => (Math.abs(v) < 1e-6 ? 0 : v).toFixed(4);
  return `translate3d(calc(var(--seg-w) * ${n(p.x)}), 0px, calc(var(--seg-w) * ${n(p.z)})) rotateY(${n(p.angle)}deg)`;
}
