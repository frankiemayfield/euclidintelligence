import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DemoProject } from "@/data/demoUniverse";

export const ALL_SCOPE = "all";

interface ScopeSelectorProps {
  /** Label shown when no single project is selected, e.g. "All Active Projects". */
  allLabel: string;
  /** Currently selected project id, or ALL_SCOPE. */
  value: string;
  onChange: (value: string) => void;
  projects: DemoProject[];
  /** Optional right-hand note rendered per project row (lifecycle / stage). */
  noteFor?: (project: DemoProject) => string | undefined;
  className?: string;
  /** Hide the "all" entry for inherently project-specific pages. */
  allowAll?: boolean;
}

/**
 * The one Euclid job-context control. Always rendered top-right of a page header —
 * never in the global navigation bar.
 */
export function ScopeSelector({ allLabel, value, onChange, projects, noteFor, className, allowAll = true }: ScopeSelectorProps) {
  const [query, setQuery] = useState("");
  const selected = projects.find(p => p.id === value);
  const label = selected ? selected.name : allLabel;

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(p => !q || `${p.name} ${p.client} ${p.location}`.toLowerCase().includes(q));
  }, [projects, query]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Project context"
          className={cn(
            "flex max-w-full items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-[12px] font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary",
            className,
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDown size={12} className="shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="odyssey-surface z-[90] w-[300px] p-2 text-[11px]">
        <div className="mb-1 flex items-center gap-2 rounded-lg border border-border/50 px-2 py-1.5">
          <Search size={12} className="shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.stopPropagation()}
            placeholder="Search projects..."
            aria-label="Search projects"
            className="w-full bg-transparent text-[11px] outline-none placeholder:text-muted-foreground"
          />
        </div>
        {allowAll && (
          <button onClick={() => onChange(ALL_SCOPE)}
            className={cn("w-full rounded-lg px-2 py-1.5 text-left font-semibold hover:bg-card/70", value === ALL_SCOPE && "text-primary")}>
            {allLabel}
          </button>
        )}
        {allowAll && <div className="my-1 h-px bg-border/60" />}
        <div className="max-h-[42vh] overflow-y-auto">
          {list.length === 0 && <p className="px-2 py-3 text-muted-foreground">No projects match “{query}”.</p>}
          {list.map(p => (
            <button key={p.id} onClick={() => onChange(p.id)}
              className={cn("flex w-full items-start justify-between gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-card/70", value === p.id && "text-primary")}>
              <span className="min-w-0">
                <span className="block truncate font-semibold">{p.name}</span>
                <span className="block truncate text-[10px] text-muted-foreground">{p.client} · {p.location}</span>
              </span>
              {noteFor?.(p) && <span className="shrink-0 text-[9px] uppercase tracking-wide text-muted-foreground">{noteFor(p)}</span>}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Standard page header: eyebrow + title on the left, job context on the right. */
export function PageHeader({ eyebrow, title, description, right, className }: {
  eyebrow: string; title: string; description?: string; right?: React.ReactNode; className?: string;
}) {
  return (
    <header className={cn("mb-4 flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">{eyebrow}</p>
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {right && <div className="shrink-0 pt-1">{right}</div>}
    </header>
  );
}
