import { useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Diamond, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays, categoryTone, d, dayDiff, fmtShort, statusTone, TODAY, workdays, type ScheduleTask, type SchedulePhase } from "@/data/scheduleData";

const ROW = 34;
const PX = 9; // px per day

export function GanttView({ tasks, phases, showBaseline, showCritical, showPhases, locked, selectedId, onSelect }: {
  tasks: ScheduleTask[]; phases: SchedulePhase[]; showBaseline: boolean; showCritical: boolean; showPhases: boolean;
  locked: boolean; selectedId?: string; onSelect: (t: ScheduleTask) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const scroller = useRef<HTMLDivElement>(null);

  const { start, end } = useMemo(() => {
    const all = tasks.flatMap(t => [t.start, t.finish, t.baselineStart, t.baselineFinish]).sort();
    return { start: addDays(all[0] ?? TODAY, -7), end: addDays(all[all.length - 1] ?? TODAY, 10) };
  }, [tasks]);
  const totalDays = Math.max(dayDiff(start, end), 1);
  const width = totalDays * PX;

  const rows = useMemo(() => {
    const out: ({ kind: "phase"; phase: SchedulePhase; items: ScheduleTask[] } | { kind: "task"; task: ScheduleTask })[] = [];
    phases.forEach(p => {
      const items = tasks.filter(t => t.phaseId === p.id);
      if (!items.length) return;
      if (showPhases) out.push({ kind: "phase", phase: p, items });
      if (!showPhases || !collapsed[p.id]) items.forEach(task => out.push({ kind: "task", task }));
    });
    return out;
  }, [tasks, phases, showPhases, collapsed]);

  const rowIndexOf = (id: string) => rows.findIndex(r => r.kind === "task" && r.task.id === id);
  const x = (iso: string) => dayDiff(start, iso) * PX;

  const months = useMemo(() => {
    const out: { label: string; left: number; w: number }[] = [];
    let cursor = start;
    while (cursor < end) {
      const dt = d(cursor);
      const last = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).toISOString().slice(0, 10);
      const stop = last < end ? last : end;
      out.push({ label: dt.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), left: x(cursor), w: Math.max((dayDiff(cursor, stop) + 1) * PX, 12) });
      cursor = addDays(stop, 1);
    }
    return out;
  }, [start, end]);

  const deps = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; critical: boolean }[] = [];
    rows.forEach(r => {
      if (r.kind !== "task") return;
      const ti = rowIndexOf(r.task.id);
      r.task.predecessors.forEach(pid => {
        const pi = rowIndexOf(pid);
        if (pi < 0) return;
        const pred = tasks.find(t => t.id === pid)!;
        lines.push({ x1: x(pred.finish) + PX, y1: pi * ROW + ROW / 2, x2: x(r.task.start), y2: ti * ROW + ROW / 2, critical: showCritical && pred.critical && r.task.critical });
      });
    });
    return lines;
  }, [rows, tasks, showCritical]);

  const scrollToToday = () => scroller.current?.scrollTo({ left: Math.max(x(TODAY) - 220, 0), behavior: "smooth" });

  return (
    <div className="odyssey-surface flex min-h-0 flex-1 overflow-hidden rounded-2xl">
      {/* left data pane */}
      <div className="w-[430px] shrink-0 overflow-hidden border-r border-border/60">
        <div className="flex h-[46px] items-center gap-2 border-b border-border/60 px-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          <span className="flex-1">Task</span><span className="w-14">Start</span><span className="w-14">Finish</span><span className="w-10 text-right">Dur</span><span className="w-16 text-right">Status</span>
        </div>
        <div className="overflow-hidden" style={{ height: rows.length * ROW }}>
          {rows.map((r, i) =>
            r.kind === "phase" ? (
              <button key={`p-${r.phase.id}`} onClick={() => setCollapsed(c => ({ ...c, [r.phase.id]: !c[r.phase.id] }))}
                style={{ height: ROW }} className="flex w-full items-center gap-1.5 border-b border-border/40 bg-muted/40 px-3 text-left text-[12px] font-semibold">
                {collapsed[r.phase.id] ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                <span className="flex-1 truncate">{r.phase.name}</span>
                <span className="text-[10px] font-normal text-muted-foreground">{r.items.length}</span>
              </button>
            ) : (
              <button key={r.task.id} onClick={() => onSelect(r.task)} style={{ height: ROW }}
                className={cn("flex w-full items-center gap-2 border-b border-border/30 px-3 pl-7 text-left text-[12px] hover:bg-card/60", selectedId === r.task.id && "bg-primary/10")}>
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", categoryTone[r.task.category].dot)} />
                <span className={cn("flex-1 truncate", showCritical && r.task.critical && "font-semibold text-warning")}>{r.task.title}</span>
                <span className="w-14 shrink-0 text-[10px] text-muted-foreground">{fmtShort(r.task.start)}</span>
                <span className="w-14 shrink-0 text-[10px] text-muted-foreground">{fmtShort(r.task.finish)}</span>
                <span className="w-10 shrink-0 text-right text-[10px] text-muted-foreground">{workdays(r.task.start, r.task.finish)}d</span>
                <span className={cn("w-16 shrink-0 truncate rounded-full px-1.5 py-0.5 text-center text-[9px] font-semibold", statusTone[r.task.status])}>{r.task.status}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* timeline pane */}
      <div ref={scroller} className="min-w-0 flex-1 overflow-auto">
        <div style={{ width }} className="relative">
          <div className="sticky top-0 z-20 h-[46px] border-b border-border/60 bg-card/85 backdrop-blur-md">
            <div className="relative h-full">
              {months.map(m => (
                <div key={m.label + m.left} style={{ left: m.left, width: m.w }} className="absolute top-0 h-full border-l border-border/50 px-2 pt-3 text-[10px] font-semibold text-muted-foreground">{m.label}</div>
              ))}
              <button onClick={scrollToToday} style={{ left: x(TODAY) }} className="absolute bottom-1 z-30 -translate-x-1/2 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold text-primary-foreground">Today</button>
            </div>
          </div>
          <div className="relative" style={{ height: rows.length * ROW }}>
            {months.map(m => <div key={`g${m.left}`} style={{ left: m.left }} className="absolute top-0 h-full border-l border-border/30" />)}
            <div style={{ left: x(TODAY) }} className="absolute top-0 z-10 h-full w-px bg-primary" />
            <svg className="pointer-events-none absolute inset-0 z-[5] h-full w-full">
              {deps.map((l, i) => (
                <polyline key={i} points={`${l.x1},${l.y1} ${l.x1 + 6},${l.y1} ${l.x1 + 6},${l.y2} ${l.x2},${l.y2}`} fill="none"
                  strokeWidth={1} className={l.critical ? "stroke-warning" : "stroke-muted-foreground/45"} markerEnd="" />
              ))}
            </svg>
            {rows.map((r, i) => {
              if (r.kind === "phase") {
                const s = r.items.map(t => t.start).sort()[0];
                const f = r.items.map(t => t.finish).sort().slice(-1)[0];
                return (
                  <div key={`pb-${r.phase.id}`} style={{ top: i * ROW, height: ROW }} className="absolute w-full border-b border-border/40 bg-muted/25">
                    <div style={{ left: x(s), width: Math.max((dayDiff(s, f) + 1) * PX, 4), top: 12 }} className="absolute h-2.5 rounded-sm bg-foreground/35" />
                  </div>
                );
              }
              const t = r.task;
              const w = Math.max((dayDiff(t.start, t.finish) + 1) * PX, 6);
              const bw = Math.max((dayDiff(t.baselineStart, t.baselineFinish) + 1) * PX, 6);
              const crit = showCritical && t.critical;
              return (
                <div key={t.id} style={{ top: i * ROW, height: ROW }} className={cn("absolute w-full border-b border-border/25", selectedId === t.id && "bg-primary/5")}>
                  {showBaseline && (
                    <div style={{ left: x(t.baselineStart), width: bw, top: 21 }} className="absolute h-1.5 rounded-full bg-muted-foreground/35" />
                  )}
                  {t.milestone ? (
                    <button onClick={() => onSelect(t)} style={{ left: x(t.start) - 5, top: 10 }} className="absolute" title={t.title}>
                      <Diamond size={13} className={cn("fill-current", crit ? "text-warning" : "text-foreground")} />
                    </button>
                  ) : (
                    <button onClick={() => onSelect(t)} style={{ left: x(t.start), width: w, top: 8 }}
                      className={cn("absolute h-4 overflow-hidden rounded-md text-left shadow-sm ring-1 ring-inset ring-border/40 transition-transform hover:scale-[1.01]",
                        t.status === "Delayed" ? "bg-warning/70" : categoryTone[t.category].bar, crit && "ring-2 ring-warning")} title={t.title}>
                      <span className="absolute inset-y-0 left-0 bg-foreground/25" style={{ width: `${t.progress}%` }} />
                      {locked && t.status === "In Progress" && <Lock size={8} className="absolute right-1 top-1 text-background/80" />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
