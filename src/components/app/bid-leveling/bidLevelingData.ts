export type BidStatus = "Draft Scope" | "Sent to Sub" | "Awaiting Bid" | "Bid Received" | "Needs Clarification" | "Ready to Compare" | "Selected" | "Sent to Estimate";

export type ExclusionDisposition = "unresolved" | "add-to-estimate" | "carry-by-gc" | "reassign" | "accept";

export interface LevelingAdjustment {
  description: string;
  amount: number;
  reason: string;
}

export interface Exclusion {
  item: string;
  disposition: ExclusionDisposition;
}

export interface Clarification {
  question: string;
  resolved: boolean;
  answer?: string;
}

export interface SubBid {
  sub: string;
  rawTotal: number;
  addBacks: number;
  leveledTotal: number;
  notes: string;
  recommended?: boolean;
  recommendedReason?: string;
  selected?: boolean;
  status: BidStatus;
  packageCoverage: number;
  missingScopeCount: number;
  scopeNotes: string[];
  inclusions: string[];
  exclusions: Exclusion[];
  clarifications: Clarification[];
  adjustments: LevelingAdjustment[];
  uploadedFrom: string;
}

export const trades = ["Electrical", "Plumbing", "HVAC", "Drywall", "Framing"];

export const statusColors: Record<BidStatus, string> = {
  "Draft Scope": "bg-muted text-muted-foreground",
  "Sent to Sub": "bg-info/10 text-info",
  "Awaiting Bid": "bg-warning/10 text-warning",
  "Bid Received": "bg-accent text-accent-foreground",
  "Needs Clarification": "bg-destructive/10 text-destructive",
  "Ready to Compare": "bg-primary/10 text-primary",
  "Selected": "bg-primary/15 text-primary",
  "Sent to Estimate": "bg-primary/20 text-primary",
};

