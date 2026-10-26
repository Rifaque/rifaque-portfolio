import { describe, expect, it } from "vitest";
import { COMPACT_SHAPE, DESKTOP_SHAPE, poses, poseTransform } from "./ribbon";

const rightEdge = (p: { x: number; z: number; angle: number }) => {
  const r = (p.angle * Math.PI) / 180;
  return { x: p.x + Math.cos(r), z: p.z - Math.sin(r) };
};

describe("ribbon geometry", () => {
  for (const [name, shape] of [["desktop", DESKTOP_SHAPE], ["compact", COMPACT_SHAPE]] as const) {
    for (const s of [0, 0.37, 1, 1.5, 2.9, 3, -0.3, 3.3]) {
      it(`stays connected at every fold (s=${s}, ${name})`, () => {
        const ps = poses(4, s, shape);
        for (let i = 0; i < ps.length - 1; i++) {
          const a = rightEdge(ps[i]);
          expect(a.x).toBeCloseTo(ps[i + 1].x, 9);
          expect(a.z).toBeCloseTo(ps[i + 1].z, 9);
        }
      });
    }
  }

  it("faces the selected segment to the viewer, centred on the focus", () => {
    const ps = poses(4, 2);
    expect(ps[2].angle).toBeCloseTo(0, 9);
    expect(ps[2].x).toBeCloseTo(-0.5, 9);
    expect(ps[2].z).toBeCloseTo(0, 9);
    expect(ps[2].shade).toBe(0);
  });

  it("folds earlier projects away and recedes later ones along a readable wall", () => {
    const ps = poses(4, 1);
    expect(ps[0].angle).toBeLessThan(-40); // out of frame on the left
    // The next project turns gently enough to stay legible; later ones turn further.
    expect(ps[2].angle).toBeGreaterThan(20);
    expect(ps[2].angle).toBeLessThan(40);
    expect(ps[3].angle).toBeGreaterThan(ps[2].angle);
    // The wall recedes: each later segment is further away than the last.
    expect(ps[3].z).toBeLessThan(ps[2].z);
    for (const p of ps) expect(p.z).toBeLessThanOrEqual(1e-9);
  });

  it("writes a transform scaled by --seg-w", () => {
    expect(poseTransform(poses(4, 0)[0])).toBe("translate3d(calc(var(--seg-w) * -0.5000), 0px, calc(var(--seg-w) * 0.0000)) rotateY(0.0000deg)");
  });
});
