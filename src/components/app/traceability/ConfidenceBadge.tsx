import { cn } from "@/lib/utils";

type Level = "High" | "Medium" | "Low";

const styles: Record<Level, string> = {
  High: "bg-primary/10 text-primary",
  Medium: "bg-warning/10 text-warning",
  Low: "bg-destructive/10 text-destructive",
};

export function ConfidenceBadge({ level, className }: { level: Level; className?: string }) {
  return (
    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", styles[level], className)}>
      {level}
    </span>
  );
}
