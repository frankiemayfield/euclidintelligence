import { cn } from "@/lib/utils";

type Method = "Explicitly Labeled" | "Derived from Scale" | "Schedule Verified" | "Assumption Applied";

const styles: Record<Method, string> = {
  "Explicitly Labeled": "bg-primary/10 text-primary",
  "Derived from Scale": "bg-warning/10 text-warning",
  "Schedule Verified": "bg-info/10 text-info",
  "Assumption Applied": "bg-muted text-muted-foreground",
};

export function ExtractionMethodBadge({ method, className }: { method: Method; className?: string }) {
  return (
    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", styles[method], className)}>
      {method}
    </span>
  );
}
