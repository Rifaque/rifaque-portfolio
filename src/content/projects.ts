/**
 * Every project claim, with where it was checked (2026-10-24).
 *
 *   nexus        local/v1-acceptance-integration @ 687e486: README, services/tools
 *   atlas        main @ 154a32e, tag v1.0.3: README, src-tauri/src/shield.rs, outbound.rs
 *   reflux       feature/engine-foundation @ fc51bd4: README, docs/METADATA.md, docs/ROADMAP.md
 *   extendspace  main @ 8a9669f plus its verification record in
 *                docs/architecture/production-session-architecture.md
 *   bluetap      main @ 46eaf08: README
 *   layers       feature/release-hardening @ e578e4a: README
 *   querycraft   resume; HubZeroHQ/querycraft docs/pkp/summary.md (audit of the
 *                original final-year repositories)
 *   bhatkal-time-luxe  resume; live site, Sep 2026
 *
 * Rules this file follows: no metric that was not measured, no capability
 * that is planned presented as done, no source link to a repository whose
 * public state lags the claims made here, and team work attributed as such.
 */

export type Maturity = "released" | "active" | "delivered" | "retired";

export type ProjectLink = { label: string; href: string };

export type Section =
  | { heading: string; body: string[]; list?: never }
  | { heading: string; list: string[]; body?: string[] };

