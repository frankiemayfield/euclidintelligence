import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, CalendarClock, Clock3, FileText, Sparkles } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { ScheduleModule } from "@/components/app/schedule/ScheduleModule";
import { documents, getProject, money } from "@/data/demoUniverse";
import { baselines, criticalTasks, fmtLong, lateTasks, statusFor, statusTone, todaysWork, upcoming } from "@/data/scheduleData";
import { clockedIn, entriesFor, laborCost, projectTeam, weekSummary, workerById } from "@/data/fieldData";
import { EuclidImpact } from "@/components/app/active/EuclidImpact";
import { fmtWhen, projectActivity, urgencyTone } from "@/data/activityData";
import { builderNetwork, complianceTone } from "@/data/networkData";
import { cn } from "@/lib/utils";
import { ProjectHeader, ToolTabs } from "@/components/app/ProjectHeader";
import { StartConstruction } from "@/components/app/active/StartConstruction";
import { SelectionsPanel } from "@/components/app/selections/SelectionsPanel";
import { projectFinancials, selectionsFor } from "@/data/financialData";

const TABS = ["overview", "schedule", "selections", "activity", "documents", "team"] as const;
type Tab = (typeof TABS)[number];
const LABELS: Record<Tab, string> = { overview: "Overview", schedule: "Schedule", selections: "Selections", activity: "Activity", documents: "Documents", team: "Team" };
/** Operations tool row — Documents lives on the project-level row, not here. */
const OPS_TOOLS = ["overview", "schedule", "selections", "team", "activity"] as const;

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
  const fin = a ? projectFinancials(projectId) : null;
  const sels = selectionsFor(projectId);

  return (
    <TrackShell>
      <div className="mx-auto flex h-full w-full max-w-[1250px] flex-col p-4 lg:p-7">
        <ProjectHeader
          projectId={projectId}
          pillar="operations"
          tool={active}
          section={active === "overview" ? "overview" : active === "documents" ? "documents" : "operations"}
          subtitle={`${project.client} · ${project.location}`}
          meta={
            <div className="flex flex-wrap gap-5 text-[11px]">
              {[["Project Manager", s.projectManager], ["Superintendent", s.superintendent], ["Current Phase", s.currentPhase], ["Status", s.mode === "active" ? "Active" : "Preconstruction"]].map(([l, v]) => (
                <div key={l}><p className="text-muted-foreground">{l}</p><p className="font-semibold">{v}</p></div>
              ))}
            </div>
          }
        />

        {active !== "overview" && active !== "documents" && (
          <ToolTabs
            items={OPS_TOOLS.filter(t => t !== "overview").map(t => ({ id: t, label: LABELS[t] }))}
            active={active as (typeof OPS_TOOLS)[number]}
            onSelect={t => navigate(`${base}/active/${projectId}/${t}`)}
          />
        )}

        {active === "overview" && (
          <div className="grid gap-3 lg:grid-cols-3">
            {s.mode !== "active" && <div className="lg:col-span-3"><StartConstruction projectName={project.name} /></div>}
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

            <Panel title="Financial Summary" className="lg:col-span-2"
              action={<Link to={`${base}/financials/${projectId}/budget`} className="text-[11px] font-semibold text-primary">Open project Financials →</Link>}>
              {fin ? (
                <>
                  <div className="grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-5">
                    {[["Revised budget", money(fin.revised)], ["Committed", money(fin.committed)], ["Actual", money(fin.actual)], ["Forecast", money(fin.forecast)], ["Variance", `${fin.variance < 0 ? "-" : "+"}${money(Math.abs(fin.variance))}`]].map(([l, v]) => (
                      <div key={l as string}><p className="text-muted-foreground">{l as string}</p><p className="font-semibold">{v as string}</p></div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
                    <Link to={`${base}/financials/${projectId}/costs`} className="font-semibold text-primary">Costs</Link>
                    <Link to={`${base}/financials/${projectId}/commitments`} className="font-semibold text-primary">Commitments</Link>
                    <Link to={`${base}/financials/${projectId}/changes`} className="font-semibold text-primary">Changes</Link>
                    <Link to={`${base}/financials/${projectId}/billing`} className="font-semibold text-primary">Client Billing</Link>
                  </div>
                </>
              ) : <p className="text-[11px] text-muted-foreground">Project financials begin after award and construction start.</p>}
            </Panel>

            <Panel title="Selections">
              <p className="text-sm font-semibold">{sels.filter(x => ["Not Started", "Requested", "Reviewing"].includes(x.status)).length} selections need a decision</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{sels.filter(x => x.overdueDays).length} overdue · {sels.filter(x => x.status === "Ordered").length} ordered</p>
              <button onClick={() => navigate(`${base}/active/${projectId}/selections`)} className="mt-2 text-[11px] font-semibold text-primary">Open Selections →</button>
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

        {active === "selections" && <SelectionsPanel projectId={projectId} base={base} />}

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
