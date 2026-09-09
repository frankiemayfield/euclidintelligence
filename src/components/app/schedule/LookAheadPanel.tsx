import { AlertTriangle, HardHat } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { d, fmtShort, lookAheadTasks, manpowerForecast, TODAY, type ScheduleTask } from "@/data/scheduleData";
import { builderNetwork, complianceTone } from "@/data/networkData";
import { EuclidImpact } from "@/components/app/active/EuclidImpact";

export function LookAheadPanel({ projectId, onSelect }: { projectId: string; onSelect: (t: ScheduleTask) => void }) {
  const tasks = lookAheadTasks(projectId, 14);
  const manpower = manpowerForecast(projectId, 10);
  const peak = Math.max(1, ...manpower.map(m => m.total));

  const risks = tasks
    .map(t => ({ t, c: t.companyId ? builderNetwork.find(b => b.id === t.companyId) : undefined }))
    .filter(r => r.c && r.c.complianceOverall && r.c.complianceOverall !== "In Compliance");

  const groups: { label: string; items: ScheduleTask[] }[] = [
    { label: "Active now", items: tasks.filter(t => t.start <= TODAY && t.status !== "Delayed") },
    { label: "Starting next 14 days", items: tasks.filter(t => t.start > TODAY) },
    { label: "Inspections", items: tasks.filter(t => t.category === "inspection") },
    { label: "Blocked / delayed", items: tasks.filter(t => t.status === "Delayed" || t.status === "Blocked") },
  ];

  return (
    <div className="grid min-h-0 flex-1 gap-3 overflow-auto lg:grid-cols-[1.6fr_1fr]">
      <div className="odyssey-surface space-y-4 rounded-2xl p-4">
        <div>
          <h2 className="font-display text-sm font-semibold">2 Week Look Ahead</h2>
          <p className="text-[11px] text-muted-foreground">{fmtShort(TODAY)} — {fmtShort(manpower[manpower.length - 1]?.date ?? TODAY)} · {tasks.length} activities requiring coordination</p>
        </div>
        {groups.map(g => (
          <section key={g.label}>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{g.label} · {g.items.length}</p>
            <div className="space-y-1">
              {g.items.length === 0 && <p className="text-[11px] text-muted-foreground">Nothing in this window.</p>}
              {g.items.map(t => (
                <button key={t.id} onClick={() => onSelect(t)}
                  className={cn("flex w-full items-center gap-2 rounded-xl border border-border/50 px-3 py-2 text-left hover:bg-card/60",
                    t.critical && "border-l-2 border-l-warning")}>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium">{t.title}</span>
                    <span className="block text-[10px] text-muted-foreground">{t.assignee} · {fmtShort(t.start)} – {fmtShort(t.finish)}</span>
                  </span>
                  {(t.status === "Delayed" || t.critical) && <AlertTriangle size={12} className="shrink-0 text-warning" />}
                  <span className="shrink-0 text-[10px] text-muted-foreground">{t.progress}%</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="space-y-3">
        <section className="odyssey-surface rounded-2xl p-4">
          <h3 className="mb-2 flex items-center gap-1.5 font-display text-sm font-semibold"><HardHat size={13} className="text-primary" />Upcoming manpower</h3>
          <div className="space-y-1.5">
            {manpower.map(m => (
              <div key={m.date} className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-[10px] text-muted-foreground">{d(m.date).toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}</span>
                <span className="h-2 rounded-full bg-primary/70" style={{ width: `${(m.total / peak) * 100}%` }} />
                <span className="text-[10px] font-semibold">{m.total}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-border/50 pt-2">
            <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Tomorrow by company</p>
            {(manpower[1] ?? manpower[0])?.byCompany.map(c => (
              <p key={c.name} className="flex justify-between text-[11px]"><span className="truncate text-muted-foreground">{c.name}</span><span className="font-semibold">{c.count}</span></p>
            ))}
          </div>
        </section>

        {risks.length > 0 && (
          <section className="odyssey-surface space-y-2 rounded-2xl p-4">
            <h3 className="font-display text-sm font-semibold">Compliance risk in window</h3>
            {risks.map(({ t, c }) => (
              <div key={t.id} className="rounded-xl border border-warning/40 bg-warning/10 p-2.5">
                <p className="text-[11px] font-semibold">{c!.name} — {t.title}</p>
                <p className="text-[10px] text-muted-foreground">Starts {fmtShort(t.start)}</p>
                <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold", complianceTone[c!.complianceOverall!])}>{c!.complianceOverall}</span>
                <Link to={`/network/${c!.id}`} className="ml-2 text-[10px] font-semibold text-warning hover:underline">Review compliance</Link>
              </div>
            ))}
          </section>
        )}

        <EuclidImpact domain="Schedule" tone={tasks.some(t => t.status === "Delayed") ? "warning" : "neutral"}
          message={`${tasks.length} activities fall inside the next 14 days, peaking at ${peak} workers on site. ${tasks.filter(t => t.critical).length} of them are on the critical path and drive current projected completion.`} />
      </div>
    </div>
  );
}
