import { ChevronDown, Send, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubBid, formatCurrency, statusColors } from "./bidLevelingData";
import { BidDetailPanel } from "./BidDetailPanel";

interface BidComparisonTableProps {
  items: SubBid[];
  expandedSub: string | null;
  onToggleExpand: (sub: string) => void;
}

// Filter out non-lifecycle statuses for display
const lifecycleStatuses = new Set([
"Draft Scope", "Sent to Sub", "Awaiting Bid", "Bid Received",
"Needs Clarification", "Ready to Compare", "Sent to Estimate"]
);

function getLevelingState(b: SubBid): {label: string;className: string;} {
  const unresolvedExclusions = b.exclusions.filter((e) => e.disposition === "unresolved").length;
  const unresolvedClarifications = b.clarifications.filter((c) => !c.resolved).length;
  if (unresolvedExclusions === 0 && unresolvedClarifications === 0) {
    return { label: "Leveling Complete", className: "bg-primary/10 text-primary" };
  }
  if (unresolvedClarifications > 0) {
    return { label: "Awaiting Clarification", className: "bg-warning/10 text-warning" };
  }
  return { label: "Needs Carry Decisions", className: "bg-destructive/10 text-destructive" };
}

export function BidComparisonTable({ items, expandedSub, onToggleExpand }: BidComparisonTableProps) {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-[32px]" />
            <col className="w-[22%]" />
            <col className="w-[11%]" />
            <col className="w-[10%]" />
            <col className="w-[11%]" />
            <col className="w-[9%]" />
            <col className="w-[7%]" />
            <col className="w-[7%]" />
            <col className="w-[10%]" />
            <col className="w-[13%]" />
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
              const levelingState = getLevelingState(b);
              // Determine display status — use lifecycle status only, not "Selected"
              const displayStatus = b.status === "Selected" ? "Bid Received" : b.status;

              return (
                <>
                  <tr
                    key={b.sub}
                    className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer ${b.selected ? "bg-primary/[0.03]" : ""}`}
                    onClick={() => onToggleExpand(b.sub)}>
                    
                    <td className="pl-3 py-3">
                      <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{b.sub}</span>
                        {b.recommended &&
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                            Recommended
                          </span>
                        }
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-display font-semibold text-muted-foreground">
                      {formatCurrency(b.rawTotal)}
                    </td>
                    <td className="px-3 py-3 text-right font-display font-semibold">
                      {b.addBacks > 0 ?
                      <span className="text-warning">+{formatCurrency(b.addBacks)}</span> :

                      <span className="text-muted-foreground">—</span>
                      }
                    </td>
                    <td className="px-3 py-3 text-right font-display font-bold text-foreground">
                      {formatCurrency(b.leveledTotal)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-xs font-semibold ${b.packageCoverage >= 90 ? "text-primary" : b.packageCoverage >= 70 ? "text-warning" : "text-destructive"}`}>
                        {b.packageCoverage}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {b.missingScopeCount > 0 ?
                      <span className="text-xs font-medium text-destructive">{b.missingScopeCount}</span> :

                      <CheckCircle size={13} className="text-primary mx-auto" />
                      }
                    </td>
                    <td className="px-3 py-3 text-center">
                      {b.clarifications.filter((c) => !c.resolved).length > 0 ?
                      <span className="text-xs font-medium text-warning">{b.clarifications.filter((c) => !c.resolved).length}</span> :

                      <span className="text-xs text-muted-foreground">—</span>
                      }
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusColors[displayStatus as keyof typeof statusColors] || statusColors[b.status]}`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status !== "Sent to Estimate" &&
                        <Button size="sm" variant="outline" className="text-[11px] h-6 px-2 rounded-lg" onClick={(e) => e.stopPropagation()}>
                            <Send size={10} className="mr-1" /> Send to Estimate
                          </Button>
                        }
                        {b.status === "Sent to Estimate" &&
                        <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                            Sent to Estimate
                          </span>
                        }
                      </div>
                    </td>
                  </tr>
                  {isExpanded &&
                  <tr key={`${b.sub}-detail`}>
                      <td colSpan={10} className="p-0 border-b border-border">
                        <div className="border-l-2 border-primary/30 bg-muted/5">
                          <BidDetailPanel bid={b} levelingState={levelingState} />
                        </div>
                      </td>
                    </tr>
                  }
                </>);

            })}
          </tbody>
        </table>
      </div>
    </div>);

}