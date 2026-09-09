// ─── Types ───────────────────────────────────────────────────────────────────

export type ReviewStatus = "Needs Review" | "Reviewed" | "Approved";
export type ConfidenceLevel = "High" | "Medium" | "Low";
export type VersionStatus = "Draft" | "In Review" | "Ready" | "Locked";
export type SourceType = "plan" | "spec" | "proposal" | "note";
export type TakeoffMethod = "linear" | "area" | "count" | "volume" | "polygon";
export type IssueFlag = "Missing Source" | "Missing Takeoff" | "Missing Cost Code" | "Low Confidence" | "Duplicate Item" | "Needs Clarification" | "Conflicting Source";

export interface Source {
  id: string;
  fileName: string;
  pageNumber: number;
  sheetName?: string;
  sourceType: SourceType;
  confidence: ConfidenceLevel;
  excerpt?: string;
}

export interface TakeoffRecord {
  id: string;
  quantity: number;
  unit: string;
  sourcePage: string;
  method: TakeoffMethod;
  linkedLineItemId: string;
  notes?: string;
  timestamp: string;
}

export interface CompanyCostCode {
  code: string;
  name: string;
  parentScope: string;
  trade: string;
  active: boolean;
}

export const CSI_DIVISIONS = [
  "01 – General Requirements",
  "02 – Existing Conditions",
  "03 – Concrete",
  "04 – Masonry",
  "05 – Metals",
  "06 – Wood, Plastics, and Composites",
  "07 – Thermal and Moisture Protection",
  "08 – Openings",
  "09 – Finishes",
  "10 – Specialties",
  "11 – Equipment",
  "12 – Furnishings",
  "13 – Special Construction",
  "14 – Conveying Equipment",
  "21 – Fire Suppression",
  "22 – Plumbing",
  "23 – Heating, Ventilating, and Air Conditioning (HVAC)",
  "25 – Integrated Automation",
  "26 – Electrical",
  "27 – Communications",
  "28 – Electronic Safety and Security",
  "31 – Earthwork",
  "32 – Exterior Improvements",
  "33 – Utilities",
  "34 – Transportation",
  "35 – Waterway and Marine Construction",
  "40 – Process Integration",
  "41 – Material Processing and Handling Equipment",
  "42 – Process Heating, Cooling, and Drying Equipment",
  "43 – Process Gas and Liquid Handling Equipment",
  "44 – Pollution Control Equipment",
  "45 – Industry-Specific Manufacturing Equipment",
  "46 – Water and Wastewater Equipment",
  "48 – Electrical Power Generation",
  "49 – Miscellaneous Equipment",
] as const;

export const UNITS = ["LF", "SF", "EA", "CY", "LS", "HR", "TON"] as const;
import mainPlanAsset from "@/assets/FinalConstructionSetFregolle.pdf.asset.json";
import { getProject } from "@/data/demoUniverse";

export const MAIN_PLAN_FILE_NAME = "FinalConstructionSetFregolle.pdf";
export const MAIN_PLAN_FILE_PATH = mainPlanAsset.url;

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  euclidCategory: string;
  companyCostCode: string | null;
  companyCostCodeStatus: "mapped" | "suggested" | "missing";
  csiDivision: string | null;
  sources: Source[];
  takeoffs: TakeoffRecord[];
  confidence: ConfidenceLevel;
  reviewStatus: ReviewStatus;
  issues: IssueFlag[];
  notes: string;
}

export interface Assembly {
  id: string;
  name: string;
  lineItems: LineItem[];
  sources: Source[];
}

export interface Trade {
  id: string;
  name: string;
  assemblies: Assembly[];
  sources: Source[];
}

export interface ParentScope {
  id: string;
  name: string;
  trades: Trade[];
}

export interface ScopeProject {
  id: string;
  name: string;
  status: VersionStatus;
  parentScopes: ParentScope[];
}

// ─── Company Cost Codes ──────────────────────────────────────────────────────

