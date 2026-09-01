import { useEffect, useMemo, useRef } from "react";

const THEME_COLORS: Record<string, [string, string, string]> = {
  default: ["hsl(168 84% 49%)", "hsl(258 90% 66%)", "hsl(330 86% 70%)"],
  sunset: ["hsl(25 95% 53%)", "hsl(0 84% 60%)", "hsl(330 81% 60%)"],
  ocean: ["hsl(187 92% 41%)", "hsl(217 91% 60%)", "hsl(258 90% 66%)"],
  monochrome: ["hsl(0 0% 32%)", "hsl(0 0% 45%)", "hsl(0 0% 64%)"],
};

const alpha = (color: string, a: number) => color.replace(")", ` / ${a})`);

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  themeName?: string;
}

/**
 * Decorative background.
 *
 * The drift is pure CSS so it keeps working when requestAnimationFrame is
 * throttled, costs nothing in JS, and stops automatically under
 * prefers-reduced-motion. Only the optional pointer parallax needs a listener,
 * and it writes two custom properties rather than re-rendering anything.
 */
const AuroraBackground = ({ children, themeName = "default" }: AuroraBackgroundProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const colors = useMemo(
    () => THEME_COLORS[themeName] || THEME_COLORS.default,
    [themeName]
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Coarse pointers have no hover position to track.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    const onMove = (e: MouseEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        root.style.setProperty("--aurora-x", `${x * 18}px`);
        root.style.setProperty("--aurora-y", `${y * 18}px`);
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const blobs = [
    {
      className: "aurora-blob animate-aurora-1",
      style: {
        width: "60vw",
        height: "60vw",
        maxWidth: "800px",
        maxHeight: "800px",
        top: "-20%",
        left: "-10%",
        background: `radial-gradient(ellipse at center, ${alpha(colors[0], 0.08)} 0%, ${alpha(colors[0], 0.04)} 40%, transparent 70%)`,
        filter: "blur(80px)",
      },
    },
    {
      className: "aurora-blob animate-aurora-2",
      style: {
        width: "50vw",
        height: "50vw",
        maxWidth: "700px",
        maxHeight: "700px",
        top: "-10%",
        right: "-15%",
        background: `radial-gradient(ellipse at center, ${alpha(colors[1], 0.06)} 0%, ${alpha(colors[1], 0.03)} 40%, transparent 70%)`,
        filter: "blur(100px)",
      },
    },
    {
      className: "aurora-blob animate-aurora-3",
      style: {
        width: "70vw",
        height: "50vw",
        maxWidth: "900px",
        maxHeight: "600px",
        bottom: "-20%",
        left: "15%",
        background: `radial-gradient(ellipse at center, ${alpha(colors[2], 0.05)} 0%, ${alpha(colors[0], 0.03)} 50%, transparent 70%)`,
        filter: "blur(120px)",
      },
    },
  ];

  return (
    <div
      ref={rootRef}
      /* overflow-x: clip, not hidden: hidden would make this a scroll
         container and break scrollIntoView for every section below it. */
      className="relative min-h-screen overflow-x-clip bg-background"
    >
      <div aria-hidden className="aurora-field">
        {blobs.map((blob, i) => (
          <div key={i} className={blob.className} style={blob.style} />
        ))}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default AuroraBackground;
