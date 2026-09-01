// =========================================================================
// Portfolio content — single source of truth.
//
// Every factual claim here is traceable to first-party evidence: project
// source, git history, live deployments, or HubZero's own public records.
// If something cannot be verified, it does not appear.
// =========================================================================

// =========================
// Types
// =========================

export type ProjectTier = "signature" | "selected";

export type StatusTone = "active" | "released" | "retired" | "client" | "exercise";

export interface ProjectStatus {
  label: string;
  tone: StatusTone;
}

/** A flexible narrative block. Not every project uses every heading. */
export interface NarrativeSection {
  heading: string;
  body?: string[];
  list?: string[];
}

export interface ProjectLink {
  label: string;
  href: string;
  kind: "live" | "code";
}

export interface Project {
  id: string;
  name: string;
  /** One line. Shown on the card. */
  tagline: string;
  /** Who built it and in what capacity. */
  role: string;
  /** Three short, complete lines for the card. Never truncated narrative. */
  highlights: string[];
  status: ProjectStatus;
  dates: string;
  tier: ProjectTier;
  technologies: string[];
  narrative: NarrativeSection[];
  links: ProjectLink[];
  image?: string;
  /** Renders a hand-drawn architecture diagram in the detail view. */
  diagram?: "nexus" | "atlas";
}

export interface ArchiveEntry {
  id: string;
  name: string;
  description: string;
  dates: string;
  technologies: string[];
  githubUrl?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  dates: string;
  location: string;
  /** Sets context before the bullets. */
  summary: string;
  highlights: string[];
  technologies: string[];
  url?: string;
}

export interface Education {
  university: string;
  degree: string;
  field: string;
  dates: string;
  location: string;
  cgpa: string;
  finalYearProject: string;
  training: { name: string; issuer: string; date: string; note: string };
}

export interface SkillEvidence {
  name: string;
  evidence: string[];
}

// =========================
// Site / metadata
// =========================

export const site = {
  domain: "rifaque.hubzero.in",
  url: "https://rifaque.hubzero.in",
  ogImage: "https://rifaque.hubzero.in/og-image.png",
  title: "Rifaque Ahmed — Product-minded full-stack engineer",
  description:
    "Product-minded full-stack engineer. I build AI-assisted tools, RAG systems and web products — Nexus (governed AI development assistant), Atlas (local-first RAG desktop app), and client work through HubZero.",
};

// =========================
// Personal
// =========================

export const personalInfo = {
  name: "Rifaque Ahmed",
  headline: "Product-minded full-stack engineer",
  tagline: "AI-assisted tools · RAG systems · web products",
  email: "rifaque.rs@gmail.com",
  location: "Bhatkal, Karnataka, India",
  resume: "/resume/Rifaque_Resume.pdf",
  /** Short-form, used in the hero. */
  intro:
    "I build systems where retrieval decides what a model sees and structure decides what it is allowed to do. Most recently: a governed AI development assistant, a local-first RAG desktop app, and client software delivered through a five-person studio I co-founded.",
  /** Long-form, used in the about section. One paragraph per entry. */
  bio: [
    "I work across the stack, but the parts I keep returning to are backend architecture and retrieval. Nexus is where that goes furthest — an AI assistant that holds durable context about a developer's projects, with a hard boundary between what a model may suggest and what is allowed to happen. Atlas is the shipped version of the same instinct: index a codebase locally, retrieve well, and let a local model reason over it without anything leaving the machine.",
    "The rest is ordinary product engineering, which I think matters just as much. Through HubZero — an engineering studio I co-founded with four others — I've delivered paid client software end to end, own the studio's infrastructure, and designed the Blueprint system we build client work from. Before that, ten months of production frontend work on an AI education and careers platform.",
    "I care about evidence over claims. Most of what I've learned came from being wrong in a way a test suite could not catch.",
  ],
  socials: {
    github: "https://github.com/Rifaque",
    linkedin: "https://linkedin.com/in/rifaque-akrami",
    email: "mailto:rifaque.rs@gmail.com",
  },
  /** What kind of work is actually wanted. Not a freelance pitch. */
  seeking: {
    heading: "What I'm looking for",
    body: "Product or AI engineering roles on a team that ships — startups, product companies, developer tooling. Backend and full-stack work, ideally somewhere retrieval or AI systems are part of the problem rather than a label on it.",
    openTo: ["Remote", "Relocation within India", "Dubai / UAE"],
  },
};

