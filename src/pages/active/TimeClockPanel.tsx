import { useState } from "react";
import { Clock3, Coffee, LogIn, LogOut, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { clockedIn, entriesFor, laborCost, timeEntries, weekSummary, workerById, type TimeEntry, type TimeStatus } from "@/data/fieldData";
import { money } from "@/data/demoUniverse";
import { getProject } from "@/data/demoUniverse";

const statusTone: Record<TimeStatus, string> = {
  Active: "bg-primary/15 text-primary",
  Complete: "bg-muted text-muted-foreground",
  "Needs Review": "bg-warning/20 text-warning",
  Edited: "bg-info/15 text-info",
  Approved: "bg-success/15 text-success",
};

export function TimeClockPanel({ projectId, scopeCompanyId, companyLevel }: { projectId?: string; scopeCompanyId?: string; companyLevel?: boolean }) {
  const [filter, setFilter] = useState<"All" | TimeStatus>("All");
  const inScope = (e: TimeEntry) => (!projectId || e.projectId === projectId) && (!scopeCompanyId || workerById(e.workerId).companyId === scopeCompanyId);
  const all = timeEntries.filter(inScope);
  const current = all.filter(e => e.status === "Active");
  const rows = all.filter(e => filter === "All" || e.status === filter);
  const cost = laborCost(all);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["Regular hours (week)", `${weekSummary.regular}`], ["Overtime", `${weekSummary.overtime}`], ["Labor cost", money(weekSummary.laborCost)], ["vs Budget", `+${money(weekSummary.budgetVariance)}`]].map(([l, v], i) => (
          <div key={l} className="odyssey-surface rounded-xl p-4 text-center"><p className="text-[10px] text-muted-foreground">{l}</p><p className={cn("mt-1 font-display text-lg font-bold", i === 3 && "text-warning")}>{v}</p></div>
        ))}
      </div>

      <section className="odyssey-surface rounded-2xl p-4">
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold"><Clock3 size={14} className="text-primary" />Currently Clocked In <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">{current.length}</span></h2>
        <div className="grid gap-2 md:grid-cols-2">
          {current.map(e => {
            const w = workerById(e.workerId);
            return (
              <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border/50 p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">{w.initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold">{w.name}</p>
                  <p className="text-[10px] text-muted-foreground">{getProject(e.projectId).name} · {e.costCode}</p>
                </div>
                <div className="text-right text-[10px]"><p className="font-semibold">{e.clockIn}</p><p className="text-muted-foreground">{Math.floor(e.regular)}h {Math.round((e.regular % 1) * 60)}m</p></div>
                <div className="flex gap-1">
                  <button className="rounded-full border border-border/60 p-1.5" title="Break"><Coffee size={11} /></button>
                  <button className="rounded-full border border-border/60 p-1.5" title="Clock out"><LogOut size={11} /></button>
                </div>
              </div>
            );
          })}
          {!current.length && <p className="text-[11px] text-muted-foreground">Nobody is clocked in right now.</p>}
        </div>
        <button className="mt-3 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"><LogIn size={12} />Clock In Worker</button>
      </section>

      <section className="odyssey-surface overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/50 px-4 py-3">
          <h2 className="font-display text-sm font-semibold">Time Entries</h2>
          <div className="ml-auto flex gap-1">
            {(["All", "Active", "Complete", "Needs Review", "Edited", "Approved"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold", filter === f ? "border-primary/50 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground")}>{f}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead><tr className="border-b border-border/50 text-[10px] uppercase text-muted-foreground">
              {["Employee", "Project", "Date", "In", "Out", "Break", "Reg", "OT", "Cost code", "Labor cost", "Status"].map(h => <th key={h} className="px-3 py-2 text-left font-bold">{h}</th>)}
            </tr></thead>
            <tbody>
              {rows.map(e => {
                const w = workerById(e.workerId);
                return (
                  <tr key={e.id} className="border-b border-border/30">
                    <td className="px-3 py-2"><span className="font-medium">{w.name}</span><span className="block text-[10px] text-muted-foreground">{w.company}</span></td>
                    <td className="px-3 py-2 text-muted-foreground">{getProject(e.projectId).name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{e.date}</td>
                    <td className="px-3 py-2">{e.clockIn}</td>
                    <td className="px-3 py-2">{e.clockOut ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{e.breakMinutes}m</td>
                    <td className="px-3 py-2">{e.regular}</td>
                    <td className="px-3 py-2">{e.overtime || "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{e.phase} / {e.costCode}</td>
                    <td className="px-3 py-2 font-semibold">{money(e.regular * w.rate + e.overtime * w.rate * 1.5)}</td>
                    <td className="px-3 py-2"><span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold", statusTone[e.status])}>{e.status}</span>{e.notes && <span className="ml-1 inline-block align-middle" title={e.notes}><Pencil size={9} className="text-muted-foreground" /></span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border/50 px-4 py-2 text-[11px] text-muted-foreground">
          {rows.length} entries · total mapped labor cost {money(cost)} · loaded rates by trade
        </div>
      </section>

      <section className="odyssey-surface rounded-2xl p-4">
        <h2 className="mb-2 font-display text-sm font-semibold">Highest Labor Variance</h2>
        <p className="text-[11px] text-muted-foreground">{weekSummary.highestVariance.task} — estimated {weekSummary.highestVariance.estimated} hrs vs actual/forecast {weekSummary.highestVariance.actual} hrs (+{weekSummary.highestVariance.pct}%). Hours map to Interior Finishes / Finish Carpentry and flow into Estimate vs Actual.</p>
      </section>
    </div>
  );
}
