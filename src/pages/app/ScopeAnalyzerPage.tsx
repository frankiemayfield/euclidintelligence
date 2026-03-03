import { AppLayout } from "@/components/app/AppLayout";
import { AlertTriangle, CheckCircle, FileSearch, Info, XCircle, ChevronDown, Pencil, Flag, Send, Mail } from "lucide-react";
import { PlanReferenceChip } from "@/components/app/traceability/PlanReferenceChip";
import { ExtractionMethodBadge } from "@/components/app/traceability/ExtractionMethodBadge";
import { ReviewStatusBadge } from "@/components/app/traceability/ReviewStatusBadge";
import { ConfidenceBadge } from "@/components/app/traceability/ConfidenceBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";

// Types
type ExtractionMethod = "Explicitly Labeled" | "Derived from Scale" | "Schedule Verified" | "Assumption Applied";
type ReviewStatus = "Auto-Extracted" | "Needs Review" | "Estimator Confirmed" | "Adjusted by User";
type Confidence = "High" | "Medium" | "Low";

interface TakeoffRow {
  id: number; division: string; description: string; qty: number; unit: string; sheet: string;
  method: ExtractionMethod; confidence: Confidence; status: ReviewStatus;
  detail: { sourceType: string; sheetRef: string; detectionNote: string; formula: string; unitConversion: string; assumptionNotes: string; confidenceExplanation: string; };
}

interface ScopeItem {
  message: string; trade: string; affectedItem: string; sheet: string; issueType: string; atlasNote: string; recommendation: string;
}

