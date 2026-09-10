import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const ITEMS = [
  { id: "overview", label: "Overview", path: "/financials" },
  { id: "inbox", label: "Cost Inbox", path: "/financials/inbox" },
  { id: "projects", label: "Projects", path: "/financials/projects" },
] as const;

export function FinancialsNav({ base, active }: { base: string; active: "overview" | "inbox" | "projects" }) {
  return (
    <nav className="flex items-center gap-1" aria-label="Financials">
      {ITEMS.map(i => (
        <Link key={i.id} to={`${base}${i.path}`}
          aria-current={active === i.id ? "page" : undefined}
          className={cn("rounded-lg px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground", active === i.id && "bg-primary/10 text-primary")}>{i.label}</Link>
      ))}
    </nav>
  );
}
