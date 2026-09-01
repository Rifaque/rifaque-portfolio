import { useState } from "react";
import { Link } from "react-router-dom";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import { personalInfo } from "@/data/portfolio";
import ShutdownTransition from "@/components/ShutdownTransition";

const socialLinks = [
  { icon: FiGithub, href: personalInfo.socials.github, label: "GitHub" },
  { icon: FiLinkedin, href: personalInfo.socials.linkedin, label: "LinkedIn" },
  { icon: FiMail, href: personalInfo.socials.email, label: "Email" },
];

const Footer = () => {
  const [booting, setBooting] = useState(false);

  return (
    <footer className="rail border-t border-foreground/[0.07] py-10 pb-[calc(2.5rem+var(--safe-bottom))] sm:py-12">
      <div className="rail-inner flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-sm text-foreground">
            rifaque<span className="text-foreground/40">.ahmed</span>
          </p>
          <p className="mt-1 text-sm text-foreground/40">
            {personalInfo.headline}
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            to="/archive"
            className="tap-target text-sm text-foreground/50 transition-colors hover:text-foreground focus-ring"
          >
            Archive
          </Link>
          <button
            type="button"
            onClick={() => setBooting(true)}
            className="tap-target text-sm text-foreground/50 transition-colors hover:text-foreground focus-ring"
          >
            Desktop
          </button>
          <div className="flex items-center gap-1">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="rounded-md p-2.5 text-foreground/40 transition-colors hover:text-foreground focus-ring"
              >
                <span className="sr-only">{label}</span>
                <Icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>
        </nav>
      </div>

      <div className="rail-inner mt-10 border-t border-foreground/[0.05] pt-6">
        <p className="text-xs text-foreground/30">
          Built by {personalInfo.name}. Every claim on this page is traceable to
          source, a live deployment, or a repository.
        </p>
        <p className="mt-2 text-xs text-foreground/20">
          Press{" "}
          <kbd className="rounded border border-foreground/10 px-1.5 py-0.5 font-mono text-foreground/40">
            `
          </kbd>{" "}
          for a terminal.
        </p>
      </div>
      {booting && <ShutdownTransition />}
    </footer>
  );
};

export default Footer;
