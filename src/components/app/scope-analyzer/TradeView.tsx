import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Send, Plus, ChevronDown, ChevronRight, Box, Ruler } from "lucide-react";
import { useState } from "react";
import type { Trade } from "@/data/scopeAnalyzerData";
import { getTradeStats, getAssemblyStats } from "@/data/scopeAnalyzerData";
import { LineItemTable } from "./LineItemTable";
import type { TreeSelection } from "./ScopeHierarchyTree";

interface Props {
  trade: Trade;
  parentScopeName: string;
  onNavigate: (sel: TreeSelection) => void;
}

export function TradeView({ trade, parentScopeName, onNavigate }: Props) {
  const ts = getTradeStats(trade);
  const [expandedAsm, setExpandedAsm] = useState<Set<string>>(new Set(trade.assemblies.map(a => a.id)));

  const toggleAsm = (id: string) => setExpandedAsm(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border px-4 py-3 z-10">
        <div className="text-[10px] text-muted-foreground mb-1">{parentScopeName}</div>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{trade.name}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1"><Send className="h-3 w-3" /> Send to Bid Package</Button>
            <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1"><Send className="h-3 w-3" /> Send to Estimate</Button>
          </div>
        </div>
        <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
          <span>{ts.assemblies} assemblies</span>
          <span>{ts.lineItems} line items</span>
          <span>{ts.reviewedPct}% reviewed</span>
          {ts.missingTakeoffs > 0 && <span className="text-warning">{ts.missingTakeoffs} missing takeoffs</span>}
          {ts.missingCostCodes > 0 && <span className="text-destructive">{ts.missingCostCodes} missing codes</span>}
        </div>
        <Progress value={ts.reviewedPct} className="h-1 mt-2" />
      </div>

      {/* Assemblies */}
      <div className="p-4 space-y-3">
        {trade.assemblies.map(asm => {
          const as = getAssemblyStats(asm);
          const isExp = expandedAsm.has(asm.id);
          return (
            <div key={asm.id} className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-muted/20 cursor-pointer hover:bg-muted/40"
                onClick={() => toggleAsm(asm.id)}>
                <div className="flex items-center gap-2">
                  {isExp ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  <Box className="h-3.5 w-3.5 text-primary/60" />
                  <span className="text-sm font-medium">{asm.name}</span>
                  <span className="text-[10px] text-muted-foreground">{as.lineItems} items · {as.reviewedPct}% reviewed</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={e => { e.stopPropagation(); }}><Plus className="h-3 w-3" /> Takeoff</Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={e => { e.stopPropagation(); }}><Send className="h-3 w-3" /> Bid Pkg</Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={e => { e.stopPropagation(); }}><Send className="h-3 w-3" /> Estimate</Button>
                </div>
              </div>
              {isExp && (
                <div className="p-3">
                  <LineItemTable lineItems={asm.lineItems} onSelectItem={onNavigate} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
