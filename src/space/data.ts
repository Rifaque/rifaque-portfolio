/**
 * Project Space: the six featured projects as presented on the homepage and in
 * their case studies. Ported from the accepted Concept D prototype
 * (prototypes/projects-redesign/project-space/), which stays the reference.
 *
 * Facts that belong to a project (title, category, status, stage, period,
 * licence, ownership, links) come from content/projects.ts; this module adds
 * only the presentation: short copy, highlights, labelled evidence, the 3D
 * scene compositions and the case-study layout.
 *
 * Evidence is never relabelled: a debug capture stays a debug capture, an
 * emulator capture an emulator capture, an illustration an illustration.
 * Bhatkal Time Luxe uses current-site captures (26 Oct 2026) with the site's own
 * currency selector set to INR; one KWD capture is kept, labelled as the later
 * later demo. The 2025 composite is not used.
 */
import { projectBySlug } from "../content/projects";
import type { Project } from "../content/types";
import type { DiagramId } from "./diagrams";
import atlasAsk from "../assets/space/atlas-1.0-ask.webp";
import atlasWorkspaces from "../assets/space/atlas-workspaces-paths-masked.webp";
import esCapture from "../assets/space/extendspace-usb-stream-test-pattern.webp";
import layersEditor from "../assets/space/layers-large-window-editor.webp";
import layers1 from "../assets/space/layers-emulator-launcher-1.webp";
import layers2 from "../assets/space/layers-emulator-launcher-2.webp";
import layers3 from "../assets/space/layers-emulator-launcher-3.webp";
import btlHome from "../assets/space/btl-current-home-desktop-inr.webp";
import btlProduct from "../assets/space/btl-current-product-desktop-inr.webp";
import btlArrivals from "../assets/space/btl-current-new-arrivals-desktop-inr.webp";
import btlHomeMobile from "../assets/space/btl-current-home-mobile-inr.webp";
import btlProductMobile from "../assets/space/btl-current-product-mobile-inr.webp";
import btlProductKwd from "../assets/space/btl-current-product-desktop.webp";

/* ---------------------------------------------------------------- evidence */
export type Kind = "screenshot" | "capture" | "emulator" | "live" | "illustration" | "planned";
export const KIND_LABEL: Record<Kind, string> = {
  screenshot: "Screenshot",
  capture: "Debug capture",
  emulator: "Emulator capture",
  live: "Screenshot, live site",
  illustration: "Illustration",
  planned: "Planned",
};
/** Genuine captures get a filled label; illustrations and plans an outlined one. */
export const isReal = (k: Kind) => k !== "illustration" && k !== "planned";

export type Shot = { kind: Exclude<Kind, "illustration" | "planned">; src: string; w: number; h: number; alt: string; caption: string };
export type Drawing = { kind: "illustration"; id: DiagramId; alt: string; caption: string };
export type Evidence = Shot | Drawing;

const atlasAskShot: Shot = {
  kind: "screenshot", src: atlasAsk, w: 1502, h: 1038,
  alt: "Atlas 1.0 Ask view: the question 'Where is workspace authorization enforced?', a grounded answer with an 'Evidence considered 8' control, and a Sources panel listing retrieved files with line ranges.",
  caption: "Atlas 1.0, Ask view. Local folder path masked in the original.",
};
const atlasWorkspacesShot: Shot = {
  kind: "screenshot", src: atlasWorkspaces, w: 1502, h: 1038,
  alt: "Atlas Workspaces screen listing two indexed workspaces, nexus (827 files, 10486 chunks) and atlas (100 files, 1209 chunks), each marked Index ready. Local paths are masked.",
  caption: "Atlas 1.0, Workspaces. Local folder paths masked in this copy.",
};
const esShot: Shot = {
  kind: "capture", src: esCapture, w: 1600, h: 932,
  alt: "The ExtendSpace test-pattern window as received and drawn on the Android tablet's debug live-stream screen, 13 October 2026: colour bars with a moving diagonal line and a checkerboard.",
  caption: "Debug build only. The tablet's “Live stream over USB” screen, 13 Oct 2026, cropped to the streamed test-pattern window.",
};
const layersTablet: Shot = {
  kind: "emulator", src: layersEditor, w: 1280, h: 844,
  alt: "The Layers editor in a large Android window: a widget list on the left, a preview workspace with compact, wide and large previews of a Clock widget, and a theme and surface inspector on the right.",
  caption: "Android emulator with a large-window display override, 3 Oct 2026. Not a physical tablet.",
};
const layersLaunchers: Shot[] = [
  { kind: "emulator", src: layers1, w: 720, h: 993, alt: "Layers widgets on an Android emulator home screen: a Clock widget and a Battery widget showing Charging.", caption: "Android emulator, 4 Oct 2026 audit run. Clock and Battery." },
  { kind: "emulator", src: layers2, w: 720, h: 993, alt: "Layers widgets on an Android emulator: a Music widget showing No track with Previous, Play/pause and Next, and a Clock widget.", caption: "Music and Clock." },
  { kind: "emulator", src: layers3, w: 720, h: 993, alt: "Layers widgets on an Android emulator: a Calendar/Date widget, a Countdown widget showing 31 days, and a Shortcuts widget.", caption: "Calendar/Date, Countdown and Shortcuts." },
];
const btlLive: Shot[] = [
  { kind: "live", src: btlHome, w: 1440, h: 900, alt: "Bhatkal Time Luxe home page on desktop: the headline 'Timeless Design. Modern Presence.', Explore Collection and Watch Houses buttons, and a featured watch priced in rupees.", caption: "Home, desktop. Currency set to INR." },
  { kind: "live", src: btlProduct, w: 1440, h: 900, alt: "Bhatkal Time Luxe product page on desktop: a watch photo, a discounted price in rupees, specifications, and Add to Cart and Buy via WhatsApp buttons.", caption: "Product page, desktop. Currency set to INR." },
  { kind: "live", src: btlArrivals, w: 1440, h: 900, alt: "Bhatkal Time Luxe New Arrivals catalogue on desktop: a grid of watch cards with discount badges, prices in rupees and Add buttons.", caption: "New Arrivals catalogue, desktop. Currency set to INR." },
  { kind: "live", src: btlHomeMobile, w: 390, h: 680, alt: "Bhatkal Time Luxe home page on a phone: headline, Shop Collection button, three service badges and a row of brand logos.", caption: "Home, mobile (cropped above the floating contact button)." },
  { kind: "live", src: btlProductMobile, w: 390, h: 844, alt: "Bhatkal Time Luxe product page on a phone: watch photo, price in rupees, brand, colourway and reference.", caption: "Product page, mobile. Currency set to INR." },
  { kind: "live", src: btlProductKwd, w: 1440, h: 900, alt: "The same Bhatkal Time Luxe product page with prices shown in Kuwaiti dinar (KD), from the later demo work.", caption: "Product page with the currency set to KWD: later demo work, not the original seller's store." },
];
const draw = (id: DiagramId, alt: string, caption: string): Drawing => ({ kind: "illustration", id, alt, caption });
const nexusDrawing = draw("nexus", "Illustration of the Nexus request path: the Command Fabric and the Cortex propose; only ToolRuntime, through its gate, policy and approval, can produce an effect.", "Nexus has no published interface.");
const refluxDrawing = draw("reflux", "Illustration of the Reflux media model: three sources each provide a version of the same film, and identification resolves all three into one work.", "No interface capture is published.");
const esDrawing = draw("extendspace", "Illustration of the ExtendSpace pipeline: capture and H.264 on Windows, USB link, decoder owner and surface on the tablet.", "Illustration of the pipeline, not a screenshot.");