// =========================
// Projects
// =========================

export const projects: Project[] = [
  // ---------------------------------------------------------------- NEXUS
  {
    id: "nexus",
    name: "Nexus",
    tagline:
      "A self-hosted AI development assistant that keeps durable context — and cannot act on it without your approval.",
    role: "Personal project · sole author",
    highlights: [
      "The executor computes the effect, not the model. The human approves that effect.",
      "Approval is bound to state by a hash — if the world moves, the approval dies.",
      "27 constitutional invariants, changeable only by a superseding decision record.",
    ],
    status: { label: "Active alpha · Private repository", tone: "active" },
    dates: "Jun 2026 – Present",
    tier: "signature",
    diagram: "nexus",
    technologies: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "pgvector",
      "SQLAlchemy",
      "Alembic",
      "Pydantic",
      "Anthropic API",
      "Ollama",
      "Docker",
      "mypy strict",
    ],
    narrative: [
      {
        heading: "Context",
        body: [
          "Session-scoped assistants forget everything between conversations. You re-explain the same architecture, the same constraints, the same decisions, every time. The obvious fix is to give the assistant memory.",
          "Nexus is what happens when you take that fix seriously and then look at what it costs.",
        ],
      },
      {
        heading: "The problem",
        body: [
          "Persistence is not a storage problem. Once an assistant remembers, a wrong belief becomes durable — it survives the session that created it and shapes every answer after. And once an assistant can act, a wrong action becomes destructive rather than merely unhelpful.",
          "So durable memory and autonomous action each create a trust problem, and they compound. Nexus is an attempt to govern memory, action and inference rather than to make any of them more powerful.",
        ],
      },
      {
        heading: "The hard part",
        body: [
          "The model cannot be the authority on what its own action means. If a model says \"I will write to config.yaml\" and the human approves that sentence, nothing binds the approval to what actually happens next. The description and the effect are two different objects, and only one of them is real.",
        ],
      },
      {
        heading: "What I decided",
        list: [
          "The executor computes the effect, not the model. Every confirmation-path tool implements precompute_effect(); a tool that reaches CONFIRM without one is denied outright.",
          "The human approves that concrete effect, and the approval carries a hash of it. Resolve with the wrong hash and it is denied regardless of the approved flag. If state drifts after approval, the approval is void.",
          "Confinement is structural, not instructional. Filesystem tools cannot accept a raw path string — they receive a JailedPath, a value only the path-jail resolver can construct. That is stronger than trusting every future call site to remember to validate.",
          "Risk analysis is pure and advisory. It never allows, never denies, never performs I/O. Only the policy engine decides, and policy composition is deny-overrides — an added policy may only ever tighten.",
        ],
      },
      {
        heading: "Architecture",
        body: [
          "A protocol-oriented modular monolith. The safety-critical tool runtime is a leaf package that imports nothing else from the system, so it can be reasoned about in isolation, and exactly one module is permitted to import it — the composition root stays singular and auditable.",
          "Every tool call passes two independent gates: a capability gate, then a policy engine. Neither may be skipped or made to imply the other. Terminal paths append to a hash-chained, append-only ledger — denials and failures are observations too.",
        ],
      },
      {
        heading: "Implementation",
        list: [
          "29 live tools. 28 are read-only; the single mutation is jailed to a scratch directory and confirmation-gated.",
          "Memory with versioning, confidence, TTL decay and provenance, retrieved through pgvector semantic search alongside keyword search.",
          "Shadow-git checkpointing that never touches the user's branch, index or stash — and a rollback that restores recorded targets rather than running a hard reset.",
          "A tool loop bounded simultaneously on steps, wall-clock and bytes, with replay determinism preserved so a frozen ledger replays identically.",
          "Preference suggestions are evidence-derived, not model-authored. A suggestion never becomes a preference until a human commits it.",
        ],
      },
      {
        heading: "Governance",
        body: [
          "Nexus has a written constitution — PLATFORM_v1.md. Section 16 holds 27 numbered invariants that future contributors may not violate: forbidden dependencies, the mandatory two-gate pipeline, executor-computed effects, hash-bound approval, structural path confinement, append-only audit, bounded autonomy.",
          "They are not guidelines. Changing one requires an ADR that supersedes the section.",
        ],
      },
      {
        heading: "What went wrong, and what I learned",
        body: [
          "Sprint 13 shipped the tool runtime with a fully green test suite. An independent architectural audit then found seven blocking defects sitting behind that green suite. All seven were fixed in a dedicated stabilisation pass before the release was tagged.",
          "A green suite is necessary and not sufficient. That is the single most useful thing this project has taught me, and it changed how I work: adversarial audits as a routine gate, invariants written down explicitly rather than held in my head, and claims that have to survive someone actively trying to break them. The same pattern recurred in a later sprint, which is roughly the point — it is a property of the process, not a one-off mistake.",
        ],
      },
      {
        heading: "Status",
        body: [
          "Alpha. Single user, no UI, private repository, not production-ready. The confirmation and checkpoint paths are built and tested but not reachable in the default stack — a read-only policy denies every mutating capability, and enabling them is an open architectural decision rather than a config change.",
          "The current direction is a re-architecture — less LLM-centric, more a deterministic routing layer with specialist agents behind it — so the shape above describes what is built and running, not a finished design.",
          "It may stay unfinished for a long time. I am fine with that; it is the project I think with.",
        ],
      },
    ],
    links: [],
  },

  // ---------------------------------------------------------------- ATLAS
  {
    id: "atlas",
    name: "Atlas",
    tagline:
      "A local-first workspace assistant. Index a project folder, retrieve over it, and reason with a local model — nothing leaves the machine.",
    role: "Personal project · sole author",
    highlights: [
      "Parent–child chunking: precise retrieval, then enough context to answer with.",
      "Hybrid retrieval — dense vectors merged with exact keyword matching.",
      "A single Rust binary. No sidecar, no local server, nothing leaves the machine.",
    ],
    status: { label: "v0.9.2 · Feature-complete · Development paused", tone: "released" },
    dates: "Feb 2026 – Mar 2026",
    tier: "signature",
    diagram: "atlas",
    image: "/projectscreenshots/atlas-thumbnail.png",
    technologies: [
      "Rust",
      "Tauri 2",
      "React 18",
      "TypeScript",
      "LanceDB",
      "Apache Arrow",
      "Tree-sitter",
      "Ollama",
      "Vite",
    ],
    narrative: [
      {
        heading: "Context",
        body: [
          "Every AI coding tool has the same failure mode: it answers confidently about code it never actually looked at. The model is rarely the bottleneck. What it was handed is.",
          "Atlas turns a project folder into a queryable knowledge base and runs the whole pipeline locally — indexing, embeddings, retrieval and inference — so the trade-off between useful context and sending your code somewhere disappears.",
        ],
      },
      {
        heading: "The hard part",
        body: [
          "Retrieval quality matters more than model choice. A 7B model given the right three chunks beats a frontier model given the wrong twenty, and almost all the engineering effort in this project went into the first half of that sentence.",
        ],
      },
      {
        heading: "What I decided",
        list: [
          "Parent-child chunking. Index small chunks (~512B) so similarity search stays precise, then inject the larger parent window (~2KB) into the prompt so the model gets enough surrounding context to be useful. Precision at retrieval, breadth at generation.",
          "Hybrid retrieval. Dense vector search over LanceDB, merged with exact keyword matching — exact matches prioritised, deduplicated by id. Semantic search alone loses identifiers; keyword search alone loses intent.",
          "Incremental indexing driven by an mtime manifest, so re-indexing a workspace touches only what changed rather than rebuilding from scratch.",
          "A cross-file symbol-reference graph built from Tree-sitter identifier extraction, giving structural context that raw vectors miss.",
          "No sidecar process and no local HTTP server. A single Rust binary with the frontend talking to it over Tauri IPC.",
        ],
      },
      {
        heading: "Architecture",
        body: [
          "Tauri 2 shell in Rust doing the crawling, chunking, embedding and vector storage; React 18 and TypeScript for the interface; LanceDB on Apache Arrow as the local vector store; Ollama for both embeddings (nomic-embed-text) and chat inference.",
          "The file crawler respects .gitignore, the watcher keeps the index in sync in the background, and retrieval metadata carries line ranges and file paths so every answer can cite exactly where it came from.",
        ],
      },
      {
        heading: "Beyond retrieval",
        list: [
          "Timeline intelligence — reads git history and the filesystem so \"what changed since yesterday\" is a real query rather than a guess.",
          "Secret Shield — if you opt into a cloud model, outgoing messages are scanned locally for API keys and PII and blocked pending confirmation before anything leaves.",
          "Purpose-built personas (Architect, Security Auditor, Writer) with bounded shell tools.",
          "Signed Windows and Linux installers built in CI, with an in-app updater.",
        ],
      },
      {
        heading: "Status",
        body: [
          "v0.9.2 is the last tagged release — MIT licensed, public repository, signed Windows and Linux installers built in CI, with product and architecture documentation written before the code.",
          "Feature-complete for this phase of development, and paused rather than abandoned. What is left is a UI/UX and completeness review, which is also what decides whether it earns a v1. I would rather sit at 0.9.2 and say so than put a 1.0 on it because the number looks better.",
        ],
      },
      {
        heading: "An honest correction",
        body: [
          "Atlas's own documentation described the hybrid search as BM25 with reciprocal rank fusion. Reading the implementation again, it is not — there is no TF-IDF scoring and no rank-fusion formula, just a dense search merged with exact keyword matching. It is genuinely hybrid retrieval, and it is not the thing the docs claimed. Fixing the docs is on the list; overstating it here is not.",
        ],
      },
    ],
    links: [
      { label: "Source", href: "https://github.com/Rifaque/atlas", kind: "code" },
    ],
  },

  // ----------------------------------------------------- BHATKAL TIME LUXE
  {
    id: "bhatkal-time-luxe",
    name: "Bhatkal Time Luxe",
    tagline:
      "A luxury watch storefront that moved a WhatsApp-based business onto a platform it actually owned.",
    role: "Client work · HubZero · architecture, full-stack build, infrastructure",
    highlights: [
      "WhatsApp concierge checkout, because the business already sold in conversation.",
      "Multi-currency storefront with an admin back office a non-developer can run.",
      "Next.js on Vercel, separate Node API, MongoDB. Shipped and used.",
    ],
    status: { label: "Client work · HubZero · Delivered", tone: "client" },
    dates: "Apr 2025 – Sep 2025",
    tier: "selected",
    image: "/projectscreenshots/ecommerce-thumbnail.png",
    technologies: [
      "Next.js",
      "TypeScript",
      "Node.js",
      "MongoDB",
      "Tailwind CSS",
      "Cloudinary",
      "Vercel",
    ],
    narrative: [
      {
        heading: "Context",
        body: [
          "A local luxury watch retailer was selling almost entirely over WhatsApp — photos sent by hand, prices negotiated in chat, no catalogue anyone could browse. HubZero's first paid client engagement, and the first time I had to design around someone else's business rather than my own preferences.",
        ],
      },
      {
        heading: "The product decision that shaped everything",
        body: [
          "The obvious brief was \"build them a normal checkout\". That would have been wrong. The business ran on conversation — buyers wanted to negotiate, ask about authenticity, arrange collection. Replacing that with a payment gateway would have removed the thing that actually closed sales.",
          "So checkout hands off to WhatsApp deliberately: the site does discovery, presentation and cart-building, then transfers a structured order into the channel where the business already knew how to sell. Concierge checkout, not abandoned checkout.",
        ],
      },
      {
        heading: "What was built",
        list: [
          "Storefront with brand and collection browsing, filtering, and independently designed mobile and desktop experiences.",
          "WhatsApp concierge checkout carrying a structured cart into the conversation.",
          "Multi-currency support for a customer base that is not all in one country.",
          "An admin back office the owner could run without a developer — the real test, since a store nobody can update is a store that dies in a month.",
          "SEO infrastructure: server-rendered pages, structured data, sitemap, canonical URLs.",
        ],
      },
      {
        heading: "My contribution",
        body: [
          "Overall software architecture, full-stack implementation across the Next.js frontend and the Node API, database design, deployment and hosting, domain and DNS configuration. A co-founder — the studio's designer — did the visual design. This was collaborative client work, not a solo build.",
        ],
      },
      {
        heading: "Outcome",
        body: [
          "Shipped and used by the business. The client later discontinued for personal reasons unrelated to the software, and the site is retained as a live demo.",
          "Older project material claimed a 60% load-time improvement from the image pipeline. I have not re-measured it, so it is not stated as a current figure here.",
        ],
      },
    ],
    links: [
      { label: "Live demo", href: "https://btl.hubzero.in", kind: "live" },
      {
        label: "Source",
        href: "https://github.com/HubZeroHQ/bhatkal-time-luxe",
        kind: "code",
      },
    ],
  },

  // ----------------------------------------------------------- QUERYCRAFT
  {
    id: "querycraft",
    name: "QueryCraft",
    tagline:
      "Natural language to database queries, generated by local models and validated before anything runs.",
    role: "Final-year project · primary technical contributor on a 3-person team",
    highlights: [
      "Constrained generation, then validation before any query reaches a database.",
      "Local inference only — Mistral 7B and Qwen 4B through Ollama.",
      "Self-hosted the inference backend on my own hardware.",
    ],
    status: { label: "Retired · HubZero Builds", tone: "retired" },
    dates: "Jul 2025 – Jan 2026",
    tier: "selected",
    image: "/projectscreenshots/querycraft-thumbnail.png",
    technologies: [
      "Next.js",
      "TypeScript",
      "Node.js",
      "Express",
      "MongoDB",
      "Ollama",
      "Mistral 7B",
      "Qwen 4B",
    ],
    narrative: [
      {
        heading: "Context",
        body: [
          "My final-year engineering project, built with two others and published under HubZero. Plain English in, SQL or NoSQL queries out, against a schema the system has been shown.",
        ],
      },
      {
        heading: "The interesting problem is not the translation",
        body: [
          "Getting a language model to emit something that looks like SQL is easy and not very interesting. The engineering problem is everything downstream: a model will confidently produce syntactically valid queries that are wrong, unsafe, or reference columns that do not exist — and unlike a chat response, a database query has consequences when it executes.",
          "So the work was constrained generation and validation, not prompt cleverness. Schema-aware prompting to narrow what the model can plausibly produce, then a validation layer between generation and execution that checks the query before a database ever sees it. Generation is treated as a proposal, never as an instruction.",
        ],
      },
      {
        heading: "Local inference by choice",
        body: [
          "Everything ran on locally hosted open-source models through Ollama — Mistral 7B and Qwen 4B — rather than a hosted API. Partly privacy (the schema is the sensitive part), partly the constraint being genuinely instructive: with a smaller model you cannot paper over a weak prompt or a missing validation step.",
          "I self-hosted the inference backend on my own hardware for the same reason, which is where a fair amount of my Linux and deployment experience actually comes from.",
        ],
      },
      {
        heading: "My contribution",
        body: [
          "I led the technical implementation as primary contributor — application architecture, the frontend, most of the backend, the prompting and validation pipeline, execution safeguards, local model integration, and the self-hosted deployment. One teammate contributed backend work alongside me; the third focused on documentation and presentation.",
        ],
      },
      {
        heading: "Honest framing",
        body: [
          "This is not novel NL2SQL research and I would not present it as such. It is where I learned to build an AI-powered workflow that has to be correct rather than merely impressive, and the validation-before-execution instinct it produced went directly into Nexus.",
          "It has been retired as a HubZero in-house product. No live deployment.",
        ],
      },
    ],
    links: [
      {
        label: "Source",
        href: "https://github.com/HubZeroHQ/querycraft",
        kind: "code",
      },
    ],
  },

  // ------------------------------------------------------------- DEVPILOT
  {
    id: "devpilot",
    name: "DevPilot",
    tagline:
      "A project-management application built end to end as an interview exercise.",
    role: "Built as an interview exercise",
    highlights: [
      "Relational modelling with Prisma over PostgreSQL.",
      "JWT and NextAuth across a separate frontend and backend.",
      "Self-hosted backend behind a Cloudflare Tunnel.",
    ],
    status: { label: "Interview exercise", tone: "exercise" },
    dates: "2025",
    tier: "selected",
    technologies: [
      "Next.js",
      "Node.js",
      "Express",
      "Prisma",
      "PostgreSQL",
      "JWT",
      "NextAuth",
      "Vercel",
    ],
    narrative: [
      {
        heading: "What it is",
        body: [
          "A full-stack project and task management application — projects, task assignment, team collaboration, progress tracking — built as part of an interview selection process. Listing it as anything other than that would be dishonest, and it is useful precisely because of what it had to prove under a deadline.",
        ],
      },
      {
        heading: "What it demonstrates",
        list: [
          "Relational data modelling with Prisma over PostgreSQL, rather than reaching for MongoDB by habit.",
          "Authentication done properly — JWT plus NextAuth, with session handling across a separate frontend and backend.",
          "A backend deliberately kept separate from the Next.js app instead of collapsed into route handlers.",
          "Self-hosting: the backend and database ran on my own Ubuntu box, exposed through a Cloudflare Tunnel, with the frontend on Vercel.",
        ],
      },
    ],
    links: [
      { label: "Source", href: "https://github.com/Rifaque/DevPilot", kind: "code" },
    ],
  },
];

