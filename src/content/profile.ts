/**
 * About-page material: experience, education, principles, evidence-linked
 * skills and the archive. Source: knowledge-base/profile.md, portfolio.md
 * and projects/other-projects.md
 * (published, public-safe). The Bhatkal Time Luxe line follows the owner's
 * correction of 26 Oct 2026: built end to end through HubZero.
 */

export const principles = [
  {
    title: "Capability is not permission",
    body: "Nexus and Atlas both draw a hard line between what a model may propose and what the software lets happen. The interesting engineering is usually at that line.",
  },
  {
    title: "Say what isn't done",
    body: "Every project here lists its limits next to its features. A pre-release label is information, not an apology.",
  },
  {
    title: "Local first, cloud by consent",
    body: "Where it is practical, data and inference stay on the user's machine, and anything that leaves does so because someone chose it.",
  },
  {
    title: "Products, not demos",
    body: "Installers, recovery paths, empty states and the servers things run on are part of the work, whether it is a client storefront or a personal tool.",
  },
] as const;

export type Role = {
  id: string;
  company: string;
  url?: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
  work?: string[];
};

export const experience: Role[] = [
  {
    id: "hubzero",
    company: "HubZero",
    url: "https://hubzero.in",
    role: "Co-founder & Software Engineer",
    period: "Jan 2025 – present",
    location: "Bhatkal, India",
    summary: "An engineering studio I co-founded. I work across its architecture, full-stack implementation and delivery infrastructure.",
    highlights: [
      "Redesigned and built the Bhatkal Time Luxe storefront, HubZero's first paid client project, end to end on a co-founder's initial UI/UX foundation: architecture, full-stack implementation, database and infrastructure.",
      "Built reusable Blueprint foundations that client work starts from, and manage delivery infrastructure across Cloudflare, Vercel, DNS and Linux.",
      "Shipped the studio's site, hubzero.in.",
    ],
    work: ["bhatkal-time-luxe", "querycraft"],
  },
  {
    id: "rg-smartdiscovery",
    company: "RG SmartDiscovery LLP",
    role: "Software Engineer Intern",
    period: "Aug 2025 – May 2026",
    location: "India · Remote",
    summary: "Frontend development and API integration across nxNearby's job portal and its AI-assisted course and quiz workflows.",
    highlights: [
      "Implemented the quiz-generation interface: prompt controls, multiple question types and editable generated output.",
      "Contributed to chatbot integration, podcast platform testing, UI implementation and debugging.",
    ],
  },
];

export const education = {
  degree: "B.E. Computer Science and Engineering",
  institution: "Anjuman Institute of Technology and Management (AITM), affiliated with Visvesvaraya Technological University (VTU), Belagavi",
  period: "Dec 2022 – Jun 2026",
  cgpa: "8.36 / 10",
  finalYearProject: "querycraft",
  training: "AWS Cloud Practitioner Essentials, Amazon Web Services training course, May 2025 (a foundational course)",
} as const;

/** Each skill points at work where it was used; no skill wall. */
export const skills: { area: string; items: string; evidence: string }[] = [
  { area: "Web and full-stack", items: "TypeScript, React, Next.js, Node.js, Express, REST and GraphQL APIs", evidence: "RG SmartDiscovery, HubZero, Bhatkal Time Luxe, QueryCraft" },
  { area: "Retrieval and local AI", items: "RAG, BM25, embeddings, reciprocal-rank fusion, Ollama", evidence: "Atlas, Nexus" },
  { area: "Desktop and systems", items: "Rust and Tauri 2; Python and FastAPI; C# / .NET and WinUI 3", evidence: "Atlas, Nexus, ExtendSpace" },
  { area: "Android", items: "Kotlin, Kotlin Multiplatform, Jetpack Compose, Glance, Media3", evidence: "Reflux, Layers by RSX, BlueTap, ExtendSpace" },
  { area: "Data", items: "PostgreSQL with pgvector, MongoDB", evidence: "Nexus, QueryCraft, Bhatkal Time Luxe" },
  { area: "Infrastructure", items: "Linux, Docker, NGINX, Cloudflare, Vercel", evidence: "HubZero delivery infrastructure, Nexus (Docker Compose), self-hosted services" },
];

export type ArchiveEntry = { id: string; name: string; period: string; description: string; stack: string[]; source: string };

export const archiveIntro =
  "Earlier experiments, academic projects and an interview exercise. They are here because they happened, not because they represent current work.";

