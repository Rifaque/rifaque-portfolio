import type { Stage } from "./projects";

export type Glyph = "filled" | "half" | "ring-tick" | "dashed-ring" | "check" | "hollow-ring" | "role";

/**
 * How each stage is drawn. The glyph shape differs for every stage, so the
 * colour (a token in tokens.css, applied by .glyph--<stage> in base.css) is
 * never the only signal, and the status text is always shown beside it.
 * Released and Delivered share a colour but not a shape.
 */
export const stageTreatment = {
  released: { glyph: "filled", token: "--status-released" },
  "pre-release": { glyph: "half", token: "--status-prerelease" },
  "in-development": { glyph: "ring-tick", token: "--status-development" },
  "private-alpha": { glyph: "dashed-ring", token: "--status-alpha" },
  delivered: { glyph: "check", token: "--status-delivered" },
  retired: { glyph: "hollow-ring", token: "--status-retired" },
} as const satisfies Record<Stage, { glyph: Glyph; token: string }>;

/** A role, such as the HubZero line in the hero, is not a release stage. */
export const roleTreatment = { glyph: "role", token: "--status-role" } as const;