// Takeoff data
const takeoffData: TakeoffRow[] = [
  { id: 1, division: "03 30 00", description: "Concrete slab — main level", qty: 12.8, unit: "CY", sheet: "A2.1", method: "Explicitly Labeled", confidence: "High", status: "Estimator Confirmed",
    detail: { sourceType: "Plan callout", sheetRef: "Sheet A2.1 — Foundation Plan", detectionNote: "Slab note indicates 4\" thickness, area bounded by gridlines A–D / 1–5", formula: "1,000 SF × 0.33 ft = 330 CF", unitConversion: "330 CF ÷ 27 = 12.2 CY + 5% waste = 12.8 CY", assumptionNotes: "Waste factor: 5% per standard practice", confidenceExplanation: "Area explicitly dimensioned on plan. Thickness noted in slab detail." }},
  { id: 2, division: "03 30 00", description: "Foundation footing — perimeter", qty: 8.4, unit: "CY", sheet: "S1.1", method: "Derived from Scale", confidence: "Medium", status: "Needs Review",
    detail: { sourceType: "Scaled measurement", sheetRef: "Sheet S1.1 — Structural Foundation", detectionNote: "Footing width measured from scale bar. Depth assumed from typical detail.", formula: "180 LF × 2 ft × 1.5 ft = 540 CF", unitConversion: "540 CF ÷ 27 = 20 CY, footing only portion = 8.4 CY", assumptionNotes: "Depth assumed 18\" from standard residential footing. Verify with structural.", confidenceExplanation: "Width derived from scale — not explicitly dimensioned. Depth is assumed." }},
  { id: 3, division: "07 31 00", description: "Roof shingles — architectural", qty: 14.2, unit: "SQ", sheet: "A4.1", method: "Explicitly Labeled", confidence: "High", status: "Estimator Confirmed",
    detail: { sourceType: "Plan callout + schedule", sheetRef: "Sheet A4.1 — Roof Plan", detectionNote: "Roof area calculated from plan outline. Pitch multiplier from elevation.", formula: "1,200 SF plan area × 1.118 (6:12 pitch) = 1,341 SF", unitConversion: "1,341 SF ÷ 100 = 13.4 SQ + 6% waste = 14.2 SQ", assumptionNotes: "6:12 pitch confirmed from Section A-A. Waste factor: 6%", confidenceExplanation: "Roof outline dimensioned. Pitch confirmed from building section." }},
  { id: 4, division: "06 10 00", description: "2×4 wall framing — exterior", qty: 1420, unit: "LF", sheet: "A1.1", method: "Derived from Scale", confidence: "Medium", status: "Needs Review",
    detail: { sourceType: "Scaled perimeter", sheetRef: "Sheet A1.1 — Floor Plan", detectionNote: "Exterior wall perimeter measured from floor plan scale", formula: "Perimeter 142 LF × 10 ft wall height ÷ 1 = 1,420 LF top/bottom plate", unitConversion: "LF of plate — studs calculated separately", assumptionNotes: "Wall height assumed 10 ft from section. Interior partitions excluded.", confidenceExplanation: "Perimeter from scale, not dimensioned. Wall height from section detail." }},
  { id: 5, division: "09 29 00", description: "Drywall — interior partitions", qty: 3200, unit: "SF", sheet: "A1.1", method: "Assumption Applied", confidence: "Medium", status: "Auto-Extracted",
    detail: { sourceType: "Calculated from wall lengths", sheetRef: "Sheet A1.1 — Floor Plan", detectionNote: "Interior partition lengths totaled and multiplied by ceiling height", formula: "320 LF walls × 10 ft height = 3,200 SF", unitConversion: "Direct SF — no conversion needed", assumptionNotes: "Assumes all interior walls receive drywall both sides. Ceiling drywall excluded.", confidenceExplanation: "Wall lengths measured from plan. Single-side assumption needs verification." }},
  { id: 6, division: "08 14 00", description: "Interior doors — solid core", qty: 12, unit: "EA", sheet: "A5.1", method: "Schedule Verified", confidence: "High", status: "Estimator Confirmed",
    detail: { sourceType: "Door schedule", sheetRef: "Sheet A5.1 — Door Schedule", detectionNote: "Door schedule lists 12 interior doors (D101–D112). All solid core per spec.", formula: "Direct count from schedule", unitConversion: "No conversion — EA count", assumptionNotes: "Hardware included per door schedule notes. Frames assumed hollow metal.", confidenceExplanation: "Door schedule complete and cross-referenced with floor plan symbols." }},
  { id: 7, division: "08 50 00", description: "Windows — double-hung vinyl", qty: 8, unit: "EA", sheet: "A5.2", method: "Schedule Verified", confidence: "High", status: "Estimator Confirmed",
    detail: { sourceType: "Window schedule", sheetRef: "Sheet A5.2 — Window Schedule", detectionNote: "Window schedule lists 8 windows (W1–W8). Sizes and types confirmed.", formula: "Direct count from schedule", unitConversion: "No conversion — EA count", assumptionNotes: "Low-E glass per energy spec. Installation hardware included.", confidenceExplanation: "Window schedule complete with sizes. Cross-referenced with elevations." }},
  { id: 8, division: "06 20 00", description: "Base trim — painted MDF", qty: 480, unit: "LF", sheet: "A1.1", method: "Derived from Scale", confidence: "Low", status: "Needs Review",
    detail: { sourceType: "Scaled room perimeters", sheetRef: "Sheet A1.1 — Floor Plan", detectionNote: "Room perimeters measured from scale. Openings deducted.", formula: "Total room perimeters 520 LF − 40 LF openings = 480 LF", unitConversion: "Direct LF — no conversion needed", assumptionNotes: "MDF assumed from finish schedule note. 3.25\" profile assumed standard.", confidenceExplanation: "Perimeters from scale, not dimensioned. Opening deductions estimated." }},
  { id: 9, division: "04 21 00", description: "Brick veneer — front elevation", qty: 680, unit: "SF", sheet: "A3.1", method: "Derived from Scale", confidence: "Medium", status: "Needs Review",
    detail: { sourceType: "Scaled elevation", sheetRef: "Sheet A3.1 — Front Elevation", detectionNote: "Brick area measured from front elevation. Windows deducted.", formula: "Front wall 42 LF × 20 ft height = 840 SF − 160 SF openings = 680 SF", unitConversion: "Direct SF — no conversion needed", assumptionNotes: "Brick type per elevation note. Soldier course at openings assumed.", confidenceExplanation: "Elevation area from scale. Opening sizes from window schedule." }},
  { id: 10, division: "23 37 00", description: "HVAC diffusers — ceiling mount", qty: 14, unit: "EA", sheet: "M1.1", method: "Explicitly Labeled", confidence: "High", status: "Auto-Extracted",
    detail: { sourceType: "Mechanical plan symbols", sheetRef: "Sheet M1.1 — Mechanical Plan", detectionNote: "14 supply diffuser symbols identified on mechanical plan", formula: "Direct count from plan symbols", unitConversion: "No conversion — EA count", assumptionNotes: "Size assumed 12×12 from typical. Return grilles counted separately.", confidenceExplanation: "Symbols clearly marked on mechanical plan. Count cross-verified." }},
];

