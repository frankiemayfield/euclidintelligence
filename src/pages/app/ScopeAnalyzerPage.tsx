import { AppLayout } from "@/components/app/AppLayout";
import {
  AlertTriangle, CheckCircle, FileSearch, Info, XCircle, ChevronDown, ChevronRight,
  Pencil, Flag, Send, Mail, Layers, GitMerge, Split, Copy, Trash2, Settings2,
  Package, ClipboardList, ArrowRight, Filter, Eye, EyeOff, Save, Check, Hammer
} from "lucide-react";
import { WorkflowTransition } from "@/components/app/WorkflowTransition";
import { PlanReferenceChip } from "@/components/app/traceability/PlanReferenceChip";
import { ExtractionMethodBadge } from "@/components/app/traceability/ExtractionMethodBadge";
import { ReviewStatusBadge } from "@/components/app/traceability/ReviewStatusBadge";
import { ConfidenceBadge } from "@/components/app/traceability/ConfidenceBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Types
type ExtractionMethod = "Explicitly Labeled" | "Derived from Scale" | "Schedule Verified" | "Assumption Applied";
type ReviewStatus = "Auto-Extracted" | "Needs Review" | "Estimator Confirmed" | "Adjusted by User";
type Confidence = "High" | "Medium" | "Low";
type EstimateSection = "Pre-Build Requirements" | "Base Scope" | "General Requirements" | "Allowance" | "Selection Placeholder" | "Alternate / Option";
type StructureStatus = "Mapped" | "Unmapped" | "Duplicate Candidate" | "Deferred" | "Confirmed";

interface TakeoffRow {
  id: number; division: string; description: string; qty: number; unit: string; sheet: string;
  method: ExtractionMethod; confidence: Confidence; status: ReviewStatus;
  costCode: string; trade: string; estimateSection: EstimateSection; structureStatus: StructureStatus;
  detail: { sourceType: string; sheetRef: string; detectionNote: string; formula: string; unitConversion: string; assumptionNotes: string; confidenceExplanation: string; };
}

interface ScopeItem {
  message: string; trade: string; affectedItem: string; sheet: string; issueType: string; atlasNote: string; recommendation: string;
}

interface SubScopeLineItem {
  description: string; qty: number; unit: string; costCode: string; notes: string;
}

interface SubScopePackage {
  trade: string; status: "Draft" | "Sent" | "Awaiting Bid" | "Bid Received";
  subName: string; scopeDescription: string;
  lineItems: SubScopeLineItem[];
  exclusions: string[];
  clarifications: string[];
}

