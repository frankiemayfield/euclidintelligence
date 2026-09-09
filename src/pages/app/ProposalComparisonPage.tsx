import { AppLayout } from "@/components/app/AppLayout";
import { TrendingUp, TrendingDown, AlertTriangle, Download, ArrowRight, Filter, ShieldCheck, Target, Gauge } from "lucide-react";
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TradeComparisonTable } from "@/components/app/estimate-comparison/TradeComparisonTable";
import { SuggestedActionsPanel } from "@/components/app/estimate-comparison/SuggestedActionsPanel";
import { tradeComparisons, fmt } from "@/components/app/estimate-comparison/tradeData";
import { useDemoProject } from "@/hooks/use-demo-project";

type FilterMode = "all" | "above" | "below" | "in-range";
type CompareMode = "sell" | "cost" | "both";

export default function ProposalComparisonPage() {
  const { project } = useDemoProject();
  const [searchParams] = useSearchParams();
  const isUploadSource = searchParams.get("source") === "upload";

  const [filter, setFilter] = useState<FilterMode>("all");
  const [compareMode, setCompareMode] = useState<CompareMode>("sell");

  const sourceCost = tradeComparisons.reduce((sum, trade) => sum + trade.yourCost, 0);
  const sourceSell = tradeComparisons.reduce((sum, trade) => sum + trade.yourSell, 0);
  const sourceBench = tradeComparisons.reduce((sum, trade) => sum + trade.benchmark, 0);
  const targetBenchmark = project.benchmark.low && project.benchmark.high ? (project.benchmark.low + project.benchmark.high) / 2 : project.clientPrice ?? sourceBench;
  const projectTrades = useMemo(() => tradeComparisons.map(trade => {
    const yourCost = Math.round(trade.yourCost * ((project.builderCost ?? sourceCost) / sourceCost));
    const yourSell = Math.round(trade.yourSell * ((project.clientPrice ?? sourceSell) / sourceSell));
    const benchmark = Math.round(trade.benchmark * (targetBenchmark / sourceBench));
    return { ...trade, yourCost, yourSell, benchmark, variance: ((yourSell - benchmark) / benchmark) * 100 };
  }), [project.id, project.builderCost, project.clientPrice, targetBenchmark, sourceBench, sourceCost, sourceSell]);
  const totalCost = projectTrades.reduce((s, t) => s + t.yourCost, 0);
  const totalSell = projectTrades.reduce((s, t) => s + t.yourSell, 0);
  const totalBench = projectTrades.reduce((s, t) => s + t.benchmark, 0);
  const totalVariance = ((totalSell - totalBench) / totalBench * 100).toFixed(1);
  const grossMargin = ((totalSell - totalCost) / totalSell * 100).toFixed(1);
  const peerMargin = 16.2;

  const aboveBenchmark = projectTrades.filter(t => t.variance > 5).length;
  const belowBenchmark = projectTrades.filter(t => t.variance < -5).length;
  const withinRange = projectTrades.filter(t => Math.abs(t.variance) <= 5).length;

  const filteredTrades = useMemo(() => {
    switch (filter) {
      case "above": return projectTrades.filter(t => t.variance > 5);
      case "below": return projectTrades.filter(t => t.variance < -5);
      case "in-range": return projectTrades.filter(t => Math.abs(t.variance) <= 5);
      default: return projectTrades;
    }
  }, [filter, projectTrades]);

  const sensitivityLabel = Number(totalVariance) > 8
    ? "May Reduce Win Probability"
    : Number(totalVariance) > 3
    ? "Slightly Above Market"
    : Number(totalVariance) < -8
    ? "Conservative — Risk of Under-Scope"
    : "Likely Competitive";

  const sensitivityColor = Number(totalVariance) > 8
    ? "text-destructive"
    : Number(totalVariance) > 3
    ? "text-warning"
    : Number(totalVariance) < -8
    ? "text-destructive"
    : "text-primary";

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-[1400px] space-y-6">

        {/* Header + Market Context */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Market Comparison</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isUploadSource
              ? "Uploaded estimate — Benchmark analysis against market dataset"
               : `${project.name} — Market benchmark analysis`}
          </p>
        </div>

        {/* Compact Score + Market Context Strip */}
        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Score */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                  <circle cx="32" cy="32" r="26" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="163.4" strokeDashoffset="36" strokeLinecap="round" />
                </svg>
                 <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-primary">{project.proposalScore ?? "—"}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Proposal Score</p>
                <p className="text-xs text-muted-foreground mt-0.5">Strong benchmark alignment</p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-12 bg-border" />

            {/* Market Context */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs">
               <div><span className="text-muted-foreground">Compared Against</span> <span className="text-foreground font-medium ml-1">{project.benchmark.sampleCount.toLocaleString()} estimates</span></div>
               <div><span className="text-muted-foreground">Region</span> <span className="text-foreground font-medium ml-1">Cincinnati, Ohio</span></div>
               <div><span className="text-muted-foreground">Project Type</span> <span className="text-foreground font-medium ml-1">{project.type}</span></div>
               <div><span className="text-muted-foreground">Size Band</span> <span className="text-foreground font-medium ml-1">{project.size ? `${project.size.toLocaleString()} SF` : "Comparable scope"}</span></div>
               <div><span className="text-muted-foreground">Spec Level</span> <span className="text-foreground font-medium ml-1">{project.specLevel}</span></div>
              <div><span className="text-muted-foreground">Pricing Mode</span> <span className="text-foreground font-medium ml-1">Cost Plus</span></div>
            </div>
          </div>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: "Above Benchmark", value: String(aboveBenchmark), color: "text-warning" },
            { label: "Below Benchmark", value: String(belowBenchmark), color: "text-destructive" },
            { label: "In Range", value: String(withinRange), color: "text-primary" },
            { label: "Overall Variance", value: `${Number(totalVariance) > 0 ? "+" : ""}${totalVariance}%`, color: Number(totalVariance) > 0 ? "text-warning" : "text-primary" },
            { label: "Gross Margin", value: `${grossMargin}%`, color: Number(grossMargin) < peerMargin ? "text-warning" : "text-primary", sub: `Peer: ${peerMargin}%` },
            { label: "Market Position", value: Number(totalVariance) > 3 ? "Above Market" : "In Range", color: Number(totalVariance) > 3 ? "text-warning" : "text-primary" },
          ].map(c => (
            <div key={c.label} className="bg-card border border-border rounded-2xl p-3 shadow-card text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">{c.label}</p>
              <p className={`font-display text-lg font-bold ${c.color}`}>{c.value}</p>
              {c.sub && <p className="text-[10px] text-muted-foreground">{c.sub}</p>}
            </div>
          ))}
        </div>

        {/* Insights Row: What Changed + Market Sensitivity — only for internal workflow */}
        {!isUploadSource && (
          <div className="grid md:grid-cols-3 gap-4">
            {/* What Changed After Pricing */}
            <div className="md:col-span-2 bg-card border border-border rounded-2xl shadow-card p-5">
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

            {/* Market Sensitivity + Risks/Opportunities */}
            <div className="space-y-4">
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
                    <Target size={10} className="text-destructive shrink-0" />
                    <span className="text-muted-foreground">Top Risk:</span>
                    <span className="text-foreground font-medium">HVAC under-scope</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={10} className="text-primary shrink-0" />
                    <span className="text-muted-foreground">Strongest:</span>
                    <span className="text-foreground font-medium">Electrical, Plumbing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload source: Market Sensitivity inline */}
        {isUploadSource && (
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
                  <Target size={10} className="text-destructive shrink-0" />
                  <span className="text-muted-foreground">Top Risk:</span>
                  <span className="text-foreground font-medium">HVAC under-scope</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={10} className="text-primary shrink-0" />
                  <span className="text-muted-foreground">Strongest:</span>
                  <span className="text-foreground font-medium">Electrical, Plumbing</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Structure vs Peers */}
        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <h2 className="font-display font-semibold text-foreground mb-1">
            {isUploadSource ? "Price Position vs Market" : "Pricing Structure vs Peers"}
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {isUploadSource
              ? "How the uploaded pricing compares to market benchmarks"
              : "How your pricing approach compares to similar proposals"}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(isUploadSource ? [
              { label: "Market Position", yours: Number(totalVariance) > 3 ? "Above Market" : "In Range", peer: "Median", status: Number(totalVariance) > 3 ? "above" : "aligned" },
              { label: "Cost Category Alignment", yours: `${withinRange}/${tradeComparisons.length} in range`, peer: "Expected", status: withinRange >= tradeComparisons.length * 0.6 ? "aligned" : "below" },
              { label: "Overall Variance", yours: `${Number(totalVariance) > 0 ? "+" : ""}${totalVariance}%`, peer: "±5% target", status: Math.abs(Number(totalVariance)) <= 5 ? "aligned" : "above" },
              { label: "Competitiveness", yours: sensitivityLabel, peer: "Peer range", status: Number(totalVariance) > 8 ? "above" : "aligned" },
              { label: "Gross Margin", yours: `${grossMargin}%`, peer: `${peerMargin}%`, status: Number(grossMargin) < peerMargin ? "below" : "aligned" },
            ] : [
              { label: "Pricing Mode", yours: "Cost Plus", peer: "62% Cost Plus", status: "aligned" },
              { label: "Avg Markup", yours: "18%", peer: "16.5%", status: "above" },
              { label: "Fee Treatment", yours: "Shown separately", peer: "54% separate", status: "aligned" },
              { label: "Contingency", yours: "5%", peer: "4.2% avg", status: "above" },
              { label: "Gross Margin", yours: `${grossMargin}%`, peer: `${peerMargin}%`, status: Number(grossMargin) < peerMargin ? "below" : "aligned" },
            ]).map(s => (
              <div key={s.label} className="bg-muted/20 rounded-lg p-3 text-xs">
                <p className="text-muted-foreground mb-1">{s.label}</p>
                <p className="text-foreground font-semibold">{s.yours}</p>
                <p className="text-muted-foreground mt-1">Peer: {s.peer}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-1 inline-block ${
                  s.status === "aligned" ? "bg-primary/10 text-primary" : s.status === "below" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                }`}>
                  {s.status === "aligned" ? "Aligned" : s.status === "below" ? "Below peer avg" : "Above peer avg"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Bar + Compare Mode */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          {(["all", "above", "below", "in-range"] as FilterMode[]).map(f => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All Trades" : f === "above" ? "Above Benchmark" : f === "below" ? "Below Benchmark" : "In Range"}
            </Button>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground mr-1">Compare:</span>
            {(["sell", "cost", "both"] as CompareMode[]).map(m => (
              <Button
                key={m}
                variant={compareMode === m ? "secondary" : "ghost"}
                size="sm"
                className="text-xs h-7"
                onClick={() => setCompareMode(m)}
              >
                {m === "sell" ? "Client Price" : m === "cost" ? "Builder Cost" : "Both"}
              </Button>
            ))}
          </div>
        </div>

        {/* Trade-Level Benchmark Table */}
        <TradeComparisonTable trades={filteredTrades} compareMode={compareMode} isUploadSource={isUploadSource} />

        {/* Suggested Actions — only for internal workflow */}
        {!isUploadSource && <SuggestedActionsPanel trades={tradeComparisons} />}

        {/* Workflow Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Download size={12} className="mr-1.5" />Export Comparison Snapshot
          </Button>
          {!isUploadSource && (
            <>
              <Button variant="outline" size="sm" className="text-xs">
                <ArrowRight size={12} className="mr-1.5" />Send Flagged to Estimate Builder
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <ArrowRight size={12} className="mr-1.5" />Send to Pricing & Margin
              </Button>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
