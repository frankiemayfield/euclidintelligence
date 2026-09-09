import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, CalendarClock, Clock3, FileText, Sparkles } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { ScheduleModule } from "@/components/app/schedule/ScheduleModule";
import { documents, getProject, money } from "@/data/demoUniverse";
import { baselines, criticalTasks, fmtLong, lateTasks, statusFor, statusTone, todaysWork, upcoming } from "@/data/scheduleData";
import { clockedIn, entriesFor, laborCost, projectTeam, weekSummary, workerById } from "@/data/fieldData";
import { fmtWhen, projectActivity, urgencyTone } from "@/data/activityData";
import { builderNetwork, complianceTone } from "@/data/networkData";
import { cn } from "@/lib/utils";
import { TimeClockPanel } from "./TimeClockPanel";

const TABS = ["overview", "activity", "schedule", "time", "costs", "team", "documents"] as const;
type Tab = (typeof TABS)[number];
const LABELS: Record<Tab, string> = { overview: "Overview", activity: "Activity", schedule: "Schedule", time: "Time", costs: "Costs", team: "Team", documents: "Documents" };
const FUTURE = ["Change Orders", "Daily Logs", "RFIs", "Photos", "Punch / Closeout"];

function Panel({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("odyssey-surface rounded-2xl p-4", className)}>
      <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-sm font-semibold">{title}</h2>{action}</div>
      {children}
    </section>
  );
}

