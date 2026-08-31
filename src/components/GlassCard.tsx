import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

const GlassCard = ({
  children,
  className,
  hover = true,
  glow = false,
  ...props
}: GlassCardProps) => {
  return (
    <motion.div
      className={cn(
        "relative rounded-xl",
        "bg-black/[0.02] dark:bg-white/[0.03] backdrop-blur-xl",
        "border border-black/[0.06] dark:border-white/[0.06]",
        hover && [
          "transition-all duration-300",
          "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
          "hover:border-aurora-teal/20",
          "hover:shadow-[0_0_30px_hsl(168_84%_49%/0.1),0_0_60px_hsl(258_90%_66%/0.05)]",
        ],
        glow && "animate-glow-pulse",
        className
      )}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
