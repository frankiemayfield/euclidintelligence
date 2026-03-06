import { SubLayout } from "@/components/sub/SubLayout";
import {
  AlertTriangle, CheckCircle, FileSearch, Info, XCircle, ChevronDown, ChevronRight,
  Pencil, Flag, Send, Mail, Layers, GitMerge, Split, Copy, Trash2, Settings2,
  Package, ClipboardList, ArrowRight, Filter, Eye, EyeOff, Save, Check, Hammer,
  MessageSquare, ShieldAlert, Link2, CircleCheck, Plus
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

interface BidPackageLineItem {
  description: string; qty: number; unit: string; costCode: string; notes: string;
}

interface BidPackage {
  category: string; status: "Draft" | "Ready" | "Sent to GC" | "Confirmed";
  scopeDescription: string;
  lineItems: BidPackageLineItem[];
  exclusions: string[];
  clarifications: string[];
}

type IssueDerivedType = "rfi" | "clarification" | "exclusion" | "allowance-note";

interface IssueDerivedItem {
  id: string;
  sourceIssue: string;
  text: string;
  type: IssueDerivedType;
  linkedLineItem?: string;
}

// Framing-specific takeoff data with formulas/derivations
const takeoffData: TakeoffRow[] = [
  { id: 1, division: "06 10 00", description: "2×4 wall framing — exterior", qty: 1420, unit: "LF", sheet: "A1.1", method: "Derived from Scale", confidence: "Medium", status: "Needs Review", costCode: "06-100", trade: "Framing", estimateSection: "Base Scope", structureStatus: "Mapped",
    detail: { sourceType: "Scaled perimeter", sheetRef: "Sheet A1.1 — Floor Plan", detectionNote: "Exterior wall perimeter measured from floor plan scale at gridlines", formula: "Perimeter 142 LF × 10 ft wall height = 1,420 LF of plate (top + bottom)", unitConversion: "1,420 LF plate stock → ~178 pcs 2×4×8 studs @ 16\" OC + plates", assumptionNotes: "Wall height assumed 10 ft from section detail A-A. Corner assemblies included.", confidenceExplanation: "Perimeter from scale, not dimensioned. Wall height confirmed from section." }},
  { id: 2, division: "06 10 00", description: "2×6 wall framing — bearing", qty: 380, unit: "LF", sheet: "S1.1", method: "Explicitly Labeled", confidence: "High", status: "Estimator Confirmed", costCode: "06-100", trade: "Framing", estimateSection: "Base Scope", structureStatus: "Confirmed",
    detail: { sourceType: "Plan callout", sheetRef: "Sheet S1.1 — Structural Plan", detectionNote: "Interior bearing walls dimensioned on structural plan with callouts for 2×6 framing", formula: "38 LF kitchen bearing + 24 LF hallway bearing + 18 LF addition tie-in = 380 LF (×10 ft height)", unitConversion: "380 LF → ~48 pcs 2×6×10 studs @ 16\" OC + double top plate", assumptionNotes: "All interior load-bearing partitions per structural plan. Non-bearing partitions excluded.", confidenceExplanation: "Bearing walls explicitly dimensioned and labeled on structural plan." }},
  { id: 3, division: "06 10 00", description: "LVL headers — assorted sizes", qty: 18, unit: "EA", sheet: "S1.1", method: "Schedule Verified", confidence: "Medium", status: "Needs Review", costCode: "06-100", trade: "Framing", estimateSection: "Base Scope", structureStatus: "Mapped",
    detail: { sourceType: "Structural schedule + detail sheet", sheetRef: "Sheet S1.1 — Structural Details / Header Schedule", detectionNote: "Header schedule lists 18 openings requiring LVL headers. Sizes range from 3.5×9.25 to 5.25×11.875.", formula: "Direct count from header schedule: 6× 3.5×9.25, 8× 3.5×11.875, 4× 5.25×11.875", unitConversion: "EA count — material priced per size category", assumptionNotes: "Header sizes from schedule. Detail S1.1-D shows conflict with door schedule A5.1 on two openings.", confidenceExplanation: "Schedule verified but two header sizes conflict between structural detail and door schedule." }},
  { id: 4, division: "06 10 00", description: "Roof trusses — pre-engineered", qty: 22, unit: "EA", sheet: "A4.1", method: "Explicitly Labeled", confidence: "High", status: "Estimator Confirmed", costCode: "06-100", trade: "Framing", estimateSection: "Base Scope", structureStatus: "Confirmed",
    detail: { sourceType: "Plan callout + framing plan", sheetRef: "Sheet A4.1 — Framing Plan / Roof Plan", detectionNote: "Framing plan shows 22 trusses at 24\" OC across 44 ft span. Standard Fink profile.", formula: "44 ft roof span ÷ 2 ft OC = 22 trusses + 1 gable end = 22 EA (gable included in count)", unitConversion: "EA count — trusses priced per unit from truss supplier", assumptionNotes: "Pre-engineered trusses assumed. Verify with truss shop drawings before order.", confidenceExplanation: "Truss count and spacing explicitly shown on framing plan." }},
  { id: 5, division: "06 10 00", description: "Floor joists — I-joists 11⅞\"", qty: 1100, unit: "LF", sheet: "S1.1", method: "Derived from Scale", confidence: "Medium", status: "Needs Review", costCode: "06-100", trade: "Framing", estimateSection: "Base Scope", structureStatus: "Mapped",
    detail: { sourceType: "Scaled measurement + structural note", sheetRef: "Sheet S1.1 — Structural Floor Framing", detectionNote: "Floor area measured from structural plan. I-joist depth noted as 11⅞\" TJI.", formula: "Floor area 1,000 SF → span 25 ft × 44 pcs at 16\" OC = 1,100 LF of I-joist", unitConversion: "1,100 LF → ~44 pcs × 25 ft lengths = 44 I-joists", assumptionNotes: "I-joist spacing assumed 16\" OC per typical residential. Rim board counted separately.", confidenceExplanation: "Joist spacing from typical practice, not dimensioned. Span from scale." }},
  { id: 6, division: "06 10 00", description: "Wall sheathing — 7/16\" OSB", qty: 2800, unit: "SF", sheet: "A1.1", method: "Derived from Scale", confidence: "High", status: "Estimator Confirmed", costCode: "06-160", trade: "Framing", estimateSection: "Base Scope", structureStatus: "Confirmed",
    detail: { sourceType: "Calculated from wall perimeter", sheetRef: "Sheet A1.1 — Floor Plan + Elevations", detectionNote: "Exterior wall area calculated from perimeter × height. Window/door openings deducted.", formula: "142 LF perimeter × 10 ft height = 1,420 SF gross − 120 SF openings = 1,300 SF net × 2 stories = 2,600 SF + 8% waste = 2,800 SF", unitConversion: "2,800 SF ÷ 32 SF/sheet = 87.5 → 88 sheets 4×8 OSB", assumptionNotes: "7/16\" OSB per spec section 06 16 00. Clips at unsupported edges included.", confidenceExplanation: "Perimeter confirmed from plan. Height from section. Waste factor standard 8%." }},
  { id: 7, division: "06 10 00", description: "Roof sheathing — 7/16\" OSB", qty: 1900, unit: "SF", sheet: "A4.1", method: "Explicitly Labeled", confidence: "High", status: "Estimator Confirmed", costCode: "06-160", trade: "Framing", estimateSection: "Base Scope", structureStatus: "Confirmed",
    detail: { sourceType: "Plan callout + roof plan", sheetRef: "Sheet A4.1 — Roof Plan", detectionNote: "Roof area from plan outline with pitch multiplier applied for actual surface area.", formula: "1,200 SF plan area × 1.118 pitch factor (6:12) = 1,341 SF + 8% waste = 1,448 SF → rounded to 1,900 SF (includes overhangs + ridges)", unitConversion: "1,900 SF ÷ 32 SF/sheet = 59.4 → 60 sheets 4×8 OSB", assumptionNotes: "6:12 pitch confirmed from Section A-A. Overhangs 12\" all sides included.", confidenceExplanation: "Roof outline dimensioned. Pitch confirmed from building section." }},
  { id: 8, division: "06 10 00", description: "Blocking — cabinet/TV/handrail", qty: 1, unit: "LS", sheet: "—", method: "Assumption Applied", confidence: "Low", status: "Needs Review", costCode: "06-100", trade: "Framing", estimateSection: "Base Scope", structureStatus: "Unmapped",
    detail: { sourceType: "Inferred from project type", sheetRef: "— (Inferred from finish schedule)", detectionNote: "No explicit blocking schedule on plans. Inferred from cabinet layout, TV locations, and handrail details.", formula: "Lump sum — estimated 120 LF blocking at various heights", unitConversion: "LS — priced as labor + material lump sum", assumptionNotes: "Cabinet backing at 34\" + 54\" AFF, TV mount backing per owner spec, handrail blocking per code.", confidenceExplanation: "No plan reference. Based on finish schedule inference and project type." }},
  { id: 9, division: "06 10 00", description: "Hangers/fasteners/hardware", qty: 1, unit: "LS", sheet: "S1.1", method: "Schedule Verified", confidence: "Medium", status: "Auto-Extracted", costCode: "06-100", trade: "Framing", estimateSection: "Base Scope", structureStatus: "Mapped",
    detail: { sourceType: "Hardware schedule", sheetRef: "Sheet S1.1 — Hardware Schedule", detectionNote: "Hardware schedule lists joist hangers, hurricane straps, hold-downs, and Simpson connectors.", formula: "Direct from schedule: 44 joist hangers + 22 hurricane straps + 8 hold-downs + misc clips", unitConversion: "LS — priced from hardware schedule quantities", assumptionNotes: "Simpson Strong-Tie or equivalent per spec. Installation labor included.", confidenceExplanation: "Hardware schedule present but may not be complete for all conditions." }},
  { id: 10, division: "06 10 00", description: "Rim board — 1¼\" LVL", qty: 180, unit: "LF", sheet: "S1.1", method: "Explicitly Labeled", confidence: "High", status: "Estimator Confirmed", costCode: "06-100", trade: "Framing", estimateSection: "Base Scope", structureStatus: "Confirmed",
    detail: { sourceType: "Plan callout", sheetRef: "Sheet S1.1 — Structural Floor Framing", detectionNote: "Rim board callout at floor perimeter. 1¼\" LVL rim per structural note.", formula: "Floor perimeter 180 LF — continuous rim board at joist bearing", unitConversion: "180 LF → 9 pcs × 20 ft lengths", assumptionNotes: "LVL rim board per structural spec. Material by GC or sub TBD.", confidenceExplanation: "Rim board dimensioned on structural plan with explicit callout." }},
  { id: 11, division: "06 10 00", description: "Stair framing — opening + stringers", qty: 1, unit: "LS", sheet: "S1.1", method: "Assumption Applied", confidence: "Low", status: "Needs Review", costCode: "06-100", trade: "Framing", estimateSection: "Base Scope", structureStatus: "Unmapped",
    detail: { sourceType: "Inferred from floor plan", sheetRef: "Sheet S1.1 — Structural (stair opening not dimensioned)", detectionNote: "Stair shown on floor plan but opening framing not detailed on structural plans.", formula: "Lump sum — assumed 3 ft × 10 ft opening with doubled headers + 3 stringers", unitConversion: "LS — labor + material for stair opening framing", assumptionNotes: "Stair opening framing not dimensioned. Stringers assumed 2×12. Verify with structural.", confidenceExplanation: "Stair opening shown but not dimensioned. Requires structural clarification." }},
  { id: 12, division: "01 50 00", description: "Mobilization & staging", qty: 1, unit: "LS", sheet: "—", method: "Assumption Applied", confidence: "Medium", status: "Auto-Extracted", costCode: "01-500", trade: "General Conditions", estimateSection: "General Requirements", structureStatus: "Mapped",
    detail: { sourceType: "Inferred", sheetRef: "—", detectionNote: "Standard mobilization allowance for framing crew. Includes equipment delivery and staging area setup.", formula: "Lump sum estimate — 1 day mob + staging", unitConversion: "—", assumptionNotes: "Assumes adequate staging area provided by GC. Dumpster by GC.", confidenceExplanation: "Standard practice item. No plan reference needed." }},
];

// Scope issues — framing-specific
const categories: { title: string; icon: typeof XCircle; severity: string; items: ScopeItem[] }[] = [
  { title: "Missing Scope Items", icon: XCircle, severity: "high", items: [
    { message: "Stair opening framing not dimensioned on structural plans", trade: "Framing", affectedItem: "Stair Opening", sheet: "S1.1", issueType: "Missing Scope", atlasNote: "Floor plan shows stair location but structural plans do not dimension the opening or specify header sizes. This is critical for accurate framing.", recommendation: "Request dimensioned stair opening detail from structural engineer before finalizing quote." },
    { message: "Temporary shoring not specified during demolition phase", trade: "Framing", affectedItem: "Temporary Shoring", sheet: "—", issueType: "Missing Scope", atlasNote: "Bearing wall removal requires temporary shoring during demo. No callout in scope package or structural plans.", recommendation: "Confirm if temporary shoring is provided or sub responsibility. Add to exclusions if not included." },
  ]},
  { title: "Inconsistent Assumptions", icon: AlertTriangle, severity: "medium", items: [
    { message: "Opening header sizes conflict between framing detail and schedule", trade: "Framing", affectedItem: "LVL Headers", sheet: "S1.1 / A5.1", issueType: "Spec Conflict", atlasNote: "Header schedule on S1.1 shows 3.5×11.875 for openings D105 and D108, but detail S1.1-D shows 5.25×11.875 for the same openings. Cost difference is ~$180 per header.", recommendation: "Clarify which header sizes govern — detail or schedule. Submit RFI." },
    { message: "Blocking scope inferred — no explicit blocking schedule", trade: "Framing", affectedItem: "Blocking/Nailers", sheet: "—", issueType: "Scope Gap", atlasNote: "Cabinet backing, TV mount backing, and handrail blocking are inferred from finish schedule but not explicitly called out on framing plans.", recommendation: "Request blocking schedule or confirm scope. Currently carried as lump sum." },
  ]},
  { title: "Duplicate / Overlapping Scope", icon: Copy, severity: "high", items: [
    { message: "Unclear bearing wall transition at kitchen-to-addition boundary", trade: "Framing", affectedItem: "Bearing Wall Transition", sheet: "S1.1", issueType: "Scope Overlap", atlasNote: "Structural plan shows bearing wall ending at kitchen boundary but addition structural framing also shows bearing at same location. Potential double-count of posts and headers.", recommendation: "Request structural clarification on load path at transition point." },
  ]},
  { title: "Likely Exclusions Needed", icon: Info, severity: "low", items: [
    { message: "Finish carpentry — trim, casing, base", trade: "Framing", affectedItem: "—", sheet: "—", issueType: "Exclusion Risk", atlasNote: "Finish carpentry is a separate trade. Ensure framing quote explicitly excludes trim work.", recommendation: "Add to exclusions list in proposal." },
    { message: "Demolition of existing framing", trade: "Framing", affectedItem: "Demo", sheet: "—", issueType: "Exclusion Risk", atlasNote: "Demo scope typically handled by GC or demo sub. Confirm responsibility.", recommendation: "Clarify or add to exclusions." },
    { message: "Subfloor installation", trade: "Framing", affectedItem: "Subfloor", sheet: "—", issueType: "Exclusion Risk", atlasNote: "Subfloor (3/4\" T&G plywood) is sometimes included in framing scope, sometimes separate. Clarify.", recommendation: "Confirm if subfloor is in framing scope or separate." },
  ]},
];

// Bid package line items (scope summary)
const bidPackageLineItems: BidPackageLineItem[] = [
  { description: "Exterior wall framing — 2×4 @ 16\" OC", qty: 1420, unit: "LF", costCode: "06-100", notes: "Per floor plan A1.1" },
  { description: "Interior bearing walls — 2×6 @ 16\" OC", qty: 380, unit: "LF", costCode: "06-100", notes: "Per structural S1.1" },
  { description: "LVL header installation", qty: 18, unit: "EA", costCode: "06-100", notes: "Sizes per header schedule" },
  { description: "Roof truss installation", qty: 22, unit: "EA", costCode: "06-100", notes: "Pre-engineered, crane set" },
  { description: "Floor joist installation — I-joists", qty: 1100, unit: "LF", costCode: "06-100", notes: "11⅞\" TJI per structural" },
  { description: "Wall sheathing — 7/16\" OSB", qty: 2800, unit: "SF", costCode: "06-160", notes: "Material + labor" },
  { description: "Roof sheathing — 7/16\" OSB", qty: 1900, unit: "SF", costCode: "06-160", notes: "Material + labor" },
  { description: "Blocking — cabinet/TV/handrail", qty: 1, unit: "LS", costCode: "06-100", notes: "Per finish schedule" },
  { description: "Hardware installation — hangers, straps, clips", qty: 1, unit: "LS", costCode: "06-100", notes: "Per structural hardware schedule" },
  { description: "Temporary bracing during construction", qty: 1, unit: "LS", costCode: "06-100", notes: "Until permanent structure complete" },
];

const defaultInclusions = [
  "All rough framing per plans A1.1, A4.1, S1.1",
  "Exterior and interior bearing wall framing",
  "Roof truss installation (pre-engineered)",
  "Floor joist system — I-joists with rim board",
  "Wall and roof sheathing — 7/16\" OSB",
  "Blocking for cabinets, TV mounts, and handrails",
  "Hardware installation per structural schedule",
  "Temporary bracing during construction",
];

const defaultExclusions = [
  "Demolition of existing framing",
  "Finish carpentry / trim",
  "Subfloor installation",
  "Insulation",
  "Drywall",
];

const defaultClarifications = [
  "All lumber SPF #2 or better",
  "Assumes open access — no confined space premiums",
];

const defaultTerms = [
  "Quote valid for 30 days from submission",
  "Pricing subject to material escalation clause",
  "Payment terms: Net 30 from invoice date",
];

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

export default function SubScopeAnalyzerPage() {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [structureFilter, setStructureFilter] = useState<string>("all");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState("quantity-takeoff");
  const [assumptionStates, setAssumptionStates] = useState<Record<number, "unresolved" | "confirmed" | "adjusted" | "needs-review" | "deferred">>({});
  const [codeSystem] = useState("16-Division Default");
  const [transition, setTransition] = useState<"bid-leveling" | "estimate" | null>(null);

  // Issue resolution state
  const [resolvedIssues, setResolvedIssues] = useState<Set<string>>(new Set());
  const [issueDerivedItems, setIssueDerivedItems] = useState<IssueDerivedItem[]>([]);
  const [issueLinkedItems, setIssueLinkedItems] = useState<Record<string, string>>({});

  // Bid package editable sections
  const [bpInclusions, setBpInclusions] = useState<string[]>(defaultInclusions);
  const [bpExclusions, setBpExclusions] = useState<string[]>(defaultExclusions);
  const [bpClarifications, setBpClarifications] = useState<string[]>(defaultClarifications);
  const [bpAllowanceNotes, setBpAllowanceNotes] = useState<string[]>([]);
  const [bpTerms, setBpTerms] = useState<string[]>(defaultTerms);

  const needsReview = takeoffData.filter(r => r.status === "Needs Review" || r.confidence === "Low");
  const mapped = takeoffData.filter(r => r.structureStatus === "Confirmed" || r.structureStatus === "Mapped");
  const unmapped = takeoffData.filter(r => r.structureStatus === "Unmapped");
  const duplicates = takeoffData.filter(r => r.structureStatus === "Duplicate Candidate");
  const assumptionItems = takeoffData.filter(r => r.method === "Assumption Applied" || r.method === "Derived from Scale" || r.confidence !== "High");

  const allIssues = categories.flatMap((cat, ci) => cat.items.map((item, ii) => ({ ...item, key: `${ci}-${ii}`, category: cat.title, severity: cat.severity })));
  const openIssues = allIssues.filter(i => !resolvedIssues.has(i.key));

  const summaryCards = [
    { label: "Total Extracted", value: takeoffData.length, color: "text-foreground", filterKey: null },
    { label: "Explicitly Labeled", value: takeoffData.filter(r => r.method === "Explicitly Labeled").length, color: "text-primary", filterKey: "Explicitly Labeled" },
    { label: "Derived from Scale", value: takeoffData.filter(r => r.method === "Derived from Scale").length, color: "text-warning", filterKey: "Derived from Scale" },
    { label: "Needs Review", value: needsReview.length, color: "text-warning", filterKey: "Needs Review" },
    { label: "Issues Found", value: `${openIssues.length} open`, color: "text-destructive", filterKey: "Issues" },
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
      if (filterKey && activeTab !== "quantity-takeoff") setActiveTab("quantity-takeoff");
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

  // Issue action handlers
  const handleConvertIssue = (issueKey: string, issueMessage: string, type: IssueDerivedType) => {
    const newItem: IssueDerivedItem = {
      id: `${type}-${Date.now()}`,
      sourceIssue: issueKey,
      text: issueMessage,
      type,
    };
    setIssueDerivedItems(prev => [...prev, newItem]);

    // Also add to the appropriate bid package section
    if (type === "exclusion") {
      setBpExclusions(prev => [...prev, issueMessage]);
    } else if (type === "clarification" || type === "rfi") {
      setBpClarifications(prev => [...prev, `[${type === "rfi" ? "RFI" : "Clarification"}] ${issueMessage}`]);
    } else if (type === "allowance-note") {
      setBpAllowanceNotes(prev => [...prev, issueMessage]);
    }
  };

  const handleResolveIssue = (issueKey: string) => {
    setResolvedIssues(prev => new Set(prev).add(issueKey));
  };

  const handleAssignToLineItem = (issueKey: string) => {
    setIssueLinkedItems(prev => ({ ...prev, [issueKey]: "assigned" }));
  };

  const removeIssueDerivedItem = (id: string) => {
    const item = issueDerivedItems.find(i => i.id === id);
    if (item) {
      setIssueDerivedItems(prev => prev.filter(i => i.id !== id));
      if (item.type === "exclusion") {
        setBpExclusions(prev => prev.filter(e => e !== item.text));
      } else if (item.type === "clarification" || item.type === "rfi") {
        const prefix = item.type === "rfi" ? "[RFI]" : "[Clarification]";
        setBpClarifications(prev => prev.filter(c => c !== `${prefix} ${item.text}`));
      } else if (item.type === "allowance-note") {
        setBpAllowanceNotes(prev => prev.filter(n => n !== item.text));
      }
    }
  };

  const filteredData = getFilteredData();
  const structureData = getStructureFilteredData();

  // Counts for bid package badge indicators
  const issueDerivedExclusions = issueDerivedItems.filter(i => i.type === "exclusion");
  const issueDerivedClarifications = issueDerivedItems.filter(i => i.type === "clarification" || i.type === "rfi");
  const issueDerivedAllowances = issueDerivedItems.filter(i => i.type === "allowance-note");

  return (
    <SubLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Scope Analyzer</h1>
            <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Framing scope review & quantity takeoff</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-sm font-semibold gap-1.5" onClick={() => setTransition("estimate")}>
              <Hammer size={14} />
              Skip to Build Estimate
            </Button>
            <Button size="sm" className="text-sm font-semibold gap-1.5" onClick={() => setTransition("bid-leveling")}>
              Continue to Bid Leveling
              <ArrowRight size={14} />
            </Button>
          </div>
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

        {/* Summary Cards — readiness snapshot (replaces overview) */}
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
            <TabsTrigger value="quantity-takeoff">Quantity Takeoff</TabsTrigger>
            <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
            <TabsTrigger value="scope-structure">Scope Structure</TabsTrigger>
            <TabsTrigger value="scope-issues">
              Issues
              {openIssues.length > 0 && (
                <span className="ml-1.5 text-[10px] font-bold bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">{openIssues.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="bid-package">Bid Package</TabsTrigger>
          </TabsList>

          {/* ═══════════ QUANTITY TAKEOFF TAB ═══════════ */}
          <TabsContent value="quantity-takeoff">
            <div className="flex gap-6 flex-col xl:flex-row">
              <div className="flex-1 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-display font-semibold text-foreground">Quantity Takeoff</h2>
                  <div className="flex items-center gap-2">
                    {selectedRows.size > 0 && (
                      <div className="flex gap-1.5 mr-2">
                        <Button size="sm" variant="outline" className="text-xs h-7"><Check size={12} className="mr-1" />Confirm Selected</Button>
                        <Button size="sm" variant="outline" className="text-xs h-7"><GitMerge size={12} className="mr-1" />Merge Selected</Button>
                        <Button size="sm" variant="outline" className="text-xs h-7"><Copy size={12} className="mr-1" />Mark Duplicate</Button>
                        <Button size="sm" variant="outline" className="text-xs h-7"><Flag size={12} className="mr-1" />Needs Review</Button>
                        <Button size="sm" variant="outline" className="text-xs h-7"><Package size={12} className="mr-1" />Move to Bid Package</Button>
                        <span className="text-xs text-primary font-medium self-center">{selectedRows.size} selected</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Every number has a source</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="w-8 pl-3 py-3">
                          <input type="checkbox" className="rounded border-border" checked={selectedRows.size === filteredData.length && filteredData.length > 0} onChange={() => {
                            if (selectedRows.size === filteredData.length) setSelectedRows(new Set());
                            else setSelectedRows(new Set(filteredData.map(r => r.id)));
                          }} />
                        </th>
                        <th className="w-8" />
                        {["CSI Division", "Description", "Qty", "Unit", "Sheet", "Method", "Confidence", "Status"].map((h) => (
                          <th key={h} className="text-left px-3 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row) => (
                        <>
                          <tr key={row.id} className={cn("border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer", selectedRows.has(row.id) && "bg-primary/5")}>
                            <td className="pl-3 py-3" onClick={(e) => { e.stopPropagation(); toggleRowSelection(row.id); }}>
                              <input type="checkbox" className="rounded border-border" checked={selectedRows.has(row.id)} onChange={() => toggleRowSelection(row.id)} />
                            </td>
                            <td className="py-3" onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}><ChevronDown size={14} className={cn("text-muted-foreground transition-transform", expandedRow === row.id && "rotate-180")} /></td>
                            <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{row.division}</td>
                            <td className="px-3 py-3 text-foreground">{row.description}</td>
                            <td className="px-3 py-3 font-display font-semibold text-foreground">{typeof row.qty === 'number' && row.qty >= 10 ? row.qty.toLocaleString() : row.qty}</td>
                            <td className="px-3 py-3 text-muted-foreground">{row.unit}</td>
                            <td className="px-3 py-3"><PlanReferenceChip sheet={row.sheet} /></td>
                            <td className="px-3 py-3"><ExtractionMethodBadge method={row.method} /></td>
                            <td className="px-3 py-3"><ConfidenceBadge level={row.confidence} /></td>
                            <td className="px-3 py-3"><ReviewStatusBadge status={row.status} /></td>
                          </tr>
                          {expandedRow === row.id && (
                            <tr key={`${row.id}-detail`} className="border-b border-border bg-muted/10">
                              <td colSpan={10} className="p-4">
                                <div className="grid md:grid-cols-3 gap-4 text-xs">
                                  <div className="space-y-2">
                                    <h4 className="font-display font-semibold text-foreground text-sm mb-2">Source & Detection</h4>
                                    <div><span className="text-muted-foreground">Source Type:</span> <span className="text-foreground ml-1">{row.detail.sourceType}</span></div>
                                    <div><span className="text-muted-foreground">Sheet Ref:</span> <span className="text-foreground ml-1">{row.detail.sheetRef}</span></div>
                                    <div><span className="text-muted-foreground">Detection:</span> <span className="text-foreground ml-1">{row.detail.detectionNote}</span></div>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="font-display font-semibold text-foreground text-sm mb-2">Quantity Derivation</h4>
                                    <div><span className="text-muted-foreground">Formula:</span> <span className="font-mono text-foreground ml-1">{row.detail.formula}</span></div>
                                    <div><span className="text-muted-foreground">Unit Conversion:</span> <span className="text-foreground ml-1">{row.detail.unitConversion}</span></div>
                                    <div><span className="text-muted-foreground">Assumptions:</span> <span className="text-foreground ml-1">{row.detail.assumptionNotes}</span></div>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="font-display font-semibold text-foreground text-sm mb-2">Confidence</h4>
                                    <div className="bg-card border border-border rounded-xl p-3">
                                      <p className="text-foreground">{row.detail.confidenceExplanation}</p>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                      <Button size="sm" variant="default" className="text-xs h-7"><Check size={12} className="mr-1" />Confirm</Button>
                                      <Button size="sm" variant="outline" className="text-xs h-7"><Pencil size={12} className="mr-1" />Adjust</Button>
                                      <Button size="sm" variant="outline" className="text-xs h-7"><Flag size={12} className="mr-1" />Flag for Review</Button>
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

          {/* ═══════════ ASSUMPTIONS TAB ═══════════ */}
          <TabsContent value="assumptions">
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-display font-semibold text-foreground">Assumptions</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Review and confirm inferred logic, scale-derived values, and placeholder assumptions</p>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="text-xs h-7"><Check size={12} className="mr-1" />Confirm All High-Confidence</Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-fixed">
                  <colgroup>
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "6%" }} />
                    <col style={{ width: "24%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "16%" }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Description", "Method", "Confidence", "Status", "Risk", "Assumption", "Resolution", "Actions"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assumptionItems.map((row) => {
                      const state = assumptionStates[row.id] || "unresolved";
                      const stateStyles: Record<string, string> = {
                        "unresolved": "bg-warning/10 text-warning",
                        "confirmed": "bg-primary/10 text-primary",
                        "adjusted": "bg-info/10 text-info",
                        "needs-review": "bg-destructive/10 text-destructive",
                        "deferred": "bg-muted text-muted-foreground",
                      };
                      const stateLabels: Record<string, string> = {
                        "unresolved": "Unresolved",
                        "confirmed": "Confirmed",
                        "adjusted": "Adjusted",
                        "needs-review": "Needs Review",
                        "deferred": "Deferred",
                      };
                      return (
                        <tr key={row.id} className={cn("border-b border-border last:border-0 hover:bg-muted/20", state === "confirmed" && "bg-primary/5")}>
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
                          <td className="px-4 py-3">
                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", stateStyles[state])}>
                              {stateLabels[state]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              <button onClick={() => setAssumptionStates(s => ({ ...s, [row.id]: "confirmed" }))} className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors", state === "confirmed" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary")}>
                                <Check size={9} className="inline mr-0.5" />Confirm
                              </button>
                              <button onClick={() => setAssumptionStates(s => ({ ...s, [row.id]: "adjusted" }))} className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors", state === "adjusted" ? "bg-info text-info-foreground" : "bg-muted text-muted-foreground hover:bg-info/10 hover:text-info")}>
                                Adjust
                              </button>
                              <button onClick={() => setAssumptionStates(s => ({ ...s, [row.id]: "needs-review" }))} className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors", state === "needs-review" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive")}>
                                Review
                              </button>
                              <button onClick={() => setAssumptionStates(s => ({ ...s, [row.id]: "deferred" }))} className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors", state === "deferred" ? "bg-muted-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted-foreground/20")}>
                                Defer
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════ SCOPE STRUCTURE TAB ═══════════ */}
          <TabsContent value="scope-structure">
            <div className="space-y-4">
              {/* Structure filter chips */}
              <div className="flex gap-2 flex-wrap items-center">
                {[
                  { key: "all", label: "All Items", count: takeoffData.length },
                  { key: "unmapped", label: "Unmapped", count: unmapped.length },
                  { key: "mapped", label: "Mapped / Confirmed", count: mapped.length },
                  { key: "duplicate", label: "Duplicate Candidates", count: duplicates.length },
                  { key: "deferred", label: "Deferred", count: takeoffData.filter(r => r.structureStatus === "Deferred").length },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStructureFilter(f.key)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full font-medium transition-colors",
                      structureFilter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
                {selectedRows.size > 0 && (
                  <div className="ml-auto flex gap-1.5 flex-wrap">
                    <span className="text-xs text-primary font-medium self-center mr-1">{selectedRows.size} selected</span>
                    <Button size="sm" variant="outline" className="text-xs h-7"><GitMerge size={12} className="mr-1" />Merge Selected</Button>
                    <Button size="sm" variant="outline" className="text-xs h-7"><Copy size={12} className="mr-1" />Mark Duplicate</Button>
                    <Button size="sm" variant="outline" className="text-xs h-7"><Split size={12} className="mr-1" />Split Line</Button>
                    <Button size="sm" variant="outline" className="text-xs h-7"><Settings2 size={12} className="mr-1" />Assign Cost Code</Button>
                    <Button size="sm" variant="outline" className="text-xs h-7"><Layers size={12} className="mr-1" />Assign Trade</Button>
                    <Button size="sm" variant="outline" className="text-xs h-7"><Check size={12} className="mr-1" />Confirm Selected</Button>
                    <Button size="sm" variant="outline" className="text-xs h-7"><Package size={12} className="mr-1" />Move to Bid Package</Button>
                    <Button size="sm" variant="outline" className="text-xs h-7"><Trash2 size={12} className="mr-1" />Remove</Button>
                  </div>
                )}
              </div>

              {/* Structure table */}
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-semibold text-foreground">Scope Structure</h2>
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
                            <td className="px-3 py-3 font-display font-semibold text-foreground">{typeof row.qty === 'number' && row.qty >= 10 ? row.qty.toLocaleString() : row.qty}</td>
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

          {/* ═══════════ ISSUES TAB (WORK QUEUE) ═══════════ */}
          <TabsContent value="scope-issues">
            <div className="space-y-4">
              {/* Issues header */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-foreground">Scope Issues — Work Queue</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Identify scope gaps, RFIs, clarifications, and exclusions. Convert issues directly into your Bid Package.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{openIssues.length}</span> open · <span className="font-semibold text-foreground">{resolvedIssues.size}</span> resolved · <span className="font-semibold text-foreground">{issueDerivedItems.length}</span> converted
                    </div>
                  </div>
                </div>
              </div>

              {categories.map((cat, ci) => {
                const catIssues = cat.items.map((item, ii) => ({ ...item, key: `${ci}-${ii}` }));
                const openCatIssues = catIssues.filter(i => !resolvedIssues.has(i.key));
                if (openCatIssues.length === 0 && catIssues.length > 0) {
                  return (
                    <div key={cat.title} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden opacity-60">
                      <div className="px-5 py-4 flex items-center gap-2">
                        <cat.icon size={16} className="text-primary" />
                        <h2 className="font-display font-semibold text-foreground">{cat.title}</h2>
                        <span className="ml-auto text-xs text-primary font-medium">All resolved ✓</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={cat.title} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                      <cat.icon size={16} className={cat.severity === "high" ? "text-destructive" : cat.severity === "medium" ? "text-warning" : "text-info"} />
                      <h2 className="font-display font-semibold text-foreground">{cat.title}</h2>
                      <span className="ml-auto text-xs text-muted-foreground">{openCatIssues.length} open</span>
                    </div>
                    <div className="divide-y divide-border">
                      {catIssues.map((item) => {
                        const isResolved = resolvedIssues.has(item.key);
                        const isExpanded = expandedItem === item.key;
                        const isConverted = issueDerivedItems.some(d => d.sourceIssue === item.key);
                        const isLinked = issueLinkedItems[item.key];

                        if (isResolved) return null;

                        return (
                          <div key={item.key}>
                            <button onClick={() => setExpandedItem(isExpanded ? null : item.key)} className="w-full flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors text-left">
                              <CheckCircle size={14} className={cn("mt-0.5 shrink-0", isConverted ? "text-primary" : "text-muted-foreground")} />
                              <div className="flex-1">
                                <p className="text-sm text-foreground">{item.message}</p>
                                <div className="flex gap-2 mt-1.5 flex-wrap">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{item.trade}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{item.issueType}</span>
                                  {item.sheet !== "—" && <PlanReferenceChip sheet={item.sheet} />}
                                  {isConverted && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Converted</span>}
                                  {isLinked && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-info/10 text-info font-medium">Linked</span>}
                                </div>
                              </div>
                              <ChevronDown size={14} className={cn("text-muted-foreground mt-1 transition-transform", isExpanded && "rotate-180")} />
                            </button>
                            {isExpanded && (
                              <div className="px-4 pb-4 ml-7 space-y-3 text-xs">
                                <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                                  <div><span className="text-muted-foreground">Affected Item:</span> <span className="text-foreground ml-1">{item.affectedItem}</span></div>
                                  <div><span className="text-muted-foreground">Atlas Analysis:</span> <span className="text-foreground ml-1">{item.atlasNote}</span></div>
                                  <div className="pt-1 border-t border-border"><span className="text-muted-foreground">Recommendation:</span> <span className="text-foreground font-medium ml-1">{item.recommendation}</span></div>
                                </div>
                                {/* Action buttons */}
                                <div className="flex gap-2 flex-wrap">
                                  <Button
                                    size="sm" variant="outline" className="text-xs h-7"
                                    onClick={(e) => { e.stopPropagation(); handleConvertIssue(item.key, item.message, "rfi"); }}
                                  >
                                    <Mail size={12} className="mr-1" />Convert to RFI
                                  </Button>
                                  <Button
                                    size="sm" variant="outline" className="text-xs h-7"
                                    onClick={(e) => { e.stopPropagation(); handleConvertIssue(item.key, item.message, "clarification"); }}
                                  >
                                    <MessageSquare size={12} className="mr-1" />Convert to Clarification
                                  </Button>
                                  <Button
                                    size="sm" variant="outline" className="text-xs h-7"
                                    onClick={(e) => { e.stopPropagation(); handleConvertIssue(item.key, item.message, "exclusion"); }}
                                  >
                                    <ShieldAlert size={12} className="mr-1" />Convert to Exclusion
                                  </Button>
                                  <Button
                                    size="sm" variant="outline" className="text-xs h-7"
                                    onClick={(e) => { e.stopPropagation(); handleConvertIssue(item.key, item.message, "allowance-note"); }}
                                  >
                                    <FileSearch size={12} className="mr-1" />Add to Allowances / Notes
                                  </Button>
                                  <Button
                                    size="sm" variant="outline" className="text-xs h-7"
                                    onClick={(e) => { e.stopPropagation(); handleAssignToLineItem(item.key); }}
                                  >
                                    <Link2 size={12} className="mr-1" />Assign to Line Item
                                  </Button>
                                  <Button
                                    size="sm" variant="default" className="text-xs h-7"
                                    onClick={(e) => { e.stopPropagation(); handleResolveIssue(item.key); }}
                                  >
                                    <CircleCheck size={12} className="mr-1" />Mark Resolved
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ═══════════ BID PACKAGE TAB ═══════════ */}
          <TabsContent value="bid-package">
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <h3 className="font-display font-semibold text-foreground mb-1">Bid Package</h3>
                <p className="text-sm text-muted-foreground">Your quote submission package — inclusions, exclusions, clarifications, and mapped line items.</p>
              </div>

              {/* Scope Summary / Line Items */}
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h4 className="font-display font-semibold text-foreground">Scope Summary</h4>
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
                      {bidPackageLineItems.map((li, idx) => (
                        <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/10">
                          <td className="px-3 py-2 text-foreground">{li.description}</td>
                          <td className="px-3 py-2 font-display font-semibold text-foreground">{typeof li.qty === 'number' && li.qty >= 10 ? li.qty.toLocaleString() : li.qty}</td>
                          <td className="px-3 py-2 text-muted-foreground">{li.unit}</td>
                          <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{li.costCode}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{li.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Inclusions */}
              <BidPackageEditableSection
                title="Inclusions"
                icon={<CheckCircle size={14} className="text-primary" />}
                items={bpInclusions}
                onUpdate={setBpInclusions}
                issueDerivedCount={0}
                itemIcon={<Check size={12} className="text-primary mt-0.5 shrink-0" />}
              />

              {/* Exclusions */}
              <BidPackageEditableSection
                title="Exclusions"
                icon={<XCircle size={14} className="text-destructive" />}
                items={bpExclusions}
                onUpdate={setBpExclusions}
                issueDerivedCount={issueDerivedExclusions.length}
                issueDerivedItems={issueDerivedExclusions}
                onRemoveIssueDerived={removeIssueDerivedItem}
                itemIcon={<XCircle size={12} className="text-destructive mt-0.5 shrink-0" />}
              />

              {/* Clarifications / RFIs */}
              <BidPackageEditableSection
                title="Clarifications / RFIs"
                icon={<Info size={14} className="text-info" />}
                items={bpClarifications}
                onUpdate={setBpClarifications}
                issueDerivedCount={issueDerivedClarifications.length}
                issueDerivedItems={issueDerivedClarifications}
                onRemoveIssueDerived={removeIssueDerivedItem}
                itemIcon={<Info size={12} className="text-info mt-0.5 shrink-0" />}
              />

              {/* Allowances / Notes */}
              <BidPackageEditableSection
                title="Allowances / Notes"
                icon={<FileSearch size={14} className="text-warning" />}
                items={bpAllowanceNotes}
                onUpdate={setBpAllowanceNotes}
                issueDerivedCount={issueDerivedAllowances.length}
                issueDerivedItems={issueDerivedAllowances}
                onRemoveIssueDerived={removeIssueDerivedItem}
                itemIcon={<AlertTriangle size={12} className="text-warning mt-0.5 shrink-0" />}
                emptyMessage="No allowance notes yet. Convert issues or add manually."
              />

              {/* Terms & Conditions */}
              <BidPackageEditableSection
                title="Terms & Conditions"
                icon={<ClipboardList size={14} className="text-muted-foreground" />}
                items={bpTerms}
                onUpdate={setBpTerms}
                issueDerivedCount={0}
                itemIcon={<Check size={12} className="text-muted-foreground mt-0.5 shrink-0" />}
              />

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" className="text-xs h-7"><Eye size={12} className="mr-1" />Preview Package</Button>
                <Button size="sm" variant="outline" className="text-xs h-7"><Pencil size={12} className="mr-1" />Edit Notes</Button>
                <Button size="sm" variant="outline" className="text-xs h-7"><Save size={12} className="mr-1" />Save Draft</Button>
                <Button size="sm" className="text-xs h-7"><Send size={12} className="mr-1" />Submit Quote</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

      </div>

      <WorkflowTransition
        active={transition === "bid-leveling"}
        headline="Compiling scope for bid review"
        steps={[
          { label: "Organizing scope items" },
          { label: "Checking package coverage" },
          { label: "Preparing comparison workspace" },
        ]}
        targetPath="/sub/bid-leveling"
        onComplete={() => setTransition(null)}
      />
      <WorkflowTransition
        active={transition === "estimate"}
        headline="Building your estimate"
        steps={[
          { label: "Refining scope" },
          { label: "Applying scope packages" },
          { label: "Organizing allowances" },
          { label: "Preparing estimate structure" },
        ]}
        targetPath="/sub/estimate-builder"
        onComplete={() => setTransition(null)}
      />
    </SubLayout>
  );
}

// ─── Editable Section Component ───────────────────────────────────
interface BidPackageEditableSectionProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  onUpdate: (items: string[]) => void;
  issueDerivedCount: number;
  issueDerivedItems?: IssueDerivedItem[];
  onRemoveIssueDerived?: (id: string) => void;
  itemIcon: React.ReactNode;
  emptyMessage?: string;
}

function BidPackageEditableSection({ title, icon, items, onUpdate, issueDerivedCount, issueDerivedItems: derivedItems, onRemoveIssueDerived, itemIcon, emptyMessage }: BidPackageEditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  const handleAdd = () => {
    if (editText.trim()) {
      onUpdate([...items, editText.trim()]);
      setEditText("");
      setIsEditing(false);
    }
  };

  const handleRemove = (index: number) => {
    onUpdate(items.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="font-display font-semibold text-foreground">{title}</h4>
          {issueDerivedCount > 0 && (
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {issueDerivedCount} from issues
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" className="text-xs h-6" onClick={() => setIsEditing(!isEditing)}>
            <Plus size={11} className="mr-1" />Add
          </Button>
          <Button size="sm" variant="ghost" className="text-xs h-6">
            <Pencil size={11} className="mr-1" />Edit
          </Button>
        </div>
      </div>
      <div className="px-5 py-3">
        {items.length === 0 && !isEditing && (
          <p className="text-xs text-muted-foreground py-2">{emptyMessage || "No items yet."}</p>
        )}
        <ul className="space-y-1">
          {items.map((item, i) => {
            const isDerived = derivedItems?.some(d => {
              if (d.type === "exclusion") return d.text === item;
              const prefix = d.type === "rfi" ? "[RFI]" : d.type === "clarification" ? "[Clarification]" : "";
              return prefix ? `${prefix} ${d.text}` === item : d.text === item;
            });
            return (
              <li key={i} className="text-sm text-foreground flex items-start gap-2 group py-0.5">
                {itemIcon}
                <span className="flex-1">{item}</span>
                {isDerived && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">from issue</span>}
                <button onClick={() => handleRemove(i)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 size={12} />
                </button>
              </li>
            );
          })}
        </ul>
        {isEditing && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder={`Add ${title.toLowerCase()} item...`}
              className="flex-1 text-sm bg-muted/30 border border-border rounded-lg px-3 py-1.5 text-foreground outline-none focus:ring-1 focus:ring-primary/30"
              autoFocus
            />
            <Button size="sm" variant="default" className="text-xs h-8" onClick={handleAdd}>Add</Button>
            <Button size="sm" variant="ghost" className="text-xs h-8" onClick={() => { setIsEditing(false); setEditText(""); }}>Cancel</Button>
          </div>
        )}
      </div>
    </div>
  );
}
