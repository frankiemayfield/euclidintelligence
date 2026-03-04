import { ChevronDown, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BenchmarkRangeBar } from "./BenchmarkRangeBar";
import type { TradeComparison } from "./tradeData";
import { fmt } from "./tradeData";

interface TradeComparisonTableProps {
  trades: TradeComparison[];
  compareMode: "sell" | "cost" | "both";
  isUploadSource?: boolean;
}

const driverLabels: Record<string, string> = {
  labor: "Labor-driven",
  material: "Material-driven",
  scope: "Scope gap",
  markup: "Markup-driven",
  fee: "Fee-driven",
};

export function TradeComparisonTable({ trades, compareMode, isUploadSource = false }: TradeComparisonTableProps) {
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);
  const totalCost = trades.reduce((s, t) => s + t.yourCost, 0);
  const totalSell = trades.reduce((s, t) => s + t.yourSell, 0);
  const totalBench = trades.reduce((s, t) => s + t.benchmark, 0);

  const showCost = compareMode === "cost" || compareMode === "both";
  const showSell = compareMode === "sell" || compareMode === "both";

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-display font-semibold text-foreground">Trade-Level Benchmark Comparison</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Comparing your estimate against local benchmark by trade</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-10 px-3 py-3" />
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground min-w-[140px]">Trade</th>
              {showCost && (
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground min-w-[110px]">Builder Cost</th>
              )}
              {showSell && (
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground min-w-[110px]">Client Price</th>
              )}
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground min-w-[110px]">Benchmark</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground min-w-[90px]">Variance</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-center min-w-[140px]">Range</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-center min-w-[80px]">Status</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => {
              const isExpanded = expandedTrade === t.trade;
              const statusLabel = Math.abs(t.variance) <= 5 ? "In Range" : t.variance > 0 ? "Above" : "Below";
              const statusColor = Math.abs(t.variance) <= 5 ? "bg-primary/10 text-primary" : t.variance > 0 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive";
              const compareValue = compareMode === "cost" ? t.yourCost : t.yourSell;

              // Count visible columns for expanded row colspan
              let colCount = 5; // expand + trade + benchmark + variance + status
              if (showCost) colCount++;
              if (showSell) colCount++;
              colCount++; // range

              return (
                <tbody key={t.trade}>
                  <tr
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setExpandedTrade(isExpanded ? null : t.trade)}
                  >
                    <td className="px-3 py-3 text-center">
                      <ChevronDown size={14} className={`text-muted-foreground transition-transform inline-block ${isExpanded ? "rotate-180" : ""}`} />
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{t.trade}</td>
                    {showCost && (
                      <td className="px-4 py-3 text-right text-muted-foreground tabular-nums font-mono text-xs">{fmt(t.yourCost)}</td>
                    )}
                    {showSell && (
                      <td className="px-4 py-3 text-right font-semibold text-foreground tabular-nums font-mono text-xs">{fmt(t.yourSell)}</td>
                    )}
                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums font-mono text-xs">{fmt(t.benchmark)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 justify-end">
                        {t.variance > 0 ? <TrendingUp size={12} className="text-warning" /> : t.variance < 0 ? <TrendingDown size={12} className="text-destructive" /> : <Minus size={12} className="text-muted-foreground" />}
                        <span className={`tabular-nums font-mono text-xs ${t.variance > 5 ? "text-warning" : t.variance < -5 ? "text-destructive" : "text-muted-foreground"}`}>
                          {t.variance > 0 ? "+" : ""}{t.variance}%
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <BenchmarkRangeBar
                        low={t.benchmarkLow}
                        high={t.benchmarkHigh}
                        value={compareValue}
                        benchmark={t.benchmark}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${statusColor}`}>{statusLabel}</span>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-border bg-muted/10">
                      <td colSpan={colCount} className="px-6 py-5">
                        <div className="grid md:grid-cols-3 gap-5 text-xs">
                          <div className="space-y-2.5">
                            <div className="flex justify-between"><span className="text-muted-foreground">Comparable Projects</span><span className="text-foreground font-medium">{t.comparableCount.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Benchmark Range</span><span className="text-foreground font-medium">{t.benchmarkRange}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Builder Cost</span><span className="text-foreground font-medium">{fmt(t.yourCost)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Client Price</span><span className="text-foreground font-semibold">{fmt(t.yourSell)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Markup</span><span className="text-foreground font-medium">{((t.yourSell - t.yourCost) / t.yourCost * 100).toFixed(1)}%</span></div>
                          </div>
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Primary Driver</span>
                              <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-medium ${
                                t.primaryDriver === "scope" ? "bg-destructive/10 text-destructive" :
                                t.primaryDriver === "markup" || t.primaryDriver === "fee" ? "bg-warning/10 text-warning" :
                                "bg-muted text-muted-foreground"
                              }`}>{driverLabels[t.primaryDriver]}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pricing Note</span>
                              <p className="text-foreground mt-0.5">{t.pricingNote}</p>
                            </div>
                            <div className="pt-1.5 border-t border-border">
                              <span className="text-muted-foreground">Insight</span>
                              <p className="text-foreground mt-0.5 leading-relaxed">{t.insight}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                              <p className="text-muted-foreground mb-1">Recommended Action</p>
                              <p className="text-foreground font-medium">{t.suggestedAction}</p>
                            </div>
                            {!isUploadSource && (
                              <div className="flex gap-2 pt-1">
                                <Button variant="outline" size="sm" className="text-xs h-7 rounded-lg">
                                  <ArrowRight size={10} className="mr-1" />Pricing & Margin
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs h-7 rounded-lg">
                                  <ArrowRight size={10} className="mr-1" />Estimate Builder
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/30">
              <td />
              <td className="px-4 py-3 text-xs font-semibold text-foreground">Totals</td>
              {showCost && (
                <td className="px-4 py-3 text-right text-xs font-semibold text-foreground tabular-nums font-mono">{fmt(totalCost)}</td>
              )}
              {showSell && (
                <td className="px-4 py-3 text-right text-xs font-semibold text-foreground tabular-nums font-mono">{fmt(totalSell)}</td>
              )}
              <td className="px-4 py-3 text-right text-xs font-semibold text-foreground tabular-nums font-mono">{fmt(totalBench)}</td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
