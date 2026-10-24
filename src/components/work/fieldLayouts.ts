/**
 * One node field, four meanings. Every project places the same nine nodes,
 * so moving between projects is a re-arrangement rather than a cut: nodes
 * travel (transform), the old project's paths retract and the new ones draw
 * in (stroke). Coordinates are in a fixed 840x600 viewBox.
 *
 * Atlas keeps its nodes in the upper half because the lower right of its
 * frame holds the real screenshot.
 */

export const VIEW_W = 840;
export const VIEW_H = 600;
export const NODE_COUNT = 9;

export type Anchor = "t" | "b" | "r" | "l";
export type FieldNode = {
  x: number;
  y: number;
  label?: string;
  anchor?: Anchor;
  /** The node that carries the project's point; drawn in the accent colour. */
  key?: boolean;
  hidden?: boolean;
  mono?: boolean;
};
export type EdgeKind = "main" | "accent" | "dashed";
export type FieldEdge = [from: number, to: number, kind?: EdgeKind];
export type FieldNote = {
  x: number;
  y: number;
  text: string;
  anchor?: "start" | "middle" | "end";
  accent?: boolean;
  size?: number;
};
export type FieldBox = { x: number; y: number; w: number; h: number; accent?: boolean };

export type FieldLayout = {
  nodes: FieldNode[];
  edges: FieldEdge[];
  notes?: FieldNote[];
  boxes?: FieldBox[];
  /** Short marks suggesting retrieved fragments. */
  fragments?: [number, number][];
  /** The same path in words, shown under the drawing on narrow screens. */
  flow: string[];
};

