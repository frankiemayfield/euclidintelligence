import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const ITEMS = [
  { id: "overview", label: "Overview", path: "/financials" },
  { id: "inbox", label: "Cost Inbox", path: "/financials/inbox" },
  { id: "projects", label: "Projects", path: "/financials/projects" },
] as const;

const FUTURE = ["A/R", "A/P", "Cash Flow", "Reports"];

export function FinancialsNav({ base, active }: { base: string; active: "overview" | "inbox" | "projects" }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 border-b border-border/50 pb-2">
      {ITEMS.map(i => (
        <Link key={i.id} to={`${base}${i.path}`}
          className={cn("rounded-full px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground", active === i.id && "bg-card/70 text-foreground shadow-sm")}>{i.label}</Link>
      ))}
      {FUTURE.map(f => <span key={f} className="rounded-full px-3 py-1.5 text-[12px] text-muted-foreground/40" title="Coming soon">{f}</span>)}
    </nav>
  );
}
