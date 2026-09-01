import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveals content on first scroll into view.
 *
 * The animation is CSS; this only decides when to add the class. If the
 * observer never fires — or JS never runs at all — the content stays visible,
 * because the hidden state is scoped to `.js .reveal`.
 */
export const Reveal = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", visible && "is-visible", className)}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
};

interface SectionProps {
  id?: string;
  /** Small monospace label above the heading. */
  eyebrow: string;
  heading: string;
  /** One line of orientation under the heading. */
  lede?: string;
  children: React.ReactNode;
  className?: string;
}

const Section = ({ id, eyebrow, heading, lede, children, className }: SectionProps) => (
  <section
    id={id}
    aria-labelledby={id ? `${id}-heading` : undefined}
    className={cn(
      "rail scroll-mt-24",
      // Vertical rhythm tightens on short viewports (1366x768, landscape
      // phones) so a section header plus its first item still share a screen.
      "py-14 short:py-10 sm:py-20 lg:py-24 2xl:py-32",
      className
    )}
  >
    <div className="rail-inner">
      <Reveal className="mb-9 sm:mb-12 lg:mb-14">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-aurora-teal/80">
          {eyebrow}
        </p>
        <h2
          id={id ? `${id}-heading` : undefined}
          className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground sm:text-4xl 2xl:text-[2.75rem]"
        >
          {heading}
        </h2>
        {lede && (
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-foreground/60 sm:text-base">
            {lede}
          </p>
        )}
      </Reveal>
      {children}
    </div>
  </section>
);

export default Section;
