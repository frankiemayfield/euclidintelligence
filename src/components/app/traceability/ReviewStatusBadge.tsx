import { cn } from "@/lib/utils";

type Status = "Auto-Extracted" | "Needs Review" | "Estimator Confirmed" | "Adjusted by User" | "Manual Override" | "Excluded";

const styles: Record<Status, string> = {
  "Auto-Extracted": "bg-info/10 text-info",
  "Needs Review": "bg-warning/10 text-warning",
  "Estimator Confirmed": "bg-primary/10 text-primary",
  "Adjusted by User": "bg-accent text-accent-foreground",
  "Manual Override": "bg-muted text-muted-foreground",
  "Excluded": "bg-destructive/10 text-destructive",
};

export function ReviewStatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", styles[status], className)}>
      {status}
    </span>
  );
}
