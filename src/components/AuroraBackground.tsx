import { useEffect, useState, useMemo } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const THEME_COLORS: Record<string, [string, string, string]> = {
  default: [
    "hsl(168 84% 49%)", // teal
    "hsl(258 90% 66%)", // purple
    "hsl(330 86% 70%)", // pink
  ],
  sunset: [
    "hsl(25 95% 53%)",  // orange
    "hsl(0 84% 60%)",   // red
    "hsl(330 81% 60%)", // pink
  ],
  ocean: [
    "hsl(187 92% 41%)", // cyan
    "hsl(217 91% 60%)", // blue
    "hsl(258 90% 66%)", // violet
  ],
  monochrome: [
    "hsl(0 0% 32%)",    // gray
    "hsl(0 0% 45%)",    // lighter gray
    "hsl(0 0% 64%)",    // lightest gray
  ],
};

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  themeName?: string;
}

const AuroraBackground = ({ children, themeName = "default" }: AuroraBackgroundProps) => {
  const [mounted, setMounted] = useState(false);

  const colors = useMemo(() => THEME_COLORS[themeName] || THEME_COLORS.default, [themeName]);

  // Mouse position for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for mouse movement
  const springConfig = { damping: 50, stiffness: 100 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Normalize to -1 to 1 range
      const x = (clientX / innerWidth - 0.5) * 2;
      const y = (clientY / innerHeight - 0.5) * 2;

      mouseX.set(x * 20); // Max 20px movement
      mouseY.set(y * 20);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Aurora Blob 1 - Top Left */}
      <motion.div
        key={`blob1-${themeName}`}
        className="fixed pointer-events-none"
        style={{
          x: smoothMouseX,
          y: smoothMouseY,
          width: "60vw",
          height: "60vw",
          maxWidth: "800px",
          maxHeight: "800px",
          top: "-20%",
          left: "-10%",
          background: `radial-gradient(ellipse at center, ${colors[0].replace(")", " / 0.08)")} 0%, ${colors[0].replace(")", " / 0.04)")} 40%, transparent 70%)`,
          filter: "blur(80px)",
        }}
        animate={{
          scale: [1, 1.05, 0.95, 1.02, 1],
          x: [0, 30, -20, 10, 0],
          y: [0, -20, 30, -10, 0],
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Aurora Blob 2 - Top Right */}
      <motion.div
        key={`blob2-${themeName}`}
        className="fixed pointer-events-none"
        style={{
          x: smoothMouseX,
          y: smoothMouseY,
          width: "50vw",
          height: "50vw",
          maxWidth: "700px",
          maxHeight: "700px",
          top: "-10%",
          right: "-15%",
          background: `radial-gradient(ellipse at center, ${colors[1].replace(")", " / 0.06)")} 0%, ${colors[1].replace(")", " / 0.03)")} 40%, transparent 70%)`,
          filter: "blur(100px)",
        }}
        animate={{
          scale: [1, 0.95, 1.08, 0.98, 1],
          x: [0, -40, 20, -15, 0],
          y: [0, 25, -15, 20, 0],
        }}
        transition={{
          duration: 55,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Aurora Blob 3 - Bottom Center */}
      <motion.div
        key={`blob3-${themeName}`}
        className="fixed pointer-events-none"
        style={{
          x: smoothMouseX,
          y: smoothMouseY,
          width: "70vw",
          height: "50vw",
          maxWidth: "900px",
          maxHeight: "600px",
          bottom: "-20%",
          left: "15%",
          background: `radial-gradient(ellipse at center, ${colors[2].replace(")", " / 0.05)")} 0%, ${colors[0].replace(")", " / 0.03)")} 50%, transparent 70%)`,
          filter: "blur(120px)",
        }}
        animate={{
          scale: [1, 1.03, 0.97, 1.05, 1],
          x: [0, 25, -35, 15, 0],
          y: [0, -30, 20, -25, 0],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default AuroraBackground;