export const signatureProjects = projects.filter((p) => p.tier === "signature");
export const selectedProjects = projects.filter((p) => p.tier === "selected");

// =========================
// Archive
// =========================

export const archiveIntro =
  "Earlier experiments, academic projects and things I built while figuring out what kind of engineer I wanted to become. They are here because they happened, not because they represent current work.";

export const archiveProjects: ArchiveEntry[] = [
  {
    id: "zerolink",
    name: "ZeroLink",
    description:
      "A real-time chat application, built mainly to learn WebSockets and see how real-time state behaves once more than one client is involved. It did that job. It was never meant to be more than that.",
    dates: "Jul 2025",
    // Matches the repository's own description; the source has not been
    // re-verified, so nothing beyond that is claimed.
    technologies: ["Next.js", "WebSockets", "MongoDB", "Firebase"],
    githubUrl: "https://github.com/Rifaque/ZeroLink",
  },
  {
    id: "blood-diagnosis",
    name: "Blood Report Disease Diagnosis",
    description:
      "A Flask web app wrapping a random forest classifier trained to flag blood-related conditions from test parameters. An academic exercise in getting a trained model behind a working interface — not a clinical tool, and not evidence of ML engineering depth.",
    dates: "Oct 2024",
    technologies: ["Python", "Flask", "scikit-learn", "Random Forest"],
    githubUrl:
      "https://github.com/Rifaque/Blood-Report-Disease-Diagnosis-App",
  },
  {
    id: "hospital-management",
    name: "Hospital Management System",
    description:
      "A Tkinter desktop application over SQLite for patient records, appointments and staff data. CRUD, forms and data integrity — the coursework version of learning that a UI is a contract with a database.",
    dates: "Jun 2024 – Jul 2024",
    technologies: ["Python", "Tkinter", "SQLite"],
    githubUrl: "https://github.com/Rifaque/Hospital-Management-System",
  },
  {
    id: "college-management",
    name: "College Management App",
    description:
      "An earlier academic desktop application in the same shape as the one above, written while I was still working out how to structure anything larger than a single file.",
    dates: "2023",
    technologies: ["Python", "Tkinter", "SQL"],
    githubUrl: "https://github.com/Rifaque/College-Management-App",
  },
];

