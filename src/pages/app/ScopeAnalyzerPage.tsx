import { AppLayout } from "@/components/app/AppLayout";
import { AlertTriangle, CheckCircle, FileSearch, Info, XCircle, ChevronDown } from "lucide-react";
import { PlanReferenceChip } from "@/components/app/traceability/PlanReferenceChip";
import { useState } from "react";

interface ScopeItem {
  message: string;
  trade: string;
  affectedItem: string;
  sheet: string;
  issueType: string;
  atlasNote: string;
  recommendation: string;
}

const categories: { title: string; icon: typeof XCircle; severity: string; items: ScopeItem[] }[] = [
  {
    title: "Missing Scope Items",
    icon: XCircle,
    severity: "high",
    items: [
      { message: "Electrical rough-in not included for addition area", trade: "Electrical", affectedItem: "Div 26 — Rough-in", sheet: "E1.1", issueType: "Missing Scope", atlasNote: "No rough-in line item found for the 2,800 SF addition. Historical projects of similar size include $4,200–$6,100 for rough-in.", recommendation: "Add electrical rough-in line item to Division 26 in Estimate Builder." },
      { message: "No waterproofing specified for below-grade foundation", trade: "Concrete", affectedItem: "Div 07 — Waterproofing", sheet: "S1.1", issueType: "Missing Scope", atlasNote: "Foundation plan shows below-grade walls but no waterproofing specification. This is typical for the region.", recommendation: "Request waterproofing sub quote or add allowance line item." },
      { message: "Missing temporary power/utilities during construction", trade: "General Conditions", affectedItem: "Div 01 — Temp Utilities", sheet: "—", issueType: "Missing Scope", atlasNote: "No temporary power line item. Common exclusion but should be explicitly stated.", recommendation: "Add to exclusions list or include as line item." },
    ],
  },
  {
    title: "Inconsistent Assumptions",
    icon: AlertTriangle,
    severity: "medium",
    items: [
      { message: "HVAC ductwork bundled into equipment allowance — should be separate", trade: "HVAC", affectedItem: "Div 23 — HVAC System", sheet: "M1.1", issueType: "Scope Overlap", atlasNote: "Ductwork typically runs $6,400–$8,100 for this size. Current allowance of $14,200 may not adequately cover both equipment and distribution.", recommendation: "Split ductwork into separate line item in Estimate Builder." },
      { message: "Drywall quantity (3,200 SF) doesn't match framing area (2,800 SF)", trade: "Drywall", affectedItem: "Div 09 — Drywall", sheet: "A1.1", issueType: "Spec Conflict", atlasNote: "Framing area is 2,800 SF but drywall shows 3,200 SF. Difference may be due to both-sides calculation, but should be verified.", recommendation: "Verify drywall SF in Plan-Derived Takeoff against framing quantities." },
      { message: "Finish hardware allowance at builder grade vs premium spec level selected", trade: "Finish Carpentry", affectedItem: "Div 08 — Hardware", sheet: "A5.1", issueType: "Spec Conflict", atlasNote: "Project spec level is Premium but hardware allowance is at builder grade pricing. 15% below regional median.", recommendation: "Adjust hardware allowance to match premium spec level." },
    ],
  },
  {
    title: "Likely Exclusions Needed",
    icon: Info,
    severity: "low",
    items: [
      { message: "Furniture, fixtures & equipment (FF&E)", trade: "—", affectedItem: "—", sheet: "—", issueType: "Exclusion Risk", atlasNote: "FF&E is not included in the current scope. Should be explicitly listed as an exclusion.", recommendation: "Add to exclusions list in Proposal Export." },
      { message: "Landscaping restoration after construction", trade: "Landscaping", affectedItem: "Div 32", sheet: "C1.1", issueType: "Exclusion Risk", atlasNote: "Site plan shows landscaping but no restoration scope is included.", recommendation: "Clarify with owner or add to exclusions." },
      { message: "Permit fees and impact fees", trade: "General Conditions", affectedItem: "Div 01", sheet: "—", issueType: "Exclusion Risk", atlasNote: "Permit fees vary by jurisdiction. Should be owner responsibility or explicitly included.", recommendation: "Add to exclusions or confirm with owner." },
      { message: "Architectural and engineering fees", trade: "—", affectedItem: "—", sheet: "—", issueType: "Exclusion Risk", atlasNote: "Design fees are typically owner-direct. Confirm and exclude.", recommendation: "Add to exclusions list." },
    ],
  },
  {
    title: "Trade Overlap Detected",
    icon: FileSearch,
    severity: "medium",
    items: [
      { message: "Demolition scope appears in both General Conditions and Earthwork", trade: "Multiple", affectedItem: "Div 01 / Div 31", sheet: "C1.1", issueType: "Scope Overlap", atlasNote: "Demolition labor appears under both General Conditions and Earthwork line items. Potential double-count of $2,400.", recommendation: "Consolidate demolition under one trade in Estimate Builder." },
      { message: "Paint prep labor overlaps with drywall finish scope", trade: "Painting / Drywall", affectedItem: "Div 09", sheet: "A1.1", issueType: "Scope Overlap", atlasNote: "Drywall finish includes Level 4 prep, which may overlap with painting prep labor.", recommendation: "Verify with subs to avoid double-billing." },
    ],
  },
];

export default function ScopeAnalyzerPage() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Plan & Scope Analyzer</h1>
          <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Evidence-backed document intelligence review</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Issues Found", value: "12", color: "text-warning" },
            { label: "High Priority", value: "3", color: "text-destructive" },
            { label: "Trades Reviewed", value: "10", color: "text-primary" },
            { label: "Documents Scanned", value: "4", color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5 shadow-card text-center">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.title} className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <cat.icon size={16} className={
                  cat.severity === "high" ? "text-destructive" :
                  cat.severity === "medium" ? "text-warning" :
                  "text-info"
                } />
                <h2 className="font-display font-semibold text-foreground">{cat.title}</h2>
                <span className="ml-auto text-xs text-muted-foreground">{cat.items.length} items</span>
              </div>
              <div className="divide-y divide-border">
                {cat.items.map((item, i) => {
                  const key = `${cat.title}-${i}`;
                  const isExpanded = expandedItem === key;
                  return (
                    <div key={i}>
                      <button
                        onClick={() => setExpandedItem(isExpanded ? null : key)}
                        className="w-full flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors text-left"
                      >
                        <CheckCircle size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{item.message}</p>
                          <div className="flex gap-2 mt-1.5 flex-wrap">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{item.trade}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{item.issueType}</span>
                            {item.sheet !== "—" && <PlanReferenceChip sheet={item.sheet} />}
                          </div>
                        </div>
                        <ChevronDown size={14} className={`text-muted-foreground mt-1 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 ml-7 space-y-2 text-xs">
                          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                            <div><span className="text-muted-foreground">Affected Item:</span> <span className="text-foreground ml-1">{item.affectedItem}</span></div>
                            <div><span className="text-muted-foreground">Atlas Analysis:</span> <span className="text-foreground ml-1">{item.atlasNote}</span></div>
                            <div className="pt-1 border-t border-border">
                              <span className="text-muted-foreground">Recommendation:</span> <span className="text-foreground font-medium ml-1">{item.recommendation}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
