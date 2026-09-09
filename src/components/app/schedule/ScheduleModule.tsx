import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CalendarRange, Filter, GanttChartSquare, List, Lock, LockOpen, MoreHorizontal, Plus, Route, Search, Send, Settings2, SlidersHorizontal, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarView } from "./CalendarView";
import { GanttView, type GanttOptions } from "./GanttView";
import { ListView } from "./ListView";
import { TimelineView } from "./TimelineView";
import { TaskDrawer } from "./TaskDrawer";
import { LookAheadPanel } from "./LookAheadPanel";
import { Dropdown, DropdownSelect, DropdownToggle } from "@/components/app/active/Dropdown";
import { columnDefs, defaultColumns, defaultListColumns, type ColumnKey, type ZoomLevel } from "./scheduleColumns";
import { fmtLong, lookAheadTasks, phasesFor, scheduleHealth, scheduleTemplates, statusFor, tasksFor, TODAY, type ScheduleTask } from "@/data/scheduleData";

type View = "Calendar" | "List" | "Gantt" | "Timeline";
const viewIcons = { Calendar: CalendarDays, List, Gantt: GanttChartSquare, Timeline: Route };

export function ScheduleModule({ projectId, projectName, scopeCompanyId }: { projectId: string; projectName: string; scopeCompanyId?: string }) {
  const status = statusFor(projectId);
  const key = `euclid-schedule-view-${projectId}`;
  const [view, setViewState] = useState<View>(() => (localStorage.getItem(key) as View) || "Gantt");
  const setView = (v: View) => { setViewState(v); localStorage.setItem(key, v); };
  const [options, setOptions] = useState<GanttOptions>({ phases: true, baseline: false, critical: true, dependencies: true, milestones: true });
  const [zoom, setZoom] = useState<ZoomLevel>("Week");
  const [columns, setColumns] = useState<ColumnKey[]>(defaultColumns);
  const [locked, setLocked] = useState(status.locked);
  const [lockWarning, setLockWarning] = useState(false);
  const [lookAhead, setLookAhead] = useState(false);
  const [todaySignal, setTodaySignal] = useState(0);
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [flags, setFlags] = useState({ criticalOnly: false, delayedOnly: false, milestones: false, inspections: false });
  const [selected, setSelected] = useState<ScheduleTask | null>(null);
  const [published, setPublished] = useState(status.published);

  useEffect(() => { setLocked(statusFor(projectId).locked); setPublished(statusFor(projectId).published); setLookAhead(false); }, [projectId]);
  useEffect(() => { if (!lockWarning) return; const id = setTimeout(() => setLockWarning(false), 4000); return () => clearTimeout(id); }, [lockWarning]);
  useEffect(() => { setColumns(view === "List" ? defaultListColumns : defaultColumns); }, [view]);

  const phases = phasesFor(projectId);
  const all = useMemo(() => {
    const base = tasksFor(projectId);
    return scopeCompanyId ? base.filter(t => t.companyId === scopeCompanyId) : base;
  }, [projectId, scopeCompanyId]);

  const companies = useMemo(() => Array.from(new Set(all.map(t => t.assignee))), [all]);
  const health = scheduleHealth(projectId);
  const filtersOn = phaseFilter !== "All" || statusFilter !== "All" || companyFilter !== "All" || Object.values(flags).some(Boolean);

  const tasks = useMemo(() => all.filter(t =>
    (!search || t.title.toLowerCase().includes(search.toLowerCase()) || t.assignee.toLowerCase().includes(search.toLowerCase())) &&
    (phaseFilter === "All" || t.phaseId === phaseFilter) &&
    (statusFilter === "All" || t.status === statusFilter) &&
    (companyFilter === "All" || t.assignee === companyFilter) &&
    (!flags.criticalOnly || t.critical) &&
    (!flags.delayedOnly || t.status === "Delayed") &&
    (!flags.milestones || t.milestone) &&
    (!flags.inspections || t.category === "inspection")
  ), [all, search, phaseFilter, statusFilter, companyFilter, flags]);

  const attemptEdit = () => setLockWarning(true);

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

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* toolbar */}
      <div className="odyssey-surface flex flex-wrap items-center gap-2 rounded-2xl px-3 py-2.5">
        {/* left — views */}
        <div className="flex rounded-full bg-muted/70 p-0.5">
          {(Object.keys(viewIcons) as View[]).map(v => {
            const Icon = viewIcons[v];
            return <button key={v} onClick={() => { setView(v); setLookAhead(false); }} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold", view === v && !lookAhead && "bg-card shadow-sm")}><Icon size={12} /><span className="hidden sm:inline">{v}</span></button>;
          })}
        </div>

        {/* center — search + filter */}
        <div className="relative min-w-[140px] flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search schedule..." className="w-full rounded-full border border-border/60 bg-transparent py-1.5 pl-8 pr-3 text-[11px] outline-none focus:border-primary/50" />
        </div>
        <Dropdown label="Filter" icon={Filter} active={filtersOn} width="w-64">
          <DropdownSelect label="Phase" value={phaseFilter} onChange={setPhaseFilter} options={["All", ...phases.map(p => p.id)]} render={v => phases.find(p => p.id === v)?.name ?? v} />
          <DropdownSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["All", "Not Started", "Ready", "In Progress", "Complete", "Delayed", "Blocked"]} />
          <DropdownSelect label="Company" value={companyFilter} onChange={setCompanyFilter} options={["All", ...companies]} />
          <div className="my-1 h-px bg-border/60" />
          {([["criticalOnly", "Critical path only"], ["delayedOnly", "Delayed only"], ["milestones", "Milestones only"], ["inspections", "Inspections only"]] as const).map(([k, l]) => (
            <DropdownToggle key={k} label={l} checked={flags[k]} onChange={v => setFlags(f => ({ ...f, [k]: v }))} />
          ))}
        </Dropdown>

        {/* right — actions */}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button onClick={() => { setLookAhead(false); setTodaySignal(n => n + 1); }} className="rounded-full border border-border/60 px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground">Today</button>
          <button onClick={() => setLookAhead(v => !v)}
            className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold", lookAhead ? "border-primary/60 bg-primary/15 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground")}>
            <CalendarRange size={12} />2 Week Look Ahead
          </button>
          <Dropdown label="View Options" icon={SlidersHorizontal} width="w-60">
            {([["phases", "Show phases"], ["baseline", "Show baseline"], ["critical", "Show critical path"], ["dependencies", "Show dependencies"], ["milestones", "Show milestones"]] as const).map(([k, l]) => (
              <DropdownToggle key={k} label={l} checked={options[k]} onChange={v => setOptions(o => ({ ...o, [k]: v }))} />
            ))}
            {view === "Gantt" && (
              <>
                <div className="my-1 h-px bg-border/60" />
                <DropdownSelect label="Time scale" value={zoom} onChange={v => setZoom(v as ZoomLevel)} options={["Day", "Week", "Month", "Quarter"]} />
              </>
            )}
          </Dropdown>
          {(view === "Gantt" || view === "List") && (
            <Dropdown label="Columns" icon={Table2} width="w-56">
              <div className="max-h-64 overflow-auto">
                {columnDefs.map(c => (
                  <DropdownToggle key={c.key} label={c.label} checked={columns.includes(c.key)}
                    onChange={v => setColumns(cs => (v ? [...cs, c.key] : cs.filter(k => k !== c.key)))} />
                ))}
              </div>
            </Dropdown>
          )}
          <button onClick={() => { if (locked) { if (window.confirm("Unlock schedule for editing?\n\nThis protects a published/approved schedule.")) setLocked(false); } else setLocked(true); }}
            className="flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground">
            {locked ? <Lock size={12} /> : <LockOpen size={12} />}{locked ? "Locked" : "Unlocked"}
          </button>
          <button onClick={() => { if (locked) attemptEdit(); }} className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"><Plus size={12} />New Item</button>
          <Dropdown label="" icon={MoreHorizontal} width="w-52">
            <button className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-card/70">Export schedule (PDF)</button>
            <button className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-card/70">Set new baseline</button>
            <button className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-card/70">Schedule settings</button>
          </Dropdown>
        </div>
      </div>

      {lockWarning && (
        <div className="rounded-xl border border-warning/50 bg-warning/10 px-4 py-2 text-[11px] font-semibold text-warning">
          Schedule is locked. Unlock to make schedule changes.
        </div>
      )}

      {/* status ribbon */}
      <div className="odyssey-surface flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-2xl px-4 py-2.5 text-[11px]">
        <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold", published ? "bg-success/15 text-success" : "bg-warning/20 text-warning")}>{published ? "Published" : "Draft"}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold", health.tone)} title={health.summary}>Schedule Health: {health.state}</span>
        <span className="text-muted-foreground">Forecast <b className="text-foreground">{fmtLong(status.forecastFinish)}</b></span>
        <span className="text-muted-foreground">Baseline <b className="text-foreground">{fmtLong(status.baselineFinish)}</b></span>
        <span className={cn(status.variance > 0 ? "text-warning" : "text-success")}>Variance {status.variance > 0 ? `+${status.variance} days` : "on baseline"}</span>
        <span className="text-muted-foreground">{all.filter(t => t.critical && t.status !== "Complete").length} critical</span>
        <span className="text-muted-foreground">{all.filter(t => t.status === "Delayed").length} delayed</span>
        {status.unpublishedChanges > 0 && published && (
          <span className="ml-auto flex items-center gap-2">
            <span className="text-warning">{status.unpublishedChanges} unpublished changes</span>
            <button onClick={() => setPublished(true)} className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground"><Send size={10} />Publish</button>
          </span>
        )}
      </div>

      {lookAhead ? (
        <LookAheadPanel projectId={projectId} onSelect={setSelected} />
      ) : (
        <>
          {view === "Gantt" && <GanttView tasks={tasks} phases={phases} options={options} columns={columns} zoom={zoom} selectedId={selected?.id} onSelect={setSelected} todaySignal={todaySignal} />}
          {view === "List" && <ListView tasks={tasks} phases={phases} columns={columns} showCritical={options.critical} locked={locked} selectedId={selected?.id} onSelect={setSelected} onEditAttempt={attemptEdit} />}
          {view === "Calendar" && <CalendarView tasks={tasks} anchor={status.mode === "active" ? TODAY : status.currentStart} selectedId={selected?.id} onSelect={setSelected} todaySignal={todaySignal} />}
          {view === "Timeline" && <TimelineView tasks={tasks} phases={phases} onSelect={setSelected} />}
        </>
      )}

      <TaskDrawer task={selected} locked={locked} onClose={() => setSelected(null)} onEditAttempt={attemptEdit} />
    </div>
  );
}
