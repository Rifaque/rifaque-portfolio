/*
 * Prototype content for the four ribbon projects, plus four compact entries.
 * Every statement is transcribed from knowledge-base/projects/*.md (published
 * copy checked 2026-10-24, owner notes where marked). Nothing here is new
 * fact. Open questions are listed in ../README.md, not resolved here.
 */
(function () {
  const KB = "../../knowledge-base/assets/";

  /* Illustrations: drawn from the diagram specs in the knowledge base.
     Colours come from CSS (currentColor + .il-* classes), so the same
     drawing works on the dark ribbon and the light dossier. */
  const ill = {
    nexus: `
<svg viewBox="0 0 800 500" class="il" aria-hidden="true">
  <g class="il-grid"><path d="M0 125H800M0 250H800M0 375H800M200 0V500M400 0V500M600 0V500"/></g>
  <rect x="420" y="130" width="340" height="290" class="il-box il-box--key"/>
  <text x="436" y="452" class="il-cap il-cap--key">TOOLRUNTIME · THE ONLY PLACE EFFECTS HAPPEN</text>
  <path d="M70 250H190" class="il-edge"/>
  <path d="M240 250C290 250 300 140 340 140" class="il-edge"/>
  <path d="M240 250C290 250 300 360 340 360" class="il-edge il-edge--dash"/>
  <path d="M240 250H460" class="il-edge"/>
  <path d="M340 360C390 360 410 315 460 315" class="il-edge il-edge--dash"/>
  <path d="M460 190V380" class="il-edge il-edge--key"/>
  <circle cx="70" cy="250" r="7" class="il-node"/><text x="70" y="282" class="il-lab" text-anchor="middle">Request</text>
  <circle cx="240" cy="250" r="9" class="il-node"/><text x="240" y="222" class="il-lab" text-anchor="middle">Command Fabric</text>
  <text x="200" y="282" class="il-cap" text-anchor="middle">recognise · route</text>
  <circle cx="340" cy="140" r="7" class="il-node"/><text x="340" y="116" class="il-lab" text-anchor="middle">Deterministic reply</text>
  <circle cx="340" cy="360" r="7" class="il-node"/><text x="340" y="394" class="il-lab" text-anchor="middle">Cortex · fallback</text>
  <text x="272" y="338" class="il-cap" text-anchor="end">declined</text>
  <circle cx="460" cy="190" r="8" class="il-node il-node--key"/><text x="480" y="196" class="il-lab">Capability gate</text>
  <circle cx="460" cy="250" r="8" class="il-node il-node--key"/><text x="480" y="256" class="il-lab">Policy · deny wins</text>
  <circle cx="460" cy="315" r="8" class="il-node il-node--key"/><text x="480" y="321" class="il-lab">Hash-bound approval</text>
  <circle cx="460" cy="380" r="8" class="il-node il-node--key"/><text x="480" y="386" class="il-lab">Effect</text>
</svg>`,
    atlas: `
<svg viewBox="0 0 800 500" class="il" aria-hidden="true">
  <g class="il-grid"><path d="M0 125H800M0 250H800M0 375H800M200 0V500M400 0V500M600 0V500"/></g>
  <path d="M70 250C130 250 130 170 190 170M70 250C130 250 130 330 190 330" class="il-edge"/>
  <path d="M190 170C250 170 250 250 310 250M190 330C250 330 250 250 310 250" class="il-edge"/>
  <path d="M310 250H430" class="il-edge il-edge--key"/>
  <path d="M430 250H560" class="il-edge il-edge--key"/>
  <path d="M430 250C430 330 360 400 300 400" class="il-edge il-edge--dash"/>
  <path d="M560 250H700" class="il-edge il-edge--key"/>
  <path d="M560 250C560 180 600 120 640 120" class="il-edge il-edge--dash"/>
  <circle cx="70" cy="250" r="7" class="il-node"/><text x="70" y="282" class="il-lab" text-anchor="middle">Question</text>
  <circle cx="190" cy="170" r="7" class="il-node"/><text x="190" y="148" class="il-lab" text-anchor="middle">Semantic</text>
  <circle cx="190" cy="330" r="7" class="il-node"/><text x="190" y="364" class="il-lab" text-anchor="middle">BM25</text>
  <circle cx="310" cy="250" r="9" class="il-node il-node--key"/><text x="310" y="222" class="il-lab" text-anchor="middle">RRF</text>
  <circle cx="430" cy="250" r="7" class="il-node"/><text x="430" y="222" class="il-lab" text-anchor="middle">Relevance</text>
  <circle cx="300" cy="400" r="7" class="il-node"/><text x="300" y="434" class="il-lab" text-anchor="middle">No evidence → decline</text>
  <circle cx="560" cy="250" r="7" class="il-node"/><text x="560" y="282" class="il-lab" text-anchor="middle">Bounded evidence</text>
  <circle cx="700" cy="250" r="9" class="il-node il-node--key"/><text x="700" y="222" class="il-lab" text-anchor="middle">Answer</text>
  <circle cx="640" cy="120" r="7" class="il-node"/><text x="656" y="126" class="il-lab">Secret Shield</text>
  <text x="656" y="148" class="il-cap">opt-in cloud path only</text>
</svg>`,
    reflux: `
<svg viewBox="0 0 800 500" class="il" aria-hidden="true">
  <g class="il-grid"><path d="M0 125H800M0 250H800M0 375H800M200 0V500M400 0V500M600 0V500"/></g>
  <path d="M90 130H170M90 250H170M90 370H170" class="il-edge"/>
  <path d="M330 130C380 130 390 250 440 250M330 250H440M330 370C380 370 390 250 440 250" class="il-edge"/>
  <path d="M440 250H580" class="il-edge il-edge--key"/>
  <path d="M580 250C630 250 640 170 700 170" class="il-edge il-edge--key"/>
  <circle cx="90" cy="130" r="7" class="il-node"/><text x="90" y="108" class="il-lab" text-anchor="middle">Local folder</text>
  <circle cx="90" cy="250" r="7" class="il-node"/><text x="90" y="228" class="il-lab" text-anchor="middle">Jellyfin</text>
  <circle cx="90" cy="370" r="7" class="il-node"/><text x="90" y="348" class="il-lab" text-anchor="middle">Network share</text>
  <rect x="170" y="114" width="160" height="32" class="il-box"/><text x="250" y="135" class="il-mono" text-anchor="middle">Film (2021) 1080p</text>
  <rect x="170" y="234" width="160" height="32" class="il-box"/><text x="250" y="255" class="il-mono" text-anchor="middle">Film (2021) 2160p</text>
  <rect x="170" y="354" width="160" height="32" class="il-box"/><text x="250" y="375" class="il-mono" text-anchor="middle">{edition-Extended}</text>
  <circle cx="440" cy="250" r="8" class="il-node"/><text x="440" y="222" class="il-lab" text-anchor="middle">Identification</text>
  <circle cx="580" cy="250" r="11" class="il-node il-node--key"/><text x="580" y="222" class="il-lab" text-anchor="middle">One work</text>
  <text x="580" y="284" class="il-cap il-cap--key" text-anchor="middle">watch state lives here</text>
  <circle cx="700" cy="170" r="8" class="il-node"/><text x="700" y="148" class="il-lab" text-anchor="middle">Best version</text>
  <text x="700" y="200" class="il-cap" text-anchor="middle">Media3 · libmpv</text>
</svg>`,
    extendspace: `
<svg viewBox="0 0 800 500" class="il" aria-hidden="true">
  <g class="il-grid"><path d="M0 125H800M0 250H800M0 375H800M200 0V500M400 0V500M600 0V500"/></g>
  <rect x="40" y="150" width="320" height="200" class="il-box"/><text x="56" y="176" class="il-cap">WINDOWS HOST · WINUI 3</text>
  <rect x="470" y="150" width="290" height="200" class="il-box"/><text x="486" y="176" class="il-cap">ANDROID CLIENT · COMPOSE</text>
  <path d="M80 270H320" class="il-edge"/>
  <path d="M320 270H510" class="il-edge il-edge--key"/>
  <path d="M510 270H720" class="il-edge"/>
  <circle cx="80" cy="270" r="7" class="il-node"/><text x="80" y="304" class="il-lab" text-anchor="middle">Desktop</text>
  <circle cx="170" cy="270" r="7" class="il-node"/><text x="170" y="242" class="il-lab" text-anchor="middle">Capture</text>
  <circle cx="270" cy="270" r="7" class="il-node"/><text x="270" y="304" class="il-lab" text-anchor="middle">H.264 (hw)</text>
  <circle cx="415" cy="270" r="10" class="il-node il-node--key"/><text x="415" y="242" class="il-lab" text-anchor="middle">USB</text>
  <circle cx="540" cy="270" r="9" class="il-node il-node--key"/><text x="540" y="304" class="il-lab" text-anchor="middle">Decoder owner</text>
  <circle cx="640" cy="270" r="7" class="il-node"/><text x="640" y="242" class="il-lab" text-anchor="middle">Surface</text>
  <circle cx="720" cy="270" r="7" class="il-node"/><text x="720" y="304" class="il-lab" text-anchor="middle">Tablet</text>
  <text x="415" y="410" class="il-cap il-cap--key" text-anchor="middle">pulled cable → reconnect → next keyframe</text>
  <path d="M415 282V392" class="il-edge il-edge--dash"/>
</svg>`,
  };

  const projects = [
    {
      slug: "nexus",
      title: "Nexus",
      kicker: "Personal AI operating layer",
      status: "Private alpha · active development",
      stage: "private-alpha",
      licence: "Proprietary",
      period: "Jun 2026 – present",
      ownership: "Personal project · RSX Develops",
      role: "Sole author: architecture, governance model, runtime, voice and desktop Surface.",
      question: "How can a personal AI stay useful without capability quietly becoming authority?",
      summary:
        "A local-first, voice-first layer for one owner on one Windows machine. Deterministic recognition handles what it can without a model, a reasoning step is reached only when it declines, and every effect passes through a single governed tool runtime.",
      why: [
        "Most assistants become more useful by being allowed to do more. Nexus tries to keep those two things apart: an assistant that can hold a great deal of context about its owner and their work, while what it may actually change on the machine stays narrow, explicit and auditable.",
        "Persistence is not a storage problem. Once an assistant remembers, a wrong belief becomes durable; once it can act, a wrong action becomes destructive rather than merely unhelpful.",
      ],
      how: [
        ["Command Fabric", "Deterministic, model-less recognition. “Set a timer for ten minutes” becomes a typed intent with typed slots, or is marked ambiguous or unsupported. It recognises and routes; it cannot execute anything."],
        ["Response engine", "Deterministic wording for structured outcomes, with no model call."],
        ["Interactive Cortex", "Reached only when the deterministic layers decline. One bounded decision: answer, pick one governed capability from a closed set, ask a question, or delegate."],
        ["ToolRuntime", "The only place an effect happens: a capability gate, then a policy engine in which one deny beats any number of allows. The executor computes the effect itself; the model's description of it is never trusted."],
      ],
      decisions: [
        ["Approval that cannot drift", "A consequential call needs owner confirmation bound to a hash of the computed effect. If the effect changes after approval, the approval is void. Mutations are checkpointed in a shadow Git repository and every call lands in an append-only, hash-chained ledger."],
        ["The defaults refuse", "The standard policy stack is read-only, so every call at or above “mutate” is denied before confirmation is reached. System Control registers no tool unless configured, and there is no shell, PowerShell or run-command tool."],
        ["Structure over instructions", "Filesystem tools cannot accept a raw path string; they receive a confined path only the path jail can construct. That is stronger than trusting every future call site to remember to validate."],
      ],
      stack: [
        ["Python 3.13 · uv workspace", "A multi-package workspace with protocol boundaries, so the safety-critical runtime stays isolated."],
        ["FastAPI", "The service layer; the API package owns the database models."],
        ["PostgreSQL + pgvector", "Memory with versioning, confidence, decay and provenance, searchable semantically and by keyword."],
        ["pywebview / WebView2", "One frameless, always-on-top Surface window that changes shape with what Nexus is doing."],
        ["faster-whisper", "Push-to-talk speech-to-text that runs locally. No wake word, no background listening."],
        ["Anthropic Claude · Ollama", "Provider neutrality between a hosted model and local models."],
      ],
      limits: [
        "Private alpha: Windows only, single owner, unreleased, with no public demo or source.",
        "The newest tag, v1.3.0-alpha.1, predates the desktop shell and voice. Those exist on working branches and have not been tagged or released.",
        "Spoken acceptance of the voice endpoint on the owner's machine is paused, and the decision record is still proposed.",
        "How the Surface looks by eye, behaviour during a real game, and the real System Control adapter have not been accepted yet.",
      ],
      links: [],
      noLinks: "No public source or demo. The repository is private.",
      media: { kind: "illustration", svg: ill.nexus, label: "The Nexus request path: every effect, from either route, must pass the capability gate, policy and hash-bound approval inside ToolRuntime." },
    },
    {
      slug: "atlas",
      title: "Atlas",
      kicker: "Local-first workspace intelligence",
      status: "v1.0.3 released · not in active development",
      stage: "released",
      licence: "MIT",
      period: "Feb – Sep 2026",
      ownership: "Personal project · RSX Develops",
      role: "Sole author: Rust backend, retrieval pipeline, desktop interface and Windows release.",
      question: "Can an assistant answer from your workspace, and say so when it can't?",
      summary:
        "A Rust and Tauri 2 desktop app that indexes one codebase or document set and answers with inspectable evidence. Questions without enough workspace evidence can be declined instead of answered from general model knowledge.",
      why: [
        "A model can answer fluently about code it was never shown. Atlas narrows the job: index one workspace locally, retrieve well, and show the material an answer was built from.",
      ],
      how: [
        ["Open and index", "Workspace files are chunked and embedded locally through Ollama. Indexing is incremental, and a damaged generated index can be detected and rebuilt without touching the source files."],
        ["Retrieve", "A question gathers semantic candidates and BM25 candidates and fuses them with reciprocal-rank fusion."],
        ["Admit evidence", "Candidates are classified for relevance, de-duplicated and cut to a bounded evidence set for the model."],
        ["Inspect", "The evidence shown is the material supplied to or considered for an answer, not sentence-level attribution, and the app says so."],
      ],
      decisions: [
        ["One loop, on purpose", "For 1.0 the product was narrowed to a single loop: open a workspace, index it, ask or find, inspect the evidence, follow up. Agents, arbitrary shell execution, personas, graph surfaces, web search and vision attachments are not part of 1.0."],
        ["An explicit cloud boundary", "OpenRouter is optional and must be enabled per request. Before anything leaves, Atlas assembles the complete bounded payload and Secret Shield scans it for known secret formats; a match blocks the request. The key is held by the Rust side in the operating system's credential store."],
        ["Authorisation in the backend", "Workspace access is authorised in the Rust backend; requested paths are canonicalised and confined to the workspace root."],
      ],
      stack: [
        ["Rust · Tauri 2", "Workspace authorisation, outbound checks and secrets live in the native backend, not the webview."],
        ["React 19 · TypeScript", "The desktop interface."],
        ["Ollama", "Local embeddings and generation, so indexing and answers can stay on the machine."],
        ["BM25 + semantic, fused with RRF", "Lexical matching keeps identifiers that semantic search alone can miss."],
        ["OpenRouter (opt-in)", "Cloud generation only when explicitly enabled, behind Secret Shield."],
      ],
      limits: [
        "Windows x64 only. The installer is unsigned, so SmartScreen shows an Unknown Publisher warning; the release publishes a SHA-256 checksum.",
        "The updater is disabled. Linux is configured but unverified, and macOS is unsupported.",
        "PDF and generic-file chunking is basic, relevance calibration is heuristic and context budgeting is approximate.",
        "Secret Shield matches known patterns. It is a safety net for the cloud path, not a guarantee.",
      ],
      links: [
        ["Source on GitHub", "https://github.com/Rifaque/atlas"],
        ["v1.0.3 release", "https://github.com/Rifaque/atlas/releases/tag/v1.0.3"],
        ["atlas.rsxdevelops.dev", "https://atlas.rsxdevelops.dev"],
      ],
      media: {
        kind: "screenshot",
        src: KB + "atlas/atlas-1.0-ask.webp",
        srcset: KB + "atlas/atlas-1.0-ask-751.webp 751w, " + KB + "atlas/atlas-1.0-ask.webp 1502w",
        width: 1502,
        height: 1038,
        alt: "Atlas 1.0 Ask view: a question about workspace authorisation, a grounded answer with an 'Evidence considered 8' control, and a Sources panel listing retrieved files with line ranges.",
        caption: "Atlas 1.0, Ask view with the evidence panel. Local folder path masked.",
      },
      diagram: { svg: ill.atlas, label: "The Atlas retrieval pipeline: semantic and BM25 candidates fuse through RRF into a relevance check that selects bounded evidence or declines. An optional cloud path passes through Secret Shield." },
    },
    {
      slug: "reflux",
      title: "Reflux",
      kicker: "Local-first media client",
      status: "Pre-release · source-available, not open source",
      stage: "pre-release",
      licence: "Proprietary · all rights reserved",
      period: "2026 – present",
      ownership: "Personal project · RSX Develops",
      role: "Personal project: media model, identification, shared playback engine and multi-device interface.",
      question: "What if a film were one thing, no matter how many files it lives in?",
      summary:
        "A Kotlin Multiplatform media client in which a work is distinct from the versions and sources that provide it. Watch and resume state belong to the work, so playback continues from any copy: a local folder, a Jellyfin server or a network share.",
      why: [
        "Most players treat a file as the thing you watch. Reflux treats the film or show as the thing, and files as versions of it that sources happen to provide.",
        "A 1080p copy on a laptop, a 4K copy on a Jellyfin server and an extended edition on a network share are three versions of one work. Stop on one copy and continue on another.",
      ],
      how: [
        ["Sources", "Local folders, Jellyfin servers and network shares provide files. Library state lives in the platform's data directory, never in media folders."],
        ["Identification", "Titles are read from ordinary filenames; embedded {tmdb-…}, IMDb and Plex edition tags are honoured."],
        ["One work", "Editions and qualities of one work become versions of a single item, and watch state attaches to the work."],
        ["Playback", "One engine picks the best available version for the device: Media3 on Android, libmpv on desktop."],
      ],
      decisions: [
        ["Organisation is virtual", "Reflux never renames, moves or modifies the user's files."],
        ["Refuse to guess", "A metadata match is accepted only when it is strong and clearly ahead of the runner-up. Two films of the same name stay separate rather than being merged into the wrong work; anything uncertain goes to an Identify flow."],
        ["One engine, every form factor", "Input adapts to touch, mouse and keyboard, game controllers and TV remotes, on top of one shared engine."],
      ],
      stack: [
        ["Kotlin Multiplatform", "One shared media core across Windows, Linux, Android and Android TV."],
        ["Compose", "The interface layer on each form factor."],
        ["Media3 · libmpv", "Native playback engines for Android and desktop."],
        ["Jellyfin · TMDB", "A remote source and the metadata used for identification."],
      ],
      limits: [
        "Pre-release; nothing has been published. The engine and one experience layer run on Windows, Linux, Android phones and tablets, and Android TV / Google TV.",
        "Android and television builds have been verified mainly on emulators.",
        "Accessibility is partial: contrast and system text size are tested, while screen-reader labels on every control, focus order, reduced motion and a TalkBack / Narrator pass are not done yet.",
        "Reflux is proprietary. The source is public so the work can be seen, but that grants no permission to redistribute, modify or reuse it.",
      ],
      links: [],
      noLinks: "No public release yet.",
      media: { kind: "illustration", svg: ill.reflux, label: "The Reflux media model: three sources provide several file versions, identification resolves them into one work, and watch state and best-version playback attach to that work." },
    },
    {
      slug: "extendspace",
      title: "ExtendSpace",
      kicker: "Windows to Android second screen",
      status: "In development · Connect still disabled",
      stage: "in-development",
      licence: null,
      period: "2026 – present",
      ownership: "Personal project · RSX Develops",
      role: "Personal project: Windows host, Android companion, wire protocol and session machinery.",
      question: "Can a tablet on a USB cable become a dependable second screen for Windows?",
      summary:
        "A Windows host and an Android companion that stream the desktop to a tablet. The production session path has streamed a live 1080p60 picture over USB to one tablet, driven by gated acceptance tests. Ordinary use is not possible yet: Connect is still disabled.",
      why: [
        "ExtendSpace turns an Android tablet into a second display for Windows: mirroring first, and true extension later, which needs a virtual display driver on Windows.",
        "The work so far is the streaming pipeline and the session machinery around it.",
      ],
      how: [
        ["Capture and encode", "Display capture and hardware H.264 encoding on Windows, behind a production session owner."],
        ["Transport", "A draft wire protocol, implemented on both sides, over a USB transport with reconnection."],
        ["Decode", "Decoders are created on a dedicated owner thread, never on the reader thread; a creation is used only if it still matches the stream that is wanted."],
        ["Recover", "Frames that arrive meanwhile wait in order, within limits; beyond that the stream skips to the next keyframe. The link recovers from a pulled cable."],
      ],
      decisions: [
        ["Explicit session owners", "Each side has a session owner with a tested state model. Teardown runs against an absolute deadline, and an orderly disconnect is distinguished from a fault."],
        ["Bounded waiting", "Decoder start-up never lets frames pile up without limit: the stream skips to the next keyframe instead."],
        ["Evidence before claims", "On one PC and one tablet (a Xiaomi Pad 7 over USB), a ten-minute 1080p60 test pattern sent 36,081 frames, all decoded and released; a later sixty-minute soak drew all 216,212 frames. These show the pipeline working on one setup; they are not broad device validation."],
      ],
      stack: [
        ["C# / .NET 10 · WinUI 3", "The Windows host: capture, encoding and the session owner."],
        ["H.264, hardware", "Encoding on Windows, MediaCodec decoding on Android."],
        ["Kotlin · Jetpack Compose", "The Android companion: link, decoder ownership and surface handling."],
        ["USB transport", "ADB forwarding to the companion over USB, with reconnection. There is no wireless path yet."],
      ],
      limits: [
        "Connect is disabled in both apps, and each says so in its own interface.",
        "Wi-Fi transport and pairing are not implemented. Input forwarding does not exist yet.",
        "The virtual display driver for Extend mode is not implemented; only its feasibility has been researched.",
        "One fault is open: Windows occasionally stops delivering captured frames while a browser plays video full screen, and nothing detects it yet.",
      ],
      links: [],
      noLinks: "No public build or demo.",
      media: { kind: "illustration", svg: ill.extendspace, label: "The ExtendSpace stream: the Windows desktop is captured and hardware-encoded, carried over USB by a session-owned link, and decoded on the tablet by a dedicated decoder owner." },
    },
  ];

  /* Compact entries, to test how attribution reads outside the ribbon. */
  const more = [
    { title: "Bhatkal Time Luxe", kicker: "Client project · HubZero", status: "Delivered · HubZero's first paid client project", stage: "delivered", owner: "HubZero client work. Visual design by a HubZero co-founder." },
    { title: "QueryCraft", kicker: "Final-year project · HubZero Build", status: "Final-year project · retired", stage: "retired", owner: "Three-person team; primary technical contributor." },
    { title: "Layers by RSX", kicker: "Android widget platform", status: "Pre-release · V1 in development", stage: "pre-release", owner: "Personal project. Ten basic widget types in scope for V1." },
    { title: "BlueTap", kicker: "Android Bluetooth widgets", status: "Pre-release · foundation complete", stage: "pre-release", owner: "Personal project. Connect / disconnect not implemented." },
  ];

  window.SP = { projects, more };
})();