// Scope issues
const categories: { title: string; icon: typeof XCircle; severity: string; items: ScopeItem[] }[] = [
  { title: "Missing Scope Items", icon: XCircle, severity: "high", items: [
    { message: "Electrical rough-in not included for addition area", trade: "Electrical", affectedItem: "Div 26 — Rough-in", sheet: "E1.1", issueType: "Missing Scope", atlasNote: "No rough-in line item found for the 2,800 SF addition. Historical projects of similar size include $4,200–$6,100 for rough-in.", recommendation: "Add electrical rough-in line item to Division 26 in Estimate Builder." },
    { message: "No waterproofing specified for below-grade foundation", trade: "Concrete", affectedItem: "Div 07 — Waterproofing", sheet: "S1.1", issueType: "Missing Scope", atlasNote: "Foundation plan shows below-grade walls but no waterproofing specification. This is typical for the region.", recommendation: "Request waterproofing sub quote or add allowance line item." },
    { message: "Missing temporary power/utilities during construction", trade: "General Conditions", affectedItem: "Div 01 — Temp Utilities", sheet: "—", issueType: "Missing Scope", atlasNote: "No temporary power line item. Common exclusion but should be explicitly stated.", recommendation: "Add to exclusions list or include as line item." },
  ]},
  { title: "Inconsistent Assumptions", icon: AlertTriangle, severity: "medium", items: [
    { message: "HVAC ductwork bundled into equipment allowance — should be separate", trade: "HVAC", affectedItem: "Div 23 — HVAC System", sheet: "M1.1", issueType: "Scope Overlap", atlasNote: "Ductwork typically runs $6,400–$8,100 for this size. Current allowance of $14,200 may not adequately cover both equipment and distribution.", recommendation: "Split ductwork into separate line item in Estimate Builder." },
    { message: "Drywall quantity (3,200 SF) doesn't match framing area (2,800 SF)", trade: "Drywall", affectedItem: "Div 09 — Drywall", sheet: "A1.1", issueType: "Spec Conflict", atlasNote: "Framing area is 2,800 SF but drywall shows 3,200 SF. Difference may be due to both-sides calculation, but should be verified.", recommendation: "Verify drywall SF against framing quantities." },
    { message: "Finish hardware allowance at builder grade vs premium spec level selected", trade: "Finish Carpentry", affectedItem: "Div 08 — Hardware", sheet: "A5.1", issueType: "Spec Conflict", atlasNote: "Project spec level is Premium but hardware allowance is at builder grade pricing. 15% below regional median.", recommendation: "Adjust hardware allowance to match premium spec level." },
  ]},
  { title: "Likely Exclusions Needed", icon: Info, severity: "low", items: [
    { message: "Furniture, fixtures & equipment (FF&E)", trade: "—", affectedItem: "—", sheet: "—", issueType: "Exclusion Risk", atlasNote: "FF&E is not included in the current scope. Should be explicitly listed as an exclusion.", recommendation: "Add to exclusions list in Proposal Export." },
    { message: "Landscaping restoration after construction", trade: "Landscaping", affectedItem: "Div 32", sheet: "C1.1", issueType: "Exclusion Risk", atlasNote: "Site plan shows landscaping but no restoration scope is included.", recommendation: "Clarify with owner or add to exclusions." },
    { message: "Permit fees and impact fees", trade: "General Conditions", affectedItem: "Div 01", sheet: "—", issueType: "Exclusion Risk", atlasNote: "Permit fees vary by jurisdiction. Should be owner responsibility or explicitly included.", recommendation: "Add to exclusions or confirm with owner." },
    { message: "Architectural and engineering fees", trade: "—", affectedItem: "—", sheet: "—", issueType: "Exclusion Risk", atlasNote: "Design fees are typically owner-direct. Confirm and exclude.", recommendation: "Add to exclusions list." },
  ]},
  { title: "Trade Overlap Detected", icon: FileSearch, severity: "medium", items: [
    { message: "Demolition scope appears in both General Conditions and Earthwork", trade: "Multiple", affectedItem: "Div 01 / Div 31", sheet: "C1.1", issueType: "Scope Overlap", atlasNote: "Demolition labor appears under both General Conditions and Earthwork line items. Potential double-count of $2,400.", recommendation: "Consolidate demolition under one trade in Estimate Builder." },
    { message: "Paint prep labor overlaps with drywall finish scope", trade: "Painting / Drywall", affectedItem: "Div 09", sheet: "A1.1", issueType: "Scope Overlap", atlasNote: "Drywall finish includes Level 4 prep, which may overlap with painting prep labor.", recommendation: "Verify with subs to avoid double-billing." },
  ]},
];

