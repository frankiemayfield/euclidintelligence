import { cn } from "@/lib/utils";
import { categoryTone, fmtShort, statusTone, workdays, type SchedulePhase, type ScheduleTask } from "@/data/scheduleData";
import { AlertTriangle } from "lucide-react";

export function ListView({ tasks, phases, showBaseline, showCritical, selectedId, onSelect }: {
  tasks: ScheduleTask[]; phases: SchedulePhase[]; showBaseline: boolean; showCritical: boolean; selectedId?: string; onSelect: (t: ScheduleTask) => void;
}) {
  return (
    <div className="odyssey-surface min-h-0 flex-1 overflow-auto rounded-2xl">
      <table className="w-full text-[12px]">
        <thead className="sticky top-0 z-10 bg-card/90 backdrop-blur-md">
          <tr className="border-b border-border/60 text-[10px] uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 text-left font-bold">Task</th>
            <th className="px-3 py-3 text-left font-bold">Start</th>
            <th className="px-3 py-3 text-left font-bold">Finish</th>
            <th className="px-3 py-3 text-right font-bold">Duration</th>
            {showBaseline && <th className="px-3 py-3 text-right font-bold">Variance</th>}
            <th className="px-3 py-3 text-left font-bold">Assignee</th>
            <th className="px-3 py-3 text-right font-bold">Progress</th>
            <th className="px-3 py-3 text-right font-bold">Status</th>
          </tr>
        </thead>
        <tbody>
          {phases.map(p => {
            const items = tasks.filter(t => t.phaseId === p.id);
            if (!items.length) return null;
            return (
              <>
                <tr key={p.id} className="bg-muted/40"><td colSpan={showBaseline ? 8 : 7} className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide">{p.name}</td></tr>
                {items.map(t => {
                  const variance = Math.round((new Date(t.finish).getTime() - new Date(t.baselineFinish).getTime()) / 86400000);
                  return (
                    <tr key={t.id} onClick={() => onSelect(t)}
                      className={cn("cursor-pointer border-b border-border/30 hover:bg-card/60", selectedId === t.id && "bg-primary/10")}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={cn("h-1.5 w-1.5 rounded-full", categoryTone[t.category].dot)} />
                          <span className={cn(showCritical && t.critical && "font-semibold text-warning")}>{t.title}</span>
                          {showCritical && t.critical && <AlertTriangle size={11} className="text-warning" />}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{fmtShort(t.start)}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{fmtShort(t.finish)}</td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground">{workdays(t.start, t.finish)} wd</td>
                      {showBaseline && <td className={cn("px-3 py-2.5 text-right", variance > 0 ? "text-warning" : "text-muted-foreground")}>{variance > 0 ? `+${variance}d` : variance < 0 ? `${variance}d` : "—"}</td>}
                      <td className="px-3 py-2.5 text-muted-foreground">{t.assignee}</td>
                      <td className="px-3 py-2.5 text-right">{t.progress}%</td>
                      <td className="px-3 py-2.5 text-right"><span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold", statusTone[t.status])}>{t.status}</span></td>
                    </tr>
                  );
                })}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