export const bids: Record<string, SubBid[]> = {
  Electrical: [
    {
      sub: "Spark Electric Co.", rawTotal: 16800, addBacks: 0, leveledTotal: 16800,
      notes: "Includes panel upgrade", recommended: true, selected: true,
      recommendedReason: "Lowest leveled total with fullest scope coverage",
      status: "Selected", packageCoverage: 100, missingScopeCount: 0,
      scopeNotes: ["Full scope", "Includes permit fees"],
      inclusions: ["200A panel upgrade", "All circuits per plan", "Permit fees", "Fixture trim-out", "Low voltage rough-in"],
      exclusions: [
        { item: "Generator hookup", disposition: "carry-by-gc" },
      ],
      clarifications: [],
      adjustments: [],
      uploadedFrom: "Spark_Electric_Bid.pdf",
    },
    {
      sub: "BrightWire LLC", rawTotal: 18200, addBacks: 3400, leveledTotal: 21600,
      notes: "Excludes panel upgrade & fixtures", status: "Bid Received",
      packageCoverage: 72, missingScopeCount: 3,
      scopeNotes: ["Excludes panel upgrade", "Assumes owner-supplied fixtures"],
      inclusions: ["Rough-in only", "Permit fees"],
      exclusions: [
        { item: "Panel upgrade", disposition: "add-to-estimate" },
        { item: "Fixture supply & trim-out", disposition: "unresolved" },
        { item: "Low voltage / data", disposition: "reassign" },
      ],
      clarifications: [
        { question: "Does rough-in include home runs to panel?", resolved: false },
        { question: "Confirm wire gauge for kitchen circuits", resolved: true, answer: "12 AWG confirmed" },
      ],
      adjustments: [
        { description: "Add panel upgrade carry", amount: 2200, reason: "Excluded by sub — required per plans" },
        { description: "Add fixture trim-out labor", amount: 1200, reason: "Owner-supplied fixtures still need install" },
      ],
      uploadedFrom: "BrightWire_Quote.pdf",
    },
    {
      sub: "Metro Electrical", rawTotal: 21400, addBacks: 0, leveledTotal: 21400,
      notes: "Premium fixtures included", status: "Bid Received",
      packageCoverage: 96, missingScopeCount: 1,
      scopeNotes: ["Premium fixtures included", "Full scope"],
      inclusions: ["Full rough + finish", "Premium fixtures", "Panel upgrade", "Permit fees", "Low voltage rough-in"],
      exclusions: [
        { item: "Generator hookup", disposition: "accept" },
      ],
      clarifications: [
        { question: "Confirm premium fixture allowance amount", resolved: false },
      ],
      adjustments: [],
      uploadedFrom: "Metro_Electrical_Bid.pdf",
    },
  ],
  Plumbing: [
    {
      sub: "AquaFlow Plumbing", rawTotal: 18500, addBacks: 0, leveledTotal: 18500,
      notes: "Includes rough + finish", recommended: true, selected: true,
      recommendedReason: "Lowest leveled total with complete scope coverage",
      status: "Selected", packageCoverage: 95, missingScopeCount: 0,
      scopeNotes: ["Full rough + finish", "Includes fixtures"],
      inclusions: ["Full rough-in", "Finish plumbing", "Fixture supply", "Waste & vent"],
      exclusions: [
        { item: "Gas piping", disposition: "reassign" },
        { item: "Water heater supply", disposition: "carry-by-gc" },
      ],
      clarifications: [],
      adjustments: [],
      uploadedFrom: "AquaFlow_Plumbing_Bid.pdf",
    },
    {
      sub: "PipeMasters Inc.", rawTotal: 19800, addBacks: 4200, leveledTotal: 24000,
      notes: "Rough-in only — excludes fixtures & finish", status: "Needs Clarification",
      packageCoverage: 58, missingScopeCount: 4,
      scopeNotes: ["Excludes fixtures", "Rough-in only"],
      inclusions: ["Rough-in only"],
      exclusions: [
        { item: "Fixtures", disposition: "add-to-estimate" },
        { item: "Finish plumbing", disposition: "unresolved" },
        { item: "Gas piping", disposition: "reassign" },
        { item: "Water heater", disposition: "unresolved" },
      ],
      clarifications: [
        { question: "Does rough-in include waste & vent?", resolved: false },
        { question: "Confirm PEX vs copper", resolved: false },
      ],
      adjustments: [
        { description: "Add fixture supply allowance", amount: 2800, reason: "Excluded — required per spec" },
        { description: "Add finish plumbing labor", amount: 1400, reason: "Rough-in only bid — finish needed" },
      ],
      uploadedFrom: "PipeMasters_Quote.pdf",
    },
    {
      sub: "RedLine Plumbing", rawTotal: 22100, addBacks: 0, leveledTotal: 22100,
      notes: "Includes fixture allowance", status: "Bid Received",
      packageCoverage: 92, missingScopeCount: 1,
      scopeNotes: ["Includes fixture allowance", "Full scope"],
      inclusions: ["Full rough + finish", "$3,500 fixture allowance", "Waste & vent"],
      exclusions: [
        { item: "Gas piping", disposition: "accept" },
      ],
      clarifications: [],
      adjustments: [],
      uploadedFrom: "RedLine_Plumbing.pdf",
    },
  ],
  HVAC: [
    {
      sub: "CoolAir Systems", rawTotal: 14200, addBacks: 5800, leveledTotal: 20000,
      notes: "Equipment only — excludes ductwork & controls", status: "Needs Clarification",
      packageCoverage: 45, missingScopeCount: 4,
      scopeNotes: ["Equipment only", "Excludes ductwork"],
      inclusions: ["Equipment supply", "Equipment install"],
      exclusions: [
        { item: "Ductwork", disposition: "unresolved" },
        { item: "Controls / thermostats", disposition: "add-to-estimate" },
        { item: "Startup & balancing", disposition: "unresolved" },
        { item: "Refrigerant piping", disposition: "unresolved" },
      ],
      clarifications: [
        { question: "Confirm equipment model and SEER rating", resolved: false },
        { question: "Is electrical connection included?", resolved: false },
      ],
      adjustments: [
        { description: "Add ductwork carry", amount: 3200, reason: "Excluded — required for complete system" },
        { description: "Add controls allowance", amount: 1400, reason: "Thermostats and controls excluded" },
        { description: "Add startup & balancing", amount: 1200, reason: "Required for commissioning" },
      ],
      uploadedFrom: "CoolAir_Bid.pdf",
    },
    {
      sub: "ComfortPro HVAC", rawTotal: 16900, addBacks: 0, leveledTotal: 16900,
      notes: "Full scope including ductwork", recommended: true, selected: true,
      recommendedReason: "Best value — full scope at lowest leveled total",
      status: "Selected", packageCoverage: 96, missingScopeCount: 0,
      scopeNotes: ["Includes ductwork", "Full scope"],
      inclusions: ["Equipment", "Ductwork", "Controls", "Startup", "Balancing", "Refrigerant piping"],
      exclusions: [
        { item: "Electrical connection", disposition: "reassign" },
      ],
      clarifications: [],
      adjustments: [],
      uploadedFrom: "ComfortPro_Bid.pdf",
    },
    {
      sub: "TempRight Mechanical", rawTotal: 19500, addBacks: 0, leveledTotal: 19500,
      notes: "Premium equipment", status: "Bid Received",
      packageCoverage: 92, missingScopeCount: 1,
      scopeNotes: ["Premium equipment", "Full scope"],
      inclusions: ["Premium equipment", "Ductwork", "Controls", "Startup"],
      exclusions: [
        { item: "Electrical connection", disposition: "accept" },
      ],
      clarifications: [
        { question: "Premium equipment brand and warranty terms?", resolved: true, answer: "Carrier — 10yr parts" },
      ],
      adjustments: [],
      uploadedFrom: "TempRight_Bid.pdf",
    },
  ],
  Drywall: [
    {
      sub: "SmoothWall Inc.", rawTotal: 12160, addBacks: 0, leveledTotal: 12160,
      notes: "Hang, tape, finish L5", recommended: true, selected: true,
      recommendedReason: "Lowest leveled total with Level 5 finish included",
      status: "Selected", packageCoverage: 100, missingScopeCount: 0,
      scopeNotes: ["Full scope Level 5"],
      inclusions: ["Hang", "Tape", "Level 5 finish", "Cleanup", "Material supply"],
      exclusions: [
        { item: "Insulation", disposition: "reassign" },
      ],
      clarifications: [],
      adjustments: [],
      uploadedFrom: "SmoothWall_Bid.pdf",
    },
    {
      sub: "GypBoard Pros", rawTotal: 13400, addBacks: 1800, leveledTotal: 15200,
      notes: "Level 4 only — excludes material supply", status: "Bid Received",
      packageCoverage: 68, missingScopeCount: 2,
      scopeNotes: ["Includes soundproofing", "Assumes owner-supplied materials"],
      inclusions: ["Hang", "Tape", "Level 4 finish", "Soundproofing"],
      exclusions: [
        { item: "Material supply (drywall board)", disposition: "add-to-estimate" },
        { item: "Level 5 upgrade", disposition: "unresolved" },
      ],
      clarifications: [
        { question: "Confirm soundproofing spec — resilient channel or QuietRock?", resolved: false },
      ],
      adjustments: [
        { description: "Add drywall material supply", amount: 1800, reason: "Owner-supplied assumed — GC must carry material" },
      ],
      uploadedFrom: "GypBoard_Bid.pdf",
    },
  ],
  Framing: [
    {
      sub: "TrueFrame Carpentry", rawTotal: 23800, addBacks: 0, leveledTotal: 23800,
      notes: "Full framing package", recommended: true, selected: true,
      recommendedReason: "Full scope coverage with all blocking and hardware included",
      status: "Sent to Estimate", packageCoverage: 96, missingScopeCount: 0,
      scopeNotes: ["Full framing package", "Includes sheathing"],
      inclusions: ["All framing", "Sheathing", "Hardware", "Blocking", "Engineered lumber install"],
      exclusions: [
        { item: "Engineered lumber supply", disposition: "carry-by-gc" },
      ],
      clarifications: [],
      adjustments: [],
      uploadedFrom: "TrueFrame_Bid.pdf",
    },
    {
      sub: "SquareEdge Builders", rawTotal: 25200, addBacks: 2400, leveledTotal: 27600,
      notes: "Labor + sheathing only", status: "Awaiting Bid",
      packageCoverage: 62, missingScopeCount: 3,
      scopeNotes: ["Includes sheathing", "Excludes hardware & blocking"],
      inclusions: ["Framing labor", "Sheathing"],
      exclusions: [
        { item: "Hardware (hangers, clips, straps)", disposition: "add-to-estimate" },
        { item: "Blocking", disposition: "unresolved" },
        { item: "Engineered lumber supply", disposition: "carry-by-gc" },
      ],
      clarifications: [
        { question: "Confirm sheathing includes roof deck?", resolved: false },
        { question: "Wall framing 16 OC or 24 OC?", resolved: true, answer: "16 OC confirmed" },
      ],
      adjustments: [
        { description: "Add hardware carry", amount: 1600, reason: "Hangers, clips, straps excluded" },
        { description: "Add blocking labor", amount: 800, reason: "Required for cabinets, TV mounts, etc." },
      ],
      uploadedFrom: "SquareEdge_Quote.pdf",
    },
  ],
};

export const formatCurrency = (n: number) => `$${n.toLocaleString()}`;

export const dispositionLabels: Record<ExclusionDisposition, string> = {
  "unresolved": "Unresolved",
  "add-to-estimate": "Add to Estimate",
  "carry-by-gc": "Carry by GC",
  "reassign": "Reassign to Other Trade",
  "accept": "Accept Exclusion",
};

export const dispositionColors: Record<ExclusionDisposition, string> = {
  "unresolved": "bg-warning/10 text-warning border-warning/20",
  "add-to-estimate": "bg-primary/10 text-primary border-primary/20",
  "carry-by-gc": "bg-info/10 text-info border-info/20",
  "reassign": "bg-muted text-muted-foreground border-border",
  "accept": "bg-muted text-muted-foreground border-border",
};