// Sub scope export trades
const subScopePackages = [
  { trade: "Electrical", status: "Bid Received" as const, subName: "Spark Electric Co." },
  { trade: "Plumbing", status: "Sent" as const, subName: "AquaFlow Plumbing" },
  { trade: "HVAC", status: "Draft" as const, subName: "" },
  { trade: "Drywall", status: "Awaiting Bid" as const, subName: "SmoothWall Inc." },
  { trade: "Framing", status: "Bid Received" as const, subName: "TrueFrame Carpentry" },
  { trade: "Roofing", status: "Draft" as const, subName: "" },
];

const statusColors: Record<string, string> = {
  "Draft": "bg-muted text-muted-foreground",
  "Sent": "bg-info/10 text-info",
  "Awaiting Bid": "bg-warning/10 text-warning",
  "Bid Received": "bg-primary/10 text-primary",
};

export default function ScopeAnalyzerPage() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const needsReview = takeoffData.filter(r => r.status === "Needs Review" || r.confidence === "Low");
  const summaryCards = [
    { label: "Total Extracted Items", value: takeoffData.length, color: "text-foreground" },
    { label: "Explicitly Labeled", value: takeoffData.filter(r => r.method === "Explicitly Labeled").length, color: "text-primary" },
    { label: "Derived from Scale", value: takeoffData.filter(r => r.method === "Derived from Scale").length, color: "text-warning" },
    { label: "Needs Review", value: needsReview.length, color: "text-warning" },
    { label: "Issues Found", value: categories.reduce((s, c) => s + c.items.length, 0), color: "text-destructive" },
  ];

  const assumptionItems = takeoffData.filter(r => r.method === "Assumption Applied" || r.method === "Derived from Scale" || r.confidence !== "High");

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Scope Analyzer</h1>
          <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Review scope before pricing</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {summaryCards.map((c) => (
            <div key={c.label} className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
              <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
              <p className={`font-display text-2xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quantities">Quantities</TabsTrigger>
            <TabsTrigger value="scope-issues">Scope Issues</TabsTrigger>
            <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
            <TabsTrigger value="sub-scope">Sub Scope Export</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-card border border-border rounded-xl p-5 shadow-card">
                  <h3 className="font-display font-semibold text-foreground mb-3">Project Readiness</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Documents scanned & indexed", value: "4 documents", ok: true },
                      { label: "Quantities extracted", value: `${takeoffData.length} items`, ok: true },
                      { label: "Trades reviewed", value: "10 trades", ok: true },
                      { label: "Low-confidence quantities", value: `${takeoffData.filter(r => r.confidence === "Low").length} items`, ok: takeoffData.filter(r => r.confidence === "Low").length === 0 },
                      { label: "Assumptions requiring review", value: `${assumptionItems.length} items`, ok: false },
                      { label: "Scope issues detected", value: `${categories.reduce((s, c) => s + c.items.length, 0)} issues`, ok: false },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                        <div className="flex items-center gap-2">
                          {item.ok ? <CheckCircle size={14} className="text-primary" /> : <AlertTriangle size={14} className="text-warning" />}
                          <span className="text-sm text-foreground">{item.label}</span>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 shadow-card">
                  <h3 className="font-display font-semibold text-foreground mb-2">Ready for next step?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Review quantities and resolve scope issues before moving to Bid Leveling or Estimate Builder.</p>
                  <div className="flex gap-2">
                    <Button size="sm">Send to Bid Leveling →</Button>
                    <Button size="sm" variant="outline">Send to Estimate Builder →</Button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-xl shadow-card p-4">
                  <h3 className="font-display font-semibold text-sm text-foreground mb-3">Items Requiring Review</h3>
                  <div className="space-y-2">
                    {needsReview.map((item) => (
                      <div key={item.id} className="p-2 rounded-lg bg-muted/30">
                        <p className="text-xs font-medium text-foreground">{item.description}</p>
                        <div className="flex gap-1.5 mt-1">
                          <ConfidenceBadge level={item.confidence} />
                          <ReviewStatusBadge status={item.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* QUANTITIES TAB */}
          <TabsContent value="quantities">
            <div className="flex gap-6 flex-col xl:flex-row">
              <div className="flex-1 bg-card border border-border rounded-xl shadow-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-display font-semibold text-foreground">Quantity Takeoff</h2>
                  <p className="text-xs text-muted-foreground">Every number has a source</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="w-8" />
                        {["CSI Division", "Description", "Qty", "Unit", "Sheet", "Method", "Confidence", "Status"].map((h) => (
                          <th key={h} className="text-left px-3 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {takeoffData.map((row) => (
                        <>
                          <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}>
                            <td className="pl-3 py-3"><ChevronDown size={14} className={`text-muted-foreground transition-transform ${expandedRow === row.id ? "rotate-180" : ""}`} /></td>
                            <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{row.division}</td>
                            <td className="px-3 py-3 text-foreground">{row.description}</td>
                            <td className="px-3 py-3 font-display font-semibold text-foreground">{row.qty}</td>
                            <td className="px-3 py-3 text-muted-foreground">{row.unit}</td>
                            <td className="px-3 py-3"><PlanReferenceChip sheet={row.sheet} /></td>
                            <td className="px-3 py-3"><ExtractionMethodBadge method={row.method} /></td>
                            <td className="px-3 py-3"><ConfidenceBadge level={row.confidence} /></td>
                            <td className="px-3 py-3"><ReviewStatusBadge status={row.status} /></td>
                          </tr>
                          {expandedRow === row.id && (
                            <tr key={`${row.id}-detail`} className="border-b border-border bg-muted/10">
                              <td colSpan={9} className="p-4">
                                <div className="grid md:grid-cols-2 gap-4 text-xs">
                                  <div className="space-y-3">
                                    <h4 className="font-display font-semibold text-foreground text-sm">Quantity Derivation</h4>
                                    <div className="space-y-2">
                                      <div><span className="text-muted-foreground">Source Type:</span> <span className="text-foreground ml-1">{row.detail.sourceType}</span></div>
                                      <div><span className="text-muted-foreground">Sheet Reference:</span> <span className="text-foreground ml-1">{row.detail.sheetRef}</span></div>
                                      <div><span className="text-muted-foreground">Detection Note:</span> <span className="text-foreground ml-1">{row.detail.detectionNote}</span></div>
                                      <div className="bg-muted/40 rounded-md p-2"><span className="text-muted-foreground">Formula:</span><div className="font-mono text-foreground mt-1">{row.detail.formula}</div></div>
                                      <div className="bg-muted/40 rounded-md p-2"><span className="text-muted-foreground">Unit Conversion:</span><div className="font-mono text-foreground mt-1">{row.detail.unitConversion}</div></div>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <h4 className="font-display font-semibold text-foreground text-sm">Review & Assumptions</h4>
                                    <div className="space-y-2">
                                      <div><span className="text-muted-foreground">Assumptions:</span> <span className="text-foreground ml-1">{row.detail.assumptionNotes}</span></div>
                                      <div><span className="text-muted-foreground">Confidence:</span> <span className="text-foreground ml-1">{row.detail.confidenceExplanation}</span></div>
                                    </div>
                                    <div className="bg-card border border-border rounded-lg p-3">
                                      <label className="text-muted-foreground block mb-1">Reviewer Comment</label>
                                      <textarea className="w-full bg-muted/20 rounded-md text-xs p-2 outline-none resize-none h-14 text-foreground" placeholder="Add review notes..." />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="default" className="text-xs h-7"><CheckCircle size={12} className="mr-1" /> Confirm</Button>
                                      <Button size="sm" variant="outline" className="text-xs h-7"><Pencil size={12} className="mr-1" /> Adjust</Button>
                                      <Button size="sm" variant="outline" className="text-xs h-7"><Flag size={12} className="mr-1" /> Flag</Button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="xl:w-72 shrink-0 space-y-4">
                <div className="bg-card border border-border rounded-xl shadow-card p-4">
                  <h3 className="font-display font-semibold text-sm text-foreground mb-3">Items Requiring Review</h3>
                  <div className="space-y-2">
                    {needsReview.map((item) => (
                      <button key={item.id} onClick={() => setExpandedRow(item.id)} className="w-full text-left p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <p className="text-xs font-medium text-foreground">{item.description}</p>
                        <div className="flex gap-1.5 mt-1"><ConfidenceBadge level={item.confidence} /><ReviewStatusBadge status={item.status} /></div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl shadow-card p-4">
                  <h3 className="font-display font-semibold text-sm text-foreground mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start"><CheckCircle size={12} className="mr-1.5" /> Confirm all high-confidence</Button>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start"><AlertTriangle size={12} className="mr-1.5" /> Review scale-derived items</Button>
                    <Button size="sm" className="w-full text-xs justify-start">Send to Estimate Builder →</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* SCOPE ISSUES TAB */}
          <TabsContent value="scope-issues">
            <div className="space-y-6">
              {categories.map((cat) => (
                <div key={cat.title} className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                    <cat.icon size={16} className={cat.severity === "high" ? "text-destructive" : cat.severity === "medium" ? "text-warning" : "text-info"} />
                    <h2 className="font-display font-semibold text-foreground">{cat.title}</h2>
                    <span className="ml-auto text-xs text-muted-foreground">{cat.items.length} items</span>
                  </div>
                  <div className="divide-y divide-border">
                    {cat.items.map((item, i) => {
                      const key = `${cat.title}-${i}`;
                      const isExpanded = expandedItem === key;
                      return (
                        <div key={i}>
                          <button onClick={() => setExpandedItem(isExpanded ? null : key)} className="w-full flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors text-left">
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
                                <div className="pt-1 border-t border-border"><span className="text-muted-foreground">Recommendation:</span> <span className="text-foreground font-medium ml-1">{item.recommendation}</span></div>
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
          </TabsContent>

          {/* ASSUMPTIONS TAB */}
          <TabsContent value="assumptions">
            <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-display font-semibold text-foreground">Items Relying on Assumptions</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Scale-derived, low-confidence, and assumption-based items requiring estimator confirmation</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Description", "Method", "Confidence", "Status", "Assumption"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assumptionItems.map((row) => (
                    <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 text-foreground">{row.description}</td>
                      <td className="px-4 py-3"><ExtractionMethodBadge method={row.method} /></td>
                      <td className="px-4 py-3"><ConfidenceBadge level={row.confidence} /></td>
                      <td className="px-4 py-3"><ReviewStatusBadge status={row.status} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs">{row.detail.assumptionNotes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* SUB SCOPE EXPORT TAB */}
          <TabsContent value="sub-scope">
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-5 shadow-card">
                <h3 className="font-display font-semibold text-foreground mb-2">Export Scope Packages to Subcontractors</h3>
                <p className="text-sm text-muted-foreground">Generate scope summaries, exclusions, and clarifications for individual trade packages. Send directly to subs for pricing.</p>
              </div>
              <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Trade Package", "Subcontractor", "Status", "Actions"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subScopePackages.map((pkg) => (
                      <tr key={pkg.trade} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="px-5 py-3 font-medium text-foreground">{pkg.trade}</td>
                        <td className="px-5 py-3 text-muted-foreground">{pkg.subName || "—"}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[pkg.status]}`}>{pkg.status}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="outline" className="text-xs h-7"><FileSearch size={11} className="mr-1" /> View Scope</Button>
                            <Button size="sm" variant="outline" className="text-xs h-7"><Mail size={11} className="mr-1" /> Send to Sub</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
