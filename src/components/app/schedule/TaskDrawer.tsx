import { AlertTriangle, CalendarClock, Check, FileUp, Link2, Pencil, Sparkles, StickyNote, X } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { fmtLong, statusTone, successorsOf, taskById, workdays, type ScheduleTask } from "@/data/scheduleData";
import { builderNetwork, complianceTone, money } from "@/data/networkData";

export function TaskDrawer({ task, locked, onClose }: { task: ScheduleTask | null; locked: boolean; onClose: () => void }) {
  if (!task) return null;
  const company = task.companyId ? builderNetwork.find(c => c.id === task.companyId) : undefined;
  const variance = Math.round((new Date(task.finish).getTime() - new Date(task.baselineFinish).getTime()) / 86400000);
  const succ = successorsOf(task.id);
  const costPct = task.cost && task.cost.estimate ? Math.round((task.cost.actual / task.cost.estimate) * 100) : null;

  return (
    <aside className="odyssey-surface fixed right-4 top-[88px] z-[80] flex max-h-[calc(100vh-110px)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl shadow-xl">
      <div className="flex items-start justify-between gap-2 border-b border-border/60 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Schedule activity</p>
          <h3 className="font-display text-base font-semibold leading-tight">{task.title}</h3>
        </div>
        <button onClick={onClose} className="rounded-full p-1.5 hover:bg-card/70"><X size={15} /></button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 text-[12px]">
        {task.description && <p className="text-muted-foreground">{task.description}</p>}

        {task.critical && (
          <div className="rounded-xl border border-warning/40 bg-warning/10 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-warning"><AlertTriangle size={12} />Critical Path</p>
            <p className="mt-1 text-[11px] text-muted-foreground">This activity has zero scheduling float and affects project completion.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[["Phase", task.trade], ["Assignee", task.assignee], ["Start", fmtLong(task.start)], ["Finish", fmtLong(task.finish)],
            ["Duration", `${workdays(task.start, task.finish)} workdays`], ["Progress", `${task.progress}%`]].map(([l, v]) => (
            <div key={l}><p className="text-[10px] uppercase text-muted-foreground">{l}</p><p className="font-medium">{v}</p></div>
          ))}
          <div><p className="text-[10px] uppercase text-muted-foreground">Status</p><span className={cn("mt-0.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold", statusTone[task.status])}>{task.status}</span></div>
          {task.location && <div><p className="text-[10px] uppercase text-muted-foreground">Location</p><p className="font-medium">{task.location}</p></div>}
        </div>

        <div className="rounded-xl border border-border/50 p-3">
          <p className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">Baseline comparison</p>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div><p className="text-muted-foreground">Baseline</p><p>{fmtLong(task.baselineStart)}</p><p>{fmtLong(task.baselineFinish)}</p></div>
            <div><p className="text-muted-foreground">Current</p><p>{fmtLong(task.start)}</p><p>{fmtLong(task.finish)}</p></div>
            <div><p className="text-muted-foreground">Variance</p><p className={cn("font-semibold", variance > 0 ? "text-warning" : "text-success")}>{variance > 0 ? `+${variance} days` : variance < 0 ? `${variance} days` : "On baseline"}</p></div>
          </div>
        </div>

        {company && (
          <div className="rounded-xl border border-border/50 p-3">
            <p className="mb-1.5 text-[10px] font-bold uppercase text-muted-foreground">Company</p>
            <div className="flex items-center justify-between">
              <Link to={`/network/${company.id}`} className="text-[12px] font-semibold text-primary hover:underline">{company.name}</Link>
              <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold", complianceTone[company.complianceOverall])}>{company.complianceOverall}</span>
            </div>
            {company.complianceOverall !== "In Compliance" && (
              <p className="mt-1.5 flex items-center gap-1 text-[10px] text-warning"><AlertTriangle size={11} />Compliance issue — review before this work starts.</p>
            )}
          </div>
        )}

        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase text-muted-foreground">Dependencies</p>
          {task.predecessors.length ? task.predecessors.map(p => (
            <p key={p} className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Link2 size={11} />{taskById(p)?.title ?? p}</p>
          )) : <p className="text-[11px] text-muted-foreground">None</p>}
          <p className="mb-1.5 mt-3 text-[10px] font-bold uppercase text-muted-foreground">Successors</p>
          {succ.length ? succ.map(s => <p key={s.id} className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Link2 size={11} />{s.title}</p>) : <p className="text-[11px] text-muted-foreground">None</p>}
        </div>

        {task.cost && (
          <div className="rounded-xl border border-border/50 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">Cost connection</p>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div><p className="text-muted-foreground">Estimate</p><p className="font-semibold">{money(task.cost.estimate)}</p></div>
              <div><p className="text-muted-foreground">Committed</p><p className="font-semibold">{money(task.cost.committed)}</p></div>
              <div><p className="text-muted-foreground">Actual</p><p className="font-semibold">{money(task.cost.actual)}</p></div>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">Schedule {task.progress}% complete · Cost {costPct}% spent</p>
          </div>
        )}

        {task.notes && <div className="rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground"><StickyNote size={11} className="mr-1 inline" />{task.notes}</div>}

        <div className="rounded-xl border border-primary/35 bg-primary/5 p-3">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-primary"><Sparkles size={11} />Euclid impact</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {task.critical
              ? `${task.title} is on the critical path. A five-day delay would move projected completion by five days unless downstream work is resequenced.`
              : `${task.title} currently has float. A short delay would not move projected completion, but it compresses ${succ[0]?.title ?? "downstream work"}.`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-border/60 px-4 py-3">
        {[{ l: "Edit", i: Pencil }, { l: "Complete", i: Check }, { l: "Change dates", i: CalendarClock }, { l: "Add note", i: StickyNote }, { l: "Attach", i: FileUp }].map(a => (
          <button key={a.l} disabled={locked && a.l !== "Add note"} className="flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-[10px] font-semibold disabled:opacity-40">
            <a.i size={11} />{a.l}
          </button>
        ))}
        {locked && <p className="mt-1 w-full text-[10px] text-muted-foreground">Schedule is locked — unlock to edit dates or dependencies.</p>}
      </div>
    </aside>
  );
}
