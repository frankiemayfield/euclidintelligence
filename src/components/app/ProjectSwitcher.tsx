import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import { useDemoProject } from "@/hooks/use-demo-project";
import { useIsMobile } from "@/hooks/use-mobile";
import { getProjectRoute, type DemoProject } from "@/data/demoUniverse";
import { financialProjectIds } from "@/data/financialData";
import { statusFor } from "@/data/scheduleData";
import { cn } from "@/lib/utils";

export type ProjectPillar = "precon" | "operations" | "financials";

const PILLAR_LABEL: Record<ProjectPillar, string> = {
  precon: "Preconstruction",
  operations: "Operations",
  financials: "Financials",
};

/** A project only has a pillar workspace when the shared dataset actually holds that data. */
export function hasWorkspace(pillar: ProjectPillar, projectId: string) {
  if (pillar === "financials") return financialProjectIds.includes(projectId);
  if (pillar === "operations") return statusFor(projectId).mode !== "none";
  return true;
}

export function lifecycleOf(project: DemoProject, track: "builder" | "sub") {
  if (statusFor(project.id).mode === "active") return "Active Construction";
  const status = track === "sub" ? project.subStatus : project.builderStatus;
  if (/ready|proposal/i.test(status)) return "Proposal Ready";
  if (/hold/i.test(status)) return "On Hold";
  if (/complete/i.test(status)) return "Complete";
  return "Preconstruction";
}

const GROUP_ORDER = ["Active Construction", "Preconstruction", "Proposal Ready", "On Hold", "Complete"];

interface Props {
  /** Project currently in context. */
  projectId: string;
  pillar: ProjectPillar;
  /** Current local tool/tab; preserved when the project changes. */
  tool?: string;
  /** Compact rendering for the estimator sidebar. */
  compact?: boolean;
  subtitle?: string;
  className?: string;
}

export function ProjectSwitcher({ projectId, pillar, tool, compact = false, subtitle, className }: Props) {
  const { projects, setProjectId, track } = useDemoProject();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [blocked, setBlocked] = useState<DemoProject | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = projects.find(p => p.id === projectId) ?? projects[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(p => !q || `${p.name} ${p.client} ${p.location}`.toLowerCase().includes(q));
  }, [projects, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, DemoProject[]>();
    filtered.forEach(p => {
      const key = lifecycleOf(p, track);
      map.set(key, [...(map.get(key) ?? []), p]);
    });
    return GROUP_ORDER.filter(g => map.has(g)).map(g => [g, map.get(g)!] as const);
  }, [filtered, track]);

  const flat = useMemo(() => grouped.flatMap(([, items]) => items), [grouped]);

  useEffect(() => { if (open) { setQuery(""); setCursor(0); setBlocked(null); setTimeout(() => inputRef.current?.focus(), 20); } }, [open]);
  useEffect(() => { setCursor(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (!containerRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const routeFor = (id: string) => {
    const base = track === "sub" ? "/sub" : "/app";
    if (pillar === "financials") return `${base}/financials/${id}/${tool ?? "budget"}`;
    if (pillar === "operations") return `${base}/active/${id}/${tool ?? "overview"}`;
    return location.pathname;
  };

  const choose = (project: DemoProject) => {
    if (!hasWorkspace(pillar, project.id)) { setBlocked(project); return; }
    setProjectId(project.id);
    setOpen(false);
    navigate(routeFor(project.id));
  };

  const openPrecon = (project: DemoProject) => {
    setProjectId(project.id);
    setOpen(false);
    navigate(getProjectRoute(project, track));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, flat.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === "Enter" && flat[cursor]) { e.preventDefault(); choose(flat[cursor]); }
  };

  const list = (
    <div className="flex max-h-[60vh] flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
        <Search size={14} className="shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search projects..."
          aria-label="Search projects"
          className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
        />
      </div>

      {blocked ? (
        <div className="p-4">
          <p className="text-xs leading-relaxed text-foreground">
            {blocked.name} is still in Preconstruction and does not yet have {pillar === "financials" ? "financial controls" : `an ${PILLAR_LABEL[pillar]} workspace`}.
            {pillar === "financials" && " Financial controls are created when the project is handed off from Preconstruction."}
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => openPrecon(blocked)} className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">Open Preconstruction</button>
            <button onClick={() => setBlocked(null)} className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground">Choose another project</button>
          </div>
        </div>
      ) : (
        <div className="overflow-y-auto py-1">
          {grouped.length === 0 && <p className="px-3 py-4 text-[11px] text-muted-foreground">No projects match “{query}”.</p>}
          {grouped.map(([group, items]) => (
            <div key={group}>
              <p className="px-3 pb-1 pt-2 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{group}</p>
              {items.map(project => {
                const index = flat.indexOf(project);
                const available = hasWorkspace(pillar, project.id);
                return (
                  <button
                    key={project.id}
                    onMouseEnter={() => setCursor(index)}
                    onClick={() => choose(project)}
                    className={cn(
                      "flex w-full items-start justify-between gap-3 px-3 py-2 text-left transition-colors",
                      index === cursor && "bg-primary/10",
                      project.id === current.id && "text-primary",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold">{project.name}</span>
                      <span className="block truncate text-[10px] text-muted-foreground">{project.client} · {project.location}</span>
                    </span>
                    <span className={cn("shrink-0 text-[9px] font-semibold uppercase tracking-wide", available ? "text-muted-foreground" : "text-muted-foreground/50")}>
                      {lifecycleOf(project, track)}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className={cn("relative", compact && "w-full", className)}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "group flex items-center gap-1.5 text-left transition-colors",
          compact ? "w-full text-[12px] font-semibold text-foreground hover:text-primary" : "font-display text-2xl font-semibold text-foreground hover:text-primary",
        )}
      >
        <span className={cn(compact && "truncate")}>{current.name}</span>
        <ChevronDown size={compact ? 13 : 18} className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
      </button>
      {!compact && subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}

      {open && (isMobile ? (
        <div className="fixed inset-x-0 bottom-0 z-[120] rounded-t-2xl border-t border-border bg-card p-1 shadow-2xl">
          {list}
        </div>
      ) : (
        <div className="odyssey-popover absolute left-0 top-full z-[110] mt-2 w-[320px] overflow-hidden">
          {list}
        </div>
      ))}
    </div>
  );
}

/** Compact switcher for the Preconstruction sidebar: switching keeps the current tool. */
export function SidebarProjectSwitcher() {
  const { project } = useDemoProject();
  return <ProjectSwitcher projectId={project.id} pillar="precon" compact />;
}