// Takeoff data with structure fields
const takeoffData: TakeoffRow[] = [
  { id: 1, division: "03 30 00", description: "Concrete slab — main level", qty: 12.8, unit: "CY", sheet: "A2.1", method: "Explicitly Labeled", confidence: "High", status: "Estimator Confirmed", costCode: "03-300", trade: "Concrete", estimateSection: "Base Scope", structureStatus: "Confirmed",
    detail: { sourceType: "Plan callout", sheetRef: "Sheet A2.1 — Foundation Plan", detectionNote: "Slab note indicates 4\" thickness, area bounded by gridlines A–D / 1–5", formula: "1,000 SF × 0.33 ft = 330 CF", unitConversion: "330 CF ÷ 27 = 12.2 CY + 5% waste = 12.8 CY", assumptionNotes: "Waste factor: 5% per standard practice", confidenceExplanation: "Area explicitly dimensioned on plan. Thickness noted in slab detail." }},
  { id: 2, division: "03 30 00", description: "Foundation footing — perimeter", qty: 8.4, unit: "CY", sheet: "S1.1", method: "Derived from Scale", confidence: "Medium", status: "Needs Review", costCode: "03-300", trade: "Concrete", estimateSection: "Base Scope", structureStatus: "Mapped",
    detail: { sourceType: "Scaled measurement", sheetRef: "Sheet S1.1 — Structural Foundation", detectionNote: "Footing width measured from scale bar. Depth assumed from typical detail.", formula: "180 LF × 2 ft × 1.5 ft = 540 CF", unitConversion: "540 CF ÷ 27 = 20 CY, footing only portion = 8.4 CY", assumptionNotes: "Depth assumed 18\" from standard residential footing. Verify with structural.", confidenceExplanation: "Width derived from scale — not explicitly dimensioned. Depth is assumed." }},
  { id: 3, division: "07 31 00", description: "Roof shingles — architectural", qty: 14.2, unit: "SQ", sheet: "A4.1", method: "Explicitly Labeled", confidence: "High", status: "Estimator Confirmed", costCode: "07-310", trade: "Roofing", estimateSection: "Base Scope", structureStatus: "Confirmed",
    detail: { sourceType: "Plan callout + schedule", sheetRef: "Sheet A4.1 — Roof Plan", detectionNote: "Roof area calculated from plan outline. Pitch multiplier from elevation.", formula: "1,200 SF plan area × 1.118 (6:12 pitch) = 1,341 SF", unitConversion: "1,341 SF ÷ 100 = 13.4 SQ + 6% waste = 14.2 SQ", assumptionNotes: "6:12 pitch confirmed from Section A-A. Waste factor: 6%", confidenceExplanation: "Roof outline dimensioned. Pitch confirmed from building section." }},
  { id: 4, division: "06 10 00", description: "2×4 wall framing — exterior", qty: 1420, unit: "LF", sheet: "A1.1", method: "Derived from Scale", confidence: "Medium", status: "Needs Review", costCode: "06-100", trade: "Framing", estimateSection: "Base Scope", structureStatus: "Mapped",
    detail: { sourceType: "Scaled perimeter", sheetRef: "Sheet A1.1 — Floor Plan", detectionNote: "Exterior wall perimeter measured from floor plan scale", formula: "Perimeter 142 LF × 10 ft wall height ÷ 1 = 1,420 LF top/bottom plate", unitConversion: "LF of plate — studs calculated separately", assumptionNotes: "Wall height assumed 10 ft from section. Interior partitions excluded.", confidenceExplanation: "Perimeter from scale, not dimensioned. Wall height from section detail." }},
  { id: 5, division: "09 29 00", description: "Drywall — interior partitions", qty: 3200, unit: "SF", sheet: "A1.1", method: "Assumption Applied", confidence: "Medium", status: "Auto-Extracted", costCode: "09-290", trade: "Drywall", estimateSection: "Base Scope", structureStatus: "Mapped",
    detail: { sourceType: "Calculated from wall lengths", sheetRef: "Sheet A1.1 — Floor Plan", detectionNote: "Interior partition lengths totaled and multiplied by ceiling height", formula: "320 LF walls × 10 ft height = 3,200 SF", unitConversion: "Direct SF — no conversion needed", assumptionNotes: "Assumes all interior walls receive drywall both sides. Ceiling drywall excluded.", confidenceExplanation: "Wall lengths measured from plan. Single-side assumption needs verification." }},
  { id: 6, division: "08 14 00", description: "Interior doors — solid core", qty: 12, unit: "EA", sheet: "A5.1", method: "Schedule Verified", confidence: "High", status: "Estimator Confirmed", costCode: "08-140", trade: "Finish Carpentry", estimateSection: "Base Scope", structureStatus: "Confirmed",
    detail: { sourceType: "Door schedule", sheetRef: "Sheet A5.1 — Door Schedule", detectionNote: "Door schedule lists 12 interior doors (D101–D112). All solid core per spec.", formula: "Direct count from schedule", unitConversion: "No conversion — EA count", assumptionNotes: "Hardware included per door schedule notes. Frames assumed hollow metal.", confidenceExplanation: "Door schedule complete and cross-referenced with floor plan symbols." }},
  { id: 7, division: "08 50 00", description: "Windows — double-hung vinyl", qty: 8, unit: "EA", sheet: "A5.2", method: "Schedule Verified", confidence: "High", status: "Estimator Confirmed", costCode: "08-500", trade: "Windows", estimateSection: "Base Scope", structureStatus: "Confirmed",
    detail: { sourceType: "Window schedule", sheetRef: "Sheet A5.2 — Window Schedule", detectionNote: "Window schedule lists 8 windows (W1–W8). Sizes and types confirmed.", formula: "Direct count from schedule", unitConversion: "No conversion — EA count", assumptionNotes: "Low-E glass per energy spec. Installation hardware included.", confidenceExplanation: "Window schedule complete with sizes. Cross-referenced with elevations." }},
  { id: 8, division: "06 20 00", description: "Base trim — painted MDF", qty: 480, unit: "LF", sheet: "A1.1", method: "Derived from Scale", confidence: "Low", status: "Needs Review", costCode: "06-200", trade: "Finish Carpentry", estimateSection: "Base Scope", structureStatus: "Unmapped",
    detail: { sourceType: "Scaled room perimeters", sheetRef: "Sheet A1.1 — Floor Plan", detectionNote: "Room perimeters measured from scale. Openings deducted.", formula: "Total room perimeters 520 LF − 40 LF openings = 480 LF", unitConversion: "Direct LF — no conversion needed", assumptionNotes: "MDF assumed from finish schedule note. 3.25\" profile assumed standard.", confidenceExplanation: "Perimeters from scale, not dimensioned. Opening deductions estimated." }},
  { id: 9, division: "04 21 00", description: "Brick veneer — front elevation", qty: 680, unit: "SF", sheet: "A3.1", method: "Derived from Scale", confidence: "Medium", status: "Needs Review", costCode: "04-210", trade: "Masonry", estimateSection: "Base Scope", structureStatus: "Mapped",
    detail: { sourceType: "Scaled elevation", sheetRef: "Sheet A3.1 — Front Elevation", detectionNote: "Brick area measured from front elevation. Windows deducted.", formula: "Front wall 42 LF × 20 ft height = 840 SF − 160 SF openings = 680 SF", unitConversion: "Direct SF — no conversion needed", assumptionNotes: "Brick type per elevation note. Soldier course at openings assumed.", confidenceExplanation: "Elevation area from scale. Opening sizes from window schedule." }},
  { id: 10, division: "23 37 00", description: "HVAC diffusers — ceiling mount", qty: 14, unit: "EA", sheet: "M1.1", method: "Explicitly Labeled", confidence: "High", status: "Auto-Extracted", costCode: "23-370", trade: "HVAC", estimateSection: "Base Scope", structureStatus: "Mapped",
    detail: { sourceType: "Mechanical plan symbols", sheetRef: "Sheet M1.1 — Mechanical Plan", detectionNote: "14 supply diffuser symbols identified on mechanical plan", formula: "Direct count from plan symbols", unitConversion: "No conversion — EA count", assumptionNotes: "Size assumed 12×12 from typical. Return grilles counted separately.", confidenceExplanation: "Symbols clearly marked on mechanical plan. Count cross-verified." }},
  { id: 11, division: "01 50 00", description: "Temporary power & utilities", qty: 1, unit: "LS", sheet: "—", method: "Assumption Applied", confidence: "Low", status: "Needs Review", costCode: "01-500", trade: "General Conditions", estimateSection: "General Requirements", structureStatus: "Unmapped",
    detail: { sourceType: "Inferred", sheetRef: "—", detectionNote: "No explicit temp power shown on plans; inferred from project type.", formula: "Lump sum estimate", unitConversion: "—", assumptionNotes: "Temporary power duration assumed 4 months. Metered service assumed.", confidenceExplanation: "No plan reference. Based on project type assumption." }},
  { id: 12, division: "09 91 00", description: "Interior paint — premium finish", qty: 4200, unit: "SF", sheet: "A1.1", method: "Derived from Scale", confidence: "Medium", status: "Auto-Extracted", costCode: "09-910", trade: "Painting", estimateSection: "Base Scope", structureStatus: "Duplicate Candidate",
    detail: { sourceType: "Calculated from wall + ceiling areas", sheetRef: "Sheet A1.1 — Floor Plan", detectionNote: "Wall areas + ceiling areas combined. Overlaps possible with drywall SF.", formula: "3,200 SF walls + 1,000 SF ceilings = 4,200 SF", unitConversion: "Direct SF", assumptionNotes: "Two coats assumed. Primer coat excluded from SF count.", confidenceExplanation: "Area calculation may overlap with drywall quantity." }},
];

