/*
 * Prototype content, transcribed from knowledge-base/ (published copy checked
 * 2026-10-24) with the owner's decisions of the creative brief applied:
 *  - Nexus: proprietary, private alpha, actively developing.
 *  - Bhatkal Time Luxe: HubZero; frontend plus broader architecture,
 *    full-stack and infrastructure work across parts and stages; link to the
 *    case study, not the live site; not every live-site change is his.
 *  - Reflux: proprietary, public repository linked.
 *  - Layers by RSX: in development; ten basic widget types planned for V1,
 *    not all implemented.
 *  - QueryCraft: collaborative, HubZero context.
 *  - Atlas, BlueTap, ExtendSpace: MIT.
 *  - Education: AITM, affiliated with VTU; CGPA 8.36.
 *  - Relocation: "Open to relocation and remote roles."
 *
 * Every project has three views, which the work bench turns between:
 *   front → face   (a real screenshot, or a labelled illustration)
 *   side  → path   (how it works, from the knowledge-base diagram text)
 *   top   → stands (status, ownership, limits)
 */

// Resolved from this module, so pages at any depth (index, work/<slug>/) share it.
const KB = new URL("../../../knowledge-base/assets", import.meta.url).href;

export const site = {
  name: "RSX Develops",
  person: "Rifaque Akrami",
  legalName: "Rifaque Ahmed Akrami",
  email: "rifaque.rs@gmail.com",
  github: "https://github.com/Rifaque",
  linkedin: "https://www.linkedin.com/in/rifaque-akrami/",
  hubzero: "https://hubzero.in",
  resume: new URL("../../../public/resume/Rifaque_Resume.pdf", import.meta.url).href,
  location: "Bhatkal, Karnataka, India",
  availability: "Open to relocation and remote roles.",
};