export const archive: ArchiveEntry[] = [
  {
    id: "devpilot",
    name: "DevPilot",
    period: "2025",
    description: "A full-stack project and task management app built as part of an interview selection process: projects, task assignment, collaboration and progress tracking.",
    stack: ["Next.js", "Node.js", "Express", "Prisma", "PostgreSQL"],
    source: "https://github.com/Rifaque/DevPilot",
  },
  {
    id: "zerolink",
    name: "ZeroLink",
    period: "Jul 2025",
    description: "A real-time chat application, built mainly to learn WebSockets and how shared state behaves with several clients.",
    stack: ["Next.js", "WebSockets", "MongoDB", "Firebase"],
    source: "https://github.com/Rifaque/ZeroLink",
  },
  {
    id: "blood-diagnosis",
    name: "Blood Report Disease Diagnosis",
    period: "Oct 2024",
    description: "An academic Flask app wrapping a random forest classifier that flags blood-related conditions from test parameters. Not a clinical tool.",
    stack: ["Python", "Flask", "scikit-learn"],
    source: "https://github.com/Rifaque/Blood-Report-Disease-Diagnosis-App",
  },
  {
    id: "hospital-management",
    name: "Hospital Management System",
    period: "Jun – Jul 2024",
    // The code connects to MySQL (mysql-connector); verified in the repository, 26 Oct 2026.
    description: "A Tkinter desktop app over MySQL for patient records, appointments and staff data. Coursework.",
    stack: ["Python", "Tkinter", "MySQL"],
    source: "https://github.com/Rifaque/Hospital-Management-System",
  },
  {
    id: "college-management",
    name: "College Management App",
    period: "2023",
    description: "An earlier academic desktop application of the same shape.",
    stack: ["Python", "Tkinter", "SQL"],
    source: "https://github.com/Rifaque/College-Management-App",
  },
];

/**
 * The stack switchboard on the homepage. Each switch names a technology and
 * the text it is matched on in the projects' own stack entries, so the
 * projects it lights up always agree with the case studies.
 */
export const stackSwitches = [
  { label: "TypeScript", match: "TypeScript" },
  { label: "React", match: "React" },
  { label: "Next.js", match: "Next.js" },
  { label: "Node.js", match: "Node.js" },
  { label: "Rust · Tauri", match: "Rust" },
  { label: "Python", match: "Python" },
  { label: "FastAPI", match: "FastAPI" },
  { label: "PostgreSQL", match: "PostgreSQL" },
  { label: "MongoDB", match: "MongoDB" },
  { label: "Ollama", match: "Ollama" },
  { label: "Kotlin", match: "Kotlin" },
  { label: "Compose", match: "Compose" },
  { label: "C# / .NET", match: "C# / .NET" },
] as const;

/* ------------------------------------------------------------------ homepage */

/** How I work: the introduction beside the four principles. */
export const bio = [
  "I work across the stack, but the parts I keep returning to are backend architecture and retrieval, and one question under both: how software becomes more capable without becoming less understandable or controllable.",
  "{nexus} is where that goes furthest: an assistant with a hard boundary between what a model may suggest and what is allowed to happen. {atlas} is the released version of the same instinct: index a codebase locally, retrieve well, and decline when the evidence isn't there.",
  "The rest is ordinary product engineering, which matters just as much. Through HubZero, an engineering studio I co-founded, I've delivered paid client software end to end and look after the infrastructure it runs on.",
  "I care about evidence over claims. Most of what I've learned came from being wrong in a way a test suite could not catch.",
] as const;

/**
 * Experience, education and work on one timeline, newest first. Months are
 * 1-based; `to: null` means ongoing. Start dates of BlueTap (Sep 2026),
 * Reflux, ExtendSpace and Layers (Oct 2026) and the degree (Dec 2022 to
 * Jun 2026) were confirmed by the owner on 26 Oct 2026.
 */
export type ChronKind = "Employment" | "Co-founder" | "Personal project" | "Personal projects" | "Collaborative project" | "Client project" | "Education";
export type ChronEntry = {
  kind: ChronKind;
  title: string;
  org: string;
  from: [number, number];
  to: [number, number] | null;
  note: string;
  slug?: string;
  link?: { label: string; href: string };
};

