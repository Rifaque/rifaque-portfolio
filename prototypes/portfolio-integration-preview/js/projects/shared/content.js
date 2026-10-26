/*
 * Shared, verified content for the three Projects-section concepts.
 * Sources: knowledge-base/projects/*.md, the owner's decisions in the briefs,
 * the licence files in each local project repository, and the media audit
 * in ../README.md. DevPilot is deliberately absent.
 *
 * Media paths are resolved from this module, so every concept page can use
 * them regardless of its own location. Originals outside this directory are
 * read in place and never modified.
 *
 * Portfolio integration preview: copied from
 * prototypes/projects-redesign/shared/content.js. Only the paths changed (the
 * preview keeps its derived media in ../../../media and its case studies in
 * ../../../work), and the 2025 BTL collage reference was removed, since
 * space/data.js always replaces it with the INR captures of the live site.
 */
const here = (p) => new URL(p, import.meta.url).href;
const KB = (p) => here(`../../../../../knowledge-base/assets/${p}`);
const MEDIA = (p) => here(`../../../media/${p}`);

export const wordmark = {
  dark: { src: here("../../../../../public/rsx-develops-brand-assets/rsx-develops-wordmark-dark.png"), src2x: here("../../../../../public/rsx-develops-brand-assets/rsx-develops-wordmark-dark-2x.png"), w: 774, h: 109 },
  light: { src: here("../../../../../public/rsx-develops-brand-assets/rsx-develops-wordmark-light.png"), src2x: here("../../../../../public/rsx-develops-brand-assets/rsx-develops-wordmark-light-2x.png"), w: 612, h: 94 },
};

/** Media kinds, as labelled on screen. */
export const KIND = {
  screenshot: "Screenshot",
  capture: "Debug capture",
  emulator: "Emulator capture",
  composite: "Screenshots, composite",
  illustration: "Illustration",
};

