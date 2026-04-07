import { AppLayout } from "@/components/app/AppLayout";
import {
  AlertTriangle, CheckCircle, FileSearch, Info, XCircle, ChevronDown, ChevronRight, ChevronLeft,
  Pencil, Flag, Send, Layers, GitMerge, Split, Copy, Trash2, Settings2,
  Package, ClipboardList, ArrowRight, Filter, Eye, Save, Check, Hammer,
  FileText, Bot, Sparkles, Lock, Play
} from "lucide-react";
import { WorkflowTransition } from "@/components/app/WorkflowTransition";
import { PlanReferenceChip } from "@/components/app/traceability/PlanReferenceChip";
import { ExtractionMethodBadge } from "@/components/app/traceability/ExtractionMethodBadge";
import { ReviewStatusBadge } from "@/components/app/traceability/ReviewStatusBadge";
import { ConfidenceBadge } from "@/components/app/traceability/ConfidenceBadge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Types
type InclusionStatus = "Included" | "Excluded" | "Allowance" | "Option" | "Unclear";
type ReviewStatus = "Auto-Extracted" | "Needs Review" | "Estimator Confirmed" | "Adjusted by User";
type Confidence = "High" | "Medium" | "Low";
type RiskFlag = "Missing" | "Vague" | "Conflict" | "Duplicate" | "None";

interface ScopeRow {
  id: number;
  reviewed: boolean;
  parentScope: string;
  scopeGroup: string;
  scopeItem: string;
  inclusionStatus: InclusionStatus;
  costCode: string;
  source: string;
  confidence: Confidence;
  riskFlag: RiskFlag;
  notes: string;
  qty: number;
  unit: string;
  reviewStatus: ReviewStatus;
}

