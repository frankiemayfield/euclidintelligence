import { ChevronDown, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { Fragment, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { BenchmarkRangeBar } from "./BenchmarkRangeBar";
import type { TradeComparison } from "./tradeData";
import { fmt } from "./tradeData";
import { cn } from "@/lib/utils";

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

const TRADE_GRID_COLS = "220px 140px 140px 120px 120px 120px";

export function TradeComparisonTable({ trades, compareMode, isUploadSource = false }: TradeComparisonTableProps) {
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);

  const totalCost = trades.reduce((s, t) => s + t.yourCost, 0);
  const totalSell = trades.reduce((s, t) => s + t.yourSell, 0);
  const totalBench = trades.reduce((s, t) => s + t.benchmark, 0);

  const compareValueFor = (trade: TradeComparison) => (compareMode === "cost" ? trade.yourCost : trade.yourSell);
  const compareLabel = compareMode === "cost" ? "Builder Cost" : "Client Price";
  const compareTotal = compareMode === "cost" ? totalCost : totalSell;
  const totalVariance = totalBench > 0 ? ((compareTotal - totalBench) / totalBench) * 100 : 0;

  const gridVars: CSSProperties = {
    ["--tradeGridCols" as string]: TRADE_GRID_COLS,
  };

  const headerCellClass = "px-4 py-3 text-xs font-medium text-muted-foreground leading-5";
  const baseCellClass = "px-4 py-3 leading-5";
  const numericCellClass = "px-4 py-3 text-right leading-5 text-xs tabular-nums whitespace-nowrap [font-variant-numeric:tabular-nums]";

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-display font-semibold text-foreground">Trade-Level Benchmark Comparison</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Comparing your estimate against local benchmark by trade</p>
      </div>

      <div className="overflow-x-auto">
        <div
          style={gridVars}
          className="min-w-[860px] [&_*]:box-border"
        >
          <div className="grid [grid-template-columns:var(--tradeGridCols)] items-center bg-muted/30 border-b border-border">
            <div className={cn(headerCellClass, "text-left")}>Trade</div>
            <div className={cn(headerCellClass, "text-right")}>{compareLabel}</div>
            <div className={cn(headerCellClass, "text-right")}>Benchmark</div>
            <div className={cn(headerCellClass, "text-right")}>Variance</div>
            <div className={cn(headerCellClass, "text-center")}>Range</div>
            <div className={cn(headerCellClass, "text-center")}>Status</div>
          </div>

          <div>
            {trades.map((t) => {
              const isExpanded = expandedTrade === t.trade;
              const statusLabel = Math.abs(t.variance) <= 5 ? "In Range" : t.variance > 0 ? "Above" : "Below";
              const statusColor =
                Math.abs(t.variance) <= 5
                  ? "bg-primary/10 text-primary"
                  : t.variance > 0
                    ? "bg-warning/10 text-warning"
                    : "bg-destructive/10 text-destructive";
              const compareValue = compareValueFor(t);

              return (
                <Fragment key={t.trade}>
                  <div
                    className={cn(
                      "grid [grid-template-columns:var(--tradeGridCols)] items-center cursor-pointer transition-colors hover:bg-muted/20",
                      !isExpanded && "border-b border-border",
                    )}
                    onClick={() => setExpandedTrade(isExpanded ? null : t.trade)}
                  >
                    <div className={cn(baseCellClass, "font-medium text-foreground min-w-0 flex items-center gap-2")}>
                      <ChevronDown
                        size={14}
                        className={cn("text-muted-foreground transition-transform shrink-0", isExpanded && "rotate-180")}
                      />
                      <span className="truncate">{t.trade}</span>
                    </div>

                    <div className={cn(numericCellClass, compareMode !== "cost" && "font-semibold text-foreground", compareMode === "cost" && "text-muted-foreground")}>{fmt(compareValue)}</div>
                    <div className={cn(numericCellClass, "text-muted-foreground")}>{fmt(t.benchmark)}</div>

                    <div className={numericCellClass}>
                      <div className="flex justify-end items-center gap-2 whitespace-nowrap">
                        {t.variance > 0 ? (
                          <TrendingUp size={12} className="text-warning" />
                        ) : t.variance < 0 ? (
                          <TrendingDown size={12} className="text-destructive" />
                        ) : (
                          <Minus size={12} className="text-muted-foreground" />
                        )}
                        <span className={cn("text-xs", t.variance > 5 ? "text-warning" : t.variance < -5 ? "text-destructive" : "text-muted-foreground")}>
                          {t.variance > 0 ? "+" : ""}
                          {t.variance}%
                        </span>
                      </div>
                    </div>

                    <div className={cn(baseCellClass, "flex justify-center")}>
                      <div className="w-full max-w-[120px]">
                        <BenchmarkRangeBar
                          low={t.benchmarkLow}
                          high={t.benchmarkHigh}
                          value={compareValue}
                          benchmark={t.benchmark}
                        />
                      </div>
                    </div>

                    <div className={cn(baseCellClass, "text-center")}>
                      <span className={cn("text-[11px] px-2.5 py-1 rounded-full font-medium whitespace-nowrap", statusColor)}>{statusLabel}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="w-full border-b border-border bg-muted/10 px-6 py-5">
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
                            <span
                              className={cn(
                                "px-1.5 py-0.5 rounded-lg text-[10px] font-medium",
                                t.primaryDriver === "scope"
                                  ? "bg-destructive/10 text-destructive"
                                  : t.primaryDriver === "markup" || t.primaryDriver === "fee"
                                    ? "bg-warning/10 text-warning"
                                    : "bg-muted text-muted-foreground",
                              )}
                            >
                              {driverLabels[t.primaryDriver]}
                            </span>
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
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>

          <div className="grid [grid-template-columns:var(--tradeGridCols)] items-center bg-muted/30 border-t-2 border-border">
            <div className={cn(baseCellClass, "text-xs font-semibold text-foreground")}>Totals</div>
            <div className={cn(numericCellClass, "text-xs font-semibold text-foreground")}>{fmt(compareTotal)}</div>
            <div className={cn(numericCellClass, "text-xs font-semibold text-foreground")}>{fmt(totalBench)}</div>
            <div className={cn(numericCellClass, "text-xs font-semibold", totalVariance > 5 ? "text-warning" : totalVariance < -5 ? "text-destructive" : "text-foreground")}>{totalVariance > 0 ? "+" : ""}{totalVariance.toFixed(1)}%</div>
            <div className={cn(baseCellClass, "text-center text-xs text-muted-foreground")}>—</div>
            <div className={cn(baseCellClass, "text-center")}> </div>
          </div>
        </div>
      </div>
    </div>
  );
}