/* ---------------------------------------------------------------- scenes */
/** [x, y, z, width] in container-width units from the stage centre. */
export type Place = [number, number, number, number];
export type DeviceKind = "monitor" | "window" | "tablet" | "phone" | "tv" | "glass";
export type Screen =
  | { type: "shot"; media: Shot }
  | { type: "drawing"; media: Drawing }
  | { type: "note"; title: string; tag?: Kind; badge?: string; off?: string; host?: boolean; none?: boolean }
  /** An abstract, labelled illustration of a workflow, prepared as markup (alsoScenes.ts). */
  | { type: "html"; html: string };
export type Device = {
  id: string;
  kind: DeviceKind;
  at: Place;
  /** Phone position, or null to leave the device out on phones. */
  phone: Place | null;
  ar: number;
  screen: Screen;
  ry?: number;
  origin?: "left";
  label?: string;
  bar?: string;
};
export type Aside = "road" | "studio" | "text-nexus" | "text-reflux";
export type Scene = { view: [number, number]; devices: Device[]; cable?: [string, string]; aside?: Aside; cap: [Kind | null, string][] };

const shotOf = (m: Shot) => ({ ar: m.w / m.h, screen: { type: "shot" as const, media: m } });
const drawingOf = (m: Drawing) => ({ ar: 3 / 2, screen: { type: "drawing" as const, media: m } });
const none = (where: string, ar = 16 / 10) => ({ ar, screen: { type: "note" as const, title: where, none: true } });

/* ---------------------------------------------------------------- case studies */
/** Text with **bold** runs. */
export type Rich = string;
export type Visual =
  | { type: "media"; media: Shot; caption?: string }
  | { type: "diagram"; id: DiagramId; caption: string }
  | { type: "stage"; only: string; w: number; pw: number; ar: string; kind: Kind; caption: string; label: string }
  | { type: "pair"; items: Visual[] };
export type CsSection = {
  id: string;
  heading: string;
  quote?: string;
  body?: Rich[];
  list?: Rich[];
  after?: Rich[];
  visual?: Visual;
  flip?: boolean;
  /** The status-and-limits section: shows status and links. */
  status?: boolean;
  linksNote?: string;
};
export type CaseStudy = { kicker: string; summary: string; facts: [string, string][]; openLabel: string; sections: CsSection[] };

export type SpaceProject = {
  slug: string;
  project: Project;
  platforms: string[];
  blurb: string;
  part: string;
  purpose: string;
  contribution: string;
  highlights: [string, string][];
  limits: string;
  missing: string[];
  evidence: Evidence[];
  liveNote?: string;
  studio?: string[];
  scene: Scene;
  caseStudy: CaseStudy;
};

const P = (slug: string) => {
  const p = projectBySlug(slug);
  if (!p) throw new Error(`unknown project ${slug}`);
  return p;
};

