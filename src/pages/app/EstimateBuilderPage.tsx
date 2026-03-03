import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Download, Filter, Search, Plus, ChevronDown, CheckCircle, Pencil, Flag, Bot, X } from "lucide-react";
import { useState } from "react";
import { ExtractionMethodBadge } from "@/components/app/traceability/ExtractionMethodBadge";
import { ReviewStatusBadge } from "@/components/app/traceability/ReviewStatusBadge";
import { ConfidenceBadge } from "@/components/app/traceability/ConfidenceBadge";
import { PlanReferenceChip } from "@/components/app/traceability/PlanReferenceChip";
import { PricingBasisCard } from "@/components/app/traceability/PricingBasisCard";
import { AssumptionsDrawer } from "@/components/app/traceability/AssumptionsDrawer";

type ExtractionMethod = "Explicitly Labeled" | "Derived from Scale" | "Schedule Verified" | "Assumption Applied";
type ReviewStatus = "Auto-Extracted" | "Needs Review" | "Estimator Confirmed" | "Adjusted by User";
type Confidence = "High" | "Medium" | "Low";

interface LineItem {
  code: string; trade: string; desc: string; qty: number; unit: string; unitCost: number; labor: number; material: number; markup: number; contingency: number;
  source: ExtractionMethod; confidence: Confidence; reviewStatus: ReviewStatus; sheet: string;
  pricing: { source: string; region: string; basisDate: string; rangeLow: number; rangeHigh: number; selected: number; volatility: "Stable" | "Moderate" | "Volatile" };
  assumptions: { label: string; value: string }[];
  quantityDetail: { formula: string; conversion: string; wasteFactor: string };
}

