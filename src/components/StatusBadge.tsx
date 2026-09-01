import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/data/portfolio";

const toneStyles: Record<ProjectStatus["tone"], string> = {
  active: "border-aurora-teal/35 text-aurora-teal bg-aurora-teal/[0.07]",
  released: "border-emerald-400/30 text-emerald-300/90 bg-emerald-400/[0.06]",
  client: "border-aurora-purple/35 text-aurora-purple bg-aurora-purple/[0.07]",
  retired: "border-foreground/15 text-foreground/50 bg-foreground/[0.03]",
  exercise: "border-foreground/15 text-foreground/50 bg-foreground/[0.03]",
};

const StatusBadge = ({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium leading-none",
      toneStyles[status.tone],
      className
    )}
  >
    {status.tone === "active" && (
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full bg-aurora-teal motion-safe:animate-pulse"
      />
    )}
    {status.label}
  </span>
);

export default StatusBadge;
