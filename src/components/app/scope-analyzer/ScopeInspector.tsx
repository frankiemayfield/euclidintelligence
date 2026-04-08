import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Send, FileText, Ruler, AlertTriangle, Sparkles, ChevronRight, Maximize2, Minimize2, EyeOff, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LineItem, Assembly, Trade, ParentScope, ScopeProject } from "@/data/scopeAnalyzerData";
import type { TreeSelection } from "./ScopeHierarchyTree";
import type { ViewerMode } from "./PlanViewer";

interface Props {
  project: ScopeProject;
  selection: TreeSelection;
  onExpandPlan: () => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  viewerMode: ViewerMode;
  onViewerModeChange: (mode: ViewerMode) => void;
}

export function ScopeInspector({ project, selection, onExpandPlan, currentPage, onPageChange, viewerMode, onViewerModeChange }: Props) {
  const [assistantInput, setAssistantInput] = useState("");
  const context = findContext(project, selection);

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <h3 className="text-xs font-semibold text-foreground">Inspector</h3>
        <div className="flex items-center gap-0.5">
          {viewerMode === "hidden" ? (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onViewerModeChange("embedded")} title="Show viewer">
              <Eye className="h-3 w-3" />
            </Button>
          ) : viewerMode === "embedded" ? (
            <>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onViewerModeChange("expanded")} title="Expand viewer">
                <Maximize2 className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onViewerModeChange("hidden")} title="Hide viewer">
                <EyeOff className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onViewerModeChange("embedded")} title="Minimize viewer">
              <Minimize2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selection.type === "lineItem" && context.lineItem ? (
          <LineItemInspector
            assembly={context.assemblyName}
            li={context.lineItem}
            onExpandPlan={onExpandPlan}
            onOpenSourcePage={onPageChange}
            parentScope={context.parentScopeName}
            trade={context.tradeName}
          />
        ) : null}
        {selection.type === "assembly" && context.assembly ? <AssemblyInspector asm={context.assembly} parentScope={context.parentScopeName} trade={context.tradeName} /> : null}
        {selection.type === "trade" && context.trade ? <TradeInspector parentScope={context.parentScopeName} trade={context.trade} /> : null}
        {selection.type === "parentScope" && context.parentScope ? <ParentScopeInspector ps={context.parentScope} /> : null}
        {selection.type === "project" ? <div className="p-3 text-xs text-muted-foreground">Select a scope item from the hierarchy to inspect details.</div> : null}

        <Separator className="my-2" />

        <div className="px-3 py-2">
          <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Suggested Actions</h4>
          <div className="space-y-1">
            <ActionButton icon={<Send className="h-3 w-3" />} label="Send to Bid Package" />
            <ActionButton icon={<Send className="h-3 w-3" />} label="Send to Estimate" />
            <ActionButton icon={<Ruler className="h-3 w-3" />} label="Open Takeoff Tools" onClick={onExpandPlan} />
            <ActionButton icon={<FileText className="h-3 w-3" />} label="Add Source" />
          </div>
        </div>

        <Separator className="my-2" />

        <div className="px-3 py-2">
          <h4 className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> Euclid Assistant
          </h4>
          <div className="space-y-2">
            <ContextChip label="What's missing in this scope?" />
            <ContextChip label="Which items need cost codes?" />
            <ContextChip label="Which items are ready for estimate?" />
          </div>
          <div className="relative mt-2">
            <Input className="h-8 pr-8 text-xs" placeholder="Ask Euclid…" value={assistantInput} onChange={event => setAssistantInput(event.target.value)} />
            <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-8 w-8">
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LineItemInspector({
  assembly,
  li,
  onExpandPlan,
  onOpenSourcePage,
  parentScope,
  trade,
}: {
  assembly: string;
  li: LineItem;
  onExpandPlan: () => void;
  onOpenSourcePage: (page: number) => void;
  parentScope: string;
  trade: string;
}) {
  const confColor = li.confidence === "High" ? "text-success" : li.confidence === "Medium" ? "text-warning" : "text-destructive";

  return (
    <div className="space-y-3 p-3">
      <div>
        <h4 className="text-sm font-semibold text-foreground">{li.name}</h4>
        <div className="mt-1 text-[10px] text-muted-foreground">{parentScope} → {trade} → {assembly}</div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <DetailField label="Quantity" value={`${li.quantity} ${li.unit}`} />
        <DetailField label="Confidence" value={li.confidence} className={confColor} />
        <DetailField label="Review Status" value={li.reviewStatus} />
        <DetailField label="Euclid Category" value={li.euclidCategory} />
        <DetailField label="Company Code" value={li.companyCostCode || "Missing"} className={!li.companyCostCode ? "text-destructive" : ""} />
        <DetailField label="CSI Division" value={li.csiDivision || "Not mapped"} />
      </div>

      {li.sources.length > 0 ? (
        <div>
          <h5 className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Sources ({li.sources.length})</h5>
          {li.sources.map(source => (
            <button
              key={source.id}
              type="button"
              className="mb-1 flex w-full items-center gap-2 rounded bg-muted/30 px-2 py-1 text-[10px] transition-colors hover:bg-muted"
              onClick={() => {
                onOpenSourcePage(source.pageNumber);
                onExpandPlan();
              }}
            >
              <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="truncate">{source.fileName}</span>
              <span className="shrink-0 text-muted-foreground">p.{source.pageNumber}</span>
              {source.sheetName ? <Badge variant="outline" className="px-1 py-0 text-[8px]">{source.sheetName}</Badge> : null}
            </button>
          ))}
        </div>
      ) : null}

      {li.takeoffs.length > 0 ? (
        <div>
          <h5 className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Takeoffs ({li.takeoffs.length})</h5>
          {li.takeoffs.map(takeoff => (
            <div key={takeoff.id} className="mb-1 flex items-center gap-2 rounded bg-muted/30 px-2 py-1 text-[10px]">
              <Ruler className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span>{takeoff.quantity} {takeoff.unit}</span>
              <span className="text-muted-foreground">{takeoff.method}</span>
              <span className="text-muted-foreground">{takeoff.sourcePage}</span>
            </div>
          ))}
        </div>
      ) : null}

      {li.issues.length > 0 ? (
        <div>
          <h5 className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Issues</h5>
          {li.issues.map((issue, index) => (
            <div key={index} className="mb-1 flex items-center gap-2 rounded border border-destructive/10 bg-destructive/5 px-2 py-1 text-[10px]">
              <AlertTriangle className="h-3 w-3 shrink-0 text-destructive" />
              <span className="text-destructive">{issue}</span>
            </div>
          ))}
        </div>
      ) : null}

      {li.notes ? (
        <div>
          <h5 className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Notes</h5>
          <p className="text-[10px] text-muted-foreground">{li.notes}</p>
        </div>
      ) : null}
    </div>
  );
}

