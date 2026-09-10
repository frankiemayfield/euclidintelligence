import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const ITEMS = [
  { id: "overview", label: "Overview", path: "/financials" },
  { id: "precon", label: "Preconstruction", path: "/financials/preconstruction" },
  { id: "inbox", label: "Cost Inbox", path: "/financials/inbox" },
  { id: "projects", label: "Project Financials", path: "/financials/projects" },
] as const;

export type FinancialsSection = (typeof ITEMS)[number]["id"];

export function FinancialsNav({ base, active }: { base: string; active: FinancialsSection }) {
  return (
    <nav className="flex flex-wrap items-center gap-1" aria-label="Financials">
      {ITEMS.map(i => (
        <Link key={i.id} to={`${base}${i.path}`}
          aria-current={active === i.id ? "page" : undefined}
          className={cn("rounded-xl px-3.5 py-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-card/50 hover:text-foreground", active === i.id && "bg-primary/10 text-primary")}>{i.label}</Link>
      ))}
    </nav>
  );
}
