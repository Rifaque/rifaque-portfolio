import { FiGithub, FiLinkedin, FiMail, FiMapPin } from "react-icons/fi";
import { personalInfo, education } from "@/data/portfolio";

const links = [
    { icon: FiGithub, href: personalInfo.socials.github, label: "GitHub" },
    { icon: FiLinkedin, href: personalInfo.socials.linkedin, label: "LinkedIn" },
    { icon: FiMail, href: personalInfo.socials.email, label: "Email" },
];

const AboutApp = () => (
    <div className="space-y-6 p-6">
        <div>
            <h2 className="text-xl font-semibold text-foreground">{personalInfo.name}</h2>
            <p className="mt-1 text-sm text-aurora-teal">{personalInfo.headline}</p>
            <p className="mt-0.5 text-xs text-foreground/45">{personalInfo.tagline}</p>
        </div>

        <div className="space-y-3">
            {personalInfo.bio.map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground/60">
                    {paragraph}
                </p>
            ))}
        </div>

        <dl className="space-y-1.5 border-t border-foreground/[0.08] pt-4 text-xs text-foreground/50">
            <div className="flex gap-2">
                <dt className="text-foreground/35">Degree</dt>
                <dd>
                    B.E. {education.field}, {education.dates} · CGPA {education.cgpa}
                </dd>
            </div>
            <div className="flex gap-2">
                <dt className="text-foreground/35">University</dt>
                <dd>{education.university}</dd>
            </div>
        </dl>

        <div className="flex items-center gap-2 text-sm text-foreground/50">
            <FiMapPin className="h-4 w-4" aria-hidden />
            <span>{personalInfo.location}</span>
        </div>

        <div className="flex gap-2">
            {links.map(({ icon: Icon, href, label }) => (
                <a
                    key={label}
                    href={href}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-foreground/[0.08] p-2.5 text-sm text-foreground/60 transition-colors hover:border-aurora-teal/30 hover:text-foreground focus-ring"
                >
                    <Icon className="h-4 w-4" aria-hidden /> {label}
                </a>
            ))}
        </div>
    </div>
);

export default AboutApp;
