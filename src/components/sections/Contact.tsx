import { FiMail, FiGithub, FiLinkedin, FiFileText } from "react-icons/fi";
import Section, { Reveal } from "@/components/Section";
import { personalInfo } from "@/data/portfolio";

const Contact = () => (
  <Section
    id="contact"
    eyebrow="Contact"
    heading={personalInfo.seeking.heading}
    lede={personalInfo.seeking.body}
  >
    <Reveal>
      <div className="flex flex-col gap-8 border-t border-foreground/[0.1] pt-8 md:flex-row md:items-start md:justify-between md:gap-12">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-foreground/40">
            Email — the whole process
          </p>
          <a
            href={personalInfo.socials.email}
            className="mt-3 inline-flex max-w-full items-center gap-2.5 text-base font-medium text-foreground transition-colors hover:text-aurora-teal focus-ring min-[380px]:text-lg sm:text-2xl"
          >
            <FiMail className="h-5 w-5 shrink-0 text-aurora-teal" aria-hidden />
            <span className="break-all">{personalInfo.email}</span>
          </a>
          <p className="mt-4 text-sm text-foreground/45">
            Based in {personalInfo.location}. Open to{" "}
            {personalInfo.seeking.openTo.join(", ")}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={personalInfo.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-foreground/15 px-4 py-2.5 text-sm text-foreground/85 transition-colors hover:border-aurora-teal/40 hover:text-foreground focus-ring"
          >
            <FiGithub className="h-4 w-4" aria-hidden />
            GitHub
          </a>
          <a
            href={personalInfo.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-foreground/15 px-4 py-2.5 text-sm text-foreground/85 transition-colors hover:border-aurora-teal/40 hover:text-foreground focus-ring"
          >
            <FiLinkedin className="h-4 w-4" aria-hidden />
            LinkedIn
          </a>
          <a
            href={personalInfo.resume}
            className="inline-flex items-center gap-2 rounded-lg border border-foreground/15 px-4 py-2.5 text-sm text-foreground/85 transition-colors hover:border-aurora-teal/40 hover:text-foreground focus-ring"
          >
            <FiFileText className="h-4 w-4" aria-hidden />
            Resume
          </a>
        </div>
      </div>
    </Reveal>
  </Section>
);

export default Contact;
