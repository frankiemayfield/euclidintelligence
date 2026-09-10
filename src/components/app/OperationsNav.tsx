import { Link } from "react-router-dom";
import { CalendarRange, Clock3, HardHat } from "lucide-react";
import { cn } from "@/lib/utils";

export type OperationsSection = "projects" | "schedule" | "time";

const ITEMS = [
  { id: "projects", label: "Projects", path: "/operations", icon: HardHat },
  { id: "schedule", label: "Schedule", path: "/schedule", icon: CalendarRange },
  { id: "time", label: "Time Clock", path: "/time", icon: Clock3 },
] as const;

/** Primary company Operations navigation — peer destinations, not toolbar utilities. */
export function OperationsNav({ base, active }: { base: string; active: OperationsSection }) {
  return (
    <nav className="flex flex-wrap items-center gap-1" aria-label="Operations">
      {ITEMS.map(i => (
        <Link key={i.id} to={`${base}${i.path}`} aria-current={active === i.id ? "page" : undefined}
          className={cn("flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-card/50 hover:text-foreground",
            active === i.id && "bg-primary/10 text-primary")}>
          <i.icon size={14} />{i.label}
        </Link>
      ))}
    </nav>
  );
}
