import { SubLayout } from "@/components/sub/SubLayout";
import { TrendingUp, TrendingDown, AlertTriangle, Download, Filter, Target, ShieldCheck, Gauge } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const tradeCategories = [
  { category: "Labor", yourCost: 8188, yourSell: 10310, benchmark: 9800, variance: 5.2 },
  { category: "Lumber/Materials", yourCost: 8620, yourSell: 10861, benchmark: 10200, variance: 6.5 },
  { category: "Trusses", yourCost: 4070, yourSell: 5128, benchmark: 5000, variance: 2.6 },
  { category: "Sheathing", yourCost: 3055, yourSell: 3849, benchmark: 3600, variance: 6.9 },
  { category: "Hardware", yourCost: 1200, yourSell: 1512, benchmark: 1400, variance: 8.0 },
  { category: "Headers/LVL", yourCost: 810, yourSell: 1021, benchmark: 950, variance: 7.5 },
  { category: "Misc/Blocking", yourCost: 1880, yourSell: 2368, benchmark: 2200, variance: 7.6 },
];

const fmt = (n: number) => `$${n.toLocaleString()}`;

export default function SubMarketComparisonPage() {
  const [filter, setFilter] = useState<"all" | "above" | "below" | "in-range">("all");

  const totalSell = tradeCategories.reduce((s, t) => s + t.yourSell, 0);
  const totalBench = tradeCategories.reduce((s, t) => s + t.benchmark, 0);
  const totalCost = tradeCategories.reduce((s, t) => s + t.yourCost, 0);
  const totalVariance = ((totalSell - totalBench) / totalBench * 100).toFixed(1);
  const grossMargin = ((totalSell - totalCost) / totalSell * 100).toFixed(1);

  const filtered = tradeCategories.filter(t => {
    if (filter === "above") return t.variance > 5;
    if (filter === "below") return t.variance < -5;
    if (filter === "in-range") return Math.abs(t.variance) <= 5;
    return true;
  });

  const sensitivityLabel = Number(totalVariance) > 8 ? "May Reduce Win Probability" : Number(totalVariance) > 3 ? "Slightly Above Market" : "Likely Competitive";
  const sensitivityColor = Number(totalVariance) > 8 ? "text-destructive" : Number(totalVariance) > 3 ? "text-warning" : "text-primary";

  return (
    <SubLayout>
      <div className="p-6 lg:p-8 max-w-[1400px] space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Market Comparison</h1>
          <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Framing quote benchmarked against similar quotes</p>
        </div>

        {/* Score Panel */}
        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4 shrink-0">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                  <circle cx="32" cy="32" r="26" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="163.4" strokeDashoffset="30" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-primary">82</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Proposal Score</p>
                <p className="text-xs text-muted-foreground mt-0.5">Compared against similar framing quotes</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-border" />
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs">
              <div><span className="text-muted-foreground">Compared Against</span> <span className="text-foreground font-medium ml-1">4,280 framing quotes</span></div>
              <div><span className="text-muted-foreground">Region</span> <span className="text-foreground font-medium ml-1">Midwest</span></div>
              <div><span className="text-muted-foreground">Project Type</span> <span className="text-foreground font-medium ml-1">Remodel</span></div>
              <div><span className="text-muted-foreground">Size Band</span> <span className="text-foreground font-medium ml-1">2,000–4,000 SF</span></div>
              <div><span className="text-muted-foreground">Spec Level</span> <span className="text-foreground font-medium ml-1">Premium</span></div>
              <div><span className="text-muted-foreground">Trade</span> <span className="text-foreground font-medium ml-1">Framing</span></div>
            </div>
          </div>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Above Benchmark", value: String(tradeCategories.filter(t => t.variance > 5).length), color: "text-warning" },
            { label: "In Range", value: String(tradeCategories.filter(t => Math.abs(t.variance) <= 5).length), color: "text-primary" },
            { label: "Overall Variance", value: `+${totalVariance}%`, color: "text-warning" },
            { label: "Gross Margin", value: `${grossMargin}%`, color: "text-primary" },
            { label: "Market Position", value: sensitivityLabel, color: sensitivityColor },
          ].map(c => (
            <div key={c.label} className="bg-card border border-border rounded-2xl p-3 shadow-card text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">{c.label}</p>
              <p className={`font-display text-sm font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Market Sensitivity + Quick View */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl shadow-card p-4 text-center">
            <Gauge size={20} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Market Sensitivity</p>
            <p className={`font-display text-sm font-bold ${sensitivityColor}`}>{sensitivityLabel}</p>
            <p className="text-[10px] text-muted-foreground mt-1">+{totalVariance}% vs local median</p>
          </div>
          <div className="bg-card border border-border rounded-2xl shadow-card p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Quick View</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <Target size={10} className="text-warning shrink-0" />
                <span className="text-muted-foreground">Above Market:</span>
                <span className="text-foreground font-medium">Hardware, Sheathing</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={10} className="text-primary shrink-0" />
                <span className="text-muted-foreground">Strongest:</span>
                <span className="text-foreground font-medium">Trusses, Labor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          {(["all", "above", "below", "in-range"] as const).map(f => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" className="text-xs h-7" onClick={() => setFilter(f)}>
              {f === "all" ? "All Categories" : f === "above" ? "Above Benchmark" : f === "below" ? "Below Benchmark" : "In Range"}
            </Button>
          ))}
        </div>

        {/* Benchmark Table */}
        <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Category", "Your Cost", "Bid Price", "Benchmark", "Variance", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.category} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium text-foreground">{t.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(t.yourCost)}</td>
                  <td className="px-4 py-3 font-display font-semibold text-foreground">{fmt(t.yourSell)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(t.benchmark)}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 ${t.variance > 5 ? "text-warning" : t.variance < -5 ? "text-destructive" : "text-primary"}`}>
                      {t.variance > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {t.variance > 0 ? "+" : ""}{t.variance.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      Math.abs(t.variance) <= 5 ? "bg-primary/10 text-primary" : t.variance > 5 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                    }`}>
                      {Math.abs(t.variance) <= 5 ? "In Range" : t.variance > 5 ? "Above" : "Below"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">Total</td>
                <td className="px-4 py-3 font-display font-semibold text-foreground">{fmt(totalCost)}</td>
                <td className="px-4 py-3 font-display font-bold text-primary">{fmt(totalSell)}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmt(totalBench)}</td>
                <td className="px-4 py-3 text-warning font-semibold">+{totalVariance}%</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Download size={12} className="mr-1.5" />Export Comparison Snapshot
          </Button>
        </div>
      </div>
    </SubLayout>
  );
}