export default function ProjectWorkspacePage() {
  const { projectId = "downtown-ti", tab } = useParams();
  const track = useTrack();
  const navigate = useNavigate();
  const base = track === "sub" ? "/sub" : "/app";
  const project = getProject(projectId);
  const s = statusFor(projectId);
  const active: Tab = (TABS.includes(tab as Tab) ? tab : "overview") as Tab;
  const scopeCompanyId = track === "sub" ? "trueframe" : undefined;

  const entries = entriesFor(projectId).filter(e => !scopeCompanyId || workerById(e.workerId).companyId === scopeCompanyId);
  const onSite = clockedIn(projectId).filter(e => !scopeCompanyId || workerById(e.workerId).companyId === scopeCompanyId);
  const acts = projectActivity(track, projectId);
  const team = (projectTeam[projectId] ?? []).filter(m => !scopeCompanyId || m.companyId === scopeCompanyId || m.internal);
  const late = lateTasks(projectId);
  const crit = criticalTasks(projectId);
  const a = project.actuals;

  return (
    <TrackShell>
      <div className="mx-auto flex h-full w-full max-w-[1250px] flex-col p-4 lg:p-7">
        <header className="mb-4">
          <Link to={`${base}/active`} className="text-[11px] font-semibold text-primary">← {track === "sub" ? "Active Jobs" : "Active Projects"}</Link>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold">{project.name}</h1>
              <p className="text-xs text-muted-foreground">{project.client} · {project.location}</p>
            </div>
            <div className="flex flex-wrap gap-5 text-[11px]">
              {[["Project Manager", s.projectManager], ["Superintendent", s.superintendent], ["Current Phase", s.currentPhase], ["Status", s.mode === "active" ? "Active" : "Preconstruction"]].map(([l, v]) => (
                <div key={l}><p className="text-muted-foreground">{l}</p><p className="font-semibold">{v}</p></div>
              ))}
            </div>
          </div>
          <nav className="mt-4 flex flex-wrap gap-1 border-b border-border/50 pb-2">
            {TABS.map(t => (
              <button key={t} onClick={() => navigate(`${base}/active/${projectId}/${t}`)}
                className={cn("rounded-full px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground", active === t && "bg-card/70 text-foreground shadow-sm")}>{LABELS[t]}</button>
            ))}
            {FUTURE.map(f => <span key={f} className="rounded-full px-3 py-1.5 text-[12px] text-muted-foreground/40" title="Coming soon">{f}</span>)}
          </nav>
        </header>

        {active === "overview" && (
          <div className="grid gap-3 lg:grid-cols-3">
            <Panel title="Current Phase" className="lg:col-span-2">
              <p className="text-sm font-semibold">{s.currentPhase}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.percentComplete}% complete · forecast {fmtLong(s.forecastFinish)} · baseline {fmtLong(s.baselineFinish)}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted/60"><div className="h-full bg-primary" style={{ width: `${s.percentComplete}%` }} /></div>
            </Panel>
            <Panel title="Schedule Intelligence">
              <div className="space-y-1.5 text-[11px]">
                <p className="flex justify-between"><span className="text-muted-foreground">Completion forecast</span><b>{fmtLong(s.forecastFinish)}</b></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Baseline</span><b>{fmtLong(s.baselineFinish)}</b></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Variance</span><b className={s.variance > 0 ? "text-warning" : "text-success"}>{s.variance > 0 ? `+${s.variance} days` : "On baseline"}</b></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Critical activities</span><b>{crit.length}</b></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Delayed activities</span><b>{late.length}</b></p>
                {s.recovery && <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-primary/5 p-2 text-primary"><Sparkles size={11} className="mt-0.5" />Potential recovery: {s.recovery}</p>}
              </div>
            </Panel>

            <Panel title="Today's Work">
              {todaysWork(projectId).length ? todaysWork(projectId).map(t => (
                <div key={t.id} className="flex items-center justify-between border-b border-border/35 py-1.5 text-[11px] last:border-0">
                  <span className="truncate pr-2">{t.title}</span><span className="shrink-0 text-muted-foreground">{t.assignee}</span>
                </div>
              )) : <p className="text-[11px] text-muted-foreground">No field activities scheduled today.</p>}
            </Panel>

            <Panel title="What's Next">
              {upcoming(projectId, 6).map(t => (
                <div key={t.id} className="flex items-center justify-between border-b border-border/35 py-1.5 text-[11px] last:border-0">
                  <span className="truncate pr-2">{t.title}</span><span className="shrink-0 text-muted-foreground">{fmtLong(t.start)}</span>
                </div>
              ))}
            </Panel>

            <Panel title="Attention Needed">
              {late.length || crit.length ? [...late, ...crit.filter(c => !late.includes(c))].slice(0, 6).map(t => (
                <div key={t.id} className="flex items-start gap-2 border-b border-border/35 py-1.5 text-[11px] last:border-0">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0 text-warning" />
                  <span className="flex-1">{t.title}<span className="block text-[10px] text-muted-foreground">{t.status === "Delayed" ? "Delayed" : "Critical path"} · {t.assignee}</span></span>
                </div>
              )) : <p className="text-[11px] text-muted-foreground">Nothing needs attention right now.</p>}
            </Panel>

            <Panel title="Schedule Health" className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-4">
                {[["Baseline start", fmtLong(s.baselineStart)], ["Baseline finish", fmtLong(s.baselineFinish)], ["Current start", fmtLong(s.currentStart)], ["Forecast finish", fmtLong(s.forecastFinish)]].map(([l, v]) => (
                  <div key={l}><p className="text-muted-foreground">{l}</p><p className="font-semibold">{v}</p></div>
                ))}
              </div>
              <div className="mt-3 space-y-1 text-[10px] text-muted-foreground">
                {baselines.map(b => <p key={b.id}>{b.name} — set {b.created} by {b.by}. {b.reason}</p>)}
              </div>
            </Panel>

            <Panel title="Field Team">
              {onSite.length ? onSite.map(e => {
                const w = workerById(e.workerId);
                return <div key={e.id} className="flex items-center justify-between border-b border-border/35 py-1.5 text-[11px] last:border-0"><span>{w.name}<span className="block text-[10px] text-muted-foreground">{w.company}</span></span><span className="text-muted-foreground">In {e.clockIn}</span></div>;
              }) : <p className="text-[11px] text-muted-foreground">No one is clocked in on this project.</p>}
            </Panel>

            <Panel title="Cost Performance" className="lg:col-span-2">
              {a ? (
                <div className="grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-5">
                  {[["Original estimate", a.originalEstimate], ["Approved COs", a.approvedChangeOrders], ["Revised budget", a.revisedBudget], ["Actual to date", a.actualToDate], ["Forecast", a.forecastAtCompletion]].map(([l, v]) => (
                    <div key={l as string}><p className="text-muted-foreground">{l as string}</p><p className="font-semibold">{money(v as number)}</p></div>
                  ))}
                </div>
              ) : <p className="text-[11px] text-muted-foreground">Actual costs begin after award and construction start.</p>}
            </Panel>

            <Panel title="Recent Activity">
              {acts.slice(0, 6).map(e => (
                <div key={e.id} className="flex gap-2 border-b border-border/35 py-1.5 text-[11px] last:border-0">
                  <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", urgencyTone[e.urgency])} />
                  <span className="flex-1">{e.summary}<span className="block text-[10px] text-muted-foreground">{e.type} · {e.actor} · {fmtWhen(e.timestamp)}</span></span>
                </div>
              ))}
            </Panel>
          </div>
        )}

        {active === "activity" && (
          <div className="odyssey-surface overflow-hidden rounded-2xl">
            {acts.map(e => (
              <div key={e.id} className="flex gap-3 border-b border-border/45 px-5 py-3 last:border-0">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", urgencyTone[e.urgency])} />
                <div className="min-w-0 flex-1"><p className="text-sm font-medium">{e.summary}</p><p className="text-[11px] text-muted-foreground">{e.type} · {e.actor}{e.company ? ` · ${e.company}` : ""} · {fmtWhen(e.timestamp)}</p></div>
                <span className="shrink-0 rounded-full bg-secondary/80 px-2 py-0.5 text-[9px] font-bold uppercase">{e.status}</span>
              </div>
            ))}
            {!acts.length && <p className="p-6 text-sm text-muted-foreground">No activity recorded for this project yet.</p>}
          </div>
        )}

        {active === "schedule" && <ScheduleModule projectId={projectId} projectName={project.name} scopeCompanyId={scopeCompanyId} />}

        {active === "time" && <TimeClockPanel projectId={projectId} scopeCompanyId={scopeCompanyId} />}

        {active === "costs" && (
          <div className="space-y-3">
            {a ? (
              <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {[["Original estimate", a.originalEstimate], ["Approved COs", a.approvedChangeOrders], ["Revised budget", a.revisedBudget], ["Actual to date", a.actualToDate], ["Forecast at completion", a.forecastAtCompletion]].map(([l, v]) => (
                    <div key={l as string} className="odyssey-surface rounded-xl p-4 text-center"><p className="text-[10px] text-muted-foreground">{l as string}</p><p className="mt-1 font-display text-lg font-bold">{money(v as number)}</p></div>
                  ))}
                </div>
                <Panel title="Labor from time clock">
                  <p className="text-[11px] text-muted-foreground">This week: {weekSummary.regular} regular hours, {weekSummary.overtime} overtime, {money(weekSummary.laborCost)} labor cost (+{money(weekSummary.budgetVariance)} vs budget).</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Highest labor variance: {weekSummary.highestVariance.task} — estimated {weekSummary.highestVariance.estimated} hrs, forecast {weekSummary.highestVariance.actual} hrs (+{weekSummary.highestVariance.pct}%).</p>
                  <Link to={`${base}/est-vs-actual`} className="mt-2 inline-block text-[11px] font-semibold text-primary">Open Estimate vs Actual →</Link>
                </Panel>
                <Panel title="Cost transactions">
                  {a.transactions.map(t => (
                    <div key={t.id} className="flex items-center justify-between border-b border-border/35 py-2 text-[11px] last:border-0">
                      <span>{t.description}<span className="block text-[10px] text-muted-foreground">{t.source} · {t.id}</span></span>
                      <span className="flex items-center gap-3"><b>{money(t.amount)}</b><span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[9px] font-bold">{t.status}</span></span>
                    </div>
                  ))}
                </Panel>
              </>
            ) : <div className="odyssey-surface rounded-2xl p-8 text-center text-sm text-muted-foreground">Actual costs start once this project is in construction.</div>}
          </div>
        )}

        {active === "team" && (
          <div className="grid gap-3 md:grid-cols-2">
            {team.map(m => {
              const c = m.companyId ? builderNetwork.find(x => x.id === m.companyId) : undefined;
              return (
                <div key={m.name} className="odyssey-surface rounded-2xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">{m.name}</p>
                      <p className="text-[11px] text-muted-foreground">{m.role}</p>
                      {c ? <Link to={`/network/${c.id}`} className="text-[11px] font-semibold text-primary hover:underline">{m.company}</Link> : <p className="text-[11px]">{m.company}</p>}
                      {m.contact && <p className="text-[10px] text-muted-foreground">{m.contact}</p>}
                    </div>
                    {c?.complianceOverall && <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold", complianceTone[c.complianceOverall])}>{c.complianceOverall}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {active === "documents" && (
          <div className="odyssey-surface overflow-hidden rounded-2xl">
            {documents.filter(d => d.projectId === projectId).map(doc => (
              <div key={doc.id} className="flex items-center gap-3 border-b border-border/45 px-5 py-3 last:border-0">
                <FileText size={14} className="text-primary" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{doc.filename}</p><p className="text-[11px] text-muted-foreground">{doc.classification} · rev {doc.revision} · {doc.uploadedBy} · {doc.uploadedAt}</p></div>
              </div>
            ))}
            {!documents.some(d => d.projectId === projectId) && <p className="p-6 text-sm text-muted-foreground">No documents on this project yet.</p>}
          </div>
        )}
      </div>
    </TrackShell>
  );
}
