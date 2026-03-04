import { ChevronDown, Send, Star, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubBid, formatCurrency, statusColors } from "./bidLevelingData";
import { BidDetailPanel } from "./BidDetailPanel";

interface BidComparisonTableProps {
  items: SubBid[];
  expandedSub: string | null;
  onToggleExpand: (sub: string) => void;
}

export function BidComparisonTable({ items, expandedSub, onToggleExpand }: BidComparisonTableProps) {
  const avgLeveled = items.length ? Math.round(items.reduce((s, b) => s + b.leveledTotal, 0) / items.length) : 0;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-[32px]" />
            <col className="w-[18%]" />
            <col className="w-[11%]" />
            <col className="w-[10%]" />
            <col className="w-[11%]" />
            <col className="w-[9%]" />
            <col className="w-[7%]" />
            <col className="w-[7%]" />
            <col className="w-[10%]" />
            <col className="w-[17%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-8" />
              <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Subcontractor</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground">Raw Bid</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground">Add-Backs</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground">Leveled Total</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground">Coverage</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground">Missing</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground">Clarify</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-right px-3 py-3 text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => {
              const isExpanded = expandedSub === b.sub;
              const diff = b.leveledTotal - avgLeveled;
              const lowestLeveled = Math.min(...items.map(i => i.leveledTotal));
              const isLowest = b.leveledTotal === lowestLeveled;

              return (
                <>
                  <tr
                    key={b.sub}
                    className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer ${b.selected ? "bg-primary/[0.03]" : ""}`}
                    onClick={() => onToggleExpand(b.sub)}
                  >
                    <td className="pl-3 py-3">
                      <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{b.sub}</span>
                        {b.selected && <Star size={12} className="text-primary fill-primary" />}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-display font-semibold text-muted-foreground">
                      {formatCurrency(b.rawTotal)}
                    </td>
                    <td className="px-3 py-3 text-right font-display font-semibold">
                      {b.addBacks > 0 ? (
                        <span className="text-warning">+{formatCurrency(b.addBacks)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right font-display font-bold text-foreground">
                      <div className="flex items-center justify-end gap-1.5">
                        {formatCurrency(b.leveledTotal)}
                        {isLowest && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">Lowest</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-xs font-semibold ${b.packageCoverage >= 90 ? "text-primary" : b.packageCoverage >= 70 ? "text-warning" : "text-destructive"}`}>
                        {b.packageCoverage}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {b.missingScopeCount > 0 ? (
                        <span className="text-xs font-medium text-destructive">{b.missingScopeCount}</span>
                      ) : (
                        <CheckCircle size={13} className="text-primary mx-auto" />
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {b.clarifications.filter(c => !c.resolved).length > 0 ? (
                        <span className="text-xs font-medium text-warning">{b.clarifications.filter(c => !c.resolved).length}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusColors[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.recommended && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                            Recommended
                          </span>
                        )}
                        {b.selected && !b.recommended && (
                          <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">
                            Selected
                          </span>
                        )}
                        {b.status !== "Sent to Estimate" && (
                          <Button size="sm" variant="outline" className="text-[11px] h-6 px-2 rounded-lg" onClick={(e) => e.stopPropagation()}>
                            <Send size={10} className="mr-1" /> Send to Estimate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${b.sub}-detail`} className="border-b border-border bg-muted/5">
                      <td colSpan={10} className="p-0">
                        <BidDetailPanel bid={b} />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
