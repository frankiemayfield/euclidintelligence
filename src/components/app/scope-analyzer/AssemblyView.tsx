import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Send, Plus, FileText, Ruler } from "lucide-react";
import type { Assembly } from "@/data/scopeAnalyzerData";
import { getAssemblyStats } from "@/data/scopeAnalyzerData";
import { LineItemTable } from "./LineItemTable";
import type { TreeSelection } from "./ScopeHierarchyTree";

interface Props {
  assembly: Assembly;
  parentScopeName: string;
  tradeName: string;
  onNavigate: (sel: TreeSelection) => void;
  onAddTakeoff?: () => void;
}

export function AssemblyView({ assembly, parentScopeName, tradeName, onNavigate, onAddTakeoff }: Props) {
  const stats = getAssemblyStats(assembly);

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <div className="mb-1 text-[10px] text-muted-foreground">{parentScopeName} → {tradeName}</div>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{assembly.name}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px]"><Plus className="h-3 w-3" /> Add Line Item</Button>
            <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px]" onClick={onAddTakeoff}><Ruler className="h-3 w-3" /> Add Takeoff</Button>
            <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px]"><Send className="h-3 w-3" /> Bid Package</Button>
            <Button size="sm" className="h-7 gap-1 text-[10px]"><Send className="h-3 w-3" /> Estimate</Button>
          </div>
        </div>
        <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground">
          <span>{stats.lineItems} line items</span>
          <span>{stats.reviewedPct}% reviewed</span>
          <span>{assembly.sources.length} sources</span>
          {stats.missingTakeoffs > 0 ? <span className="text-warning">{stats.missingTakeoffs} missing takeoffs</span> : null}
          {stats.missingCostCodes > 0 ? <span className="text-destructive">{stats.missingCostCodes} missing codes</span> : null}
        </div>
        <Progress value={stats.reviewedPct} className="mt-2 h-1" />
      </div>

      <div className="p-4">
        <LineItemTable lineItems={assembly.lineItems} onSelectItem={onNavigate} />
      </div>
    </div>
  );
}
