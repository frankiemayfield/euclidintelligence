import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays, categoryTone, d, TODAY, type ScheduleTask } from "@/data/scheduleData";

type Mode = "Month" | "Week" | "Day";

export function CalendarView({ tasks, anchor, selectedId, onSelect }: { tasks: ScheduleTask[]; anchor: string; selectedId?: string; onSelect: (t: ScheduleTask) => void }) {
  const [mode, setMode] = useState<Mode>("Month");
  const [cursor, setCursor] = useState(anchor);

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

  return (
    <div className="odyssey-surface flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl">
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
                    <span className={cn("h-2 w-2 rounded-full", categoryTone[t.category].dot)} />
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
                {items.slice(0, mode === "Week" ? 12 : 3).map(t => (
                  <button key={t.id} onClick={() => onSelect(t)}
                    className={cn("block w-full truncate rounded px-1.5 py-0.5 text-left text-[9px] font-medium text-background", categoryTone[t.category].bar, selectedId === t.id && "ring-1 ring-primary")}>
                    {t.title}
                  </button>
                ))}
                {items.length > (mode === "Week" ? 12 : 3) && <p className="px-1 text-[9px] text-muted-foreground">+{items.length - (mode === "Week" ? 12 : 3)} more</p>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 border-t border-border/50 px-4 py-2">
        {Object.entries(categoryTone).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className={cn("h-2 w-2 rounded-full", v.dot)} />{v.label}</span>
        ))}
      </div>
    </div>
  );
}