export const chronicle: ChronEntry[] = [
  { kind: "Personal projects", title: "Reflux, ExtendSpace, Layers by RSX", org: "RSX Develops", from: [2026, 10], to: null, note: "All three started at the beginning of October 2026." },
  { kind: "Personal project", title: "BlueTap", org: "RSX Develops", from: [2026, 9], to: null, note: "Started at the end of September 2026. Paused at the pre-Android-17 foundation.", slug: "bluetap" },
  { kind: "Personal project", title: "Nexus", org: "RSX Develops", from: [2026, 6], to: null, note: "Private alpha, actively developing.", slug: "nexus" },
  { kind: "Personal project", title: "Atlas", org: "RSX Develops", from: [2026, 2], to: [2026, 9], note: "v1.0.3 released in September 2026.", slug: "atlas" },
  { kind: "Employment", title: "Software Engineer Intern", org: "RG SmartDiscovery LLP", from: [2025, 8], to: [2026, 5], note: "Frontend development and API integration for nxNearby's job portal and AI-assisted course and quiz workflows." },
  { kind: "Collaborative project", title: "QueryCraft", org: "Final-year project, kept as a HubZero Build", from: [2025, 8], to: [2026, 1], note: "Three-person team; primary technical contributor.", slug: "querycraft" },
  { kind: "Client project", title: "Bhatkal Time Luxe", org: "HubZero", from: [2025, 4], to: [2025, 9], note: "HubZero's first paid client project.", slug: "bhatkal-time-luxe" },
  { kind: "Co-founder", title: "Co-founder & Software Engineer", org: "HubZero", from: [2025, 1], to: null, note: "Architecture, full-stack implementation and delivery infrastructure for an engineering studio I co-founded.", link: { label: "hubzero.in", href: "https://hubzero.in" } },
  { kind: "Education", title: "B.E. Computer Science and Engineering", org: "AITM, affiliated with VTU", from: [2022, 12], to: [2026, 6], note: "CGPA 8.36. AWS Cloud Practitioner Essentials training, May 2025." },
];

/**
 * Archive builds, listed under Projects. Each entry was checked against its
 * repository's code (not only its README) on 26 Oct 2026.
 */
export type ArchiveBuild = { id: string; name: string; meta: string; what: string; tech: string; links: { label: string; href: string }[] };

export const archiveBuilds: ArchiveBuild[] = [
  {
    id: "hubzero-site",
    name: "HubZero website",
    meta: "Nov 2024 to now · Live · HubZero's site",
    what: "HubZero's public site and Studio, the CMS that publishes it, as one application.",
    tech: "Next.js 15 (App Router) and TypeScript with Tailwind CSS. Studio writes to MongoDB through a draft, review and publish workflow; public pages read only published content, through one visibility check; NextAuth guards Studio. I shipped the site, and GitHub records me as its only committer; the site and the work it presents belong to HubZero.",
    links: [
      { label: "hubzero.in", href: "https://hubzero.in/" },
      { label: "Repository", href: "https://github.com/HubZeroHQ/hubzero" },
    ],
  },
  {
    id: "zerolink",
    name: "ZeroLink",
    meta: "Jul 2025 · Experiment · not deployed",
    what: "A small real-time chat app, built in a short burst to learn WebSockets.",
    tech: "A Next.js client and an Express server in TypeScript on the ws library. Firebase ID tokens are checked when a socket connects; users, conversations and messages are stored in MongoDB. Global and direct chats, history on connect, typing indicators, image and video uploads.",
    links: [{ label: "Repository", href: "https://github.com/Rifaque/ZeroLink" }],
  },
  {
    id: "blood-diagnosis",
    name: "Blood Report Disease Diagnosis",
    meta: "Oct 2024 · Academic · archived",
    what: "An academic Flask app that flags possible blood disorders from nine full-blood-count values. Not a diagnostic or clinical tool.",
    tech: "A scikit-learn random forest trained on a small sample dataset (298 rows), a lookup of possible causes for each result, and SQLite accounts that keep a history of predictions.",
    links: [{ label: "Repository", href: "https://github.com/Rifaque/Blood-Report-Disease-Diagnosis-App" }],
  },
  {
    id: "hospital-management",
    name: "Hospital Management System",
    meta: "2024 · Coursework · archived",
    what: "A desktop app for a clinic's front desk: patients, doctors and appointments.",
    tech: "Python and Tkinter over MySQL: patient registration with appointment booking, doctor records, an admin view of patients, doctors and appointments, and clearing completed appointments.",
    links: [{ label: "Repository", href: "https://github.com/Rifaque/Hospital-Management-System" }],
  },
];