// Mock scope data
const scopeData: ScopeRow[] = [
  { id: 1, reviewed: true, parentScope: "Concrete", scopeGroup: "Foundations", scopeItem: "Concrete slab — main level", inclusionStatus: "Included", costCode: "03-300", source: "A2.1", confidence: "High", riskFlag: "None", notes: "", qty: 12.8, unit: "CY", reviewStatus: "Estimator Confirmed" },
  { id: 2, reviewed: false, parentScope: "Concrete", scopeGroup: "Foundations", scopeItem: "Foundation footing — perimeter", inclusionStatus: "Included", costCode: "03-300", source: "S1.1", confidence: "Medium", riskFlag: "Vague", notes: "Depth assumed 18\" — verify with structural", qty: 8.4, unit: "CY", reviewStatus: "Needs Review" },
  { id: 3, reviewed: true, parentScope: "Roofing", scopeGroup: "Roof Systems", scopeItem: "Roof shingles — architectural", inclusionStatus: "Included", costCode: "07-310", source: "A4.1", confidence: "High", riskFlag: "None", notes: "", qty: 14.2, unit: "SQ", reviewStatus: "Estimator Confirmed" },
  { id: 4, reviewed: false, parentScope: "Framing", scopeGroup: "Structural", scopeItem: "2×4 wall framing — exterior", inclusionStatus: "Included", costCode: "06-100", source: "A1.1", confidence: "Medium", riskFlag: "None", notes: "Wall height assumed 10 ft from section", qty: 1420, unit: "LF", reviewStatus: "Needs Review" },
  { id: 5, reviewed: false, parentScope: "Drywall", scopeGroup: "Interior Finishes", scopeItem: "Drywall — interior partitions", inclusionStatus: "Included", costCode: "09-290", source: "A1.1", confidence: "Medium", riskFlag: "Duplicate", notes: "SF may overlap with paint area", qty: 3200, unit: "SF", reviewStatus: "Auto-Extracted" },
  { id: 6, reviewed: true, parentScope: "Finish Carpentry", scopeGroup: "Doors & Hardware", scopeItem: "Interior doors — solid core", inclusionStatus: "Included", costCode: "08-140", source: "A5.1", confidence: "High", riskFlag: "None", notes: "", qty: 12, unit: "EA", reviewStatus: "Estimator Confirmed" },
  { id: 7, reviewed: true, parentScope: "Windows", scopeGroup: "Openings", scopeItem: "Windows — double-hung vinyl", inclusionStatus: "Included", costCode: "08-500", source: "A5.2", confidence: "High", riskFlag: "None", notes: "", qty: 8, unit: "EA", reviewStatus: "Estimator Confirmed" },
  { id: 8, reviewed: false, parentScope: "Finish Carpentry", scopeGroup: "Trim & Millwork", scopeItem: "Base trim — painted MDF", inclusionStatus: "Unclear", costCode: "06-200", source: "A1.1", confidence: "Low", riskFlag: "Vague", notes: "Profile and material assumed", qty: 480, unit: "LF", reviewStatus: "Needs Review" },
  { id: 9, reviewed: false, parentScope: "Masonry", scopeGroup: "Exterior", scopeItem: "Brick veneer — front elevation", inclusionStatus: "Included", costCode: "04-210", source: "A3.1", confidence: "Medium", riskFlag: "None", notes: "", qty: 680, unit: "SF", reviewStatus: "Needs Review" },
  { id: 10, reviewed: true, parentScope: "HVAC", scopeGroup: "Mechanical", scopeItem: "HVAC diffusers — ceiling mount", inclusionStatus: "Included", costCode: "23-370", source: "M1.1", confidence: "High", riskFlag: "None", notes: "", qty: 14, unit: "EA", reviewStatus: "Auto-Extracted" },
  { id: 11, reviewed: false, parentScope: "General Conditions", scopeGroup: "Temporary", scopeItem: "Temporary power & utilities", inclusionStatus: "Allowance", costCode: "01-500", source: "—", confidence: "Low", riskFlag: "Missing", notes: "No explicit temp power on plans", qty: 1, unit: "LS", reviewStatus: "Needs Review" },
  { id: 12, reviewed: false, parentScope: "Painting", scopeGroup: "Interior Finishes", scopeItem: "Interior paint — premium finish", inclusionStatus: "Included", costCode: "09-910", source: "A1.1", confidence: "Medium", riskFlag: "Duplicate", notes: "Area may overlap with drywall SF", qty: 4200, unit: "SF", reviewStatus: "Auto-Extracted" },
  { id: 13, reviewed: false, parentScope: "Electrical", scopeGroup: "Electrical", scopeItem: "Electrical rough-in — addition area", inclusionStatus: "Excluded", costCode: "26-100", source: "E1.1", confidence: "Low", riskFlag: "Missing", notes: "No rough-in line item found for addition", qty: 0, unit: "LS", reviewStatus: "Needs Review" },
  { id: 14, reviewed: false, parentScope: "Concrete", scopeGroup: "Waterproofing", scopeItem: "Below-grade waterproofing", inclusionStatus: "Excluded", costCode: "07-100", source: "S1.1", confidence: "Low", riskFlag: "Missing", notes: "Foundation shows below-grade but no waterproofing spec", qty: 0, unit: "LS", reviewStatus: "Needs Review" },
];

const inclusionColors: Record<InclusionStatus, string> = {
  "Included": "bg-primary/10 text-primary",
  "Excluded": "bg-destructive/10 text-destructive",
  "Allowance": "bg-warning/10 text-warning",
  "Option": "bg-info/10 text-info",
  "Unclear": "bg-muted text-muted-foreground",
};

const riskFlagColors: Record<RiskFlag, string> = {
  "Missing": "bg-destructive/10 text-destructive",
  "Vague": "bg-warning/10 text-warning",
  "Conflict": "bg-destructive/10 text-destructive",
  "Duplicate": "bg-warning/10 text-warning",
  "None": "",
};

