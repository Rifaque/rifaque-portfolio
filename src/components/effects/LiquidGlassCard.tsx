import { useRef, useState, useCallback, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidGlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  intensity?: "subtle" | "normal" | "strong";
}

const LiquidGlassCard = ({
  children,
  className,
  hover = true,
  intensity = "normal",
  ...props
}: LiquidGlassCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50, angle: 0 });

  const intensityMap = {
    subtle: { tilt: 2, shine: 0.1, glow: 0.08 },
    normal: { tilt: 3, shine: 0.15, glow: 0.12 },
    strong: { tilt: 4, shine: 0.2, glow: 0.18 },
  };

  const config = intensityMap[intensity];

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !hover) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate angle for gradient direction
    const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90;

    // Normalize position to 0-100 for percentage-based positioning
    const normalizedX = (x / rect.width) * 100;
    const normalizedY = (y / rect.height) * 100;

    setMousePos({ x: normalizedX, y: normalizedY, angle });
  }, [hover]);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePos({ x: 50, y: 50, angle: 0 });
  };

  // Calculate subtle 3D tilt
  const tiltX = isHovering ? ((mousePos.y - 50) / 50) * -config.tilt : 0;
  const tiltY = isHovering ? ((mousePos.x - 50) / 50) * config.tilt : 0;

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative rounded-xl overflow-hidden",
        "bg-black/[0.02] dark:bg-white/[0.03] backdrop-blur-xl",
        "border border-black/[0.06] dark:border-white/[0.06]",
        hover && "transition-colors duration-300",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        transformStyle: "preserve-3d",
      }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      {...props}
    >
      {/* Liquid glass shine overlay - follows cursor */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-300 z-10",
          isHovering ? "opacity-100" : "opacity-0"
        )}
        style={{
          background: `
            radial-gradient(
              ellipse 80% 80% at ${mousePos.x}% ${mousePos.y}%,
              hsl(168 84% 49% / ${config.shine}) 0%,
              hsl(258 90% 66% / ${config.shine * 0.6}) 30%,
              transparent 60%
            )
          `,
        }}
      />

      {/* Moving edge highlight */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-300 z-10",
          isHovering ? "opacity-100" : "opacity-0"
        )}
        style={{
          background: `linear-gradient(
            ${mousePos.angle}deg,
            transparent 0%,
            transparent 35%,
            hsl(168 84% 49% / ${config.glow}) 50%,
            transparent 65%,
            transparent 100%
          )`,
        }}
      />

      {/* Refraction effect at edges */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-300 z-10 rounded-xl",
          isHovering ? "opacity-100" : "opacity-0"
        )}
        style={{
          boxShadow: isHovering
            ? `
              inset 0 0 30px hsl(168 84% 49% / ${config.glow}),
              0 0 20px hsl(168 84% 49% / ${config.glow * 0.8}),
              0 0 40px hsl(258 90% 66% / ${config.glow * 0.4})
            `
            : "none",
        }}
      />

      {/* Hover border enhancement */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 z-10"
        )}
        style={{
          border: isHovering
            ? "1px solid hsl(168 84% 49% / 0.25)"
            : "1px solid transparent",
        }}
      />

      {/* Subtle noise texture for glass effect */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none opacity-[0.02] z-10",
          "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"
        )}
      />

      {/* Content */}
      <div className="relative z-20">{children}</div>
    </motion.div>
  );
};

export default LiquidGlassCard;
