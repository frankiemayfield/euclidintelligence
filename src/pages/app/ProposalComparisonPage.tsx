import { AppLayout } from "@/components/app/AppLayout";
import { ChevronDown, TrendingUp, TrendingDown, Minus, AlertTriangle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const tradeComparisons = [
  { trade: "Concrete", yourCost: 12400, yourSell: 14570, benchmark: 13800, variance: 5.6, insight: "Concrete sell price is slightly above local benchmark after markup. Material costs may be driving the difference.", comparableCount: 4200, benchmarkRange: "$11,800 – $15,900", pricingNote: "18% markup applied — aligned with peer average" },
  { trade: "Framing", yourCost: 23800, yourSell: 28070, benchmark: 25200, variance: 11.4, insight: "Lumber package is 11% above local benchmark after pricing. Verify framing waste factor and lumber grade selection.", comparableCount: 3800, benchmarkRange: "$22,100 – $28,600", pricingNote: "Markup slightly above peer median for framing" },
  { trade: "Insulation", yourCost: 5400, yourSell: 6170, benchmark: 5900, variance: 4.6, insight: "Within expected range for R-19 wall / R-38 ceiling spec after markup.", comparableCount: 3100, benchmarkRange: "$4,800 – $7,200", pricingNote: "Pricing aligned with market" },
  { trade: "Drywall", yourCost: 12160, yourSell: 14310, benchmark: 13100, variance: 9.2, insight: "Drywall sell price is elevated for this spec level. Check if Level 5 finish is required.", comparableCount: 4500, benchmarkRange: "$11,200 – $15,400", pricingNote: "Material markup driving above-market position" },
  { trade: "Flooring", yourCost: 10500, yourSell: 12350, benchmark: 11500, variance: 7.4, insight: "Mid-tier LVP pricing is above median after markup. Material selection may be the driver.", comparableCount: 3600, benchmarkRange: "$9,400 – $14,100", pricingNote: "Within acceptable range" },
  { trade: "Plumbing", yourCost: 18500, yourSell: 21770, benchmark: 20900, variance: 4.2, insight: "Plumbing sell price is within expected range for full rough + finish scope.", comparableCount: 2800, benchmarkRange: "$17,800 – $24,200", pricingNote: "Sub quote pricing — competitive" },
  { trade: "HVAC", yourCost: 14200, yourSell: 16710, benchmark: 21200, variance: -21.2, insight: "HVAC sell price is significantly below peer median. Ductwork may not be adequately covered in the current allowance.", comparableCount: 2600, benchmarkRange: "$18,100 – $25,800", pricingNote: "⚠ Allowance-based — risk of under-scope" },
  { trade: "Electrical", yourCost: 16800, yourSell: 19770, benchmark: 19000, variance: 4.1, insight: "Electrical is within expected range. Panel upgrade aligns with comparable projects.", comparableCount: 3200, benchmarkRange: "$16,400 – $22,800", pricingNote: "Sub quote — well-positioned" },
  { trade: "Earthwork", yourCost: 8600, yourSell: 10120, benchmark: 9100, variance: 11.2, insight: "Slightly elevated after markup. Verify haul distance and soil condition assumptions.", comparableCount: 2100, benchmarkRange: "$7,400 – $12,100", pricingNote: "Overhead allocation may be driving overshoot" },
  { trade: "Paving", yourCost: 2400, yourSell: 2820, benchmark: 3400, variance: -17.1, insight: "Paving sell price is below peer median. May indicate under-scoped repair area.", comparableCount: 1800, benchmarkRange: "$2,600 – $5,100", pricingNote: "Review scope completeness" },
];

const fmt = (n: number) => `$${n.toLocaleString()}`;

export default function ProposalComparisonPage() {
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);

  const totalCost = tradeComparisons.reduce((s, t) => s + t.yourCost, 0);
  const totalSell = tradeComparisons.reduce((s, t) => s + t.yourSell, 0);
  const totalBench = tradeComparisons.reduce((s, t) => s + t.benchmark, 0);
  const totalVariance = ((totalSell - totalBench) / totalBench * 100).toFixed(1);
  const grossMargin = ((totalSell - totalCost) / totalSell * 100).toFixed(1);
  const peerMargin = 16.2;

  const aboveBenchmark = tradeComparisons.filter(t => t.variance > 5).length;
  const belowBenchmark = tradeComparisons.filter(t => t.variance < -5).length;
  const withinRange = tradeComparisons.filter(t => Math.abs(t.variance) <= 5).length;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Estimate Comparison</h1>
          <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Compare your priced estimate against similar projects</p>
        </div>

        {/* Market Fit Score */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-card mb-6 text-center">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Estimator Score</p>
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary/20 relative mb-4">
            <svg className="absolute inset-0 w-32 h-32 -rotate-90">
              <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(140,50%,32%)" strokeWidth="5" strokeDasharray="351.8" strokeDashoffset="70" strokeLinecap="round" />
            </svg>
            <span className="font-display text-5xl font-bold text-primary">78</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Compared against <span className="font-semibold text-foreground">20,000+ similar proposals</span> in the Midwest region for remodel projects between 2,000–4,000 SF at premium spec level.
          </p>
          <p className="text-xs text-muted-foreground mt-1">Pricing mode: <span className="text-foreground font-medium">Cost Plus</span> · Fee: <span className="text-foreground font-medium">Shown separately</span></p>
        </div>

        {/* Summary Cards */}
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

        {/* Margin & Pricing Position */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Your Sell Price</p>
            <p className="font-display text-xl font-bold text-foreground">{fmt(totalSell)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">vs benchmark {fmt(totalBench)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Your Gross Margin</p>
            <p className={`font-display text-xl font-bold ${Number(grossMargin) < peerMargin ? "text-warning" : "text-primary"}`}>{grossMargin}%</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Peer average: {peerMargin}%</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground mb-1">Proposal Position</p>
            <p className="font-display text-xl font-bold text-foreground">Above Market</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">+{totalVariance}% vs local median</p>
          </div>
        </div>

        {/* What Changed After Pricing */}
        <div className="bg-card border border-border rounded-xl shadow-card p-5 mb-6">
          <h2 className="font-display font-semibold text-foreground mb-3">What Changed After Pricing</h2>
          <div className="space-y-2">
            {[
              { text: "Sell price moved from in-range to above market after contingency and markup were applied", type: "warning" },
              { text: "Cost Plus structure keeps total transparent but margin is slightly below company target (18%)", type: "warning" },
              { text: "HVAC remains significantly below peer benchmark — pricing did not offset scope risk", type: "error" },
              { text: "Electrical and plumbing pricing aligned well with local sub quote benchmarks", type: "ok" },
            ].map((item, i) => (
              <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                item.type === "error" ? "bg-destructive/5 text-destructive" : item.type === "warning" ? "bg-warning/5 text-warning" : "bg-primary/5 text-primary"
              }`}>
                {item.type === "ok" ? <TrendingUp size={12} className="shrink-0 mt-0.5" /> : <AlertTriangle size={12} className="shrink-0 mt-0.5" />}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Structure Comparison */}
        <div className="bg-card border border-border rounded-xl shadow-card p-5 mb-6">
          <h2 className="font-display font-semibold text-foreground mb-1">Pricing Structure vs Peers</h2>
          <p className="text-xs text-muted-foreground mb-4">How your pricing approach compares to similar proposals</p>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { label: "Pricing Mode", yours: "Cost Plus", peer: "62% Cost Plus", status: "aligned" },
              { label: "Avg Markup", yours: "18%", peer: "16.5%", status: "above" },
              { label: "Fee Treatment", yours: "Shown separately", peer: "54% separate", status: "aligned" },
              { label: "Contingency", yours: "5%", peer: "4.2% avg", status: "above" },
            ].map(s => (
              <div key={s.label} className="bg-muted/20 rounded-lg p-3 text-xs">
                <p className="text-muted-foreground mb-1">{s.label}</p>
                <p className="text-foreground font-semibold">{s.yours}</p>
                <p className="text-muted-foreground mt-1">Peer: {s.peer}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-1 inline-block ${
                  s.status === "aligned" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                }`}>
                  {s.status === "aligned" ? "Aligned" : "Above peer avg"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Comparison Table */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-foreground">Trade-Level Benchmark Comparison</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Comparing sell price (after markup) against local benchmark</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-8" />
                {["Trade", "Your Cost", "Your Sell", "Benchmark", "Variance", "Status"].map((h) => (
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
                  <tbody key={t.trade}>
                    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setExpandedTrade(isExpanded ? null : t.trade)}>
                      <td className="pl-3 py-3"><ChevronDown size={14} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} /></td>
                      <td className="px-4 py-3 font-medium text-foreground">{t.trade}</td>
                      <td className="px-4 py-3 text-muted-foreground">{fmt(t.yourCost)}</td>
                      <td className="px-4 py-3 font-display font-semibold text-foreground">{fmt(t.yourSell)}</td>
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
                      <tr className="border-b border-border bg-muted/10">
                        <td colSpan={7} className="px-5 py-4">
                          <div className="grid md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2">
                              <div><span className="text-muted-foreground">Comparable Proposals:</span> <span className="text-foreground ml-1">{t.comparableCount.toLocaleString()}</span></div>
                              <div><span className="text-muted-foreground">Benchmark Range:</span> <span className="text-foreground ml-1">{t.benchmarkRange}</span></div>
                              <div><span className="text-muted-foreground">Your Sell Position:</span> <span className="text-foreground ml-1">{fmt(t.yourSell)}</span></div>
                              <div><span className="text-muted-foreground">Pricing Note:</span> <span className="text-foreground ml-1">{t.pricingNote}</span></div>
                            </div>
                            <div className="space-y-2">
                              <div><span className="text-muted-foreground">Insight:</span> <span className="text-foreground ml-1">{t.insight}</span></div>
                              <div className="pt-1 border-t border-border">
                                <span className="text-muted-foreground">Recommended Action:</span>
                                <span className="text-foreground font-medium ml-1">
                                  {Math.abs(t.variance) <= 5 ? "No action needed — pricing aligned with market." : t.variance > 0 ? "Review pricing in Pricing & Margin — may reduce competitiveness." : "Verify scope completeness — estimate may be under-scoped."}
                                </span>
                              </div>
                              <div className="flex gap-2 pt-1">
                                <Button variant="outline" size="sm" className="text-xs h-6"><ArrowRight size={10} className="mr-1" />View in Pricing & Margin</Button>
                                <Button variant="outline" size="sm" className="text-xs h-6"><ArrowRight size={10} className="mr-1" />View in Estimate Builder</Button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-border bg-muted/30 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Your Total Sell: <span className="font-display font-semibold text-foreground">{fmt(totalSell)}</span></span>
            <span className="text-sm text-muted-foreground">Benchmark Total: <span className="font-display font-semibold text-foreground">{fmt(totalBench)}</span></span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
