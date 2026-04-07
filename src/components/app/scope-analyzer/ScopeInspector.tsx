import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Send, FileText, Ruler, AlertTriangle, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LineItem, Assembly, Trade, ParentScope, ScopeProject } from "@/data/scopeAnalyzerData";
import type { TreeSelection } from "./ScopeHierarchyTree";
import { PlanViewerCompact } from "./PlanViewer";

interface Props {
  project: ScopeProject;
  selection: TreeSelection;
  onExpandPlan: () => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function ScopeInspector({ project, selection, onExpandPlan, currentPage, onPageChange }: Props) {
  const [assistantInput, setAssistantInput] = useState("");
  const context = findContext(project, selection);

  return (
    <div className="flex flex-col h-full border-l border-border bg-card">
      {/* Plan Viewer compact — always at top */}
      <PlanViewerCompact onExpand={onExpandPlan} currentPage={currentPage} onPageChange={onPageChange} />

      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground">Inspector</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selection.type === "lineItem" && context.lineItem && (
          <LineItemInspector li={context.lineItem} parentScope={context.parentScopeName} trade={context.tradeName} assembly={context.assemblyName} />
        )}
        {selection.type === "assembly" && context.assembly && (
          <AssemblyInspector asm={context.assembly} parentScope={context.parentScopeName} trade={context.tradeName} />
        )}
        {selection.type === "trade" && context.trade && (
          <TradeInspector trade={context.trade} parentScope={context.parentScopeName} />
        )}
        {selection.type === "parentScope" && context.parentScope && (
          <ParentScopeInspector ps={context.parentScope} />
        )}
        {selection.type === "project" && (
          <div className="p-3 text-xs text-muted-foreground">Select a scope item from the hierarchy to inspect details.</div>
        )}

        <Separator className="my-2" />

        <div className="px-3 py-2">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Suggested Actions</h4>
          <div className="space-y-1">
            <ActionButton icon={<Send className="h-3 w-3" />} label="Send to Bid Package" />
            <ActionButton icon={<Send className="h-3 w-3" />} label="Send to Estimate" />
            <ActionButton icon={<Ruler className="h-3 w-3" />} label="Add Takeoff" />
            <ActionButton icon={<FileText className="h-3 w-3" />} label="Add Source" />
          </div>
        </div>

        <Separator className="my-2" />

        <div className="px-3 py-2">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" /> Euclid Assistant
          </h4>
          <div className="space-y-2">
            <ContextChip label="What's missing in this scope?" />
            <ContextChip label="Which items need cost codes?" />
            <ContextChip label="Which items are ready for estimate?" />
          </div>
          <div className="relative mt-2">
            <Input placeholder="Ask Euclid…" value={assistantInput} onChange={e => setAssistantInput(e.target.value)}
              className="h-8 text-xs pr-8" />
            <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-8 w-8">
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LineItemInspector({ li, parentScope, trade, assembly }: { li: LineItem; parentScope: string; trade: string; assembly: string }) {
  const confColor = li.confidence === "High" ? "text-success" : li.confidence === "Medium" ? "text-warning" : "text-destructive";
  return (
    <div className="p-3 space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-foreground">{li.name}</h4>
        <div className="text-[10px] text-muted-foreground mt-1">{parentScope} → {trade} → {assembly}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <DetailField label="Quantity" value={`${li.quantity} ${li.unit}`} />
        <DetailField label="Confidence" value={li.confidence} className={confColor} />
        <DetailField label="Review Status" value={li.reviewStatus} />
        <DetailField label="Euclid Category" value={li.euclidCategory} />
        <DetailField label="Company Code" value={li.companyCostCode || "Missing"} className={!li.companyCostCode ? "text-destructive" : ""} />
        <DetailField label="CSI Division" value={li.csiDivision || "Not mapped"} />
      </div>
      {li.sources.length > 0 && (
        <div>
          <h5 className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Sources ({li.sources.length})</h5>
          {li.sources.map(s => (
            <div key={s.id} className="flex items-center gap-2 text-[10px] py-1 px-2 rounded bg-muted/30 mb-1">
              <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="truncate">{s.fileName}</span>
              <span className="text-muted-foreground shrink-0">p.{s.pageNumber}</span>
              {s.sheetName && <Badge variant="outline" className="text-[8px] py-0 px-1">{s.sheetName}</Badge>}
            </div>
          ))}
        </div>
      )}
      {li.takeoffs.length > 0 && (
        <div>
          <h5 className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Takeoffs ({li.takeoffs.length})</h5>
          {li.takeoffs.map(tk => (
            <div key={tk.id} className="flex items-center gap-2 text-[10px] py-1 px-2 rounded bg-muted/30 mb-1">
              <Ruler className="h-3 w-3 text-muted-foreground shrink-0" />
              <span>{tk.quantity} {tk.unit}</span>
              <span className="text-muted-foreground">{tk.method}</span>
              <span className="text-muted-foreground">{tk.sourcePage}</span>
            </div>
          ))}
        </div>
      )}
      {li.issues.length > 0 && (
        <div>
          <h5 className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Issues</h5>
          {li.issues.map((issue, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] py-1 px-2 rounded bg-destructive/5 border border-destructive/10 mb-1">
              <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
              <span className="text-destructive">{issue}</span>
            </div>
          ))}
        </div>
      )}
      {li.notes && (
        <div>
          <h5 className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Notes</h5>
          <p className="text-[10px] text-muted-foreground">{li.notes}</p>
        </div>
      )}
    </div>
  );
}

