import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Diamond, Filter, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dropdown, DropdownSelect, DropdownToggle } from "@/components/app/active/Dropdown";
import { TaskDrawer } from "./TaskDrawer";
import { addDays, d, fmtLong, tasksFor, TODAY, type ScheduleTask } from "@/data/scheduleData";
import { getProject } from "@/data/demoUniverse";

type Mode = "Month" | "Week" | "Day";
type GroupBy = "Project" | "Trade" | "Company";

/** Compact project label used on every company-calendar item. */
export const shortProjectLabel = (projectId: string) => {
  const name = getProject(projectId).name;
  return name.split("—")[0].trim().split(" ").slice(0, 2).join(" ").toUpperCase();
};

const fillFor = (t: ScheduleTask) => {
  if (t.category === "inspection") return "border-l-2 border-warning bg-warning/10 text-foreground";
  if (t.status === "In Progress") return "bg-primary/85 text-primary-foreground";
  if (t.status === "Delayed") return "bg-warning/25 text-foreground";
  if (t.status === "Complete") return "bg-muted/60 text-muted-foreground";
  return "bg-primary/12 text-foreground";
};

export function CompanyScheduleView({ projectIds, scopeCompanyId, base }: { projectIds: string[]; scopeCompanyId?: string; base: string }) {
  const [mode, setMode] = useState<Mode>("Month");
  const [cursor, setCursor] = useState(TODAY);
  const [groupBy, setGroupBy] = useState<GroupBy>("Project");
  const [projectFilter, setProjectFilter] = useState("All");
  const [tradeFilter, setTradeFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [pmFilter, setPmFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [flags, setFlags] = useState({ inspections: false, milestones: false });
  const [selected, setSelected] = useState<ScheduleTask | null>(null);

  const all = useMemo(() => {
    const list = projectIds.flatMap(id => tasksFor(id));
    return scopeCompanyId ? list.filter(t => t.companyId === scopeCompanyId) : list;
  }, [projectIds, scopeCompanyId]);

  const trades = Array.from(new Set(all.map(t => t.trade)));
  const companyNames = Array.from(new Set(all.map(t => t.assignee)));
  const pms = Array.from(new Set(projectIds.map(id => getProject(id).client)));

  const tasks = all.filter(t =>
    (projectFilter === "All" || t.projectId === projectFilter) &&
    (tradeFilter === "All" || t.trade === tradeFilter) &&
    (companyFilter === "All" || t.assignee === companyFilter) &&
    (pmFilter === "All" || getProject(t.projectId).client === pmFilter) &&
    (statusFilter === "All" || t.status === statusFilter) &&
    (!flags.inspections || t.category === "inspection") &&
    (!flags.milestones || t.milestone));

  const filtersOn = [projectFilter, tradeFilter, companyFilter, pmFilter, statusFilter].some(v => v !== "All") || Object.values(flags).some(Boolean);

  const on = (iso: string) => tasks.filter(t => t.start <= iso && t.finish >= iso);
  const step = (dir: number) => {
    if (mode === "Day") return setCursor(addDays(cursor, dir));
    if (mode === "Week") return setCursor(addDays(cursor, dir * 7));
    const dt = d(cursor); dt.setMonth(dt.getMonth() + dir); setCursor(dt.toISOString().slice(0, 10));
  };

  let days: string[] = [];
  if (mode === "Day") days = [cursor];
  else if (mode === "Week") { const start = addDays(cursor, -d(cursor).getDay()); days = Array.from({ length: 7 }, (_, i) => addDays(start, i)); }
  else {
    const dt = d(cursor); const first = new Date(dt.getFullYear(), dt.getMonth(), 1);
    const gridStart = addDays(first.toISOString().slice(0, 10), -first.getDay());
    days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }

  const title = mode === "Day"
    ? d(cursor).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : d(cursor).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const laneKey = (t: ScheduleTask) => (groupBy === "Trade" ? t.trade : groupBy === "Company" ? t.assignee : shortProjectLabel(t.projectId));
  const lanes = Array.from(new Set(tasks.map(laneKey))).sort();

  const Pill = ({ t, showLane = true }: { t: ScheduleTask; showLane?: boolean }) => (
    <button onClick={() => setSelected(t)}
      className={cn("flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[9px] font-medium", fillFor(t), selected?.id === t.id && "ring-1 ring-primary")}>
      {t.milestone && <Diamond size={7} className="shrink-0 fill-current" />}
      {showLane && <span className="shrink-0 text-[8px] font-bold opacity-70">{shortProjectLabel(t.projectId)}</span>}
      <span className="truncate">{t.title}</span>
    </button>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* toolbar */}
      <div className="odyssey-surface flex flex-wrap items-center gap-2 rounded-2xl px-3 py-2.5">
        <div className="flex rounded-full bg-muted/70 p-0.5">
          {(["Month", "Week", "Day"] as Mode[]).map(m => (
            <button key={m} onClick={() => setMode(m)} className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold", mode === m && "bg-card shadow-sm")}>{m}</button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {([["Today", () => { setMode("Day"); setCursor(TODAY); }], ["This Week", () => { setMode("Week"); setCursor(TODAY); }], ["Next 2 Weeks", () => { setMode("Month"); setCursor(TODAY); }]] as const).map(([l, fn]) => (
            <button key={l} onClick={fn} className="rounded-full border border-border/60 px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground">{l}</button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Dropdown label={`Group by: ${groupBy}`} icon={Layers} width="w-52">
            {(["Project", "Trade", "Company"] as GroupBy[]).map(g => (
              <button key={g} onClick={() => setGroupBy(g)} className={cn("w-full rounded-lg px-2 py-1.5 text-left hover:bg-card/70", groupBy === g && "text-primary")}>{g}</button>
            ))}
          </Dropdown>
          <Dropdown label="Filter" icon={Filter} active={filtersOn} width="w-64">
            <DropdownSelect label="Project" value={projectFilter} onChange={setProjectFilter} options={["All", ...projectIds]} render={v => (v === "All" ? v : getProject(v).name)} />
            <DropdownSelect label="Trade" value={tradeFilter} onChange={setTradeFilter} options={["All", ...trades]} />
            <DropdownSelect label="Company" value={companyFilter} onChange={setCompanyFilter} options={["All", ...companyNames]} />
            <DropdownSelect label="Project manager" value={pmFilter} onChange={setPmFilter} options={["All", ...pms]} />
            <DropdownSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["All", "Not Started", "Ready", "In Progress", "Complete", "Delayed", "Blocked"]} />
            <div className="my-1 h-px bg-border/60" />
            <DropdownToggle label="Inspections only" checked={flags.inspections} onChange={v => setFlags(f => ({ ...f, inspections: v }))} />
            <DropdownToggle label="Milestones only" checked={flags.milestones} onChange={v => setFlags(f => ({ ...f, milestones: v }))} />
          </Dropdown>
        </div>
      </div>

      {/* calendar */}
      <div className="odyssey-surface flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => step(-1)} className="rounded-full p-1.5 hover:bg-card/70"><ChevronLeft size={15} /></button>
            <p className="font-display text-sm font-semibold">{title}</p>
            <button onClick={() => step(1)} className="rounded-full p-1.5 hover:bg-card/70"><ChevronRight size={15} /></button>
            <button onClick={() => setCursor(TODAY)} className="ml-2 rounded-full border border-border/60 px-2.5 py-1 text-[10px] font-semibold">Today</button>
          </div>
          <p className="text-[10px] text-muted-foreground">{tasks.length} activities across {projectIds.length} projects</p>
        </div>

        {mode === "Month" && (
          <>
            <div className="grid grid-cols-7 border-b border-border/50 text-center text-[10px] font-bold uppercase text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(w => <div key={w} className="py-2">{w}</div>)}
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-7 overflow-auto">
              {days.map(day => {
                const items = on(day);
                const dim = d(day).getMonth() !== d(cursor).getMonth();
                return (
                  <div key={day} className={cn("min-h-[104px] border-b border-r border-border/35 p-1.5", dim && "opacity-40")}>
                    <div className="mb-1 flex justify-end">
                      <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold", day === TODAY ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{d(day).getDate()}</span>
                    </div>
                    <div className="space-y-0.5">
                      {items.slice(0, 3).map(t => <Pill key={t.id} t={t} />)}
                      {items.length > 3 && <p className="px-1 text-[9px] font-semibold text-muted-foreground">+{items.length - 3} more</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {mode === "Week" && (
          <div className="min-h-0 flex-1 overflow-auto">
            <div className="grid min-w-[860px] grid-cols-[150px_repeat(7,1fr)] border-b border-border/50 text-[10px] font-bold uppercase text-muted-foreground">
              <div className="px-3 py-2">{groupBy}</div>
              {days.map(day => (
                <div key={day} className={cn("py-2 text-center", day === TODAY && "text-primary")}>{d(day).toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}</div>
              ))}
            </div>
            {lanes.map(lane => (
              <div key={lane} className="grid min-w-[860px] grid-cols-[150px_repeat(7,1fr)] border-b border-border/35">
                <div className="border-r border-border/35 px-3 py-2 text-[11px] font-semibold">{lane}</div>
                {days.map(day => (
                  <div key={day} className="min-h-[64px] space-y-0.5 border-r border-border/25 p-1">
                    {on(day).filter(t => laneKey(t) === lane).map(t => <Pill key={t.id} t={t} showLane={groupBy !== "Project"} />)}
                  </div>
                ))}
              </div>
            ))}
            {!lanes.length && <p className="p-6 text-sm text-muted-foreground">No activities match these filters.</p>}
          </div>
        )}

        {mode === "Day" && (
          <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
            {lanes.map(lane => {
              const items = on(cursor).filter(t => laneKey(t) === lane);
              if (!items.length) return null;
              return (
                <div key={lane}>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{lane}</p>
                  <div className="space-y-1.5">
                    {items.map(t => (
                      <button key={t.id} onClick={() => setSelected(t)} className="flex w-full items-center gap-3 rounded-xl border border-border/50 px-4 py-2.5 text-left hover:bg-card/60">
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", t.category === "inspection" ? "bg-warning" : t.status === "In Progress" ? "bg-primary" : "bg-muted-foreground")} />
                        <span className="flex-1 text-[13px] font-medium">{t.title}</span>
                        <span className="text-[11px] text-muted-foreground">{t.assignee}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {!on(cursor).length && <p className="text-sm text-muted-foreground">No scheduled activities on {fmtLong(cursor)}.</p>}
          </div>
        )}

        <div className="flex flex-wrap gap-3 border-t border-border/50 px-4 py-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-primary/85" />In progress</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-primary/12" />Scheduled</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-muted/60" />Complete</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm border-l-2 border-warning bg-warning/10" />Inspection</span>
          <span className="flex items-center gap-1.5"><Diamond size={8} className="fill-current" />Milestone</span>
        </div>
      </div>

      <TaskDrawer task={selected} locked onClose={() => setSelected(null)}
        footer={selected ? (
          <Link to={`${base}/projects/${selected.projectId}/schedule`} className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-semibold text-primary-foreground">
            Open Project Schedule
          </Link>
        ) : undefined} />
    </div>
  );
}
