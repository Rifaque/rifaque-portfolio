import { cn } from "@/lib/utils";

interface GlassTextProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  shimmer?: boolean;
}

const GlassText = ({
  children,
  className,
  as: Component = "span",
  shimmer = false,
}: GlassTextProps) => {
  return (
    <Component
      className={cn(
        "relative inline-block",
        shimmer ? "glass-text-shimmer" : "glass-text",
        className
      )}
    >
      {children}
    </Component>
  );
};

export default GlassText;