function AssemblyInspector({ asm, parentScope, trade }: { asm: Assembly; parentScope: string; trade: string }) {
  return (
    <div className="p-3 space-y-2">
      <h4 className="text-sm font-semibold">{asm.name}</h4>
      <div className="text-[10px] text-muted-foreground">{parentScope} → {trade}</div>
      <DetailField label="Line Items" value={asm.lineItems.length.toString()} />
      <DetailField label="Sources" value={asm.sources.length.toString()} />
    </div>
  );
}

function TradeInspector({ trade, parentScope }: { trade: Trade; parentScope: string }) {
  return (
    <div className="p-3 space-y-2">
      <h4 className="text-sm font-semibold">{trade.name}</h4>
      <div className="text-[10px] text-muted-foreground">{parentScope}</div>
      <DetailField label="Assemblies" value={trade.assemblies.length.toString()} />
      <DetailField label="Sources" value={trade.sources.length.toString()} />
    </div>
  );
}

function ParentScopeInspector({ ps }: { ps: ParentScope }) {
  return (
    <div className="p-3 space-y-2">
      <h4 className="text-sm font-semibold">{ps.name}</h4>
      <DetailField label="Trades" value={ps.trades.length.toString()} />
    </div>
  );
}

function DetailField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <div className="text-muted-foreground text-[9px] uppercase tracking-wider">{label}</div>
      <div className={cn("font-medium", className)}>{value}</div>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Button variant="ghost" size="sm" className="w-full justify-start h-7 text-[11px] gap-2 text-muted-foreground hover:text-foreground">
      {icon} {label}
    </Button>
  );
}

function ContextChip({ label }: { label: string }) {
  return (
    <button className="w-full text-left text-[10px] px-2.5 py-1.5 rounded-md border border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
      {label}
    </button>
  );
}

function findContext(project: ScopeProject, selection: TreeSelection) {
  let lineItem: LineItem | undefined;
  let assembly: Assembly | undefined;
  let trade: Trade | undefined;
  let parentScope: ParentScope | undefined;
  let parentScopeName = "";
  let tradeName = "";
  let assemblyName = "";

  for (const ps of project.parentScopes) {
    if (selection.type === "parentScope" && selection.id === ps.id) { parentScope = ps; break; }
    for (const t of ps.trades) {
      if (selection.type === "trade" && selection.id === t.id) { trade = t; parentScope = ps; parentScopeName = ps.name; break; }
      for (const a of t.assemblies) {
        if (selection.type === "assembly" && selection.id === a.id) { assembly = a; trade = t; parentScope = ps; parentScopeName = ps.name; tradeName = t.name; break; }
        for (const li of a.lineItems) {
          if (selection.type === "lineItem" && selection.id === li.id) {
            lineItem = li; assembly = a; trade = t; parentScope = ps;
            parentScopeName = ps.name; tradeName = t.name; assemblyName = a.name;
            break;
          }
        }
        if (lineItem) break;
      }
      if (trade || lineItem) break;
    }
    if (parentScope || trade || lineItem) break;
  }

  return { lineItem, assembly, trade, parentScope, parentScopeName, tradeName, assemblyName };
}
