import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { PageHeader, ScopeSelector, ALL_SCOPE } from "@/components/app/PageScope";
import { EuclidImpact } from "@/components/app/active/EuclidImpact";
import { isConstructionActive, projects, type DemoProject } from "@/data/demoUniverse";
import { operationsRoute, projectSection } from "@/lib/routes";
import {
  TODAY, addDays, criticalTasks, fmtShort, fmtLong, laborScopes, lateTasks, laborConsumedPct,
  manpowerForecast, productionImpact, productionState, statusFor, tasksFor, todaysWork, type ScheduleTask,
} from "@/data/scheduleData";
import { clockedIn, entriesFor, inPeriod, workerById } from "@/data/fieldData";
import { selectionsFor } from "@/data/financialData";
import { complianceCompanies, daysUntil, nextExpiration } from "@/data/networkData";
import { activityFor, activityGroups, fmtWhen } from "@/data/activityData";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ helpers */

const OPEN_SELECTION = ["Not Started", "Requested", "Reviewing", "Selected"];

const varianceTone = (days: number) =>
  days <= 0 ? "text-foreground" : days <= 5 ? "text-warning" : "text-destructive";
const varianceLabel = (days: number) => (days === 0 ? "On track" : days < 0 ? `${Math.abs(days)} days ahead` : `+${days} days`);

