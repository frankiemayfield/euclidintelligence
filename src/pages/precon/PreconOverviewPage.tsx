import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Minus, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { PageHeader, ScopeSelector, ALL_SCOPE } from "@/components/app/PageScope";
import { EuclidImpact } from "@/components/app/active/EuclidImpact";
import { getProjectRoute, money, projects, quotes, type DemoProject } from "@/data/demoUniverse";
import { activityFor, activityGroups, fmtWhen } from "@/data/activityData";
import { statusFor } from "@/data/scheduleData";
import { useDemoProject } from "@/hooks/use-demo-project";
import { cn } from "@/lib/utils";

type Health = "On Track" | "Needs Review" | "Waiting" | "Attention" | "Ready" | "In Progress";

const healthTone: Record<Health, string> = {
  "On Track": "text-muted-foreground",
  "Needs Review": "text-warning",
  Waiting: "text-info",
  Attention: "text-destructive",
  Ready: "text-success",
  "In Progress": "text-muted-foreground",
};

/** Next action and health are derived from the shared project record — no new mock data. */
function rowFor(project: DemoProject, stage: string): { action: string; health: Health } {
  switch (stage) {
    case "Document Upload":
      return { action: "Complete plan intake", health: "In Progress" };
    case "Scope Analyzer":
      return { action: `Review ${project.assumptions} assumption${project.assumptions === 1 ? "" : "s"}`, health: "Needs Review" };
    case "Bid Packages":
      return { action: "Follow up with outstanding bidders", health: "Waiting" };
    case "Estimate":
      return { action: "Complete estimate build", health: "In Progress" };
    case "Pricing & Margin":
      return { action: "Review margin", health: "Attention" };
    case "Proposal Export":
      return { action: "Send proposal", health: "Ready" };
    default:
      return { action: "Review project", health: "On Track" };
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dueOrder = (due?: string) => {
  if (!due) return Number.MAX_SAFE_INTEGER;
  const [month, day] = due.split(" ");
  return MONTHS.indexOf(month) * 100 + Number(day ?? 0);
};

const deadlineNote: Record<string, string> = {
  "Document Upload": "Plan intake due",
  "Scope Analyzer": "Scope signoff",
  "Bid Packages": "Bid responses due",
  Estimate: "Estimate due",
  "Pricing & Margin": "Pricing review",
  "Proposal Export": "Proposal due",
};

const marketSignals = [
  { trade: "Framing — Cincinnati", signal: "Labor + material rate", trend: 4.2 },
  { trade: "Electrical", signal: "Bid spread widening", trend: 6.8 },
  { trade: "Concrete", signal: "Lead times stable", trend: 1.4 },
  { trade: "Framing lumber", signal: "Pricing moderately elevated", trend: 3.9 },
];

export default function PreconOverviewPage() {
  const track = useTrack();
  const navigate = useNavigate();
  const { setProjectId } = useDemoProject();
  const base = track === "sub" ? "/sub" : "/app";
  const owner = track === "sub" ? "Tyler" : "Frankie";
  const [scope, setScope] = useState(ALL_SCOPE);

  const precon = useMemo(() => projects.filter(p => statusFor(p.id).mode !== "active"), []);
  const stageOf = (project: DemoProject) => (track === "sub" ? project.subStage : project.builderStage);
  const scoped = scope === ALL_SCOPE ? precon : precon.filter(p => p.id === scope);

  const open = (project: DemoProject) => { setProjectId(project.id); navigate(getProjectRoute(project, track)); };

  const pipelineValue = scoped.reduce((total, p) => total + (p.clientPrice ?? 0), 0);
  const estimatesInProgress = scoped.filter(p => ["Scope Analyzer", "Estimate", "Pricing & Margin"].includes(stageOf(p)));
  const proposalsReady = scoped.filter(p => stageOf(p) === "Proposal Export");
  const awaitingBids = quotes.filter(q => scoped.some(p => p.id === q.projectId) && /pend|await|progress|request/i.test(q.status));

  const attention = useMemo(() => {
    const rank: Record<string, number> = { "Bid Packages": 0, "Pricing & Margin": 1, "Scope Analyzer": 2, "Document Upload": 3, "Proposal Export": 4 };
    return scoped
      .filter(p => p.attention)
      .slice()
      .sort((a, b) => (rank[stageOf(a)] ?? 9) - (rank[stageOf(b)] ?? 9));
  }, [scoped, track]);

  const deadlines = scoped.filter(p => p.bidDue).slice().sort((a, b) => dueOrder(a.bidDue) - dueOrder(b.bidDue));

  const scores = scoped.map(p => (track === "sub" ? p.subProposalScore : p.proposalScore)).filter((s): s is number => s != null);
  const avgScore = scores.length ? Math.round(scores.reduce((total, s) => total + s, 0) / scores.length) : null;
  const markups = scoped.map(p => p.markup).filter((m): m is number => m != null);
  const avgMarkup = markups.length ? (markups.reduce((total, m) => total + m, 0) / markups.length).toFixed(1) : "—";
  const grossMargin = markups.length ? (100 - 100 / (1 + Number(avgMarkup) / 100)).toFixed(1) : "—";

  const recent = activityFor(track)
    .filter(a => activityGroups[a.type] === "Preconstruction")
    .filter(a => scope === ALL_SCOPE || a.projectId === scope)
    .slice(0, 5);

  const performance = [
    { label: "Proposal score", value: avgScore != null ? `${avgScore} avg` : "—", context: `${scores.length} scored proposal${scores.length === 1 ? "" : "s"} · +4 vs prior 90 days` },
    { label: "Estimate accuracy", value: "3.8% avg variance", context: "Last 8 completed projects · target ±5%" },
    { label: "Bid coverage", value: "3.4 bids / package", context: "82% sub response rate, Cincinnati metro" },
    { label: "Average markup", value: `${avgMarkup}%`, context: `Company target 20% · ${markups.length} priced project${markups.length === 1 ? "" : "s"}` },
    { label: "Gross margin", value: `${grossMargin}%`, context: "Derived from current client pricing" },
    { label: "Estimate cycle time", value: "6 days", context: "Intake to proposal, trailing 90 days" },
  ];

  const summary = [
    `${scoped.length} active project${scoped.length === 1 ? "" : "s"}`,
    `${money(pipelineValue)} pipeline`,
    `${estimatesInProgress.length} estimate${estimatesInProgress.length === 1 ? "" : "s"} in progress`,
    `${proposalsReady.length} proposal${proposalsReady.length === 1 ? "" : "s"} ready`,
    `${attention.length} item${attention.length === 1 ? "" : "s"} need attention`,
  ];

  return (
    <TrackShell>
      <div className="mx-auto w-full max-w-[1250px] p-4 lg:p-7">
        <PageHeader
          eyebrow="Preconstruction"
          title="Preconstruction Overview"
          description="See where every project stands before construction begins, what needs action, and what is coming next."
          className="mb-3"
          right={
            <div className="flex items-center gap-2">
              <ScopeSelector allLabel="All Precon Projects" value={scope} projects={precon} noteFor={p => stageOf(p)} onChange={setScope} />
              <Link to={track === "sub" ? `${base}/upload` : `${base}/new-project`}
                className="flex items-center gap-1 rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-[12px] font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary">
                <Plus size={12} />New Project
              </Link>
            </div>
          }
        />

        <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
          {summary.map((item, index) => (
            <span key={item} className="flex items-center gap-2">
              {index > 0 && <span className="text-border">·</span>}
              <span className={index === summary.length - 1 && attention.length > 0 ? "font-semibold text-warning" : undefined}>{item}</span>
            </span>
          ))}
        </p>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
          {/* MAIN COLUMN */}
          <div className="order-2 flex flex-col gap-4 lg:order-1">
            <section className="precon-surface overflow-hidden rounded-xl">
              <header className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                <h2 className="font-display text-base font-semibold">Precon Pipeline</h2>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{scoped.length} projects · {money(pipelineValue)}</span>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-border/50 text-[9.5px] uppercase tracking-[.12em] text-muted-foreground">
                      <th className="px-4 py-2 font-semibold">Project</th>
                      <th className="px-3 py-2 font-semibold">Stage</th>
                      <th className="px-3 py-2 text-right font-semibold">Est. Value</th>
                      <th className="px-3 py-2 font-semibold">Due</th>
                      <th className="px-3 py-2 font-semibold">Owner</th>
                      <th className="px-3 py-2 font-semibold">Next Action</th>
                      <th className="px-4 py-2 text-right font-semibold">Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoped.map(p => {
                      const stage = stageOf(p);
                      const { action, health } = rowFor(p, stage);
                      return (
                        <tr key={p.id} onClick={() => open(p)} tabIndex={0}
                          onKeyDown={e => { if (e.key === "Enter") open(p); }}
                          className="group cursor-pointer border-b border-border/35 transition-colors last:border-0 hover:bg-primary/5">
                          <td className="px-4 py-2.5">
                            <span className="block font-semibold leading-tight">{p.name}</span>
                            <span className="block truncate text-[10.5px] text-muted-foreground">{p.client} · {p.location}</span>
                          </td>
                          <td className="px-3 py-2.5 text-[11.5px] text-muted-foreground">{stage}</td>
                          <td className="px-3 py-2.5 text-right font-medium tabular-nums">{money(p.clientPrice)}</td>
                          <td className="px-3 py-2.5 text-[11.5px] tabular-nums text-muted-foreground">{p.bidDue ?? "—"}</td>
                          <td className="px-3 py-2.5 text-[11.5px] text-muted-foreground">{owner}</td>
                          <td className="px-3 py-2.5">
                            <span className="flex items-center gap-1.5 font-medium text-foreground">
                              {action}
                              <ArrowRight size={11} className="opacity-0 transition-opacity group-hover:opacity-100" />
                            </span>
                          </td>
                          <td className={cn("px-4 py-2.5 text-right text-[11.5px] font-semibold", healthTone[health])}>{health}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="precon-surface rounded-xl px-4 py-3">
              <h2 className="font-display text-base font-semibold">Next 7 Days</h2>
              <ul className="mt-2 divide-y divide-border/40">
                {deadlines.map(p => (
                  <li key={p.id}>
                    <button onClick={() => open(p)} className="flex w-full items-baseline gap-4 py-2 text-left hover:text-primary">
                      <span className="w-14 shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground">{p.bidDue}</span>
                      <span className="min-w-0 flex-1 truncate text-[12px]">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-muted-foreground"> — {deadlineNote[stageOf(p)] ?? "Milestone due"}</span>
                      </span>
                    </button>
                  </li>
                ))}
                {deadlines.length === 0 && <li className="py-2 text-[12px] text-muted-foreground">No preconstruction deadlines in this scope.</li>}
              </ul>
            </section>

            <section className="precon-surface rounded-xl px-4 py-3">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-base font-semibold">Precon Performance</h2>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Trailing 90 days</span>
              </div>
              <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                {performance.map(metric => (
                  <div key={metric.label} className="border-t border-border/40 pt-2">
                    <dt className="text-[9.5px] font-semibold uppercase tracking-[.12em] text-muted-foreground">{metric.label}</dt>
                    <dd className="mt-0.5 text-[15px] font-semibold tabular-nums">{metric.value}</dd>
                    <dd className="text-[10.5px] leading-snug text-muted-foreground">{metric.context}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          {/* RIGHT RAIL */}
          <div className="order-1 flex flex-col gap-4 lg:order-2">
            <section className="precon-surface rounded-xl px-4 py-3">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-base font-semibold">Needs Attention</h2>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{attention.length}</span>
              </div>
              <ul className="mt-2 divide-y divide-border/40">
                {attention.map(p => {
                  const stage = stageOf(p);
                  const { action } = rowFor(p, stage);
                  return (
                    <li key={p.id} className="py-2.5">
                      <p className="text-[12px] font-semibold">{p.name}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                        {p.attention.charAt(0).toUpperCase() + p.attention.slice(1)}.
                      </p>
                      {stage === "Pricing & Margin" && (
                        <EuclidImpact domain="Cost" tone="warning" className="mt-2"
                          message="At the current client price, projected margin is 2.1 points below Mayfield's target." />
                      )}
                      <button onClick={() => open(p)} className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                        {action}<ArrowRight size={11} />
                      </button>
                    </li>
                  );
                })}
                {attention.length === 0 && <li className="py-2 text-[11px] text-muted-foreground">Nothing is waiting on you right now.</li>}
              </ul>
            </section>

            <section className="precon-surface rounded-xl px-4 py-3">
              <h2 className="font-display text-base font-semibold">Market Outlook</h2>
              <ul className="mt-2 divide-y divide-border/40">
                {marketSignals.map(signal => {
                  const Icon = signal.trend > 2 ? TrendingUp : signal.trend < 0 ? TrendingDown : Minus;
                  return (
                    <li key={signal.trade} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0">
                        <span className="block truncate text-[11.5px] font-medium">{signal.trade}</span>
                        <span className="block truncate text-[10.5px] text-muted-foreground">{signal.signal}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold tabular-nums text-muted-foreground">
                        <Icon size={11} />{signal.trend > 0 ? "+" : ""}{signal.trend}% / 90d
                      </span>
                    </li>
                  );
                })}
              </ul>
              <Link to={`${base}/precon/market-outlook`} className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                Open Market Outlook <ArrowRight size={11} />
              </Link>
            </section>

            <section className="precon-surface rounded-xl px-4 py-3">
              <h2 className="font-display text-base font-semibold">Recent Activity</h2>
              <ul className="mt-2 divide-y divide-border/40">
                {recent.map(event => (
                  <li key={event.id} className="py-2">
                    <Link to={event.route ?? "/activity"} className="block hover:text-primary">
                      <span className="block text-[11.5px] leading-snug">{event.summary}</span>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">{event.project ?? event.company} · {fmtWhen(event.timestamp)}</span>
                    </Link>
                  </li>
                ))}
                {recent.length === 0 && <li className="py-2 text-[11px] text-muted-foreground">No recent preconstruction activity.</li>}
              </ul>
              <Link to="/activity" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                View All Activity <ArrowRight size={11} />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </TrackShell>
  );
}
