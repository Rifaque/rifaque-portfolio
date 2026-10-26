/*
 * Case-study diagrams. Each is an illustration of a documented model from the
 * project's knowledge-base entry, drawn in the shared monochrome .il style
 * (../shared/base.css), never an imitation of an interface. Every use is
 * captioned "Illustration". Three drawings come from ../shared/illustrations.js.
 */
import { illustration } from "../../shared/illustrations.js";

const box = (x, y, w, h, cls = "box", r = 8) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
const t = (x, y, s, cls = "", anchor = "start") => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${s}</text>`;
const node = (x, y, w, h, a, b = "", strong = false, dashed = false) =>
  `${box(x, y, w, h, dashed ? "box dash" : strong ? "box-strong" : "box")}${t(x + w / 2, y + (b ? h / 2 - 2 : h / 2 + 4), a, "t-strong", "middle")}${b ? t(x + w / 2, y + h / 2 + 14, b, "", "middle") : ""}`;
const arrow = (x1, y1, x2, y2, cls = "ln-2") => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = 7;
  const p = (d) => `${(x2 - s * Math.cos(a + d)).toFixed(1)} ${(y2 - s * Math.sin(a + d)).toFixed(1)}`;
  return `<path class="${cls}" d="M${x1} ${y1} L${x2} ${y2}"/><path class="${cls}" d="M${p(0.5)} L${x2} ${y2} L${p(-0.5)}"/>`;
};
const svg = (body, label, h) => `<svg class="il" viewBox="0 0 600 ${h}" role="img" aria-label="${label}">${body}</svg>`;

const D = {
  "atlas-retrieval": [300, "Illustration of Atlas retrieval: a question gathers semantic and BM25 candidates, reciprocal-rank fusion merges them, and a relevance check either selects bounded evidence for an answer or declines for lack of evidence.", () => `
    ${node(16, 122, 92, 56, "Question", "workspace", true)}
    ${arrow(108, 140, 150, 96)}${arrow(108, 160, 150, 204)}
    ${node(150, 70, 116, 52, "Semantic", "local embeddings")}${node(150, 178, 116, 52, "BM25", "lexical")}
    ${arrow(266, 96, 308, 140)}${arrow(266, 204, 308, 160)}
    ${node(308, 122, 100, 56, "RRF", "fuse, de-dup", true)}
    ${arrow(408, 150, 440, 150)}
    ${node(440, 122, 144, 56, "Relevance check", "enough evidence?", true)}
    ${arrow(512, 122, 512, 74)}${node(440, 18, 144, 56, "Answer", "bounded evidence")}
    ${arrow(512, 178, 512, 226, "ln")}${node(440, 226, 144, 56, "Decline", "no evidence", false, true)}`],

  "atlas-boundary": [250, "Illustration of the Atlas cloud boundary: indexing, embeddings and generation stay local through Ollama by default; an opt-in cloud request is assembled, scanned by Secret Shield and blocked on a match before anything reaches OpenRouter.", () => `
    ${t(20, 30, "On this machine", "t-strong")}
    ${node(20, 46, 250, 52, "Index, embeddings", "Ollama, local")}${node(20, 112, 250, 52, "Generation", "Ollama, local, the default")}
    <path class="ln dash" d="M300 14 V236"/>${t(312, 30, "Opt-in, per request", "t-strong")}
    ${node(312, 46, 128, 52, "Payload", "assembled whole")}${arrow(440, 72, 466, 72)}
    ${node(466, 46, 118, 52, "Secret Shield", "scan", true)}
    ${arrow(525, 98, 525, 132)}${node(466, 132, 118, 52, "OpenRouter", "if clean")}
    ${arrow(480, 98, 420, 132, "ln")}${node(312, 132, 128, 52, "Blocked", "on a match", false, true)}`],

  "nexus-approval": [270, "Illustration of Nexus approval: the executor computes the effect itself, the owner approves a hash of that effect, and if the effect changes the approval is void. Every call, including denials, is recorded in a hash-chained ledger.", () => `
    ${node(16, 30, 140, 56, "Proposal", "Cortex or fabric")}${arrow(156, 58, 196, 58)}
    ${node(196, 30, 168, 56, "Executor computes", "the effect itself", true)}${arrow(364, 58, 404, 58)}
    ${node(404, 30, 180, 56, "Owner approves", "a hash of that effect", true)}
    ${arrow(494, 86, 494, 132)}${node(404, 132, 180, 56, "Effect", "only if the hash matches")}
    ${node(196, 132, 168, 56, "Effect changed", "approval is void", false, true)}${arrow(404, 160, 364, 160, "ln")}
    <path class="ln dash" d="M16 220 H584"/>${t(300, 246, "every call, denials and failures included, goes to an append-only, hash-chained ledger", "", "middle")}`],

  "nexus-layers": [250, "Illustration of the Nexus layers: the Command Fabric recognises and routes without a model and cannot execute; the Cortex makes one bounded decision when the fabric declines; ToolRuntime alone can act, behind a capability gate and a policy where one deny beats any number of allows.", () => `
    ${node(16, 24, 176, 64, "Command Fabric", "recognise, route", true)}
    ${node(16, 112, 176, 64, "Cortex", "one bounded decision")}
    ${arrow(104, 88, 104, 112, "ln")}${t(112, 104, "declined", "")}
    ${arrow(192, 56, 262, 100)}${arrow(192, 144, 262, 112)}
    <rect class="fill" x="262" y="20" width="10" height="168" rx="3"/>
    ${node(290, 24, 140, 50, "Capability gate")}${arrow(430, 49, 452, 49)}
    ${node(452, 24, 132, 50, "Policy", "deny wins")}
    ${arrow(518, 74, 518, 112)}${node(452, 112, 132, 50, "Approval", "hash-bound")}
    ${arrow(452, 137, 430, 137)}${node(290, 112, 140, 50, "Effect", "", true)}
    ${t(437, 220, "ToolRuntime: the only place an effect can happen", "t-em", "middle")}
    ${t(104, 220, "can recommend, never act", "", "middle")}`],

  "extendspace-roadmap": [210, "Illustration of the ExtendSpace order of work: the USB, wired path is the first milestone and the current focus; Wi-Fi, wireless extension is planned after it, when development resumes. Connect stays disabled until then.", () => `
    ${node(20, 30, 230, 70, "1 · USB, wired", "current focus: finishing it", true)}
    ${arrow(250, 65, 340, 65)}${t(295, 54, "then", "", "middle")}
    ${node(340, 30, 240, 70, "2 · Wi-Fi, wireless", "planned, when development resumes", false, true)}
    ${t(20, 140, "Not implemented yet:", "t-strong")}
    ${t(20, 162, "pairing · input forwarding · the virtual display that true extension needs")}
    ${t(20, 188, "Connect is disabled in both apps.", "t-em")}`],

  "extendspace-recovery": [190, "Illustration of ExtendSpace recovery: when the cable is pulled the link reconnects, the receiver requests a keyframe, and the stream resumes from the next keyframe.", () => `
    ${node(16, 40, 126, 60, "Cable pulled", "link lost", false, true)}${arrow(142, 70, 166, 70)}
    ${node(166, 40, 126, 60, "Reconnect", "session owner")}${arrow(292, 70, 316, 70)}
    ${node(316, 40, 126, 60, "Keyframe", "requested", true)}${arrow(442, 70, 466, 70)}
    ${node(466, 40, 118, 60, "Video flows", "next keyframe")}
    ${t(300, 150, "Tested on one PC and one tablet; not broad device validation.", "", "middle")}`],

  "reflux-identify": [270, "Illustration of Reflux identification: a title is read from the filename, embedded IDs and edition tags are honoured, and a metadata match is accepted only when it is strong and clearly ahead; anything else goes to an Identify flow instead of being guessed.", () => `
    ${node(16, 30, 170, 56, "Filename", "Film (2021) 2160p")}${arrow(186, 58, 214, 58)}
    ${node(214, 30, 170, 56, "Title and year", "up to a release token")}${arrow(384, 58, 412, 58)}
    ${node(412, 30, 172, 56, "Embedded tags", "IDs, edition tags")}
    ${arrow(498, 86, 498, 120)}${node(380, 120, 204, 56, "Match", "strong, clearly ahead?", true)}
    ${arrow(380, 148, 300, 148)}${node(150, 120, 150, 56, "One work", "versions attach", true)}
    ${arrow(482, 176, 482, 210, "ln")}${node(380, 210, 204, 50, "Identify flow", "never a guess", false, true)}`],

  "reflux-playback": [240, "Illustration of Reflux playback: one shared engine picks the best available version for the device and plays it through Media3 on Android and Android TV, and libmpv on Windows and Linux.", () => `
    ${node(200, 20, 200, 60, "Shared engine", "Kotlin Multiplatform", true)}
    ${arrow(260, 80, 150, 130)}${arrow(340, 80, 450, 130)}
    ${node(40, 130, 220, 60, "Media3", "Android phones, tablets, TV")}
    ${node(340, 130, 220, 60, "libmpv", "Windows, Linux")}
    ${t(300, 224, "the best version for this device", "t-em", "middle")}`],

  "layers-pipeline": [210, "Illustration of the Layers runtime: a portable .layers definition is parsed within bounds, validated, resolved against theme, defaults and instance overrides, sized from the real widget dimensions and rendered with RemoteViews.", () => `
    ${node(12, 40, 100, 60, ".layers", "definition", true)}${arrow(112, 70, 128, 70)}
    ${node(128, 40, 100, 60, "Parse", "bounded")}${arrow(228, 70, 244, 70)}
    ${node(244, 40, 100, 60, "Validate", "schema")}${arrow(344, 70, 360, 70)}
    ${node(360, 40, 100, 60, "Resolve", "overrides")}${arrow(460, 70, 476, 70)}
    ${node(476, 40, 112, 60, "Size, render", "RemoteViews", true)}
    ${t(300, 150, "first-party and imported widgets share this one runtime", "t-em", "middle")}`],

  "layers-scope": [210, "Illustration of what exists in Layers: the Android runtime, editor, themes and .layers import and export are implemented; Layers Studio, a browser editor, is planned and has no source yet.", () => `
    ${t(20, 30, "Implemented, on Android", "t-strong")}
    ${node(20, 44, 130, 50, "Runtime")}${node(160, 44, 130, 50, "Editor")}${node(20, 104, 130, 50, "Themes")}${node(160, 104, 130, 50, ".layers files")}
    <path class="ln dash" d="M318 16 V196"/>
    ${t(340, 30, "Planned, not built", "t-strong")}
    ${node(340, 44, 244, 110, "Layers Studio", "browser editor · no source yet", false, true)}`],

  "btl-architecture": [260, "Illustration of the Bhatkal Time Luxe architecture: a Next.js storefront on Vercel, server-rendered with structured data and a sitemap, calls a separate Node.js API on a self-hosted Ubuntu server backed by MongoDB; product images are delivered through Cloudinary and imgix.", () => `
    ${node(16, 30, 120, 56, "Visitor", "desktop or phone")}${arrow(136, 58, 176, 58)}
    ${node(176, 30, 190, 56, "Next.js storefront", "Vercel · SSR · JSON-LD", true)}${arrow(366, 58, 406, 58)}
    ${node(406, 30, 178, 56, "Node.js API", "self-hosted Ubuntu", true)}
    ${arrow(495, 86, 495, 130)}${node(406, 130, 178, 56, "MongoDB", "catalogue data")}
    ${node(176, 150, 190, 56, "Cloudinary → imgix", "product images")}${arrow(271, 150, 271, 86)}
    ${t(300, 240, "Sitemap and structured data make the catalogue crawlable.", "", "middle")}`],
};

// Labels for the drawings borrowed from ../shared/illustrations.js.
const SHARED = {
  nexus: "Illustration of the Nexus request path: the Command Fabric and the Cortex propose; only ToolRuntime, through its gate, policy and approval, can produce an effect.",
  extendspace: "Illustration of the ExtendSpace pipeline: capture and H.264 on Windows, USB link, decoder owner and surface on the tablet.",
  reflux: "Illustration of the Reflux media model: three sources each provide a version of the same film, and identification resolves all three into one work.",
};

/** An illustration by id: one of the drawings above, or a shared one. */
export function diagram(id, label) {
  if (D[id]) { const [h, aria, body] = D[id]; return svg(body(), label ?? aria, h); }
  return illustration(id, label ?? SHARED[id]);
}
export const diagramLabel = (id) => D[id]?.[1];
