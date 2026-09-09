import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Diamond } from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays, categoryTone, d, dayDiff, fmtShort, statusTone, TODAY, workdays, type ScheduleTask, type SchedulePhase } from "@/data/scheduleData";
import { columnDefs, zoomPx, type ColumnKey, type ZoomLevel } from "./scheduleColumns";

const ROW = 34;
const SPLIT_KEY = "euclid-gantt-split";

export interface GanttOptions { phases: boolean; baseline: boolean; critical: boolean; dependencies: boolean; milestones: boolean }

export function GanttView({ tasks, phases, options, columns, zoom, selectedId, onSelect, todaySignal }: {
  tasks: ScheduleTask[]; phases: SchedulePhase[]; options: GanttOptions; columns: ColumnKey[]; zoom: ZoomLevel;
  selectedId?: string; onSelect: (t: ScheduleTask) => void; todaySignal?: number;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [split, setSplit] = useState(() => Number(sessionStorage.getItem(SPLIT_KEY)) || 520);
  const scroller = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const shell = useRef<HTMLDivElement>(null);
  const PX = zoomPx[zoom];

  const { start, end } = useMemo(() => {
    const all = tasks.flatMap(t => [t.start, t.finish, t.baselineStart, t.baselineFinish]).sort();
    return { start: addDays(all[0] ?? TODAY, -7), end: addDays(all[all.length - 1] ?? TODAY, 10) };
  }, [tasks]);
  const totalDays = Math.max(dayDiff(start, end), 1);
  const width = Math.max(totalDays * PX, 480);

  const rows = useMemo(() => {
    const out: ({ kind: "phase"; phase: SchedulePhase; items: ScheduleTask[] } | { kind: "task"; task: ScheduleTask })[] = [];
    phases.forEach(p => {
      const items = tasks.filter(t => t.phaseId === p.id);
      if (!items.length) return;
      if (options.phases) out.push({ kind: "phase", phase: p, items });
      if (!options.phases || !collapsed[p.id]) items.forEach(task => out.push({ kind: "task", task }));
    });
    return out;
  }, [tasks, phases, options.phases, collapsed]);

  const rowIndexOf = (id: string) => rows.findIndex(r => r.kind === "task" && r.task.id === id);
  const x = useCallback((iso: string) => dayDiff(start, iso) * PX, [start, PX]);

  const scale = useMemo(() => {
    const out: { label: string; left: number; w: number }[] = [];
    let cursor = start;
    while (cursor < end) {
      let stop: string;
      let label: string;
      const dt = d(cursor);
      if (zoom === "Day") { stop = cursor; label = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
      else if (zoom === "Week") { stop = addDays(cursor, 6 - dt.getDay()); label = `Wk ${fmtShort(cursor)}`; }
      else if (zoom === "Month") { stop = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).toISOString().slice(0, 10); label = dt.toLocaleDateString("en-US", { month: "short", year: "2-digit" }); }
      else { const q = Math.floor(dt.getMonth() / 3); stop = new Date(dt.getFullYear(), q * 3 + 3, 0).toISOString().slice(0, 10); label = `Q${q + 1} ${dt.getFullYear()}`; }
      if (stop > end) stop = end;
      out.push({ label, left: x(cursor), w: Math.max((dayDiff(cursor, stop) + 1) * PX, 8) });
      cursor = addDays(stop, 1);
    }
    return out;
  }, [start, end, zoom, x, PX]);

  const deps = useMemo(() => {
    if (!options.dependencies) return [];
    const lines: { x1: number; y1: number; x2: number; y2: number; critical: boolean }[] = [];
    rows.forEach(r => {
      if (r.kind !== "task") return;
      const ti = rowIndexOf(r.task.id);
      r.task.predecessors.forEach(pid => {
        const pi = rowIndexOf(pid);
        if (pi < 0) return;
        const pred = tasks.find(t => t.id === pid)!;
        lines.push({ x1: x(pred.finish) + PX, y1: pi * ROW + ROW / 2, x2: x(r.task.start), y2: ti * ROW + ROW / 2, critical: options.critical && pred.critical && r.task.critical });
      });
    });
    return lines;
  }, [rows, tasks, options.dependencies, options.critical, x, PX]);

  const scrollToToday = useCallback(() => scroller.current?.scrollTo({ left: Math.max(x(TODAY) - 220, 0), behavior: "smooth" }), [x]);
  useEffect(() => { scrollToToday(); }, [todaySignal, zoom, scrollToToday]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragging.current || !shell.current) return;
      const left = shell.current.getBoundingClientRect().left;
      const next = Math.min(Math.max(e.clientX - left, 240), 900);
      setSplit(next);
      sessionStorage.setItem(SPLIT_KEY, String(next));
    };
    const up = () => { dragging.current = false; document.body.style.cursor = ""; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, []);

  const cols = columnDefs.filter(c => columns.includes(c.key));
  const cell = (t: ScheduleTask, key: ColumnKey) => {
    switch (key) {
      case "start": return fmtShort(t.start);
      case "finish": return fmtShort(t.finish);
      case "duration": return `${workdays(t.start, t.finish)} wd`;
      case "assignee": return t.assignee;
      case "progress": return `${t.progress}%`;
      case "phase": return phases.find(p => p.id === t.phaseId)?.name ?? "";
      case "company": return t.assignee;
      case "predecessor": return t.predecessors.map(p => tasks.find(x2 => x2.id === p)?.title ?? p).join(", ") || "—";
      case "float": return `${t.floatDays ?? 0}d`;
      case "baselineStart": return fmtShort(t.baselineStart);
      case "baselineFinish": return fmtShort(t.baselineFinish);
      default: return "";
    }
  };

  return (
    <div ref={shell} className="odyssey-surface flex min-h-0 flex-1 overflow-hidden rounded-2xl">
      {/* task table */}
      <div style={{ width: split }} className="shrink-0 overflow-x-auto border-r border-border/60">
        <div className="min-w-max">
          <div className="flex h-[46px] items-center gap-2 border-b border-border/60 px-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            <span className="min-w-[150px] flex-1">Task</span>
            {cols.map(c => <span key={c.key} style={{ width: c.width }} className="shrink-0 text-right">{c.label}</span>)}
          </div>
          <div style={{ height: rows.length * ROW }}>
            {rows.map(r =>
              r.kind === "phase" ? (
                <button key={`p-${r.phase.id}`} onClick={() => setCollapsed(c => ({ ...c, [r.phase.id]: !c[r.phase.id] }))}
                  style={{ height: ROW }} className="flex w-full items-center gap-1.5 border-b border-border/40 bg-muted/45 px-3 text-left text-[12px] font-semibold">
                  {collapsed[r.phase.id] ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                  <span className="flex-1 truncate">{r.phase.name}</span>
                  <span className="text-[10px] font-normal text-muted-foreground">{r.items.length}</span>
                </button>
              ) : (
                <button key={r.task.id} onClick={() => onSelect(r.task)} style={{ height: ROW }}
                  className={cn("flex w-full items-center gap-2 border-b border-border/30 px-3 pl-7 text-left text-[12px] hover:bg-card/60", selectedId === r.task.id && "bg-primary/10")}>
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", categoryTone[r.task.category].dot)} />
                  <span className={cn("min-w-[150px] flex-1 truncate", options.critical && r.task.critical && "font-medium")}>{r.task.title}</span>
                  {cols.map(c => c.key === "status" ? (
                    <span key={c.key} style={{ width: c.width }} className={cn("shrink-0 truncate rounded-full px-1.5 py-0.5 text-center text-[9px] font-semibold", statusTone[r.task.status])}>{r.task.status}</span>
                  ) : (
                    <span key={c.key} style={{ width: c.width }} className="shrink-0 truncate text-right text-[10px] text-muted-foreground">{cell(r.task, c.key)}</span>
                  ))}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* drag handle */}
      <div onMouseDown={() => { dragging.current = true; document.body.style.cursor = "col-resize"; }}
        className="group w-1.5 shrink-0 cursor-col-resize bg-border/40 transition-colors hover:bg-primary/60" title="Drag to resize" />

      {/* timeline */}
      <div ref={scroller} className="min-w-0 flex-1 overflow-auto">
        <div style={{ width }} className="relative">
          <div className="sticky top-0 z-20 h-[46px] border-b border-border/60 bg-card/85 backdrop-blur-md">
            <div className="relative h-full">
              {scale.map(m => (
                <div key={m.label + m.left} style={{ left: m.left, width: m.w }} className="absolute top-0 h-full overflow-hidden border-l border-border/50 px-1.5 pt-3 text-[10px] font-semibold text-muted-foreground">{m.label}</div>
              ))}
              <span style={{ left: x(TODAY) }} className="absolute bottom-1 z-30 -translate-x-1/2 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold text-primary-foreground">Today</span>
            </div>
          </div>
          <div className="relative" style={{ height: rows.length * ROW }}>
            {scale.map(m => <div key={`g${m.left}`} style={{ left: m.left }} className="absolute top-0 h-full border-l border-border/25" />)}
            <div style={{ left: x(TODAY) }} className="absolute top-0 z-10 h-full w-px bg-primary" />
            <svg className="pointer-events-none absolute inset-0 z-[5] h-full w-full">
              {deps.map((l, i) => (
                <polyline key={i} points={`${l.x1},${l.y1} ${l.x1 + 6},${l.y1} ${l.x1 + 6},${l.y2} ${l.x2},${l.y2}`} fill="none"
                  strokeWidth={1} className={l.critical ? "stroke-warning" : "stroke-muted-foreground/40"} />
              ))}
            </svg>
            {rows.map((r, i) => {
              if (r.kind === "phase") {
                const s = r.items.map(t => t.start).sort()[0];
                const f = r.items.map(t => t.finish).sort().slice(-1)[0];
                return (
                  <div key={`pb-${r.phase.id}`} style={{ top: i * ROW, height: ROW }} className="absolute w-full border-b border-border/40 bg-muted/25">
                    <div style={{ left: x(s), width: Math.max((dayDiff(s, f) + 1) * PX, 6), top: 9 }}
                      className="absolute flex h-4 items-center overflow-hidden rounded-[3px] bg-foreground/15 px-1.5 ring-1 ring-inset ring-foreground/20">
                      <span className="truncate text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{r.phase.name}</span>
                    </div>
                  </div>
                );
              }
              const t = r.task;
              const w = Math.max((dayDiff(t.start, t.finish) + 1) * PX, 5);
              const bw = Math.max((dayDiff(t.baselineStart, t.baselineFinish) + 1) * PX, 5);
              const crit = options.critical && t.critical;
              const isMilestone = t.milestone && options.milestones;
              return (
                <div key={t.id} style={{ top: i * ROW, height: ROW }} className={cn("absolute w-full border-b border-border/25", selectedId === t.id && "bg-primary/5")}>
                  {options.baseline && (
                    <div style={{ left: x(t.baselineStart), width: bw, top: 21 }} className="absolute h-1.5 rounded-full border border-muted-foreground/40 bg-muted-foreground/15" />
                  )}
                  {isMilestone ? (
                    <button onClick={() => onSelect(t)} style={{ left: x(t.start) - 5, top: 10 }} className="absolute" title={t.title}>
                      <Diamond size={13} className={cn("fill-current", crit ? "text-warning" : "text-foreground")} />
                    </button>
                  ) : (
                    <button onClick={() => onSelect(t)} style={{ left: x(t.start), width: w, top: 11 }}
                      className={cn("absolute h-2.5 overflow-hidden rounded-[3px] text-left ring-1 ring-inset ring-border/50 transition-transform hover:scale-y-125",
                        categoryTone[t.category].bar,
                        t.status === "Delayed" && "ring-warning/70",
                        crit && "shadow-[inset_2px_0_0_0_hsl(var(--warning))]")} title={t.title}>
                      <span className="absolute inset-y-0 left-0 bg-foreground/25" style={{ width: `${t.progress}%` }} />
                    </button>
                  )}
                  {t.status === "Delayed" && !isMilestone && (
                    <span style={{ left: x(t.start) + w + 4, top: 10 }} className="absolute rounded-sm bg-warning/20 px-1 text-[8px] font-bold text-warning">late</span>
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