/** The drawings as text, beside the 3D view, for anyone who cannot use it. */
export const TEXT: Record<"nexus" | "reflux", string[]> = {
  nexus: ["Request", "Command Fabric: recognise and route, never execute", "Deterministic reply, a typed intent, or the Cortex as fallback", "ToolRuntime: capability gate, then policy (deny wins), then hash-bound approval", "Effect, recorded in a hash-chained ledger"],
  reflux: ["Local folder, Jellyfin, network share", "Several file versions of the same film", "Identification", "One work: watch and resume state live here", "Best version: Media3 on Android, libmpv on desktop"],
};

export const space: SpaceProject[] = [
  /* ------------------------------------------------------------ ATLAS */
  {
    slug: "atlas",
    project: P("atlas"),
    platforms: ["Windows x64"],
    blurb: "A desktop app that indexes one codebase or document set and answers with evidence you can inspect, or declines when there isn't enough.",
    part: "Sole author: Rust backend, retrieval pipeline, interface, release.",
    purpose: "A Rust and Tauri 2 desktop app that indexes one codebase or document set and answers with inspectable evidence, and can decline when the workspace has no adequate evidence.",
    contribution: "Everything: Rust backend, retrieval pipeline, React interface, release.",
    highlights: [
      ["Hybrid retrieval", "Semantic and BM25 candidates fused with reciprocal-rank fusion, then checked for relevance."],
      ["Says when it doesn't know", "Ask can decline for lack of workspace evidence instead of answering from general model knowledge."],
      ["Cloud by consent", "Generation is local through Ollama; the optional cloud path is scanned by Secret Shield first."],
    ],
    limits: "Windows x64 only, unsigned installer, updater disabled; Linux unverified, macOS unsupported.",
    missing: [],
    evidence: [atlasAskShot, atlasWorkspacesShot],
    scene: {
      view: [-5, -12],
      devices: [
        { id: "workspaces", kind: "window", at: [19, -13, -16, 46], phone: null, ...shotOf(atlasWorkspacesShot) },
        { id: "desktop", kind: "monitor", at: [-6, -3, 0, 63], phone: [0, -4, 0, 88], ...shotOf(atlasAskShot) },
      ],
      cap: [["screenshot", "Atlas 1.0, Ask and Workspaces · local paths masked"]],
    },
    caseStudy: {
      kicker: "Local-first workspace intelligence · case study",
      summary: "A Rust and Tauri 2 desktop app that indexes one codebase or document set and answers with inspectable evidence. A question without enough evidence in the workspace can be declined instead of answered from general model knowledge.",
      facts: [["Role", "Personal project, sole author"], ["Period", "Feb to Sep 2026"], ["Runs on", "Windows x64"], ["Stack", "Rust · Tauri 2 · React 19 · TypeScript · Ollama · OpenRouter (opt-in)"]],
      openLabel: "the Ask view on a desktop monitor, with the Workspaces window behind it",
      sections: [
        { id: "question", heading: "One loop, on purpose", quote: "Can an assistant answer from your workspace, and say so when it can't?", body: ["Earlier builds reached for more surfaces. For 1.0 the product was narrowed to a single loop: **open a workspace, index it, ask or find, inspect the evidence, follow up.**", "Agents, arbitrary shell execution, personas, graph surfaces, web search and vision attachments are not part of 1.0."], visual: { type: "media", media: atlasWorkspacesShot } },
        { id: "retrieval", heading: "Retrieval", flip: true, body: ["Workspace files are chunked and embedded locally through Ollama. A question gathers semantic candidates and BM25 candidates, then:"], list: ["reciprocal-rank fusion merges the two lists", "candidates are classified for relevance and de-duplicated", "a bounded evidence set goes to the model, or the question is declined"], after: ["Indexing is incremental, and a damaged generated index can be detected and rebuilt without touching the source files."], visual: { type: "diagram", id: "atlas-retrieval", caption: "Semantic and BM25 candidates, fused, checked, then answered or declined." } },
        { id: "evidence", heading: "Evidence you can inspect", body: ["Each answer shows the material supplied to or considered for it, with files and line ranges. That is the evidence considered, **not sentence-level attribution**, and the app says so.", "Ask and Find follow different rules. Ask is conservative and can decline. Find can return bounded literal matches from the workspace when Ask would not answer."], visual: { type: "media", media: atlasAskShot } },
        { id: "cloud", heading: "An explicit cloud boundary", flip: true, body: ["With local Ollama, indexing, embeddings, generation and evidence stay on the machine. OpenRouter is optional, enabled per request; a request that has not authorised it is blocked.", "When it is enabled, Atlas assembles the complete bounded payload first and **Secret Shield** scans it for known secret formats, such as AWS keys, GitHub tokens and API keys. A match blocks the request. The OpenRouter key is held by the Rust side in the operating system's credential store."], visual: { type: "diagram", id: "atlas-boundary", caption: "Local by default; the opt-in cloud path passes Secret Shield first." } },
        { id: "decisions", heading: "Decisions and trade-offs", list: ["**Fewer surfaces.** One loop done properly rather than many half-finished ones; removed areas are not described as current.", "**Declining is a feature.** Ask would rather say it lacks evidence than answer from general model knowledge.", "**Workspace authorization in the backend.** Requested paths are canonicalised and confined to the workspace root in Rust.", "**A safety net, not a guarantee.** Secret Shield matches known patterns; it protects the cloud path without promising more."] },
        { id: "status", heading: "Status and limits", status: true, list: ["Windows x64 only. The installer is unsigned, so SmartScreen shows an Unknown Publisher warning; the release publishes a SHA-256 checksum.", "The updater is disabled. Linux is configured but unverified, and macOS is unsupported.", "PDF and generic-file chunking is basic, relevance calibration is heuristic and context budgeting is approximate."] },
      ],
    },
  },

  /* ------------------------------------------------------------ NEXUS */
  {
    slug: "nexus",
    project: P("nexus"),
    platforms: ["Windows"],
    blurb: "A local, voice-first assistant layer for one Windows machine, built so a model can propose but only a governed runtime can act.",
    part: "Sole author: architecture, governance model, runtime.",
    purpose: "A local-first, voice-first layer for one owner on one Windows machine, built so that what a model may suggest stays separate from what is allowed to happen.",
    contribution: "Architecture, governance model, runtime, voice and Surface work.",
    highlights: [
      ["Deterministic first", "The Command Fabric recognises and routes without a model; the Cortex is reached only when it declines."],
      ["One way to act", "Every effect passes ToolRuntime: capability gate, deny-wins policy, owner approval bound to a hash of the effect."],
      ["Auditable", "Calls, denials included, are recorded in an append-only, hash-chained ledger."],
    ],
    limits: "Private alpha: Windows only, single owner, no public source or demo. Surface and voice exist on working branches only.",
    missing: ["No published interface. Existing Surface captures show personal content and are not used.", "No public repository or demo."],
    evidence: [nexusDrawing],
    scene: {
      view: [-5, 12],
      devices: [
        { id: "desktop", kind: "monitor", at: [15, -12, -16, 48], phone: null, ar: 16 / 10, screen: { type: "note", title: "Nexus", badge: "No published interface" } },
        { id: "path", kind: "glass", at: [-13, 9, 10, 50], phone: [0, 2, 0, 90], ...drawingOf(nexusDrawing) },
      ],
      aside: "text-nexus",
      cap: [["illustration", "Request path · no published interface"]],
    },
    caseStudy: {
      kicker: "Personal AI operating layer · case study",
      summary: "A local-first, voice-first layer for one owner on one Windows machine. Deterministic recognition handles what it can without a model, a reasoning step is reached only when it declines, and every effect passes through one governed tool runtime.",
      facts: [["Role", "Personal project, sole author"], ["Period", "Jun 2026 to now"], ["Runs on", "Windows, one owner, one machine"], ["Source", "Private; no public demo"], ["Stack", "Python 3.13 · FastAPI · PostgreSQL + pgvector · pywebview / WebView2 · faster-whisper · Anthropic Claude · Ollama"]],
      openLabel: "the governed request path on a glass panel, in front of a monitor that carries only a label",
      sections: [
        { id: "question", heading: "The question", quote: "How can a personal AI stay useful without capability quietly becoming authority?", body: ["Most assistants become more useful by being allowed to do more. Nexus keeps those apart: it can hold a great deal of context about its owner and their work, while what it may actually change on the machine stays **narrow, explicit and auditable**.", "There is no published interface. The drawing above is an illustration, and the monitor behind it carries only a label."], visual: { type: "diagram", id: "nexus-layers", caption: "Recognise and decide in front; act only inside ToolRuntime." } },
        { id: "words", heading: "From words to effects", flip: true, body: ["A request passes through layers that each decide one thing. Only the last one can change anything."], list: ["**Command Fabric:** deterministic, model-less recognition. \"Set a timer for ten minutes\" becomes a typed intent with typed slots, or is marked ambiguous, unsupported or a matter for the assistant. It cannot execute anything.", "**Response engine:** deterministic wording for structured outcomes, with no model call.", "**Cortex:** reached only when the deterministic layers decline. One bounded decision: answer, pick one governed capability from a closed set, ask, or delegate.", "**ToolRuntime:** the only place an effect happens, behind a capability gate and a policy in which one deny beats any number of allows."], visual: { type: "diagram", id: "nexus", caption: "The governed request path." } },
        { id: "approval", heading: "Approval that cannot drift", body: ["A consequential call needs explicit owner confirmation, and that approval is **bound to a hash of the computed effect**. The executor computes the effect itself; the model's description of it is never trusted. If the effect changes after approval, the approval is void.", "Mutations are checkpointed in a shadow Git repository, and every call is recorded in an append-only, hash-chained ledger, denials and failures included."], visual: { type: "diagram", id: "nexus-approval", caption: "The owner approves an effect, not a description of one." } },
        { id: "decisions", heading: "Decisions and trade-offs", list: ["**The defaults refuse.** The standard policy stack is read-only, so every call at or above \"mutate\" is denied before confirmation is reached; mutating stacks are explicit opt-in configurations.", "**Dangerous capabilities stay absent.** Host control registers no tool at all unless configured, and there is no shell, PowerShell or run-command tool.", "**Deterministic first.** A model is used only where the deterministic layers cannot answer, which keeps common requests fast and predictable.", "**Voice without listening.** Push-to-talk with no wake word and no background listening; speech-to-text runs locally on faster-whisper."] },
        { id: "status", heading: "Status and limits", status: true, linksNote: "No public source or demo.", list: ["Private alpha: Windows only, single owner, unreleased, with no public demo or source.", "Closed source. Future licensing and distribution have not been decided.", "The newest tag predates the desktop shell and voice. Those exist on working branches and have not been tagged or released.", "Spoken acceptance of the voice endpoint on the owner's machine is paused.", "No screenshot is shown: existing Surface captures contain personal content."] },
      ],
    },
  },

  /* ------------------------------------------------------------ EXTENDSPACE */
  {
    slug: "extendspace",
    project: P("extendspace"),
    platforms: ["Windows host", "Android tablet"],
    blurb: "Streams a Windows desktop to an Android tablet over USB. The wired path comes first and is being finished; Connect is still disabled.",
    part: "Sole author: Windows host, Android companion, wire protocol, tests.",
    purpose: "A Windows host and an Android companion that stream the desktop to a tablet over USB. The streaming pipeline and session machinery work on one setup; ordinary use is not possible yet.",
    contribution: "Everything: Windows host, Android companion, wire protocol, tests.",
    highlights: [
      ["A pipeline with owners", "Capture and hardware H.264 on Windows, decoding on Android, each behind an explicit session owner."],
      ["Tested, narrowly", "A 1080p60 test pattern streamed for ten minutes on one PC and one tablet; the USB link recovers from a pulled cable."],
      ["Wired first", "USB is the first milestone and the current focus. Wi-Fi is planned after it."],
    ],
    limits: "Connect is disabled in both apps. Tested on one PC and one tablet. Wi-Fi is planned after the wired milestone; pairing, input forwarding and the virtual display are not implemented.",
    missing: ["No public link: the public repository's last push predates this work."],
    evidence: [esShot, esDrawing],
    scene: {
      view: [-6, -4],
      devices: [
        { id: "host", kind: "monitor", at: [-24, -6, 0, 46], phone: [-17, -17, 0, 60], ar: 16 / 10, label: "Windows host", screen: { type: "note", title: "ExtendSpace host", tag: "illustration", off: "Connect: disabled", host: true } },
        { id: "tablet", kind: "tablet", at: [29, 2, 0, 37], phone: [17, 24, 0, 50], ry: -20, origin: "left", label: "Android tablet", ...shotOf(esShot) },
      ],
      cable: ["host", "tablet"],
      aside: "road",
      cap: [["illustration", "Host screen"], ["capture", "Tablet, debug build, 13 Oct 2026"]],
    },
    caseStudy: {
      kicker: "Windows to Android second screen · case study",
      summary: "A Windows host and an Android companion that stream the desktop to a tablet over USB. The wired path is the first milestone and the current focus; ordinary use is not possible yet, because Connect is still disabled.",
      facts: [["Period", "Oct 2026 to now"], ["Runs on", "Windows host, Android tablet"], ["Stack", "C# / .NET 10 · WinUI 3 · Kotlin · Jetpack Compose · H.264 (Media Foundation, MediaCodec) · USB transport"]],
      openLabel: "a Windows host monitor and an Android tablet joined by a USB cable",
      sections: [
        { id: "aim", heading: "The aim, and the order of work", quote: "Can a tablet on a USB cable become a dependable second screen for Windows?", body: ["Mirroring first, true extension later; extension needs a virtual display driver on Windows. The work so far is the streaming pipeline and the session machinery around it."], list: ["**First: USB, wired.** The current focus is finishing this path.", "**Then: Wi-Fi, wireless.** Planned after the wired milestone. It is not implemented."], visual: { type: "diagram", id: "extendspace-roadmap", caption: "Wired first; wireless only after the wired milestone." } },
        { id: "built", heading: "How it is put together", flip: true, list: ["**Windows host** in C# and WinUI 3: display capture and hardware H.264 encoding behind a production session owner.", "**Android companion** in Kotlin and Jetpack Compose: link, decoder ownership and surface handling, with a session state model covered by unit tests.", "**A draft wire protocol**, implemented on both sides, over a USB transport with reconnection."], after: ["The host screen in the 3D view is an illustration: no capture of the host interface is published."], visual: { type: "diagram", id: "extendspace", caption: "Capture and encode on Windows, USB, decode and draw on the tablet." } },
        { id: "tested", heading: "What has been tested", body: ["On one PC and one tablet over USB, the production session path streamed a **1080p60 test pattern for ten minutes: 36,081 frames** sent, all decoded and released to the tablet's surface.", "These runs were driven by gated acceptance tests on the PC and a debug-only screen on the tablet. They show the pipeline working on one setup; they are not broad device validation."], visual: { type: "media", media: esShot } },
        { id: "recover", heading: "Recovering, not restarting", flip: true, body: ["The USB link recovers from a pulled cable with video still flowing afterwards.", "Decoders are created on a dedicated owner thread, never on the reader thread, and a creation is used only if it still matches the stream that is wanted. Frames that arrive meanwhile wait in order, within limits; beyond that, the stream skips to the next keyframe."], visual: { type: "diagram", id: "extendspace-recovery", caption: "A pulled cable costs a keyframe, not the session." } },
        { id: "status", heading: "Status and limits", status: true, linksNote: "No public link: the public repository predates this work.", list: ["Connect is disabled in both apps, and each says so in its own interface.", "Wi-Fi is planned after the wired milestone. Pairing and input forwarding do not exist yet.", "The virtual display driver for extension is not implemented; only its feasibility has been researched.", "Tested on one PC and one tablet only."] },
      ],
    },
  },

  /* ------------------------------------------------------------ REFLUX */
  {
    slug: "reflux",
    project: P("reflux"),
    platforms: ["Windows", "Linux", "Android", "Android TV"],
    blurb: "A media client where a film is one work, whatever files and sources provide it, so playback continues from any copy.",
    part: "Sole author: shared engine, identification, playback.",
    purpose: "A Kotlin Multiplatform media client in which a film or show is one work, whatever files and sources provide it. Watch state belongs to the work, so playback continues from any copy.",
    contribution: "Everything: shared engine, identification, playback, the experience layers.",
    highlights: [
      ["Works, not files", "Versions from a local folder, Jellyfin or a network share resolve to one work that holds the watch state."],
      ["Careful identification", "Embedded IDs and edition tags are honoured; weak matches go to an Identify flow instead of being guessed."],
      ["Your folders stay yours", "Organisation is virtual: Reflux never renames, moves or modifies files."],
    ],
    limits: "Pre-release; nothing published. Tablet validation passed on a Xiaomi Pad 7; physical phone testing is not complete. Accessibility is partial.",
    missing: ["No interface capture yet; any capture must avoid copyrighted artwork."],
    evidence: [refluxDrawing],
    scene: {
      view: [-6, 10],
      devices: [
        { id: "tv", kind: "tv", at: [-28, -17, -28, 28], phone: null, ...none("Android TV", 16 / 9) },
        { id: "desktop", kind: "monitor", at: [21, -11, -14, 34], phone: null, ...none("Windows · Linux") },
        { id: "model", kind: "glass", at: [-7, 8, 12, 42], phone: [4, 15, 4, 78], ...drawingOf(refluxDrawing) },
        { id: "phone", kind: "phone", at: [37, 12, 8, 9], phone: [-30, -23, -4, 21], ...none("Android", 9 / 19.5) },
      ],
      aside: "text-reflux",
      cap: [["illustration", "Media model · no captures published · physical phone testing not complete"]],
    },
    caseStudy: {
      kicker: "Local-first media client · case study",
      summary: "A Kotlin Multiplatform media client in which a work is distinct from the versions and sources that provide it. Watch and resume state belong to the work, so playback continues from any copy: a local folder, a Jellyfin server or a network share.",
      facts: [["Period", "Oct 2026 to now"], ["Runs on", "Windows, Linux, Android, Android TV"], ["Stack", "Kotlin Multiplatform · Compose · Media3 · libmpv · Jellyfin · TMDB"]],
      openLabel: "the media model on a glass panel, with desktop, TV and phone outlines that carry no capture",
      sections: [
        { id: "model", heading: "Works, versions and sources", quote: "What if a film were one thing, no matter how many files it lives in?", body: ["Most players treat a file as the thing you watch. Reflux treats the film or show as the thing, and files as versions of it that sources happen to provide. A 1080p copy on a laptop, a 4K copy on a Jellyfin server and an extended edition on a network share are **three versions of one work**.", "Library state lives in the platform's data directory and never in your media folders; nothing is renamed or moved."], visual: { type: "stage", only: "model", w: 62, pw: 88, ar: "16 / 11", kind: "illustration", label: "the media model alone on a glass panel; turn it to see the drawing through the glass", caption: "The same drawing, turnable: from behind it shows through the glass, reversed." } },
        { id: "identify", heading: "Identification", flip: true, list: ["Titles are read from ordinary filenames: a title ends at the first unambiguous release token, and ambiguous words are only hints.", "Embedded IDs such as **{tmdb-123}** and IMDb IDs, and Plex **{edition-…}** tags, are honoured.", "A file without a year joins its title's only known year; with several, it stays separate rather than being guessed into the wrong work.", "A metadata match is accepted only when it is strong and clearly ahead of the runner-up. Anything else goes to an Identify flow."], visual: { type: "diagram", id: "reflux-identify", caption: "From filename to one work, or to a person's decision." } },
        { id: "play", heading: "Playback", body: ["One engine drives every form factor: **Media3 on Android and libmpv on desktop**. Reflux picks the best available version for the device, and input adapts to touch, mouse and keyboard, game controllers and TV remotes.", "The platform outlines in the 3D view are labelled \"No capture published\": no interface capture is shown, and none would use copyrighted artwork."], visual: { type: "diagram", id: "reflux-playback", caption: "One shared engine, two playback back ends." } },
        { id: "status", heading: "Status and limits", status: true, linksNote: "No release or demo yet.", list: ["Pre-release; nothing has been published.", "Tablet validation passed on a Xiaomi Pad 7. Physical phone testing has not been completed.", "Accessibility is partial: contrast and system text size are tested; screen-reader labels on every control, focus order, reduced motion and a TalkBack or Narrator pass are not done yet.", "Reflux is proprietary. Source visibility grants no permission to redistribute, modify or reuse it."] },
      ],
    },
  },

  /* ------------------------------------------------------------ LAYERS */
  {
    slug: "layers-by-rsx",
    project: P("layers-by-rsx"),
    platforms: ["Android"],
    blurb: "An Android widget platform: one portable widget definition, validated, themed and sized by a shared runtime. A browser editor, Layers Studio, is planned.",
    part: "Sole author: runtime, editor, themes, package format.",
    purpose: "A customisable Android widget platform: one portable widget definition, validated, themed and sized by a shared runtime and rendered with RemoteViews.",
    contribution: "Everything: runtime, editor, themes, the .layers package format.",
    highlights: [
      ["One runtime", "First-party and imported widgets share a single validated runtime rendered with RemoteViews."],
      ["Real sizes", "Widgets size from their real dimensions, with per-instance overrides and a multi-size preview workspace."],
      ["Studio, later", "Layers Studio is specified as a browser editor that opens the same .layers packages; no Studio source exists yet."],
    ],
    limits: "Paused; no public release. Ten first-party widget families are implemented, tested on the Android emulator. Physical devices, other launchers and OEMs, and TalkBack are not verified. Weather's non-commercial data licence remains a release condition.",
    missing: ["Captures are from the emulator; physical devices not shown.", "No public release or repository."],
    evidence: [layersTablet, ...layersLaunchers],
    studio: ["Opens the same .layers packages", "Visual editing with live previews at several sizes", "Local use, no account or backend"],
    scene: {
      view: [-5, -14],
      devices: [
        { id: "tablet", kind: "tablet", at: [-12, -2, 0, 60], phone: [-4, -13, 0, 82], ...shotOf(layersTablet) },
        { id: "phone", kind: "phone", at: [30, 6, 14, 17], phone: [29, 25, 16, 26], ...shotOf(layersLaunchers[0]) },
      ],
      aside: "studio",
      cap: [["emulator", "Editor and widgets on the Android emulator, not physical devices"]],
    },
    caseStudy: {
      kicker: "Android widget platform · case study",
      summary: "A customisable Android widget platform built around one portable widget definition, validated, themed and sized by a shared runtime. A browser editor, Layers Studio, is planned; it is not built.",
      facts: [["Period", "Oct 2026 to now"], ["Runs on", "Android"], ["Source", "Private repository"], ["Stack", "Kotlin · Jetpack Compose · RemoteViews"]],
      openLabel: "the large-window editor on a tablet and home-screen widgets on a phone, both emulator captures",
      sections: [
        { id: "runtime", heading: "One definition, one runtime", body: ["Every widget, first-party or imported, is a portable definition that goes through the same steps: a bounded parse, schema checks, resolution against theme, defaults and per-instance overrides, sizing from the widget's real dimensions, and rendering with **RemoteViews**.", "Ten first-party widget families are implemented: Clock, Battery, Music, Calendar, Countdown, Shortcuts, Device, Notes, Photos and Weather."], visual: { type: "diagram", id: "layers-pipeline", caption: "From a .layers definition to a widget on the home screen." } },
        { id: "sizes", heading: "Real sizes, previewed", flip: true, body: ["Widgets size from their actual dimensions, with global and per-instance overrides in an explicit order. The editor previews compact, wide and large sizes side by side and adapts to large windows.", "This capture is from an Android emulator with a large-window display override. It is **not a physical tablet**; physical tablets have not been verified."], visual: { type: "media", media: layersTablet } },
        { id: "home", heading: "On the home screen", body: ["The same runtime draws the widgets on the launcher. Imported packages use a bounded, validated **.layers** format; it is internal and provisional, not a public standard.", "Widgets never run arbitrary code or intents: Shortcuts and Device/System use allowlisted host actions and typed capabilities."], visual: { type: "pair", items: [{ type: "media", media: layersLaunchers[1] }, { type: "media", media: layersLaunchers[2] }] } },
        { id: "studio", heading: "What exists, and what is planned", flip: true, body: ["The Android runtime, editor, themes and .layers import and export are implemented. **Layers Studio** is specified as a browser editor that opens the same .layers packages, with visual editing, live previews at several sizes and local use without an account.", "No Studio source exists yet, so it has no screen to show anywhere on this page."], visual: { type: "diagram", id: "layers-scope", caption: "Implemented on Android; Studio planned, not built." } },
        { id: "status", heading: "Status and limits", status: true, linksNote: "No public release or repository.", list: ["Development is currently paused. No public release; V1 is not released.", "The .layers package format is internal and provisional.", "Automated testing has run on the Android emulator. Physical devices, other launchers and OEMs, and spoken TalkBack have not been verified. Captures are from the emulator.", "Weather's data provider is licensed for non-commercial use only, which remains a release condition."] },
      ],
    },
  },

  /* ------------------------------------------------------------ BHATKAL TIME LUXE */
  {
    slug: "bhatkal-time-luxe",
    project: P("bhatkal-time-luxe"),
    platforms: ["Web"],
    blurb: "A watch-commerce storefront for a Bhatkal-based retailer, with an India-wide market focus. Originally a HubZero client project; now a live showcase.",
    part: "Designed and developed the redesigned storefront end to end, building upon the initial UI/UX foundation established by the co-founder.",
    purpose: "A watch-commerce storefront for a Bhatkal-based retailer, with an India-wide market focus. It began as HubZero's first paid client project and now remains live as a HubZero showcase, not an active storefront.",
    contribution: "A co-founder established the initial mobile-only UI/UX foundation. I substantially redesigned the interface, including the desktop experience, and built the redesigned storefront end to end: architecture, frontend and full-stack implementation, database and infrastructure.",
    highlights: [
      ["Two deployments", "A Next.js storefront on Vercel against a separate Node.js API on a self-hosted Ubuntu server."],
      ["Catalogue", "A MongoDB data model, with images delivered through Cloudinary and imgix."],
      ["A later demo", "GCC and Kuwait support came in June–July 2026 as a demo for a prospective client. It was not delivered to the original seller."],
    ],
    limits: "The website remains live as a HubZero showcase, not an active storefront; the partnership ended in September 2025. Client work: the code is not presented as a personal open-source project.",
    missing: [],
    evidence: btlLive,
    liveNote: "Current live site, captured 26 Oct 2026 from btl.hubzero.in using the site's own currency selector. Originally HubZero client work; now a showcase, not an active storefront.",
    scene: {
      view: [-5, -12],
      devices: [
        { id: "desktop", kind: "monitor", at: [-8, -4, 0, 63], phone: [-8, -14, 0, 76], bar: "btl.hubzero.in", ...shotOf(btlLive[0]) },
        { id: "phone", kind: "phone", at: [33, 6, 18, 14], phone: [30, 18, 18, 24], ...shotOf(btlLive[4]) },
      ],
      cap: [["live", "Live showcase site, 26 Oct 2026, currency set to INR · originally HubZero client work"]],
    },
    caseStudy: {
      kicker: "Originally a HubZero client project · case study",
      summary: "A watch-commerce storefront for a Bhatkal-based retailer, with an India-wide market focus, and HubZero's first paid client project. I redesigned it and built the redesigned storefront end to end on a co-founder's initial UI/UX foundation, from the architecture to the servers it runs on. It remains live as a HubZero showcase, not an active storefront.",
      facts: [["Client", "HubZero client work"], ["Period", "Apr to Sep 2025"], ["My part", "Architecture, frontend and full-stack implementation, database, infrastructure"], ["Design", "Initial mobile-only UI/UX foundation by a co-founder; redesign, including desktop, by me"], ["Now", "Live showcase, not an active storefront"], ["Stack", "Next.js · TypeScript · Node.js · MongoDB · Tailwind CSS · Cloudinary · imgix · Vercel · Ubuntu"]],
      openLabel: "the current storefront on a desktop monitor and a product page on a phone",
      sections: [
        { id: "who", heading: "Who did what", body: ["Bhatkal Time Luxe began as a HubZero client project: a watch-commerce website for a Bhatkal-based retailer, aimed at customers across India. The first website was built in April 2025, the redesigned storefront was delivered in August 2025, and the partnership ended in September 2025.", "One of my HubZero co-founders, a UI/UX designer, established the initial mobile-only UI foundation. **I substantially redesigned the interface, including the desktop experience, and built the redesigned storefront end to end on that foundation: the architecture, the frontend and full-stack implementation, the database and the infrastructure.**", "It was HubZero's first paid client project, and the first time I carried paid software from architecture through to production infrastructure for another business."], visual: { type: "diagram", id: "btl-architecture", caption: "Two deployments: the storefront on Vercel, the API on a self-hosted server." } },
        { id: "built", heading: "What was built", flip: true, list: ["A **Next.js App Router storefront**, deployed on Vercel.", "A separate **Node.js API** on a self-hosted Ubuntu server, backed by MongoDB.", "An image pipeline through **Cloudinary**, with **imgix** in front for delivery.", "Server-rendered pages with JSON-LD and a sitemap, so the catalogue is crawlable."], visual: { type: "media", media: btlLive[2] } },
        { id: "product", heading: "Product pages", body: ["Each watch has its own server-rendered page with photography, price, specifications and a path to purchase. The captures here are of the current live site, taken on 26 October 2026 and cropped to the viewport, with the site's currency selector set to INR."], visual: { type: "media", media: btlLive[1] } },
        { id: "phone", heading: "On a phone", flip: true, body: ["On a phone the storefront uses its own layout, as these captures of the live site show. Turn the phone to see it from any side."], visual: { type: "pair", items: [{ type: "stage", only: "phone", w: 40, pw: 56, ar: "1 / 1.25", kind: "live", label: "the product page on a phone", caption: "Product page, phone." }, { type: "media", media: btlLive[3] }] } },
        { id: "currency", heading: "A later demo, not the seller's store", body: ["In June–July 2026, GCC and Kuwait support and other features were added as a demo for a prospective client. The site can show prices in INR, KWD and other currencies from one selector.", "**This work was never part of the original seller's store**, and it is not evidence of a Kuwait or GCC market; the project's focus was India-wide."], visual: { type: "media", media: btlLive[5] } },
        { id: "status", heading: "Status and limits", status: true, list: ["The partnership ended in September 2025. The website remains live as a HubZero showcase, not an active storefront.", "Client work: the code is not presented as a personal open-source project."] },
      ],
    },
  },
];

export const spaceBySlug = (slug: string) => space.find((s) => s.slug === slug);
export const spaceSlugs = space.map((s) => s.slug);

/** Also built: the two smaller projects, with their own existing pages. */
export const alsoBuilt = [
  { slug: "querycraft", title: "QueryCraft", note: "Final-year project with two HubZero teammates; I was the primary technical contributor. Natural language to proposed, validated queries on local models. Retired." },
  { slug: "bluetap", title: "BlueTap", note: "Android widgets for paired Bluetooth devices. In development, paused; tap-to-connect is not implemented." },
];