export const projects = [
  {
    slug: "atlas",
    title: "Atlas",
    kicker: "Local-first workspace intelligence",
    group: "rsx",
    status: "v1.0.3 released · not in active development",
    stage: "released",
    period: "Feb to Sep 2026",
    start: [2026, 2],
    end: [2026, 9],
    ownership: "Personal project, RSX Develops",
    licence: "MIT",
    question: "Can an assistant answer from your workspace, and say so when it can't?",
    summary:
      "A Rust and Tauri 2 desktop app that indexes one codebase or document set and answers with inspectable evidence. Questions without enough workspace evidence can be declined instead of answered from general model knowledge.",
    face: {
      kind: "screenshot",
      src: `${KB}/atlas/atlas-1.0-ask-751.webp`,
      srcset: `${KB}/atlas/atlas-1.0-ask-751.webp 751w, ${KB}/atlas/atlas-1.0-ask.webp 1502w`,
      w: 1502,
      h: 1038,
      alt: "Atlas 1.0 Ask view: a question about workspace authorisation, a grounded answer with an 'Evidence considered 8' control, and a Sources panel listing retrieved files with line ranges.",
      caption: "Screenshot. Atlas 1.0 Ask view with the evidence panel; local folder path masked.",
    },
    path: [
      ["Question", "Asked inside one indexed workspace"],
      ["Candidates", "Semantic (local embeddings) and BM25"],
      ["Fusion", "Reciprocal-rank fusion, de-duplicated"],
      ["Relevance check", "Enough evidence, or decline"],
      ["Answer", "Bounded evidence with inspectable sources"],
    ],
    pathNote: "Optional cloud path: Secret Shield scans the whole outbound payload first.",
    limits: [
      "Windows x64 only, shipped as an unsigned installer with a published SHA-256 checksum.",
      "The updater is disabled. Linux is unverified; macOS is unsupported.",
      "Secret Shield matches known patterns. It is a safety net, not a guarantee.",
    ],
    stack: ["Rust", "Tauri 2", "React 19", "TypeScript", "Ollama", "LanceDB", "OpenRouter (opt-in)"],
    why: [
      "Earlier builds of Atlas reached for more surfaces. For 1.0 the product was narrowed to a single loop: open a workspace, index it, ask or find, inspect the evidence, follow up. Agents, arbitrary shell execution, personas, graph surfaces, web search and vision attachments are not part of 1.0.",
    ],
    decisions: [
      ["Saying it doesn't know", "When a question has no adequate evidence in the workspace, Atlas can decline it rather than answer from general model knowledge. The evidence it shows is the material supplied to or considered for an answer, not sentence-level attribution, and the app says so."],
      ["An explicit cloud boundary", "With local Ollama, indexing, embeddings, generation and evidence stay on the machine. OpenRouter is optional and has to be enabled explicitly; before anything leaves, Secret Shield scans the complete bounded payload for known secret formats, and a match blocks the request."],
      ["Authorised in Rust", "Workspace access is authorised in the Rust backend; requested paths are canonicalised and confined to the workspace root."],
    ],
    links: [
      { label: "Source on GitHub", href: "https://github.com/Rifaque/atlas" },
      { label: "v1.0.3 release", href: "https://github.com/Rifaque/atlas/releases/tag/v1.0.3" },
      { label: "Product site", href: "https://atlas.rsxdevelops.dev" },
    ],
  },
  {
    slug: "nexus",
    title: "Nexus",
    kicker: "Personal AI operating layer",
    group: "rsx",
    status: "Private alpha · active development",
    stage: "private-alpha",
    period: "Jun 2026 to now",
    start: [2026, 6],
    ownership: "Personal project, RSX Develops",
    licence: "Proprietary",
    question: "How can a personal AI stay useful without capability quietly becoming authority?",
    summary:
      "A local-first, voice-first layer for one owner on one Windows machine. Deterministic recognition handles what it can without a model, a reasoning step is reached only when it declines, and every effect passes through a single governed tool runtime.",
    face: { kind: "illustration", id: "nexus", alt: "Illustration of the Nexus request path: proposals from the Command Fabric and the Cortex converge on one narrow gate, ToolRuntime, which is the only way through to an effect.", caption: "Illustration, not a screenshot. Nexus has no published interface." },
    path: [
      ["Request", "Push-to-talk or a hotkey; no wake word"],
      ["Command Fabric", "Recognise and route, never execute"],
      ["Cortex", "Reached only when the fabric declines"],
      ["ToolRuntime", "Capability gate, policy where deny wins, hash-bound approval"],
      ["Effect", "Recorded in an append-only, hash-chained ledger"],
    ],
    limits: [
      "Private alpha: Windows only, single owner, unreleased, no public demo or source.",
      "The Surface and voice exist on working branches only; spoken acceptance of the voice endpoint is paused.",
      "System Control is off by default.",
    ],
    stack: ["Python 3.13", "FastAPI", "PostgreSQL + pgvector", "uv workspace", "pywebview / WebView2", "faster-whisper", "Anthropic Claude", "Ollama"],
    why: [
      "Most assistants become more useful by being allowed to do more. Nexus tries to keep those two things apart: an assistant that can hold a great deal of context about its owner and their work, while what it may actually change on the machine stays narrow, explicit and auditable.",
      "It is built for one owner on one Windows machine. You speak to it, or summon it with a hotkey, and it answers through a small on-screen Surface and a local voice.",
    ],
    decisions: [
      ["Approval that cannot drift", "A consequential call needs explicit owner confirmation, and that approval is bound to a hash of the computed effect. If the effect changes after approval, the approval is void. Mutations are checkpointed in a shadow Git repository."],
      ["The defaults refuse", "The standard policy stack is read-only, so every call at or above \"mutate\" is denied before confirmation is reached. Host control registers no tool at all unless it is configured, and there is no shell, PowerShell or run-command tool."],
      ["The model is never the authority", "The executor computes the effect itself; the model's description of what a call will do is never trusted."],
    ],
    links: [],
    linksNote: "Proprietary. The source is private; there is no public repository or demo.",
  },
  {
    slug: "reflux",
    title: "Reflux",
    kicker: "Local-first media client",
    group: "rsx",
    status: "Pre-release · source-available, not open source",
    stage: "pre-release",
    period: "Oct 2026 to now",
    start: [2026, 10],
    ownership: "Personal project, RSX Develops",
    licence: "Proprietary, source-available",
    question: "What if a film were one thing, no matter how many files it lives in?",
    summary:
      "A Kotlin Multiplatform media client in which a work is distinct from the versions and sources that provide it. Watch and resume state belong to the work, so playback continues from any copy: a local folder, a Jellyfin server or a network share.",
    face: { kind: "illustration", id: "reflux", alt: "Illustration of the Reflux media model: three sources each provide a file version of the same film, and identification resolves all three into one work, where watch state lives.", caption: "Illustration, not a screenshot. One work, three versions." },
    path: [
      ["Sources", "Local folder, Jellyfin, network share"],
      ["Versions", "1080p, 2160p and an extended edition"],
      ["Identification", "Filenames, embedded IDs, edition tags"],
      ["One work", "Watch and resume state live here"],
      ["Best version", "Media3 on Android, libmpv on desktop"],
    ],
    limits: [
      "Pre-release; nothing has been published.",
      "Android and television builds have been verified mainly on emulators.",
      "Accessibility is partial: full screen-reader labels, focus order and reduced motion are not done.",
    ],
    stack: ["Kotlin Multiplatform", "Compose", "Media3", "libmpv", "Jellyfin", "TMDB"],
    why: [
      "Most players treat a file as the thing you watch. Reflux treats the film or show as the thing, and files as versions of it that sources happen to provide. A 1080p copy on a laptop, a 4K copy on a Jellyfin server and an extended edition on a network share are three versions of one work.",
    ],
    decisions: [
      ["Never guess into the wrong work", "A file without a year joins its title's only known year. With several known years, such as two films of the same name, it stays separate. A metadata match is accepted only when it is strong and clearly ahead of the runner-up; anything else goes to an Identify flow."],
      ["One engine, every form factor", "Media3 on Android and libmpv on desktop, from one shared engine. Input adapts to touch, mouse and keyboard, game controllers and TV remotes."],
      ["Your folders stay yours", "Organisation is virtual. Library state lives in the platform's data directory; Reflux never renames, moves or modifies the user's files."],
    ],
    links: [{ label: "Source on GitHub", href: "https://github.com/Rifaque/reflux" }],
    linksNote: "Reflux is proprietary. The source is public so the work can be seen; that grants no permission to redistribute, modify or reuse it.",
  },
  {
    slug: "extendspace",
    title: "ExtendSpace",
    kicker: "Windows to Android second screen",
    group: "rsx",
    status: "In development · Connect still disabled",
    stage: "in-development",
    period: "Oct 2026 to now",
    start: [2026, 10],
    ownership: "Personal project, RSX Develops",
    licence: "MIT",
    question: "Can a tablet on a USB cable become a dependable second screen for Windows?",
    summary:
      "A Windows host and an Android companion that stream the desktop to a tablet. The production session path has streamed a live 1080p60 picture over USB to one tablet, driven by gated acceptance tests. Ordinary use is not possible yet: Connect is still disabled.",
    face: { kind: "illustration", id: "extendspace", alt: "Illustration of the ExtendSpace stream: a Windows desktop is captured and encoded, carried over a USB cable that can be pulled and reconnected, and drawn on a tablet showing a test pattern.", caption: "Illustration, not a screenshot. The tablet shows a test pattern, as in the acceptance runs." },
    path: [
      ["Capture", "Windows desktop, on the host"],
      ["Encode", "Hardware H.264 under a session owner"],
      ["USB link", "Recovers from a pulled cable"],
      ["Decoder owner", "One owner thread per receiver"],
      ["Surface", "Drawn on the tablet"],
    ],
    pathNote: "Too many frames waiting: the stream skips to the next keyframe.",
    limits: [
      "Connect is disabled in both apps, and each says so in its own interface.",
      "Tested on one PC and one tablet only. Wi-Fi, pairing and input forwarding are not implemented.",
      "The virtual display needed for true extension is not implemented; only its feasibility has been researched.",
    ],
    stack: ["C# / .NET 10", "WinUI 3", "Kotlin", "Jetpack Compose", "H.264 (MediaCodec)", "USB transport"],
    why: [
      "ExtendSpace turns an Android tablet into a second display for Windows: mirroring first, and true extension later, which needs a virtual display driver on Windows. The work so far is the streaming pipeline and the session machinery around it.",
    ],
    decisions: [
      ["What has been tested", "On one PC and one tablet (a Xiaomi Pad 7 over USB), the production session path streamed a 1080p60 test pattern for ten minutes, and the same build was exercised through the 720p30 fallback, rotation, screen-off, cable pulls and a frozen app. These are single-setup results, not broad device validation."],
      ["A creation is used only if it still fits", "Decoder creation happens on one owner thread per receiver, never on the reader thread, and a creation is used only if it still matches the stream that is wanted."],
    ],
    links: [],
    linksNote: "No public link yet: the public repository's last push predates the work described here.",
  },
  {
    slug: "layers",
    title: "Layers by RSX",
    kicker: "Android widget platform",
    group: "rsx",
    status: "In development · V1 not released",
    stage: "in-development",
    period: "Oct 2026 to now",
    start: [2026, 10],
    ownership: "Personal project, RSX Develops",
    licence: "Private repository",
    question: null,
    summary:
      "A customisable Android widget platform built around a portable widget definition, with a shared runtime, a generic editor, a theme system and curated presets. Ten basic widget types are planned for V1; not all of them are implemented yet.",
    face: { kind: "illustration", id: "layers", alt: "Illustration of Layers: one portable widget definition is rendered by a shared runtime into widgets of three different sizes.", caption: "Illustration, not a screenshot. One definition, three sizes." },
    path: [
      ["Definition", "A portable .layers widget definition"],
      ["Validation", "Bounded parse, schema and semantic checks"],
      ["Resolution", "Theme, defaults and per-instance overrides"],
      ["Sizing", "From the widget's real dimensions"],
      ["Render", "RemoteViews, on the home screen"],
    ],
    limits: [
      "No public release. Ten basic widget types are planned for V1; not all are implemented.",
      "The .layers package format is internal and provisional.",
      "Physical tablets, other launchers and spoken TalkBack have not been verified.",
    ],
    stack: ["Kotlin", "Jetpack Compose", "RemoteViews"],
    why: [
      "A declarative widget platform: a shared Kotlin runtime, responsive per-instance customisation, semantic themes, and a bounded, validated .layers import and export package. First-party and imported widgets share the same runtime.",
    ],
    decisions: [
      ["No arbitrary code", "Widgets cannot carry Kotlin, Java, JavaScript or Python, or arbitrary imported intents. Actions that touch the device go through allowlisted host actions and typed capabilities."],
      ["Honest glass", "Frosted styles use tint and translucency; there is no live launcher blur, and the app does not pretend otherwise."],
    ],
    links: [],
    linksNote: "Private repository. No public release yet.",
  },
  {
    slug: "bluetap",
    title: "BlueTap",
    kicker: "Android Bluetooth widgets",
    group: "rsx",
    status: "Pre-release · foundation complete",
    stage: "pre-release",
    period: "Sep 2026 to now",
    start: [2026, 9],
    ownership: "Personal project, RSX Develops",
    licence: "MIT",
    question: null,
    summary:
      "Home-screen widgets for already-paired Bluetooth devices. Device assignment, per-widget appearance and responsive widget layouts work. Tapping a widget to connect or disconnect is the goal, and it is not implemented yet.",
    face: { kind: "illustration", id: "bluetap", alt: "Illustration of BlueTap: a home-screen widget assigned to a pair of already-paired earbuds. Assigning and customising works; tapping to connect is drawn as a dashed line because it is not implemented.", caption: "Illustration, not a screenshot. The dashed line is not built yet." },
    path: [
      ["Paired devices", "Already-bonded devices only; no scanning"],
      ["Assign", "One device per widget"],
      ["Appearance", "Eight presets, custom artwork"],
      ["Layout", "Responsive, exact-size widget layouts"],
      ["Tap to connect", "Not implemented; waits on Android 17's public APIs"],
    ],
    limits: [
      "Connect and disconnect, live connection state and battery reporting are not implemented.",
      "Public SDK only: no hidden APIs, reflection, root or accessibility services.",
      "Android 17 and real-device validation are pending.",
    ],
    stack: ["Kotlin", "Jetpack Glance", "Android"],
    why: [
      "A native Kotlin, Compose and Glance utility with responsive exact-size widgets, eight appearance presets, custom artwork, and careful per-widget persistence and migration.",
    ],
    decisions: [
      ["Wait for the public API", "The tap-to-connect step waits on Android 17's public APIs, to be verified on a real device first, rather than using hidden APIs or reflection."],
      ["Minimal permissions", "Only the Bluetooth connect permission: no location, no scanning, no network or analytics."],
    ],
    links: [{ label: "Source on GitHub", href: "https://github.com/Rifaque/blue-tap" }],
  },
  {
    slug: "bhatkal-time-luxe",
    title: "Bhatkal Time Luxe",
    short: "BTL",
    kicker: "Client project · HubZero",
    group: "hubzero",
    status: "Delivered · HubZero's first paid client project",
    stage: "delivered",
    period: "Apr to Sep 2025",
    start: [2025, 4],
    end: [2025, 9],
    ownership: "HubZero client work",
    licence: "Client code",
    credit:
      "A HubZero engagement. My work included frontend development and, across different parts and stages, broader architecture, full-stack and infrastructure work. Visual design by a HubZero co-founder.",
    question: null,
    summary:
      "A luxury watch storefront for a retailer serving Kuwait and the wider GCC, and HubZero's first paid client project.",
    face: {
      kind: "screenshot",
      src: `${KB}/bhatkal-time-luxe/btl-2025-ui-composite.png`,
      w: 1280,
      h: 450,
      alt: "Bhatkal Time Luxe, 2025 interface: desktop home, brand index, product page and catalogue listing, plus mobile home and product screens.",
      caption: "Screenshots (composite) of the delivered 2025 interface. HubZero client work; visual design by a HubZero co-founder.",
    },
    path: [
      ["Storefront", "Next.js on Vercel, server-rendered"],
      ["API", "Node.js on a self-hosted Ubuntu server"],
      ["Data", "MongoDB"],
      ["Images", "Cloudinary with imgix in front"],
    ],
    limits: [
      "Client work: the code belongs to the client project and is not presented as personal open source.",
      "The live site has changed since 2025. This describes the delivered work; not every current change is mine.",
    ],
    stack: ["Next.js", "TypeScript", "Node.js", "MongoDB", "Tailwind CSS", "Cloudinary", "imgix", "Vercel", "Ubuntu"],
    why: [
      "It was HubZero's first paid client project, and the first time I carried paid software for another business through to production infrastructure.",
    ],
    decisions: [
      ["Two deployments", "A Next.js storefront deployed on Vercel against a separate Node.js API on a self-hosted Ubuntu server, backed by MongoDB."],
      ["Crawlable catalogue", "Server-rendered pages with JSON-LD and a sitemap, so the catalogue can be found through search."],
    ],
    links: [],
    linksNote: "The live storefront belongs to the client project; this case study is the reference.",
  },
  {
    slug: "querycraft",
    title: "QueryCraft",
    kicker: "Final-year project · HubZero Build",
    group: "hubzero",
    status: "Final-year project · retired",
    stage: "retired",
    period: "Aug 2025 to Jan 2026",
    start: [2025, 8],
    end: [2026, 1],
    ownership: "Collaborative: a three-person team, kept as a HubZero Build",
    licence: "Team project",
    credit: "A three-person final-year project, later kept as a HubZero Build. I was the primary technical contributor.",
    question: "How can natural language interact with structured data?",
    summary:
      "A natural-language database querying app: plain English in, SQL or NoSQL queries out, generated by locally hosted Qwen and Mistral models through Ollama.",
    face: { kind: "illustration", id: "querycraft", alt: "Illustration of QueryCraft: a plain-English question becomes a proposed query card with an explanation, passes a validation check, and runs only when the user chooses Run.", caption: "Illustration, not a screenshot. Generation as a proposal." },
    path: [
      ["Question", "Plain English"],
      ["Local model", "Qwen or Mistral through Ollama"],
      ["Proposal", "A query card with an explanation"],
      ["Validation", "Pattern checks block destructive statements"],
      ["Run", "Only when the user chooses"],
    ],
    limits: [
      "The safeguards were prototype-grade: pattern checks in the client, not parsing.",
      "Database connections were not restricted to read-only accounts.",
      "HubZero's later production rebuild is a separate codebase and not described here as my work.",
    ],
    stack: ["Next.js", "Node.js", "Express", "MongoDB", "Python", "Ollama"],
    why: [
      "Getting a model to emit something that looks like SQL is easy. A model will also produce queries that are valid but wrong or unsafe, and unlike a chat reply, a query has consequences when it runs. So generation was treated as a proposal: each query came back with an explanation, and nothing ran until the user chose to execute it.",
    ],
    decisions: [
      ["Local inference by choice", "Generation ran on open models through Ollama on hardware we controlled, rather than through a hosted API. With smaller models there is nowhere to hide a weak prompt or a missing check."],
      ["Described as it was", "A later review of the original code recorded the same gaps listed under limits. That is a prototype's level of protection, and it is described here as exactly that."],
    ],
    links: [],
  },
];