const lineItems: LineItem[] = [
  { code: "03 30 00", trade: "Concrete", desc: "Foundation footings", qty: 1, unit: "LS", unitCost: 12400, labor: 6200, material: 6200, markup: 10, contingency: 5,
    source: "Explicitly Labeled", confidence: "High", reviewStatus: "Estimator Confirmed", sheet: "S1.1",
    pricing: { source: "Regional database", region: "Midwest", basisDate: "Q1 2026", rangeLow: 11200, rangeHigh: 14800, selected: 12400, volatility: "Stable" },
    assumptions: [{ label: "Labor production", value: "8 CY/day crew rate" }, { label: "Material coverage", value: "Ready-mix @ $165/CY" }, { label: "Exclusions", value: "Rebar separate line" }],
    quantityDetail: { formula: "Footing volume from structural plan", conversion: "CF to CY ÷ 27", wasteFactor: "5%" }},
  { code: "06 10 00", trade: "Rough Carpentry", desc: "Framing – addition", qty: 2800, unit: "SF", unitCost: 8.50, labor: 15200, material: 8600, markup: 12, contingency: 5,
    source: "Derived from Scale", confidence: "Medium", reviewStatus: "Needs Review", sheet: "A1.1",
    pricing: { source: "Historical projects", region: "Midwest", basisDate: "Q4 2025", rangeLow: 7.80, rangeHigh: 10.20, selected: 8.50, volatility: "Moderate" },
    assumptions: [{ label: "Wall height", value: "10 ft assumed from section" }, { label: "Lumber grade", value: "#2 SPF" }, { label: "Markup rationale", value: "12% for complexity" }],
    quantityDetail: { formula: "Perimeter × height from scaled plan", conversion: "Direct SF", wasteFactor: "8% framing waste" }},
  { code: "07 21 00", trade: "Insulation", desc: "Batt insulation – walls & ceiling", qty: 2400, unit: "SF", unitCost: 2.25, labor: 2100, material: 3300, markup: 10, contingency: 3,
    source: "Assumption Applied", confidence: "Medium", reviewStatus: "Auto-Extracted", sheet: "A1.1",
    pricing: { source: "Supplier quote", region: "Midwest", basisDate: "Q1 2026", rangeLow: 1.90, rangeHigh: 2.80, selected: 2.25, volatility: "Stable" },
    assumptions: [{ label: "R-value", value: "R-19 walls, R-38 ceiling" }, { label: "Coverage", value: "Assumes all ext. walls + ceiling" }],
    quantityDetail: { formula: "Wall SF + ceiling SF from plan areas", conversion: "Direct SF", wasteFactor: "3%" }},
  { code: "09 29 00", trade: "Drywall", desc: "Drywall – hang, tape, finish", qty: 3200, unit: "SF", unitCost: 3.80, labor: 7800, material: 4360, markup: 10, contingency: 3,
    source: "Derived from Scale", confidence: "Medium", reviewStatus: "Needs Review", sheet: "A1.1",
    pricing: { source: "Regional database", region: "Midwest", basisDate: "Q1 2026", rangeLow: 3.40, rangeHigh: 4.50, selected: 3.80, volatility: "Stable" },
    assumptions: [{ label: "Finish level", value: "Level 4 standard" }, { label: "Coverage", value: "Both sides interior partitions" }],
    quantityDetail: { formula: "320 LF walls × 10 ft height", conversion: "Direct SF", wasteFactor: "5%" }},
  { code: "09 65 00", trade: "Flooring", desc: "LVP flooring – main level", qty: 1400, unit: "SF", unitCost: 7.50, labor: 4200, material: 6300, markup: 10, contingency: 3,
    source: "Explicitly Labeled", confidence: "High", reviewStatus: "Estimator Confirmed", sheet: "A1.1",
    pricing: { source: "Supplier quote", region: "Midwest", basisDate: "Q1 2026", rangeLow: 6.50, rangeHigh: 9.00, selected: 7.50, volatility: "Moderate" },
    assumptions: [{ label: "Product", value: "Mid-tier LVP, click-lock" }, { label: "Subfloor prep", value: "Included in labor" }],
    quantityDetail: { formula: "Floor plan area measured", conversion: "Direct SF", wasteFactor: "7%" }},
  { code: "22 10 00", trade: "Plumbing", desc: "Rough & finish plumbing", qty: 1, unit: "LS", unitCost: 18500, labor: 11100, material: 7400, markup: 10, contingency: 5,
    source: "Schedule Verified", confidence: "High", reviewStatus: "Estimator Confirmed", sheet: "P1.1",
    pricing: { source: "Sub quote", region: "Midwest", basisDate: "Q1 2026", rangeLow: 16200, rangeHigh: 21000, selected: 18500, volatility: "Stable" },
    assumptions: [{ label: "Fixtures", value: "Per plumbing schedule" }, { label: "Exclusions", value: "Gas piping excluded" }],
    quantityDetail: { formula: "Lump sum from fixture schedule", conversion: "N/A", wasteFactor: "N/A" }},
  { code: "23 00 00", trade: "HVAC", desc: "HVAC system – addition", qty: 1, unit: "LS", unitCost: 14200, labor: 7100, material: 7100, markup: 10, contingency: 8,
    source: "Assumption Applied", confidence: "Low", reviewStatus: "Needs Review", sheet: "M1.1",
    pricing: { source: "Allowance", region: "Midwest", basisDate: "Q4 2025", rangeLow: 14200, rangeHigh: 22000, selected: 14200, volatility: "Volatile" },
    assumptions: [{ label: "System type", value: "Forced air assumed" }, { label: "Ductwork", value: "Bundled — not itemized separately" }, { label: "Contingency rationale", value: "8% for scope uncertainty" }],
    quantityDetail: { formula: "Allowance based on SF and system type", conversion: "N/A", wasteFactor: "N/A" }},
  { code: "26 00 00", trade: "Electrical", desc: "Electrical – panels, circuits, fixtures", qty: 1, unit: "LS", unitCost: 16800, labor: 10080, material: 6720, markup: 10, contingency: 5,
    source: "Explicitly Labeled", confidence: "High", reviewStatus: "Estimator Confirmed", sheet: "E1.1",
    pricing: { source: "Sub quote", region: "Midwest", basisDate: "Q1 2026", rangeLow: 15000, rangeHigh: 19500, selected: 16800, volatility: "Stable" },
    assumptions: [{ label: "Panel", value: "200A main panel upgrade" }, { label: "Circuits", value: "Per electrical plan" }],
    quantityDetail: { formula: "Lump sum from electrical plan", conversion: "N/A", wasteFactor: "N/A" }},
  { code: "31 20 00", trade: "Earthwork", desc: "Excavation & grading", qty: 1, unit: "LS", unitCost: 8600, labor: 5160, material: 3440, markup: 8, contingency: 5,
    source: "Derived from Scale", confidence: "Medium", reviewStatus: "Auto-Extracted", sheet: "C1.1",
    pricing: { source: "Historical projects", region: "Midwest", basisDate: "Q4 2025", rangeLow: 7200, rangeHigh: 11000, selected: 8600, volatility: "Moderate" },
    assumptions: [{ label: "Soil type", value: "Standard assumed" }, { label: "Haul distance", value: "10 mi assumed" }],
    quantityDetail: { formula: "Footprint area × depth from site plan", conversion: "CY calculated", wasteFactor: "10%" }},
  { code: "32 10 00", trade: "Paving", desc: "Driveway repair & patch", qty: 400, unit: "SF", unitCost: 6.00, labor: 1440, material: 960, markup: 10, contingency: 3,
    source: "Derived from Scale", confidence: "Low", reviewStatus: "Needs Review", sheet: "C1.1",
    pricing: { source: "Regional database", region: "Midwest", basisDate: "Q1 2026", rangeLow: 5.00, rangeHigh: 8.50, selected: 6.00, volatility: "Moderate" },
    assumptions: [{ label: "Material", value: "Asphalt patch assumed" }, { label: "Base prep", value: "Included" }],
    quantityDetail: { formula: "Area from site plan scale", conversion: "Direct SF", wasteFactor: "5%" }},
];