// Source files for left panel
const sourceFiles = [
  { name: "Floor Plan — A1.1", type: "Plans", checked: true },
  { name: "Foundation Plan — A2.1", type: "Plans", checked: true },
  { name: "Front Elevation — A3.1", type: "Plans", checked: true },
  { name: "Roof Plan — A4.1", type: "Plans", checked: true },
  { name: "Door Schedule — A5.1", type: "Specs", checked: true },
  { name: "Window Schedule — A5.2", type: "Specs", checked: true },
  { name: "Structural Foundation — S1.1", type: "Plans", checked: true },
  { name: "Mechanical Plan — M1.1", type: "Plans", checked: true },
  { name: "Electrical Plan — E1.1", type: "Plans", checked: false },
  { name: "Spark Electric Co. — Proposal", type: "Proposals", checked: true },
  { name: "AquaFlow Plumbing — Proposal", type: "Proposals", checked: true },
];

// Euclid right-panel insights
const missingScope = [
  "Electrical rough-in for addition area",
  "Below-grade waterproofing",
  "Temporary fencing / barricades",
  "Final cleaning / punch list",
];

const riskPhrases = [
  { phrase: "by others", location: "Spark Electric exclusions" },
  { phrase: "field verify", location: "Foundation footing notes" },
  { phrase: "assumed", location: "5 scope items" },
  { phrase: "TBD", location: "Temp power cost code" },
];