export const projects = [
  {
    slug: "atlas",
    title: "Atlas",
    line: "Local-first workspace intelligence",
    owner: "RSX Develops · personal project, sole author",
    status: "v1.0.3 released · not in active development",
    stage: "released",
    period: "Feb to Sep 2026",
    platforms: ["Windows x64"],
    licence: "MIT",
    purpose: "A Rust and Tauri 2 desktop app that indexes one codebase or document set and answers with inspectable evidence, and can decline when the workspace has no adequate evidence.",
    contribution: "Everything: Rust backend, retrieval pipeline, React interface, release.",
    works: [
      "Semantic and BM25 candidates fused with reciprocal-rank fusion, then checked for relevance",
      "Ask can decline for lack of evidence; Find returns bounded literal matches",
      "Cloud generation is opt-in per request; Secret Shield scans the whole outbound payload first",
    ],
    limits: "Windows x64 only, unsigned installer, updater disabled; Linux unverified, macOS unsupported.",
    path: [
      ["Question", "Asked in one indexed workspace"],
      ["Candidates", "Local embeddings and BM25"],
      ["Fusion", "Reciprocal-rank fusion"],
      ["Relevance check", "Enough evidence, or decline"],
      ["Answer", "Bounded evidence, inspectable sources"],
    ],
    media: [
      {
        kind: "screenshot", src: KB("atlas/atlas-1.0-ask.webp"), w: 1502, h: 1038,
        alt: "Atlas 1.0 Ask view: the question 'Where is workspace authorization enforced?', a grounded answer with an 'Evidence considered 8' control, and a Sources panel listing retrieved files with line ranges.",
        caption: "Atlas 1.0, Ask view. Local folder path masked in the original.",
        // Regions measured on the 1502 × 1038 source image (x, y, w, h in px).
        spots: [
          { id: "mode", box: [657, 50, 189, 48], ui: "Ask and Find", eng: "Two evidence rules. Ask is conservative and can decline; Find can return bounded literal workspace matches when Ask would not answer." },
          { id: "status", box: [1112, 60, 222, 30], ui: "Index ready · Local · Ollama", eng: "Indexing, embeddings and generation run locally through Ollama. Nothing leaves the machine unless cloud generation is explicitly enabled." },
          { id: "evidence", box: [371, 454, 195, 35], ui: "Evidence considered 8", eng: "After fusion and the relevance check, a bounded evidence set goes to the model. This is the material supplied or considered, not sentence-level attribution, and the app says so." },
          { id: "sources", box: [980, 116, 516, 920], ui: "Sources panel", eng: "Retrieved chunks with file and line ranges: semantic and BM25 candidates fused with reciprocal-rank fusion, de-duplicated, then checked for relevance." },
          { id: "context", box: [349, 976, 132, 30], ui: "Context · Git on", eng: "Context the visitor turns on. If cloud generation is enabled, Secret Shield scans the complete outbound payload, including this context, and blocks the request on a match." },
        ],
      },
      {
        kind: "screenshot", src: MEDIA("atlas-workspaces-paths-masked.webp"), w: 1502, h: 1038,
        alt: "Atlas Workspaces screen listing two indexed workspaces, nexus (827 files, 10486 chunks) and atlas (100 files, 1209 chunks), each marked Index ready. Local paths are masked.",
        caption: "Atlas 1.0, Workspaces. Local folder paths masked in this copy.",
        spots: [
          { id: "index", box: [935, 312, 160, 50], ui: "Index ready · files · chunks", eng: "Files are chunked and embedded locally; indexing is incremental, and a damaged generated index can be rebuilt without touching the source files." },
          { id: "footer", box: [510, 1002, 482, 26], ui: "Local-first by default", eng: "The cloud boundary: OpenRouter is optional, enabled explicitly, and the key is held by the Rust side in the operating system's credential store." },
        ],
      },
    ],
    evidence: [
      ["release", "v1.0.3 release", "https://github.com/Rifaque/atlas/releases/tag/v1.0.3"],
      ["repo", "Source on GitHub (MIT)", "https://github.com/Rifaque/atlas"],
      ["site", "Product site", "https://atlas.rsxdevelops.dev"],
    ],
    missing: [],
  },
  {
    slug: "nexus",
    title: "Nexus",
    line: "Personal AI operating layer",
    owner: "RSX Develops · personal project, sole author",
    status: "Private alpha · active development",
    stage: "private-alpha",
    period: "Jun 2026 to now",
    platforms: ["Windows"],
    licence: "Proprietary",
    purpose: "A local-first, voice-first layer for one owner on one Windows machine, built so that what a model may suggest stays separate from what is allowed to happen.",
    contribution: "Everything: architecture, governance model, runtime, voice and Surface work.",
    works: [
      "Deterministic Command Fabric recognises and routes; it cannot execute anything",
      "The Cortex is reached only when the deterministic layers decline",
      "Every effect passes ToolRuntime: capability gate, deny-wins policy, hash-bound owner approval",
    ],
    limits: "Private alpha: Windows only, single owner, no public source or demo. Surface and voice exist on working branches only.",
    path: [
      ["Request", "Push-to-talk or a hotkey"],
      ["Command Fabric", "Recognise and route, never execute"],
      ["Cortex", "Only when the fabric declines"],
      ["ToolRuntime", "Gate, policy, hash-bound approval"],
      ["Effect", "Recorded in a hash-chained ledger"],
    ],
    media: [{ kind: "illustration", id: "nexus", alt: "Illustration of the Nexus request path: the Command Fabric and the Cortex propose; only ToolRuntime, through its gate, policy and approval, can produce an effect.", caption: "Illustration, not a screenshot. Nexus has no published interface." }],
    // A documented example request, as published in the knowledge base.
    trace: {
      request: "“Set a timer for ten minutes”",
      steps: [
        ["Command Fabric", "Recognised deterministically as a typed intent (timer, ten minutes). No model call."],
        ["Cortex", "Not reached: the fabric handled it. The Cortex is used only when the deterministic layers decline."],
        ["ToolRuntime", "The only place an effect can happen: capability gate, then a policy stack where one deny beats any number of allows."],
        ["Approval", "Consequential calls need owner confirmation bound to a hash of the computed effect; if the effect changes, the approval is void."],
        ["Ledger", "The call is recorded in an append-only, hash-chained ledger, denials and failures included."],
      ],
    },
    evidence: [],
    missing: ["No published interface. Existing Surface captures show personal content and are not used.", "No public repository or demo."],
  },
  {
    slug: "extendspace",
    title: "ExtendSpace",
    line: "Windows to Android second screen",
    owner: "RSX Develops · personal project",
    status: "In development · Connect still disabled",
    stage: "in-development",
    period: "Oct 2026 to now",
    platforms: ["Windows host", "Android tablet"],
    licence: "MIT",
    purpose: "A Windows host and an Android companion that stream the desktop to a tablet over USB. The streaming pipeline and session machinery work on one setup; ordinary use is not possible yet.",
    contribution: "Everything: Windows host, Android companion, wire protocol, tests.",
    works: [
      "Display capture and hardware H.264 on Windows; decoding on Android, each behind a session owner",
      "The USB link recovers from a pulled cable with video still flowing",
      "On one PC and one tablet, a 1080p60 test pattern streamed for ten minutes: 36,081 frames sent and decoded",
    ],
    limits: "Connect is disabled in both apps. Tested on one PC and one tablet. Wi-Fi, pairing, input forwarding and the virtual display are not implemented.",
    path: [
      ["Capture", "Windows desktop, on the host"],
      ["Encode", "Hardware H.264, session owner"],
      ["USB link", "Recovers from a pulled cable"],
      ["Decoder owner", "One owner thread per receiver"],
      ["Surface", "Drawn on the tablet"],
    ],
    media: [
      {
        kind: "capture", src: MEDIA("extendspace-usb-stream-test-pattern.webp"), w: 1600, h: 932,
        alt: "The ExtendSpace test-pattern window as received and drawn on the Android tablet's debug live-stream screen, 13 October 2026: colour bars with a moving diagonal line and a checkerboard.",
        caption: "Debug build only. The tablet's “Live stream over USB” screen, 13 Oct 2026, cropped to the streamed test-pattern window.",
        spots: [
          { id: "window", box: [0, 0, 1600, 32], ui: "The test-pattern window's title bar, from the Windows desktop", eng: "Captured on the host and encoded with hardware H.264 behind an explicit session owner." },
          { id: "frame", box: [0, 32, 1600, 900], ui: "The picture as drawn on the tablet", eng: "Carried over USB through adb forwarding to a local socket, decoded on a dedicated decoder-owner thread and released to the surface." },
        ],
      },
      { kind: "illustration", id: "extendspace", alt: "Illustration of the ExtendSpace pipeline: capture and H.264 on Windows, USB link, decoder owner and surface on the tablet.", caption: "Illustration of the pipeline, not a screenshot." },
    ],
    evidence: [["record", "Verification record: 10-minute 1080p60 run, 36,081 frames (one PC, one tablet, test pattern)", null]],
    missing: ["No public link: the public repository's last push predates this work."],
  },
  {
    slug: "reflux",
    title: "Reflux",
    line: "Local-first media client",
    owner: "RSX Develops · personal project",
    status: "Pre-release · source-available, not open source",
    stage: "pre-release",
    period: "Oct 2026 to now",
    platforms: ["Windows", "Linux", "Android", "Android TV"],
    licence: "Proprietary, source-available",
    purpose: "A Kotlin Multiplatform media client in which a film or show is one work, whatever files and sources provide it. Watch state belongs to the work, so playback continues from any copy.",
    contribution: "Everything: shared engine, identification, playback, the experience layers.",
    works: [
      "Identification from ordinary filenames, embedded {tmdb-…} and IMDb IDs, and Plex edition tags",
      "One shared engine: Media3 on Android, libmpv on desktop",
      "Organisation is virtual: Reflux never renames, moves or modifies files",
    ],
    limits: "Pre-release; nothing published. Android and TV builds verified mainly on emulators; accessibility is partial.",
    path: [
      ["Sources", "Local folder, Jellyfin, network share"],
      ["Versions", "Editions and qualities"],
      ["Identification", "Filenames, IDs, edition tags"],
      ["One work", "Watch state lives here"],
      ["Best version", "Media3 or libmpv"],
    ],
    media: [{ kind: "illustration", id: "reflux", alt: "Illustration of the Reflux media model: three sources each provide a version of the same film, and identification resolves all three into one work.", caption: "Illustration, not a screenshot. No interface capture is published." }],
    // A worked example using the knowledge base's own illustrative names.
    example: [
      ["Local folder", "Film (2021) 1080p"],
      ["Jellyfin", "Film (2021) 2160p"],
      ["Network share", "Film (2021) {edition-Extended}"],
    ],
    evidence: [["repo", "Public repository (proprietary; it lags local work)", "https://github.com/Rifaque/reflux"]],
    missing: ["No interface capture yet; any capture must avoid copyrighted artwork."],
  },
  {
    slug: "layers",
    title: "Layers by RSX",
    line: "Android widget platform",
    owner: "RSX Develops · personal project",
    status: "In development · V1 not released",
    stage: "in-development",
    period: "Oct 2026 to now",
    platforms: ["Android"],
    licence: "Private repository",
    purpose: "A customisable Android widget platform: one portable widget definition, validated, themed and sized by a shared runtime and rendered with RemoteViews.",
    contribution: "Everything: runtime, editor, themes, the .layers package format.",
    works: [
      "Seven widget families merged: Clock, Battery, Music, Calendar/Date, Countdown, Shortcuts, Device/System",
      "Sizing from each widget's real dimensions, with per-instance overrides",
      "Bounded, validated .layers import and export (format internal and provisional)",
    ],
    limits: "Ten basic widget types planned for V1; not all implemented. Notes and Photos exist on a branch only. Physical tablets, other launchers and TalkBack not verified.",
    path: [
      ["Definition", "A portable .layers definition"],
      ["Validation", "Bounded parse, schema checks"],
      ["Resolution", "Theme, defaults, overrides"],
      ["Sizing", "From the real widget size"],
      ["Render", "RemoteViews on the home screen"],
    ],
    media: [
      { kind: "emulator", src: MEDIA("layers-emulator-launcher-1.webp"), w: 720, h: 993, alt: "Layers widgets on an Android emulator home screen: a Clock widget and a Battery widget showing Charging.", caption: "Android emulator, 4 Oct 2026 audit run. Clock and Battery." },
      { kind: "emulator", src: MEDIA("layers-emulator-launcher-2.webp"), w: 720, h: 993, alt: "Layers widgets on an Android emulator: a Music widget showing No track with Previous, Play/pause and Next, and a Clock widget.", caption: "Music and Clock." },
      { kind: "emulator", src: MEDIA("layers-emulator-launcher-3.webp"), w: 720, h: 993, alt: "Layers widgets on an Android emulator: a Calendar/Date widget, a Countdown widget showing 31 days, and a Shortcuts widget.", caption: "Calendar/Date, Countdown and Shortcuts." },
    ],
    evidence: [],
    missing: ["Captures are from the emulator; physical devices not shown.", "No public release or repository."],
  },
  {
    slug: "bhatkal-time-luxe",
    title: "Bhatkal Time Luxe",
    short: "BTL",
    line: "Client project · HubZero",
    owner: "HubZero client work",
    hubzero: true,
    status: "Delivered · HubZero's first paid client project",
    stage: "delivered",
    period: "Apr to Sep 2025",
    platforms: ["Web"],
    licence: "Client code",
    purpose: "A luxury watch storefront for a retailer serving Kuwait and the wider GCC, delivered as HubZero's first paid client project.",
    contribution: "Frontend development, plus architecture, full-stack and infrastructure work across different parts and stages. Visual design by a HubZero co-founder.",
    split: [
      ["Frontend development", "Rifaque"],
      ["Architecture, full-stack and infrastructure, across parts and stages", "Rifaque"],
      ["Visual design", "A HubZero co-founder"],
      ["Changes on the current live site", "Not all Rifaque's"],
    ],
    works: [
      "Next.js storefront on Vercel against a separate Node.js API on a self-hosted Ubuntu server",
      "MongoDB data model; images through Cloudinary with imgix in front",
      "Server-rendered pages with JSON-LD and a sitemap",
    ],
    limits: "Client work: the code belongs to the client project. The live site has changed since 2025.",
    path: [
      ["Storefront", "Next.js on Vercel"],
      ["API", "Node.js, self-hosted Ubuntu"],
      ["Data", "MongoDB"],
      ["Images", "Cloudinary and imgix"],
    ],
    media: [], // the INR captures of the live site, set in space/data.js
    evidence: [],
    missing: ["No public repository link; the live storefront is not linked from the portfolio."],
  },
];

export const alsoBuilt = [
  { title: "QueryCraft", note: "Final-year project with two HubZero teammates; I was the primary technical contributor. Natural language to proposed, validated queries on local models. Retired.", slug: "querycraft" },
  // Preview: BlueTap opens its case study (work/bluetap/), which links the repository.
  { title: "BlueTap", note: "Android widgets for paired Bluetooth devices. Pre-release; tap-to-connect is not implemented.", slug: "bluetap" },
];

export const STATUS_GLYPH = {
  released: '<circle cx="6" cy="6" r="5" fill="currentColor"/>',
  delivered: '<circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3.6 6.2l1.6 1.6 3.3-3.4" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  "pre-release": '<circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 1a5 5 0 0 1 0 10z" fill="currentColor"/>',
  "in-development": '<circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 2.6V6h2.6" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  "private-alpha": '<circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.2 1.6"/>',
};

/** Case-study pages of the preview: work/<slug>/ (QueryCraft and BlueTap are Projection's pages). */
export const caseStudy = (slug) => here(`../../../work/${slug}/`);
