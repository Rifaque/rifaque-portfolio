/*
 * Prototype content. Transcribed from knowledge-base/projects/*.md (published
 * copy checked 2026-10-24) with the owner's decisions of 25 Oct 2026 applied:
 * Nexus private alpha + proprietary; BTL contribution wording and case-study
 * link; Reflux public repo linked but proprietary; Layers V1 wording;
 * QueryCraft collaborative/HubZero; MIT for Atlas, BlueTap, ExtendSpace;
 * general relocation wording; AITM affiliated with VTU, CGPA 8.36.
 *
 * Each project is described as a stack of layers, front (what a person
 * touches) to back (where the work ends up). The layers are the project's
 * real architecture as recorded in the knowledge base, not decoration.
 */

const KB = "../../knowledge-base/assets";

export const projects = [
  {
    slug: "nexus",
    title: "Nexus",
    kicker: "Personal AI operating layer",
    status: "Private alpha · active development",
    stage: "private-alpha",
    period: "Jun 2026 – present",
    licence: "Proprietary",
    owner: "Personal project · RSX Develops",
    role: "Personal project",
    question: "How can a personal AI stay useful without capability quietly becoming authority?",
    summary:
      "A local-first, voice-first layer for one owner on one Windows machine. Deterministic recognition handles what it can without a model, a reasoning step is reached only when it declines, and every effect passes through a single governed tool runtime.",
    face: { kind: "illustration", id: "nexus", caption: "Illustration · a request entering Nexus. No screenshot is published." },
    layers: [
      { name: "Request", role: "Push-to-talk or a hotkey", body: "You speak to it or summon it with a hotkey. There is no wake word and no background listening." },
      { name: "Command Fabric", role: "Recognise and route, never execute", body: "Deterministic, model-less recognition turns a request into a typed intent with typed slots, or marks it ambiguous, unsupported or a matter for the assistant." },
      { name: "Interactive Cortex", role: "Reached only when the fabric declines", body: "The model-driven step makes one bounded decision: answer, pick one governed capability from a closed set, ask a question, or delegate." },
      { name: "ToolRuntime", role: "Capability gate · policy · hash-bound approval", body: "The only place an effect happens. One deny beats any number of allows, and a consequential call needs owner approval bound to a hash of the computed effect." },
      { name: "Ledger", role: "Append-only, hash-chained", body: "Every call is recorded, denials and failures included. Mutations are checkpointed in a shadow Git repository." },
    ],
    run: {
      label: "Send a request",
      input: "“Set a timer for ten minutes”",
      steps: ["Heard: “Set a timer for ten minutes”", "Typed intent: timer · 10 min", "Not needed: the fabric handled it", "Checked at the gate before any effect", "Recorded in the ledger"],
      done: "Every effect goes through ToolRuntime.",
      skip: [2],
    },
    why: [
      "Most assistants become more useful by being allowed to do more. Nexus tries to keep those two things apart: an assistant that can hold a great deal of context about its owner and their work, while what it may actually change on the machine stays narrow, explicit and auditable.",
    ],
    decisions: [
      ["Approval that cannot drift", "A consequential call needs explicit owner confirmation, and that approval is bound to a hash of the computed effect. If the effect changes after approval, the approval is void."],
      ["The defaults refuse", "The standard policy stack is read-only. Host control registers no tool at all unless it is configured, and there is no shell, PowerShell or run-command tool."],
      ["Structure over instructions", "Filesystem tools cannot accept a raw path string; they receive a confined path that only the path jail can construct."],
    ],
    limits: [
      "Private alpha: Windows only, single owner, unreleased, with no public demo or source.",
      "The Surface and voice exist on working branches only; spoken acceptance of the voice endpoint is paused.",
      "System Control is off by default.",
    ],
    stack: ["Python 3.13", "FastAPI", "PostgreSQL + pgvector", "uv workspace", "pywebview / WebView2", "faster-whisper", "Anthropic Claude", "Ollama"],
    links: [],
    linksNote: "Proprietary. The source is private; there is no public repository or demo.",
  },
  {
    slug: "atlas",
    title: "Atlas",
    kicker: "Local-first workspace intelligence",
    status: "v1.0.3 released · not in active development",
    stage: "released",
    period: "Feb – Sep 2026",
    licence: "MIT",
    owner: "Personal project · RSX Develops",
    role: "Personal project",
    question: "Can an assistant answer from your workspace, and say so when it can't?",
    summary:
      "A Rust and Tauri 2 desktop app that indexes one codebase or document set and answers with inspectable evidence. Questions without enough workspace evidence can be declined instead of answered from general model knowledge.",
    face: {
      kind: "screenshot",
      src: `${KB}/atlas/atlas-1.0-ask.webp`,
      srcset: `${KB}/atlas/atlas-1.0-ask-751.webp 751w, ${KB}/atlas/atlas-1.0-ask.webp 1502w`,
      w: 1502,
      h: 1038,
      alt: "Atlas 1.0 Ask view: a question about workspace authorisation, a grounded answer with an 'Evidence considered 8' control, and a Sources panel listing retrieved files with line ranges.",
      caption: "Screenshot · Atlas 1.0 Ask view with the evidence panel. Local folder path masked.",
    },
    layers: [
      { name: "Ask view", role: "The interface", body: "Open a workspace, index it, ask or find, inspect the evidence, follow up. One loop, on purpose." },
      { name: "Candidates", role: "Semantic + BM25", body: "A question gathers semantic candidates from embeddings made locally through Ollama, and BM25 candidates from the text index." },
      { name: "Fusion", role: "Reciprocal-rank fusion", body: "Both lists are fused with RRF, de-duplicated and classified for relevance." },
      { name: "Grounding gate", role: "Answer, or decline", body: "With enough evidence, a bounded evidence set goes to the model. Without it, Atlas can decline rather than answer from general model knowledge." },
      { name: "Boundary", role: "Local by default · Secret Shield", body: "With Ollama, everything stays on the machine. Cloud generation is opt-in per request, and Secret Shield scans the complete outbound payload first." },
    ],
    run: {
      label: "Ask a question",
      input: "“Where is workspace authorization enforced?”",
      steps: ["Question received", "Semantic and BM25 candidates gathered", "Fused with reciprocal-rank fusion", "Enough evidence: bounded set selected", "Local model, nothing left the machine"],
      done: "Answer with inspectable sources.",
    },
    why: [
      "Earlier builds of Atlas reached for more surfaces. For 1.0 the product was narrowed to a single loop: open a workspace, index it, ask or find, inspect the evidence, follow up.",
      "Agents, arbitrary shell execution, personas, graph surfaces, web search and vision attachments are not part of 1.0.",
    ],
    decisions: [
      ["Saying it doesn't know", "When a question has no adequate evidence in the workspace, Atlas can decline it. The evidence it shows is the material supplied to or considered for an answer, not sentence-level attribution, and the app says so."],
      ["An explicit cloud boundary", "OpenRouter is optional and has to be enabled explicitly. Before anything leaves, Atlas assembles the complete payload and Secret Shield scans it for known secret formats; a match blocks the request."],
      ["Authorised in Rust", "Workspace access is authorised in the Rust backend; requested paths are canonicalised and confined to the workspace root."],
    ],
    limits: [
      "Windows x64 only, shipped as an unsigned NSIS installer; the release publishes a SHA-256 checksum.",
      "The updater is disabled. Linux is configured but unverified; macOS is unsupported.",
      "Secret Shield matches known patterns. It is a safety net for the cloud path, not a guarantee.",
    ],
    stack: ["Rust", "Tauri 2", "React 19", "TypeScript", "Ollama", "LanceDB", "OpenRouter (opt-in)"],
    links: [
      { label: "Source on GitHub", href: "https://github.com/Rifaque/atlas" },
      { label: "v1.0.3 release", href: "https://github.com/Rifaque/atlas/releases/tag/v1.0.3" },
      { label: "Product site", href: "https://atlas.rsxdevelops.dev" },
    ],
  },
  {
    slug: "reflux",
    title: "Reflux",
    kicker: "Local-first media client",
    status: "Pre-release · source-available, not open source",
    stage: "pre-release",
    period: "2026 – present",
    licence: "Proprietary",
    owner: "Personal project · RSX Develops",
    role: "Personal project",
    question: "What if a film were one thing, no matter how many files it lives in?",
    summary:
      "A Kotlin Multiplatform media client in which a work is distinct from the versions and sources that provide it. Watch and resume state belong to the work, so playback continues from any copy: a local folder, a Jellyfin server or a network share.",
    face: { kind: "illustration", id: "reflux", caption: "Illustration · one work, three versions. No screenshot is published." },
    layers: [
      { name: "Library", role: "The thing you watch", body: "The film or show is the item. Files are versions of it that sources happen to provide." },
      { name: "One work", role: "Watch state lives here", body: "Watch and resume state belong to the work, so you can stop on one copy and continue on another." },
      { name: "Identification", role: "Filenames, embedded IDs, editions", body: "A metadata match is accepted only when it is strong and clearly ahead of the runner-up. Anything else goes to an Identify flow instead of being guessed." },
      { name: "Sources", role: "Local folder · Jellyfin · network share", body: "Organisation is virtual: Reflux never renames, moves or modifies the user's files." },
      { name: "Playback", role: "Media3 on Android · libmpv on desktop", body: "One shared engine picks the best available version for the device." },
    ],
    run: {
      label: "Resume a film",
      input: "Resume “Film (2021)”",
      steps: ["Resume “Film (2021)”", "Resume point found on the work", "1080p, 2160p and an extended edition: one work", "Three sources provide the copies", "Best version for this device"],
      done: "Playback continues from any copy.",
    },
    why: [
      "Most players treat a file as the thing you watch. Reflux treats the film or show as the thing. A 1080p copy on a laptop, a 4K copy on a Jellyfin server and an extended edition on a network share are three versions of one work.",
    ],
    decisions: [
      ["Never guess into the wrong work", "A file without a year joins its title's only known year. With several known years, such as two films of the same name, it stays separate rather than being guessed into the wrong work."],
      ["One engine, every form factor", "Media3 on Android and libmpv on desktop, from one shared engine. Input adapts to touch, mouse and keyboard, game controllers and TV remotes."],
      ["Library state stays out of your folders", "Library state lives in the platform's data directory and never in your media folders; nothing is renamed or moved."],
    ],
    limits: [
      "Pre-release; nothing has been published.",
      "Android and television builds have been verified mainly on emulators.",
      "Accessibility is partial: screen-reader labels on every control, focus order, reduced motion and a TalkBack / Narrator pass are not done yet.",
    ],
    stack: ["Kotlin Multiplatform", "Compose", "Media3", "libmpv", "Jellyfin", "TMDB"],
    links: [{ label: "Source on GitHub", href: "https://github.com/Rifaque/reflux" }],
    linksNote:
      "Reflux is proprietary. The source is public so the work can be seen; that grants no permission to redistribute, modify or reuse it.",
  },
  {
    slug: "extendspace",
    title: "ExtendSpace",
    kicker: "Windows to Android second screen",
    status: "In development · Connect still disabled",
    stage: "in-development",
    period: "2026 – present",
    licence: "MIT",
    owner: "Personal project · RSX Develops",
    role: "Personal project",
    question: "Can a tablet on a USB cable become a dependable second screen for Windows?",
    summary:
      "A Windows host and an Android companion that stream the desktop to a tablet. The production session path has streamed a live 1080p60 picture over USB to one tablet, driven by gated acceptance tests. Ordinary use is not possible yet: Connect is still disabled.",
    face: { kind: "illustration", id: "extendspace", caption: "Illustration · the tablet end of the stream, showing a test pattern. Not an app screenshot." },
    layers: [
      { name: "Tablet surface", role: "Android companion · Compose", body: "Decoded frames are released to the tablet's surface." },
      { name: "Decoder owner", role: "One owner thread per receiver", body: "Decoders are created on a dedicated thread; frames that arrive meanwhile wait in order, within limits, and beyond that the stream skips to the next keyframe." },
      { name: "USB link", role: "Draft protocol, both sides", body: "The link recovers from a pulled cable with video still flowing afterwards." },
      { name: "Encode", role: "Hardware H.264 · session owner", body: "Capture and hardware encoding sit behind an explicit session owner with a tested state model." },
      { name: "Capture", role: "Windows host · WinUI 3", body: "The Windows desktop is captured on the host." },
    ],
    run: {
      label: "Stream a frame",
      input: "Desktop frame → tablet",
      steps: ["Drawn on the tablet", "Decoded by the owner thread", "Carried over USB", "Hardware H.264", "Frame captured"],
      done: "One PC, one tablet, test pattern.",
      reverse: true,
    },
    cable: true,
    why: [
      "ExtendSpace turns an Android tablet into a second display for Windows: mirroring first, and true extension later, which needs a virtual display driver on Windows. The work so far is the streaming pipeline and the session machinery around it.",
    ],
    decisions: [
      ["What has been tested", "On one PC and one tablet (a Xiaomi Pad 7 over USB), the production session path streamed a 1080p60 test pattern for ten minutes, and the same build was exercised through the 720p30 fallback, rotation, screen-off, cable pulls and a frozen app. These are single-setup results, not broad device validation."],
      ["A creation is used only if it still fits", "Decoder creation happens on one owner thread per receiver, never on the reader thread, and a creation is used only if it still matches the stream that is wanted."],
    ],
    limits: [
      "Connect is disabled in both apps, and each says so in its own interface.",
      "Wi-Fi transport, pairing and input forwarding are not implemented.",
      "The virtual display driver for Extend mode is not implemented; only its feasibility has been researched.",
    ],
    stack: ["C# / .NET 10", "WinUI 3", "Kotlin", "Jetpack Compose", "H.264 (MediaCodec)", "USB transport"],
    links: [],
    linksNote: "No public link yet: the public repository's last push predates the work described here.",
  },
  {
    slug: "bhatkal-time-luxe",
    title: "Bhatkal Time Luxe",
    short: "BTL",
    kicker: "Client project · HubZero",
    status: "Delivered · HubZero's first paid client project",
    stage: "delivered",
    period: "Apr – Sep 2025",
    owner: "HubZero client work",
    hubzero: true,
    role: "Frontend development, plus architecture, full-stack and infrastructure work across different parts and stages of the project",
    credit:
      "A HubZero engagement. My work covered frontend development and, across different parts and stages, architecture, full-stack and infrastructure work. Visual design by a HubZero co-founder. The live site has changed since; not every current change is mine.",
    question: null,
    summary:
      "A luxury watch storefront for a retailer serving Kuwait and the wider GCC, and HubZero's first paid client project.",
    face: {
      kind: "screenshot",
      src: `${KB}/bhatkal-time-luxe/btl-2025-ui-composite.png`,
      w: 1280,
      h: 450,
      crop: true,
      alt: "Bhatkal Time Luxe, 2025 interface: desktop home, brand index, product page and catalogue listing, plus mobile home and product screens, on a dark theme with gold accents.",
      caption: "Screenshot (composite) · the delivered 2025 interface. Client work for HubZero; visual design by a HubZero co-founder.",
    },
    layers: [
      { name: "Storefront", role: "Delivered 2025 interface", body: "Brand and collection browsing, with separately designed mobile and desktop layouts." },
      { name: "Next.js on Vercel", role: "Server-rendered pages", body: "Pages are server-rendered with structured data and a sitemap, so the catalogue is crawlable." },
      { name: "Node.js API", role: "Self-hosted Ubuntu server", body: "A separate API, deployed apart from the storefront." },
      { name: "Data and media", role: "MongoDB · Cloudinary + imgix", body: "A MongoDB data model, with product images delivered through Cloudinary and imgix." },
    ],
    run: {
      label: "Load a page",
      input: "Open a watch",
      steps: ["Product page requested", "Rendered on the server", "API call to the Ubuntu server", "Record from MongoDB, images via imgix"],
      done: "A crawlable catalogue page.",
    },
    why: [
      "It was HubZero's first paid client project: paid software for another business, carried from architecture to production infrastructure by a small team.",
    ],
    decisions: [
      ["Who did what", "A HubZero engagement. My work covered frontend development and, across different parts and stages, architecture, full-stack and infrastructure work. The visual design was done by a HubZero co-founder."],
      ["Two deployments", "A Next.js storefront on Vercel against a separate Node.js API on a self-hosted Ubuntu server."],
    ],
    limits: [
      "Client work: the code belongs to the client project and is not presented here as a personal open-source project.",
      "The live site has been changed since 2025. This page describes the delivered work, not every current change.",
    ],
    stack: ["Next.js", "TypeScript", "Node.js", "MongoDB", "Tailwind CSS", "Cloudinary", "imgix", "Vercel", "Ubuntu"],
    links: [],
    linksNote: "The case study describes the delivered work. The portfolio links there rather than to the live site.",
  },
];

