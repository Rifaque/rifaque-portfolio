import type { ReactNode } from "react";

type Props = { href: string; className?: string; children: ReactNode };

/** An outbound link that says it opens a new tab. */
export function ExternalLink({ href, className, children }: Props) {
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
      <span aria-hidden="true" className="ext-arrow">
        ↗
      </span>
    </a>
  );
}