type FilterType = "All" | "Needs Review" | "Derived from Scale" | "Low Confidence" | "Confirmed" | "Pricing Outliers";
const filterOptions: FilterType[] = ["All", "Needs Review", "Derived from Scale", "Low Confidence", "Confirmed", "Pricing Outliers"];

export default function EstimateBuilderPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = lineItems.filter((l) => {
    const matchesSearch = l.desc.toLowerCase().includes(search.toLowerCase()) || l.trade.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === "All") return true;
    if (activeFilter === "Needs Review") return l.reviewStatus === "Needs Review";
    if (activeFilter === "Derived from Scale") return l.source === "Derived from Scale";
    if (activeFilter === "Low Confidence") return l.confidence === "Low";
    if (activeFilter === "Confirmed") return l.reviewStatus === "Estimator Confirmed";
    if (activeFilter === "Pricing Outliers") return l.pricing.volatility === "Volatile";
    return true;
  });

  const formatCurrency = (n: number) => `$${n.toLocaleString()}`;
  const subtotal = lineItems.reduce((s, l) => {
    const total = l.unit === "LS" ? l.unitCost : l.qty * l.unitCost;
    return s + total;
  }, 0);

  const summaryItems = [
    { label: "Total Line Items", value: lineItems.length, color: "text-foreground" },
    { label: "Auto-Extracted", value: lineItems.filter(l => l.reviewStatus === "Auto-Extracted").length, color: "text-info" },
    { label: "Needs Review", value: lineItems.filter(l => l.reviewStatus === "Needs Review").length, color: "text-warning" },
    { label: "Confirmed", value: lineItems.filter(l => l.reviewStatus === "Estimator Confirmed").length, color: "text-primary" },
    { label: "Low Confidence", value: lineItems.filter(l => l.confidence === "Low").length, color: "text-destructive" },
  ];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Estimate Builder</h1>
            <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — v2.1 · Evidence-backed estimate logic</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Filter size={14} className="mr-1.5" /> Filter</Button>
            <Button variant="outline" size="sm"><Download size={14} className="mr-1.5" /> Export</Button>
            <Button size="sm"><Plus size={14} className="mr-1.5" /> Add Line</Button>
          </div>
        </div>

        {/* Evidence Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {summaryItems.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-lg p-3 shadow-card text-center">
              <p className={`font-display text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Chips + Search */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 max-w-sm">
            <Search size={16} className="text-muted-foreground" />
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search line items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {filterOptions.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  activeFilter === f ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-8" />
                  {["Code", "Trade", "Description", "Qty", "Unit", "Unit Cost", "Total", "Source", "Confidence", "Status"].map((h) => (
                    <th key={h} className="text-left px-3 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const base = l.unit === "LS" ? l.unitCost : l.qty * l.unitCost;
                  const total = base * (1 + l.markup / 100) * (1 + l.contingency / 100);
                  const isExpanded = expandedRow === l.code;
                  return (
                    <>
                      <tr
                        key={l.code}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setExpandedRow(isExpanded ? null : l.code)}
                      >
                        <td className="pl-3 py-3">
                          <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{l.code}</td>
                        <td className="px-3 py-3 font-medium text-foreground whitespace-nowrap">{l.trade}</td>
                        <td className="px-3 py-3 text-foreground">{l.desc}</td>
                        <td className="px-3 py-3 text-muted-foreground">{l.qty.toLocaleString()}</td>
                        <td className="px-3 py-3 text-muted-foreground">{l.unit}</td>
                        <td className="px-3 py-3 text-foreground">{l.unit === "LS" ? formatCurrency(l.unitCost) : `$${l.unitCost.toFixed(2)}`}</td>
                        <td className="px-3 py-3 font-display font-semibold text-foreground">{formatCurrency(Math.round(total))}</td>
                        <td className="px-3 py-3"><ExtractionMethodBadge method={l.source} /></td>
                        <td className="px-3 py-3"><ConfidenceBadge level={l.confidence} /></td>
                        <td className="px-3 py-3"><ReviewStatusBadge status={l.reviewStatus} /></td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${l.code}-detail`} className="border-b border-border bg-muted/10">
                          <td colSpan={11} className="p-4">
                            <div className="grid md:grid-cols-3 gap-4 text-xs">
                              {/* Quantity Source */}
                              <div className="space-y-3">
                                <h4 className="font-display font-semibold text-foreground text-sm">Quantity Source</h4>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between"><span className="text-muted-foreground">Plan Reference</span><PlanReferenceChip sheet={l.sheet} /></div>
                                  <div className="flex justify-between"><span className="text-muted-foreground">Method</span><ExtractionMethodBadge method={l.source} /></div>
                                  <div className="bg-muted/40 rounded-md p-2 mt-2">
                                    <span className="text-muted-foreground">Formula:</span>
                                    <div className="font-mono text-foreground mt-1">{l.quantityDetail.formula}</div>
                                  </div>
                                  <div className="bg-muted/40 rounded-md p-2">
                                    <span className="text-muted-foreground">Conversion:</span>
                                    <div className="font-mono text-foreground mt-1">{l.quantityDetail.conversion}</div>
                                  </div>
                                  <div><span className="text-muted-foreground">Waste Factor:</span> <span className="text-foreground">{l.quantityDetail.wasteFactor}</span></div>
                                </div>
                              </div>

                              {/* Pricing Basis */}
                              <div className="space-y-3">
                                <h4 className="font-display font-semibold text-foreground text-sm">Pricing & Assumptions</h4>
                                <PricingBasisCard {...l.pricing} />
                                <AssumptionsDrawer assumptions={l.assumptions} />
                              </div>

                              {/* Review */}
                              <div className="space-y-3">
                                <h4 className="font-display font-semibold text-foreground text-sm">Review</h4>
                                <div className="flex items-center gap-2 mb-2">
                                  <ReviewStatusBadge status={l.reviewStatus} />
                                  <ConfidenceBadge level={l.confidence} />
                                </div>
                                <div className="bg-card border border-border rounded-lg p-3">
                                  <label className="text-muted-foreground block mb-1 text-[10px]">Estimator Comment</label>
                                  <textarea className="w-full bg-muted/20 rounded-md text-xs p-2 outline-none resize-none h-12 text-foreground" placeholder="Add notes..." />
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  <Button size="sm" variant="default" className="text-xs h-7"><CheckCircle size={11} className="mr-1" /> Confirm</Button>
                                  <Button size="sm" variant="outline" className="text-xs h-7"><Pencil size={11} className="mr-1" /> Adjust</Button>
                                  <Button size="sm" variant="outline" className="text-xs h-7"><Flag size={11} className="mr-1" /> Follow-up</Button>
                                  <Button size="sm" variant="outline" className="text-xs h-7"><X size={11} className="mr-1" /> Exclude</Button>
                                  <Button size="sm" variant="outline" className="text-xs h-7"><Bot size={11} className="mr-1" /> Ask Atlas</Button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border bg-muted/30 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{filtered.length} line items</span>
            <span className="font-display font-bold text-foreground">Subtotal: {formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
