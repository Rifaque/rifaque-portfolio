import { FiGithub, FiLinkedin } from "react-icons/fi";
import { personalInfo } from "@/data/portfolio";

const socialLinks = [
  { icon: FiGithub, href: personalInfo.socials.github, label: "GitHub" },
  { icon: FiLinkedin, href: personalInfo.socials.linkedin, label: "LinkedIn" },
];

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Skills", href: "#skills" },
  { name: "GitHub", href: "#github" },
  { name: "Contact", href: "#contact" },
];

const Footer = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="py-12 px-6 border-t border-foreground/[0.05]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo/Name */}
          <div className="text-center md:text-left">
            <p className="text-foreground font-semibold text-lg">{personalInfo.name}</p>
            <p className="text-foreground/40 text-sm mt-1">Full Stack Developer</p>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-wrap justify-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="text-foreground/50 hover:text-foreground aurora-underline text-sm transition-colors"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-foreground/40 hover:text-foreground transition-colors"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-foreground/[0.05] text-center">
          <p className="text-foreground/30 text-sm flex items-center justify-center gap-1">
            Built by {personalInfo.name}
          </p>
          <p className="text-foreground/20 text-xs mt-2">
            Press <code className="px-1 py-0.5 bg-foreground/[0.05] rounded text-foreground/40">`</code> for a surprise
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
