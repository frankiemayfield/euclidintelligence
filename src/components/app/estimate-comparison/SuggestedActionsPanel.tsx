import { ArrowRight, AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TradeComparison } from "./tradeData";

interface SuggestedActionsPanelProps {
  trades: TradeComparison[];
}

export function SuggestedActionsPanel({ trades }: SuggestedActionsPanelProps) {
  const flagged = trades
    .filter(t => Math.abs(t.variance) > 5)
    .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));

  return (
    <div className="bg-card border border-border rounded-xl shadow-card p-5">
      <h2 className="font-display font-semibold text-foreground mb-1">Suggested Actions</h2>
      <p className="text-xs text-muted-foreground mb-4">Prioritized recommendations based on benchmark analysis</p>
      <div className="space-y-2">
        {flagged.map((t, i) => (
          <div key={t.trade} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
            <span className="text-xs font-semibold text-muted-foreground w-5 pt-0.5">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {t.variance < -5 ? (
                  <TrendingDown size={12} className="text-destructive shrink-0" />
                ) : (
                  <AlertTriangle size={12} className="text-warning shrink-0" />
                )}
                <span className="text-xs font-semibold text-foreground">{t.trade}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  t.variance < -5 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                }`}>
                  {t.variance > 0 ? "+" : ""}{t.variance}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{t.suggestedAction}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-6 px-2 shrink-0">
              <ArrowRight size={10} />
            </Button>
          </div>
        ))}
        {flagged.length === 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 text-primary text-xs">
            <CheckCircle2 size={12} />
            <span>All trades are within market range — no actions needed.</span>
          </div>
        )}
      </div>
    </div>
  );
}
