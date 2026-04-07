import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronRight, Send, CheckCircle2, Eye, Layers } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ParentScope } from "@/data/scopeAnalyzerData";
import { getParentScopeStats, getTradeStats } from "@/data/scopeAnalyzerData";
import { LineItemTable } from "./LineItemTable";
import type { TreeSelection } from "./ScopeHierarchyTree";

interface Props {
  parentScope: ParentScope;
  onNavigate: (sel: TreeSelection) => void;
}

export function ParentScopeView({ parentScope, onNavigate }: Props) {
  const stats = getParentScopeStats(parentScope);
  const [expandedTrades, setExpandedTrades] = useState<Set<string>>(new Set([parentScope.trades[0]?.id]));

  const toggleTrade = (id: string) => {
    setExpandedTrades(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Summary Bar */}
      <div className="sticky top-0 bg-card border-b border-border px-4 py-3 z-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-base font-semibold text-foreground">{parentScope.name}</h2>
            <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
              <span>{stats.trades} trades</span>
              <span>{stats.assemblies} assemblies</span>
              <span>{stats.lineItems} line items</span>
            </div>
          </div>
          <div className="flex gap-3 text-[10px]">
            <span>{stats.reviewedPct}% reviewed</span>
            {stats.missingTakeoffs > 0 && <span className="text-warning">{stats.missingTakeoffs} missing takeoffs</span>}
            {stats.missingCostCodes > 0 && <span className="text-destructive">{stats.missingCostCodes} missing codes</span>}
            {stats.issues > 0 && <span className="text-destructive">{stats.issues} issues</span>}
          </div>
        </div>
        <Progress value={stats.reviewedPct} className="h-1.5" />
      </div>

      {/* Trades */}
      <div className="p-4 space-y-3">
        {parentScope.trades.map(trade => {
          const ts = getTradeStats(trade);
          const isExpanded = expandedTrades.has(trade.id);
          return (
            <div key={trade.id} className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => toggleTrade(trade.id)}>
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                  <Layers className="h-3.5 w-3.5 text-primary/60" />
                  <span className="text-sm font-medium text-foreground">{trade.name}</span>
                  <span className="text-[10px] text-muted-foreground">{ts.assemblies} assemblies · {ts.lineItems} items</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{ts.reviewedPct}%</span>
                  {ts.issues > 0 && <Badge variant="outline" className="text-[9px] border-destructive/30 text-destructive">{ts.issues} issues</Badge>}
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={e => { e.stopPropagation(); onNavigate({ type: "trade", id: trade.id }); }}>
                    <Eye className="h-3 w-3" /> Open
                  </Button>
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 py-3 space-y-3">
                  {trade.assemblies.map(asm => (
                    <div key={asm.id} className="border border-border/50 rounded-md">
                      <div className="flex items-center justify-between px-3 py-2 bg-muted/10">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate({ type: "assembly", id: asm.id })}>
                          <span className="text-xs font-medium text-foreground">{asm.name}</span>
                          <span className="text-[10px] text-muted-foreground">{asm.lineItems.length} items</span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1"><Send className="h-3 w-3" /> Bid Pkg</Button>
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1"><Send className="h-3 w-3" /> Estimate</Button>
                        </div>
                      </div>
                      <div className="px-2 py-1">
                        <LineItemTable lineItems={asm.lineItems} onSelectItem={onNavigate} compact />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