export const companyCostCodes: CompanyCostCode[] = [
  { code: "03-100", name: "Concrete Forming", parentScope: "Concrete", trade: "Concrete", active: true },
  { code: "03-200", name: "Concrete Reinforcement", parentScope: "Concrete", trade: "Concrete", active: true },
  { code: "03-300", name: "Cast-in-Place Concrete", parentScope: "Concrete", trade: "Concrete", active: true },
  { code: "04-210", name: "Brick Masonry", parentScope: "Masonry", trade: "Masonry", active: true },
  { code: "06-100", name: "Rough Carpentry", parentScope: "Framing", trade: "Framing", active: true },
  { code: "06-200", name: "Finish Carpentry", parentScope: "Finishes", trade: "Finish Carpentry", active: true },
  { code: "07-310", name: "Asphalt Shingles", parentScope: "Roofing", trade: "Roofing", active: true },
  { code: "07-620", name: "Sheet Metal Flashing", parentScope: "Roofing", trade: "Roofing", active: true },
  { code: "08-140", name: "Wood Doors", parentScope: "Openings", trade: "Doors", active: true },
  { code: "08-500", name: "Windows", parentScope: "Openings", trade: "Windows", active: true },
  { code: "09-290", name: "Gypsum Board", parentScope: "Finishes", trade: "Drywall", active: true },
  { code: "09-910", name: "Painting", parentScope: "Finishes", trade: "Painting", active: true },
  { code: "22-100", name: "Plumbing Piping", parentScope: "Plumbing", trade: "Plumbing", active: true },
  { code: "23-300", name: "HVAC Ductwork", parentScope: "HVAC", trade: "HVAC", active: true },
  { code: "23-370", name: "HVAC Diffusers", parentScope: "HVAC", trade: "HVAC", active: true },
  { code: "26-100", name: "Electrical Wiring", parentScope: "Electrical", trade: "Electrical", active: true },
  { code: "26-200", name: "Electrical Distribution", parentScope: "Electrical", trade: "Electrical", active: true },
  { code: "26-500", name: "Lighting", parentScope: "Electrical", trade: "Electrical", active: true },
  { code: "31-200", name: "Grading", parentScope: "Sitework", trade: "Earthwork", active: true },
  { code: "32-100", name: "Paving", parentScope: "Sitework", trade: "Paving", active: true },
  { code: "01-500", name: "Temporary Facilities", parentScope: "General Conditions", trade: "General Conditions", active: true },
];

// ─── Mock Project Data ───────────────────────────────────────────────────────

function src(_fileName: string, page: number, sheet?: string, type: SourceType = "plan", conf: ConfidenceLevel = "High"): Source {
  return { id: `src-${Math.random().toString(36).slice(2, 8)}`, fileName: MAIN_PLAN_FILE_NAME, pageNumber: page, sheetName: sheet, sourceType: type, confidence: conf };
}

function tkoff(qty: number, unit: string, page: string, method: TakeoffMethod, lineItemId: string): TakeoffRecord {
  return { id: `tk-${Math.random().toString(36).slice(2, 8)}`, quantity: qty, unit, sourcePage: page, method, linkedLineItemId: lineItemId, timestamp: "2026-04-05 10:30" };
}

function li(id: string, name: string, qty: number, unit: string, cat: string, cc: string | null, ccStatus: "mapped" | "suggested" | "missing", csi: string | null, conf: ConfidenceLevel, review: ReviewStatus, issues: IssueFlag[], sources: Source[], takeoffs: TakeoffRecord[], notes = ""): LineItem {
  return { id, name, quantity: qty, unit, euclidCategory: cat, companyCostCode: cc, companyCostCodeStatus: ccStatus, csiDivision: csi, confidence: conf, reviewStatus: review, issues, sources, takeoffs, notes };
}

