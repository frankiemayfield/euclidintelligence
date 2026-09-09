import { useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, Filter, GanttChartSquare, Layers, List, Lock, LockOpen, MoreHorizontal, Plus, Route, Search, Send, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarView } from "./CalendarView";
import { GanttView } from "./GanttView";
import { ListView } from "./ListView";
import { TimelineView } from "./TimelineView";
import { TaskDrawer } from "./TaskDrawer";
import { phasesFor, scheduleTemplates, statusFor, tasksFor, TODAY, type ScheduleTask } from "@/data/scheduleData";

type View = "Calendar" | "List" | "Gantt" | "Timeline";
const viewIcons = { Calendar: CalendarDays, List, Gantt: GanttChartSquare, Timeline: Route };

export function ScheduleModule({ projectId, projectName, scopeCompanyId }: { projectId: string; projectName: string; scopeCompanyId?: string }) {
  const status = statusFor(projectId);
  const key = `euclid-schedule-view-${projectId}`;
  const [view, setViewState] = useState<View>(() => (localStorage.getItem(key) as View) || "Gantt");
  const setView = (v: View) => { setViewState(v); localStorage.setItem(key, v); };
  const [critical, setCritical] = useState(false);
  const [baseline, setBaseline] = useState(false);
  const [showPhases, setShowPhases] = useState(true);
  const [locked, setLocked] = useState(status.locked);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [flags, setFlags] = useState({ criticalOnly: false, delayedOnly: false, milestones: false, inspections: false });
  const [selected, setSelected] = useState<ScheduleTask | null>(null);
  const [published, setPublished] = useState(status.published);

  const phases = phasesFor(projectId);
  const all = useMemo(() => {
    const base = tasksFor(projectId);
    return scopeCompanyId ? base.filter(t => t.companyId === scopeCompanyId) : base;
  }, [projectId, scopeCompanyId]);

  const companies = useMemo(() => Array.from(new Set(all.map(t => t.assignee))), [all]);

  const tasks = useMemo(() => all.filter(t =>
    (!search || t.title.toLowerCase().includes(search.toLowerCase())) &&
    (phaseFilter === "All" || t.phaseId === phaseFilter) &&
    (statusFilter === "All" || t.status === statusFilter) &&
    (companyFilter === "All" || t.assignee === companyFilter) &&
    (!flags.criticalOnly || t.critical) &&
    (!flags.delayedOnly || t.status === "Delayed") &&
    (!flags.milestones || t.milestone) &&
    (!flags.inspections || t.category === "inspection")
  ), [all, search, phaseFilter, statusFilter, companyFilter, flags]);

  if (status.mode === "none" || !all.length) {
    return (
      <div className="odyssey-surface rounded-2xl p-10 text-center">
        <CalendarDays className="mx-auto mb-3 text-muted-foreground" />
        <h2 className="font-display text-lg font-semibold">Construction schedule has not started yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{projectName} is still in preconstruction. Create a schedule now or generate one from a Mayfield template.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Create Schedule</button>
          <button className="rounded-full border border-border/60 px-4 py-2 text-xs font-semibold">Build From Template</button>
        </div>
        <div className="mx-auto mt-6 grid max-w-2xl gap-2 sm:grid-cols-2">
          {scheduleTemplates.map(t => (
            <div key={t.id} className="rounded-xl border border-border/50 p-3 text-left">
              <p className="text-xs font-semibold">{t.name}</p>
              <p className="text-[10px] text-muted-foreground">{t.phases} phases · {t.tasks} tasks — {t.note}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const Chip = ({ on, onClick, icon: Icon, label }: { on: boolean; onClick: () => void; icon: React.ElementType; label: string }) => (
    <button onClick={onClick} className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
      on ? "border-primary/50 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground")}>
      <Icon size={12} />{label}
    </button>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* toolbar */}
      <div className="odyssey-surface flex flex-wrap items-center gap-2 rounded-2xl px-3 py-2.5">
        <div className="flex rounded-full bg-muted/70 p-0.5">
          {(Object.keys(viewIcons) as View[]).map(v => {
            const Icon = viewIcons[v];
            return <button key={v} onClick={() => setView(v)} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold", view === v && "bg-card shadow-sm")}><Icon size={12} />{v}</button>;
          })}
        </div>
        <div className="relative min-w-[150px] flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search schedule..." className="w-full rounded-full border border-border/60 bg-transparent py-1.5 pl-8 pr-3 text-[11px] outline-none focus:border-primary/50" />
        </div>
        <Chip on={filtersOpen} onClick={() => setFiltersOpen(v => !v)} icon={Filter} label="Filter" />
        <Chip on={critical} onClick={() => setCritical(v => !v)} icon={AlertTriangle} label="Critical Path" />
        <Chip on={baseline} onClick={() => setBaseline(v => !v)} icon={Layers} label="Baseline" />
        <Chip on={showPhases} onClick={() => setShowPhases(v => !v)} icon={Layers} label="Phases" />
        <button onClick={() => { if (locked) { if (window.confirm("Unlock schedule for editing?\n\nThis protects a published/approved schedule.")) setLocked(false); } else setLocked(true); }}
          className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold", locked ? "border-warning/50 bg-warning/10 text-warning" : "border-success/50 bg-success/10 text-success")}>
          {locked ? <Lock size={12} /> : <LockOpen size={12} />}{locked ? "Schedule Locked" : "Editing Enabled"}
        </button>
        <button disabled={locked} className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground disabled:opacity-40"><Plus size={12} />New Item</button>
        <button className="rounded-full border border-border/60 p-1.5 text-muted-foreground"><MoreHorizontal size={13} /></button>
      </div>

      {/* status ribbon */}
      <div className="odyssey-surface flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-2xl px-4 py-2.5 text-[11px]">
        <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold", published ? "bg-success/15 text-success" : "bg-warning/20 text-warning")}>{published ? "Published" : "Draft"}</span>
        <span className="text-muted-foreground">{status.label}</span>
        <span className="text-muted-foreground">Forecast completion <b className="text-foreground">{status.forecastFinish}</b></span>
        <span className="text-muted-foreground">Baseline <b className="text-foreground">{status.baselineFinish}</b></span>
        <span className={cn(status.variance > 0 ? "text-warning" : "text-success")}>Variance {status.variance > 0 ? `+${status.variance} days` : "on baseline"}</span>
        <span className="text-muted-foreground">{tasks.length} activities shown</span>
        {status.unpublishedChanges > 0 && (
          <span className="ml-auto flex items-center gap-2">
            <span className="text-warning">{status.unpublishedChanges} unpublished schedule changes</span>
            <button onClick={() => setPublished(true)} className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground"><Send size={10} />Publish Changes</button>
          </span>
        )}
      </div>

      {filtersOpen && (
        <div className="odyssey-surface flex flex-wrap items-center gap-2 rounded-2xl px-4 py-3 text-[11px]">
          {[["Phase", phaseFilter, setPhaseFilter, ["All", ...phases.map(p => p.id)], (v: string) => phases.find(p => p.id === v)?.name ?? v],
            ["Status", statusFilter, setStatusFilter, ["All", "Not Started", "Ready", "In Progress", "Complete", "Delayed", "Blocked"], (v: string) => v],
            ["Company", companyFilter, setCompanyFilter, ["All", ...companies], (v: string) => v]].map(([label, value, setter, options, render]) => (
            <label key={label as string} className="flex items-center gap-1.5">
              <span className="text-muted-foreground">{label as string}</span>
              <select value={value as string} onChange={e => (setter as (v: string) => void)(e.target.value)} className="rounded-full border border-border/60 bg-transparent px-2 py-1 text-[11px] outline-none">
                {(options as string[]).map(o => <option key={o} value={o}>{(render as (v: string) => string)(o)}</option>)}
              </select>
            </label>
          ))}
          {([["criticalOnly", "Critical only"], ["delayedOnly", "Delayed only"], ["milestones", "Milestones"], ["inspections", "Inspections"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setFlags(f => ({ ...f, [k]: !f[k] }))}
              className={cn("rounded-full border px-2.5 py-1 font-semibold", flags[k] ? "border-primary/50 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground")}>{l}</button>
          ))}
        </div>
      )}

      {view === "Gantt" && <GanttView tasks={tasks} phases={phases} showBaseline={baseline} showCritical={critical} showPhases={showPhases} locked={locked} selectedId={selected?.id} onSelect={setSelected} />}
      {view === "List" && <ListView tasks={tasks} phases={phases} showBaseline={baseline} showCritical={critical} selectedId={selected?.id} onSelect={setSelected} />}
      {view === "Calendar" && <CalendarView tasks={tasks} anchor={status.mode === "active" ? TODAY : status.currentStart} selectedId={selected?.id} onSelect={setSelected} />}
      {view === "Timeline" && <TimelineView tasks={tasks} phases={phases} onSelect={setSelected} />}

      <TaskDrawer task={selected} locked={locked} onClose={() => setSelected(null)} />
    </div>
  );
}
