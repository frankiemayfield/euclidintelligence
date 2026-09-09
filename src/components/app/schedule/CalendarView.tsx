import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Diamond, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays, d, fmtLong, TODAY, type ScheduleTask } from "@/data/scheduleData";

type Mode = "Month" | "Week" | "Day";

/** Muted hierarchy: in-progress reads strongest, upcoming is translucent, complete is quiet. */
const fillFor = (t: ScheduleTask) => {
  if (t.category === "inspection") return "border-l-2 border-warning bg-warning/10 text-foreground";
  if (t.status === "In Progress") return "bg-primary/85 text-primary-foreground";
  if (t.status === "Delayed") return "bg-warning/25 text-foreground";
  if (t.status === "Complete") return "bg-muted/60 text-muted-foreground";
  return "bg-primary/12 text-foreground";
};

export function CalendarView({ tasks, anchor, selectedId, onSelect, todaySignal }: {
  tasks: ScheduleTask[]; anchor: string; selectedId?: string; onSelect: (t: ScheduleTask) => void; todaySignal?: number;
}) {
  const [mode, setMode] = useState<Mode>("Month");
  const [cursor, setCursor] = useState(anchor);
  const [popover, setPopover] = useState<string | null>(null);

  useEffect(() => { if (todaySignal) setCursor(TODAY); }, [todaySignal]);

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
  const title = mode === "Day" ? d(cursor).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : d(cursor).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const cap = mode === "Week" ? 12 : 3;

  const Pill = ({ t }: { t: ScheduleTask }) => (
    <button onClick={e => { e.stopPropagation(); onSelect(t); setPopover(null); }}
      className={cn("flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[9px] font-medium", fillFor(t), selectedId === t.id && "ring-1 ring-primary")}>
      {t.milestone && <Diamond size={7} className="shrink-0 fill-current" />}
      <span className="truncate">{t.title}</span>
    </button>
  );

  return (
    <div className="odyssey-surface relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => step(-1)} className="rounded-full p-1.5 hover:bg-card/70"><ChevronLeft size={15} /></button>
          <p className="font-display text-sm font-semibold">{title}</p>
          <button onClick={() => step(1)} className="rounded-full p-1.5 hover:bg-card/70"><ChevronRight size={15} /></button>
          <button onClick={() => setCursor(TODAY)} className="ml-2 rounded-full border border-border/60 px-2.5 py-1 text-[10px] font-semibold">Today</button>
        </div>
        <div className="flex rounded-full bg-muted/70 p-0.5">
          {(["Month", "Week", "Day"] as Mode[]).map(m => (
            <button key={m} onClick={() => setMode(m)} className={cn("rounded-full px-3 py-1 text-[10px] font-semibold", mode === m && "bg-card shadow-sm")}>{m}</button>
          ))}
        </div>
      </div>
      {mode !== "Day" && (
        <div className="grid grid-cols-7 border-b border-border/50 text-center text-[10px] font-bold uppercase text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(w => <div key={w} className="py-2">{w}</div>)}
        </div>
      )}
      <div className={cn("min-h-0 flex-1 overflow-auto", mode === "Day" ? "p-4" : "grid grid-cols-7")}>
        {days.map(day => {
          const items = on(day);
          const isToday = day === TODAY;
          const dim = mode === "Month" && d(day).getMonth() !== d(cursor).getMonth();
          if (mode === "Day") {
            return (
              <div key={day} className="space-y-2">
                {items.length === 0 && <p className="text-sm text-muted-foreground">No scheduled activities.</p>}
                {items.map(t => (
                  <button key={t.id} onClick={() => onSelect(t)} className="flex w-full items-center gap-3 rounded-xl border border-border/50 px-4 py-3 text-left hover:bg-card/60">
                    <span className={cn("h-2 w-2 rounded-full", fillFor(t).includes("primary/85") ? "bg-primary" : "bg-muted-foreground")} />
                    <span className="flex-1 text-sm font-medium">{t.title}</span>
                    <span className="text-[11px] text-muted-foreground">{t.assignee}</span>
                  </button>
                ))}
              </div>
            );
          }
          return (
            <div key={day} className={cn("min-h-[104px] border-b border-r border-border/35 p-1.5", dim && "opacity-40", mode === "Week" && "min-h-[320px]")}>
              <div className="mb-1 flex justify-end">
                <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold", isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>{d(day).getDate()}</span>
              </div>
              <div className="space-y-0.5">
                {items.slice(0, cap).map(t => <Pill key={t.id} t={t} />)}
                {items.length > cap && (
                  <button onClick={() => setPopover(day)} className="px-1 text-[9px] font-semibold text-muted-foreground hover:text-foreground">+{items.length - cap} more</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {popover && (
        <>
          <div className="fixed inset-0 z-[70]" onClick={() => setPopover(null)} />
          <div className="odyssey-surface absolute left-1/2 top-1/2 z-[80] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-display text-sm font-semibold">{fmtLong(popover)}</p>
              <button onClick={() => setPopover(null)} className="rounded-full p-1 hover:bg-card/70"><X size={13} /></button>
            </div>
            <div className="max-h-[280px] space-y-1 overflow-auto">
              {on(popover).map(t => (
                <button key={t.id} onClick={() => { onSelect(t); setPopover(null); }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/50 px-2 py-1.5 text-left text-[11px] hover:bg-card/70">
                  <span className="truncate">{t.title}</span>
                  <span className="shrink-0 text-[9px] text-muted-foreground">{t.status}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-3 border-t border-border/50 px-4 py-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-primary/85" />In progress</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-primary/12" />Scheduled</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-muted/60" />Complete</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm border-l-2 border-warning bg-warning/10" />Inspection</span>
        <span className="flex items-center gap-1.5"><Diamond size={8} className="fill-current" />Milestone</span>
      </div>
    </div>
  );
}
