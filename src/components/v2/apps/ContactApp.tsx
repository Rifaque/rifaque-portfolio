import { FiMail, FiMapPin, FiGithub, FiLinkedin, FiFileText } from "react-icons/fi";
import { personalInfo } from "@/data/portfolio";

const ContactApp = () => (
    <div className="space-y-5 p-5">
        <div>
            <h2 className="text-base font-semibold text-foreground">
                {personalInfo.seeking.heading}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                {personalInfo.seeking.body}
            </p>
        </div>

        <a
            href={personalInfo.socials.email}
            className="flex items-center gap-3 rounded-lg border border-foreground/[0.1] p-3 transition-colors hover:border-aurora-teal/35 focus-ring"
        >
            <FiMail className="h-4 w-4 shrink-0 text-aurora-teal" aria-hidden />
            <span className="min-w-0 break-all text-sm text-foreground">
                {personalInfo.email}
            </span>
        </a>

        <p className="flex items-center gap-2 text-xs text-foreground/45">
            <FiMapPin className="h-3.5 w-3.5" aria-hidden />
            {personalInfo.location} · Open to{" "}
            {personalInfo.seeking.openTo.join(", ")}
        </p>

        <div className="flex flex-wrap gap-2">
            <a
                href={personalInfo.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-foreground/[0.1] px-3 py-2 text-xs text-foreground/70 transition-colors hover:text-foreground focus-ring"
            >
                <FiGithub className="h-3.5 w-3.5" aria-hidden /> GitHub
            </a>
            <a
                href={personalInfo.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-foreground/[0.1] px-3 py-2 text-xs text-foreground/70 transition-colors hover:text-foreground focus-ring"
            >
                <FiLinkedin className="h-3.5 w-3.5" aria-hidden /> LinkedIn
            </a>
            <a
                href={personalInfo.resume}
                className="inline-flex items-center gap-2 rounded-lg border border-foreground/[0.1] px-3 py-2 text-xs text-foreground/70 transition-colors hover:text-foreground focus-ring"
            >
                <FiFileText className="h-3.5 w-3.5" aria-hidden /> Resume
            </a>
        </div>
    </div>
);

export default ContactApp;
