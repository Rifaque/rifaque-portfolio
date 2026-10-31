/**
 * Every project fact, transcribed from knowledge-base/projects/*.md (published
 * copy checked 2026-10-24) and the owner's later decisions in the rebuild
 * briefs (25 Oct 2026). Open questions are listed in
 * prototypes/rebuild-log/PROGRESS.md and resolved conservatively here:
 *
 *  - Nexus: "Private alpha · in development"; sole author, confirmed by the
 *    owner on 31 Oct 2026.
 *  - Bhatkal Time Luxe (owner's correction, 31 Oct 2026): HubZero's first paid
 *    client project for a Bhatkal-based retailer with an India-wide focus; a
 *    co-founder established the initial UI/UX foundation, and Rifaque redesigned
 *    the storefront and built it end to end on that foundation; GCC and Kuwait
 *    support was a June–July 2026 demo for a prospective client; the site is
 *    now a live showcase, not an active storefront.
 *  - Reflux: no repository link until the owner decides.
 *  - Licences: MIT for Atlas, BlueTap, ExtendSpace; Proprietary for Reflux;
 *    closed source for Nexus, with future licensing undecided; nothing shown
 *    for the others.
 *
 * Rules: no metric that was not measured, nothing planned presented as done,
 * team work attributed as such, every visual labelled Screenshot or
 * Illustration.
 */
import type { Project } from "./types";
import atlasAsk from "../assets/space/atlas-1.0-ask.webp";
import atlasAskSmall from "../assets/space/atlas-1.0-ask-751.webp";
import btlLiveHome from "../assets/space/btl-current-home-desktop-inr.webp";
import btlLiveArrivals from "../assets/space/btl-current-new-arrivals-desktop-inr.webp";

