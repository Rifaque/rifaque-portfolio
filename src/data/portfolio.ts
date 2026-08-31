// =========================
// Types
// =========================

export interface Project {
  id: string;
  name: string;
  shortDescription: string;
  hoverDescription: string; // max ~200 chars
  fullDescription: string; // long-form, multi-paragraph
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  image?: string;
  featured: boolean;
  category: "web" | "desktop" | "ai" | "tool";
  dates: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  dates: string;
  location: string;
  shortDescription: string;
  fullDescription: string[];
  technologies: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  dates: string;
  location: string;
  achievements: string[];
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

// =========================
// Personal Info
// =========================

export const personalInfo = {
  name: "Rifaque Ahmed",
  roles: ["AI Systems Engineer", "Backend & Full-Stack Engineer", "RAG/LLM Systems Architect"],
  email: "rifaque.rs@gmail.com",
  phone: "+91 6364282251",
  location: "Bhatkal, Karnataka, India",
  bio: `AI Systems Engineer and Full-Stack Developer with expertise in building intelligent, production-grade systems. I specialize in designing RAG (Retrieval Augmented Generation) pipelines, integrating LLMs into applications, and architecting scalable backend systems.

I work across the full stack—from building React/Next.js interfaces to designing robust Node.js/Fastify backends, implementing vector databases, and creating high-performance indexing systems. Currently developing Atlas, a local-first AI workspace assistant with Tauri, React, Fastify, and LanceDB.

I'm proficient in TypeScript, Python, Rust, Node.js, React, and modern AI/ML workflows. I'm passionate about creating end-to-end systems where AI enhances user productivity while maintaining privacy, performance, and reliability. Experienced in deploying and maintaining production applications on Linux infrastructure with NGINX and Cloudflare.`,
  resume: "/resume/Rifaque-Ahmed-Resume.pdf",
  socials: {
    github: "https://github.com/Rifaque",
    linkedin: "https://linkedin.com/in/rifaque-akrami",
    twitter: "https://twitter.com/rifaque",
    email: "mailto:rifaque.rs@gmail.com",
  },
};

// =========================
// Projects
// =========================

export const projects: Project[] = [
  {
    id: "atlas",
    name: "Atlas",
    shortDescription: "Local-first AI workspace assistant – RAG desktop app with Tauri, React, and Fastify",
    hoverDescription:
      "Privacy-first desktop RAG application. Index codebases and documents locally, query them with local LLMs via Ollama or cloud models via OpenRouter.",
    fullDescription: `Atlas is a sophisticated local-first AI workspace assistant that indexes any folder of code, PDFs, or text files and lets you ask natural language questions about them using locally-running LLMs (via Ollama) or cloud models (via OpenRouter). No file content ever leaves your machine unless you opt into OpenRouter.

The application features a hybrid RAG (Retrieval Augmented Generation) pipeline combining BM25 full-text search with semantic search using embeddings. It uses parent-child text chunking for better context preservation, incremental indexing for performance, and a background file watcher to stay synchronized with your codebase.

Architecturally, Atlas is a monorepo featuring a Tauri 2 desktop shell (Rust) with a React 18 + TypeScript frontend, a Fastify backend powered by Node.js, and embedded vector storage via LanceDB. Internal packages handle chunking, embeddings, RAG prompting, and retrieval logic. The entire system prioritizes privacy, performance, and extensibility—all processing happens locally by default.`,
    technologies: [
      "TypeScript",
      "React 18",
      "Tauri 2",
      "Rust",
      "LanceDB",
      "Ollama",
      "Vite",
      "RAG Pipeline",
    ],
    githubUrl: "https://github.com/Rifaque/atlas",
    image: "/projectscreenshots/atlas-thumbnail.png",
    featured: true,
    category: "ai",
    dates: "Feb 2026 - Present",
  },
  {
    id: "querycraft",
    name: "QueryCraft",
    shortDescription: "Natural language to SQL web app powered by locally hosted LLMs",
    hoverDescription:
      "Full-stack NL2SQL system that converts plain English into safe, executable database queries using locally hosted LLMs.",
    fullDescription: `QueryCraft is a full-stack Natural Language to SQL (NL2SQL) web application designed to bridge the gap between human language and structured databases. The goal of the project is to allow users to query databases using plain English without needing prior SQL knowledge, while maintaining safety, accuracy, and control.

The system uses locally hosted large language models to generate SQL and NoSQL queries, avoiding reliance on external APIs and ensuring better privacy and offline capability. Generated queries pass through a validation layer before execution, helping prevent unsafe or malformed database operations.

From an architectural standpoint, QueryCraft follows a modular design separating prompt logic, query validation, execution, and result formatting. The frontend provides a clean, intuitive interface built with Next.js and TypeScript, while the backend handles query processing and database interactions. The project was developed as a final-year capstone with a strong emphasis on real-world usability and extensibility.`,
    technologies: [
      "Next.js",
      "TypeScript",
      "Node.js",
      "MongoDB",
      "Locally Hosted LLMs",
      "Prompt Engineering",
    ],
    liveUrl: "https://querycraft.hubzero.in",
    githubUrl: "https://github.com/Rifaque/QueryCraft",
    image: "/projectscreenshots/querycraft-thumbnail.png",
    featured: true,
    category: "ai",
    dates: "Jul 2025 - Jan 2026",
  },

  {
    id: "hubzero-website",
    name: "Hub Zero Website",
    shortDescription:
      "Official website built with Next.js, animations, and self-hosted infrastructure",
    hoverDescription:
      "Production website built with Next.js, GSAP animations, and deployed on a self-hosted Ubuntu server using NGINX.",
    fullDescription: `The Hub Zero website is the official web presence of Hub Zero, designed to showcase services, team members, and project work in a clean and engaging way. The site focuses on modern UI design, smooth interactions, and strong performance across devices.

Built using Next.js and Tailwind CSS, the site features modular sections, reusable components, and animated transitions powered by GSAP. Special care was taken to ensure responsiveness, accessibility, and consistent visual hierarchy throughout the experience.

The application is deployed on a self-hosted Ubuntu server using NGINX and secured with Cloudflare, providing full control over the deployment pipeline and performance optimization. I continue to maintain and iterate on the site, handling updates, optimizations, and infrastructure management.`,
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "GSAP",
      "NGINX",
      "Ubuntu",
      "Cloudflare",
    ],
    liveUrl: "https://hubzero.in",
    githubUrl: "https://github.com/Rifaque/HubZero-Next",
    image: "/projectscreenshots/hubzero-thumbnail.png",
    featured: true,
    category: "web",
    dates: "Nov 2024 - Present",
  },