// =========================
// Experience
// =========================

export const experiences: Experience[] = [
  {
    id: "hubzero",
    company: "HubZero",
    role: "Co-founder & Software Engineer",
    dates: "Jan 2025 – Present",
    location: "Bhatkal, India",
    summary:
      "A five-person engineering studio — three computer science engineers and two from electronics and communication — built around four pillars: Work (client engineering), Blueprints (reusable architecture and design foundations), Builds (in-house products), and Labs (experiments). I lead much of the technical architecture and own the infrastructure.",
    highlights: [
      "Delivered the studio's first paid client engagement end to end — Bhatkal Time Luxe — owning architecture, full-stack implementation, database design and production deployment.",
      "Designed the Blueprint system: a shared architectural base plus seven published design languages, so a client project starts from a working information architecture and design system rather than an empty repository. Blueprints are not templates — the reusable part is the architecture.",
      "Own the studio's technical infrastructure: domain and DNS, Cloudflare configuration, Vercel deployments, and self-hosted services on Ubuntu behind NGINX — including hosting inference workloads locally where a project needed Ollama.",
      "Built and maintain the studio's public site, and set much of its technical direction.",
    ],
    technologies: [
      "Next.js",
      "TypeScript",
      "Node.js",
      "MongoDB",
      "Tailwind CSS",
      "Vercel",
      "NGINX",
      "Cloudflare",
      "Linux",
    ],
    url: "https://hubzero.in",
  },
  {
    id: "rg-smartdiscovery",
    company: "RG SmartDiscovery LLP",
    role: "Frontend Developer Intern",
    dates: "Aug 2025 – May 2026",
    location: "India · Remote",
    summary:
      "Ten months on nxnearby.com, an AI education and careers platform combining a course marketplace with a job portal. Frontend engineering in a team of about six, working against Django REST APIs.",
    highlights: [
      "Owned the job portal frontend — including Easy Apply and AI-assisted application features — from implementation through API integration.",
      "Replaced a manual quiz-authoring workflow with AI-powered quiz generation: prompt and generation-option UI, multiple question types, and the mapping of unstructured model output into the application's editable quiz data model. That mapping was the actual engineering problem.",
      "Shipped the course purchase flow and time-zone-aware live class scheduling, plus the course catalog and marketing pages.",
      "Built reusable React components and hardened the application by eliminating console errors and fixing rendering defects across the product.",
    ],
    technologies: [
      "React",
      "JavaScript",
      "CSS Modules",
      "REST API integration",
    ],
  },
];