export const experience = [
  {
    id: "hubzero",
    org: "HubZero",
    role: "Co-founder & Software Engineer",
    period: "Jan 2025 to now",
    start: [2025, 1],
    body: "An engineering studio I co-founded. I work across its architecture, full-stack implementation and delivery infrastructure: client work including Bhatkal Time Luxe, reusable Blueprint foundations, and Cloudflare, Vercel, DNS and Linux.",
    link: { label: "hubzero.in", href: "https://hubzero.in" },
  },
  {
    id: "rg",
    org: "RG SmartDiscovery LLP",
    role: "Software Engineer Intern",
    period: "Aug 2025 to May 2026",
    start: [2025, 8],
    end: [2026, 5],
    body: "Frontend development and API integration across nxNearby's job portal and its AI-assisted course and quiz workflows, including the quiz-generation interface.",
  },
  {
    id: "aitm",
    org: "AITM, affiliated with VTU",
    role: "B.E. Computer Science and Engineering",
    period: "Dec 2022 to Jun 2026",
    start: [2022, 12],
    end: [2026, 6],
    body: "CGPA 8.36. Final-year project: QueryCraft, with a team of three. AWS Cloud Practitioner Essentials training, May 2025.",
  },
];

export const principles = [
  ["Capability is not permission.", "Nexus and Atlas both draw a hard line between what a model may propose and what the software lets happen. The interesting engineering is usually at that line."],
  ["Say what isn't done.", "Every project here lists its limits next to its features. A pre-release label is information, not an apology."],
  ["Local first, cloud by consent.", "Where it is practical, data and inference stay on the user's machine, and anything that leaves does so because someone chose it."],
  ["Products, not demos.", "Installers, recovery paths, empty states and the servers things run on are part of the work, whether it is a client storefront or a personal tool."],
];