export const more = [
  {
    slug: "layers",
    title: "Layers by RSX",
    kicker: "Android widget platform",
    status: "Pre-release · V1 in development",
    stage: "pre-release",
    body: "A customisable Android widget platform built around a portable widget definition, a shared runtime, a generic editor and a theme system. Ten basic widget types are planned for V1; not all are implemented yet.",
    meta: "Personal project · private repository",
  },
  {
    slug: "bluetap",
    title: "BlueTap",
    kicker: "Android Bluetooth widgets",
    status: "Pre-release · foundation complete",
    stage: "pre-release",
    body: "Home-screen widgets for already-paired Bluetooth devices. Assignment, appearance and responsive layouts work; tapping to connect or disconnect is the goal and is not implemented yet.",
    meta: "Personal project · MIT",
    link: { label: "Source", href: "https://github.com/Rifaque/blue-tap" },
  },
  {
    slug: "querycraft",
    title: "QueryCraft",
    kicker: "Final-year project · HubZero Build",
    status: "Final-year project · retired",
    stage: "retired",
    body: "Plain English in, SQL or NoSQL out, from local Qwen and Mistral models through Ollama. Generated queries were proposals: explained, validated, and run only when the user chose to.",
    meta: "Collaborative: three-person team with HubZero members · primary technical contributor",
  },
];

