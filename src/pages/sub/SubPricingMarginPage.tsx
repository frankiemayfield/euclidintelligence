import { SubLayout } from "@/components/sub/SubLayout";
import { useState } from "react";
import { AlertTriangle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowTransition } from "@/components/app/WorkflowTransition";
import { trueFrameCostCategories } from "@/data/demoUniverse";
import { useDemoProject } from "@/hooks/use-demo-project";

const fmt = (n: number) => `$${n.toLocaleString()}`;
const pct = (n: number) => `${n.toFixed(1)}%`;

export default function SubPricingMarginPage() {
  const { project, quote } = useDemoProject();
  const targetBase = quote.currentAmount ? quote.currentAmount / 1.25 : quote.preliminaryAmount ?? 0;
  const referenceBase = trueFrameCostCategories.reduce((sum, category) => sum + category.base, 0);
  const costCategories = trueFrameCostCategories.map(category => ({ ...category, base: Math.round(targetBase * category.base / referenceBase) }));
  const baseCost = costCategories.reduce((sum, category) => sum + category.base, 0);
  const [marketTransition, setMarketTransition] = useState(false);
  const [overhead, setOverhead] = useState(8);
  const [profit, setProfit] = useState(12);
  const [contingency, setContingency] = useState(5);

  const effectiveMarkup = overhead + profit;
  const contingencyAmt = baseCost * (contingency / 100);
  const totalMarkup = baseCost * (effectiveMarkup / 100);
  const bidPrice = baseCost + totalMarkup + contingencyAmt;
  const grossProfit = bidPrice - baseCost;
  const grossMargin = (grossProfit / bidPrice) * 100;

  const targetMargin = 18;
  const marginWarning = grossMargin < targetMargin;

  return (
    <SubLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Pricing & Margin</h1>
             <p className="text-sm text-muted-foreground mt-1">{project.name} — Turn estimated cost into bid price to Mayfield & Co.</p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setMarketTransition(true)}>
            <BarChart3 size={14} />
            Compare Against Market
          </Button>
        </div>

        {/* Source Context */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Subcontractor Cost", value: fmt(baseCost) },
            { label: "Bid Price to GC", value: fmt(Math.round(bidPrice)) },
            { label: "Gross Profit", value: fmt(Math.round(grossProfit)) },
            { label: "Gross Margin", value: pct(grossMargin) },
          ].map(c => (
            <div key={c.label} className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
              <p className="font-display text-xl font-bold text-foreground mt-0.5">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Pricing Controls */}
        <div className="bg-card border border-border rounded-xl shadow-card p-5 mb-6">
          <h2 className="font-display font-semibold text-foreground mb-4">Pricing Strategy</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Overhead %</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={25} value={overhead} onChange={e => setOverhead(+e.target.value)} className="flex-1 accent-primary" />
                <span className="text-sm font-display font-bold text-foreground w-10 text-right">{overhead}%</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Profit %</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={30} value={profit} onChange={e => setProfit(+e.target.value)} className="flex-1 accent-primary" />
                <span className="text-sm font-display font-bold text-foreground w-10 text-right">{profit}%</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Contingency %</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={15} step={0.5} value={contingency} onChange={e => setContingency(+e.target.value)} className="flex-1 accent-primary" />
                <span className="text-sm font-display font-bold text-foreground w-10 text-right">{contingency}%</span>
              </div>
            </div>
          </div>
        </div>

        {marginWarning && (
          <div className="flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-lg px-4 py-2.5 mb-6">
            <AlertTriangle size={14} className="text-warning shrink-0" />
            <p className="text-xs text-warning">Gross margin ({pct(grossMargin)}) is below target ({targetMargin}%).</p>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-foreground">Cost Breakdown</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Category", "Base Cost", "% of Total", "Loaded Cost"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {costCategories.map(c => {
                const loaded = c.base * (1 + effectiveMarkup / 100);
                const pctOfTotal = (c.base / baseCost * 100).toFixed(1);
                return (
                  <tr key={c.name} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmt(c.base)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{pctOfTotal}%</td>
                    <td className="px-4 py-3 font-display font-semibold text-foreground">{fmt(Math.round(loaded))}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">Total</td>
                <td className="px-4 py-3 font-display font-semibold text-foreground">{fmt(baseCost)}</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 font-display font-bold text-primary">{fmt(Math.round(bidPrice))}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Markup", value: pct(effectiveMarkup) },
            { label: "Contingency", value: fmt(Math.round(contingencyAmt)) },
            { label: "Total Markup $", value: fmt(Math.round(totalMarkup)) },
            { label: "Bid Price", value: fmt(Math.round(bidPrice)) },
          ].map(c => (
            <div key={c.label} className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
              <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
              <p className="font-display text-xl font-bold text-foreground">{c.value}</p>
            </div>
          ))}
        </div>
      </div>

      <WorkflowTransition
        active={marketTransition}
        headline="Comparing your pricing"
        steps={[
          { label: "Preparing your workspace…" },
          { label: "Benchmark alignment analysis" },
          { label: "Comparing against thousands of estimates" },
          { label: "Analyzing market pricing" },
          { label: "Comparing costs and prices" },
          { label: "Generating proposal score" },
        ]}
        targetPath="/sub/market-comparison"
        onComplete={() => setMarketTransition(false)}
      />
    </SubLayout>
  );
}
