import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, PlusCircle } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { getProjectRoute, money, projects } from "@/data/demoUniverse";
import { statusFor } from "@/data/scheduleData";
import { lifecycleOf, hasWorkspace } from "@/components/app/ProjectSwitcher";
import { useDemoProject } from "@/hooks/use-demo-project";
import { cn } from "@/lib/utils";

const FILTERS = ["all", "precon", "active", "completed"] as const;
type Filter = (typeof FILTERS)[number];
const FILTER_LABEL: Record<Filter, string> = { all: "All", precon: "Preconstruction", active: "Active", completed: "Completed" };

export default function ProjectsHubPage({ mode = "operations" }: { mode?: "operations" | "precon" }) {
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const navigate = useNavigate();
  const { setProjectId } = useDemoProject();
  const [filter, setFilter] = useState<Filter>("all");
  const precon = mode === "precon";

  const matches = (id: string, lifecycle: string) => {
    if (precon) return statusFor(id).mode !== "active" || lifecycle !== "Complete";
    if (filter === "all") return true;
    if (filter === "active") return statusFor(id).mode === "active";
    if (filter === "completed") return lifecycle === "Complete";
    return statusFor(id).mode !== "active" && lifecycle !== "Complete";
  };

  const open = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)!;
    setProjectId(projectId);
    if (precon) { navigate(getProjectRoute(project, track)); return; }
    if (statusFor(projectId).mode === "active") navigate(`${base}/active/${projectId}/overview`);
    else navigate(getProjectRoute(project, track));
  };

  const list = projects.filter(p => matches(p.id, lifecycleOf(p, track)));

  return (
    <TrackShell>
      <div className="mx-auto w-full max-w-[1250px] p-4 lg:p-7">
        <header className="mb-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">{precon ? "Financials" : "Operations"}</p>
          <h1 className="font-display text-3xl font-semibold">{precon ? "Preconstruction" : track === "sub" ? "Jobs" : "Projects"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {precon
              ? "Projects being scoped, bid, estimated, priced and proposed — the financial baseline of every job."
              : "Every job across its lifecycle — from first plan set to closeout."}
          </p>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div />
          <Link to={track === "sub" ? "/sub/upload" : "/app/new-project"}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            <PlusCircle size={14} />New Project
          </Link>
        </div>

        {!precon && (
          <nav className="mt-3 flex flex-wrap items-center gap-4 border-b border-border/50 pb-2" aria-label="Project lifecycle">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} aria-current={filter === f ? "page" : undefined}
                className={cn("-mb-2.5 border-b-2 border-transparent pb-2 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground",
                  filter === f && "border-primary text-foreground")}>{FILTER_LABEL[f]}</button>
            ))}
          </nav>
        )}

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {list.map(p => {
            const s = statusFor(p.id);
            const lifecycle = lifecycleOf(p, track);
            const a = p.actuals;
            return (
              <button key={p.id} onClick={() => open(p.id)} className="odyssey-surface group rounded-2xl p-5 text-left transition-transform hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold">{p.name}</h2>
                    <p className="text-xs text-muted-foreground">{p.client}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin size={11} />{p.location}</p>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-1 text-[9px] font-bold",
                    lifecycle === "Active Construction" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>{lifecycle}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-4">
                  <div><p className="text-muted-foreground">Stage</p><p className="font-semibold">{s.mode === "active" && !precon ? s.currentPhase : (track === "sub" ? p.subStage : p.builderStage)}</p></div>
                  <div><p className="text-muted-foreground">Status</p><p className="font-semibold">{track === "sub" ? p.subStatus : p.builderStatus}</p></div>
                  <div><p className="text-muted-foreground">{a ? "Revised budget" : "Estimated cost"}</p><p className="font-semibold">{a ? money(a.revisedBudget) : p.builderCost ? money(p.builderCost) : "—"}</p></div>
                  <div><p className="text-muted-foreground">Financials</p><p className="font-semibold">{hasWorkspace("financials", p.id) ? "Live" : "After award"}</p></div>
                </div>

                <p className="mt-4 flex items-center justify-between border-t border-border/45 pt-3 text-[11px] font-semibold text-primary">
                  {precon ? "Open preconstruction" : "Open project"} <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </p>
              </button>
            );
          })}
          {!list.length && <p className="text-sm text-muted-foreground">No projects in this stage yet.</p>}
        </div>
      </div>
    </TrackShell>
  );
}