function AssemblyInspector({ asm, parentScope, trade }: { asm: Assembly; parentScope: string; trade: string }) {
  return (
    <div className="space-y-2 p-3">
      <h4 className="text-sm font-semibold">{asm.name}</h4>
      <div className="text-[10px] text-muted-foreground">{parentScope} → {trade}</div>
      <DetailField label="Line Items" value={asm.lineItems.length.toString()} />
      <DetailField label="Sources" value={asm.sources.length.toString()} />
    </div>
  );
}

function TradeInspector({ trade, parentScope }: { trade: Trade; parentScope: string }) {
  return (
    <div className="space-y-2 p-3">
      <h4 className="text-sm font-semibold">{trade.name}</h4>
      <div className="text-[10px] text-muted-foreground">{parentScope}</div>
      <DetailField label="Assemblies" value={trade.assemblies.length.toString()} />
      <DetailField label="Sources" value={trade.sources.length.toString()} />
    </div>
  );
}

function ParentScopeInspector({ ps }: { ps: ParentScope }) {
  return (
    <div className="space-y-2 p-3">
      <h4 className="text-sm font-semibold">{ps.name}</h4>
      <DetailField label="Trades" value={ps.trades.length.toString()} />
    </div>
  );
}

function DetailField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("font-medium", className)}>{value}</div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Button variant="ghost" size="sm" className="h-7 w-full justify-start gap-2 text-[11px] text-muted-foreground hover:text-foreground" onClick={onClick}>
      {icon} {label}
    </Button>
  );
}

function ContextChip({ label }: { label: string }) {
  return (
    <button className="w-full rounded-md border border-border px-2.5 py-1.5 text-left text-[10px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
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
    if (selection.type === "parentScope" && selection.id === ps.id) {
      parentScope = ps;
      break;
    }
    for (const t of ps.trades) {
      if (selection.type === "trade" && selection.id === t.id) {
        trade = t;
        parentScope = ps;
        parentScopeName = ps.name;
        break;
      }
      for (const a of t.assemblies) {
        if (selection.type === "assembly" && selection.id === a.id) {
          assembly = a;
          trade = t;
          parentScope = ps;
          parentScopeName = ps.name;
          tradeName = t.name;
          break;
        }
        for (const li of a.lineItems) {
          if (selection.type === "lineItem" && selection.id === li.id) {
            lineItem = li;
            assembly = a;
            trade = t;
            parentScope = ps;
            parentScopeName = ps.name;
            tradeName = t.name;
            assemblyName = a.name;
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
