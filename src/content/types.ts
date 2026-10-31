/** Where a project stands. Drawn as a monochrome glyph next to the status text. */
export type Stage = "released" | "pre-release" | "in-development" | "private-alpha" | "delivered" | "retired";

export type IllustrationId = "nexus" | "atlas" | "reflux" | "extendspace" | "layers" | "bluetap" | "querycraft";

export type Media =
  | {
      kind: "screenshot";
      src: string;
      srcSet?: string;
      width: number;
      height: number;
      alt: string;
      caption: string;
    }
  | {
      kind: "illustration";
      id: IllustrationId;
      /** Spoken description of the drawing. */
      label: string;
      caption: string;
    };

export type ProjectLink = { label: string; href: string; kind: "source" | "release" | "live" | "site" };

export type Item = { title: string; body: string };

export type Section = { heading: string; body?: string[]; list?: string[] };

export type Ownership =
  | { kind: "personal"; label: string }
  /** Work that belongs to HubZero; `credit` says who did what. */
  | { kind: "hubzero"; label: string; credit: string };

export type Project = {
  slug: string;
  title: string;
  /** Category line. */
  kicker: string;
  /** Status line, always shown in text. */
  status: string;
  stage: Stage;
  /** Only verified licences. Omitted when not verified. */
  licence?: "MIT" | "Proprietary" | "Closed source";
  licenceNote?: string;
  period?: string;
  ownership: Ownership;
  /** The owner's contribution, in evidence-backed words. */
  role: string;
  question?: string;
  /** Short description: ribbon, dossier lead, archive listings, meta fallback. */
  summary: string;
  /** Why the project exists / the problem it addresses. */
  problem: string[];
  how: Item[];
  decisions: Item[];
  stack: { name: string; why: string }[];
  limits: string[];
  links: ProjectLink[];
  /** Shown when there are no links, so the absence is explained. */
  linksNote?: string;
  /** First item is the lead visual. */
  media: Media[];
  /** The deeper narrative for /work/:slug only. */
  caseStudy: Section[];
  seo: { title: string; description: string };
};
