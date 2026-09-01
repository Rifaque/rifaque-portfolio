import { FiGithub, FiLinkedin, FiMail, FiArrowDown, FiFileText } from "react-icons/fi";
import { personalInfo, signatureProjects, experiences } from "@/data/portfolio";

const socialLinks = [
  { icon: FiGithub, href: personalInfo.socials.github, label: "GitHub" },
  { icon: FiLinkedin, href: personalInfo.socials.linkedin, label: "LinkedIn" },
  { icon: FiMail, href: personalInfo.socials.email, label: "Email" },
];

/** Real current state, not a stat wall. Three rows, all verifiable. */
const nowRows = [
  ...signatureProjects.map((p) => ({ name: p.name, detail: p.status.label })),
  {
    name: experiences[0].company,
    detail: `${experiences[0].role} · ${experiences[0].dates}`,
  },
];

/** CSS-driven stagger. See `.rise` in index.css for why this is not JS. */
const rise = (delay: number) => ({ style: { animationDelay: `${delay}s` } });

const Hero = () => (
  <section
    className={[
      "rail relative",
      // Top padding clears the fixed header and respects a notch. It drops
      // hard on short viewports so a 1366x768 laptop and a landscape phone
      // still get the headline, the intro and the CTAs above the fold.
      "pt-[calc(var(--header-h)+3.5rem+var(--safe-top))]",
      "sm:pt-[calc(var(--header-h)+5rem+var(--safe-top))]",
      "lg:pt-[calc(var(--header-h)+7rem+var(--safe-top))]",
      // Short and landscape viewports override the width-based padding above.
      "short:pt-[calc(var(--header-h)+1.25rem+var(--safe-top))]",
      "short:sm:pt-[calc(var(--header-h)+2.25rem+var(--safe-top))]",
      "squat:pt-[calc(var(--header-h)+1rem+var(--safe-top))]",
      "squat:sm:pt-[calc(var(--header-h)+1rem+var(--safe-top))]",
      "pb-14 sm:pb-20 lg:pb-24 short:pb-10 squat:pb-8",
    ].join(" ")}
  >
    <div
      className={[
        "rail-inner grid gap-10",
        // Tablets get the two-column composition too, not a stretched phone
        // layout — there is room for the status rail from 768 up.
        "md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:gap-10",
        "lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-16 2xl:gap-24",
        // A landscape phone is wide enough for two columns even though it is
        // far too short to stack them.
        "squat:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] squat:gap-8",
      ].join(" ")}
    >
      <div className="min-w-0 max-w-3xl">
        <p
          {...rise(0)}
          className="rise font-mono text-xs uppercase tracking-[0.2em] text-aurora-teal/80"
        >
          {personalInfo.name}
        </p>

        <h1
          {...rise(0.08)}
          className="rise mt-4 text-[1.95rem] font-semibold leading-[1.08] tracking-tight text-foreground min-[400px]:text-[2.25rem] sm:mt-5 sm:text-5xl lg:text-6xl 2xl:text-7xl short:mt-3 short:lg:text-5xl squat:!mt-2 squat:!text-[1.75rem]"
        >
          {personalInfo.headline}
        </h1>

        <p
          {...rise(0.14)}
          className="rise mt-3 text-base text-foreground/50 sm:mt-4 sm:text-xl 2xl:text-2xl squat:!mt-1.5 squat:!text-sm"
        >
          {personalInfo.tagline}
        </p>

        <p
          {...rise(0.2)}
          className="rise mt-6 max-w-2xl text-[0.95rem] leading-relaxed text-foreground/70 sm:mt-8 sm:text-lg 2xl:text-xl short:mt-3 short:sm:mt-5 squat:!mt-3 squat:!text-sm"
        >
          {personalInfo.intro}
        </p>

        <div
          {...rise(0.26)}
          className="rise mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center short:mt-4 squat:!mt-4 squat:flex-row squat:flex-wrap squat:items-center"
        >
          <a
            href="#work"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-aurora-teal/40 bg-aurora-teal/[0.08] px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-aurora-teal/[0.14] focus-ring"
          >
            See the work
            <FiArrowDown className="h-4 w-4" aria-hidden />
          </a>
          <a
            href={personalInfo.socials.email}
            className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border border-foreground/15 px-5 py-3 text-sm font-medium text-foreground/85 transition-colors hover:border-foreground/30 hover:text-foreground focus-ring"
          >
            <FiMail className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{personalInfo.email}</span>
          </a>
          <a
            href={personalInfo.resume}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-2 py-3 text-sm text-foreground/55 transition-colors hover:text-foreground focus-ring sm:px-3"
          >
            <FiFileText className="h-4 w-4" aria-hidden />
            Resume
          </a>
        </div>

        <div
          {...rise(0.32)}
          className="rise mt-8 flex items-center gap-1 sm:mt-10 short:mt-5 squat:!mt-3"
        >
          {socialLinks.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              className="rounded-md p-2.5 text-foreground/45 transition-colors hover:text-foreground focus-ring"
            >
              <span className="sr-only">{label}</span>
              <Icon className="h-5 w-5" aria-hidden />
            </a>
          ))}
        </div>
      </div>

      {/* Current state, pulled from the same data the rest of the page uses. */}
      <aside
        {...rise(0.38)}
        aria-label="Current status"
        className="rise min-w-0 self-end border-t border-foreground/[0.1] pt-6 md:border-l md:border-t-0 md:pb-2 md:pl-8 md:pt-1 lg:pl-12 squat:self-start squat:border-l squat:border-t-0 squat:pl-6 squat:pt-0"
      >
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/35">
          Right now
        </p>
        <dl className="mt-4 space-y-4 sm:mt-5 squat:!mt-3 squat:space-y-2">
          {nowRows.map((row) => (
            <div key={row.name}>
              <dt className="text-sm font-medium text-foreground/85">{row.name}</dt>
              <dd className="mt-0.5 text-sm text-foreground/45">{row.detail}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  </section>
);

export default Hero;