// Scope issues with duplicate category
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
  { title: "Duplicate / Overlapping Scope", icon: Copy, severity: "high", items: [
    { message: "Demolition scope appears in both General Conditions and Earthwork", trade: "Multiple", affectedItem: "Div 01 / Div 31", sheet: "C1.1", issueType: "Duplicate Scope", atlasNote: "Demolition labor appears under both General Conditions and Earthwork line items. Potential double-count of $2,400.", recommendation: "Consolidate demolition under one trade in Estimate Builder." },
    { message: "Paint prep labor overlaps with drywall finish scope", trade: "Painting / Drywall", affectedItem: "Div 09", sheet: "A1.1", issueType: "Duplicate Scope", atlasNote: "Drywall finish includes Level 4 prep, which may overlap with painting prep labor.", recommendation: "Verify with subs to avoid double-billing." },
    { message: "Interior paint SF (4,200) may include drywall area already counted", trade: "Painting", affectedItem: "Div 09 — Paint", sheet: "A1.1", issueType: "Duplicate Scope", atlasNote: "Paint SF includes wall + ceiling areas that overlap with drywall takeoff. Risk of quantity confusion in pricing.", recommendation: "Clarify paint SF excludes drywall overlap or mark as paint-specific." },
  ]},
  { title: "Likely Exclusions Needed", icon: Info, severity: "low", items: [
    { message: "Furniture, fixtures & equipment (FF&E)", trade: "—", affectedItem: "—", sheet: "—", issueType: "Exclusion Risk", atlasNote: "FF&E is not included in the current scope. Should be explicitly listed as an exclusion.", recommendation: "Add to exclusions list in Proposal Export." },
    { message: "Landscaping restoration after construction", trade: "Landscaping", affectedItem: "Div 32", sheet: "C1.1", issueType: "Exclusion Risk", atlasNote: "Site plan shows landscaping but no restoration scope is included.", recommendation: "Clarify with owner or add to exclusions." },
    { message: "Permit fees and impact fees", trade: "General Conditions", affectedItem: "Div 01", sheet: "—", issueType: "Exclusion Risk", atlasNote: "Permit fees vary by jurisdiction. Should be owner responsibility or explicitly included.", recommendation: "Add to exclusions or confirm with owner." },
  ]},
];