/**
 * Bill of materials: technology → where it was used. Derived from each
 * project's stack in the knowledge base; nothing listed without a project.
 */
export const materials = [
  ["Languages", [
    ["TypeScript", ["atlas", "bhatkal-time-luxe"]],
    ["Rust", ["atlas"]],
    ["Python", ["nexus", "querycraft"]],
    ["Kotlin", ["reflux", "extendspace", "layers", "bluetap"]],
    ["C# / .NET 10", ["extendspace"]],
  ]],
  ["Interfaces", [
    ["React", ["atlas"]],
    ["Next.js", ["bhatkal-time-luxe", "querycraft"]],
    ["Tauri 2", ["atlas"]],
    ["Compose", ["reflux", "extendspace", "layers"]],
    ["Glance / RemoteViews", ["bluetap", "layers"]],
    ["WinUI 3", ["extendspace"]],
  ]],
  ["Back end and data", [
    ["Node.js", ["bhatkal-time-luxe", "querycraft"]],
    ["FastAPI", ["nexus"]],
    ["PostgreSQL + pgvector", ["nexus"]],
    ["MongoDB", ["bhatkal-time-luxe", "querycraft"]],
    ["LanceDB", ["atlas"]],
  ]],
  ["AI and retrieval", [
    ["Ollama (local models)", ["nexus", "atlas", "querycraft"]],
    ["BM25 + embeddings, RRF", ["atlas"]],
    ["faster-whisper", ["nexus"]],
  ]],
  ["Media and devices", [
    ["Media3 / libmpv", ["reflux"]],
    ["H.264, MediaCodec", ["extendspace"]],
  ]],
  ["Delivery", [
    ["Vercel", ["bhatkal-time-luxe"]],
    ["Ubuntu, self-hosted", ["bhatkal-time-luxe", "querycraft"]],
  ]],
];

