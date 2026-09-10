import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { PageHeader, ScopeSelector, ALL_SCOPE } from "@/components/app/PageScope";
import { money, projects as allProjects } from "@/data/demoUniverse";
import {
  budgetLines, changes, clientInvoices, commitments, contracts, costs, currentCommitment,
  inboxItems, linesFor, projectFinancials, remainingCommitment,
  remainingOnCommitment, variance as lineVariance,
} from "@/data/financialData";
import { activityFor, fmtWhen } from "@/data/activityData";
import { cn } from "@/lib/utils";

const pendingStatuses = ["Potential", "Pricing", "Submitted", "Needs Review", "Draft"];
const compact = (n: number) => money(n);
const pts = (n: number) => `${n >= 0 ? "+" : "-"}${Math.abs(n).toFixed(1)} pts`;

/** A project is financially active once it carries a budget or an executed contract. */
const isFinanciallyActive = (id: string) => budgetLines.some(l => l.projectId === id) || !!contracts[id];

/** Restrained inline Euclid note — small eyebrow plus a left rule, no card. */
function EuclidNote({ label = "Margin", children }: { label?: string; children: React.ReactNode }) {
  return (
    <p className="mt-1.5 border-l-2 border-primary/40 pl-2 text-[10.5px] leading-snug text-muted-foreground">
      <span className="font-semibold uppercase tracking-wide text-primary">Euclid impact · {label}</span> — {children}
    </p>
  );
}

function Section({ title, note, children, className }: { title: string; note?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("financial-workspace rounded-xl", className)}>
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-4 pt-3">
        <h2 className="font-display text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
        {note && <span className="text-[10.5px] text-muted-foreground">{note}</span>}
      </header>
      {children}
    </section>
  );
}

const Th = ({ children, right, className }: { children: React.ReactNode; right?: boolean; className?: string }) => (
  <th className={cn("px-2 py-2 text-[9.5px] font-semibold uppercase tracking-[.12em] text-foreground/70", right && "text-right", className)}>{children}</th>
);