export default function ScopeAnalyzerPage() {
  const [data, setData] = useState(scopeData);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [transition, setTransition] = useState<"bid-leveling" | "estimate" | null>(null);
  
  // Filters
  const [filterMissingCodes, setFilterMissingCodes] = useState(false);
  const [filterNeedsReview, setFilterNeedsReview] = useState(false);
  const [filterRiskFlags, setFilterRiskFlags] = useState(false);
  const [filterLowConfidence, setFilterLowConfidence] = useState(false);
  const [filterExclusions, setFilterExclusions] = useState(false);
  const [euclIdInput, setEuclidInput] = useState("");
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  // Summary counts
  const totalItems = data.length;
  const needsReviewCount = data.filter(r => !r.reviewed).length;
  const missingCodeCount = data.filter(r => !r.costCode || r.costCode === "").length;
  const issuesCount = data.filter(r => r.riskFlag !== "None").length;

  // Apply filters
  const filteredData = data.filter(r => {
    if (filterMissingCodes && r.costCode) return false;
    if (filterNeedsReview && r.reviewed) return false;
    if (filterRiskFlags && r.riskFlag === "None") return false;
    if (filterLowConfidence && r.confidence !== "Low") return false;
    if (filterExclusions && r.inclusionStatus !== "Excluded") return false;
    return true;
  });

  // Group by parent scope
  const groups = filteredData.reduce((acc, row) => {
    if (!acc[row.parentScope]) acc[row.parentScope] = [];
    acc[row.parentScope].push(row);
    return acc;
  }, {} as Record<string, ScopeRow[]>);

  const toggleRowSelection = (id: number) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleReviewed = (id: number) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, reviewed: !r.reviewed } : r));
  };

  const allReviewed = data.every(r => r.reviewed);
  const canLock = allReviewed && missingCodeCount === 0;

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* ═══════════ LEFT PANEL — Sources & Filters ═══════════ */}
        <div className={cn(
          "border-r border-border bg-card shrink-0 flex flex-col overflow-y-auto transition-all duration-200",
          leftCollapsed ? "w-0 overflow-hidden" : "w-64"
        )}>
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Sources</h3>
          </div>
          <div className="px-3 py-2 space-y-1 border-b border-border">
            {sourceFiles.map((f, i) => (
              <label key={i} className="flex items-center gap-2 py-1 text-xs cursor-pointer hover:bg-muted/30 rounded px-1.5">
                <input type="checkbox" defaultChecked={f.checked} className="rounded border-border h-3 w-3" />
                <FileText size={11} className="text-muted-foreground shrink-0" />
                <span className="text-foreground truncate flex-1">{f.name}</span>
                <span className="text-[9px] text-muted-foreground">{f.type}</span>
              </label>
            ))}
          </div>

          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Filters</h3>
          </div>
          <div className="px-3 py-2 space-y-1.5 border-b border-border">
            {[
              { label: "Missing Cost Codes", active: filterMissingCodes, toggle: () => setFilterMissingCodes(!filterMissingCodes), count: missingCodeCount },
              { label: "Needs Review", active: filterNeedsReview, toggle: () => setFilterNeedsReview(!filterNeedsReview), count: needsReviewCount },
              { label: "Risk Flags", active: filterRiskFlags, toggle: () => setFilterRiskFlags(!filterRiskFlags), count: issuesCount },
              { label: "Low Confidence", active: filterLowConfidence, toggle: () => setFilterLowConfidence(!filterLowConfidence), count: data.filter(r => r.confidence === "Low").length },
              { label: "Exclusions Only", active: filterExclusions, toggle: () => setFilterExclusions(!filterExclusions), count: data.filter(r => r.inclusionStatus === "Excluded").length },
            ].map(f => (
              <button key={f.label} onClick={f.toggle}
                className={cn(
                  "flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-xs transition-colors",
                  f.active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                )}>
                <span>{f.label}</span>
                <span className="font-semibold">{f.count}</span>
              </button>
            ))}
          </div>

          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Scope Navigation</h3>
          </div>
          <div className="px-3 py-2 space-y-0.5 flex-1">
            {Object.entries(groups).map(([group, items]) => (
              <button key={group} onClick={() => setExpandedGroup(expandedGroup === group ? null : group)}
                className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-xs text-foreground hover:bg-muted/30 transition-colors">
                <span className="font-medium">{group}</span>
                <span className="text-muted-foreground">{items.length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════ CENTER — Scope Table ═══════════ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b border-border bg-card flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setLeftCollapsed(!leftCollapsed)} className="text-muted-foreground hover:text-foreground p-1 rounded">
                <ChevronLeft size={14} className={cn("transition-transform", leftCollapsed && "rotate-180")} />
              </button>
              <div>
                <h1 className="font-display text-lg font-bold text-foreground">Scope Analyzer</h1>
                <p className="text-[11px] text-muted-foreground">Maple St. Kitchen Remodel · <span className="text-warning font-medium">Draft</span></p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <Play size={12} /> Run Analysis
              </Button>
              <Button size="sm" className={cn("text-xs gap-1.5", !canLock && "opacity-50")} disabled={!canLock}>
                <Lock size={12} /> Lock Scope Sheet
              </Button>
            </div>
          </div>

          {/* Summary Strip */}
          <div className="px-5 py-2 border-b border-border bg-muted/20 flex gap-4 shrink-0">
            {[
              { label: "Total Scope Items", value: totalItems, color: "text-foreground" },
              { label: "Needs Review", value: needsReviewCount, color: needsReviewCount > 0 ? "text-warning" : "text-primary" },
              { label: "Missing Cost Codes", value: missingCodeCount, color: missingCodeCount > 0 ? "text-destructive" : "text-primary" },
              { label: "Issues Found", value: issuesCount, color: issuesCount > 0 ? "text-destructive" : "text-primary" },
            ].map(c => (
              <button key={c.label} onClick={() => {
                if (c.label === "Needs Review") setFilterNeedsReview(!filterNeedsReview);
                if (c.label === "Issues Found") setFilterRiskFlags(!filterRiskFlags);
              }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                <span className={cn("font-display text-lg font-bold", c.color)}>{c.value}</span>
                <span className="text-[10px] text-muted-foreground">{c.label}</span>
              </button>
            ))}
          </div>

          {/* Bulk Actions Bar */}
          {selectedRows.size > 0 && (
            <div className="px-5 py-2 border-b border-border bg-primary/5 flex items-center gap-2 shrink-0">
              <span className="text-xs text-primary font-medium">{selectedRows.size} selected</span>
              <div className="flex gap-1.5 ml-2">
                <Button size="sm" variant="outline" className="text-xs h-7"><Check size={12} className="mr-1" />Confirm</Button>
                <Button size="sm" variant="outline" className="text-xs h-7"><GitMerge size={12} className="mr-1" />Merge</Button>
                <Button size="sm" variant="outline" className="text-xs h-7"><Copy size={12} className="mr-1" />Duplicate</Button>
                <Button size="sm" variant="outline" className="text-xs h-7"><Flag size={12} className="mr-1" />Flag</Button>
                <Button size="sm" variant="outline" className="text-xs h-7"><Trash2 size={12} className="mr-1" />Remove</Button>
              </div>
            </div>
          )}

          {/* Scope Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-border bg-card">
                  <th className="w-8 pl-3 py-2.5">
                    <input type="checkbox" className="rounded border-border h-3 w-3"
                      checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                      onChange={() => {
                        if (selectedRows.size === filteredData.length) setSelectedRows(new Set());
                        else setSelectedRows(new Set(filteredData.map(r => r.id)));
                      }} />
                  </th>
                  <th className="w-10 px-2 py-2.5 text-xs font-medium text-muted-foreground text-left">Status</th>
                  <th className="px-2 py-2.5 text-xs font-medium text-muted-foreground text-left">Parent Scope</th>
                  <th className="px-2 py-2.5 text-xs font-medium text-muted-foreground text-left">Scope Group</th>
                  <th className="px-2 py-2.5 text-xs font-medium text-muted-foreground text-left min-w-[200px]">Scope Item</th>
                  <th className="px-2 py-2.5 text-xs font-medium text-muted-foreground text-left">Inclusion</th>
                  <th className="px-2 py-2.5 text-xs font-medium text-muted-foreground text-left">Cost Code</th>
                  <th className="px-2 py-2.5 text-xs font-medium text-muted-foreground text-left">Source</th>
                  <th className="px-2 py-2.5 text-xs font-medium text-muted-foreground text-left">Confidence</th>
                  <th className="px-2 py-2.5 text-xs font-medium text-muted-foreground text-left">Risk Flag</th>
                  <th className="px-2 py-2.5 text-xs font-medium text-muted-foreground text-left min-w-[140px]">Notes</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groups).map(([group, items]) => (
                  <>
                    {/* Group Header Row */}
                    <tr key={`group-${group}`} className="bg-muted/30 border-b border-border">
                      <td colSpan={11} className="px-3 py-2">
                        <button onClick={() => setExpandedGroup(expandedGroup === group ? null : group)}
                          className="flex items-center gap-2 text-xs font-semibold text-foreground">
                          <ChevronRight size={12} className={cn("transition-transform text-muted-foreground", expandedGroup !== group && "rotate-90")} />
                          {group}
                          <span className="text-muted-foreground font-normal">({items.length})</span>
                        </button>
                      </td>
                    </tr>
                    {/* Items — always visible (group toggle would hide, but default open) */}
                    {(expandedGroup === null || expandedGroup !== group ? items : []).map((row) => (
                      <tr key={row.id} className={cn(
                        "border-b border-border hover:bg-muted/20 transition-colors",
                        selectedRows.has(row.id) && "bg-primary/5",
                        !row.reviewed && "bg-warning/[0.02]"
                      )}>
                        <td className="pl-3 py-2">
                          <input type="checkbox" className="rounded border-border h-3 w-3" checked={selectedRows.has(row.id)} onChange={() => toggleRowSelection(row.id)} />
                        </td>
                        <td className="px-2 py-2">
                          <button onClick={() => toggleReviewed(row.id)}
                            className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                              row.reviewed ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-primary"
                            )}>
                            {row.reviewed && <Check size={10} />}
                          </button>
                        </td>
                        <td className="px-2 py-2 text-xs text-muted-foreground">{row.parentScope}</td>
                        <td className="px-2 py-2 text-xs text-muted-foreground">{row.scopeGroup}</td>
                        <td className="px-2 py-2 text-foreground">{row.scopeItem}</td>
                        <td className="px-2 py-2">
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", inclusionColors[row.inclusionStatus])}>
                            {row.inclusionStatus}
                          </span>
                        </td>
                        <td className="px-2 py-2 font-mono text-xs text-muted-foreground">{row.costCode || "—"}</td>
                        <td className="px-2 py-2">{row.source !== "—" ? <PlanReferenceChip sheet={row.source} /> : <span className="text-xs text-muted-foreground">—</span>}</td>
                        <td className="px-2 py-2"><ConfidenceBadge level={row.confidence} /></td>
                        <td className="px-2 py-2">
                          {row.riskFlag !== "None" && (
                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", riskFlagColors[row.riskFlag])}>
                              {row.riskFlag}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-xs text-muted-foreground max-w-[180px] truncate" title={row.notes}>{row.notes || "—"}</td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ═══════════ RIGHT PANEL — Euclid Assistant ═══════════ */}
        <div className="w-72 xl:w-80 border-l border-border bg-card flex flex-col shrink-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot size={14} className="text-primary" />
            </div>
            <span className="text-sm font-bold text-foreground font-display">Euclid</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Summary */}
            <div className="px-4 py-3 border-b border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Summary</h4>
              <div className="space-y-1.5">
                <p className="text-xs text-foreground"><span className="font-semibold text-warning">{needsReviewCount}</span> items need review</p>
                <p className="text-xs text-foreground"><span className="font-semibold text-destructive">{missingCodeCount}</span> missing cost codes</p>
                <p className="text-xs text-foreground"><span className="font-semibold text-destructive">{issuesCount}</span> risk flags detected</p>
                <p className="text-xs text-foreground"><span className="font-semibold text-primary">{data.filter(r => r.reviewed).length}</span> items reviewed</p>
              </div>
            </div>

            {/* Missing Scope Suggestions */}
            <div className="px-4 py-3 border-b border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Missing Scope Suggestions</h4>
              <div className="space-y-1.5">
                {missingScope.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <AlertTriangle size={10} className="text-warning mt-0.5 shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Flags */}
            <div className="px-4 py-3 border-b border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Risk Phrases Detected</h4>
              <div className="space-y-1.5">
                {riskPhrases.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <Flag size={10} className="text-destructive mt-0.5 shrink-0" />
                    <span className="text-foreground"><span className="font-mono font-semibold">"{r.phrase}"</span> — {r.location}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-b border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Actions</h4>
              <div className="space-y-1.5">
                <Button variant="outline" size="sm" className="w-full text-xs justify-start h-7"><Layers size={12} className="mr-1.5" />Auto-map cost codes</Button>
                <Button variant="outline" size="sm" className="w-full text-xs justify-start h-7"><Package size={12} className="mr-1.5" />Add missing items</Button>
                <Button variant="outline" size="sm" className="w-full text-xs justify-start h-7"><ClipboardList size={12} className="mr-1.5" />Generate clarifications</Button>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="px-3 py-3 border-t border-border">
            <div className="flex flex-wrap gap-1 mb-2">
              {["Which items are low confidence?", "What's missing?", "Map all cost codes"].map(s => (
                <button key={s} onClick={() => setEuclidInput(s)}
                  className="text-[9px] bg-accent rounded-full px-2 py-1 text-accent-foreground hover:bg-primary/10 transition-colors">
                  <Sparkles size={8} className="inline mr-0.5" />{s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2">
              <input
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                placeholder="Ask Euclid…"
                value={euclIdInput}
                onChange={(e) => setEuclidInput(e.target.value)}
              />
              <button className="text-primary hover:text-primary/80"><Send size={13} /></button>
            </div>
          </div>
        </div>
      </div>

      <WorkflowTransition
        active={transition === "bid-leveling"}
        headline="Compiling your subcontractor bids"
        steps={[
          { label: "Organizing trade packages from scope analysis" },
          { label: "Matching subcontractor bids to scope packages" },
          { label: "Calculating coverage and exclusions" },
          { label: "Preparing bid leveling workspace" },
        ]}
        targetPath="/app/bid-leveling"
        onComplete={() => setTransition(null)}
      />
      <WorkflowTransition
        active={transition === "estimate"}
        headline="Building your estimate"
        steps={[
          { label: "Refining scope from analysis" },
          { label: "Adding scope packages" },
          { label: "Applying cost memory" },
          { label: "Opening Estimate Builder" },
        ]}
        targetPath="/app/estimate-builder"
        onComplete={() => setTransition(null)}
      />
    </AppLayout>
  );
}