export const experience = [
  {
    org: "HubZero",
    role: "Co-founder & Software Engineer",
    period: "Jan 2025 – present",
    body: "An engineering studio I co-founded. Client delivery including Bhatkal Time Luxe, reusable Blueprint foundations, and delivery infrastructure across Cloudflare, Vercel, DNS and Linux.",
  },
  {
    org: "RG SmartDiscovery LLP",
    role: "Software Engineer Intern",
    period: "Aug 2025 – May 2026",
    body: "Frontend development and API integration across nxNearby's job portal and its AI-assisted course and quiz workflows.",
  },
  {
    org: "AITM, affiliated with VTU",
    role: "B.E. Computer Science and Engineering",
    period: "2022 – 2026 · CGPA 8.36",
    body: "Final-year project: QueryCraft, with a team of three. AWS Cloud Practitioner Essentials training, May 2025.",
  },
];

export const principles = [
  ["Capability is not permission", "Nexus and Atlas both draw a hard line between what a model may propose and what the software lets happen."],
  ["Say what isn't done", "Every project lists its limits next to its features. A pre-release label is information, not an apology."],
  ["Local first, cloud by consent", "Where it is practical, data and inference stay on the user's machine."],
  ["Products, not demos", "Installers, recovery paths, empty states and the servers things run on are part of the work."],
];