/*
 * Where each project stands, layer by layer. `state` follows the order of
 * `path`; `ghosts` are parts that are partial or not built and have no place
 * in the working path yet. Every note comes from the project's record in the
 * knowledge base (limits, "do not claim", owner-verified detail).
 *   built   · works as described
 *   partial · exists with a stated limit
 *   planned · not implemented
 */
const STRUCTURE = {
  atlas: {
    state: [
      ["built", "Released in v1.0.3"],
      ["built", "Released; embeddings made locally"],
      ["built", "Released"],
      ["built", "Released; calibration is heuristic"],
      ["built", "Evidence considered, not sentence-level attribution"],
    ],
    ghosts: [],
  },
  nexus: {
    state: [
      ["partial", "Voice exists on working branches only"],
      ["built", "Deterministic and model-less"],
      ["built", "One bounded decision per request"],
      ["built", "Defaults refuse; deny beats allow"],
      ["built", "Every call recorded, denials included"],
    ],
    ghosts: [
      ["Surface", "partial", "Working branches only; not tagged or released"],
      ["System Control", "partial", "Off by default; real adapter not yet accepted"],
    ],
  },
  reflux: {
    state: [
      ["built", "Local, Jellyfin, network shares"],
      ["built", "Editions and qualities as versions"],
      ["built", "Uncertain matches go to Identify"],
      ["built", "Watch state follows the work"],
      ["built", "Verified mainly on emulators"],
    ],
    ghosts: [
      ["Accessibility baseline", "partial", "Contrast and text size tested; labels, focus order, reduced motion not done"],
      ["Release", "planned", "Nothing has been published"],
    ],
  },
  extendspace: {
    state: [
      ["built", "One PC tested"],
      ["built", "1080p60 on one setup"],
      ["built", "Recovers from a pulled cable"],
      ["built", "Hardware evidence from one tablet"],
      ["built", "One tablet tested"],
    ],
    ghosts: [
      ["Connect", "partial", "Disabled in both apps"],
      ["Wi-Fi, pairing, input", "planned", "Not implemented"],
      ["Virtual display", "planned", "Feasibility researched only"],
    ],
  },
  layers: {
    state: [
      ["partial", "Format is internal and provisional"],
      ["built", "Bounded parse and schema checks"],
      ["built", "Semantic themes and presets"],
      ["built", "Per-instance overrides"],
      ["built", "No live launcher blur"],
    ],
    ghosts: [["Widget types", "partial", "Ten basic types planned for V1; not all implemented"]],
  },
  bluetap: {
    state: [
      ["built", "Public SDK only"],
      ["built", "Per-widget assignment"],
      ["built", "Eight presets"],
      ["built", "Font-scale aware"],
      ["planned", "Waits on Android 17's public APIs"],
    ],
    ghosts: [["Live state and battery", "planned", "Not implemented"]],
  },
  "bhatkal-time-luxe": {
    state: [
      ["built", "Delivered 2025; the live site has changed since"],
      ["built", "Delivered 2025"],
      ["built", "Delivered 2025"],
      ["built", "Delivered 2025"],
    ],
    ghosts: [],
  },
  querycraft: {
    state: [
      ["built", "Retired with the project"],
      ["built", "Self-hosted through Ollama"],
      ["built", "Shown with an explanation"],
      ["partial", "Pattern checks in the client, not parsing"],
      ["partial", "Connections were not read-only"],
    ],
    ghosts: [],
  },
};
for (const p of projects) Object.assign(p, STRUCTURE[p.slug]);

