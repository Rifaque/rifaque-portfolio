/**
 * Professional history. The resume (Oct 2026) is the source of truth here;
 * wording follows it closely and adds nothing it does not support.
 */

export type Experience = {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
  url?: string;
  /** Case-study slugs nested under this role. */
  work?: string[];
};

export const experiences: Experience[] = [
  {
    id: "hubzero",
    company: "HubZero",
    role: "Co-founder & Software Engineer",
    period: "Jan 2025 – present",
    location: "Bhatkal, India",
    summary:
      "An engineering studio I co-founded. I work across its architecture, full-stack implementation and delivery infrastructure.",
    highlights: [
      "Delivered HubZero's first paid client project, Bhatkal Time Luxe, across architecture and full-stack development, with the frontend on Vercel and the backend on a self-hosted Ubuntu server.",
      "Built reusable Blueprint foundations that client work starts from, and manage delivery infrastructure across Cloudflare, Vercel, DNS and Linux.",
      "Shipped the studio's site, hubzero.in.",
    ],
    url: "https://hubzero.in",
    work: ["bhatkal-time-luxe", "querycraft"],
  },
  {
    id: "rg-smartdiscovery",
    company: "RG SmartDiscovery LLP",
    role: "Software Engineer Intern",
    period: "Aug 2025 – May 2026",
    location: "India · Remote",
    summary:
      "Frontend development and API integration across nxNearby's job portal and its AI-assisted course and quiz workflows.",
    highlights: [
      "Implemented the quiz-generation interface: prompt controls, multiple question types and editable generated output.",
      "Contributed to chatbot integration, podcast platform testing, UI implementation and debugging.",
    ],
  },
];

export const education = {
  degree: "B.E. Computer Science and Engineering",
  institution: "AITM, affiliated with Visvesvaraya Technological University (VTU), Belagavi",
  period: "2022 – 2026",
  cgpa: "8.36 / 10",
  finalYearProject: "querycraft",
  training: "AWS Cloud Practitioner Essentials (Amazon Web Services training course), May 2025",
} as const;

/** What the work above has in common, in plain terms. */
export const perspective = [
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