export type Media = {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

export type Project = {
  slug: string;
  title: string;
  kicker: string;
  /** One line used in the status rail, lists and the command palette. */
  status: string;
  maturity: Maturity;
  period: string;
  role: string;
  /** Owner of the work when it is not a personal project. */
  attribution?: string;
  question?: string;
  summary: string;
  points: string[];
  limits: string;
  links: ProjectLink[];
  /** Short meta description for the case-study page. */
  description: string;
  stack: string[];
  sections: Section[];
  /** Spoken description of the project's illustration. */
  diagramLabel?: string;
  media?: Media;
};

const atlasScreenshot: Media = {
  src: "/images/atlas/atlas-1.0-ask.webp",
  srcSet: "/images/atlas/atlas-1.0-ask-751.webp 751w, /images/atlas/atlas-1.0-ask.webp 1502w",
  width: 1502,
  height: 1038,
  alt: "Atlas 1.0 Ask view: a question about workspace authorisation, a grounded answer with an 'Evidence considered 8' control, and a Sources panel listing retrieved files with line ranges.",
  caption: "Screenshot · Atlas 1.0 Ask view with the evidence panel. Local folder path masked.",
};

export const projects: Project[] = [
  // ------------------------------------------------------------------ NEXUS
  {
    slug: "nexus",
    title: "Nexus",
    kicker: "Personal AI operating layer",
    status: "Private alpha · active development",
    maturity: "active",
    period: "Jun 2026 – present",
    role: "Personal project",
    question: "How can a personal AI stay useful without capability quietly becoming authority?",
    summary:
      "A local-first, voice-first layer for one owner on one Windows machine. Deterministic recognition handles what it can without a model, a reasoning step is reached only when it declines, and every effect passes through a single governed tool runtime.",
    points: [
      "The Command Fabric recognises and routes. It imports no tool runtime and cannot execute anything.",
      "The Cortex is a fallback, reached only when the deterministic layers decline. Choosing a capability is not authorising it.",
      "ToolRuntime is the only place an effect happens: a capability gate, a deny-overrides policy stack, then owner confirmation bound to a hash of the computed effect.",
    ],
    limits:
      "No public source or demo. System Control is off by default. The Surface and voice exist on working branches only, and spoken acceptance of the voice endpoint is paused.",
    links: [],
    description:
      "Nexus is a private-alpha, voice-first personal AI layer for Windows that keeps what a model may suggest separate from what is allowed to happen, through one governed tool runtime.",
    stack: ["Python 3.13", "FastAPI", "PostgreSQL + pgvector", "uv workspace", "pywebview / WebView2", "faster-whisper", "Anthropic Claude", "Ollama"],
    diagramLabel:
      "Illustration of the Nexus request path: a request enters the Command Fabric, which either answers deterministically, routes a typed intent, or falls back to the Cortex. Every effect, from either route, must pass the capability gate, policy and hash-bound approval inside ToolRuntime.",
    sections: [
      {
        heading: "The question",
        body: [
          "Most assistants become more useful by being allowed to do more. Nexus tries to keep those two things apart: an assistant that can hold a great deal of context about its owner and their work, while what it may actually change on the machine stays narrow, explicit and auditable.",
          "It is built for one owner on one Windows machine. You speak to it, or summon it with a hotkey, and it answers through a small on-screen Surface and a local voice.",
        ],
      },
      {
        heading: "From words to effects",
        body: ["A request passes through layers that each decide one thing. Only the last one can change anything."],
        list: [
          "Fast Front Door and Command Fabric: deterministic, model-less recognition. \"Set a timer for ten minutes\" becomes a typed intent with typed slots, or is marked ambiguous, unsupported or a matter for the assistant. It recognises and routes, and it cannot execute anything.",
          "Response engine: deterministic wording for structured outcomes, with no model call.",
          "Interactive Cortex: the model-driven step, reached only when the deterministic layers decline. It makes one bounded decision: answer, pick one governed capability from a closed set, ask a question, or delegate.",
          "ToolRuntime: the only place an effect happens. Every call passes a capability gate and then a policy engine in which one deny beats any number of allows. The executor computes the effect itself; the model's description of it is never trusted.",
        ],
      },
      {
        heading: "Approval that cannot drift",
        body: [
          "A consequential call needs explicit owner confirmation, and that approval is bound to a hash of the computed effect. If the effect changes after approval, the approval is void. Mutations are checkpointed in a shadow Git repository, and every call is recorded in an append-only, hash-chained ledger.",
          "The defaults refuse. The standard policy stack is read-only, so every call at or above \"mutate\" is denied before confirmation is ever reached; the mutating stacks are explicit opt-in configurations. Host control (System Control) registers no tool at all unless it is configured, and there is no shell, PowerShell or run-command tool.",
        ],
      },
      {
        heading: "What else is there",
        list: [
          "Persistent memory: facts with versioning, confidence, decay and provenance, searchable semantically (pgvector) and by keyword.",
          "Context assembly from git state, project profile, tasks and memories, built without calling a model.",
          "Reminders, goals, routines and notes, every mutation going through one chokepoint and one audit chain.",
          "The Surface System: one frameless, always-on-top WebView2 window that changes shape with what Nexus is doing.",
          "Push-to-talk voice with no wake word and no background listening. Speech-to-text runs locally on faster-whisper; speech output uses Windows SAPI by default, or an optional local neural voice.",
          "Provider neutrality between Anthropic Claude and local Ollama models.",
        ],
      },
      {
        heading: "Limits and what is not verified",
        list: [
          "Private alpha: Windows only, single owner, unreleased, with no public demo or source.",
          "The newest tag, v1.3.0-alpha.1, predates the desktop shell and voice. Those exist on working branches and have not been tagged or released.",
          "Spoken acceptance of the voice endpoint on the owner's machine is paused, and the decision record is still proposed.",
          "How the Surface looks by eye, behaviour during a real game, and the real System Control adapter have not been accepted yet.",
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ ATLAS
  {
    slug: "atlas",
    title: "Atlas",
    kicker: "Local-first workspace intelligence",
    status: "v1.0.3 released · not in active development",
    maturity: "released",
    period: "Feb – Sep 2026",
    role: "Personal project · MIT licensed",
    question: "Can an assistant answer from your workspace, and say so when it can't?",
    summary:
      "A Rust and Tauri 2 desktop app that indexes one codebase or document set and answers with inspectable evidence. Questions without enough workspace evidence can be declined instead of answered from general model knowledge.",
    points: [
      "Semantic and BM25 candidates are fused with reciprocal-rank fusion, then classified for relevance and cut to a bounded evidence set.",
      "Cloud generation through OpenRouter is opt-in per request. Secret Shield scans the complete outbound payload for known secret patterns and blocks the request if it finds one.",
      "Workspace access is authorised in the Rust backend; requested paths are canonicalised and confined to the workspace root.",
    ],
    limits: "Windows x64 only, shipped as an unsigned NSIS installer. The updater is disabled and Linux is unverified.",
    links: [
      { label: "Source on GitHub", href: "https://github.com/Rifaque/atlas" },
      { label: "atlas.rsxdevelops.dev", href: "https://atlas.rsxdevelops.dev" },
      { label: "v1.0.3 release", href: "https://github.com/Rifaque/atlas/releases/tag/v1.0.3" },
    ],
    description:
      "Atlas 1.0.3 is a released, MIT-licensed Windows desktop app that indexes a codebase or document set and answers with inspectable evidence, using BM25 and semantic retrieval fused with RRF.",
    stack: ["Rust", "Tauri 2", "React 19", "TypeScript", "Ollama", "OpenRouter (opt-in)"],
    diagramLabel:
      "Illustration of the Atlas retrieval pipeline: semantic and BM25 candidates converge through reciprocal-rank fusion into a relevance check, which either selects bounded evidence for an answer or declines for lack of evidence. An optional cloud path passes through Secret Shield.",
    media: atlasScreenshot,
    sections: [
      {
        heading: "One loop, on purpose",
        body: [
          "Earlier builds of Atlas reached for more surfaces. For 1.0 the product was narrowed to a single loop: open a workspace, index it, ask or find, inspect the evidence, follow up. Agents, arbitrary shell execution, personas, graph surfaces, web search and vision attachments are not part of 1.0.",
        ],
      },
      {
        heading: "Retrieval",
        body: [
          "Workspace files are chunked and embedded locally through Ollama. A question gathers semantic candidates and BM25 candidates, fuses them with reciprocal-rank fusion, classifies them for relevance, removes duplicates and selects a bounded evidence set for the model.",
          "Indexing is incremental, and a damaged generated index can be detected and rebuilt without touching the source files.",
        ],
      },
      {
        heading: "Saying it doesn't know",
        body: [
          "When a question has no adequate evidence in the workspace, Atlas can decline it rather than answer from general model knowledge. The evidence it shows is the material supplied to or considered for an answer, not sentence-level attribution, and the app says so.",
        ],
      },
      {
        heading: "An explicit cloud boundary",
        body: [
          "With local Ollama, indexing, embeddings, generation and evidence stay on the machine. OpenRouter is optional and has to be enabled explicitly; a request that has not authorised it is blocked.",
          "When it is enabled, the query, retrieved evidence, pinned context, relevant history and any enabled Git or system context may be sent. Before anything leaves, Atlas assembles the complete bounded payload and Secret Shield scans it for known secret formats such as AWS keys, GitHub tokens and API keys. A match blocks the request. The OpenRouter key is held by the Rust side in the operating system's credential store.",
        ],
      },
      {
        heading: "Limits",
        list: [
          "Windows x64 only. The installer is unsigned, so SmartScreen shows an Unknown Publisher warning; the release publishes a SHA-256 checksum.",
          "The updater is disabled. Linux is configured but unverified, and macOS is unsupported.",
          "PDF and generic-file chunking is basic, relevance calibration is heuristic and context budgeting is approximate.",
          "Secret Shield matches known patterns. It is a safety net for the cloud path, not a guarantee.",
        ],
      },
    ],
  },

  // ----------------------------------------------------------------- REFLUX
  {
    slug: "reflux",
    title: "Reflux",
    kicker: "Local-first media client",
    status: "Pre-release · source-available, not open source",
    maturity: "active",
    period: "2026 – present",
    role: "Personal project · proprietary, all rights reserved",
    question: "What if a film were one thing, no matter how many files it lives in?",
    summary:
      "A Kotlin Multiplatform media client in which a work is distinct from the versions and sources that provide it. Watch and resume state belong to the work, so playback continues from any copy: a local folder, a Jellyfin server or a network share.",
    points: [
      "Identification reads ordinary filenames and honours embedded {tmdb-…}, IMDb and Plex edition tags. Editions and qualities of one work become versions of a single item.",
      "Playback runs through Media3 on Android and libmpv on desktop, from one shared engine.",
      "Organisation is virtual: Reflux never renames, moves or modifies the user's files.",
    ],
    limits:
      "Nothing has been published. Android and TV builds have been verified mainly on emulators, and the accessibility baseline is partial.",
    // The public repository lags the local branch; no source link until it is
    // brought up to date (owner decision, Oct 2026).
    links: [],
    description:
      "Reflux is a pre-release, source-available Kotlin Multiplatform media client that treats a film or show as one work across many files and sources, with watch state that follows the work.",
    stack: ["Kotlin Multiplatform", "Compose", "Media3 (Android)", "libmpv (desktop)", "Jellyfin", "TMDB"],
    diagramLabel:
      "Illustration of the Reflux media model: three sources provide several file versions, identification resolves them into one work, and watch state and best-version playback attach to that work rather than to a file.",
    sections: [
      {
        heading: "Works, versions and sources",
        body: [
          "Most players treat a file as the thing you watch. Reflux treats the film or show as the thing, and files as versions of it that sources happen to provide. A 1080p copy on a laptop, a 4K copy on a Jellyfin server and an extended edition on a network share are three versions of one work.",
          "Watch and resume state belong to the work, so you can stop on one copy and continue on another. Library state lives in the platform's data directory and never in your media folders; nothing is renamed or moved.",
        ],
      },
      {
        heading: "Identification",
        list: [
          "Titles are read from ordinary filenames: a title ends at the first unambiguous release token, and ambiguous words are treated only as hints.",
          "Embedded IDs such as {tmdb-123} and IMDb IDs, and Plex {edition-…} tags, are honoured.",
          "A file without a year joins its title's only known year. With several known years, such as two films of the same name, it stays separate rather than being guessed into the wrong work.",
          "A metadata match is accepted only when it is strong and clearly ahead of the runner-up. Anything else goes to an Identify flow instead of being guessed.",
        ],
      },
      {
        heading: "Playback",
        body: [
          "One engine drives every form factor: Media3 on Android and libmpv on desktop. Reflux picks the best available version for the device, and input adapts to touch, mouse and keyboard, game controllers and TV remotes.",
        ],
      },
      {
        heading: "Status and limits",
        list: [
          "Pre-release; nothing has been published. The engine and one experience layer run on Windows, Linux, Android phones and tablets, and Android TV / Google TV.",
          "Android and television builds have been verified mainly on emulators.",
          "Accessibility is partial: contrast and system text size are tested, while screen-reader labels on every control, focus order, reduced motion and a TalkBack / Narrator pass are not done yet.",
          "Reflux is proprietary. The source is public so the work can be seen, but that grants no permission to redistribute, modify or reuse it.",
        ],
      },
    ],
  },

  // ------------------------------------------------------------ EXTENDSPACE
  {
    slug: "extendspace",
    title: "ExtendSpace",
    kicker: "Windows to Android second screen",
    status: "In development · Connect still disabled",
    maturity: "active",
    period: "2026 – present",
    role: "Personal project · MIT licensed",
    question: "Can a tablet on a USB cable become a dependable second screen for Windows?",
    summary:
      "A Windows host and an Android companion that stream the desktop to a tablet. The production session path has streamed a live 1080p60 picture over USB to one tablet, driven by gated acceptance tests. Ordinary use is not possible yet: Connect is still disabled.",
    points: [
      "Display capture and hardware H.264 encoding on Windows, decoding on Android, each behind an explicit session owner with tested state models on both sides.",
      "Decoders are created on a dedicated owner thread; frames that arrive meanwhile wait in order, within limits, and beyond that the stream skips to the next keyframe.",
      "The USB link recovers from a pulled cable with video still flowing afterwards.",
    ],
    limits:
      "Tested on one PC and one tablet only. Wi-Fi, pairing, input forwarding and the virtual display that true extension needs are not implemented.",
    // The public repository's last push predates the work described here.
    links: [],
    description:
      "ExtendSpace is an in-development Windows-to-Android second-screen project: capture, hardware encoding and USB streaming to a tablet, tested on one device, with Connect still disabled.",
    stack: ["C# / .NET 10", "WinUI 3", "Kotlin", "Jetpack Compose", "H.264 (MediaCodec)", "USB transport"],
    diagramLabel:
      "Illustration of the ExtendSpace stream: the Windows desktop is captured and hardware-encoded, carried over USB by a session-owned link, and decoded on the tablet by a dedicated decoder owner, with recovery that skips to the next keyframe.",
    sections: [
      {
        heading: "The aim",
        body: [
          "ExtendSpace turns an Android tablet into a second display for Windows: mirroring first, and true extension later, which needs a virtual display driver on Windows. The work so far is the streaming pipeline and the session machinery around it.",
        ],
      },
      {
        heading: "What has been tested",
        body: [
          "On one PC and one tablet (a Xiaomi Pad 7 over USB), the production session path streamed a 1080p60 test pattern for ten minutes: 36,081 frames sent, all of them decoded and released to the tablet's surface. A later sixty-minute soak at 1080p60 drew all 216,212 frames, and the same build was exercised through the 720p30 fallback, rotation, screen-off, cable pulls and a frozen app.",
          "These runs were driven by gated acceptance tests on the PC and a debug-only screen on the tablet. They show the pipeline working on one setup; they are not broad device validation.",
        ],
      },
      {
        heading: "How it is put together",
        list: [
          "Windows host in C# and WinUI 3: capture and hardware H.264 encoding behind a production session owner.",
          "Android companion in Kotlin and Jetpack Compose: link, decoder ownership and surface handling, with a session state model covered by unit tests.",
          "A draft wire protocol, implemented on both sides, over a USB transport with reconnection.",
          "Decoder creation happens on one owner thread per receiver, never on the reader thread; a creation is used only if it still matches the stream that is wanted.",
        ],
      },
      {
        heading: "Not done yet",
        list: [
          "Connect is disabled in both apps, and each says so in its own interface.",
          "Wi-Fi transport and pairing are not implemented. Input forwarding does not exist yet.",
          "The virtual display driver for Extend mode is not implemented; only its feasibility has been researched.",
          "One fault is open: Windows occasionally stops delivering captured frames while a browser plays video full screen, and nothing detects it yet.",
        ],
      },
    ],
  },

  // ------------------------------------------------------ BHATKAL TIME LUXE
  {
    slug: "bhatkal-time-luxe",
    title: "Bhatkal Time Luxe",
    kicker: "Client project · HubZero",
    status: "Delivered · HubZero's first paid client project",
    maturity: "delivered",
    period: "Apr – Sep 2025",
    role: "Architecture, full-stack development and infrastructure",
    attribution:
      "Delivered by HubZero. I handled architecture, full-stack development and infrastructure; a HubZero co-founder handled the visual design.",
    summary:
      "A luxury watch storefront for a retailer serving Kuwait and the wider GCC, and HubZero's first paid client project. I built and deployed it end to end, from the architecture to the servers it runs on.",
    points: [
      "Next.js storefront deployed on Vercel against a separate Node.js API on a self-hosted Ubuntu server.",
      "MongoDB data model, with product images delivered through Cloudinary and imgix.",
      "Server-rendered pages with structured data and a sitemap for search.",
    ],
    limits: "Client work: the code belongs to the client project and is not presented here as a personal open-source project.",
    links: [{ label: "Live site", href: "https://btl.hubzero.in" }],
    description:
      "Bhatkal Time Luxe: a luxury watch storefront and HubZero's first paid client project. Architecture, full-stack development and infrastructure by Rifaque Ahmed Akrami; visual design by a HubZero co-founder.",
    stack: ["Next.js", "TypeScript", "Node.js", "MongoDB", "Tailwind CSS", "Cloudinary", "imgix", "Vercel", "Ubuntu"],
    sections: [
      {
        heading: "Who did what",
        body: [
          "This was a HubZero engagement. I was responsible for the architecture, the full-stack implementation, the database and the infrastructure. The visual design was done by one of my HubZero co-founders.",
        ],
      },
      {
        heading: "What was built",
        list: [
          "A Next.js App Router storefront, deployed on Vercel.",
          "A separate Node.js API running on a self-hosted Ubuntu server, backed by MongoDB.",
          "An image pipeline through Cloudinary with imgix in front for delivery.",
          "Server-rendered pages with JSON-LD and a sitemap, so the catalogue is crawlable.",
        ],
      },
      {
        heading: "Why it is here",
        body: [
          "It was HubZero's first paid client project, and the first time I carried paid software from architecture through to production infrastructure for another business.",
        ],
      },
    ],
  },

  // ------------------------------------------------------------- QUERYCRAFT
  {
    slug: "querycraft",
    title: "QueryCraft",
    kicker: "Final-year project · HubZero Build",
    status: "Final-year project · retired",
    maturity: "retired",
    period: "Aug 2025 – Jan 2026",
    role: "Primary technical contributor, three-person team",
    attribution:
      "A three-person final-year project, later kept as a HubZero Build. I was the primary technical contributor.",
    summary:
      "A natural-language database querying app: plain English in, SQL or NoSQL queries out, generated by locally hosted Qwen and Mistral models through Ollama.",
    points: [
      "Generated queries were shown with an explanation and ran only when the user chose to execute them.",
      "Validation ran before execution and blocked destructive statements.",
      "Inference was self-hosted through Ollama rather than sent to a hosted API.",
    ],
    limits:
      "The safeguards were prototype-grade: pattern-based checks in the client, not parsing, and connections were not read-only.",
    links: [],
    description:
      "QueryCraft: a three-person final-year project turning natural language into SQL and NoSQL queries with local Qwen and Mistral models, with validation before execution. Primary technical contributor: Rifaque Ahmed Akrami.",
    stack: ["Next.js", "Node.js", "Express", "MongoDB", "Python", "Ollama (Qwen, Mistral)"],
    sections: [
      {
        heading: "The team",
        body: [
          "QueryCraft was my final-year engineering project, built by a team of three. I was the primary technical contributor: the conversational interface, generation through locally hosted models, validation before execution, execution safeguards and the self-hosted inference setup.",
        ],
      },
      {
        heading: "The interesting part is after generation",
        body: [
          "Getting a model to emit something that looks like SQL is easy. A model will also produce queries that are syntactically valid but wrong or unsafe, and unlike a chat reply, a query has consequences when it runs. So generation was treated as a proposal: each query came back with an explanation in a card, and nothing ran until the user chose to execute it.",
        ],
      },
      {
        heading: "The safeguards, precisely",
        list: [
          "A validation step ran before execution and blocked destructive statements.",
          "That check ran in the client and matched patterns rather than parsing the query, and database connections were not restricted to read-only accounts.",
          "That is a prototype's level of protection, and a later review of the original code recorded the same gaps. I describe it here as what it was.",
        ],
      },
      {
        heading: "Local inference by choice",
        body: [
          "Generation ran on open models (Qwen and Mistral) through Ollama on hardware we controlled, rather than through a hosted API. With smaller models there is nowhere to hide a weak prompt or a missing check, which made the constraint instructive.",
          "HubZero later rebuilt QueryCraft as a separate production codebase. That rebuild is not the final-year project and is not described here as my work.",
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- BLUETAP
  {
    slug: "bluetap",
    title: "BlueTap",
    kicker: "Android Bluetooth widgets",
    status: "Pre-release · foundation complete",
    maturity: "active",
    period: "2026 – present",
    role: "Personal project · MIT licensed",
    summary:
      "Home-screen widgets for already-paired Bluetooth devices. Device assignment, per-widget appearance and responsive widget layouts work. Tapping a widget to connect or disconnect is the goal, and it is not implemented yet.",
    points: [],
    limits:
      "Connect and disconnect, live connection state and battery reporting are not implemented; they wait on Android 17's public APIs, to be verified on a real device first. Public SDK only: no hidden APIs, reflection, root or accessibility services.",
    links: [{ label: "Source on GitHub", href: "https://github.com/Rifaque/blue-tap" }],
    description: "BlueTap: pre-release Android widgets for paired Bluetooth devices.",
    stack: ["Kotlin", "Jetpack Glance", "Android"],
    sections: [],
  },

  // ----------------------------------------------------------------- LAYERS
  {
    slug: "layers",
    title: "Layers by RSX",
    kicker: "Android widget platform",
    status: "Pre-release · no public release",
    maturity: "active",
    period: "2026 – present",
    role: "Personal project · private repository",
    summary:
      "A customisable Android widget platform built around a portable widget definition. Ten first-party widget families run on a shared runtime with a generic editor, a theme system and curated presets.",
    points: [],
    limits:
      "No public release, and the .layers package format is internal and provisional. Physical tablets, other launchers and spoken TalkBack have not been verified.",
    links: [],
    description: "Layers by RSX: a pre-release Android widget platform.",
    stack: ["Kotlin", "Jetpack Compose", "RemoteViews"],
    sections: [],
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

/** The home page's signature carousel, in order. */
export const selectedSlugs = ["nexus", "atlas", "reflux", "extendspace"] as const;
/** Nested under HubZero in Experience. */
export const studioSlugs = ["bhatkal-time-luxe", "querycraft"] as const;
/** Compact entries; no case-study pages. */
export const smallerSlugs = ["bluetap", "layers"] as const;
/** Projects that have a /work/:slug page. */
export const caseStudySlugs = [...selectedSlugs, ...studioSlugs] as const;

export const pick = (slugs: readonly string[]) =>
  slugs.map((s) => {
    const p = projectBySlug(s);
    if (!p) throw new Error(`Unknown project: ${s}`);
    return p;
  });
