import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { money } from "@/data/demoUniverse";
import { companyFinancials } from "@/data/financialData";
import { Panel, Pill, Variance } from "@/components/app/financials/FinancialPrimitives";

export default function FinancialProjectsPage() {
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const { projects } = companyFinancials();

  return (
    <TrackShell>
      <div className="app-shell py-4 lg:py-7">
        <header className="mb-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Financials</p>
          <h1 className="font-display text-3xl font-semibold">Financial Projects</h1>
        </header>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {projects.map(p => (
            <Link key={p.id} to={`${base}/financials/${p.id}/budget`} className="odyssey-surface group rounded-2xl p-5 transition-transform hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-lg font-semibold">{p.name}</h2>
                <Pill label={p.status} tone={p.status === "At Risk" ? "bad" : p.status === "Watch" ? "info" : "good"} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-4">
                <div><p className="text-muted-foreground">Revised budget</p><p className="font-semibold">{money(p.revised)}</p></div>
                <div><p className="text-muted-foreground">Committed</p><p className="font-semibold">{money(p.committed)}</p></div>
                <div><p className="text-muted-foreground">Actual</p><p className="font-semibold">{money(p.actual)}</p></div>
                <div><p className="text-muted-foreground">Forecast</p><p className="font-semibold">{money(p.forecast)}</p></div>
                <div><p className="text-muted-foreground">Variance</p><p><Variance value={p.variance} /></p></div>
                <div><p className="text-muted-foreground">Current contract</p><p className="font-semibold">{money(p.currentContract)}</p></div>
                <div><p className="text-muted-foreground">Forecast margin</p><p className="font-semibold">{p.forecastMargin.toFixed(1)}%</p></div>
                <div><p className="text-muted-foreground">Open exceptions</p><p className="font-semibold">{p.openExceptions}</p></div>
              </div>
              <p className="mt-4 flex items-center justify-between border-t border-border/45 pt-3 text-[11px] font-semibold text-primary">
                Open project financials <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </p>
            </Link>
          ))}
        </div>

        <Panel className="mt-3">
          <p className="text-[11px] text-muted-foreground">Projects appear here once they move from Preconstruction into construction. The estimate becomes the original budget, the proposal becomes the original contract, and awarded bids become commitments — nothing is re-entered.</p>
        </Panel>
      </div>
    </TrackShell>
  );
}
