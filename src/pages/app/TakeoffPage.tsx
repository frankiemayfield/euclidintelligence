import { AppLayout } from "@/components/app/AppLayout";
import { ExtractionMethodBadge } from "@/components/app/traceability/ExtractionMethodBadge";
import { ReviewStatusBadge } from "@/components/app/traceability/ReviewStatusBadge";
import { ConfidenceBadge } from "@/components/app/traceability/ConfidenceBadge";
import { PlanReferenceChip } from "@/components/app/traceability/PlanReferenceChip";
import { PricingBasisCard } from "@/components/app/traceability/PricingBasisCard";
import { ChevronDown, CheckCircle, AlertTriangle, Pencil, Flag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type ExtractionMethod = "Explicitly Labeled" | "Derived from Scale" | "Schedule Verified" | "Assumption Applied";
type ReviewStatus = "Auto-Extracted" | "Needs Review" | "Estimator Confirmed" | "Adjusted by User";
type Confidence = "High" | "Medium" | "Low";

interface TakeoffRow {
  id: number;
  division: string;
  description: string;
  qty: number;
  unit: string;
  sheet: string;
  method: ExtractionMethod;
  confidence: Confidence;
  status: ReviewStatus;
  detail: {
    sourceType: string;
    sheetRef: string;
    detectionNote: string;
    formula: string;
    unitConversion: string;
    assumptionNotes: string;
    confidenceExplanation: string;
  };
}

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

const summaryCards = [
  { label: "Total Extracted Items", value: takeoffData.length, color: "text-foreground" },
  { label: "Explicitly Labeled", value: takeoffData.filter(r => r.method === "Explicitly Labeled").length, color: "text-primary" },
  { label: "Derived from Scale", value: takeoffData.filter(r => r.method === "Derived from Scale").length, color: "text-warning" },
  { label: "Needs Review", value: takeoffData.filter(r => r.status === "Needs Review").length, color: "text-warning" },
  { label: "Avg Confidence", value: `${Math.round((takeoffData.filter(r => r.confidence === "High").length / takeoffData.length) * 100)}%`, color: "text-primary" },
];

export default function TakeoffPage() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const needsReview = takeoffData.filter(r => r.status === "Needs Review" || r.confidence === "Low");

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Plan-Derived Takeoff</h1>
          <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Structured quantity extraction from uploaded plans</p>
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

        <div className="flex gap-6 flex-col xl:flex-row">
          {/* Main Table */}
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
                      <tr
                        key={row.id}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                      >
                        <td className="pl-3 py-3">
                          <ChevronDown size={14} className={`text-muted-foreground transition-transform ${expandedRow === row.id ? "rotate-180" : ""}`} />
                        </td>
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
                                  <div className="bg-muted/40 rounded-md p-2">
                                    <span className="text-muted-foreground">Formula:</span>
                                    <div className="font-mono text-foreground mt-1">{row.detail.formula}</div>
                                  </div>
                                  <div className="bg-muted/40 rounded-md p-2">
                                    <span className="text-muted-foreground">Unit Conversion:</span>
                                    <div className="font-mono text-foreground mt-1">{row.detail.unitConversion}</div>
                                  </div>
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
                                  <Button size="sm" variant="default" className="text-xs h-7">
                                    <CheckCircle size={12} className="mr-1" /> Confirm
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs h-7">
                                    <Pencil size={12} className="mr-1" /> Adjust
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs h-7">
                                    <Flag size={12} className="mr-1" /> Flag
                                  </Button>
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

          {/* Review Panel */}
          <div className="xl:w-72 shrink-0 space-y-4">
            <div className="bg-card border border-border rounded-xl shadow-card p-4">
              <h3 className="font-display font-semibold text-sm text-foreground mb-3">Items Requiring Review</h3>
              <div className="space-y-2">
                {needsReview.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setExpandedRow(item.id)}
                    className="w-full text-left p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-xs font-medium text-foreground">{item.description}</p>
                    <div className="flex gap-1.5 mt-1">
                      <ConfidenceBadge level={item.confidence} />
                      <ReviewStatusBadge status={item.status} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-card p-4">
              <h3 className="font-display font-semibold text-sm text-foreground mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                  <CheckCircle size={12} className="mr-1.5" /> Confirm all high-confidence
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                  <AlertTriangle size={12} className="mr-1.5" /> Review scale-derived items
                </Button>
                <Button size="sm" className="w-full text-xs justify-start">
                  Send to Estimate Builder →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