// =========================
// Education
// =========================

export const education: Education = {
  university: "Visvesvaraya Technological University (VTU), Belagavi",
  degree: "Bachelor of Engineering",
  field: "Computer Science and Engineering",
  dates: "2022 – 2026",
  location: "Karnataka, India",
  cgpa: "8.36 / 10",
  finalYearProject: "QueryCraft",
  training: {
    name: "AWS Cloud Practitioner Essentials",
    issuer: "Amazon Web Services",
    date: "May 2025",
    note: "Foundational course — not the certification exam.",
  },
};

// =========================
// Skills — evidence, not inventory
// =========================

export const skillsIntro =
  "Each of these is attached to something you can go and look at. Anything I could not point at is not listed.";

export const skillEvidence: SkillEvidence[] = [
  { name: "TypeScript / React", evidence: ["Atlas", "RG SmartDiscovery", "HubZero"] },
  { name: "Next.js", evidence: ["Bhatkal Time Luxe", "HubZero", "DevPilot"] },
  { name: "Python", evidence: ["Nexus", "QueryCraft"] },
  { name: "Retrieval / RAG", evidence: ["Nexus", "Atlas"] },
  { name: "Node / APIs", evidence: ["QueryCraft", "DevPilot", "Client work"] },
  { name: "PostgreSQL", evidence: ["Nexus", "DevPilot"] },
  { name: "MongoDB", evidence: ["QueryCraft", "Bhatkal Time Luxe"] },
  { name: "Rust / Tauri", evidence: ["Atlas"] },
  { name: "Linux / NGINX / Cloudflare", evidence: ["HubZero infrastructure", "Self-hosted inference"] },
];