/** Technology → where it was used, from the project records only. */
export const tech = [
  ["TypeScript", ["atlas", "bhatkal-time-luxe"]],
  ["React", ["atlas"]],
  ["Next.js", ["bhatkal-time-luxe", "querycraft"]],
  ["Rust · Tauri", ["atlas"]],
  ["Python", ["nexus", "querycraft"]],
  ["PostgreSQL", ["nexus"]],
  ["MongoDB", ["bhatkal-time-luxe", "querycraft"]],
  ["Ollama", ["nexus", "atlas", "querycraft"]],
  ["Kotlin", ["reflux", "extendspace", "layers", "bluetap"]],
  ["Compose", ["reflux", "extendspace", "layers", "bluetap"]],
  ["C# / .NET", ["extendspace"]],
  ["Node.js", ["bhatkal-time-luxe", "querycraft"]],
];

export const site = {
  name: "RSX Develops",
  person: "Rifaque Akrami",
  email: "rifaque.rs@gmail.com",
  github: "https://github.com/Rifaque",
  linkedin: "https://www.linkedin.com/in/rifaque-akrami/",
  hubzero: "https://hubzero.in",
  resume: "../../public/resume/Rifaque_Resume.pdf",
  location: "Bhatkal, Karnataka, India",
  availability: "Open to relocation and remote roles.",
};