export default function FinancialsOverviewPage() {
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const [scope, setScope] = useState(ALL_SCOPE);

  /* Financially active projects only — preconstruction work stays in Precon. */
  const activeProjects = useMemo(() => allProjects.filter(p => isFinanciallyActive(p.id)), []);
  const activeIds = activeProjects.map(p => p.id);
  const scopedIds = scope === ALL_SCOPE ? activeIds : activeIds.filter(id => id === scope);

  const jobs = useMemo(() => scopedIds.map(id => {
    const p = allProjects.find(x => x.id === id)!;
    const fin = projectFinancials(id);
    const lines = linesFor(id);
    const originalGP = (fin.contract.originalContract * fin.contract.originalMarginPct) / 100;
    const clientTotal = lines.reduce((t, l) => t + l.clientPrice, 0) || 1;
    const progressPct = Math.round(lines.reduce((t, l) => t + l.percentComplete * l.clientPrice, 0) / clientTotal);
    const billedPct = fin.currentContract ? Math.round((fin.invoiced / fin.currentContract) * 100) : 0;
    const boughtOut = fin.revised ? Math.round((fin.committed / fin.revised) * 100) : 0;
    const remainingCommit = lines.reduce((t, l) => t + remainingCommitment(l), 0);
    const uncommitted = Math.max(fin.forecast - fin.committed, 0);
    const overCommitments = commitments.filter(c => c.projectId === id && remainingOnCommitment(c) < 0);
    const drivers = [...lines].filter(l => lineVariance(l) < 0).sort((a, b) => lineVariance(a) - lineVariance(b)).slice(0, 3);
    const unrecovered = changes
      .filter(c => c.projectId === id && pendingStatuses.includes(c.status))
      .reduce((t, c) => t + c.costImpact, 0);
    const position = fin.invoiced - fin.paid > 0 && clientInvoices.some(i => i.projectId === id && i.status === "Sent")
      ? "Payment Due"
      : progressPct - billedPct >= 5 ? "Underbilled" : billedPct - progressPct >= 5 ? "Ahead of Progress" : "On Track";
    return { id, name: p.name, client: p.client, fin, originalGP, progressPct, billedPct, boughtOut, remainingCommit, uncommitted, overCommitments, drivers, unrecovered, position };
  }), [scopedIds.join(",")]);

  const sum = (f: (j: (typeof jobs)[number]) => number) => jobs.reduce((t, j) => t + f(j), 0);
  const totals = {
    contract: sum(j => j.fin.currentContract),
    revised: sum(j => j.fin.revised),
    committed: sum(j => j.fin.committed),
    actual: sum(j => j.fin.actual),
    forecast: sum(j => j.fin.forecast),
    gp: sum(j => j.fin.forecastGP),
    exposure: sum(j => j.fin.pendingExposure),
    invoiced: sum(j => j.fin.invoiced),
    paid: sum(j => j.fin.paid),
    ar: sum(j => j.fin.outstandingAR),
    retainage: sum(j => j.fin.retainage),
    unrecovered: sum(j => j.unrecovered),
  };
  const variance = totals.revised - totals.forecast;
  const forecastMargin = totals.contract ? (totals.gp / totals.contract) * 100 : 0;

  const scopedChanges = changes.filter(c => scopedIds.includes(c.projectId) && pendingStatuses.includes(c.status));
  const changeExposure = scopedChanges.reduce((t, c) => t + c.costImpact, 0);
  const changeValue = scopedChanges.reduce((t, c) => t + c.clientImpact, 0);
  const awaitingOwner = scopedChanges.filter(c => c.status === "Submitted" || c.status === "Pricing").length;

  const scopedInbox = inboxItems.filter(i => i.state !== "Posted" && (scope === ALL_SCOPE || i.projectId === scope));
  const nameOf = (id: string) => allProjects.find(p => p.id === id)?.name ?? id;

  const pulse: { label: string; value: string; warn?: boolean }[] = [
    { label: "Contract Value", value: compact(totals.contract) },
    { label: "Revised Budget", value: compact(totals.revised) },
    { label: "Committed", value: compact(totals.committed) },
    { label: "Actual", value: compact(totals.actual) },
    { label: "Forecast", value: compact(totals.forecast) },
    { label: "Forecast GP", value: compact(totals.gp) },
    { label: "Forecast Margin", value: `${forecastMargin.toFixed(1)}%` },
    { label: "Exposure", value: compact(totals.exposure), warn: totals.exposure > 0 },
  ];

  /* Needs Attention — job-specific financial issues only, ordered by consequence. */
  const attention = [
    ...jobs.filter(j => j.fin.marginErosion <= -1).map(j => ({
      key: `${j.id}-margin`, cat: "Margin", title: j.name,
      detail: `Forecast margin ${j.fin.forecastMargin.toFixed(1)}% vs ${j.fin.originalMargin.toFixed(1)}% original — ${pts(j.fin.marginErosion)}`,
      cta: "Review Budget", to: `${base}/projects/${j.id}/financials/budget`,
      note: j.drivers.length ? `Most of the movement sits in ${j.drivers.map(d => d.name).join(", ")}.` : undefined,
    })),
    ...jobs.flatMap(j => j.overCommitments.map(c => ({
      key: c.id, cat: "Commitment", title: `${c.company} — ${c.id}`,
      detail: `Invoicing exceeds commitment by ${money(Math.abs(remainingOnCommitment(c)))} · ${j.name}`,
      cta: "Review Commitment", to: `${base}/projects/${j.id}/financials/commitments`,
      note: `Posting this invoice would carry forecast cost ${money(Math.abs(remainingOnCommitment(c)))} above the current commitment of ${money(currentCommitment(c))}.`,
    }))),
    ...jobs.filter(j => j.unrecovered > 0).map(j => ({
      key: `${j.id}-exp`, cat: "Change Exposure", title: j.name,
      detail: `${money(j.unrecovered)} of change cost not yet recovered from the client`,
      cta: "Review Change Orders", to: `${base}/projects/${j.id}/financials/change-orders`, note: undefined as string | undefined,
    })),
    ...jobs.filter(j => j.fin.variance < 0).map(j => ({
      key: `${j.id}-var`, cat: "Forecast", title: j.name,
      detail: `Forecast ${money(Math.abs(j.fin.variance))} over revised budget`,
      cta: "Review Budget", to: `${base}/projects/${j.id}/financials/budget`, note: undefined as string | undefined,
    })),
    ...jobs.filter(j => j.fin.outstandingAR > 0).sort((a, b) => b.fin.outstandingAR - a.fin.outstandingAR).map(j => ({
      key: `${j.id}-ar`, cat: "Billing", title: j.name,
      detail: `${money(j.fin.outstandingAR)} invoiced and unpaid · ${j.position}`,
      cta: "Review Client Billing", to: `${base}/projects/${j.id}/financials/client-billing`, note: undefined as string | undefined,
    })),
    ...scopedInbox.filter(i => i.exception?.kind === "Possible duplicate" && i.projectId && scopedIds.includes(i.projectId)).map(i => ({
      key: i.id, cat: "Duplicate Risk", title: i.vendor,
      detail: `Possible duplicate · ${money(i.amount)} · ${nameOf(i.projectId!)}`,
      cta: "Review in Cost Inbox", to: `${base}/financials/inbox`, note: undefined as string | undefined,
    })),
    ...costs.filter(c => scopedIds.includes(c.projectId) && c.approval === "Needs Review").map(c => ({
      key: c.id, cat: "Cost", title: c.vendor,
      detail: `Pending approval · ${money(c.amount)} · ${nameOf(c.projectId)}`,
      cta: "Review Costs", to: `${base}/projects/${c.projectId}/financials/costs`, note: undefined as string | undefined,
    })),
  ].slice(0, 8);

  const recent = activityFor(track)
    .filter(a => a.type === "Cost" || a.type === "Project")
    .filter(a => (a.projectId ? scopedIds.includes(a.projectId) : true))
    .filter(a => scope === ALL_SCOPE || a.projectId === scope)
    .slice(0, 5);

  const worstMargin = [...jobs].sort((a, b) => a.fin.marginErosion - b.fin.marginErosion)[0];

  return (
    <TrackShell>
      <div className="app-shell py-4 lg:py-7">
        <PageHeader
          eyebrow="Financials"
          title="Overview"
          description="See financial performance across every active project, where costs are moving, and what needs action."
          className="mb-3"
          right={<ScopeSelector allLabel="Active Projects" value={scope} projects={activeProjects} onChange={setScope}
            noteFor={p => (p.builderStage ? "Active" : undefined)} />}
        />

        {/* Compact job-financial pulse */}
        <p className="mb-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[11px]">
          {pulse.map((item, index) => (
            <span key={item.label} className="flex items-baseline gap-2">
              {index > 0 && <span className="text-border">·</span>}
              <span className={cn("text-[13px] font-semibold tabular-nums", item.warn ? "text-warning" : "text-foreground")}>{item.value}</span>
              <span className="text-muted-foreground">{item.label}</span>
            </span>
          ))}
        </p>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
          {/* MAIN COLUMN */}
          <div className="order-2 flex flex-col gap-4 lg:order-1">
            {/* 1 — PROJECT FINANCIAL PERFORMANCE */}
            <Section title="Project Financial Performance"
              note={`${jobs.length} financially active job${jobs.length === 1 ? "" : "s"} · ${compact(totals.revised)} revised budget`}
              className="overflow-hidden pb-0">
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-[12px]">
                  <thead>
                    <tr className="border-y border-border/60 bg-foreground/[0.035]">
                      <Th className="pl-4">Project</Th>
                      <Th right>Contract</Th>
                      <Th right>Revised Budget</Th>
                      <Th right>Committed</Th>
                      <Th right>Actual</Th>
                      <Th right>Forecast</Th>
                      <Th right>Variance</Th>
                      <Th right>Forecast GP</Th>
                      <Th right className="pr-4">Forecast Margin</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j.id} className="border-b border-border/45 transition-colors last:border-0 hover:bg-primary/5">
                        <td className="px-2 py-3 pl-4">
                          <Link to={`${base}/projects/${j.id}/overview`} className="block text-[13px] font-semibold leading-tight text-foreground hover:text-primary">{j.name}</Link>
                          <span className="block truncate text-[10.5px] text-muted-foreground">{j.client}</span>
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums">{money(j.fin.currentContract)}</td>
                        <td className="px-2 py-3 text-right font-medium tabular-nums">
                          <Link to={`${base}/projects/${j.id}/financials/budget`} className="hover:text-primary">{money(j.fin.revised)}</Link>
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums">
                          <Link to={`${base}/projects/${j.id}/financials/commitments`} className="hover:text-primary">{money(j.fin.committed)}</Link>
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums">
                          <Link to={`${base}/projects/${j.id}/financials/costs`} className="hover:text-primary">{money(j.fin.actual)}</Link>
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums">
                          <Link to={`${base}/projects/${j.id}/financials/budget`} className="hover:text-primary">{money(j.fin.forecast)}</Link>
                        </td>
                        <td className={cn("px-2 py-3 text-right font-semibold tabular-nums", j.fin.variance < 0 ? "text-warning" : "text-success")}>
                          {j.fin.variance < 0 ? "-" : "+"}{money(Math.abs(j.fin.variance))}
                          <span className="block text-[10px] font-medium text-muted-foreground">{j.fin.variance < 0 ? "Unfavorable" : "Favorable"}</span>
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums">
                          <span className="text-[13px] font-semibold">{money(j.fin.forecastGP)}</span>
                          <span className="block text-[10px] text-muted-foreground">vs {money(j.originalGP)} original</span>
                        </td>
                        <td className="whitespace-nowrap px-2 py-3 pr-4 text-right tabular-nums">
                          <Link to={`${base}/projects/${j.id}/financials/budget`} className="block hover:underline">
                            <span className={cn("text-[15px] font-semibold", j.fin.marginErosion <= -3 ? "text-warning" : "text-foreground")}>
                              {j.fin.forecastMargin.toFixed(1)}%
                            </span>
                            <span className={cn("block text-[10.5px]", j.fin.marginErosion < 0 ? "text-warning" : "text-muted-foreground")}>
                              {pts(j.fin.marginErosion)} vs original
                            </span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {jobs.length === 0 && (
                      <tr><td colSpan={9} className="px-4 py-4 text-[12px] text-muted-foreground">No financially active projects in this scope.</td></tr>
                    )}
                  </tbody>
                  {jobs.length > 1 && (
                    <tfoot>
                      <tr className="border-t border-border/60 text-[12px] font-semibold">
                        <td className="px-2 py-2.5 pl-4">Total — active work</td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{money(totals.contract)}</td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{money(totals.revised)}</td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{money(totals.committed)}</td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{money(totals.actual)}</td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{money(totals.forecast)}</td>
                        <td className={cn("px-2 py-2.5 text-right tabular-nums", variance < 0 ? "text-warning" : "text-success")}>
                          {variance < 0 ? "-" : "+"}{money(Math.abs(variance))}
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{money(totals.gp)}</td>
                        <td className="px-2 py-2.5 pr-4 text-right tabular-nums">{forecastMargin.toFixed(1)}%</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </Section>

            {/* 2 — MARGIN MOVEMENT */}
            <Section title="Margin Movement" note="Change in expected profit since the original budget and contract baseline" className="overflow-hidden pb-0">
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-[12px]">
                  <thead>
                    <tr className="border-y border-border/60 bg-foreground/[0.035]">
                      <Th className="pl-4">Project</Th>
                      <Th right>Original GP</Th>
                      <Th right>Forecast GP</Th>
                      <Th right>GP Change</Th>
                      <Th right>Original Margin</Th>
                      <Th right>Forecast Margin</Th>
                      <Th right className="pr-4">Margin Change</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(j => {
                      const gpChange = j.fin.forecastGP - j.originalGP;
                      return (
                        <tr key={j.id} className="border-b border-border/45 last:border-0 align-top hover:bg-primary/5">
                          <td className="px-2 py-3 pl-4">
                            <Link to={`${base}/projects/${j.id}/financials/budget`} className="block text-[13px] font-semibold leading-tight text-foreground hover:text-primary">{j.name}</Link>
                            {j.drivers.length > 0 && (
                              <span className="mt-1 block text-[10.5px] leading-snug text-muted-foreground">
                                Primary drivers: {j.drivers.map(d => `${d.name} (${money(Math.abs(lineVariance(d)))} over)`).join(" · ")}
                                {j.unrecovered > 0 ? ` · ${money(j.unrecovered)} unrecovered change cost` : ""}
                              </span>
                            )}
                            {j.fin.marginErosion <= -1 && (
                              <EuclidNote>
                                Forecast margin has moved {pts(j.fin.marginErosion)} against the original contract margin. Most of the movement is tied to{" "}
                                {j.drivers[0] ? `${j.drivers[0].name} running ${money(Math.abs(lineVariance(j.drivers[0])))} above revised budget` : "cost growth against the revised budget"}.
                              </EuclidNote>
                            )}
                          </td>
                          <td className="px-2 py-3 text-right tabular-nums">{money(j.originalGP)}</td>
                          <td className="px-2 py-3 text-right font-semibold tabular-nums">{money(j.fin.forecastGP)}</td>
                          <td className={cn("px-2 py-3 text-right font-semibold tabular-nums", gpChange < 0 ? "text-warning" : "text-success")}>
                            {gpChange < 0 ? "-" : "+"}{money(Math.abs(gpChange))}
                          </td>
                          <td className="px-2 py-3 text-right tabular-nums text-muted-foreground">{j.fin.originalMargin.toFixed(1)}%</td>
                          <td className="px-2 py-3 text-right text-[14px] font-semibold tabular-nums">{j.fin.forecastMargin.toFixed(1)}%</td>
                          <td className={cn("px-2 py-3 pr-4 text-right text-[14px] font-semibold tabular-nums", j.fin.marginErosion < 0 ? "text-warning" : "text-success")}>
                            {pts(j.fin.marginErosion)}
                          </td>
                        </tr>
                      );
                    })}
                    {jobs.length === 0 && <tr><td colSpan={7} className="px-4 py-3 text-[12px] text-muted-foreground">No margin movement to report.</td></tr>}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* 3 — CHANGES & UNRECOVERED EXPOSURE */}
            <Section title="Changes & Unrecovered Exposure" className="overflow-hidden pb-0">
              <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 px-4 text-[11px] text-muted-foreground">
                <span className="font-semibold tabular-nums text-foreground">{compact(changeExposure)}</span> pending cost exposure
                <span className="text-border">·</span>
                <span className="font-semibold tabular-nums text-foreground">{compact(changeValue)}</span> potential client value
                <span className="text-border">·</span>
                <span className="font-semibold tabular-nums text-warning">{compact(totals.unrecovered)}</span> unrecovered
                <span className="text-border">·</span>
                <span className="font-semibold tabular-nums text-foreground">{awaitingOwner}</span> awaiting owner action
              </p>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-[12px]">
                  <thead>
                    <tr className="border-y border-border/60 bg-foreground/[0.035]">
                      <Th className="pl-4">Change</Th>
                      <Th>Project</Th>
                      <Th>Status</Th>
                      <Th right>Cost Exposure</Th>
                      <Th right>Client Value</Th>
                      <Th right>Unrecovered</Th>
                      <Th right className="pr-4">Projected GP</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopedChanges.map(c => (
                      <tr key={c.id} className="border-b border-border/45 last:border-0 hover:bg-primary/5">
                        <td className="px-2 py-2.5 pl-4">
                          <Link to={`${base}/projects/${c.projectId}/financials/change-orders`} className="block font-semibold leading-tight text-foreground hover:text-primary">{c.title}</Link>
                          <span className="block text-[10.5px] text-muted-foreground">{c.id} · {c.kind}</span>
                        </td>
                        <td className="px-2 py-2.5 text-[11.5px] text-muted-foreground">{nameOf(c.projectId)}</td>
                        <td className="px-2 py-2.5 text-[11.5px] text-muted-foreground">{c.status}</td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{money(c.costImpact)}</td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{c.clientImpact ? money(c.clientImpact) : "—"}</td>
                        <td className="px-2 py-2.5 text-right text-[13px] font-semibold tabular-nums text-warning">
                          {money(c.costImpact)}
                          <span className="block text-[10px] font-medium text-muted-foreground">until approved</span>
                        </td>
                        <td className="px-2 py-2.5 pr-4 text-right tabular-nums">{c.clientImpact ? money(c.clientImpact - c.costImpact) : "—"}</td>
                      </tr>
                    ))}
                    {scopedChanges.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-3 text-[12px] text-muted-foreground">No unrecovered change exposure in this scope.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* 4 — BILLING POSITION */}
            <Section title="Billing Position" note="Demo billing records · QuickBooks Online remains the accounting source of truth" className="overflow-hidden pb-0">
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-[12px]">
                  <thead>
                    <tr className="border-y border-border/60 bg-foreground/[0.035]">
                      <Th className="pl-4">Project</Th>
                      <Th right>Contract</Th>
                      <Th right>Invoiced</Th>
                      <Th right>Paid</Th>
                      <Th right>Outstanding</Th>
                      <Th right>Retainage</Th>
                      <Th right className="pr-4">Billing Position</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j.id} className="border-b border-border/45 last:border-0 hover:bg-primary/5">
                        <td className="px-2 py-3 pl-4">
                          <Link to={`${base}/projects/${j.id}/financials/client-billing`} className="block text-[13px] font-semibold leading-tight text-foreground hover:text-primary">{j.name}</Link>
                          <span className="block text-[10.5px] text-muted-foreground">{j.progressPct}% complete · {j.billedPct}% billed</span>
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums">{money(j.fin.currentContract)}</td>
                        <td className="px-2 py-3 text-right tabular-nums">{money(j.fin.invoiced)}</td>
                        <td className="px-2 py-3 text-right tabular-nums">{money(j.fin.paid)}</td>
                        <td className={cn("px-2 py-3 text-right text-[13px] font-semibold tabular-nums", j.fin.outstandingAR > 0 ? "text-warning" : "text-foreground")}>
                          {money(j.fin.outstandingAR)}
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums">{money(j.fin.retainage)}</td>
                        <td className="px-2 py-3 pr-4 text-right">
                          <span className={cn("text-[12.5px] font-semibold", j.position === "On Track" ? "text-success" : "text-warning")}>{j.position}</span>
                          <span className="block text-[10px] text-muted-foreground">
                            {j.progressPct - j.billedPct >= 0
                              ? `${j.progressPct - j.billedPct} pts underbilled`
                              : `${j.billedPct - j.progressPct} pts ahead`}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {jobs.length === 0 && <tr><td colSpan={7} className="px-4 py-3 text-[12px] text-muted-foreground">No billing activity in this scope.</td></tr>}
                  </tbody>
                  {jobs.length > 1 && (
                    <tfoot>
                      <tr className="border-t border-border/60 text-[12px] font-semibold">
                        <td className="px-2 py-2.5 pl-4">Total</td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{money(totals.contract)}</td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{money(totals.invoiced)}</td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{money(totals.paid)}</td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{money(totals.ar)}</td>
                        <td className="px-2 py-2.5 text-right tabular-nums">{money(totals.retainage)}</td>
                        <td className="px-2 py-2.5 pr-4" />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </Section>

            {/* 5 — BUYOUT & COMMITMENT POSITION */}
            <Section title="Buyout & Commitment Position" note="How much of each job's forecast cost is actually under subcontract or purchase order" className="overflow-hidden pb-0">
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-[12px]">
                  <thead>
                    <tr className="border-y border-border/60 bg-foreground/[0.035]">
                      <Th className="pl-4">Project</Th>
                      <Th right>Revised Budget</Th>
                      <Th right>Committed</Th>
                      <Th right>% Bought Out</Th>
                      <Th right>Remaining Commitment</Th>
                      <Th right>Uncommitted Forecast</Th>
                      <Th right className="pr-4">Over-Budget Commitments</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j.id} className="border-b border-border/45 last:border-0 hover:bg-primary/5">
                        <td className="px-2 py-3 pl-4">
                          <Link to={`${base}/projects/${j.id}/financials/commitments`} className="block text-[13px] font-semibold leading-tight text-foreground hover:text-primary">{j.name}</Link>
                          <span className="block text-[10.5px] text-muted-foreground">
                            {j.boughtOut >= 90 ? "Forecast is relatively certain" : `${money(j.uncommitted)} of forecast still to buy out`}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums">{money(j.fin.revised)}</td>
                        <td className="px-2 py-3 text-right tabular-nums">{money(j.fin.committed)}</td>
                        <td className="px-2 py-3 text-right">
                          <span className={cn("text-[15px] font-semibold tabular-nums", j.boughtOut < 80 ? "text-warning" : "text-foreground")}>{j.boughtOut}%</span>
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums">{money(j.remainingCommit)}</td>
                        <td className={cn("px-2 py-3 text-right font-semibold tabular-nums", j.uncommitted > 0 ? "text-foreground" : "text-muted-foreground")}>{money(j.uncommitted)}</td>
                        <td className={cn("px-2 py-3 pr-4 text-right tabular-nums", j.overCommitments.length ? "text-warning" : "text-muted-foreground")}>
                          {j.overCommitments.length
                            ? `${j.overCommitments.length} · ${money(j.overCommitments.reduce((t, c) => t + Math.abs(remainingOnCommitment(c)), 0))}`
                            : "None"}
                        </td>
                      </tr>
                    ))}
                    {jobs.length === 0 && <tr><td colSpan={7} className="px-4 py-3 text-[12px] text-muted-foreground">No commitments in this scope.</td></tr>}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>

          {/* RIGHT RAIL */}
          <div className="order-1 flex flex-col gap-4 lg:order-2">
            <Section title="Needs Attention" note={String(attention.length)} className="px-4 pb-3">
              {worstMargin && worstMargin.fin.marginErosion < 0 && (
                <EuclidNote>
                  {worstMargin.name} carries the largest margin decline at {pts(worstMargin.fin.marginErosion)}, driven mainly by{" "}
                  {worstMargin.drivers[0]?.name ?? "cost growth"}.
                </EuclidNote>
              )}
              <ul className="mt-2 divide-y divide-border/50">
                {attention.map(item => (
                  <li key={item.key + item.cta} className="py-2.5">
                    <p className="text-[9px] font-semibold uppercase tracking-[.14em] text-muted-foreground">{item.cat}</p>
                    <p className="mt-0.5 text-[12.5px] font-semibold text-foreground">{item.title}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{item.detail}</p>
                    {item.note && <EuclidNote label="Cost">{item.note}</EuclidNote>}
                    <Link to={item.to} className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                      {item.cta}<ArrowRight size={11} />
                    </Link>
                  </li>
                ))}
                {attention.length === 0 && <li className="py-2 text-[11px] text-muted-foreground">Nothing financial is waiting on you.</li>}
              </ul>
            </Section>

            <Section title="Cost Inbox" className="px-4 pb-3">
              <p className="mt-2 text-[13px] font-semibold text-foreground">{scopedInbox.length} document{scopedInbox.length === 1 ? "" : "s"} need action</p>
              <div className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                <p>{scopedInbox.filter(i => i.state === "Ready").length} ready to post</p>
                <p>{scopedInbox.filter(i => i.state === "Needs Review").length} need review</p>
                <p>{scopedInbox.filter(i => i.state === "Exception").length} exceptions</p>
              </div>
              <Link to={`${base}/financials/inbox`} className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                Open Cost Inbox<ArrowRight size={11} />
              </Link>
            </Section>

            <Section title="Recent Financial Activity" className="px-4 pb-3">
              <ul className="mt-2 divide-y divide-border/50">
                {recent.map(event => (
                  <li key={event.id} className="py-2">
                    <Link to={event.route ?? "/activity"} className="block hover:text-primary">
                      <span className="block text-[11.5px] leading-snug text-foreground">{event.summary}</span>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">{event.project ?? event.company} · {fmtWhen(event.timestamp)}</span>
                    </Link>
                  </li>
                ))}
                {recent.length === 0 && <li className="py-2 text-[11px] text-muted-foreground">No recent financial activity.</li>}
              </ul>
              <Link to="/activity" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                View All Activity<ArrowRight size={11} />
              </Link>
            </Section>
          </div>
        </div>
      </div>
    </TrackShell>
  );
}