export const projects: Project[] = [
  // ------------------------------------------------------------------ NEXUS
  {
    slug: "nexus",
    title: "Nexus",
    kicker: "Personal AI operating layer",
    status: "Private alpha · in development",
    stage: "private-alpha",
    licence: "Closed source",
    licenceNote: "Closed source. The source is private; there is no public repository or demo. Future licensing and distribution have not been decided.",
    period: "Jun 2026 – present",
    ownership: { kind: "personal", label: "Personal project · RSX Develops" },
    role: "Personal project",
    question: "How can a personal AI stay useful without capability quietly becoming authority?",
    summary:
      "A local-first, voice-first layer for one owner on one Windows machine. Deterministic recognition handles what it can without a model, a reasoning step is reached only when it declines, and every effect passes through a single governed tool runtime.",
    problem: [
      "Most assistants become more useful by being allowed to do more. Nexus tries to keep those two things apart: an assistant that can hold a great deal of context about its owner and their work, while what it may actually change on the machine stays narrow, explicit and auditable.",
      "It is built for one owner on one Windows machine. You speak to it, or summon it with a hotkey, and it answers through a small on-screen Surface and a local voice.",
    ],
    how: [
      { title: "Command Fabric", body: "Deterministic, model-less recognition. “Set a timer for ten minutes” becomes a typed intent with typed slots, or is marked ambiguous, unsupported or a matter for the assistant. It recognises and routes; it cannot execute anything." },
      { title: "Response engine", body: "Deterministic wording for structured outcomes, with no model call." },
      { title: "Interactive Cortex", body: "The model-driven step, reached only when the deterministic layers decline. It makes one bounded decision: answer, pick one governed capability from a closed set, ask a question, or delegate." },
      { title: "ToolRuntime", body: "The only place an effect happens. Every call passes a capability gate and then a policy engine in which one deny beats any number of allows. The executor computes the effect itself; the model's description of it is never trusted." },
    ],
    decisions: [
      { title: "Approval that cannot drift", body: "A consequential call needs explicit owner confirmation, and that approval is bound to a hash of the computed effect. If the effect changes after approval, the approval is void." },
      { title: "The defaults refuse", body: "The standard policy stack is read-only, so every call at or above “mutate” is denied before confirmation is ever reached. Host control registers no tool at all unless it is configured, and there is no shell, PowerShell or run-command tool." },
      { title: "Structure over instructions", body: "Filesystem tools cannot accept a raw path string; they receive a confined path that only the path jail can construct. That is stronger than trusting every future call site to remember to validate." },
    ],
    stack: [
      { name: "Python 3.13 · uv workspace", why: "A multi-package workspace with protocol boundaries, so the safety-critical tool runtime stays isolated from everything else." },
      { name: "FastAPI", why: "The service layer around the runtime." },
      { name: "PostgreSQL + pgvector", why: "Memory with versioning, confidence, decay and provenance, searchable semantically and by keyword." },
      { name: "pywebview / WebView2", why: "One frameless, always-on-top Surface window that changes shape with what Nexus is doing." },
      { name: "faster-whisper", why: "Push-to-talk speech-to-text that runs locally. No wake word and no background listening." },
      { name: "Anthropic Claude · Ollama", why: "Provider neutrality between a hosted model and local models." },
    ],
    limits: [
      "Private alpha: Windows only, single owner, unreleased, with no public demo or source.",
      "The newest tag, v1.3.0-alpha.1, predates the desktop shell and voice. Those exist on working branches and have not been tagged or released.",
      "Spoken acceptance of the voice endpoint on the owner's machine is paused, and the decision record is still proposed.",
      "How the Surface looks by eye, behaviour during a real game, and the real System Control adapter have not been accepted yet.",
    ],
    links: [],
    linksNote: "No public source or demo. The repository is private.",
    media: [
      {
        kind: "illustration",
        id: "nexus",
        label: "Illustration of the Nexus request path: a request enters the Command Fabric, which either answers deterministically, routes a typed intent, or falls back to the Cortex. Every effect, from either route, must pass the capability gate, policy and hash-bound approval inside ToolRuntime.",
        caption: "The request path. Every effect, from either route, passes through ToolRuntime.",
      },
    ],
    caseStudy: [
      {
        heading: "Approval that cannot drift",
        body: [
          "A consequential call needs explicit owner confirmation, and that approval is bound to a hash of the computed effect. If the effect changes after approval, the approval is void. Mutations are checkpointed in a shadow Git repository, and every call is recorded in an append-only, hash-chained ledger.",
          "The defaults refuse. The standard policy stack is read-only, so every call at or above “mutate” is denied before confirmation is ever reached; the mutating stacks are explicit opt-in configurations. Host control (System Control) registers no tool at all unless it is configured, and there is no shell, PowerShell or run-command tool.",
        ],
      },
      {
        heading: "Governance is part of the architecture",
        body: [
          "The model does not get to define what its own action means. The executor computes the effect; where approval is required, the owner approves that concrete effect, and the approval is bound to it.",
          "Risk analysis is advisory: it never allows, denies or performs I/O. Only the policy engine decides, and policies compose so that an added policy can only tighten. The tool runtime is isolated as its own package with a single composition point, so it can be reasoned about on its own.",
          "The rules that keep this true are written down as numbered invariants in an architectural constitution, and they can only be changed by a superseding decision record.",
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
        heading: "What the process taught",
        body: [
          "An independent architectural audit once found blocking defects behind a fully green test suite; they were fixed before that release was tagged. Since then, adversarial audits, written invariants and acceptance on the owner's real machine are routine gates, not extras. A green suite is necessary and not sufficient.",
        ],
      },
    ],
    seo: {
      title: "Nexus: personal AI operating layer",
      description:
        "Nexus is a private-alpha, voice-first personal AI layer for Windows that keeps what a model may suggest separate from what is allowed to happen, through one governed tool runtime.",
    },
  },

  // ------------------------------------------------------------------ ATLAS
  {
    slug: "atlas",
    title: "Atlas",
    kicker: "Local-first workspace intelligence",
    status: "v1.0.3 released · not in active development",
    stage: "released",
    licence: "MIT",
    period: "Feb – Sep 2026",
    ownership: { kind: "personal", label: "Personal project · RSX Develops" },
    role: "Personal project",
    question: "Can an assistant answer from your workspace, and say so when it can't?",
    summary:
      "A Rust and Tauri 2 desktop app that indexes one codebase or document set and answers with inspectable evidence. Questions without enough workspace evidence can be declined instead of answered from general model knowledge.",
    problem: [
      "A model can answer fluently about code it was never shown. Atlas narrows the job: index one workspace locally, retrieve well, and show the material an answer was built from.",
      "When a question has no adequate evidence in the workspace, Atlas can decline it rather than answer from general model knowledge.",
    ],
    how: [
      { title: "Open and index", body: "Workspace files are chunked and embedded locally through Ollama. Indexing is incremental, and a damaged generated index can be detected and rebuilt without touching the source files." },
      { title: "Retrieve", body: "A question gathers semantic candidates and BM25 candidates and fuses them with reciprocal-rank fusion." },
      { title: "Admit evidence", body: "Candidates are classified for relevance, de-duplicated and cut to a bounded evidence set for the model." },
      { title: "Inspect and follow up", body: "The evidence shown is the material supplied to or considered for an answer, not sentence-level attribution, and the app says so." },
    ],
    decisions: [
      { title: "One loop, on purpose", body: "For 1.0 the product was narrowed to a single loop: open a workspace, index it, ask or find, inspect the evidence, follow up." },
      { title: "An explicit cloud boundary", body: "OpenRouter is optional and has to be enabled explicitly. Before anything leaves, Atlas assembles the complete bounded payload and Secret Shield scans it for known secret formats; a match blocks the request." },
      { title: "Authorisation in the backend", body: "Workspace access is authorised in the Rust backend; requested paths are canonicalised and confined to the workspace root." },
    ],
    stack: [
      { name: "Rust · Tauri 2", why: "Workspace authorisation, the outbound check and the stored API key live in the native backend, not the webview." },
      { name: "React 19 · TypeScript", why: "The desktop interface." },
      { name: "Ollama", why: "Local embeddings and generation, so indexing, evidence and answers can stay on the machine." },
      { name: "BM25 + semantic, fused with RRF", why: "Lexical matching keeps identifiers that semantic search alone can miss." },
      { name: "OpenRouter (opt-in)", why: "Cloud generation only when explicitly enabled, behind Secret Shield." },
    ],
    limits: [
      "Windows x64 only. The installer is unsigned, so SmartScreen shows an Unknown Publisher warning; the release publishes a SHA-256 checksum.",
      "The updater is disabled. Linux is configured but unverified, and macOS is unsupported.",
      "PDF and generic-file chunking is basic, relevance calibration is heuristic and context budgeting is approximate.",
      "Secret Shield matches known patterns. It is a safety net for the cloud path, not a guarantee.",
    ],
    links: [
      { label: "Source on GitHub", href: "https://github.com/Rifaque/atlas", kind: "source" },
      { label: "v1.0.3 release", href: "https://github.com/Rifaque/atlas/releases/tag/v1.0.3", kind: "release" },
      { label: "atlas.rsxdevelops.dev", href: "https://atlas.rsxdevelops.dev", kind: "site" },
    ],
    media: [
      {
        kind: "screenshot",
        src: atlasAsk,
        srcSet: `${atlasAskSmall} 751w, ${atlasAsk} 1502w`,
        width: 1502,
        height: 1038,
        alt: "Atlas 1.0 Ask view: a question about workspace authorisation, a grounded answer with an 'Evidence considered 8' control, and a Sources panel listing retrieved files with line ranges.",
        caption: "Atlas 1.0, Ask view with the evidence panel. Local folder path masked.",
      },
      {
        kind: "illustration",
        id: "atlas",
        label: "Illustration of the Atlas retrieval pipeline: semantic and BM25 candidates converge through reciprocal-rank fusion into a relevance check, which either selects bounded evidence for an answer or declines for lack of evidence. An optional cloud path passes through Secret Shield.",
        caption: "The retrieval pipeline, from question to bounded evidence, or to a decline.",
      },
    ],
    caseStudy: [
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
        heading: "Ask and Find admit evidence differently",
        body: [
          "Ask is conservative and can decline when workspace evidence is insufficient. Find can return bounded literal matches from the workspace even when Ask would not treat them as evidence, and semantic-only matches cannot trigger Find's literal fallback.",
          "The 1.0.3 hardening tightened what counts as evidence: absolute path segments of the workspace root no longer count, BM25 works on workspace-relative paths, and symbol matching uses tokens and structure rather than raw substrings.",
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
    ],
    seo: {
      title: "Atlas: local-first workspace intelligence",
      description:
        "Atlas 1.0.3 is a released, MIT-licensed Windows desktop app that indexes a codebase or document set and answers with inspectable evidence, using BM25 and semantic retrieval fused with RRF.",
    },
  },

  // ----------------------------------------------------------------- REFLUX
  {
    slug: "reflux",
    title: "Reflux",
    kicker: "Local-first media client",
    status: "In development · source-available, not open source",
    stage: "in-development",
    licence: "Proprietary",
    licenceNote:
      "Proprietary, all rights reserved. The source is publicly visible so the work can be seen, but that grants no permission to redistribute, modify or reuse it. Third-party components keep their own licences.",
    period: "Oct 2026 – present",
    ownership: { kind: "personal", label: "Personal project · RSX Develops" },
    role: "Personal project",
    question: "What if a film were one thing, no matter how many files it lives in?",
    summary:
      "A Kotlin Multiplatform media client in which a work is distinct from the versions and sources that provide it. Watch and resume state belong to the work, so playback continues from any copy: a local folder, a Jellyfin server or a network share.",
    problem: [
      "Most players treat a file as the thing you watch. Reflux treats the film or show as the thing, and files as versions of it that sources happen to provide.",
      "A 1080p copy on a laptop, a 4K copy on a Jellyfin server and an extended edition on a network share are three versions of one work. Watch and resume state belong to the work, so you can stop on one copy and continue on another.",
    ],
    how: [
      { title: "Sources", body: "Local folders, Jellyfin servers and network shares provide files. Library state lives in the platform's data directory and never in your media folders." },
      { title: "Identification", body: "Titles are read from ordinary filenames; embedded {tmdb-…}, IMDb and Plex edition tags are honoured." },
      { title: "One work", body: "Editions and qualities of one work become versions of a single item, and watch state attaches to the work." },
      { title: "Playback", body: "One engine picks the best available version for the device: Media3 on Android and libmpv on desktop." },
    ],
    decisions: [
      { title: "Organisation is virtual", body: "Reflux never renames, moves or modifies the user's files." },
      { title: "Refuse to guess", body: "A metadata match is accepted only when it is strong and clearly ahead of the runner-up. Two films of the same name stay separate rather than being merged into the wrong work; anything uncertain goes to an Identify flow." },
      { title: "One engine, every form factor", body: "Input adapts to touch, mouse and keyboard, game controllers and TV remotes, on top of one shared engine." },
    ],
    stack: [
      { name: "Kotlin Multiplatform", why: "One shared media core across Windows, Linux, Android and Android TV." },
      { name: "Compose", why: "The interface on each form factor." },
      { name: "Media3 · libmpv", why: "Native playback engines for Android and desktop." },
      { name: "Jellyfin · TMDB", why: "A remote source, and the metadata used for identification." },
    ],
    limits: [
      "Pre-release; nothing has been published.",
      "At the latest recorded checkpoint, builds were checked on Windows and Linux desktops, a Google TV emulator, and a Xiaomi Pad 7 tablet. Physical phone testing has not been completed. That is not broad device compatibility.",
      "Accessibility is partial: contrast and system text size are tested, while screen-reader labels on every control, focus order, reduced motion and a TalkBack / Narrator pass are not done yet.",
      "Source-specific library browsing and an adaptive navigation layout are planned, not built.",
    ],
    links: [],
    linksNote: "No public release yet. A project website is planned closer to v1.",
    media: [
      {
        kind: "illustration",
        id: "reflux",
        label: "Illustration of the Reflux media model: three sources provide several file versions, identification resolves them into one work, and watch state and best-version playback attach to that work rather than to a file.",
        caption: "Works, versions and sources. Watch state attaches to the work.",
      },
    ],
    caseStudy: [
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
          "Player controls are composed per device from the form factor, the input type, the device's capabilities, fullscreen state and the available space, so phone, TV and desktop layouts differ while keeping one product language. The visual rule is short: let media be colourful; let the interface be calm.",
        ],
      },
      {
        heading: "Status",
        body: [
          "Pre-release; nothing has been published. The engine and one experience layer run on Windows, Linux, Android phones and tablets, and Android TV / Google TV. Offline downloads for episodes and seasons, manual identification and episode-version pinning are implemented; source-specific library browsing, an adaptive navigation layout and a full accessibility pass are planned next.",
        ],
      },
    ],
    seo: {
      title: "Reflux: local-first media client",
      description:
        "Reflux is an in-development, proprietary Kotlin Multiplatform media client that treats a film or show as one work across many files and sources, with watch state that follows the work.",
    },
  },

  // ------------------------------------------------------------ EXTENDSPACE
  {
    slug: "extendspace",
    title: "ExtendSpace",
    kicker: "Windows to Android second screen",
    status: "In development · Connect still disabled",
    stage: "in-development",
    licence: "MIT",
    period: "Oct 2026 – present",
    ownership: { kind: "personal", label: "Personal project · RSX Develops" },
    role: "Personal project",
    question: "Can a tablet on a USB cable become a dependable second screen for Windows?",
    summary:
      "A Windows host and an Android companion that stream the desktop to a tablet. The production session path has streamed a live 1080p60 picture over USB to one tablet, driven by gated acceptance tests. Ordinary use is not possible yet: Connect is still disabled.",
    problem: [
      "ExtendSpace turns an Android tablet into a second display for Windows: mirroring first, and true extension later, which needs a virtual display driver on Windows.",
      "The work so far is the streaming pipeline and the session machinery around it.",
    ],
    how: [
      { title: "Capture and encode", body: "Display capture and hardware H.264 encoding on Windows, behind a production session owner." },
      { title: "Transport", body: "A draft wire protocol, implemented on both sides, over a USB transport with reconnection." },
      { title: "Decode", body: "Decoders are created on a dedicated owner thread, never on the reader thread; a creation is used only if it still matches the stream that is wanted." },
      { title: "Recover", body: "Frames that arrive meanwhile wait in order, within limits; beyond that the stream skips to the next keyframe. The USB link recovers from a pulled cable with video still flowing afterwards." },
    ],
    decisions: [
      { title: "Explicit session owners", body: "Each side has a session owner with a tested state model. Teardown runs against an absolute deadline, and an orderly disconnect is distinguished from a fault." },
      { title: "Bounded waiting", body: "Decoder start-up never lets frames pile up without limit: past a bound, the stream skips to the next keyframe instead." },
      { title: "Evidence before claims", body: "Test runs are reported with their setup, one PC and one tablet, and are not presented as broad device validation." },
    ],
    stack: [
      { name: "C# / .NET 10 · WinUI 3", why: "The Windows host: capture, hardware encoding and the session owner." },
      { name: "H.264 (hardware) · MediaCodec", why: "Encoding on Windows and decoding on Android." },
      { name: "Kotlin · Jetpack Compose", why: "The Android companion: link, decoder ownership and surface handling." },
      { name: "USB transport", why: "ADB forwarding to the companion over USB, with reconnection. There is no wireless path yet." },
    ],
    limits: [
      "Connect is disabled in both apps, and each says so in its own interface.",
      "Wi-Fi transport and pairing are not implemented. Input forwarding does not exist yet.",
      "The virtual display driver for Extend mode is not implemented; only its feasibility has been researched.",
      "Tested on one PC and one tablet only. One fault is open: Windows occasionally stops delivering captured frames while a browser plays video full screen, and nothing detects it yet.",
    ],
    links: [],
    linksNote: "No public build or demo yet.",
    media: [
      {
        kind: "illustration",
        id: "extendspace",
        label: "Illustration of the ExtendSpace stream: the Windows desktop is captured and hardware-encoded, carried over USB by a session-owned link, and decoded on the tablet by a dedicated decoder owner, with recovery that skips to the next keyframe.",
        caption: "The stream, from Windows capture to the tablet's surface.",
      },
    ],
    caseStudy: [
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
        heading: "Session engineering",
        body: [
          "Most of the work is in what happens around the video: start-up, teardown and faults. Mandatory cleanup cannot be cancelled, teardown has an absolute deadline, and a new session does not start while a previous decoder operation is still outstanding. A request for a keyframe stays open until one actually reaches the connection.",
          "When a keyframe arrives while the decoder's input queue is full, it replaces the queued pictures, so recovery does not wait behind frames that can no longer be shown. That behaviour is covered by unit tests; it has not yet been demonstrated on hardware.",
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
    seo: {
      title: "ExtendSpace: Windows to Android second screen",
      description:
        "ExtendSpace is an in-development Windows-to-Android second-screen project: capture, hardware encoding and USB streaming to a tablet, tested on one device, with Connect still disabled.",
    },
  },

  // ----------------------------------------------------------------- LAYERS
  {
    slug: "layers-by-rsx",
    title: "Layers by RSX",
    kicker: "Android widget platform",
    status: "In development · paused",
    stage: "in-development",
    period: "Oct 2026 – present",
    ownership: { kind: "personal", label: "Personal project · RSX Develops" },
    role: "Personal project",
    summary:
      "A customisable Android widget platform built around a portable widget definition: one shared runtime renders every widget, with a generic editor, a theme system and curated presets. Ten first-party widget families are implemented. Development is paused and nothing has been released.",
    problem: [
      "Layers separates what a widget is from how it is drawn. A widget is a portable definition; one runtime renders every widget at its real size, with per-instance customisation and themes.",
      "The same runtime handles first-party widgets and imported ones, so an imported widget gets the same validation, sizing and theming as a built-in one.",
    ],
    how: [
      { title: "Definition", body: "A widget starts as a definition that is parsed within bounds and validated against a schema and its semantics." },
      { title: "Resolution", body: "Theme defaults, then per-instance overrides, then the widget's actual dimensions, with an explicit order of precedence." },
      { title: "Capabilities", body: "Inputs are typed and bound to allowlisted capabilities on the host; imported actions are isolated." },
      { title: "Rendering", body: "The resolved widget is rendered directly to RemoteViews, the home screen's widget surface." },
    ],
    decisions: [
      { title: "No arbitrary code", body: "Widgets cannot carry arbitrary Kotlin, Java, JavaScript or Python, and arbitrary imported intents are not supported." },
      { title: "Honest translucency", body: "Glass-like styles use tint and translucency; Layers does not claim a live launcher blur it cannot produce." },
      { title: "A bounded package format", body: "The .layers package is validated on import, with asset budgets and path-traversal defences. It is internal and provisional, not a public standard." },
    ],
    stack: [
      { name: "Kotlin", why: "The shared widget runtime and the app." },
      { name: "Jetpack Compose", why: "The app and editor interface." },
      { name: "RemoteViews", why: "The rendering target for home-screen widgets." },
    ],
    limits: [
      "No public release. V1 is in development, and work is currently paused.",
      "Ten first-party widget families are implemented: Clock, Battery, Music, Calendar, Countdown, Shortcuts, Device, Notes, Photos and Weather.",
      "Weather's data provider is licensed for non-commercial use only, which remains a release condition.",
      "The .layers package format is internal and provisional.",
      "Automated testing has run on the Android emulator. Physical devices, other launchers and OEMs, and spoken TalkBack have not been verified.",
    ],
    links: [],
    linksNote: "No public release yet. The repository is private.",
    media: [
      {
        kind: "illustration",
        id: "layers",
        label: "Illustration of Layers: one portable widget definition is validated and resolved by a shared runtime, then rendered as widgets of different sizes.",
        caption: "One definition, one runtime, many sizes.",
      },
    ],
    caseStudy: [
      {
        heading: "One runtime for every widget",
        body: [
          "Every widget, first-party or imported, takes the same path: a bounded parse, schema and semantic validation, normalisation, theme and default resolution, per-instance overrides, responsive dimensions, typed inputs and capability binding, and finally a direct RemoteViews renderer.",
          "Compose is used for the app and its editor; it is not the widget runtime.",
        ],
      },
      {
        heading: "Customisation that stays predictable",
        body: [
          "Sizing works from the widget's actual dimensions, with global and per-dimension overrides, explicit precedence and scoped reset, so a change in one place does not silently overwrite another.",
          "Themes are built from semantic tokens, with first-party directions, curated presets and colour controls. Contrast warnings appear in the editor.",
        ],
      },
      {
        heading: "Safety boundaries",
        list: [
          "No arbitrary Kotlin, Java, JavaScript or Python widget code.",
          "No arbitrary imported intents; shortcuts and device actions go through allowlisted host actions with typed capabilities.",
          "The .layers import path validates packages, hashes assets, enforces budgets and defends against path traversal.",
        ],
      },
      {
        heading: "Not in V1",
        body: [
          "A visual component builder, multi-page widgets, a web studio, a marketplace, accounts and cloud sync, and AI widget generation are deliberately deferred.",
        ],
      },
    ],
    seo: {
      title: "Layers by RSX: Android widget platform",
      description:
        "Layers by RSX is an in-development Android widget platform, currently paused: portable widget definitions rendered by one shared runtime, with an editor, themes and presets. V1 is not yet released.",
    },
  },

  // ---------------------------------------------------------------- BLUETAP
  {
    slug: "bluetap",
    title: "BlueTap",
    kicker: "Android Bluetooth widgets",
    status: "In development · paused",
    stage: "in-development",
    licence: "MIT",
    period: "Sep 2026 – present",
    ownership: { kind: "personal", label: "Personal project · RSX Develops" },
    role: "Personal project",
    summary:
      "Home-screen widgets for already-paired Bluetooth devices. Device assignment, per-widget appearance and responsive widget layouts work. Development is paused with the pre-Android-17 foundation complete. Tapping a widget to connect or disconnect is the goal, and it is not implemented yet.",
    problem: [
      "The longer-term aim is one-tap Bluetooth control from the home screen: a widget per paired device. The foundation for that, which covers devices, widgets, appearance and persistence, is built. The connection itself is not.",
    ],
    how: [
      { title: "Devices", body: "The already-paired device list from Android is the source of truth, de-duplicated by address, with a friendly name, alias or address shown in that order." },
      { title: "Widgets", body: "Each widget is assigned one device and its own appearance, saved together." },
      { title: "Layouts", body: "Exact-size responsive layouts from a small tile to a wide showcase, aware of the system font scale." },
      { title: "Artwork", body: "Optional per-device artwork, stored privately and shared across that device's widgets." },
    ],
    decisions: [
      { title: "Public SDK only", body: "No hidden APIs, reflection, root or accessibility services. Connect and disconnect wait for Android 17's public APIs, to be verified on a real device first." },
      { title: "Minimal permissions", body: "Only the Bluetooth-connect permission: no location, no scanning, no network, no analytics." },
      { title: "Careful persistence", body: "Widget settings survive launcher restores and are cleaned up when a widget is removed, without deleting artwork another widget still uses." },
    ],
    stack: [
      { name: "Kotlin", why: "The app and its device layer." },
      { name: "Jetpack Glance", why: "The home-screen widgets." },
      { name: "Android", why: "Bonded-device access through the public Bluetooth APIs." },
    ],
    limits: [
      "Connect and disconnect, live connection state and generic battery reporting are not implemented; they wait on Android 17's public APIs, to be verified on a real device first.",
      "Tapping a widget currently opens its editor.",
      "Pre-release: there is no published build.",
    ],
    links: [{ label: "Source on GitHub", href: "https://github.com/Rifaque/blue-tap", kind: "source" }],
    media: [
      {
        kind: "illustration",
        id: "bluetap",
        label: "Illustration of BlueTap: a home-screen widget is assigned to an already-paired Bluetooth device. Assigning and customising works; connecting or disconnecting from the widget is not implemented.",
        caption: "Assigning and customising work. Tap to connect does not yet.",
      },
    ],
    caseStudy: [
      {
        heading: "What works",
        list: [
          "Device assignment from the already-paired list, de-duplicated by address.",
          "Per-widget appearance with a set of presets, independent configuration and previews.",
          "Responsive exact-size layouts, including a two-by-two layout, aware of the system font scale.",
          "Per-device custom artwork, kept in private storage and shared across that device's widgets.",
        ],
      },
      {
        heading: "Why it stops where it does",
        body: [
          "Connecting and disconnecting a device from a widget needs APIs that the public Android SDK does not offer before Android 17. BlueTap waits for them rather than reaching for hidden APIs, reflection, root or accessibility services, and the work will be verified on a real device before it ships.",
          "The app currently targets API 36. Validating Android 17's public Bluetooth APIs on a real device is the next development phase.",
        ],
      },
      {
        heading: "Privacy",
        body: [
          "BlueTap asks only for the Bluetooth-connect permission. It does not request location, does not scan, has no network access or analytics, and keeps its settings and artwork out of cloud backup.",
        ],
      },
    ],
    seo: {
      title: "BlueTap: Android Bluetooth widgets",
      description:
        "BlueTap is an MIT-licensed set of Android home-screen widgets for paired Bluetooth devices, in development and currently paused. The pre-Android-17 foundation is complete; tap-to-connect is not implemented yet.",
    },
  },

  // ------------------------------------------------------------- QUERYCRAFT
  {
    slug: "querycraft",
    title: "QueryCraft",
    kicker: "Final-year project · HubZero Build",
    status: "Final-year project · retired",
    stage: "retired",
    period: "Aug 2025 – Jan 2026",
    ownership: {
      kind: "hubzero",
      label: "Three-person final-year project · HubZero Build",
      credit: "Built by a team of three for our final-year engineering project, and later kept as a HubZero Build. I was the primary technical contributor, and I was responsible for the later HubZero version, a separate codebase.",
    },
    role: "Primary technical contributor, three-person team; responsible for the later HubZero version",
    summary:
      "A natural-language database querying app: plain English in, SQL or NoSQL queries out, generated by locally hosted Qwen and Mistral models through Ollama.",
    problem: [
      "Getting a model to emit something that looks like SQL is easy. A model will also produce queries that are syntactically valid but wrong or unsafe, and unlike a chat reply, a query has consequences when it runs.",
    ],
    how: [
      { title: "Ask", body: "A question in plain English, in a conversational interface." },
      { title: "Generate", body: "A locally hosted Qwen or Mistral model, served through Ollama, proposes an SQL or NoSQL query." },
      { title: "Explain", body: "The query comes back in a card with an explanation. Nothing runs yet." },
      { title: "Validate and run", body: "Only when the user chooses to execute, a validation step checks the query and blocks destructive statements." },
    ],
    decisions: [
      { title: "Generation is a proposal", body: "Each query came back with an explanation, and nothing ran until the user chose to execute it." },
      { title: "Local inference by choice", body: "Generation ran on open models through Ollama on hardware we controlled, rather than through a hosted API." },
      { title: "Honest about the safeguards", body: "The validation matched patterns in the client rather than parsing queries, and connections were not read-only. That is a prototype's level of protection." },
    ],
    stack: [
      { name: "Next.js", why: "The web application and its conversational interface." },
      { name: "Node.js · Express · Python", why: "The project's server side." },
      { name: "MongoDB", why: "The project's own database." },
      { name: "Ollama (Qwen, Mistral)", why: "Self-hosted inference instead of a hosted API." },
    ],
    limits: [
      "The safeguards were prototype-grade: pattern-based checks in the client, not parsing, and connections were not read-only.",
      "Retired. There is no live deployment.",
      "This page describes the original project, which began in August 2025. The later HubZero version is a separate codebase: I revisited the idea with an updated UI and was responsible for its development and reworking. It is also retired.",
    ],
    links: [
      { label: "Original repository", href: "https://github.com/Rifaque/querycraft", kind: "source" },
      { label: "Original frontend", href: "https://github.com/Rifaque/querycraft-frontend", kind: "source" },
      { label: "Original backend", href: "https://github.com/Rifaque/querycraft-backend", kind: "source" },
      { label: "Original LLM setup", href: "https://github.com/Rifaque/querycraft-llm", kind: "source" },
      { label: "Later HubZero version", href: "https://github.com/HubZeroHQ/querycraft", kind: "source" },
    ],
    media: [
      {
        kind: "illustration",
        id: "querycraft",
        label: "Illustration of the QueryCraft flow: a plain-English question becomes a proposed query from a local model, shown with an explanation; only when the user chooses to execute does a validation step run before the database is reached.",
        caption: "Generation is a proposal; nothing runs until the user chooses.",
      },
    ],
    caseStudy: [
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
        ],
      },
    ],
    seo: {
      title: "QueryCraft: final-year project, HubZero Build",
      description:
        "QueryCraft: a three-person final-year project turning natural language into SQL and NoSQL queries with local Qwen and Mistral models, with validation before execution. Primary technical contributor: Rifaque Akrami.",
    },
  },

  // ------------------------------------------------------ BHATKAL TIME LUXE
  {
    slug: "bhatkal-time-luxe",
    title: "Bhatkal Time Luxe",
    kicker: "Client project · HubZero",
    status: "Delivered · HubZero's first paid client project",
    stage: "delivered",
    period: "Apr – Sep 2025",
    ownership: {
      kind: "hubzero",
      label: "HubZero client project",
      credit: "A HubZero client project. I designed and developed the redesigned Bhatkal Time Luxe storefront end to end, building upon the initial UI/UX foundation established by the co-founder. It is not an RSX Develops product.",
    },
    role: "Storefront redesign, architecture, frontend and full-stack implementation, database and infrastructure, end to end through HubZero",
    summary:
      "A watch-commerce storefront for a Bhatkal-based retailer, with an India-wide market focus, and HubZero's first paid client project. I redesigned it and built the redesigned storefront end to end on a co-founder's initial UI/UX foundation; it remains live as a showcase, not an active storefront.",
    problem: [
      "The retailer sold online only, showing stock on Instagram and handling orders over WhatsApp. The storefront handles discovery, presentation and building a cart, then hands the order to WhatsApp, where the business already knew how to sell, rather than replacing that with a payment gateway.",
    ],
    how: [
      { title: "Storefront", body: "A Next.js App Router storefront deployed on Vercel, with brand and collection browsing and filtering." },
      { title: "API and data", body: "A separate Node.js API, backed by MongoDB." },
      { title: "Images", body: "Product images delivered through Cloudinary, with imgix in front." },
      { title: "Search engines", body: "Server-rendered pages with JSON-LD and a sitemap, so the catalogue is crawlable." },
    ],
    decisions: [
      { title: "WhatsApp order checkout", body: "Checkout opens WhatsApp with a generated order message for the customer to send, matching how the business already sold." },
      { title: "Server-rendered catalogue", body: "Pages are rendered on the server with structured data, so the catalogue can be indexed." },
      { title: "Clear ownership", body: "This is client work delivered by HubZero; the code belongs to the client project and is not presented as a personal open-source project." },
    ],
    stack: [
      { name: "Next.js · TypeScript · Tailwind CSS", why: "The storefront." },
      { name: "Node.js · MongoDB", why: "The project's separate API and data model." },
      { name: "Cloudinary · imgix", why: "The project's image pipeline." },
      { name: "Vercel", why: "Hosting for the storefront." },
    ],
    limits: [
      "The first website was built in April 2025, the redesigned storefront was delivered in August 2025, and the partnership ended in September 2025. The website remains live as a HubZero showcase, not an active storefront.",
      "Client work: the code belongs to the client project and is not presented here as a personal open-source project.",
      "GCC and Kuwait support, shown here through KWD, came in June–July 2026 as a demo for a prospective client, not a feature delivered to the original seller.",
      "No traffic, sales or performance figures are published here.",
    ],
    links: [{ label: "Live site", href: "https://btl.hubzero.in", kind: "live" }],
    media: [
      {
        kind: "screenshot",
        src: btlLiveHome,
        width: 1440,
        height: 900,
        alt: "Bhatkal Time Luxe home page on desktop: the headline 'Timeless Design. Modern Presence.', Explore Collection and Watch Houses buttons, and a featured watch priced in rupees.",
        caption: "The live site, captured on 26 Oct 2026 with its currency set to INR. A showcase, not an active storefront.",
      },
      {
        kind: "screenshot",
        src: btlLiveArrivals,
        width: 1440,
        height: 900,
        alt: "Bhatkal Time Luxe New Arrivals catalogue on desktop: a grid of watch cards with discount badges, prices in rupees and Add buttons.",
        caption: "New Arrivals on the live site, captured on 26 Oct 2026, currency set to INR.",
      },
    ],
    caseStudy: [
      {
        heading: "Who did what",
        body: [
          "This was a HubZero engagement. A co-founder, a UI/UX designer, established the initial mobile-only UI foundation. I substantially redesigned the interface, including the desktop experience, and built the redesigned storefront end to end on that foundation: the architecture, the frontend and full-stack implementation, the database and the infrastructure.",
        ],
      },
      {
        heading: "What the project includes",
        list: [
          "A Next.js App Router storefront, deployed on Vercel.",
          "A separate Node.js API backed by MongoDB.",
          "An image pipeline through Cloudinary with imgix in front for delivery.",
          "Server-rendered pages with JSON-LD and a sitemap, so the catalogue is crawlable.",
          "A WhatsApp-based order checkout with a generated, prefilled order message.",
        ],
      },
      {
        heading: "Why it is here",
        body: [
          "It was HubZero's first paid client project, built to another business's constraints rather than my own.",
        ],
      },
    ],
    seo: {
      title: "Bhatkal Time Luxe: client project, HubZero",
      description:
        "Bhatkal Time Luxe: a watch-commerce storefront for a Bhatkal-based retailer and HubZero's first paid client project, redesigned and built end to end by Rifaque Akrami. Now a live showcase.",
    },
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

/** The homepage ribbon, in order. */
export const featuredSlugs = ["nexus", "atlas", "reflux", "extendspace"] as const;
/** HubZero work, shown with its attribution. */
export const hubzeroSlugs = ["bhatkal-time-luxe", "querycraft"] as const;
/** Smaller personal builds. */
export const smallerSlugs = ["layers-by-rsx", "bluetap"] as const;

export const pick = (slugs: readonly string[]) =>
  slugs.map((s) => {
    const p = projectBySlug(s);
    if (!p) throw new Error(`Unknown project: ${s}`);
    return p;
  });

export const featured = pick(featuredSlugs);