  {
    id: "zerolink",
    name: "ZeroLink",
    shortDescription:
      "Real-time full-stack chat application with WebSocket messaging",
    hoverDescription:
      "Real-time chat app with WebSocket messaging, authentication, and a modern Next.js interface.",
    fullDescription: `ZeroLink is a modern real-time chat application built as a full-stack project to explore real-time communication, authentication, and scalable UI patterns. The application supports instant messaging, typing indicators, and secure user sessions.

The frontend is built with Next.js, TypeScript, and Tailwind CSS, providing a responsive and smooth user experience enhanced with Framer Motion animations. Real-time messaging is handled through WebSockets, enabling low-latency communication between users.

The backend is self-hosted on an Ubuntu server using NGINX and secured through Cloudflare, while the frontend is deployed on Vercel. This project helped solidify my understanding of real-time systems, deployment workflows, and end-to-end application ownership.`,
    technologies: [
      "MongoDB",
      "Express.js",
      "Next.js",
      "Node.js",
      "TypeScript",
      "Socket.io",
      "Tailwind CSS",
      "Framer Motion",
    ],
    liveUrl: "https://zerolink.hubzero.in",
    githubUrl: "https://github.com/Rifaque/ZeroLink",
    image: "/projectscreenshots/zerolink-thumbnail.png",
    featured: true,
    category: "web",
    dates: "Jul 2025",
  },