export const fieldLayouts: Record<string, FieldLayout> = {
  nexus: {
    nodes: [
      { x: 60, y: 300, label: "Request", anchor: "b" },
      { x: 220, y: 300, label: "Command Fabric", anchor: "b" },
      { x: 390, y: 120, label: "Deterministic reply", anchor: "r" },
      { x: 390, y: 470, label: "Cortex · fallback", anchor: "b" },
      { x: 580, y: 220, label: "Capability gate", anchor: "r", key: true },
      { x: 580, y: 305, label: "Policy (deny wins)", anchor: "r", key: true },
      { x: 580, y: 390, label: "Hash-bound approval", anchor: "r", key: true },
      { x: 580, y: 470, label: "Effect", anchor: "r", key: true },
      { x: 220, y: 300, hidden: true },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3, "dashed"],
      [1, 4],
      [3, 4, "dashed"],
      [4, 5, "accent"],
      [5, 6, "accent"],
      [6, 7, "accent"],
    ],
    boxes: [{ x: 548, y: 185, w: 287, h: 320, accent: true }],
    notes: [
      { x: 548, y: 540, text: "ToolRuntime", accent: true },
      { x: 548, y: 562, text: "the only place effects happen", size: 16 },
      { x: 262, y: 412, text: "declined", size: 14 },
      { x: 330, y: 248, text: "typed intent", size: 14 },
    ],
    flow: [
      "Request",
      "Command Fabric: recognise and route, never execute",
      "Deterministic reply, a typed intent, or the Cortex as fallback",
      "ToolRuntime: capability gate → policy → hash-bound approval",
      "Effect",
    ],
  },
  atlas: {
    nodes: [
      { x: 50, y: 170, label: "Question", anchor: "b" },
      { x: 210, y: 90, label: "Semantic", anchor: "t" },
      { x: 210, y: 250, label: "BM25", anchor: "b" },
      { x: 360, y: 170, label: "RRF", anchor: "t", key: true },
      { x: 490, y: 170, label: "Relevance check", anchor: "t" },
      { x: 170, y: 400, label: "No evidence → decline", anchor: "r" },
      { x: 630, y: 170, label: "Bounded evidence", anchor: "b" },
      { x: 770, y: 170, label: "Answer", anchor: "t", key: true },
      { x: 630, y: 55, label: "Secret Shield", anchor: "r" },
    ],
    edges: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
      [3, 4, "accent"],
      [4, 5, "dashed"],
      [4, 6, "accent"],
      [6, 7, "accent"],
      [6, 8, "dashed"],
    ],
    notes: [{ x: 644, y: 82, text: "opt-in cloud path only", size: 14 }],
    fragments: [
      [112, 92],
      [134, 118],
      [152, 78],
      [116, 236],
      [140, 262],
      [160, 224],
    ],
    flow: [
      "Question",
      "Semantic and BM25 candidates",
      "Reciprocal-rank fusion",
      "Relevance check, or decline for lack of evidence",
      "Bounded evidence → answer with inspectable sources",
    ],
  },
  reflux: {
    nodes: [
      { x: 80, y: 130, label: "Local folder", anchor: "t" },
      { x: 80, y: 300, label: "Jellyfin", anchor: "t" },
      { x: 80, y: 470, label: "Network share", anchor: "t" },
      { x: 300, y: 170, label: "Film (2021) 1080p", anchor: "t", mono: true },
      { x: 300, y: 300, label: "Film (2021) 2160p", anchor: "t", mono: true },
      { x: 300, y: 430, label: "{edition-Extended}", anchor: "t", mono: true },
      { x: 470, y: 300, label: "Identification", anchor: "t" },
      { x: 620, y: 300, label: "One work", anchor: "t", key: true },
      { x: 770, y: 200, label: "Best version", anchor: "t" },
    ],
    edges: [
      [0, 3],
      [0, 4],
      [1, 4],
      [2, 5],
      [3, 6],
      [4, 6],
      [5, 6],
      [6, 7, "accent"],
      [7, 8, "accent"],
    ],
    notes: [
      { x: 620, y: 338, text: "watch state lives here", anchor: "middle", size: 14, accent: true },
      { x: 770, y: 160, text: "Media3 · libmpv", anchor: "middle", size: 14 },
    ],
    flow: [
      "Local folder · Jellyfin · network share",
      "Several file versions of the same film",
      "Identification",
      "One work: watch and resume state live here",
      "Best version → Media3 on Android, libmpv on desktop",
    ],
  },
  extendspace: {
    nodes: [
      { x: 75, y: 300, label: "Desktop", anchor: "b" },
      { x: 190, y: 300, label: "Capture", anchor: "t" },
      { x: 305, y: 300, label: "Hardware H.264", anchor: "b" },
      { x: 440, y: 300, label: "USB", anchor: "t", key: true },
      { x: 565, y: 300, label: "Decoder owner", anchor: "b", key: true },
      { x: 680, y: 300, label: "Surface", anchor: "t" },
      { x: 775, y: 300, label: "Tablet", anchor: "b" },
      { x: 245, y: 185, label: "Session owner", anchor: "t" },
      { x: 625, y: 185, label: "Session owner", anchor: "t" },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3, "accent"],
      [3, 4, "accent"],
      [4, 5],
      [5, 6],
      [7, 1, "dashed"],
      [7, 2, "dashed"],
      [8, 4, "dashed"],
      [8, 5, "dashed"],
    ],
    boxes: [
      { x: 30, y: 135, w: 360, h: 300 },
      { x: 495, y: 135, w: 320, h: 300 },
    ],
    notes: [
      { x: 30, y: 470, text: "Windows host · WinUI 3" },
      { x: 495, y: 470, text: "Android client · Compose" },
      { x: 440, y: 545, text: "pulled cable → reconnect → next keyframe", anchor: "middle", size: 14, accent: true },
    ],
    flow: [
      "Windows desktop",
      "Capture and hardware H.264 encoding, under a session owner",
      "USB link that recovers from a pulled cable",
      "A dedicated decoder owner on the tablet",
      "Surface → tablet display",
    ],
  },
};

export const hasField = (slug: string) => slug in fieldLayouts;

/** A horizontal-first cubic between two nodes; straight when aligned. */
export function edgePath(a: FieldNode, b: FieldNode) {
  if (Math.abs(a.x - b.x) < 4 || Math.abs(a.y - b.y) < 4) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  const mx = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
}
