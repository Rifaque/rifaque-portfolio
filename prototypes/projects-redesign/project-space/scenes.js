/*
 * Scene compositions for Concept D: which devices each project shows, where
 * they sit and what their screens carry. Geometry and rotation are in
 * stage3d.js; copy and media come from data.js.
 *
 * Positions are [x, y, z, width] in container-width units from the stage
 * centre (desktop and tablet share one set; phones have their own, or null
 * to hide a companion). `view` is the scene's default [rotateX, rotateY].
 *
 * Screens show a genuine capture (`real`), or plainly labelled text. Where
 * a project has no capture, the screen says so; nothing imitates an
 * interface. Layers Studio is not a device at all: it stays a flat, dashed
 * note beside the scene.
 */
import { illustration } from "../shared/illustrations.js";
import { esc } from "../shared/shell.js";
import { KIND } from "./data.js";

const REAL = new Set(["screenshot", "capture", "emulator", "live", "composite"]);
export const tag = (kind) => `<span class="tag${REAL.has(kind) ? " tag-real" : ""}">${esc(KIND[kind])}</span>`;

const shot = (m) => ({ real: true, ar: m.w / m.h, screen: `<img src="${m.src}" width="${m.w}" height="${m.h}" alt="${esc(m.alt)}" draggable="false" decoding="async">` });
const drawing = (m) => ({ ar: 3 / 2, screen: illustration(m.id, m.alt) });
const note = (html, cls = "") => `<div class="scr-note ${cls}">${html}</div>`;
const none = (where) => ({ ar: 16 / 10, screen: note(`<b>${esc(where)}</b><span>No capture published</span>`, "scr-none") });
const find = (p, kind) => p.media.find((m) => m.kind === kind);

/** The drawings as text, for readers who cannot use the 3D view. Shown outside the scene. */
export const TEXT = {
  nexus: ["Request", "Command Fabric: recognise and route, never execute", "Deterministic reply, a typed intent, or the Cortex as fallback", "ToolRuntime: capability gate, then policy (deny wins), then hash-bound approval", "Effect, recorded in a hash-chained ledger"],
  reflux: ["Local folder, Jellyfin, network share", "Several file versions of the same film", "Identification", "One work: watch and resume state live here", "Best version: Media3 on Android, libmpv on desktop"],
  extendspace: ["Windows desktop", "Capture and hardware H.264 encoding, under a session owner", "USB link that recovers from a pulled cable", "A dedicated decoder owner on the tablet", "Surface: the tablet display"],
};
export const asText = (slug, title) =>
  `<details class="as-text"><summary>${esc(title)} as text</summary><ol>${TEXT[slug].map((t) => `<li>${esc(t)}</li>`).join("")}</ol></details>`;

/** ExtendSpace order of work, in one compact line: the wired path first, wireless after it. */
export const ROAD = `<p class="road"><span class="road-now"><b>Now:</b> USB, wired, the current focus</span><span class="road-next"><b>Next:</b> Wi-Fi, wireless. Planned after the wired milestone, when development resumes.</span></p>`;
const PIPE = `<p class="pipe-line" aria-label="Pipeline: capture, H.264 encode, USB, decode, surface"><span>Capture</span><span>H.264</span><span>USB</span><span>Decode</span><span>Surface</span></p>`;

// Captions carry the disclosures; device labels are kept only where they say
// which machine is which (ExtendSpace's host and tablet).
export const SCENES = {
  atlas: (p) => ({
    view: [-5, -12],
    devices: [
      { id: "workspaces", kind: "window", at: [19, -13, -16, 46], phone: null, ...shot(p.media[1]) },
      { id: "desktop", kind: "monitor", at: [-6, -3, 0, 63], phone: [0, -4, 0, 88], ...shot(p.media[0]) },
    ],
    cap: [["screenshot", "Atlas 1.0, Ask and Workspaces · local paths masked"]],
  }),

  nexus: (p) => ({
    view: [-5, 12],
    devices: [
      {
        id: "desktop", kind: "monitor", at: [15, -12, -16, 48], phone: null, ar: 16 / 10,
        screen: note(`<b>Nexus</b><span class="tag">No published interface</span>`),
      },
      { id: "path", kind: "glass", at: [-13, 9, 10, 50], phone: [0, 2, 0, 90], ...drawing(p.media[0]) },
    ],
    aside: asText("nexus", "Request path"),
    cap: [["illustration", "Request path · no published interface"]],
  }),

  extendspace: (p) => ({
    view: [-6, -4],
    devices: [
      {
        id: "host", kind: "monitor", at: [-24, -6, 0, 46], phone: [-17, -17, 0, 60], ar: 16 / 10, label: "Windows host",
        screen: note(`${tag("illustration")}<b>ExtendSpace host</b><span class="scr-off">Connect: disabled</span>`, "scr-host"),
      },
      { id: "tablet", kind: "tablet", at: [29, 2, 0, 37], phone: [17, 24, 0, 50], ry: -20, origin: "left", ...shot(find(p, "capture")), label: "Android tablet" },
    ],
    cable: ["host", "tablet"],
    aside: `${ROAD}${PIPE}`,
    cap: [["illustration", "Host screen"], ["capture", "Tablet, debug build, 13 Oct 2026"]],
  }),

  reflux: (p) => ({
    view: [-6, 10],
    devices: [
      { id: "tv", kind: "tv", at: [-28, -17, -28, 28], phone: null, ...none("Android TV"), ar: 16 / 9 },
      { id: "desktop", kind: "monitor", at: [21, -11, -14, 34], phone: null, ...none("Windows · Linux") },
      { id: "model", kind: "glass", at: [-7, 8, 12, 42], phone: [4, 15, 4, 78], ...drawing(p.media[0]) },
      { id: "phone", kind: "phone", at: [37, 12, 8, 9], phone: [-30, -23, -4, 21], ...none("Android"), ar: 9 / 19.5 },
    ],
    aside: asText("reflux", "Media model"),
    cap: [["illustration", "Media model · no captures published · Android builds verified mainly on emulators"]],
  }),

  layers: (p) => ({
    view: [-5, -14],
    devices: [
      { id: "tablet", kind: "tablet", at: [-12, -2, 0, 60], phone: [-4, -13, 0, 82], ...shot(p.tablet) },
      { id: "phone", kind: "phone", at: [30, 6, 14, 17], phone: [29, 25, 16, 26], ...shot(p.media[0]) },
    ],
    aside: `<p class="studio-flat">${tag("planned")}<span><b>Layers Studio</b>, a browser editor: not built. No source exists yet.</span></p>`,
    cap: [["emulator", "Editor and widgets on the Android emulator, not physical devices"]],
  }),

  "bhatkal-time-luxe": (p) => ({
    view: [-5, -12],
    devices: [
      { id: "desktop", kind: "monitor", at: [-8, -4, 0, 63], phone: [-8, -14, 0, 76], bar: "btl.hubzero.in", ...shot(p.media[0]) },
      { id: "phone", kind: "phone", at: [33, 6, 18, 14], phone: [30, 18, 18, 24], ...shot(p.media[4]) },
    ],
    cap: [["live", "Live showcase site, 26 Oct 2026, currency set to INR · originally HubZero client work"]],
  }),
};
