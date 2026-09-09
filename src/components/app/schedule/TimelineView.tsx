import { cn } from "@/lib/utils";
import { dayDiff, fmtLong, fmtShort, TODAY, type SchedulePhase, type ScheduleTask } from "@/data/scheduleData";
import { Diamond } from "lucide-react";

export function TimelineView({ tasks, phases, onSelect }: { tasks: ScheduleTask[]; phases: SchedulePhase[]; onSelect: (t: ScheduleTask) => void }) {
  const spans = phases.map(p => {
    const items = tasks.filter(t => t.phaseId === p.id);
    if (!items.length) return null;
    const start = items.map(t => t.start).sort()[0];
    const finish = items.map(t => t.finish).sort().slice(-1)[0];
    const progress = Math.round(items.reduce((s, t) => s + t.progress, 0) / items.length);
    return { phase: p, start, finish, progress, items };
  }).filter(Boolean) as { phase: SchedulePhase; start: string; finish: string; progress: number; items: ScheduleTask[] }[];

  const first = spans[0]?.start ?? TODAY;
  const last = spans[spans.length - 1]?.finish ?? TODAY;
  const total = Math.max(dayDiff(first, last), 1);
  const pct = (iso: string) => (dayDiff(first, iso) / total) * 100;
  const milestones = tasks.filter(t => t.milestone);

  return (
    <div className="odyssey-surface min-h-0 flex-1 overflow-auto rounded-2xl p-6">
      <div className="mb-6 flex items-baseline justify-between">
        <div><p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Construction timeline</p><p className="font-display text-lg font-semibold">{fmtLong(first)} — {fmtLong(last)}</p></div>
        <p className="text-xs text-muted-foreground">{spans.length} phases · {milestones.length} milestones</p>
      </div>

      <div className="relative mb-8 h-6 rounded-full bg-muted/50">
        <div className="absolute inset-y-0 rounded-full bg-primary/25" style={{ width: `${Math.max(pct(TODAY), 0)}%` }} />
        <div className="absolute -top-1 bottom-[-4px] w-0.5 bg-primary" style={{ left: `${Math.min(Math.max(pct(TODAY), 0), 100)}%` }} />
        <span className="absolute -top-5 -translate-x-1/2 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold text-primary-foreground" style={{ left: `${Math.min(Math.max(pct(TODAY), 0), 100)}%` }}>Today</span>
        {milestones.map(m => (
          <button key={m.id} onClick={() => onSelect(m)} title={m.title} className="absolute top-1 -translate-x-1/2" style={{ left: `${Math.min(Math.max(pct(m.start), 0), 100)}%` }}>
            <Diamond size={13} className="fill-current text-foreground" />
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {spans.map(s => {
          const done = s.progress === 100;
          const current = s.start <= TODAY && s.finish >= TODAY;
          return (
            <div key={s.phase.id} className={cn("rounded-xl border px-4 py-3", current ? "border-primary/50 bg-primary/5" : "border-border/45")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", done ? "bg-success" : current ? "bg-primary" : "bg-muted-foreground/50")} />
                  <p className="text-sm font-semibold">{s.phase.name}</p>
                  {current && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold text-primary">Current</span>}
                </div>
                <p className="text-[11px] text-muted-foreground">{fmtShort(s.start)} → {fmtShort(s.finish)} · {s.progress}%</p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/60"><div className={cn("h-full rounded-full", done ? "bg-success" : "bg-primary")} style={{ width: `${s.progress}%` }} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
