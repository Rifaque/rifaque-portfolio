/**
 * Older work. Descriptions match each repository's own description; nothing
 * beyond that is claimed. Dead deployment URLs (devpilot.hubzero.in,
 * zerolink.hubzero.in) are deliberately not linked.
 */

export type ArchiveEntry = {
  id: string;
  name: string;
  period: string;
  description: string;
  stack: string[];
  source: string;
};

export const archiveIntro =
  "Earlier experiments, academic projects and an interview exercise. They are here because they happened, not because they represent current work.";

export const archive: ArchiveEntry[] = [
  {
    id: "devpilot",
    name: "DevPilot",
    period: "2025",
    description:
      "A full-stack project and task management app built as part of an interview selection process: projects, task assignment, collaboration and progress tracking.",
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
    description:
      "An academic Flask app wrapping a random forest classifier that flags blood-related conditions from test parameters. Not a clinical tool.",
    stack: ["Python", "Flask", "scikit-learn"],
    source: "https://github.com/Rifaque/Blood-Report-Disease-Diagnosis-App",
  },
  {
    id: "hospital-management",
    name: "Hospital Management System",
    period: "Jun – Jul 2024",
    description: "A Tkinter desktop app over SQLite for patient records, appointments and staff data. Coursework.",
    stack: ["Python", "Tkinter", "SQLite"],
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
