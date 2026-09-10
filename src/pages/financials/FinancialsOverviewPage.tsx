import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { PageHeader, ScopeSelector, ALL_SCOPE } from "@/components/app/PageScope";
import { money, projects as allProjects } from "@/data/demoUniverse";
import {
  changes, clientInvoices, commitments, costs, currentCommitment, financialProjectIds,
  inboxItems, projectFinancials, remainingOnCommitment,
} from "@/data/financialData";
import { activityFor, fmtWhen } from "@/data/activityData";
import { cn } from "@/lib/utils";

const pendingStatuses = ["Potential", "Pricing", "Submitted", "Needs Review", "Draft"];

/** Restrained inline Euclid note — small eyebrow plus a left rule, no card. */
function EuclidNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 border-l-2 border-primary/40 pl-2 text-[10.5px] leading-snug text-muted-foreground">
      <span className="font-semibold uppercase tracking-wide text-primary">Euclid impact · Cost</span> — {children}
    </p>
  );
}

function Section({ title, note, children, className }: { title: string; note?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("precon-surface rounded-xl", className)}>
      <header className="flex items-baseline justify-between gap-3 px-4 pt-3">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {note && <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{note}</span>}
      </header>
      {children}
    </section>
  );
}

export default function FinancialsOverviewPage() {
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const [scope, setScope] = useState(ALL_SCOPE);

  const financialIds = scope === ALL_SCOPE ? financialProjectIds : financialProjectIds.filter(id => id === scope);
  const rows = useMemo(() => allProjects
    .filter(p => (scope === ALL_SCOPE ? true : p.id === scope))
    .map(p => {
      if (!financialProjectIds.includes(p.id)) return { id: p.id, name: p.name, client: p.client, precon: true as const, stage: track === "sub" ? p.subStage : p.builderStage };
      return { id: p.id, name: p.name, client: p.client, precon: false as const, ...projectFinancials(p.id) };
    }), [scope, track]);

  const live = rows.filter(r => !r.precon) as Extract<(typeof rows)[number], { precon: false }>[];
  const sum = (f: (r: (typeof live)[number]) => number) => live.reduce((t, r) => t + f(r), 0);

  const totals = {
    contract: sum(r => r.currentContract),
    revised: sum(r => r.revised),
    committed: sum(r => r.committed),
    actual: sum(r => r.actual),
    forecast: sum(r => r.forecast),
    gp: sum(r => r.forecastGP),
    exposure: sum(r => r.pendingExposure),
    invoiced: sum(r => r.invoiced),
    paid: sum(r => r.paid),
    ar: sum(r => r.outstandingAR),
    retainage: sum(r => r.retainage),
  };
  const variance = totals.revised - totals.forecast;
  const forecastMargin = totals.contract ? (totals.gp / totals.contract) * 100 : 0;
  const originalMargin = live.length ? live.reduce((t, r) => t + r.originalMargin, 0) / live.length : 0;
  const coverage = totals.revised ? Math.round((totals.committed / totals.revised) * 100) : 0;
  const uncommittedForecast = Math.max(totals.forecast - totals.committed, 0);

  const scopedInbox = inboxItems.filter(i => i.state !== "Posted" && (scope === ALL_SCOPE || i.projectId === scope));
  const scopedChanges = changes.filter(c => financialIds.includes(c.projectId) && pendingStatuses.includes(c.status));
  const scopedInvoices = clientInvoices.filter(i => financialIds.includes(i.projectId) && i.amount - i.paid > 0);

  const nameOf = (id: string) => allProjects.find(p => p.id === id)?.name ?? id;

  /* Needs Attention, ordered by financial consequence. */
  const attention = [
    ...scopedInbox.filter(i => i.exception?.kind === "Possible duplicate").map(i => ({
      key: i.id, title: i.vendor, detail: `${i.exception?.kind} · ${money(i.amount)}${i.projectId ? ` · ${nameOf(i.projectId)}` : ""}`,
      cta: "Review in Cost Inbox", to: `${base}/financials/inbox`, note: undefined as string | undefined,
    })),
    ...commitments.filter(c => financialIds.includes(c.projectId) && remainingOnCommitment(c) < 0).map(c => ({
      key: c.id, title: `${c.company} — ${c.id}`,
      detail: `Invoicing exceeds commitment by ${money(Math.abs(remainingOnCommitment(c)))} · ${nameOf(c.projectId)}`,
      cta: "Review Commitment", to: `${base}/projects/${c.projectId}/financials/commitments`,
      note: `Posting this invoice would carry forecast cost ${money(Math.abs(remainingOnCommitment(c)))} above the current commitment.`,
    })),
    ...live.filter(r => r.variance < 0).map(r => ({
      key: `${r.id}-var`, title: r.name,
      detail: `Forecast ${money(Math.abs(r.variance))} over revised budget · margin ${r.forecastMargin.toFixed(1)}% vs ${r.originalMargin.toFixed(1)}% original`,
      cta: "Review Budget", to: `${base}/projects/${r.id}/financials/budget`, note: undefined,
    })),
    ...live.filter(r => r.outstandingAR > 0).sort((a, b) => b.outstandingAR - a.outstandingAR).map(r => ({
      key: `${r.id}-ar`, title: r.name, detail: `${money(r.outstandingAR)} invoiced and unpaid`,
      cta: "Review Client Billing", to: `${base}/projects/${r.id}/financials/client-billing`, note: undefined,
    })),
    ...scopedInbox.filter(i => i.exception?.kind === "No vendor match").map(i => ({
      key: i.id, title: i.vendor, detail: `Missing coding · ${money(i.amount)}`,
      cta: "Code in Cost Inbox", to: `${base}/financials/inbox`, note: undefined,
    })),
    ...costs.filter(c => financialIds.includes(c.projectId) && c.approval === "Needs Review").map(c => ({
      key: c.id, title: c.vendor, detail: `Pending approval · ${money(c.amount)} · ${nameOf(c.projectId)}`,
      cta: "Review Costs", to: `${base}/projects/${c.projectId}/financials/costs`, note: undefined,
    })),
  ].slice(0, 8);

  const recent = activityFor(track)
    .filter(a => a.type === "Cost" || a.type === "Project")
    .filter(a => scope === ALL_SCOPE || a.projectId === scope)
    .slice(0, 5);

  const pulse = [
    `${money(totals.contract)} contracts`,
    `${money(totals.revised)} revised budgets`,
    `${money(totals.committed)} committed`,
    `${money(totals.actual)} actual`,
    `${money(totals.forecast)} forecast`,
    `${money(totals.gp)} forecast GP`,
    `${money(totals.exposure)} pending exposure`,
  ];

  const performance = [
    { label: "Forecast variance", value: `${variance < 0 ? "-" : "+"}${money(Math.abs(variance))}`, context: `${variance < 0 ? "Unfavorable" : "Favorable"} across ${live.length} active project${live.length === 1 ? "" : "s"}` },
    { label: "Forecast margin", value: `${forecastMargin.toFixed(1)}%`, context: `vs ${originalMargin.toFixed(1)}% original contract margin` },
    { label: "Commitment coverage", value: `${coverage}%`, context: "of revised active-project budgets under commitment" },
    { label: "Uncommitted forecast", value: money(uncommittedForecast), context: "forecast cost not yet under subcontract or purchase order" },
    { label: "Pending exposure", value: money(totals.exposure), context: `unapproved change cost across ${scopedChanges.length} open change${scopedChanges.length === 1 ? "" : "s"}` },
    { label: "Retainage receivable", value: money(totals.retainage), context: "held on client invoices issued to date" },
  ];

  const changeExposure = scopedChanges.reduce((t, c) => t + c.costImpact, 0);
  const changeValue = scopedChanges.reduce((t, c) => t + c.clientImpact, 0);
  const awaitingOwner = scopedChanges.filter(c => c.status === "Submitted" || c.status === "Pricing").length;

  return (
    <TrackShell>
      <div className="app-shell py-4 lg:py-7">
        <PageHeader
          eyebrow="Financials"
          title="Overview"
          description="See financial performance across every project, where costs are moving, and what needs action."
          className="mb-3"
          right={<ScopeSelector allLabel="All Projects" value={scope} projects={allProjects} onChange={setScope}
            noteFor={p => (financialProjectIds.includes(p.id) ? "Active" : "Precon")} />}
        />

        <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
          {pulse.map((item, index) => (
            <span key={item} className="flex items-center gap-2">
              {index > 0 && <span className="text-border">·</span>}
              <span className={index === pulse.length - 1 && totals.exposure > 0 ? "font-semibold text-warning" : undefined}>{item}</span>
            </span>
          ))}
        </p>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
          {/* MAIN COLUMN */}
          <div className="order-2 flex flex-col gap-4 lg:order-1">
            <Section title="Project Financial Performance" note={`${live.length} with cost data · ${money(totals.revised)} revised`} className="overflow-hidden pb-0">
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-[12px]">
                  <thead>
                    <tr className="border-y border-border/50 text-[9.5px] uppercase tracking-[.12em] text-muted-foreground">
                      <th className="px-4 py-2 font-semibold">Project</th>
                      <th className="px-3 py-2 text-right font-semibold">Contract</th>
                      <th className="px-3 py-2 text-right font-semibold">Revised Budget</th>
                      <th className="px-3 py-2 text-right font-semibold">Committed</th>
                      <th className="px-3 py-2 text-right font-semibold">Actual</th>
                      <th className="px-3 py-2 text-right font-semibold">Forecast</th>
                      <th className="px-3 py-2 text-right font-semibold">Variance</th>
                      <th className="px-4 py-2 text-right font-semibold">Forecast Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(r => (
                      <tr key={r.id} className="border-b border-border/35 transition-colors last:border-0 hover:bg-primary/5">
                        <td className="px-4 py-2.5">
                          <Link to={`${base}/projects/${r.id}/overview`} className="block font-semibold leading-tight hover:text-primary">{r.name}</Link>
                          <span className="block truncate text-[10.5px] text-muted-foreground">
                            {r.precon ? `${r.client} · ${r.stage}` : r.client}
                          </span>
                        </td>
                        {r.precon ? (
                          <td colSpan={7} className="px-4 py-2.5 text-right text-[11.5px] text-muted-foreground">
                            Preconstruction — no committed or actual cost yet
                          </td>
                        ) : (
                          <>
                            <td className="px-3 py-2.5 text-right tabular-nums">{money(r.currentContract)}</td>
                            <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                              <Link to={`${base}/projects/${r.id}/financials/budget`} className="hover:text-primary">{money(r.revised)}</Link>
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums">
                              <Link to={`${base}/projects/${r.id}/financials/commitments`} className="hover:text-primary">{money(r.committed)}</Link>
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums">
                              <Link to={`${base}/projects/${r.id}/financials/costs`} className="hover:text-primary">{money(r.actual)}</Link>
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums">
                              <Link to={`${base}/projects/${r.id}/financials/budget`} className="hover:text-primary">{money(r.forecast)}</Link>
                            </td>
                            <td className={cn("px-3 py-2.5 text-right font-semibold tabular-nums", r.variance < 0 ? "text-warning" : "text-success")}>
                              <Link to={`${base}/projects/${r.id}/financials/budget`} className="hover:underline">
                                {r.variance < 0 ? "-" : "+"}{money(Math.abs(r.variance))}
                                <span className="ml-1 text-[10px] font-medium text-muted-foreground">{r.variance < 0 ? "Unfavorable" : "Favorable"}</span>
                              </Link>
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums">
                              <span className="font-semibold">{r.forecastMargin.toFixed(1)}%</span>
                              <span className="block text-[10px] text-muted-foreground">vs {r.originalMargin.toFixed(1)}% original</span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  {live.length > 0 && (
                    <tfoot>
                      <tr className="border-t border-border/50 text-[11.5px] font-semibold">
                        <td className="px-4 py-2.5">Total — active work</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{money(totals.contract)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{money(totals.revised)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{money(totals.committed)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{money(totals.actual)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{money(totals.forecast)}</td>
                        <td className={cn("px-3 py-2.5 text-right tabular-nums", variance < 0 ? "text-warning" : "text-success")}>
                          {variance < 0 ? "-" : "+"}{money(Math.abs(variance))}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{forecastMargin.toFixed(1)}%</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </Section>

            <Section title="Changes & Exposure"
              note={`${money(changeExposure)} cost · ${money(changeValue)} client value · ${awaitingOwner} awaiting owner`}
              className="overflow-hidden pb-0">
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-[12px]">
                  <thead>
                    <tr className="border-y border-border/50 text-[9.5px] uppercase tracking-[.12em] text-muted-foreground">
                      <th className="px-4 py-2 font-semibold">Change</th>
                      <th className="px-3 py-2 font-semibold">Project</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 text-right font-semibold">Cost Exposure</th>
                      <th className="px-3 py-2 text-right font-semibold">Client Value</th>
                      <th className="px-4 py-2 text-right font-semibold">Projected GP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopedChanges.map(c => (
                      <tr key={c.id} className="border-b border-border/35 last:border-0 hover:bg-primary/5">
                        <td className="px-4 py-2.5">
                          <Link to={`${base}/projects/${c.projectId}/financials/change-orders`} className="block font-medium leading-tight hover:text-primary">{c.title}</Link>
                          <span className="block text-[10.5px] text-muted-foreground">{c.id} · {c.kind}</span>
                        </td>
                        <td className="px-3 py-2.5 text-[11.5px] text-muted-foreground">{nameOf(c.projectId)}</td>
                        <td className="px-3 py-2.5 text-[11.5px] text-muted-foreground">{c.status}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{money(c.costImpact)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{c.clientImpact ? money(c.clientImpact) : "—"}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{c.clientImpact ? money(c.clientImpact - c.costImpact) : "—"}</td>
                      </tr>
                    ))}
                    {scopedChanges.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-3 text-[11.5px] text-muted-foreground">No unresolved changes in this scope.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="Billing & Receivables" note="Demo billing records · QuickBooks Online remains the accounting source of truth" className="px-4 pb-3">
              <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Invoiced", value: money(totals.invoiced), context: "issued to clients to date" },
                  { label: "Paid", value: money(totals.paid), context: "payments recorded against invoices" },
                  { label: "Outstanding A/R", value: money(totals.ar), context: "invoiced and unpaid" },
                  { label: "Retainage receivable", value: money(totals.retainage), context: "held on issued invoices" },
                ].map(m => (
                  <div key={m.label} className="border-t border-border/40 pt-2">
                    <dt className="text-[9.5px] font-semibold uppercase tracking-[.12em] text-muted-foreground">{m.label}</dt>
                    <dd className="mt-0.5 text-[15px] font-semibold tabular-nums">{m.value}</dd>
                    <dd className="text-[10.5px] leading-snug text-muted-foreground">{m.context}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-3 divide-y divide-border/40">
                {scopedInvoices.map(i => (
                  <li key={i.id}>
                    <Link to={`${base}/projects/${i.projectId}/financials/client-billing`} className="flex items-baseline justify-between gap-3 py-2 hover:text-primary">
                      <span className="min-w-0 truncate text-[12px]">
                        <span className="font-medium">{nameOf(i.projectId)}</span>
                        <span className="text-muted-foreground"> — invoice {i.number} · {i.status} · due {i.due}</span>
                      </span>
                      <span className="shrink-0 text-[12px] font-semibold tabular-nums">{money(i.amount - i.paid)} outstanding</span>
                    </Link>
                  </li>
                ))}
                {scopedInvoices.length === 0 && <li className="py-2 text-[11.5px] text-muted-foreground">Nothing outstanding in this scope.</li>}
              </ul>
            </Section>

            <Section title="Cost Performance" note="Active projects" className="px-4 pb-3">
              <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                {performance.map(m => (
                  <div key={m.label} className="border-t border-border/40 pt-2">
                    <dt className="text-[9.5px] font-semibold uppercase tracking-[.12em] text-muted-foreground">{m.label}</dt>
                    <dd className="mt-0.5 text-[15px] font-semibold tabular-nums">{m.value}</dd>
                    <dd className="text-[10.5px] leading-snug text-muted-foreground">{m.context}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          </div>

          {/* RIGHT RAIL */}
          <div className="order-1 flex flex-col gap-4 lg:order-2">
            <Section title="Needs Attention" note={String(attention.length)} className="px-4 pb-3">
              <ul className="mt-2 divide-y divide-border/40">
                {attention.map(item => (
                  <li key={item.key + item.cta} className="py-2.5">
                    <p className="text-[12px] font-semibold">{item.title}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{item.detail}</p>
                    {item.note && <EuclidNote>{item.note}</EuclidNote>}
                    <Link to={item.to} className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
                      {item.cta}<ArrowRight size={11} />
                    </Link>
                  </li>
                ))}
                {attention.length === 0 && <li className="py-2 text-[11px] text-muted-foreground">Nothing financial is waiting on you.</li>}
              </ul>
            </Section>

            <Section title="Cost Inbox" className="px-4 pb-3">
              <p className="mt-2 text-[12px] font-semibold">{scopedInbox.length} document{scopedInbox.length === 1 ? "" : "s"} need action</p>
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
              <ul className="mt-2 divide-y divide-border/40">
                {recent.map(event => (
                  <li key={event.id} className="py-2">
                    <Link to={event.route ?? "/activity"} className="block hover:text-primary">
                      <span className="block text-[11.5px] leading-snug">{event.summary}</span>
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