  {
    id: "ecommerce-store",
    name: "eCommerce Store",
    shortDescription:
      "Luxury eCommerce platform with optimized performance and filtering",
    hoverDescription:
      "Performance-focused eCommerce platform with advanced filtering and optimized image delivery.",
    fullDescription: `This project is a luxury eCommerce platform designed to deliver a smooth and visually polished shopping experience. It includes product listings, advanced filtering, authentication, and shopping cart functionality.

A major focus of the project was performance optimization. Image delivery was optimized using Imgix, resulting in significantly improved load times and better Core Web Vitals. The frontend was built with React, while the backend handles product data and API logic.

The project reflects practical considerations found in real-world eCommerce systems, including scalability, responsiveness, and performance tuning across devices.`,
    technologies: [
      "MongoDB",
      "Express.js",
      "React.js",
      "Node.js",
      "Imgix",
    ],
    githubUrl: "https://github.com/Rifaque/Bhatkal-Time-Luxe",
    image: "/projectscreenshots/ecommerce-thumbnail.png",
    featured: false,
    category: "web",
    dates: "Apr 2025 - May 2025",
  },

  {
    id: "hospital-management",
    name: "Hospital Management System",
    shortDescription:
      "Desktop application for managing hospital records and workflows",
    hoverDescription:
      "Python desktop app for managing hospital records, appointments, and staff data.",
    fullDescription: `The Hospital Management System is a desktop application built to manage patient records, appointments, and staff information in a structured and reliable manner.

Developed using Python and Tkinter, the application provides a simple graphical interface backed by a SQLite database. It supports CRUD operations for core hospital workflows and focuses on data integrity and usability.

This project strengthened my understanding of desktop application development, database integration, and user-focused design outside the web ecosystem.`,
    technologies: ["Python", "Tkinter", "SQLite"],
    githubUrl: "https://github.com/Rifaque/Hospital-Management-System",
    image: "/projectscreenshots/hospital-thumbnail.png",
    featured: false,
    category: "desktop",
    dates: "Jun 2024 - Jul 2024",
  },

  {
    id: "blood-diagnosis",
    name: "Blood Report Disease Diagnosis",
    shortDescription:
      "Machine learning web app for blood disease prediction",
    hoverDescription:
      "ML-based web app that predicts blood-related diseases from test parameters.",
    fullDescription: `This project is a machine learning–based web application that predicts potential blood-related diseases using user-provided blood test parameters.

Built with Flask, the application uses a trained Random Forest model to classify possible conditions based on medical datasets. The project focuses on integrating machine learning models into practical web interfaces.

It was developed as part of an academic initiative and provided hands-on experience with ML workflows, model evaluation, and real-time prediction systems.`,
    technologies: [
      "Python",
      "Flask",
      "Machine Learning",
      "Random Forest",
    ],
    githubUrl:
      "https://github.com/Rifaque/Blood-Report-Disease-Diagnosis-App",
    image: "/projectscreenshots/blood-app-thumbnail.png",
    featured: false,
    category: "ai",
    dates: "Oct 2024",
  },
];


// =========================
// Experience
// =========================

export const experiences: Experience[] = [
  {
    id: "frontend-intern",
    company: "RG SmartDiscovery LLP",
    role: "Frontend Developer Intern",
    dates: "Aug 2025 - Present",
    location: "India (Remote)",
    shortDescription:
      "Building production-ready React interfaces for nxnearby.com",
    fullDescription: [
      "Developing responsive and accessible web interfaces using React.js",
      "Building reusable UI components and optimizing performance across key user flows",
      "Collaborating with design and backend teams to ship features on schedule",
      "Writing clean, maintainable code aligned with modern frontend best practices",
    ],
    technologies: [
      "React",
      "JavaScript",
      "HTML",
      "CSS",
      "API Integration",
    ],
  },
  {
    id: "fullstack-contract",
    company: "Client Projects",
    role: "Full Stack Developer (Contract)",
    dates: "Mar 2025 - Jul 2025",
    location: "Remote",
    shortDescription:
      "Owned development of end-to-end full-stack web applications",
    fullDescription: [
      "Owned the design and development of full-stack web applications using React, Node.js, and MongoDB",
      "Built responsive frontend components and integrated REST APIs",
      "Translated client requirements into scalable technical solutions",
      "Deployed and maintained applications on Linux servers using NGINX",
    ],
    technologies: [
      "React",
      "Node.js",
      "MongoDB",
      "NGINX",
      "Linux",
    ],
  },
];

// =========================
// Education
// =========================

