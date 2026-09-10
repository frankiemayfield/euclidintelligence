import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Inbox } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { money, projects as allProjects } from "@/data/demoUniverse";
import { changes, commitments, companyFinancials, costs, currentCommitment, inboxItems, remainingOnCommitment } from "@/data/financialData";
import { EuclidImpact } from "@/components/app/active/EuclidImpact";
import { Metric, Panel, Pill, Variance } from "@/components/app/financials/FinancialPrimitives";
import { getRecentProject } from "@/lib/projectContext";
import { getProject } from "@/data/demoUniverse";
import { financialProjectIds } from "@/data/financialData";

export default function FinancialsOverviewPage() {
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const c = companyFinancials();
  const needsReview = costs.filter(x => x.approval === "Needs Review");
  const exceptions = [
    ...inboxItems.filter(i => i.state === "Exception").map(i => ({ id: i.id, title: `${i.exception?.kind} — ${i.vendor}`, detail: i.exception?.detail ?? "", to: `${base}/financials/inbox` })),
    ...commitments.filter(x => remainingOnCommitment(x) < 0).map(x => ({ id: x.id, title: `Invoicing exceeds commitment — ${x.company}`, detail: `${money(x.invoiced)} invoiced against a ${money(currentCommitment(x))} commitment.`, to: `${base}/financials/${x.projectId}/commitments` })),
    ...c.projects.filter(p => p.variance < 0).map(p => ({ id: p.id, title: `Forecast overrun — ${p.name}`, detail: `Forecast ${money(p.forecast)} against a revised budget of ${money(p.revised)}.`, to: `${base}/financials/${p.id}/budget` })),
    ...c.projects.filter(p => p.outstandingAR > 0).map(p => ({ id: `${p.id}-ar`, title: `Outstanding A/R — ${p.name}`, detail: `${money(p.outstandingAR)} invoiced and unpaid.`, to: `${base}/financials/${p.id}/billing` })),
  ];

  return (
    <TrackShell>
      <div className="mx-auto w-full max-w-[1250px] p-4 lg:p-7">
        <header className="mb-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Financials</p>
          <h1 className="font-display text-3xl font-semibold">How the company is performing</h1>
          <p className="mt-2 text-sm text-muted-foreground">What we planned, what we promised to spend, what we actually spent, what changed, and what the client owes us.</p>
        </header>

        {(() => {
          const recent = getRecentProject("financials");
          if (!recent || !financialProjectIds.includes(recent.projectId)) return null;
          const p = getProject(recent.projectId);
          return (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-card/40 px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Recently viewed</span>
              <span className="text-xs font-semibold">{p.name}</span>
              <Link to={`${base}/financials/${p.id}/${recent.tool ?? "budget"}`} className="text-[11px] font-semibold text-primary">Continue Financials →</Link>
            </div>
          );
        })()}

        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          <Metric label="Active Project Budgets" value={c.revisedBudget} sub="Total revised budget" />
          <Metric label="Forecast Cost" value={c.forecast} />
          <Metric label="Forecast Variance" value={`${c.forecastVariance < 0 ? "-" : "+"}${money(Math.abs(c.forecastVariance))}`} tone={c.forecastVariance < 0 ? "bad" : "good"} />
          <Metric label="Unapproved Costs" value={c.unapprovedCosts} tone="bad" sub={`${needsReview.length} awaiting review`} />
          <Metric label="Pending Change Exposure" value={c.pendingExposure} tone="bad" sub={`${c.unresolvedChanges} unresolved changes`} />
          <Metric label="Outstanding A/R" value={c.outstandingAR} />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <Panel title="Projects" className="lg:col-span-2" action={<Link to={`${base}/financials/projects`} className="text-[11px] font-semibold text-primary">All financial projects →</Link>}>
            {c.projects.map(p => (
              <Link key={p.id} to={`${base}/financials/${p.id}/budget`} className="flex flex-wrap items-center gap-3 border-b border-border/40 py-3 last:border-0 hover:bg-card/30">
                <span className="min-w-[160px] flex-1 text-sm font-semibold">{p.name}</span>
                <span className="text-[11px]"><span className="block text-muted-foreground">Revised budget</span><b>{money(p.revised)}</b></span>
                <span className="text-[11px]"><span className="block text-muted-foreground">Forecast</span><b>{money(p.forecast)}</b></span>
                <span className="text-[11px]"><span className="block text-muted-foreground">Variance</span><Variance value={p.variance} /></span>
                <span className="text-[11px]"><span className="block text-muted-foreground">Forecast margin</span><b>{p.forecastMargin.toFixed(1)}%</b></span>
                <Pill label={p.status} tone={p.status === "At Risk" ? "bad" : p.status === "Watch" ? "info" : "good"} />
              </Link>
            ))}
          </Panel>

          <div className="space-y-3">
          <Panel title="Preconstruction" action={<Link to={`${base}/financials/preconstruction`} className="text-[11px] font-semibold text-primary">Open Preconstruction →</Link>}>
            {(() => {
              const pre = allProjects.filter(p => !financialProjectIds.includes(p.id));
              const est = pre.reduce((n, p) => n + (p.builderCost ?? 0), 0);
              return (
                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <p className="text-sm font-semibold text-foreground">{pre.length} projects active</p>
                  <p>{money(est)} estimated builder cost</p>
                  <p>Scope, bids, estimate, pricing and proposals set each project's original budget.</p>
                </div>
              );
            })()}
          </Panel>
          <Panel title="Cost Inbox" action={<Link to={`${base}/financials/inbox`} className="text-[11px] font-semibold text-primary">Open →</Link>}>
            <p className="flex items-center gap-2 text-sm font-semibold"><Inbox size={15} className="text-primary" />{c.inboxNeedsAction} documents need action</p>
            <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              <p>{inboxItems.filter(i => i.state === "Ready").length} ready to post</p>
              <p>{inboxItems.filter(i => i.state === "Needs Review").length} need review</p>
              <p>{inboxItems.filter(i => i.state === "Exception").length} exceptions</p>
              <p>{c.commitmentExceptions} commitment exceptions</p>
            </div>
          </Panel>
          </div>
        </div>


        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <Panel title="Financial exceptions">
            {exceptions.slice(0, 8).map(e => (
              <Link key={e.id + e.title} to={e.to} className="flex items-start gap-2 border-b border-border/35 py-2 text-[11px] last:border-0 hover:bg-card/30">
                <AlertTriangle size={12} className="mt-0.5 shrink-0 text-warning" />
                <span className="flex-1">{e.title}<span className="block text-[10px] text-muted-foreground">{e.detail}</span></span>
                <ArrowRight size={12} className="mt-0.5 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </Panel>

          <div className="space-y-3">
            <Panel title="Unresolved changes">
              {changes.filter(x => ["Potential", "Pricing", "Submitted", "Needs Review"].includes(x.status)).map(x => (
                <Link key={x.id} to={`${base}/financials/${x.projectId}/changes`} className="flex items-center justify-between border-b border-border/35 py-2 text-[11px] last:border-0">
                  <span>{x.title}<span className="block text-[10px] text-muted-foreground">{x.id} · {x.kind}</span></span>
                  <span className="flex items-center gap-2"><b>{money(x.costImpact)}</b><Pill label={x.status} tone="info" /></span>
                </Link>
              ))}
            </Panel>
            <EuclidImpact domain="Cost" tone={c.forecastVariance < 0 ? "warning" : "positive"}
              message={`Across active work, forecast cost of ${money(c.forecast)} sits against ${money(c.revisedBudget)} of revised budget. ${money(c.pendingExposure)} of change exposure remains unapproved and ${money(c.unapprovedCosts)} of cost is waiting for review — both would move the company forecast if resolved today.`}
              action={{ label: "Open Cost Inbox", to: `${base}/financials/inbox` }} />
          </div>
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground">A/R, A/P, cash flow and financial reports will join this workspace. QuickBooks Online remains the accounting source of truth — Euclid owns construction classification, project mapping, approvals and forecasting.</p>
      </div>
    </TrackShell>
  );
}