export const alsoWorkedWith = ["Java", "C", "GraphQL", "Docker", "Flask", "Figma"];

// =========================
// Terminal
// =========================

export const terminalCommands: Record<string, string> = {
  help: `Available commands:

about      - Who I am
work       - Signature and selected work
nexus      - The flagship experiment
atlas      - The shipped one
hubzero    - The studio
skills     - What I can point at
experience - Work history
education  - Degree and training
contact    - How to reach me
resume     - Download my resume
archive    - Older work
invariants - 27 reasons Nexus says no
clear      - Clear terminal
exit       - Close terminal`,

  about: `Rifaque Ahmed
Product-minded full-stack engineer.
AI-assisted tools, RAG systems, web products.

I build systems where retrieval decides what a model sees
and structure decides what it is allowed to do.

Type 'work' to see what that produced.`,

  work: `Signature

  nexus    Governed AI development assistant   Active alpha, private
  atlas    Local-first RAG desktop app         v0.9.2, feature-complete
  hubzero  Five-person engineering studio      Co-founder, active

Selected

  Bhatkal Time Luxe   Client work through HubZero   Apr-Sep 2025
  QueryCraft          Final-year project, retired   Jul 2025-Jan 2026
  DevPilot            Interview exercise            2025

Type a project name for detail.`,

  nexus: `Nexus - active alpha, private repository

A self-hosted AI development assistant that keeps a durable model
of your projects, and cannot act on it without your approval.

  Executor computes the effect. Not the model.
  The human approves that effect. The approval is hash-bound.
  If state drifts, the approval is void.

  29 tools. 28 read-only.
  27 constitutional invariants.
  1 fully green test suite that hid seven blocking defects.

Type 'invariants' for the last one.`,

  atlas: `Atlas - v0.9.2, released, feature-complete, development paused

Local-first workspace assistant. Rust + Tauri 2, React 18,
LanceDB on Apache Arrow, Ollama for embeddings and inference.

  Parent-child chunking: precise retrieval, broad context.
  Hybrid retrieval: dense vectors merged with exact keywords.
  Incremental indexing via an mtime manifest.
  Nothing leaves the machine.

Retrieval quality matters more than model choice.

  github.com/Rifaque/atlas`,

  hubzero: `HubZero - engineering studio, co-founder since Jan 2025

Five engineers. Four pillars.

  WORK        client engineering
  BLUEPRINTS  reusable architecture + design foundations
  BUILDS      in-house products
  LABS        experiments

I lead much of the technical architecture, own the
infrastructure, and delivered the first paid client project.

  hubzero.in`,

  skills: `Every line points at something you can go and look at.

  TypeScript / React    Atlas, RG SmartDiscovery, HubZero
  Next.js               Bhatkal Time Luxe, HubZero, DevPilot
  Python                Nexus, QueryCraft
  Retrieval / RAG       Nexus, Atlas
  Node / APIs           QueryCraft, DevPilot, client work
  PostgreSQL            Nexus, DevPilot
  MongoDB               QueryCraft, Bhatkal Time Luxe
  Rust / Tauri          Atlas
  Linux / NGINX         HubZero infrastructure

Also worked with: Java, C, GraphQL, Docker, Flask.
Not claimed as current strengths.`,

  experience: `HubZero - Co-founder & Software Engineer
Jan 2025 - Present, Bhatkal

RG SmartDiscovery LLP - Frontend Developer Intern
Aug 2025 - May 2026, Remote
nxnearby.com, an AI education and careers platform`,

  education: `B.E. Computer Science and Engineering
Visvesvaraya Technological University (VTU), Belagavi
2022 - 2026, CGPA 8.36 / 10

Final-year project: QueryCraft

AWS Cloud Practitioner Essentials, May 2025
Foundational course, not the certification exam.`,

  contact: `rifaque.rs@gmail.com
Bhatkal, Karnataka, India

github.com/Rifaque
linkedin.com/in/rifaque-akrami

Open to remote, relocation within India, and Dubai/UAE.`,

  archive: `Earlier work lives at /archive.

ZeroLink, Blood Report Disease Diagnosis,
Hospital Management System, College Management App.

Kept because they happened, not because they
represent current work.`,

  invariants: `PLATFORM_v1.md, section 16, invariant 27:

  "Do not widen _DEFAULT_DENYLIST downward
   or weaken JailedPath's construction guarantee."

There are 26 others. Each may only be lifted by
an ADR that supersedes the section.

Writing the rules down is the cheap part.
Not being allowed to quietly change them is the point.`,

  resume: `Opening resume...`,
};
