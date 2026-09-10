import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, CalendarClock, FileText, Gauge, Layers } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { PageHeader, ScopeSelector, ALL_SCOPE } from "@/components/app/PageScope";
import { getProjectRoute, money, projects, quotes } from "@/data/demoUniverse";
import { statusFor } from "@/data/scheduleData";
import { useDemoProject } from "@/hooks/use-demo-project";

export default function PreconOverviewPage() {
  const track = useTrack();
  const navigate = useNavigate();
  const { setProjectId } = useDemoProject();
  const base = track === "sub" ? "/sub" : "/app";

  const precon = projects.filter(p => statusFor(p.id).mode !== "active");
  const stageOf = (id: string) => {
    const p = projects.find(x => x.id === id)!;
    return track === "sub" ? p.subStage : p.builderStage;
  };
  const estimatesInProgress = precon.filter(p => ["Scope Analyzer", "Estimate", "Pricing & Margin"].includes(stageOf(p.id)));
  const awaitingBids = quotes.filter(q => /pend|await|request/i.test(q.status));
  const proposalsReady = precon.filter(p => stageOf(p.id) === "Proposal Export");
  const marginIssues = precon.filter(p => /margin|pricing/i.test(p.attention ?? ""));
  const scored = precon.filter(p => (track === "sub" ? p.subProposalScore : p.proposalScore) != null);

  const metrics = [
    { label: "Active precon projects", value: precon.length, icon: Layers },
    { label: "Estimates in progress", value: estimatesInProgress.length, icon: Gauge },
    { label: "Bid packages awaiting response", value: awaitingBids.length, icon: FileText },
    { label: "Proposals ready", value: proposalsReady.length, icon: ArrowRight },
  ];

  return (
    <TrackShell>
      <div className="mx-auto w-full max-w-[1250px] p-4 lg:p-7">
        <PageHeader
          eyebrow="Preconstruction"
          title="Preconstruction Overview"
          description="Where every project sits in the estimating workflow, what is waiting on someone, and how the numbers are landing against the market."
          right={<ScopeSelector allLabel="All Precon Projects" value={ALL_SCOPE} projects={precon}
            noteFor={p => stageOf(p.id)}
            onChange={id => { if (id !== ALL_SCOPE) { const p = projects.find(x => x.id === id)!; setProjectId(id); navigate(getProjectRoute(p, track)); } }} />}
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(m => (
            <div key={m.label} className="odyssey-surface rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{m.label}</p>
                <m.icon size={15} className="text-primary" />
              </div>
              <p className="mt-2 font-display text-3xl font-semibold">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <section className="odyssey-surface rounded-2xl p-4 lg:col-span-2">
            <h2 className="font-display text-lg font-semibold">Projects by workflow stage</h2>
            <div className="mt-3 divide-y divide-border/50">
              {precon.map(p => (
                <button key={p.id} onClick={() => { setProjectId(p.id); navigate(getProjectRoute(p, track)); }}
                  className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:text-primary">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{p.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{p.client} · {p.location}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[11px] font-semibold">{stageOf(p.id)}</span>
                    <span className="block text-[10px] text-muted-foreground">{money(p.clientPrice)}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-4">
            <section className="odyssey-surface rounded-2xl p-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><AlertTriangle size={15} className="text-warning" />Exceptions</h2>
              <ul className="mt-2 space-y-2 text-[11px] text-muted-foreground">
                {precon.filter(p => p.attention).map(p => (
                  <li key={p.id}><span className="font-semibold text-foreground">{p.name}</span> — {p.attention}</li>
                ))}
                {marginIssues.length === 0 && <li>No pricing or margin exceptions.</li>}
              </ul>
            </section>

            <section className="odyssey-surface rounded-2xl p-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><CalendarClock size={15} className="text-primary" />Upcoming deadlines</h2>
              <ul className="mt-2 space-y-1.5 text-[11px]">
                {precon.filter(p => p.bidDue).map(p => (
                  <li key={p.id} className="flex justify-between gap-2"><span className="truncate">{p.name}</span><span className="shrink-0 font-semibold text-muted-foreground">{p.bidDue}</span></li>
                ))}
              </ul>
            </section>

            <section className="odyssey-surface rounded-2xl p-4">
              <h2 className="font-display text-lg font-semibold">Recent Proposal Scores</h2>
              <ul className="mt-2 space-y-1.5 text-[11px]">
                {scored.map(p => (
                  <li key={p.id} className="flex justify-between gap-2">
                    <span className="truncate">{p.name}</span>
                    <span className="shrink-0 font-semibold text-primary">{track === "sub" ? p.subProposalScore : p.proposalScore}</span>
                  </li>
                ))}
              </ul>
              <Link to={`${base}/precon/market-outlook`} className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                Market Outlook signals <ArrowRight size={12} />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </TrackShell>
  );
}