export const STATE_TEXT = { built: "Built", partial: "Partial", planned: "Not built" };

/*
 * Experience, education and work in one chronological list, newest first.
 * `exact: false` marks dates recorded only to the year.
 */
export const chronicle = [
  { kind: "Personal projects", title: "Reflux, ExtendSpace, Layers by RSX", org: "RSX Develops", from: [2026, 10], to: null, exact: true, note: "All three started at the beginning of October 2026." },
  { kind: "Personal project", title: "BlueTap", org: "RSX Develops", from: [2026, 9], to: null, exact: true, note: "Started at the end of September 2026.", slug: "bluetap" },
  { kind: "Personal project", title: "Nexus", org: "RSX Develops", from: [2026, 6], to: null, exact: true, note: "Private alpha, actively developing.", slug: "nexus" },
  { kind: "Personal project", title: "Atlas", org: "RSX Develops", from: [2026, 2], to: [2026, 9], exact: true, note: "v1.0.3 released in September 2026.", slug: "atlas" },
  { kind: "Employment", title: "Software Engineer Intern", org: "RG SmartDiscovery LLP", from: [2025, 8], to: [2026, 5], exact: true, note: "Frontend development and API integration for nxNearby's job portal and AI-assisted course and quiz workflows." },
  { kind: "Collaborative project", title: "QueryCraft", org: "Final-year project, kept as a HubZero Build", from: [2025, 8], to: [2026, 1], exact: true, note: "Three-person team; primary technical contributor.", slug: "querycraft" },
  { kind: "Client project", title: "Bhatkal Time Luxe", org: "HubZero", from: [2025, 4], to: [2025, 9], exact: true, note: "HubZero's first paid client project.", slug: "bhatkal-time-luxe" },
  { kind: "Co-founder", title: "Co-founder & Software Engineer", org: "HubZero", from: [2025, 1], to: null, exact: true, note: "Architecture, full-stack implementation and delivery infrastructure for an engineering studio I co-founded.", link: { label: "hubzero.in", href: "https://hubzero.in" } },
  { kind: "Education", title: "B.E. Computer Science and Engineering", org: "AITM, affiliated with VTU", from: [2022, 12], to: [2026, 6], exact: true, note: "CGPA 8.36. AWS Cloud Practitioner Essentials training, May 2025." },
];