export const mockProject: ScopeProject = {
  id: getProject("fregolle").id,
  name: getProject("fregolle").name,
  status: "Draft",
  parentScopes: [
    {
      id: "ps-concrete",
      name: "Concrete",
      trades: [
        {
          id: "tr-conc-found",
          name: "Foundations",
          sources: [src(MAIN_PLAN_FILE_NAME, 3, "S1.1"), src(MAIN_PLAN_FILE_NAME, 4, "S1.2")],
          assemblies: [
            {
              id: "asm-slab",
              name: "Main Level Slab Assembly",
              sources: [src(MAIN_PLAN_FILE_NAME, 3, "S1.1")],
              lineItems: [
                li("li-slab-conc", "Concrete slab — main level", 12.8, "CY", "Slab Concrete", "03-300", "mapped", "03 – Concrete", "High", "Approved", [], [src(MAIN_PLAN_FILE_NAME, 3, "S1.1")], [tkoff(12.8, "CY", "S1.1", "area", "li-slab-conc")]),
                li("li-slab-mesh", "Welded wire mesh — slab reinforcement", 1000, "SF", "Slab Reinforcement", "03-200", "mapped", "03 – Concrete", "High", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 3, "S1.1")], [tkoff(1000, "SF", "S1.1", "area", "li-slab-mesh")]),
                li("li-slab-vb", "Vapor barrier — 10 mil poly", 1050, "SF", "Vapor Barrier", "03-300", "suggested", "03 – Concrete", "Medium", "Needs Review", ["Missing Takeoff"], [src(MAIN_PLAN_FILE_NAME, 3, "S1.1")], []),
                li("li-slab-form", "Slab edge forming", 142, "LF", "Formwork", "03-100", "mapped", "03 – Concrete", "High", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 3, "S1.1")], [tkoff(142, "LF", "S1.1", "linear", "li-slab-form")]),
              ],
            },
            {
              id: "asm-ftg",
              name: "Perimeter Footing Assembly",
              sources: [src(MAIN_PLAN_FILE_NAME, 4, "S1.2")],
              lineItems: [
                li("li-ftg-conc", "Foundation footing — perimeter", 8.4, "CY", "Footing Concrete", "03-300", "mapped", "03 – Concrete", "Medium", "Needs Review", ["Low Confidence"], [src(MAIN_PLAN_FILE_NAME, 4, "S1.2")], [tkoff(8.4, "CY", "S1.2", "linear", "li-ftg-conc")]),
                li("li-ftg-rebar", "Rebar — #5 continuous", 360, "LF", "Rebar", "03-200", "mapped", "03 – Concrete", "High", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 4, "S1.2")], [tkoff(360, "LF", "S1.2", "linear", "li-ftg-rebar")]),
                li("li-ftg-form", "Footing formwork", 360, "LF", "Formwork", "03-100", "mapped", "03 – Concrete", "Medium", "Needs Review", [], [src(MAIN_PLAN_FILE_NAME, 4, "S1.2")], [tkoff(360, "LF", "S1.2", "linear", "li-ftg-form")]),
              ],
            },
          ],
        },
        {
          id: "tr-conc-flat",
          name: "Flatwork",
          sources: [src(MAIN_PLAN_FILE_NAME, 5, "C1.1")],
          assemblies: [
            {
              id: "asm-driveway",
              name: "Driveway Assembly",
              sources: [src(MAIN_PLAN_FILE_NAME, 5, "C1.1")],
              lineItems: [
                li("li-drv-conc", "Driveway concrete — 4\" thickness", 6.2, "CY", "Flatwork Concrete", "03-300", "mapped", "03 – Concrete", "High", "Approved", [], [src(MAIN_PLAN_FILE_NAME, 5, "C1.1")], [tkoff(6.2, "CY", "C1.1", "area", "li-drv-conc")]),
                li("li-drv-base", "Compacted gravel base — 6\"", 450, "SF", "Base Material", "31-200", "suggested", "31 – Earthwork", "Medium", "Needs Review", ["Missing Cost Code"], [src(MAIN_PLAN_FILE_NAME, 5, "C1.1")], []),
              ],
            },
          ],
        },
      ],
    },
    {
      id: "ps-framing",
      name: "Framing",
      trades: [
        {
          id: "tr-ext-framing",
          name: "Exterior Wall Framing",
          sources: [src(MAIN_PLAN_FILE_NAME, 8, "A1.1"), src(MAIN_PLAN_FILE_NAME, 12, "A3.1")],
          assemblies: [
            {
              id: "asm-ext-wall",
              name: "2×6 Exterior Wall Assembly",
              sources: [src(MAIN_PLAN_FILE_NAME, 8, "A1.1")],
              lineItems: [
                li("li-ext-studs", "2×6 studs — exterior walls", 1420, "LF", "Wall Studs", "06-100", "mapped", "06 – Wood, Plastics, and Composites", "Medium", "Needs Review", [], [src(MAIN_PLAN_FILE_NAME, 8, "A1.1")], [tkoff(1420, "LF", "A1.1", "linear", "li-ext-studs")]),
                li("li-ext-plates", "Top/bottom plates — 2×6", 284, "LF", "Wall Plates", "06-100", "mapped", "06 – Wood, Plastics, and Composites", "Medium", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 8, "A1.1")], [tkoff(284, "LF", "A1.1", "linear", "li-ext-plates")]),
                li("li-ext-sheath", "OSB sheathing — 7/16\"", 1420, "SF", "Sheathing", "06-100", "mapped", "06 – Wood, Plastics, and Composites", "High", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 8, "A1.1")], [tkoff(1420, "SF", "A1.1", "area", "li-ext-sheath")]),
                li("li-ext-header", "Engineered headers — window/door openings", 8, "EA", "Headers", "06-100", "mapped", "06 – Wood, Plastics, and Composites", "High", "Approved", [], [src(MAIN_PLAN_FILE_NAME, 8, "A1.1"), src(MAIN_PLAN_FILE_NAME, 12, "A3.1")], [tkoff(8, "EA", "A1.1", "count", "li-ext-header")]),
                li("li-ext-labor", "Framing labor — exterior walls", 142, "HR", "Framing Labor", null, "missing", null, "Medium", "Needs Review", ["Missing Cost Code", "Missing Source"], [], []),
              ],
            },
          ],
        },
        {
          id: "tr-floor-framing",
          name: "Floor Framing",
          sources: [src(MAIN_PLAN_FILE_NAME, 6, "S2.1")],
          assemblies: [
            {
              id: "asm-floor-sys",
              name: "Second Floor Joist System",
              sources: [src(MAIN_PLAN_FILE_NAME, 6, "S2.1")],
              lineItems: [
                li("li-floor-joist", "Floor joists — TJI 11-7/8\"", 42, "EA", "Floor Joists", "06-100", "mapped", "06 – Wood, Plastics, and Composites", "High", "Approved", [], [src(MAIN_PLAN_FILE_NAME, 6, "S2.1")], [tkoff(42, "EA", "S2.1", "count", "li-floor-joist")]),
                li("li-floor-rim", "Rim board — 1-1/8\" LVL", 142, "LF", "Rim Board", "06-100", "mapped", "06 – Wood, Plastics, and Composites", "High", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 6, "S2.1")], [tkoff(142, "LF", "S2.1", "linear", "li-floor-rim")]),
                li("li-floor-block", "Blocking — 2×12 between joists", 84, "LF", "Blocking", "06-100", "mapped", "06 – Wood, Plastics, and Composites", "Medium", "Needs Review", ["Missing Takeoff"], [src(MAIN_PLAN_FILE_NAME, 6, "S2.1")], []),
              ],
            },
          ],
        },
        {
          id: "tr-roof-framing",
          name: "Roof Framing",
          sources: [src(MAIN_PLAN_FILE_NAME, 10, "A4.1"), src(MAIN_PLAN_FILE_NAME, 7, "S3.1")],
          assemblies: [
            {
              id: "asm-roof-truss",
              name: "Roof Truss Assembly",
              sources: [src(MAIN_PLAN_FILE_NAME, 10, "A4.1")],
              lineItems: [
                li("li-roof-truss", "Pre-engineered roof trusses", 24, "EA", "Roof Trusses", "06-100", "mapped", "06 – Wood, Plastics, and Composites", "High", "Approved", [], [src(MAIN_PLAN_FILE_NAME, 10, "A4.1"), src(MAIN_PLAN_FILE_NAME, 7, "S3.1")], [tkoff(24, "EA", "A4.1", "count", "li-roof-truss")]),
                li("li-roof-sheath", "Roof sheathing — 1/2\" plywood", 1420, "SF", "Roof Sheathing", "06-100", "mapped", "06 – Wood, Plastics, and Composites", "High", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 10, "A4.1")], [tkoff(1420, "SF", "A4.1", "area", "li-roof-sheath")]),
                li("li-roof-fascia", "Fascia board — 1×8 primed", 180, "LF", "Fascia", "06-200", "suggested", "06 – Wood, Plastics, and Composites", "Medium", "Needs Review", [], [src(MAIN_PLAN_FILE_NAME, 10, "A4.1")], [tkoff(180, "LF", "A4.1", "linear", "li-roof-fascia")]),
              ],
            },
          ],
        },
      ],
    },
    {
      id: "ps-roofing",
      name: "Roofing",
      trades: [
        {
          id: "tr-shingles",
          name: "Shingle Roofing",
          sources: [src(MAIN_PLAN_FILE_NAME, 10, "A4.1")],
          assemblies: [
            {
              id: "asm-shingle-sys",
              name: "Architectural Shingle System",
              sources: [src(MAIN_PLAN_FILE_NAME, 10, "A4.1")],
              lineItems: [
                li("li-shingle", "Roof shingles — architectural", 14.2, "SQ", "Shingles", "07-310", "mapped", "07 – Thermal and Moisture Protection", "High", "Approved", [], [src(MAIN_PLAN_FILE_NAME, 10, "A4.1")], [tkoff(14.2, "SQ", "A4.1", "area", "li-shingle")]),
                li("li-underlayment", "Synthetic underlayment", 1420, "SF", "Underlayment", "07-310", "mapped", "07 – Thermal and Moisture Protection", "High", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 10, "A4.1")], [tkoff(1420, "SF", "A4.1", "area", "li-underlayment")]),
                li("li-ice-shield", "Ice & water shield — eaves", 180, "LF", "Ice Shield", "07-310", "mapped", "07 – Thermal and Moisture Protection", "High", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 10, "A4.1")], [tkoff(180, "LF", "A4.1", "linear", "li-ice-shield")]),
                li("li-flashing", "Step/counter flashing", 64, "LF", "Flashing", "07-620", "mapped", "07 – Thermal and Moisture Protection", "Medium", "Needs Review", [], [src(MAIN_PLAN_FILE_NAME, 10, "A4.1")], [tkoff(64, "LF", "A4.1", "linear", "li-flashing")]),
                li("li-ridge-vent", "Ridge vent — continuous", 42, "LF", "Ridge Vent", "07-310", "mapped", "07 – Thermal and Moisture Protection", "High", "Approved", [], [src(MAIN_PLAN_FILE_NAME, 10, "A4.1")], [tkoff(42, "LF", "A4.1", "linear", "li-ridge-vent")]),
              ],
            },
          ],
        },
      ],
    },
    {
      id: "ps-openings",
      name: "Openings",
      trades: [
        {
          id: "tr-doors",
          name: "Doors",
          sources: [src(MAIN_PLAN_FILE_NAME, 14, "A5.1")],
          assemblies: [
            {
              id: "asm-int-doors",
              name: "Interior Door Package",
              sources: [src(MAIN_PLAN_FILE_NAME, 14, "A5.1")],
              lineItems: [
                li("li-int-door", "Interior doors — solid core", 12, "EA", "Interior Doors", "08-140", "mapped", "08 – Openings", "High", "Approved", [], [src(MAIN_PLAN_FILE_NAME, 14, "A5.1")], [tkoff(12, "EA", "A5.1", "count", "li-int-door")]),
                li("li-door-hw", "Door hardware — lever set", 12, "EA", "Door Hardware", "08-140", "mapped", "08 – Openings", "High", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 14, "A5.1")], [tkoff(12, "EA", "A5.1", "count", "li-door-hw")]),
                li("li-door-frame", "Door frames — hollow metal", 12, "EA", "Door Frames", "08-140", "mapped", "08 – Openings", "High", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 14, "A5.1")], [tkoff(12, "EA", "A5.1", "count", "li-door-frame")]),
              ],
            },
          ],
        },
        {
          id: "tr-windows",
          name: "Windows",
          sources: [src(MAIN_PLAN_FILE_NAME, 15, "A5.2")],
          assemblies: [
            {
              id: "asm-windows",
              name: "Window Package",
              sources: [src(MAIN_PLAN_FILE_NAME, 15, "A5.2")],
              lineItems: [
                li("li-window", "Windows — double-hung vinyl", 8, "EA", "Windows", "08-500", "mapped", "08 – Openings", "High", "Approved", [], [src(MAIN_PLAN_FILE_NAME, 15, "A5.2")], [tkoff(8, "EA", "A5.2", "count", "li-window")]),
                li("li-window-flash", "Window flashing tape", 8, "EA", "Window Flashing", "08-500", "mapped", "08 – Openings", "High", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 15, "A5.2")], [tkoff(8, "EA", "A5.2", "count", "li-window-flash")]),
              ],
            },
          ],
        },
      ],
    },
    {
      id: "ps-finishes",
      name: "Finishes",
      trades: [
        {
          id: "tr-drywall",
          name: "Drywall",
          sources: [src(MAIN_PLAN_FILE_NAME, 8, "A1.1")],
          assemblies: [
            {
              id: "asm-drywall",
              name: "Interior Drywall System",
              sources: [src(MAIN_PLAN_FILE_NAME, 8, "A1.1")],
              lineItems: [
                li("li-drywall", "Drywall — interior partitions", 3200, "SF", "Drywall", "09-290", "mapped", "09 – Finishes", "Medium", "Needs Review", ["Conflicting Source"], [src(MAIN_PLAN_FILE_NAME, 8, "A1.1")], [tkoff(3200, "SF", "A1.1", "area", "li-drywall")], "SF may conflict with framing area"),
                li("li-drywall-tape", "Drywall tape & finish — Level 4", 3200, "SF", "Drywall Finish", "09-290", "mapped", "09 – Finishes", "Medium", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 8, "A1.1")], [tkoff(3200, "SF", "A1.1", "area", "li-drywall-tape")]),
              ],
            },
          ],
        },
        {
          id: "tr-painting",
          name: "Painting",
          sources: [src(MAIN_PLAN_FILE_NAME, 8, "A1.1")],
          assemblies: [
            {
              id: "asm-int-paint",
              name: "Interior Paint Package",
              sources: [src(MAIN_PLAN_FILE_NAME, 8, "A1.1")],
              lineItems: [
                li("li-paint", "Interior paint — premium finish", 4200, "SF", "Interior Paint", "09-910", "mapped", "09 – Finishes", "Medium", "Needs Review", ["Duplicate Item"], [src(MAIN_PLAN_FILE_NAME, 8, "A1.1")], [tkoff(4200, "SF", "A1.1", "area", "li-paint")], "May overlap with drywall SF"),
                li("li-paint-trim", "Trim paint — semi-gloss", 480, "LF", "Trim Paint", "09-910", "mapped", "09 – Finishes", "Medium", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 8, "A1.1")], [tkoff(480, "LF", "A1.1", "linear", "li-paint-trim")]),
              ],
            },
          ],
        },
        {
          id: "tr-finish-carp",
          name: "Finish Carpentry",
          sources: [src(MAIN_PLAN_FILE_NAME, 8, "A1.1")],
          assemblies: [
            {
              id: "asm-trim",
              name: "Trim Package",
              sources: [src(MAIN_PLAN_FILE_NAME, 8, "A1.1")],
              lineItems: [
                li("li-base-trim", "Base trim — painted MDF", 480, "LF", "Base Trim", "06-200", "mapped", "09 – Finishes", "Low", "Needs Review", ["Low Confidence", "Missing Source"], [src(MAIN_PLAN_FILE_NAME, 8, "A1.1")], []),
                li("li-crown", "Crown molding — living/dining", 120, "LF", "Crown Molding", "06-200", "mapped", "09 – Finishes", "Medium", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 8, "A1.1")], [tkoff(120, "LF", "A1.1", "linear", "li-crown")]),
              ],
            },
          ],
        },
      ],
    },
    {
      id: "ps-masonry",
      name: "Masonry",
      trades: [
        {
          id: "tr-brick",
          name: "Brick Veneer",
          sources: [src(MAIN_PLAN_FILE_NAME, 12, "A3.1")],
          assemblies: [
            {
              id: "asm-brick",
              name: "Front Elevation Brick",
              sources: [src(MAIN_PLAN_FILE_NAME, 12, "A3.1")],
              lineItems: [
                li("li-brick", "Brick veneer — front elevation", 680, "SF", "Brick Veneer", "04-210", "mapped", "04 – Masonry", "Medium", "Needs Review", [], [src(MAIN_PLAN_FILE_NAME, 12, "A3.1")], [tkoff(680, "SF", "A3.1", "area", "li-brick")]),
                li("li-brick-mortar", "Mortar & joint work", 680, "SF", "Mortar", "04-210", "mapped", "04 – Masonry", "Medium", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 12, "A3.1")], []),
                li("li-lintels", "Steel lintels — openings", 6, "EA", "Lintels", "04-210", "mapped", "05 – Metals", "High", "Approved", [], [src(MAIN_PLAN_FILE_NAME, 12, "A3.1")], [tkoff(6, "EA", "A3.1", "count", "li-lintels")]),
              ],
            },
          ],
        },
      ],
    },
    {
      id: "ps-mep",
      name: "MEP",
      trades: [
        {
          id: "tr-hvac",
          name: "HVAC",
          sources: [src(MAIN_PLAN_FILE_NAME, 18, "M1.1")],
          assemblies: [
            {
              id: "asm-hvac-dist",
              name: "HVAC Distribution",
              sources: [src(MAIN_PLAN_FILE_NAME, 18, "M1.1")],
              lineItems: [
                li("li-diffusers", "HVAC diffusers — ceiling mount", 14, "EA", "Diffusers", "23-370", "mapped", "23 – Heating, Ventilating, and Air Conditioning (HVAC)", "High", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 18, "M1.1")], [tkoff(14, "EA", "M1.1", "count", "li-diffusers")]),
                li("li-ductwork", "Supply ductwork", 240, "LF", "Ductwork", "23-300", "mapped", "23 – Heating, Ventilating, and Air Conditioning (HVAC)", "Medium", "Needs Review", ["Needs Clarification"], [src(MAIN_PLAN_FILE_NAME, 18, "M1.1")], []),
              ],
            },
          ],
        },
        {
          id: "tr-electrical",
          name: "Electrical",
          sources: [src(MAIN_PLAN_FILE_NAME, 20, "E1.1")],
          assemblies: [
            {
              id: "asm-elec-rough",
              name: "Electrical Rough-In",
              sources: [src(MAIN_PLAN_FILE_NAME, 20, "E1.1")],
              lineItems: [
                li("li-panel", "Main panel — 200A", 1, "EA", "Electrical Panel", "26-100", "mapped", "26 – Electrical", "High", "Approved", [], [src(MAIN_PLAN_FILE_NAME, 20, "E1.1")], [tkoff(1, "EA", "E1.1", "count", "li-panel")]),
                li("li-circuits", "Branch circuits — 20A", 18, "EA", "Branch Circuits", "26-200", "mapped", "26 – Electrical", "High", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 20, "E1.1")], [tkoff(18, "EA", "E1.1", "count", "li-circuits")]),
                li("li-recessed", "Recessed lighting — 6\" IC", 22, "EA", "Recessed Lighting", "26-500", "mapped", "26 – Electrical", "High", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 20, "E1.1")], [tkoff(22, "EA", "E1.1", "count", "li-recessed")]),
              ],
            },
          ],
        },
        {
          id: "tr-plumbing",
          name: "Plumbing",
          sources: [src(MAIN_PLAN_FILE_NAME, 19, "P1.1")],
          assemblies: [
            {
              id: "asm-plumb-rough",
              name: "Plumbing Rough-In",
              sources: [src(MAIN_PLAN_FILE_NAME, 19, "P1.1")],
              lineItems: [
                li("li-plumb-fix", "Plumbing fixtures — rough-in", 8, "EA", "Fixture Rough-In", "22-100", "mapped", "22 – Plumbing", "High", "Reviewed", [], [src(MAIN_PLAN_FILE_NAME, 19, "P1.1")], [tkoff(8, "EA", "P1.1", "count", "li-plumb-fix")]),
                li("li-plumb-drain", "DWV piping", 180, "LF", "Drain Piping", "22-100", "mapped", "22 – Plumbing", "Medium", "Needs Review", ["Missing Takeoff"], [src(MAIN_PLAN_FILE_NAME, 19, "P1.1")], []),
              ],
            },
          ],
        },
      ],
    },
    {
      id: "ps-gc",
      name: "General Conditions",
      trades: [
        {
          id: "tr-gc-temp",
          name: "Temporary Facilities",
          sources: [],
          assemblies: [
            {
              id: "asm-temp",
              name: "Temporary Services",
              sources: [],
              lineItems: [
                li("li-temp-power", "Temporary power & utilities", 1, "LS", "Temp Power", "01-500", "mapped", "01 – General Requirements", "Low", "Needs Review", ["Missing Source", "Low Confidence"], [], []),
                li("li-temp-toilet", "Portable toilets", 1, "LS", "Temp Sanitation", "01-500", "mapped", "01 – General Requirements", "Low", "Needs Review", ["Missing Source"], [], []),
                li("li-dumpster", "Construction dumpster", 4, "EA", "Waste Removal", null, "missing", "01 – General Requirements", "Medium", "Needs Review", ["Missing Cost Code"], [], []),
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getAllLineItems(project: ScopeProject): LineItem[] {
  const items: LineItem[] = [];
  for (const ps of project.parentScopes) {
    for (const t of ps.trades) {
      for (const a of t.assemblies) {
        items.push(...a.lineItems);
      }
    }
  }
  return items;
}

export function countItems(project: ScopeProject) {
  let parentScopes = 0, trades = 0, assemblies = 0, lineItems = 0;
  let needsReview = 0, missingCostCodes = 0, lowConfidence = 0, missingTakeoffs = 0;
  for (const ps of project.parentScopes) {
    parentScopes++;
    for (const t of ps.trades) {
      trades++;
      for (const a of t.assemblies) {
        assemblies++;
        for (const li of a.lineItems) {
          lineItems++;
          if (li.reviewStatus === "Needs Review") needsReview++;
          if (li.companyCostCodeStatus === "missing") missingCostCodes++;
          if (li.confidence === "Low") lowConfidence++;
          if (li.takeoffs.length === 0) missingTakeoffs++;
        }
      }
    }
  }
  return { parentScopes, trades, assemblies, lineItems, needsReview, missingCostCodes, lowConfidence, missingTakeoffs };
}

export function getParentScopeStats(ps: ParentScope) {
  let trades = 0, assemblies = 0, lineItems = 0, reviewed = 0, missingTakeoffs = 0, missingCostCodes = 0, issues = 0;
  for (const t of ps.trades) {
    trades++;
    for (const a of t.assemblies) {
      assemblies++;
      for (const li of a.lineItems) {
        lineItems++;
        if (li.reviewStatus !== "Needs Review") reviewed++;
        if (li.takeoffs.length === 0) missingTakeoffs++;
        if (li.companyCostCodeStatus === "missing") missingCostCodes++;
        if (li.issues.length > 0) issues++;
      }
    }
  }
  return { trades, assemblies, lineItems, reviewed, reviewedPct: lineItems ? Math.round((reviewed / lineItems) * 100) : 0, missingTakeoffs, missingCostCodes, issues };
}

export function getTradeStats(trade: Trade) {
  let assemblies = 0, lineItems = 0, reviewed = 0, missingTakeoffs = 0, missingCostCodes = 0, issues = 0;
  for (const a of trade.assemblies) {
    assemblies++;
    for (const li of a.lineItems) {
      lineItems++;
      if (li.reviewStatus !== "Needs Review") reviewed++;
      if (li.takeoffs.length === 0) missingTakeoffs++;
      if (li.companyCostCodeStatus === "missing") missingCostCodes++;
      if (li.issues.length > 0) issues++;
    }
  }
  return { assemblies, lineItems, reviewed, reviewedPct: lineItems ? Math.round((reviewed / lineItems) * 100) : 0, missingTakeoffs, missingCostCodes, issues };
}

export function getAssemblyStats(asm: Assembly) {
  const lineItems = asm.lineItems.length;
  const reviewed = asm.lineItems.filter(li => li.reviewStatus !== "Needs Review").length;
  const missingTakeoffs = asm.lineItems.filter(li => li.takeoffs.length === 0).length;
  const missingCostCodes = asm.lineItems.filter(li => li.companyCostCodeStatus === "missing").length;
  const issues = asm.lineItems.filter(li => li.issues.length > 0).length;
  return { lineItems, reviewed, reviewedPct: lineItems ? Math.round((reviewed / lineItems) * 100) : 0, missingTakeoffs, missingCostCodes, issues };
}
