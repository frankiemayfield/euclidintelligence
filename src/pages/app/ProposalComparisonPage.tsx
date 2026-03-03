import { AppLayout } from "@/components/app/AppLayout";
import { ChevronDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";

const tradeComparisons = [
  { trade: "Concrete", yourEstimate: 12400, benchmark: 11800, variance: 5.1, insight: "Concrete pricing is slightly above the local benchmark. May reflect higher material costs or waste factor.", comparableCount: 4200, benchmarkRange: "$10,200 – $13,900" },
  { trade: "Framing", yourEstimate: 23800, benchmark: 21400, variance: 11.2, insight: "Lumber package is 11% above local benchmark. Verify framing waste factor and lumber grade selection.", comparableCount: 3800, benchmarkRange: "$19,100 – $24,600" },
  { trade: "Insulation", yourEstimate: 5400, benchmark: 5100, variance: 5.9, insight: "Within expected range for R-19 wall / R-38 ceiling spec.", comparableCount: 3100, benchmarkRange: "$4,200 – $6,400" },
  { trade: "Drywall", yourEstimate: 12160, benchmark: 11200, variance: 8.6, insight: "Drywall material pricing is elevated for this spec level. Check if Level 5 finish is required.", comparableCount: 4500, benchmarkRange: "$9,800 – $13,100" },
  { trade: "Flooring", yourEstimate: 10500, benchmark: 9800, variance: 7.1, insight: "Mid-tier LVP pricing is slightly above median. Material selection may be driving the difference.", comparableCount: 3600, benchmarkRange: "$8,100 – $12,400" },
  { trade: "Plumbing", yourEstimate: 18500, benchmark: 17900, variance: 3.4, insight: "Plumbing rough-in appears within expected range for full rough + finish scope.", comparableCount: 2800, benchmarkRange: "$15,600 – $20,800" },
  { trade: "HVAC", yourEstimate: 14200, benchmark: 18100, variance: -21.5, insight: "HVAC allowance is significantly below peer median. Ductwork may not be adequately covered in the current allowance.", comparableCount: 2600, benchmarkRange: "$15,400 – $22,100" },
  { trade: "Electrical", yourEstimate: 16800, benchmark: 16200, variance: 3.7, insight: "Electrical is within expected range. Panel upgrade included aligns with comparable projects.", comparableCount: 3200, benchmarkRange: "$14,100 – $19,500" },
  { trade: "Earthwork", yourEstimate: 8600, benchmark: 7800, variance: 10.3, insight: "Slightly elevated. Verify haul distance assumptions and soil condition assumptions.", comparableCount: 2100, benchmarkRange: "$6,200 – $10,400" },
  { trade: "Paving", yourEstimate: 2400, benchmark: 2800, variance: -14.3, insight: "Paving estimate is below peer median. May indicate under-scoped repair area.", comparableCount: 1800, benchmarkRange: "$2,100 – $4,200" },
];

const fmt = (n: number) => `$${n.toLocaleString()}`;

export default function ProposalComparisonPage() {
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);

  const totalYours = tradeComparisons.reduce((s, t) => s + t.yourEstimate, 0);
  const totalBench = tradeComparisons.reduce((s, t) => s + t.benchmark, 0);
  const totalVariance = ((totalYours - totalBench) / totalBench * 100).toFixed(1);

  const aboveBenchmark = tradeComparisons.filter(t => t.variance > 5).length;
  const belowBenchmark = tradeComparisons.filter(t => t.variance < -5).length;
  const withinRange = tradeComparisons.filter(t => Math.abs(t.variance) <= 5).length;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Proposal Comparison</h1>
          <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Compare your estimate against similar projects</p>
        </div>

        {/* Market Fit Score */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-card mb-6 text-center">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Market Fit Score</p>
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary/20 relative mb-4">
            <svg className="absolute inset-0 w-32 h-32 -rotate-90">
              <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(140,50%,32%)" strokeWidth="5" strokeDasharray="351.8" strokeDashoffset="70" strokeLinecap="round" />
            </svg>
            <span className="font-display text-5xl font-bold text-primary">78</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Compared against <span className="font-semibold text-foreground">20,000+ similar estimates</span> in the Midwest region for remodel projects between 2,000–4,000 SF at premium spec level.
          </p>
        </div>

        {/* Comparison Set Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Trades Above Benchmark</p>
            <p className="font-display text-2xl font-bold text-warning">{aboveBenchmark}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Trades Below Benchmark</p>
            <p className="font-display text-2xl font-bold text-destructive">{belowBenchmark}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Within Expected Range</p>
            <p className="font-display text-2xl font-bold text-primary">{withinRange}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Overall Variance</p>
            <p className={`font-display text-2xl font-bold ${Number(totalVariance) > 0 ? "text-warning" : "text-primary"}`}>{Number(totalVariance) > 0 ? "+" : ""}{totalVariance}%</p>
          </div>
        </div>

        {/* Trade Comparison Table */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-foreground">Trade-Level Benchmark Comparison</h2>
            <p className="text-xs text-muted-foreground mt-0.5">See where your pricing is above or below the market</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-8" />
                {["Trade", "Your Estimate", "Local Benchmark", "Variance", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tradeComparisons.map((t) => {
                const isExpanded = expandedTrade === t.trade;
                const statusLabel = Math.abs(t.variance) <= 5 ? "Within Range" : t.variance > 0 ? "Above Benchmark" : "Below Benchmark";
                const statusColor = Math.abs(t.variance) <= 5 ? "bg-primary/10 text-primary" : t.variance > 0 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive";
                return (
                  <>
                    <tr key={t.trade} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setExpandedTrade(isExpanded ? null : t.trade)}>
                      <td className="pl-3 py-3"><ChevronDown size={14} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} /></td>
                      <td className="px-4 py-3 font-medium text-foreground">{t.trade}</td>
                      <td className="px-4 py-3 font-display font-semibold text-foreground">{fmt(t.yourEstimate)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{fmt(t.benchmark)}</td>
                      <td className="px-4 py-3 flex items-center gap-1">
                        {t.variance > 0 ? <TrendingUp size={14} className="text-warning" /> : t.variance < 0 ? <TrendingDown size={14} className="text-destructive" /> : <Minus size={14} className="text-muted-foreground" />}
                        <span className={t.variance > 5 ? "text-warning" : t.variance < -5 ? "text-destructive" : "text-muted-foreground"}>
                          {t.variance > 0 ? "+" : ""}{t.variance}%
                        </span>
                      </td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>{statusLabel}</span></td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${t.trade}-detail`} className="border-b border-border bg-muted/10">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="grid md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2">
                              <div><span className="text-muted-foreground">Comparable Estimates:</span> <span className="text-foreground ml-1">{t.comparableCount.toLocaleString()}</span></div>
                              <div><span className="text-muted-foreground">Benchmark Range:</span> <span className="text-foreground ml-1">{t.benchmarkRange}</span></div>
                              <div><span className="text-muted-foreground">Your Position:</span> <span className="text-foreground ml-1">{fmt(t.yourEstimate)}</span></div>
                            </div>
                            <div className="space-y-2">
                              <div><span className="text-muted-foreground">Insight:</span> <span className="text-foreground ml-1">{t.insight}</span></div>
                              <div className="pt-1 border-t border-border">
                                <span className="text-muted-foreground">Recommended Action:</span>
                                <span className="text-foreground font-medium ml-1">
                                  {Math.abs(t.variance) <= 5 ? "No action needed — within expected range." : t.variance > 0 ? "Review pricing and scope to verify premium is justified." : "Verify scope completeness — estimate may be under-scoped."}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-border bg-muted/30 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Your Total: {fmt(totalYours)}</span>
            <span className="text-sm text-muted-foreground">Benchmark Total: {fmt(totalBench)}</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
