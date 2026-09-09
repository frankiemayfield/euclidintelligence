import { useState } from "react";
import { cn } from "@/lib/utils";
import { categoryTone, fmtShort, statusTone, workdays, type SchedulePhase, type ScheduleTask, type TaskStatus } from "@/data/scheduleData";
import { AlertTriangle, Info } from "lucide-react";
import { columnDefs, type ColumnKey } from "./scheduleColumns";

const STATUSES: TaskStatus[] = ["Not Started", "Ready", "In Progress", "Complete", "Delayed", "Blocked"];

export function ListView({ tasks, phases, columns, showCritical, locked, selectedId, onSelect, onEditAttempt }: {
  tasks: ScheduleTask[]; phases: SchedulePhase[]; columns: ColumnKey[]; showCritical: boolean; locked: boolean;
  selectedId?: string; onSelect: (t: ScheduleTask) => void; onEditAttempt: () => void;
}) {
  // session-local inline edits so the list is the fast editing surface
  const [edits, setEdits] = useState<Record<string, Partial<ScheduleTask>>>({});
  const val = <K extends keyof ScheduleTask>(t: ScheduleTask, k: K) => (edits[t.id]?.[k] ?? t[k]) as ScheduleTask[K];
  const set = (t: ScheduleTask, patch: Partial<ScheduleTask>) => {
    if (locked) { onEditAttempt(); return; }
    setEdits(e => ({ ...e, [t.id]: { ...e[t.id], ...patch } }));
  };
  const cols = columnDefs.filter(c => columns.includes(c.key));
  const guard = (e: React.MouseEvent) => e.stopPropagation();

  const inputCls = "w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 text-[11px] outline-none hover:border-border/60 focus:border-primary/60 disabled:cursor-not-allowed";

  const cell = (t: ScheduleTask, key: ColumnKey) => {
    switch (key) {
      case "start":
      case "finish":
        return <input type="date" disabled={locked} onClick={e => { guard(e); if (locked) onEditAttempt(); }} value={val(t, key) as string}
          onChange={e => set(t, { [key]: e.target.value } as Partial<ScheduleTask>)} className={inputCls} />;
      case "duration": return <span className="text-muted-foreground">{workdays(val(t, "start") as string, val(t, "finish") as string)} wd</span>;
      case "assignee":
        return <input disabled={locked} onClick={e => { guard(e); if (locked) onEditAttempt(); }} value={val(t, "assignee") as string}
          onChange={e => set(t, { assignee: e.target.value })} className={inputCls} />;
      case "progress":
        return <input type="number" min={0} max={100} disabled={locked} onClick={e => { guard(e); if (locked) onEditAttempt(); }} value={val(t, "progress") as number}
          onChange={e => set(t, { progress: Number(e.target.value) })} className={cn(inputCls, "text-right")} />;
      case "status":
        return locked
          ? <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold", statusTone[val(t, "status") as TaskStatus])}>{val(t, "status") as string}</span>
          : <select value={val(t, "status") as string} onClick={guard} onChange={e => set(t, { status: e.target.value as TaskStatus })}
              className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold outline-none", statusTone[val(t, "status") as TaskStatus])}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>;
      case "phase": return <span className="text-muted-foreground">{phases.find(p => p.id === t.phaseId)?.name}</span>;
      case "company": return <span className="text-muted-foreground">{t.assignee}</span>;
      case "predecessor": return <span className="truncate text-muted-foreground">{t.predecessors.map(p => tasks.find(x => x.id === p)?.title ?? p).join(", ") || "—"}</span>;
      case "float": return <span className="text-muted-foreground">{t.floatDays ?? 0}d</span>;
      case "baselineStart": return <span className="text-muted-foreground">{fmtShort(t.baselineStart)}</span>;
      case "baselineFinish": return <span className="text-muted-foreground">{fmtShort(t.baselineFinish)}</span>;
      default: return null;
    }
  };

  return (
    <div className="odyssey-surface min-h-0 flex-1 overflow-auto rounded-2xl">
      <table className="w-full min-w-[760px] text-[12px]">
        <thead className="sticky top-0 z-10 bg-card/90 backdrop-blur-md">
          <tr className="border-b border-border/60 text-[10px] uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 text-left font-bold">Task</th>
            {cols.map(c => <th key={c.key} style={{ width: c.width }} className="px-3 py-3 text-left font-bold">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {phases.map(p => {
            const items = tasks.filter(t => t.phaseId === p.id);
            if (!items.length) return null;
            return (
              <>
                <tr key={p.id} className="bg-muted/40"><td colSpan={cols.length + 1} className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide">{p.name}</td></tr>
                {items.map(t => (
                  <tr key={t.id} onClick={() => onSelect(t)}
                    className={cn("cursor-pointer border-b border-border/30 hover:bg-card/60", selectedId === t.id && "bg-primary/10")}>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-1.5 w-1.5 rounded-full", categoryTone[t.category].dot)} />
                        <span className={cn(showCritical && t.critical && "font-semibold")}>{t.title}</span>
                        {showCritical && t.critical && <AlertTriangle size={11} className="text-warning" />}
                        {edits[t.id] && <Info size={10} className="text-primary" />}
                      </div>
                    </td>
                    {cols.map(c => <td key={c.key} className="px-3 py-1.5">{cell(t, c.key)}</td>)}
                  </tr>
                ))}
              </>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-border/50 px-4 py-2 text-[10px] text-muted-foreground">
        {locked ? "Schedule is locked — unlock to edit dates, assignee, progress or status inline." : "Dates, assignee, progress and status are editable inline. Use the activity drawer for dependencies, notes, attachments and cost mapping."}
      </p>
    </div>
  );
}