export const education: Education = {
  institution: "Anjuman Institute of Technology and Management",
  degree: "Bachelor of Engineering",
  field: "Computer Science",
  dates: "2022 - 2026",
  location: "Karnataka, India",
  achievements: [
    "Focused on core computer science subjects including Data Structures, DBMS, and Operating Systems",
    "Maintained a strong academic record while actively participating in technical initiatives",
    "Final Year Project: QueryCraft – Natural Language to SQL system using locally hosted LLMs",
  ],
};

// =========================
// Skills
// =========================

export const skillCategories: SkillCategory[] = [
  {
    name: "Languages",
    skills: ["TypeScript", "JavaScript", "Python", "Rust", "Java", "C"],
  },
  {
    name: "Frontend",
    skills: [
      "React",
      "Next.js",
      "Tailwind CSS",
      "HTML",
      "CSS",
      "Framer Motion",
      "GSAP",
      "Vite",
    ],
  },
  {
    name: "Backend & Systems",
    skills: [
      "Node.js",
      "Fastify",
      "Express.js",
      "REST APIs",
      "Socket.io",
      "Python",
      "Flask",
    ],
  },
  {
    name: "AI/ML & RAG",
    skills: [
      "Retrieval Augmented Generation (RAG)",
      "LLM Integration",
      "LanceDB",
      "Vector Databases",
      "Ollama",
      "Embeddings",
    ],
  },
  {
    name: "Databases & Storage",
    skills: ["MongoDB", "SQL", "SQLite", "MySQL", "LanceDB"],
  },
  {
    name: "DevOps, Infrastructure & Tools",
    skills: [
      "Tauri",
      "Rust",
      "NGINX",
      "Linux",
      "Cloudflare",
      "Git",
      "Turborepo",
      "Postman",
      "Figma",
      "VS Code",
      "Docker",
    ],
  },
];

// =========================
// Terminal Commands
// =========================

export const terminalCommands: Record<string, string> = {
  help: `Available commands:
about      - Learn about me
skills     - View my technical skills
projects   - Browse my projects
experience - See my work history
education  - View my education
contact    - Get my contact info
resume     - Download my resume
social     - View social links
clear      - Clear terminal
exit       - Close terminal`,

  about: `Hi, I'm Rifaque 👋

AI Systems Engineer specializing in RAG pipelines and intelligent backend systems.
Building Atlas—a local-first AI workspace assistant with privacy-first design.

Strong in full-stack development, LLM integration, and systems architecture.

Type 'skills' to explore my tech stack.`,

  skills: `Tech Stack:

Languages:  TypeScript, JavaScript, Python, Rust, Java
Frontend:   React, Next.js, Tailwind CSS, Vite, Framer Motion, GSAP
Backend:    Node.js, Fastify, Express.js, REST APIs, Socket.io
AI/ML:      RAG, LLM Integration, LanceDB, Ollama, Embeddings
Database:   MongoDB, SQL, LanceDB
DevOps:     Tauri, Linux, NGINX, Cloudflare, Turborepo

Type 'projects' to see my work.`,

  projects: `Featured Projects:

1. Atlas      - Local-first AI workspace assistant (RAG/LLM)
2. QueryCraft - NL2SQL system using local LLMs
3. Hub Zero   - Official website (Next.js + NGINX)
4. ZeroLink   - Real-time chat app with WebSockets

Type 'experience' for work history.`,

  experience: `Experience:

▸ Frontend Developer Intern @ RG SmartDiscovery LLP
  Aug 2025 - Present | Remote

▸ Full Stack Developer (Contract) @ Client Projects
  Mar 2025 - Jul 2025 | Remote

Type 'education' to continue.`,

  education: `Education:

B.E. in Computer Science
Anjuman Institute of Technology and Management
2022 - 2026

Final Year Project: QueryCraft (NL2SQL)

Type 'contact' to get in touch.`,

  contact: `Contact:

Email: rifaque.rs@gmail.com
Phone: +91 6364282251
Location: Bhatkal, Karnataka, India

Type 'social' for links.`,

  social: `Socials:

GitHub:   github.com/Rifaque
LinkedIn: linkedin.com/in/rifaque-akrami

Type 'resume' to download my resume.`,

  resume: `Downloading resume...

Resume download initiated.`,
};
