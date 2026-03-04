import { ChevronDown, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BenchmarkRangeBar } from "./BenchmarkRangeBar";
import type { TradeComparison } from "./tradeData";
import { fmt } from "./tradeData";

interface TradeComparisonTableProps {
  trades: TradeComparison[];
  compareMode: "sell" | "cost" | "both";
}

const driverLabels: Record<string, string> = {
  labor: "Labor-driven",
  material: "Material-driven",
  scope: "Scope gap",
  markup: "Markup-driven",
  fee: "Fee-driven",
};

export function TradeComparisonTable({ trades, compareMode }: TradeComparisonTableProps) {
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);
  const totalCost = trades.reduce((s, t) => s + t.yourCost, 0);
  const totalSell = trades.reduce((s, t) => s + t.yourSell, 0);
  const totalBench = trades.reduce((s, t) => s + t.benchmark, 0);

  return (
    <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-display font-semibold text-foreground">Trade-Level Benchmark Comparison</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Comparing your estimate against local benchmark by trade</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-8" />
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Trade</th>
              {(compareMode === "cost" || compareMode === "both") && (
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Builder Cost</th>
              )}
              {(compareMode === "sell" || compareMode === "both") && (
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Client Price</th>
              )}
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Benchmark</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground w-20">Variance</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground w-36">Range</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground w-32">Status</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => {
              const isExpanded = expandedTrade === t.trade;
              const statusLabel = Math.abs(t.variance) <= 5 ? "In Range" : t.variance > 0 ? "Above" : "Below";
              const statusColor = Math.abs(t.variance) <= 5 ? "bg-primary/10 text-primary" : t.variance > 0 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive";
              const compareValue = compareMode === "cost" ? t.yourCost : t.yourSell;

              return (
                <tbody key={t.trade}>
                  <tr
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setExpandedTrade(isExpanded ? null : t.trade)}
                  >
                    <td className="pl-3 py-3">
                      <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{t.trade}</td>
                    {(compareMode === "cost" || compareMode === "both") && (
                      <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{fmt(t.yourCost)}</td>
                    )}
                    {(compareMode === "sell" || compareMode === "both") && (
                      <td className="px-4 py-3 text-right font-display font-semibold text-foreground tabular-nums">{fmt(t.yourSell)}</td>
                    )}
                    <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{fmt(t.benchmark)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1">
                        {t.variance > 0 ? <TrendingUp size={12} className="text-warning" /> : t.variance < 0 ? <TrendingDown size={12} className="text-destructive" /> : <Minus size={12} className="text-muted-foreground" />}
                        <span className={`tabular-nums ${t.variance > 5 ? "text-warning" : t.variance < -5 ? "text-destructive" : "text-muted-foreground"}`}>
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
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusColor}`}>{statusLabel}</span>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-border bg-muted/10">
                      <td colSpan={compareMode === "both" ? 8 : 7} className="px-5 py-4">
                        <div className="grid md:grid-cols-3 gap-4 text-xs">
                          <div className="space-y-2">
                            <p className="text-muted-foreground">Comparable Projects <span className="text-foreground font-medium ml-1">{t.comparableCount.toLocaleString()}</span></p>
                            <p className="text-muted-foreground">Benchmark Range <span className="text-foreground font-medium ml-1">{t.benchmarkRange}</span></p>
                            <p className="text-muted-foreground">Builder Cost <span className="text-foreground font-medium ml-1">{fmt(t.yourCost)}</span></p>
                            <p className="text-muted-foreground">Client Price <span className="text-foreground font-medium ml-1">{fmt(t.yourSell)}</span></p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-muted-foreground">Primary Driver <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              t.primaryDriver === "scope" ? "bg-destructive/10 text-destructive" :
                              t.primaryDriver === "markup" || t.primaryDriver === "fee" ? "bg-warning/10 text-warning" :
                              "bg-muted text-muted-foreground"
                            }`}>{driverLabels[t.primaryDriver]}</span></p>
                            <p className="text-muted-foreground">Pricing Note <span className="text-foreground ml-1">{t.pricingNote}</span></p>
                            <div className="pt-1 border-t border-border">
                              <p className="text-muted-foreground">Insight</p>
                              <p className="text-foreground mt-0.5">{t.insight}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                              <p className="text-muted-foreground mb-1">Recommended Action</p>
                              <p className="text-foreground font-medium">{t.suggestedAction}</p>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <Button variant="outline" size="sm" className="text-xs h-6">
                                <ArrowRight size={10} className="mr-1" />Pricing & Margin
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs h-6">
                                <ArrowRight size={10} className="mr-1" />Estimate Builder
                              </Button>
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
          <tfoot>
            <tr className="border-t border-border bg-muted/30">
              <td />
              <td className="px-4 py-3 text-xs font-semibold text-foreground">Totals</td>
              {(compareMode === "cost" || compareMode === "both") && (
                <td className="px-4 py-3 text-right text-xs font-semibold text-foreground tabular-nums">{fmt(totalCost)}</td>
              )}
              {(compareMode === "sell" || compareMode === "both") && (
                <td className="px-4 py-3 text-right text-xs font-semibold text-foreground tabular-nums">{fmt(totalSell)}</td>
              )}
              <td className="px-4 py-3 text-right text-xs font-semibold text-foreground tabular-nums">{fmt(totalBench)}</td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