// Sub scope packages with line items
const subScopePackages: SubScopePackage[] = [
  {
    trade: "Electrical", status: "Bid Received", subName: "Spark Electric Co.",
    scopeDescription: "Provide all electrical rough-in, finish, and service for kitchen remodel. Includes panel upgrade, new circuits for appliances, LED recessed lighting, and undercabinet lighting. Excludes fixtures furnished by owner.",
    lineItems: [
      { description: "Panel upgrade — 200A service", qty: 1, unit: "LS", costCode: "26-100", notes: "Existing 100A panel to be replaced" },
      { description: "New 20A circuits — kitchen appliances", qty: 4, unit: "EA", costCode: "26-200", notes: "Dedicated circuits for range, DW, micro, disposal" },
      { description: "LED recessed lighting — 6\" IC rated", qty: 8, unit: "EA", costCode: "26-500", notes: "Per reflected ceiling plan" },
      { description: "Undercabinet LED strips", qty: 24, unit: "LF", costCode: "26-500", notes: "Hardwired, dimmable per spec" },
    ],
    exclusions: ["Owner-furnished fixtures", "Low voltage / data cabling", "Permit fees"],
    clarifications: ["All work per 2023 NEC", "Assumes open-wall access during rough-in phase"],
  },
  {
    trade: "Plumbing", status: "Sent", subName: "AquaFlow Plumbing",
    scopeDescription: "Provide all plumbing rough-in and finish for kitchen remodel. Includes sink relocation, dishwasher connection, gas line for range, and ice maker line. Excludes fixtures unless noted.",
    lineItems: [
      { description: "Kitchen sink rough-in — relocated 4 ft", qty: 1, unit: "LS", costCode: "22-100", notes: "New location per plan A1.1" },
      { description: "Dishwasher connection", qty: 1, unit: "EA", costCode: "22-100", notes: "Supply + drain" },
      { description: "Gas line — range connection", qty: 1, unit: "EA", costCode: "22-200", notes: "Flex connector, shutoff valve" },
      { description: "Ice maker water line", qty: 1, unit: "EA", costCode: "22-100", notes: "1/4\" copper to fridge location" },
    ],
    exclusions: ["Fixtures (owner-furnished)", "Water heater", "Exterior plumbing"],
    clarifications: ["Assumes floor access for rerouting", "Gas pressure test included"],
  },
  {
    trade: "HVAC", status: "Draft", subName: "",
    scopeDescription: "Provide HVAC modifications for kitchen remodel area. Includes duct rerouting, new supply registers, and exhaust fan connection.",
    lineItems: [
      { description: "Duct rerouting — kitchen area", qty: 1, unit: "LS", costCode: "23-300", notes: "Relocate supply duct around new island" },
      { description: "Supply registers — ceiling mount", qty: 3, unit: "EA", costCode: "23-370", notes: "Per mechanical plan M1.1" },
      { description: "Range hood exhaust duct", qty: 1, unit: "LS", costCode: "23-300", notes: "6\" duct to exterior wall" },
    ],
    exclusions: ["Range hood unit (by owner)", "Equipment replacement"],
    clarifications: ["Existing system capacity assumed adequate", "Damper balancing included"],
  },
  {
    trade: "Drywall", status: "Awaiting Bid", subName: "SmoothWall Inc.",
    scopeDescription: "Provide drywall installation for all new and modified interior partitions in kitchen remodel area. Level 4 finish throughout. Includes patching at demolished walls.",
    lineItems: [
      { description: "New partition drywall — 5/8\" Type X", qty: 640, unit: "SF", costCode: "09-290", notes: "Both sides, new walls" },
      { description: "Ceiling drywall — 1/2\"", qty: 280, unit: "SF", costCode: "09-290", notes: "Kitchen + pantry ceiling" },
      { description: "Patch & repair at demo locations", qty: 120, unit: "SF", costCode: "09-290", notes: "Blend into existing" },
      { description: "Level 4 finish — all surfaces", qty: 1040, unit: "SF", costCode: "09-290", notes: "Sand, prime-ready" },
    ],
    exclusions: ["Painting", "Insulation", "Framing"],
    clarifications: ["Assumes framing complete and plumb", "Moisture-resistant board at sink wall"],
  },
  {
    trade: "Framing", status: "Bid Received", subName: "TrueFrame Carpentry",
    scopeDescription: "Provide all framing for kitchen remodel. Includes new partition walls, header at removed bearing wall, and blocking for cabinets.",
    lineItems: [
      { description: "New partition framing — 2×4 walls", qty: 64, unit: "LF", costCode: "06-100", notes: "Per floor plan A1.1" },
      { description: "LVL header — bearing wall removal", qty: 1, unit: "EA", costCode: "06-100", notes: "Per structural S1.1, 12 ft span" },
      { description: "Cabinet blocking — plywood", qty: 48, unit: "LF", costCode: "06-100", notes: "3/4\" plywood at 34\" and 54\" AFF" },
      { description: "Soffit framing — above cabinets", qty: 18, unit: "LF", costCode: "06-100", notes: "12\" deep × 12\" drop" },
    ],
    exclusions: ["Demo of existing walls", "Finish carpentry", "Hardware"],
    clarifications: ["LVL size per engineer's spec", "All lumber SPF #2 or better"],
  },
  {
    trade: "Roofing", status: "Draft", subName: "",
    scopeDescription: "Provide roofing repairs and tie-in at addition area. Includes shingle match, flashing, and underlayment at modified roof sections.",
    lineItems: [
      { description: "Shingle removal — tie-in area", qty: 2, unit: "SQ", costCode: "07-310", notes: "Carefully remove for reuse inspection" },
      { description: "New architectural shingles — match existing", qty: 4, unit: "SQ", costCode: "07-310", notes: "Color match to existing roof" },
      { description: "Step flashing at new wall", qty: 16, unit: "LF", costCode: "07-620", notes: "Aluminum step flashing" },
      { description: "Ice & water shield", qty: 60, unit: "SF", costCode: "07-310", notes: "At valleys and eaves" },
    ],
    exclusions: ["Gutters", "Skylights", "Full roof replacement"],
    clarifications: ["Assumes access via existing ladder points", "Weather-dependent scheduling"],
  },
];

const statusColors: Record<string, string> = {
  "Draft": "bg-muted text-muted-foreground",
  "Sent": "bg-info/10 text-info",
  "Awaiting Bid": "bg-warning/10 text-warning",
  "Bid Received": "bg-primary/10 text-primary",
};

const estimateSectionOptions: EstimateSection[] = ["Pre-Build Requirements", "Base Scope", "General Requirements", "Allowance", "Selection Placeholder", "Alternate / Option"];

const sectionColors: Record<EstimateSection, string> = {
  "Pre-Build Requirements": "bg-info/10 text-info",
  "Base Scope": "bg-primary/10 text-primary",
  "General Requirements": "bg-warning/10 text-warning",
  "Allowance": "bg-accent text-accent-foreground",
  "Selection Placeholder": "bg-muted text-muted-foreground",
  "Alternate / Option": "bg-secondary text-secondary-foreground",
};

const structureStatusColors: Record<StructureStatus, string> = {
  "Mapped": "bg-info/10 text-info",
  "Unmapped": "bg-warning/10 text-warning",
  "Duplicate Candidate": "bg-destructive/10 text-destructive",
  "Deferred": "bg-muted text-muted-foreground",
  "Confirmed": "bg-primary/10 text-primary",
};

