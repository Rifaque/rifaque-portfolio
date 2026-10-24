import { useState } from "react";
import { profiles, site } from "../../content/site";
import { ExternalLink } from "../ExternalLink";

export function Contact() {
  const [copied, setCopied] = useState("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied("Email address copied.");
    } catch {
      setCopied(`Copy failed. The address is ${site.email}.`);
    }
  };

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="container contact-inner">
        <h2 id="contact-title" className="h2">
          Get in touch
        </h2>
        <p className="contact-lede">
          I'm open to software engineering roles, remote or with relocation. Email is the quickest way to reach me.
        </p>
        <p className="contact-email">
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
        <div className="contact-actions">
          <button type="button" className="btn" onClick={copy}>
            Copy email
          </button>
          <ExternalLink href={profiles.linkedin} className="btn">
            LinkedIn
          </ExternalLink>
          <ExternalLink href={profiles.github} className="btn">
            GitHub
          </ExternalLink>
          <a href={site.resume} className="btn">
            Resume (PDF)
          </a>
        </div>
        <p className="contact-status" role="status" aria-live="polite">
          {copied}
        </p>
      </div>
    </section>
  );
}