function Section({ title, note, action, children, className }: {
  title: string; note?: string; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={cn("precon-surface rounded-xl px-4 py-3", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {note && <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{note}</span>}
      </div>
      {children}
      {action}
    </section>
  );
}

/* ------------------------------------------------------------------- page */

export default function OperationsOverviewPage() {
  const track = useTrack();
  const navigate = useNavigate();
  const base = track === "sub" ? "/sub" : "/app";
  const scopeCompanyId = track === "sub" ? "trueframe" : undefined;
  const [scope, setScope] = useState(ALL_SCOPE);

  /** Eligibility is derived from the canonical project + schedule lifecycle — never a separate list. */
  const activeProjects = useMemo(
    () => projects.filter(p => statusFor(p.id).mode === "active" || isConstructionActive(p.id)),
    [],
  );
  const scoped = scope === ALL_SCOPE ? activeProjects : activeProjects.filter(p => p.id === scope);
  const ids = scoped.map(p => p.id);
  const mine = (t: { companyId?: string }) => !scopeCompanyId || t.companyId === scopeCompanyId;

  const openProject = (p: DemoProject) => navigate(projectSection(base, p.id, "overview"));

  /* ---------------- derived operational state ---------------- */
  const onSiteEntries = ids.flatMap(id => clockedIn(id))
    .filter(e => !scopeCompanyId || workerById(e.workerId).companyId === scopeCompanyId);
  const delayed = ids.flatMap(id => lateTasks(id).filter(mine));
  const criticalRisk = ids.flatMap(id => criticalTasks(id).filter(t => mine(t) && (t.floatDays ?? 0) === 0));
  const openSelections = track === "sub" ? [] : ids.flatMap(id => selectionsFor(id).filter(s => OPEN_SELECTION.includes(s.status)));

  const blockers = useMemo(() => complianceCompanies(track).filter(c =>
    c.projectIds.some(id => ids.includes(id)) && c.complianceOverall && c.complianceOverall !== "In Compliance"), [track, ids.join()]);

  const pulse: { value: string; label: string; strong?: boolean }[] = [
    { value: String(scoped.length), label: `active job${scoped.length === 1 ? "" : "s"}` },
    { value: String(onSiteEntries.length), label: "on site" },
    { value: String(delayed.length), label: `delayed activit${delayed.length === 1 ? "y" : "ies"}`, strong: delayed.length > 0 },
    { value: String(criticalRisk.length), label: "critical-path risks", strong: criticalRisk.length > 0 },
    ...(track === "sub" ? [] : [{ value: String(openSelections.length), label: "decisions due", strong: openSelections.length > 0 }]),
    { value: String(blockers.length), label: `blocker${blockers.length === 1 ? "" : "s"}`, strong: blockers.length > 0 },
  ];

  /* ---------------- today ---------------- */
  const todayByProject = scoped.map(p => {
    const tasks = todaysWork(p.id).filter(mine).filter(t => t.category !== "milestone" || t.start === TODAY);
    const entries = clockedIn(p.id).filter(e => !scopeCompanyId || workerById(e.workerId).companyId === scopeCompanyId);
    return { project: p, tasks: tasks.slice(0, 5), onSite: entries.length };
  }).filter(g => g.tasks.length || g.onSite);

  /* ---------------- next 7 days ---------------- */
  const weekEnd = addDays(TODAY, 7);
  const isConsequential = (t: ScheduleTask) =>
    t.milestone || t.category === "inspection" || t.critical || (t.labor?.crew ?? 0) >= 4;
  const next7 = ids
    .flatMap(id => tasksFor(id).filter(t => mine(t) && t.status !== "Complete" && t.start > TODAY && t.start <= weekEnd && isConsequential(t)))
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 8);

  /* ---------------- field labor ---------------- */
  const labor = scoped.map(p => {
    const active = clockedIn(p.id).filter(e => !scopeCompanyId || workerById(e.workerId).companyId === scopeCompanyId);
    const todayEntries = entriesFor(p.id).filter(e => inPeriod(e, "Today"))
      .filter(e => !scopeCompanyId || workerById(e.workerId).companyId === scopeCompanyId);
    const hours = Math.round(todayEntries.reduce((s, e) => s + e.regular + e.overtime, 0) * 10) / 10;
    const companies = new Set(active.map(e => workerById(e.workerId).company)).size;
    const planned = manpowerForecast(p.id, 1)[0]?.total ?? 0;
    return { project: p, onSite: active.length, companies, hours, planned, variance: active.length - planned };
  });

  const production = laborScopes.filter(s => ids.includes(s.projectId) && productionState(s) === "Production Risk");

  /* ---------------- needs attention ---------------- */
  type Item = { key: string; category: string; project: string; issue: string; action: string; to: string; rank: number };
  const attention: Item[] = [
    ...criticalRisk.slice(0, 3).map(t => ({
      key: `cp-${t.id}`, category: "Critical path", project: projName(t.projectId), rank: 1,
      issue: `${t.title} carries zero total float — any slip moves forecast completion.`,
      action: "Open Schedule", to: projectSection(base, t.projectId, "schedule"),
    })),
    ...delayed.slice(0, 3).map(t => ({
      key: `dl-${t.id}`, category: "Schedule", project: projName(t.projectId), rank: 2,
      issue: `${t.title} is delayed against a ${fmtShort(t.baselineFinish)} baseline finish.`,
      action: "Open Schedule", to: projectSection(base, t.projectId, "schedule"),
    })),
    ...openSelections.filter(s => (s.overdueDays ?? 0) > 0 || s.decisionDue <= addDays(TODAY, 7)).slice(0, 3).map(s => ({
      key: `sel-${s.id}`, category: "Selection", project: projName(s.projectId), rank: 3,
      issue: `${s.title} is ${(s.overdueDays ?? 0) > 0 ? `${s.overdueDays} days overdue` : `due ${fmtShort(s.decisionDue)}`} with a ${s.leadTimeWeeks}-week lead time against a ${fmtShort(s.requiredOnSite)} required-on-site date.`,
      action: "Open Selection", to: projectSection(base, s.projectId, "selections"),
    })),
    ...blockers.slice(0, 2).map(c => {
      const exp = nextExpiration(c);
      return {
        key: `cmp-${c.id}`, category: "Compliance", project: c.name, rank: 4,
        issue: `${c.complianceOverall} — coverage ${exp ? `expires ${fmtShort(exp)} (${daysUntil(exp)} days)` : "is incomplete"}, blocking mobilization.`,
        action: "Review Compliance", to: `/network/${c.id}`,
      };
    }),
    ...labor.filter(l => l.variance < 0).slice(0, 2).map(l => ({
      key: `mp-${l.project.id}`, category: "Manpower", project: l.project.name, rank: 5,
      issue: `Crew is ${Math.abs(l.variance)} worker${Math.abs(l.variance) === 1 ? "" : "s"} below planned loading for scheduled work today.`,
      action: "Open Time Clock", to: operationsRoute(base, "time-clock"),
    })),
  ].sort((a, b) => a.rank - b.rank).slice(0, 7);

  const attentionCount = (projectId: string) =>
    attention.filter(a => a.project === projName(projectId)).length;

  /* ---------------- constraints ---------------- */
  const inspections = ids.flatMap(id => tasksFor(id).filter(t =>
    mine(t) && t.category === "inspection" && t.status !== "Complete" && t.start <= addDays(TODAY, 14)));
  const constraints = [
    { key: "sel", label: "Selections", note: `${openSelections.length} decision${openSelections.length === 1 ? "" : "s"} affecting upcoming work`, count: openSelections.length, to: scoped[0] ? projectSection(base, scoped[0].id, "selections") : undefined },
    { key: "cmp", label: "Compliance", note: `${blockers.length} subcontractor${blockers.length === 1 ? "" : "s"} not cleared for mobilization`, count: blockers.length, to: `${base}/compliance` },
    { key: "insp", label: "Inspections", note: `${inspections.length} required inspection${inspections.length === 1 ? "" : "s"} in the next 14 days`, count: inspections.length, to: operationsRoute(base, "schedule") },
  ].filter(c => c.count > 0);

  /* ---------------- recent field activity ---------------- */
  const recent = activityFor(track)
    .filter(a => activityGroups[a.type] === "Construction")
    .filter(a => !a.projectId || ids.includes(a.projectId))
    .filter(a => scope === ALL_SCOPE || a.projectId === scope)
    .slice(0, 5);

  const recovery = scoped.map(p => ({ p, s: statusFor(p.id) })).find(x => x.s.recovery);

  return (
    <TrackShell>
      <div className="app-shell py-4 lg:py-7">
        <PageHeader
          eyebrow="Operations"
          title="Overview"
          description="See what is happening across active jobs, what is falling behind, and what needs action."
          className="mb-3"
          right={
            <ScopeSelector allLabel="All Active Projects" value={scope} projects={activeProjects}
              noteFor={p => statusFor(p.id).currentPhase} onChange={setScope} />
          }
        />

        <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
          {pulse.map((item, index) => (
            <span key={item.label} className="flex items-center gap-2">
              {index > 0 && <span className="text-border">·</span>}
              <span>
                <span className={cn("font-semibold tabular-nums", item.strong ? "text-warning" : "text-foreground")}>{item.value}</span>{" "}
                {item.label}
              </span>
            </span>
          ))}
        </p>

        {scoped.length === 0 ? (
          <section className="precon-surface rounded-xl px-4 py-6 text-[12px] text-muted-foreground">
            No jobs have entered active construction yet. Projects appear here automatically once construction starts —
            preconstruction work stays in <Link to={`${base}/precon/overview`} className="font-semibold text-primary hover:underline">Precon Overview</Link>.
          </section>
        ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
          {/* ---------------------------------------------------- MAIN */}
          <div className="order-2 flex flex-col gap-4 lg:order-1">
            <section className="precon-surface overflow-hidden rounded-xl">
              <header className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                <h2 className="font-display text-base font-semibold">Active Project Execution</h2>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {scoped.length} job{scoped.length === 1 ? "" : "s"} · {onSiteEntries.length} on site
                </span>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-border/50 text-[9.5px] uppercase tracking-[.12em] text-muted-foreground">
                      <th className="px-4 py-2 font-semibold">Project</th>
                      <th className="px-3 py-2 font-semibold">Phase</th>
                      <th className="px-3 py-2 font-semibold">Progress</th>
                      <th className="px-3 py-2 font-semibold">Forecast Finish</th>
                      <th className="px-3 py-2 font-semibold">Schedule</th>
                      <th className="px-3 py-2 text-right font-semibold">On Site</th>
                      <th className="px-3 py-2 font-semibold">Next Milestone</th>
                      <th className="px-4 py-2 text-right font-semibold">Attention</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoped.map(p => {
                      const s = statusFor(p.id);
                      const milestone = tasksFor(p.id)
                        .filter(t => mine(t) && t.status !== "Complete" && (t.milestone || t.category === "inspection"))
                        .sort((a, b) => a.start.localeCompare(b.start))[0];
                      const onSite = clockedIn(p.id).filter(e => !scopeCompanyId || workerById(e.workerId).companyId === scopeCompanyId).length;
                      const count = attentionCount(p.id);
                      return (
                        <tr key={p.id} className="group border-b border-border/35 transition-colors last:border-0 hover:bg-primary/5">
                          <td className="px-4 py-2.5">
                            <button onClick={() => openProject(p)} className="block text-left font-semibold leading-tight hover:text-primary">
                              {p.name}
                            </button>
                            <span className="block truncate text-[10.5px] text-muted-foreground">{p.client} · {p.location}</span>
                          </td>
                          <td className="px-3 py-2.5 text-[11.5px] text-muted-foreground">{s.currentPhase}</td>
                          <td className="px-3 py-2.5">
                            <span className="font-semibold tabular-nums">{s.percentComplete}%</span>
                            <span className="mt-1 block h-1 w-16 overflow-hidden rounded-full bg-muted/60">
                              <span className="block h-full rounded-full bg-primary" style={{ width: `${s.percentComplete}%` }} />
                            </span>
                          </td>
                          <td className="px-3 py-2.5 tabular-nums">{fmtShort(s.forecastFinish)}</td>
                          <td className="px-3 py-2.5">
                            <Link to={projectSection(base, p.id, "schedule")}
                              className={cn("font-semibold hover:underline", varianceTone(s.variance))}>
                              {varianceLabel(s.variance)}
                            </Link>
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{onSite}</td>
                          <td className="px-3 py-2.5 text-[11.5px]">
                            {milestone ? (
                              <span className="flex items-center gap-1.5">
                                <span className="truncate">{milestone.title}</span>
                                <span className="shrink-0 text-muted-foreground">· {fmtShort(milestone.start)}</span>
                              </span>
                            ) : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {count > 0 ? (
                              <button onClick={() => openProject(p)}
                                className="inline-flex items-center gap-1 font-semibold text-warning hover:underline">
                                {count}<ArrowRight size={11} />
                              </button>
                            ) : <span className="text-muted-foreground">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <Section title="Today" note={`${todayByProject.reduce((s, g) => s + g.tasks.length, 0)} activities`}
              action={
                <Link to={operationsRoute(base, "schedule")} className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                  Open Company Schedule <ArrowRight size={11} />
                </Link>
              }>
              <div className="mt-2 space-y-3">
                {todayByProject.map(group => (
                  <div key={group.project.id} className="border-t border-border/40 pt-2 first:border-0 first:pt-0">
                    <p className="flex items-baseline justify-between gap-3">
                      <button onClick={() => openProject(group.project)} className="text-[12px] font-semibold hover:text-primary">{group.project.name}</button>
                      <span className="text-[10.5px] text-muted-foreground">{group.onSite} worker{group.onSite === 1 ? "" : "s"} on site</span>
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {group.tasks.map(t => (
                        <li key={t.id} className="flex items-baseline justify-between gap-3 text-[11.5px]">
                          <span className="min-w-0 truncate">
                            <span className="text-muted-foreground">{t.assignee} — </span>{t.title}
                          </span>
                          <span className="shrink-0 text-[10.5px] text-muted-foreground">
                            {t.category === "inspection" ? "Inspection" : t.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {todayByProject.length === 0 && <p className="text-[12px] text-muted-foreground">No field work is scheduled across active jobs today.</p>}
              </div>
            </Section>

            <Section title="Next 7 Days" note="Consequential work">
              <ul className="mt-2 divide-y divide-border/40">
                {next7.map(t => (
                  <li key={t.id}>
                    <Link to={projectSection(base, t.projectId, "schedule")} className="flex w-full items-baseline gap-4 py-2 text-left hover:text-primary">
                      <span className="w-14 shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground">{fmtShort(t.start)}</span>
                      <span className="min-w-0 flex-1 truncate text-[12px]">
                        <span className="font-medium">{projName(t.projectId)}</span>
                        <span className="text-muted-foreground"> — {t.title}</span>
                      </span>
                      {t.critical && <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-warning">Critical</span>}
                    </Link>
                  </li>
                ))}
                {next7.length === 0 && <li className="py-2 text-[12px] text-muted-foreground">No milestones, inspections or major mobilizations in the next seven days.</li>}
              </ul>
            </Section>

            <Section title="Schedule Health" note="Baseline vs forecast">
              <div className="mt-2 space-y-3">
                {scoped.map(p => {
                  const s = statusFor(p.id);
                  const delayedCount = lateTasks(p.id).filter(mine).length;
                  const criticalCount = criticalTasks(p.id).filter(mine).length;
                  const milestone = tasksFor(p.id).filter(t => mine(t) && t.status !== "Complete" && t.milestone)
                    .sort((a, b) => a.start.localeCompare(b.start))[0];
                  return (
                    <div key={p.id} className="border-t border-border/40 pt-2 first:border-0 first:pt-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <button onClick={() => openProject(p)} className="text-[12px] font-semibold hover:text-primary">{p.name}</button>
                        <Link to={projectSection(base, p.id, "schedule")} className="text-[11px] font-semibold text-primary hover:underline">Open Schedule</Link>
                      </div>
                      <dl className="mt-1.5 grid gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-5">
                        <div>
                          <dt className="text-[9.5px] font-semibold uppercase tracking-[.12em] text-muted-foreground">Variance</dt>
                          <dd className={cn("text-[15px] font-semibold tabular-nums", varianceTone(s.variance))}>{varianceLabel(s.variance)}</dd>
                          <dd className="text-[10.5px] text-muted-foreground">{fmtLong(s.forecastFinish)} vs {fmtShort(s.baselineFinish)} baseline</dd>
                        </div>
                        <div>
                          <dt className="text-[9.5px] font-semibold uppercase tracking-[.12em] text-muted-foreground">Baseline finish</dt>
                          <dd className="text-[13px] font-medium tabular-nums">{fmtLong(s.baselineFinish)}</dd>
                        </div>
                        <div>
                          <dt className="text-[9.5px] font-semibold uppercase tracking-[.12em] text-muted-foreground">Critical activities</dt>
                          <dd className="text-[13px] font-medium tabular-nums">{criticalCount}</dd>
                        </div>
                        <div>
                          <dt className="text-[9.5px] font-semibold uppercase tracking-[.12em] text-muted-foreground">Delayed</dt>
                          <dd className={cn("text-[13px] font-medium tabular-nums", delayedCount > 0 && "text-warning")}>{delayedCount}</dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-[9.5px] font-semibold uppercase tracking-[.12em] text-muted-foreground">Next milestone</dt>
                          <dd className="truncate text-[13px] font-medium">{milestone ? `${milestone.title} · ${fmtShort(milestone.start)}` : "—"}</dd>
                        </div>
                      </dl>
                    </div>
                  );
                })}
              </div>
              {recovery?.s.recovery && (
                <EuclidImpact domain="Schedule" tone="neutral" className="mt-3"
                  message={`${recovery.p.name} may recover approximately ${recovery.s.recovery}.`}
                  action={{ label: "Open Schedule", to: projectSection(base, recovery.p.id, "schedule") }} />
              )}
            </Section>

            <Section title="Field Labor" note="Today"
              action={
                <Link to={operationsRoute(base, "time-clock")} className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                  Open Time Clock <ArrowRight size={11} />
                </Link>
              }>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-border/50 text-[9.5px] uppercase tracking-[.12em] text-muted-foreground">
                      <th className="py-2 pr-3 font-semibold">Project</th>
                      <th className="px-3 py-2 text-right font-semibold">On Site</th>
                      <th className="px-3 py-2 text-right font-semibold">Companies</th>
                      <th className="px-3 py-2 text-right font-semibold">Hours Today</th>
                      <th className="px-3 py-2 text-right font-semibold">Planned Crew</th>
                      <th className="py-2 pl-3 text-right font-semibold">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labor.map(l => (
                      <tr key={l.project.id} className="border-b border-border/35 last:border-0">
                        <td className="py-2 pr-3 font-medium">{l.project.name}</td>
                        <td className="px-3 py-2 text-right font-semibold tabular-nums">{l.onSite}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{l.companies}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{l.hours}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{l.planned}</td>
                        <td className={cn("py-2 pl-3 text-right text-[11.5px] font-semibold", l.variance < 0 ? "text-warning" : "text-muted-foreground")}>
                          {l.variance === 0 ? "On plan" : `${l.variance > 0 ? "+" : ""}${l.variance} workers`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {production.map(s => (
                <p key={s.id} className="mt-2 border-t border-border/40 pt-2 text-[11px] leading-snug text-muted-foreground">
                  <span className="font-semibold text-foreground">{s.scope}</span> is {s.progress}% complete and has consumed {laborConsumedPct(s)}% of estimated labor hours. {productionImpact(s).split(". ").slice(1).join(". ")}
                </p>
              ))}
            </Section>
          </div>

          {/* ---------------------------------------------------- RIGHT RAIL */}
          <div className="order-1 flex flex-col gap-4 lg:order-2">
            <Section title="Needs Attention" note={String(attention.length)}>
              <ul className="mt-2 divide-y divide-border/40">
                {attention.map(item => (
                  <li key={item.key} className="py-2.5">
                    <p className="text-[9.5px] font-semibold uppercase tracking-[.12em] text-muted-foreground">{item.category}</p>
                    <p className="mt-0.5 text-[12px] font-semibold">{item.project}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{item.issue}</p>
                    <Link to={item.to} className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                      {item.action}<ArrowRight size={11} />
                    </Link>
                  </li>
                ))}
                {attention.length === 0 && <li className="py-2 text-[11px] text-muted-foreground">Nothing is blocking the field right now.</li>}
              </ul>
            </Section>

            <Section title="Constraints" note="Blocking scheduled work">
              <ul className="mt-2 divide-y divide-border/40">
                {constraints.map(c => (
                  <li key={c.key} className="flex items-start justify-between gap-3 py-2">
                    <span className="min-w-0">
                      <span className="block text-[11.5px] font-semibold">{c.label}</span>
                      <span className="block text-[10.5px] leading-snug text-muted-foreground">{c.note}</span>
                    </span>
                    {c.to && (
                      <Link to={c.to} className="shrink-0 text-[11px] font-semibold text-primary hover:underline">View Details</Link>
                    )}
                  </li>
                ))}
                {constraints.length === 0 && <li className="py-2 text-[11px] text-muted-foreground">Nothing is currently constraining scheduled work.</li>}
              </ul>
            </Section>

            <Section title="Recent Field Activity"
              action={
                <Link to="/activity" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                  View All Activity <ArrowRight size={11} />
                </Link>
              }>
              <ul className="mt-2 divide-y divide-border/40">
                {recent.map(event => (
                  <li key={event.id} className="py-2">
                    <Link to={event.route ?? "/activity"} className="block hover:text-primary">
                      <span className="block text-[11.5px] leading-snug">{event.summary}</span>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">{event.project ?? event.company} · {fmtWhen(event.timestamp)}</span>
                    </Link>
                  </li>
                ))}
                {recent.length === 0 && <li className="py-2 text-[11px] text-muted-foreground">No recent field activity.</li>}
              </ul>
            </Section>
          </div>
        </div>
        )}
      </div>
    </TrackShell>
  );
}

function projName(projectId: string) {
  return projects.find(p => p.id === projectId)?.name ?? projectId;
}