export default function ScopeAnalyzerPage() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [structureFilter, setStructureFilter] = useState<string>("all");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState("overview");
  const [codeSystem] = useState("16-Division Default");
  const [transition, setTransition] = useState<"bid-leveling" | "estimate" | null>(null);

  const needsReview = takeoffData.filter(r => r.status === "Needs Review" || r.confidence === "Low");
  const mapped = takeoffData.filter(r => r.structureStatus === "Confirmed" || r.structureStatus === "Mapped");
  const unmapped = takeoffData.filter(r => r.structureStatus === "Unmapped");
  const duplicates = takeoffData.filter(r => r.structureStatus === "Duplicate Candidate");
  const assumptionItems = takeoffData.filter(r => r.method === "Assumption Applied" || r.method === "Derived from Scale" || r.confidence !== "High");

  const summaryCards = [
    { label: "Total Extracted", value: takeoffData.length, color: "text-foreground", filterKey: null },
    { label: "Explicitly Labeled", value: takeoffData.filter(r => r.method === "Explicitly Labeled").length, color: "text-primary", filterKey: "Explicitly Labeled" },
    { label: "Derived from Scale", value: takeoffData.filter(r => r.method === "Derived from Scale").length, color: "text-warning", filterKey: "Derived from Scale" },
    { label: "Needs Review", value: needsReview.length, color: "text-warning", filterKey: "Needs Review" },
    { label: "Issues Found", value: categories.reduce((s, c) => s + c.items.length, 0), color: "text-destructive", filterKey: "Issues" },
  ];

  const handleCardClick = (filterKey: string | null) => {
    if (filterKey === "Issues") {
      setActiveTab("scope-issues");
      setActiveFilter(null);
      return;
    }
    if (activeFilter === filterKey) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filterKey);
      if (filterKey && activeTab === "overview") setActiveTab("quantities");
    }
  };

  const getFilteredData = () => {
    let data = takeoffData;
    if (activeFilter === "Explicitly Labeled") data = data.filter(r => r.method === "Explicitly Labeled");
    else if (activeFilter === "Derived from Scale") data = data.filter(r => r.method === "Derived from Scale");
    else if (activeFilter === "Needs Review") data = data.filter(r => r.status === "Needs Review" || r.confidence === "Low");
    return data;
  };

  const getStructureFilteredData = () => {
    let data = takeoffData;
    if (structureFilter === "unmapped") data = data.filter(r => r.structureStatus === "Unmapped");
    else if (structureFilter === "mapped") data = data.filter(r => r.structureStatus === "Mapped" || r.structureStatus === "Confirmed");
    else if (structureFilter === "duplicate") data = data.filter(r => r.structureStatus === "Duplicate Candidate");
    else if (structureFilter === "deferred") data = data.filter(r => r.structureStatus === "Deferred");
    if (activeFilter === "Explicitly Labeled") data = data.filter(r => r.method === "Explicitly Labeled");
    else if (activeFilter === "Derived from Scale") data = data.filter(r => r.method === "Derived from Scale");
    else if (activeFilter === "Needs Review") data = data.filter(r => r.status === "Needs Review" || r.confidence === "Low");
    return data;
  };

  const toggleRowSelection = (id: number) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filteredData = getFilteredData();
  const structureData = getStructureFilteredData();

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Scope Analyzer</h1>
          <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Structure, validate, and prepare scope for estimating</p>
        </div>

        {/* Active Cost Code System */}
        <div className="flex items-center gap-3 mb-5 p-3 bg-card border border-border rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <Layers size={14} className="text-primary" />
            <span className="text-muted-foreground">Active Cost Code System:</span>
            <span className="font-semibold text-foreground">{codeSystem}</span>
          </div>
          <div className="ml-auto flex gap-1.5">
            <Button variant="ghost" size="sm" className="text-xs h-7"><Settings2 size={12} className="mr-1" />Change System</Button>
            <Button variant="ghost" size="sm" className="text-xs h-7"><Eye size={12} className="mr-1" />View Code Set</Button>
          </div>
        </div>

        {/* Summary Cards — clickable filters */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {summaryCards.map((c) => (
            <button
              key={c.label}
              onClick={() => handleCardClick(c.filterKey)}
              className={cn(
                "bg-card border rounded-2xl p-4 shadow-sm text-center transition-all hover:shadow-md",
                activeFilter === c.filterKey ? "border-primary ring-1 ring-primary/30" : "border-border"
              )}
            >
              <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
              <p className={cn("font-display text-2xl font-bold", c.color)}>{c.value}</p>
            </button>
          ))}
        </div>

        {activeFilter && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-primary/5 border border-primary/20 rounded-xl text-sm">
            <Filter size={13} className="text-primary" />
            <span className="text-foreground">Filtering by: <strong>{activeFilter}</strong></span>
            <button onClick={() => setActiveFilter(null)} className="ml-auto text-xs text-primary hover:underline">Clear filter</button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quantities">Quantities</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="scope-issues">Scope Issues</TabsTrigger>
            <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
            <TabsTrigger value="sub-scope">Sub Scope Export</TabsTrigger>
          </TabsList>

          {/* ═══════════ OVERVIEW TAB ═══════════ */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {/* Structuring Readiness */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                  <h3 className="font-display font-semibold text-foreground mb-3">Structuring Readiness</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Documents scanned & indexed", value: "4 documents", ok: true },
                      { label: "Total extracted items", value: `${takeoffData.length} items`, ok: true },
                      { label: "Mapped to cost codes", value: `${mapped.length} of ${takeoffData.length}`, ok: mapped.length === takeoffData.length },
                      { label: "Unmapped items", value: `${unmapped.length} items`, ok: unmapped.length === 0 },
                      { label: "Duplicate candidates", value: `${duplicates.length} items`, ok: duplicates.length === 0 },
                      { label: "Needs review", value: `${needsReview.length} items`, ok: needsReview.length === 0 },
                      { label: "Assumptions unresolved", value: `${assumptionItems.length} items`, ok: false },
                      { label: "Scope issues detected", value: `${categories.reduce((s, c) => s + c.items.length, 0)} issues`, ok: false },
                      { label: "Items assigned to Allowances", value: "0 items", ok: true },
                      { label: "Items assigned to General Requirements", value: `${takeoffData.filter(r => r.estimateSection === "General Requirements").length} items`, ok: true },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20">
                        <div className="flex items-center gap-2">
                          {item.ok ? <CheckCircle size={14} className="text-primary" /> : <AlertTriangle size={14} className="text-warning" />}
                          <span className="text-sm text-foreground">{item.label}</span>
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended next actions */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                  <h3 className="font-display font-semibold text-foreground mb-3">Recommended Next Actions</h3>
                  <div className="space-y-2">
                    {[
                      { text: `${unmapped.length} items still need cost code assignment`, action: "Go to Structure", tab: "structure" },
                      { text: `${duplicates.length} rows are likely duplicates`, action: "Review Duplicates", tab: "scope-issues" },
                      { text: "1 scope line should be reassigned to General Requirements", action: "Review Structure", tab: "structure" },
                      { text: `${mapped.length} lines ready to send to Estimate Builder`, action: "Send to Estimate Builder", tab: null },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20">
                        <span className="text-sm text-foreground">{item.text}</span>
                        <Button size="sm" variant="ghost" className="text-xs h-7 text-primary" onClick={() => item.tab && setActiveTab(item.tab)}>
                          {item.action} <ArrowRight size={11} className="ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ready controls */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                  <h3 className="font-display font-semibold text-foreground mb-2">Ready for next step?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Review structure, resolve scope issues, and confirm mappings before moving forward.</p>
                  <div className="flex gap-2">
                    <Button size="sm">Send to Estimate Builder <ArrowRight size={12} className="ml-1" /></Button>
                    <Button size="sm" variant="outline">Send to Bid Leveling <ArrowRight size={12} className="ml-1" /></Button>
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                  <h3 className="font-display font-semibold text-sm text-foreground mb-1">Readiness Summary</h3>
                  <p className="text-xs text-muted-foreground mb-3">Scope lines ready for downstream use</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Ready for Estimate Builder</span><span className="font-semibold text-primary">{takeoffData.filter(r => r.structureStatus === "Confirmed").length}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Ready to Send to Subs</span><span className="font-semibold text-primary">{subScopePackages.filter(p => p.status === "Draft" || p.status === "Sent").length}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Scope Packages Total</span><span className="font-semibold text-foreground">{subScopePackages.length}</span></div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl shadow-sm p-4">
                  <h3 className="font-display font-semibold text-sm text-foreground mb-3">Items Requiring Review</h3>
                  <div className="space-y-2">
                    {needsReview.map((item) => (
                      <button key={item.id} onClick={() => { setActiveTab("quantities"); setExpandedRow(item.id); }} className="w-full text-left p-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <p className="text-xs font-medium text-foreground">{item.description}</p>
                        <div className="flex gap-1.5 mt-1"><ConfidenceBadge level={item.confidence} /><ReviewStatusBadge status={item.status} /></div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════ QUANTITIES TAB ═══════════ */}
          <TabsContent value="quantities">
            <div className="flex gap-6 flex-col xl:flex-row">
              <div className="flex-1 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
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
                      {filteredData.map((row) => (
                        <>
                          <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}>
                            <td className="pl-3 py-3"><ChevronDown size={14} className={cn("text-muted-foreground transition-transform", expandedRow === row.id && "rotate-180")} /></td>
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
                                      <div className="bg-muted/40 rounded-xl p-2"><span className="text-muted-foreground">Formula:</span><div className="font-mono text-foreground mt-1">{row.detail.formula}</div></div>
                                      <div className="bg-muted/40 rounded-xl p-2"><span className="text-muted-foreground">Unit Conversion:</span><div className="font-mono text-foreground mt-1">{row.detail.unitConversion}</div></div>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <h4 className="font-display font-semibold text-foreground text-sm">Structure & Review</h4>
                                    <div className="space-y-2">
                                      <div><span className="text-muted-foreground">Cost Code:</span> <span className="text-foreground ml-1 font-mono">{row.costCode}</span></div>
                                      <div><span className="text-muted-foreground">Trade:</span> <span className="text-foreground ml-1">{row.trade}</span></div>
                                      <div><span className="text-muted-foreground">Estimate Section:</span> <span className={cn("ml-1 text-[10px] px-2 py-0.5 rounded-full font-semibold", sectionColors[row.estimateSection])}>{row.estimateSection}</span></div>
                                      <div><span className="text-muted-foreground">Assumptions:</span> <span className="text-foreground ml-1">{row.detail.assumptionNotes}</span></div>
                                      <div><span className="text-muted-foreground">Confidence:</span> <span className="text-foreground ml-1">{row.detail.confidenceExplanation}</span></div>
                                    </div>
                                    <div className="bg-card border border-border rounded-xl p-3">
                                      <label className="text-muted-foreground block mb-1">Reviewer Comment</label>
                                      <textarea className="w-full bg-muted/20 rounded-lg text-xs p-2 outline-none resize-none h-14 text-foreground" placeholder="Add review notes..." />
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
                <div className="bg-card border border-border rounded-2xl shadow-sm p-4">
                  <h3 className="font-display font-semibold text-sm text-foreground mb-3">Items Requiring Review</h3>
                  <div className="space-y-2">
                    {needsReview.map((item) => (
                      <button key={item.id} onClick={() => setExpandedRow(item.id)} className="w-full text-left p-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <p className="text-xs font-medium text-foreground">{item.description}</p>
                        <div className="flex gap-1.5 mt-1"><ConfidenceBadge level={item.confidence} /><ReviewStatusBadge status={item.status} /></div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl shadow-sm p-4">
                  <h3 className="font-display font-semibold text-sm text-foreground mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start"><CheckCircle size={12} className="mr-1.5" /> Confirm all high-confidence</Button>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start"><AlertTriangle size={12} className="mr-1.5" /> Review scale-derived items</Button>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start"><GitMerge size={12} className="mr-1.5" /> Merge Selected</Button>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-start"><Copy size={12} className="mr-1.5" /> Mark Duplicate</Button>
                    <Button size="sm" className="w-full text-xs justify-start">Send to Estimate Builder <ArrowRight size={11} className="ml-1" /></Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════ STRUCTURE TAB ═══════════ */}
          <TabsContent value="structure">
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "All Items", key: "all", count: takeoffData.length },
                  { label: "Unmapped", key: "unmapped", count: unmapped.length },
                  { label: "Mapped", key: "mapped", count: mapped.length },
                  { label: "Duplicates", key: "duplicate", count: duplicates.length },
                  { label: "Deferred", key: "deferred", count: takeoffData.filter(r => r.structureStatus === "Deferred").length },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setStructureFilter(f.key)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full font-medium transition-colors border",
                      structureFilter === f.key ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
                {selectedRows.size > 0 && (
                  <div className="ml-auto flex gap-1.5">
                    <Button size="sm" variant="outline" className="text-xs h-7"><GitMerge size={12} className="mr-1" />Merge Selected</Button>
                    <Button size="sm" variant="outline" className="text-xs h-7"><Copy size={12} className="mr-1" />Mark Duplicate</Button>
                    <Button size="sm" variant="outline" className="text-xs h-7"><Split size={12} className="mr-1" />Split Line</Button>
                    <Button size="sm" variant="outline" className="text-xs h-7"><Trash2 size={12} className="mr-1" />Remove</Button>
                  </div>
                )}
              </div>

              {/* Structure table */}
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-semibold text-foreground">Scope Structure Mapping</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Map extracted items into cost codes, trades, and estimate sections</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="text-xs h-7"><Settings2 size={12} className="mr-1" />Apply Defaults</Button>
                    <Button size="sm" variant="outline" className="text-xs h-7"><Layers size={12} className="mr-1" />Map Unassigned</Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm table-fixed">
                    <colgroup>
                      <col className="w-10" />
                      <col className="w-10" />
                      <col style={{ width: "22%" }} />
                      <col style={{ width: "7%" }} />
                      <col style={{ width: "5%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "10%" }} />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-3 py-3"><input type="checkbox" className="rounded border-border" /></th>
                        <th />
                        <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Description</th>
                        <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Qty</th>
                        <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Unit</th>
                        <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Cost Code</th>
                        <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Trade</th>
                        <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Source</th>
                        <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Estimate Section</th>
                        <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Confidence</th>
                        <th className="text-left px-3 py-3 text-xs font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {structureData.map((row) => (
                        <>
                          <tr key={row.id} className={cn("border-b border-border last:border-0 hover:bg-muted/20 transition-colors", selectedRows.has(row.id) && "bg-primary/5")}>
                            <td className="px-3 py-3">
                              <input type="checkbox" checked={selectedRows.has(row.id)} onChange={() => toggleRowSelection(row.id)} className="rounded border-border" />
                            </td>
                            <td className="py-3">
                              <button onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}>
                                <ChevronRight size={14} className={cn("text-muted-foreground transition-transform", expandedRow === row.id && "rotate-90")} />
                              </button>
                            </td>
                            <td className="px-3 py-3 text-foreground truncate">{row.description}</td>
                            <td className="px-3 py-3 font-display font-semibold text-foreground">{row.qty}</td>
                            <td className="px-3 py-3 text-muted-foreground">{row.unit}</td>
                            <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{row.costCode}</td>
                            <td className="px-3 py-3 text-xs text-foreground">{row.trade}</td>
                            <td className="px-3 py-3"><PlanReferenceChip sheet={row.sheet} /></td>
                            <td className="px-3 py-3">
                              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", sectionColors[row.estimateSection])}>{row.estimateSection}</span>
                            </td>
                            <td className="px-3 py-3"><ConfidenceBadge level={row.confidence} /></td>
                            <td className="px-3 py-3">
                              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", structureStatusColors[row.structureStatus])}>{row.structureStatus}</span>
                            </td>
                          </tr>
                          {expandedRow === row.id && (
                            <tr key={`${row.id}-struct-detail`} className="border-b border-border bg-muted/10">
                              <td colSpan={11} className="p-4">
                                <div className="grid md:grid-cols-3 gap-4 text-xs">
                                  <div className="space-y-2">
                                    <h4 className="font-display font-semibold text-foreground text-sm mb-2">Mapping Controls</h4>
                                    <div>
                                      <label className="text-muted-foreground text-[11px] block mb-1">Cost Code</label>
                                      <select className="w-full text-xs bg-muted/30 border border-border rounded-lg px-2 py-1.5 text-foreground">
                                        <option>{row.costCode}</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-muted-foreground text-[11px] block mb-1">Trade</label>
                                      <select className="w-full text-xs bg-muted/30 border border-border rounded-lg px-2 py-1.5 text-foreground">
                                        <option>{row.trade}</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-muted-foreground text-[11px] block mb-1">Estimate Section</label>
                                      <select className="w-full text-xs bg-muted/30 border border-border rounded-lg px-2 py-1.5 text-foreground">
                                        {estimateSectionOptions.map(s => <option key={s} selected={s === row.estimateSection}>{s}</option>)}
                                      </select>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="font-display font-semibold text-foreground text-sm mb-2">Source & Extraction</h4>
                                    <div><span className="text-muted-foreground">Source:</span> <span className="text-foreground ml-1">{row.detail.sheetRef}</span></div>
                                    <div><span className="text-muted-foreground">Method:</span> <ExtractionMethodBadge method={row.method} /></div>
                                    <div><span className="text-muted-foreground">Detection:</span> <span className="text-foreground ml-1">{row.detail.detectionNote}</span></div>
                                    <div><span className="text-muted-foreground">Formula:</span> <span className="font-mono text-foreground ml-1">{row.detail.formula}</span></div>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="font-display font-semibold text-foreground text-sm mb-2">Review</h4>
                                    <div className="bg-card border border-border rounded-xl p-3">
                                      <label className="text-muted-foreground block mb-1">Notes</label>
                                      <textarea className="w-full bg-muted/20 rounded-lg text-xs p-2 outline-none resize-none h-14 text-foreground" placeholder="Add mapping notes..." />
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                      <Button size="sm" variant="default" className="text-xs h-7"><Check size={12} className="mr-1" />Confirm</Button>
                                      <Button size="sm" variant="outline" className="text-xs h-7"><Pencil size={12} className="mr-1" />Adjust</Button>
                                      <Button size="sm" variant="outline" className="text-xs h-7"><Flag size={12} className="mr-1" />Defer</Button>
                                      <Button size="sm" variant="outline" className="text-xs h-7"><GitMerge size={12} className="mr-1" />Merge</Button>
                                      <Button size="sm" variant="outline" className="text-xs h-7"><Split size={12} className="mr-1" />Split</Button>
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
            </div>
          </TabsContent>

          {/* ═══════════ SCOPE ISSUES TAB ═══════════ */}
          <TabsContent value="scope-issues">
            <div className="space-y-6">
              {categories.map((cat) => (
                <div key={cat.title} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
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
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{item.trade}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{item.issueType}</span>
                                {item.sheet !== "—" && <PlanReferenceChip sheet={item.sheet} />}
                              </div>
                            </div>
                            <ChevronDown size={14} className={cn("text-muted-foreground mt-1 transition-transform", isExpanded && "rotate-180")} />
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4 ml-7 space-y-2 text-xs">
                              <div className="bg-muted/30 rounded-xl p-3 space-y-2">
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

          {/* ═══════════ ASSUMPTIONS TAB ═══════════ */}
          <TabsContent value="assumptions">
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-display font-semibold text-foreground">Items Relying on Assumptions</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Scale-derived, low-confidence, and assumption-based items requiring estimator confirmation</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-fixed">
                  <colgroup>
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "25%" }} />
                    <col style={{ width: "15%" }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Description", "Method", "Confidence", "Status", "Risk", "Assumption", "Confirmation"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assumptionItems.map((row) => (
                      <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 text-foreground truncate">{row.description}</td>
                        <td className="px-4 py-3"><ExtractionMethodBadge method={row.method} /></td>
                        <td className="px-4 py-3"><ConfidenceBadge level={row.confidence} /></td>
                        <td className="px-4 py-3"><ReviewStatusBadge status={row.status} /></td>
                        <td className="px-4 py-3">
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", row.confidence === "Low" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning")}>
                            {row.confidence === "Low" ? "High" : "Medium"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{row.detail.assumptionNotes}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{row.method === "Derived from Scale" ? "Verify with plans" : row.method === "Assumption Applied" ? "Confirm with field" : "Review required"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════ SUB SCOPE EXPORT TAB ═══════════ */}
          <TabsContent value="sub-scope">
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <h3 className="font-display font-semibold text-foreground mb-1">Scope Package Builder</h3>
                <p className="text-sm text-muted-foreground">Build precise scope packages with exact line items, quantities, and descriptions for subcontractor pricing.</p>
              </div>

              <div className="space-y-4">
                {subScopePackages.map((pkg) => {
                  const isExpanded = expandedPackage === pkg.trade;
                  return (
                    <div key={pkg.trade} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                      {/* Package header */}
                      <button
                        onClick={() => setExpandedPackage(isExpanded ? null : pkg.trade)}
                        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors text-left"
                      >
                        <Package size={16} className="text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="font-display font-semibold text-foreground">{pkg.trade}</h3>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[pkg.status])}>{pkg.status}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {pkg.subName || "No subcontractor assigned"} · {pkg.lineItems.length} line items
                          </p>
                        </div>
                        <ChevronDown size={14} className={cn("text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                      </button>

                      {/* Expanded package */}
                      {isExpanded && (
                        <div className="border-t border-border">
                          {/* Scope description */}
                          <div className="px-5 py-4 border-b border-border">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Scope Package Description</h4>
                              <Button size="sm" variant="ghost" className="text-xs h-6"><Pencil size={11} className="mr-1" />Edit</Button>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">{pkg.scopeDescription}</p>
                          </div>

                          {/* Line items table */}
                          <div className="px-5 py-4 border-b border-border">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Included Line Items</h4>
                              <Button size="sm" variant="ghost" className="text-xs h-6"><ClipboardList size={11} className="mr-1" />Add Item</Button>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border bg-muted/20">
                                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Description</th>
                                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-16">Qty</th>
                                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-14">Unit</th>
                                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground w-20">Code</th>
                                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Notes</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pkg.lineItems.map((li, idx) => (
                                    <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/10">
                                      <td className="px-3 py-2 text-foreground">{li.description}</td>
                                      <td className="px-3 py-2 font-display font-semibold text-foreground">{li.qty}</td>
                                      <td className="px-3 py-2 text-muted-foreground">{li.unit}</td>
                                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{li.costCode}</td>
                                      <td className="px-3 py-2 text-xs text-muted-foreground">{li.notes}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Exclusions & Clarifications */}
                          <div className="px-5 py-4 border-b border-border grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Exclusions</h4>
                              <ul className="space-y-1">
                                {pkg.exclusions.map((ex, i) => (
                                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                    <XCircle size={12} className="text-destructive mt-0.5 shrink-0" />
                                    {ex}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Clarifications</h4>
                              <ul className="space-y-1">
                                {pkg.clarifications.map((cl, i) => (
                                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                    <Info size={12} className="text-info mt-0.5 shrink-0" />
                                    {cl}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="px-5 py-3 flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline" className="text-xs h-7"><Eye size={12} className="mr-1" />View Scope</Button>
                            <Button size="sm" variant="outline" className="text-xs h-7"><Pencil size={12} className="mr-1" />Edit Scope</Button>
                            <Button size="sm" variant="outline" className="text-xs h-7"><Save size={12} className="mr-1" />Save Draft</Button>
                            <Button size="sm" className="text-xs h-7"><Mail size={12} className="mr-1" />Send to Sub</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom Progression Controls */}
        <div className="mt-10 border-t border-border pt-8 pb-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="px-8 text-sm font-semibold gap-2"
            onClick={() => setTransition("bid-leveling")}
          >
            Continue to Bid Leveling
            <ArrowRight size={16} />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 text-sm font-semibold gap-2"
            onClick={() => setTransition("estimate")}
          >
            <Hammer size={16} />
            Skip to Build Estimate
          </Button>
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
          { label: "Organizing allowances and selections" },
          { label: "Preparing estimate structure" },
        ]}
        targetPath="/app/estimate-builder"
        onComplete={() => setTransition(null)}
      />
    </AppLayout>
  );
}
