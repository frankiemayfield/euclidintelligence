import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CalendarDays, HardHat, Users } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { OperationsNav } from "@/components/app/OperationsNav";
import { getProject, projects } from "@/data/demoUniverse";
import { clockedIn, workerById } from "@/data/fieldData";
import { lateTasks, criticalTasks, scheduleHealth, statusFor, todaysWork, upcoming, fmtShort, fmtLong, TODAY, addDays, tasksFor } from "@/data/scheduleData";
import { selections } from "@/data/financialData";
import { cn } from "@/lib/utils";

function Card({ title, icon: Icon, action, children }: { title: string; icon: React.ElementType; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="odyssey-surface rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold"><Icon size={14} className="text-primary" />{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function OperationsOverviewPage() {
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const scopeCompanyId = track === "sub" ? "trueframe" : undefined;

  const scheduled = projects.filter(p => statusFor(p.id).mode !== "none");
  const active = scheduled.filter(p => statusFor(p.id).mode === "active");
  const ids = scheduled.map(p => p.id);
  const mine = (t: { companyId?: string }) => !scopeCompanyId || t.companyId === scopeCompanyId;

  const today = ids.flatMap(id => todaysWork(id).filter(mine).map(t => ({ ...t })));
  const weekEnd = addDays(TODAY, 7);
  const week = ids.flatMap(id => tasksFor(id).filter(t => mine(t) && t.status !== "Complete" && t.start > TODAY && t.start <= weekEnd))
    .sort((a, b) => a.start.localeCompare(b.start));
  const onSite = clockedIn().filter(e => !scopeCompanyId || workerById(e.workerId).companyId === scopeCompanyId);
  const coming = ids.flatMap(id => upcoming(id, 12).filter(mine)).sort((a, b) => a.start.localeCompare(b.start))
    .filter(t => !onSite.some(e => workerById(e.workerId).company === t.assignee)).slice(0, 5);

  const attention = [
    ...ids.flatMap(id => lateTasks(id).filter(mine).map(t => ({ key: t.id, project: id, title: t.title, note: `Delayed · finish ${fmtShort(t.finish)}`, tone: "danger" as const, to: `${base}/active/${id}/schedule` }))),
    ...ids.flatMap(id => criticalTasks(id).filter(t => mine(t) && (t.floatDays ?? 0) === 0 && t.status !== "Complete").slice(0, 2)
      .map(t => ({ key: `c-${t.id}`, project: id, title: t.title, note: "Critical path · zero float", tone: "warning" as const, to: `${base}/active/${id}/schedule` }))),
    ...(track === "sub" ? [] : selections.filter(s => (s.overdueDays ?? 0) > 0)
      .map(s => ({ key: s.id, project: s.projectId, title: s.title, note: `Selection ${s.overdueDays} days overdue`, tone: "warning" as const, to: `${base}/active/${s.projectId}/selections` }))),
  ].slice(0, 8);

  return (
    <TrackShell>
      <div className="mx-auto w-full max-w-[1250px] p-4 lg:p-7">
        <header className="mb-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Operations</p>
          <h1 className="font-display text-3xl font-semibold">Overview</h1>
          <p className="mt-2 text-sm text-muted-foreground">What is happening across every active job today, this week, and where attention is needed.</p>
        </header>
        <div className="mb-4"><OperationsNav base={base} active="overview" /></div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[["Active jobs", String(active.length)], ["Activities today", String(today.length)], ["On site now", String(onSite.length)], ["Needs attention", String(attention.length)]].map(([l, v]) => (
            <div key={l} className="odyssey-surface rounded-2xl px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{l}</p>
              <p className="font-display text-2xl font-semibold">{v}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <Card title="Active Jobs" icon={HardHat} action={<Link to={`${base}/projects`} className="flex items-center gap-1 text-[11px] font-semibold text-primary">All projects <ArrowRight size={11} /></Link>}>
            <div className="space-y-2">
              {scheduled.map(p => {
                const s = statusFor(p.id); const h = scheduleHealth(p.id);
                return (
                  <Link key={p.id} to={`${base}/active/${p.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 px-3 py-2.5 hover:bg-card/60">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{s.mode === "active" ? `Forecast finish ${fmtLong(s.forecastFinish)}` : "Preconstruction · draft schedule"}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", h.tone)}>{h.state}</span>
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card title="Attention Needed" icon={AlertTriangle}>
            {attention.length ? (
              <div className="space-y-1.5">
                {attention.map(a => (
                  <Link key={a.key} to={a.to} className="flex items-start gap-2.5 rounded-xl border border-border/50 px-3 py-2 hover:bg-card/60">
                    <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", a.tone === "danger" ? "bg-destructive" : "bg-warning")} />
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold">{a.title}</span>
                      <span className="block text-[10px] text-muted-foreground">{getProject(a.project).name} · {a.note}</span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : <p className="text-[12px] text-muted-foreground">Nothing needs attention across active jobs.</p>}
          </Card>

          <Card title="Today" icon={CalendarDays} action={<Link to={`${base}/schedule`} className="flex items-center gap-1 text-[11px] font-semibold text-primary">Schedule <ArrowRight size={11} /></Link>}>
            {today.length ? (
              <div className="space-y-1.5">
                {today.slice(0, 7).map(t => (
                  <div key={t.id} className="flex items-center gap-2.5 rounded-xl border border-border/50 px-3 py-2">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", t.category === "inspection" ? "bg-warning" : t.status === "In Progress" ? "bg-primary" : "bg-muted-foreground")} />
                    <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-medium">{t.title}</span>
                      <span className="block text-[10px] text-muted-foreground">{getProject(t.projectId).name} · {t.assignee}</span></span>
                  </div>
                ))}
              </div>
            ) : <p className="text-[12px] text-muted-foreground">No activities scheduled today.</p>}
          </Card>

          <Card title="This Week" icon={CalendarDays}>
            {week.length ? (
              <div className="space-y-1.5">
                {week.slice(0, 7).map(t => (
                  <div key={t.id} className="flex items-center justify-between gap-2 rounded-xl border border-border/50 px-3 py-2">
                    <span className="min-w-0"><span className="block truncate text-[12px] font-medium">{t.title}</span>
                      <span className="block text-[10px] text-muted-foreground">{getProject(t.projectId).name}</span></span>
                    <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">{fmtShort(t.start)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-[12px] text-muted-foreground">Nothing starts in the next seven days.</p>}
          </Card>

          <Card title="On Site" icon={Users} action={<Link to={`${base}/time`} className="flex items-center gap-1 text-[11px] font-semibold text-primary">Time Clock <ArrowRight size={11} /></Link>}>
            {onSite.length ? (
              <div className="space-y-1.5">
                {onSite.map(e => { const w = workerById(e.workerId); return (
                  <div key={e.id} className="flex items-center justify-between gap-2 rounded-xl border border-border/50 px-3 py-2">
                    <span className="min-w-0"><span className="block truncate text-[12px] font-semibold">{w.name}</span>
                      <span className="block text-[10px] text-muted-foreground">{w.company} · {getProject(e.projectId).name}</span></span>
                    <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">Clocked in</span>
                  </div>
                ); })}
              </div>
            ) : <p className="text-[12px] text-muted-foreground">No one is clocked in right now.</p>}
          </Card>

          <Card title="Coming On Site" icon={Users}>
            {coming.length ? (
              <div className="space-y-1.5">
                {coming.map(t => (
                  <div key={t.id} className="flex items-center justify-between gap-2 rounded-xl border border-border/50 px-3 py-2">
                    <span className="min-w-0"><span className="block truncate text-[12px] font-semibold">{t.assignee}</span>
                      <span className="block text-[10px] text-muted-foreground">{t.title} · {getProject(t.projectId).name}</span></span>
                    <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">{fmtShort(t.start)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-[12px] text-muted-foreground">No new companies mobilizing in the current window.</p>}
          </Card>
        </div>
      </div>
    </TrackShell>
  );
}
