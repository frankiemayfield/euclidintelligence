import { useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { TrackShell } from "@/components/app/TrackShell";
import { PageHeader } from "@/components/app/PageScope";
import { cn } from "@/lib/utils";

const tradeCosts = [
  { trade: "Framing (labor + material)", unit: "$/SF", local: 14.8, delta: 4.2 },
  { trade: "Concrete flatwork", unit: "$/SF", local: 9.1, delta: 1.4 },
  { trade: "Electrical rough + finish", unit: "$/SF", local: 11.6, delta: 6.8 },
  { trade: "Plumbing rough + finish", unit: "$/SF", local: 12.4, delta: 3.1 },
  { trade: "HVAC", unit: "$/ton", local: 5150, delta: -1.8 },
  { trade: "Drywall hung + finished", unit: "$/SF", local: 3.35, delta: 2.2 },
  { trade: "Roofing (architectural)", unit: "$/SQ", local: 615, delta: 5.6 },
  { trade: "Cabinetry (premium)", unit: "$/LF", local: 780, delta: 7.4 },
];

const materials = [
  { name: "Framing lumber", trend: 3.9 },
  { name: "Copper wire", trend: 9.2 },
  { name: "PVC / CPVC", trend: -2.4 },
  { name: "Gypsum board", trend: 4.6 },
  { name: "Structural steel", trend: -0.9 },
];

const bidClimate = [
  { label: "Average bidders per package", value: "3.4", note: "down from 4.1 last year" },
  { label: "Sub response rate", value: "68%", note: "Cincinnati metro, last 90 days" },
  { label: "Average bid spread", value: "11.2%", note: "low to high, same scope" },
  { label: "Typical lead time", value: "5.5 wks", note: "award to mobilization" },
];

const cohorts = ["Premium residential", "Custom homes", "Remodels", "Tenant improvement"];

const companyRows = [
  { metric: "Cost per SF", company: "$236", market: "$228", better: false },
  { metric: "Gross margin", company: "20.0%", market: "17.4%", better: true },
  { metric: "Win rate", company: "42%", market: "31%", better: true },
  { metric: "Estimate accuracy", company: "±2.8%", market: "±6.1%", better: true },
  { metric: "Proposal turnaround", company: "6 days", market: "9 days", better: true },
  { metric: "Change order rate", company: "4.1%", market: "6.8%", better: true },
];

export default function MarketOutlookPage() {
  const [view, setView] = useState<"local" | "company">("local");
  const [cohort, setCohort] = useState(cohorts[0]);

  return (
    <TrackShell>
      <div className="mx-auto w-full max-w-[1250px] p-4 lg:p-7">
        <PageHeader
          eyebrow="Preconstruction"
          title="Market Outlook"
          description="Company-level construction intelligence for the Cincinnati market. Project-specific benchmarking still lives in Market Comparison inside the Estimator."
          right={
            <div className="flex rounded-full border border-border/60 bg-card/40 p-0.5">
              {(["local", "company"] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize transition-colors", view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {v === "local" ? "Local Market" : "Company Comparison"}
                </button>
              ))}
            </div>
          }
        />

        <div className="mb-4 flex flex-wrap gap-1.5">
          {cohorts.map(c => (
            <button key={c} onClick={() => setCohort(c)}
              className={cn("rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors", cohort === c ? "border-primary/50 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground")}>
              {c}
            </button>
          ))}
        </div>

        {view === "local" ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <section className="odyssey-surface rounded-2xl p-4 lg:col-span-2">
              <h2 className="font-display text-lg font-semibold">Trade cost benchmarks</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Cincinnati metro · {cohort} · trailing 12 months</p>
              <table className="mt-3 w-full text-[12px]">
                <thead><tr className="text-left text-[10px] uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-semibold">Trade</th><th className="pb-2 font-semibold">Unit</th>
                  <th className="pb-2 text-right font-semibold">Local rate</th><th className="pb-2 text-right font-semibold">YoY</th>
                </tr></thead>
                <tbody className="divide-y divide-border/50">
                  {tradeCosts.map(t => (
                    <tr key={t.trade}>
                      <td className="py-2 font-medium">{t.trade}</td>
                      <td className="py-2 text-muted-foreground">{t.unit}</td>
                      <td className="py-2 text-right font-semibold">{t.local.toLocaleString()}</td>
                      <td className={cn("py-2 text-right font-semibold", t.delta >= 0 ? "text-warning" : "text-success")}>{t.delta > 0 ? "+" : ""}{t.delta}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <div className="flex flex-col gap-4">
              <section className="odyssey-surface rounded-2xl p-4">
                <h2 className="font-display text-lg font-semibold">Material trends</h2>
                <ul className="mt-2 space-y-2 text-[12px]">
                  {materials.map(m => (
                    <li key={m.name} className="flex items-center justify-between gap-2">
                      <span>{m.name}</span>
                      <span className={cn("flex items-center gap-1 font-semibold", m.trend >= 0 ? "text-warning" : "text-success")}>
                        {m.trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{m.trend > 0 ? "+" : ""}{m.trend}%
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="odyssey-surface rounded-2xl p-4">
                <h2 className="font-display text-lg font-semibold">Bid climate</h2>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {bidClimate.map(b => (
                    <div key={b.label}>
                      <p className="font-display text-xl font-semibold">{b.value}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{b.label}</p>
                      <p className="text-[10px] text-muted-foreground">{b.note}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <section className="odyssey-surface rounded-2xl p-4">
            <h2 className="font-display text-lg font-semibold">Company vs market</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{cohort} · Cincinnati metro cohort</p>
            <table className="mt-3 w-full text-[12px]">
              <thead><tr className="text-left text-[10px] uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 font-semibold">Metric</th><th className="pb-2 text-right font-semibold">Your company</th>
                <th className="pb-2 text-right font-semibold">Market median</th><th className="pb-2 text-right font-semibold">Position</th>
              </tr></thead>
              <tbody className="divide-y divide-border/50">
                {companyRows.map(r => (
                  <tr key={r.metric}>
                    <td className="py-2.5 font-medium">{r.metric}</td>
                    <td className="py-2.5 text-right font-semibold">{r.company}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{r.market}</td>
                    <td className={cn("py-2.5 text-right font-semibold", r.better ? "text-success" : "text-warning")}>{r.better ? "Ahead of market" : "Above market"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Margins and estimate accuracy outperform the local cohort while cost per square foot runs 3.5% high — driven by premium cabinetry and electrical pricing above regional medians.
            </p>
          </section>
        )}
      </div>
    </TrackShell>
  );
}
