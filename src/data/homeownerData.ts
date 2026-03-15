// ============================================================
// Homeowner Mock Data — Andrew Osterfeld Portal
// ============================================================

export const homeowner = {
  name: "Andrew Osterfeld",
  email: "andrew@osterfeld.com",
  phone: "(513) 555-0184",
  projectName: "Osterfeld Residence Renovation",
  location: "Cincinnati, OH",
  projectType: "Whole-home renovation + kitchen expansion + primary bath remodel",
  phase: "Active Construction",
  targetBudgetLow: 285000,
  targetBudgetHigh: 340000,
  selectedContractor: "Alder Ridge Builders",
  selectedProposalAmount: 312400,
  approvedChanges: 14850,
  invoicedToDate: 187200,
  paidToDate: 168400,
  projectedFinal: 331750,
};

export type ScopeStatus = "Included" | "Excluded" | "Allowance" | "Unclear" | "Not Mentioned";

export interface ContractorProposal {
  id: string;
  contractor: string;
  date: string;
  total: number;
  completenessScore: number;
  allowanceCount: number;
  exclusionCount: number;
  missingFlags: number;
  reviewStatus: "Reviewed" | "Needs Review" | "Under Review";
  paymentSchedule: string;
  notes: string;
  assumptions: string[];
  exclusions: string[];
  allowances: { item: string; amount: number }[];
  scopeCoverage: Record<string, ScopeStatus>;
}

export const scopeCategories = [
  "General Conditions",
  "Demolition",
  "Framing",
  "Structural Repairs",
  "Roofing",
  "Windows & Doors",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Insulation & Drywall",
  "Cabinets",
  "Countertops",
  "Tile",
  "Flooring",
  "Painting",
  "Fixtures",
  "Appliances",
  "Permits",
  "Cleanup & Punch",
];

export const proposals: ContractorProposal[] = [
  {
    id: "alder-ridge",
    contractor: "Alder Ridge Builders",
    date: "2025-11-14",
    total: 312400,
    completenessScore: 92,
    allowanceCount: 4,
    exclusionCount: 2,
    missingFlags: 1,
    reviewStatus: "Reviewed",
    paymentSchedule: "10% deposit, progress billing monthly, 10% at completion",
    notes: "Most comprehensive proposal. Includes waterproofing and permit handling. Clear scope breakdown by division.",
    assumptions: [
      "Existing framing is structurally sound unless noted during demo",
      "Owner to finalize fixture selections by Week 4",
      "Permit timeline estimated at 3–4 weeks",
    ],
    exclusions: [
      "Landscaping and exterior hardscape",
      "Window treatments and blinds",
    ],
    allowances: [
      { item: "Plumbing fixtures", amount: 8500 },
      { item: "Light fixtures", amount: 6200 },
      { item: "Appliances", amount: 14000 },
      { item: "Tile material", amount: 7800 },
    ],
    scopeCoverage: {
      "General Conditions": "Included",
      "Demolition": "Included",
      "Framing": "Included",
      "Structural Repairs": "Included",
      "Roofing": "Included",
      "Windows & Doors": "Included",
      "Plumbing": "Included",
      "Electrical": "Included",
      "HVAC": "Included",
      "Insulation & Drywall": "Included",
      "Cabinets": "Included",
      "Countertops": "Included",
      "Tile": "Allowance",
      "Flooring": "Included",
      "Painting": "Included",
      "Fixtures": "Allowance",
      "Appliances": "Allowance",
      "Permits": "Included",
      "Cleanup & Punch": "Included",
    },
  },
  {
    id: "summit-oak",
    contractor: "Summit Oak Construction",
    date: "2025-11-18",
    total: 278900,
    completenessScore: 71,
    allowanceCount: 6,
    exclusionCount: 5,
    missingFlags: 6,
    reviewStatus: "Reviewed",
    paymentSchedule: "15% deposit, bi-weekly draws, 5% holdback",
    notes: "Lowest bid but significant scope gaps. No painting, no permit handling, vague fixture language. Payment terms aggressive.",
    assumptions: [
      "All MEP systems adequate for renovation scope",
      "No hazardous material abatement required",
      "Owner responsible for appliance procurement",
    ],
    exclusions: [
      "Interior and exterior painting",
      "Permit procurement and fees",
      "Appliance supply and installation",
      "Waterproofing and moisture barriers",
      "Final cleaning and debris removal",
    ],
    allowances: [
      { item: "Plumbing fixtures", amount: 4500 },
      { item: "Light fixtures", amount: 3200 },
      { item: "Tile material", amount: 5000 },
      { item: "Countertops", amount: 6000 },
      { item: "Flooring material", amount: 7500 },
      { item: "Cabinet hardware", amount: 1200 },
    ],
    scopeCoverage: {
      "General Conditions": "Included",
      "Demolition": "Included",
      "Framing": "Included",
      "Structural Repairs": "Unclear",
      "Roofing": "Included",
      "Windows & Doors": "Included",
      "Plumbing": "Included",
      "Electrical": "Included",
      "HVAC": "Unclear",
      "Insulation & Drywall": "Included",
      "Cabinets": "Included",
      "Countertops": "Allowance",
      "Tile": "Allowance",
      "Flooring": "Allowance",
      "Painting": "Excluded",
      "Fixtures": "Allowance",
      "Appliances": "Excluded",
      "Permits": "Excluded",
      "Cleanup & Punch": "Excluded",
    },
  },
  {
    id: "northline",
    contractor: "Northline Homes",
    date: "2025-11-21",
    total: 298750,
    completenessScore: 83,
    allowanceCount: 5,
    exclusionCount: 3,
    missingFlags: 3,
    reviewStatus: "Reviewed",
    paymentSchedule: "10% deposit, monthly progress billing, 10% at substantial completion",
    notes: "Mid-range proposal. Generally solid but lower fixture and appliance allowances than peers. Painting included. Permits included.",
    assumptions: [
      "Standard residential renovation complexity",
      "Owner selections finalized before ordering",
      "One round of paint color selection included",
    ],
    exclusions: [
      "Landscaping restoration",
      "Smart home / low-voltage wiring",
      "Window treatments",
    ],
    allowances: [
      { item: "Plumbing fixtures", amount: 5500 },
      { item: "Light fixtures", amount: 4000 },
      { item: "Appliances", amount: 10000 },
      { item: "Tile material", amount: 5500 },
      { item: "Countertops", amount: 7000 },
    ],
    scopeCoverage: {
      "General Conditions": "Included",
      "Demolition": "Included",
      "Framing": "Included",
      "Structural Repairs": "Included",
      "Roofing": "Not Mentioned",
      "Windows & Doors": "Included",
      "Plumbing": "Included",
      "Electrical": "Included",
      "HVAC": "Included",
      "Insulation & Drywall": "Included",
      "Cabinets": "Included",
      "Countertops": "Allowance",
      "Tile": "Allowance",
      "Flooring": "Included",
      "Painting": "Included",
      "Fixtures": "Allowance",
      "Appliances": "Allowance",
      "Permits": "Included",
      "Cleanup & Punch": "Included",
    },
  },
];

export const euclidScopeNotes: Record<string, string> = {
  "General Conditions": "All three proposals include general conditions.",
  "Demolition": "Included across all proposals.",
  "Framing": "Included across all proposals.",
  "Structural Repairs": "Summit Oak language is vague — unclear if structural repair is included or limited to framing only.",
  "Roofing": "Not mentioned in Northline proposal. Confirm whether roofing work is part of renovation scope.",
  "Windows & Doors": "Included across all proposals.",
  "Plumbing": "Included across all proposals. Fixture allowances vary significantly ($4,500–$8,500).",
  "Electrical": "Included across all proposals.",
  "HVAC": "Summit Oak HVAC language is unclear — may be limited to reconnection only.",
  "Insulation & Drywall": "Included across all proposals.",
  "Cabinets": "Included across all proposals.",
  "Countertops": "Alder Ridge includes countertops in base scope. Summit Oak and Northline use allowances ($6,000–$7,000).",
  "Tile": "All three use allowances. Alder Ridge allowance ($7,800) is materially higher than Summit Oak ($5,000).",
  "Flooring": "Summit Oak uses a $7,500 flooring allowance. Others include flooring in base scope.",
  "Painting": "Summit Oak explicitly excludes all painting. This is a significant scope gap.",
  "Fixtures": "Allowance amounts range from $3,200 to $6,200 for light fixtures. Owner should clarify fixture expectations.",
  "Appliances": "Summit Oak excludes appliance supply entirely. Alder Ridge allows $14,000. Northline allows $10,000.",
  "Permits": "Summit Oak excludes permit procurement and fees. Alder Ridge and Northline include permits.",
  "Cleanup & Punch": "Summit Oak excludes final cleaning. Included in other proposals.",
};

export interface BudgetCategory {
  category: string;
  originalBudget: number;
  approvedChanges: number;
  invoiced: number;
  paid: number;
  remaining: number;
  projectedFinal: number;
  status: "On Track" | "Watch" | "Over Budget" | "Needs Review";
}

export const budgetCategories: BudgetCategory[] = [
  { category: "General Conditions", originalBudget: 18500, approvedChanges: 0, invoiced: 14200, paid: 14200, remaining: 4300, projectedFinal: 18500, status: "On Track" },
  { category: "Demolition", originalBudget: 12800, approvedChanges: 0, invoiced: 12800, paid: 12800, remaining: 0, projectedFinal: 12800, status: "On Track" },
  { category: "Framing", originalBudget: 28400, approvedChanges: 0, invoiced: 28400, paid: 28400, remaining: 0, projectedFinal: 28400, status: "On Track" },
  { category: "Structural Repairs", originalBudget: 8200, approvedChanges: 4200, invoiced: 12400, paid: 12400, remaining: 0, projectedFinal: 12400, status: "Over Budget" },
  { category: "Roofing", originalBudget: 14600, approvedChanges: 0, invoiced: 14600, paid: 12000, remaining: 0, projectedFinal: 14600, status: "On Track" },
  { category: "Windows & Doors", originalBudget: 22100, approvedChanges: 0, invoiced: 18500, paid: 18500, remaining: 3600, projectedFinal: 22100, status: "On Track" },
  { category: "Plumbing", originalBudget: 26800, approvedChanges: 2800, invoiced: 21400, paid: 18200, remaining: 8200, projectedFinal: 29600, status: "Watch" },
  { category: "Electrical", originalBudget: 24200, approvedChanges: 3500, invoiced: 19800, paid: 17600, remaining: 7900, projectedFinal: 27700, status: "Watch" },
  { category: "HVAC", originalBudget: 18900, approvedChanges: 0, invoiced: 12400, paid: 10800, remaining: 6500, projectedFinal: 18900, status: "On Track" },
  { category: "Insulation & Drywall", originalBudget: 16400, approvedChanges: 0, invoiced: 0, paid: 0, remaining: 16400, projectedFinal: 16400, status: "On Track" },
  { category: "Cabinets", originalBudget: 32000, approvedChanges: 0, invoiced: 16000, paid: 16000, remaining: 16000, projectedFinal: 32000, status: "On Track" },
  { category: "Countertops", originalBudget: 12500, approvedChanges: 0, invoiced: 0, paid: 0, remaining: 12500, projectedFinal: 12500, status: "On Track" },
  { category: "Tile", originalBudget: 9800, approvedChanges: 1850, invoiced: 0, paid: 0, remaining: 11650, projectedFinal: 11650, status: "Watch" },
  { category: "Flooring", originalBudget: 18200, approvedChanges: 0, invoiced: 0, paid: 0, remaining: 18200, projectedFinal: 18200, status: "On Track" },
  { category: "Painting", originalBudget: 14800, approvedChanges: 0, invoiced: 0, paid: 0, remaining: 14800, projectedFinal: 14800, status: "On Track" },
  { category: "Fixtures", originalBudget: 6200, approvedChanges: 2500, invoiced: 4200, paid: 3500, remaining: 4500, projectedFinal: 8700, status: "Over Budget" },
  { category: "Appliances", originalBudget: 14000, approvedChanges: 0, invoiced: 12500, paid: 12500, remaining: 1500, projectedFinal: 14000, status: "On Track" },
  { category: "Permits", originalBudget: 4800, approvedChanges: 0, invoiced: 0, paid: 0, remaining: 4800, projectedFinal: 4800, status: "On Track" },
  { category: "Cleanup & Punch", originalBudget: 9900, approvedChanges: 0, invoiced: 0, paid: 0, remaining: 9900, projectedFinal: 9900, status: "On Track" },
];

export interface Invoice {
  id: string;
  number: string;
  contractor: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  status: "Looks Aligned" | "Needs Review" | "Unclear Source" | "Potential Overlap" | "Budget Impact High";
  euclidNote: string;
}

export const invoices: Invoice[] = [
  { id: "inv-01", number: "INV-001", contractor: "Alder Ridge Builders", date: "2026-01-08", amount: 31240, category: "General Conditions", description: "10% project deposit per contract terms", status: "Looks Aligned", euclidNote: "Deposit matches contract payment schedule." },
  { id: "inv-02", number: "INV-002", contractor: "Alder Ridge Builders", date: "2026-01-22", amount: 12800, category: "Demolition", description: "Complete interior demolition — kitchen, primary bath, hallways", status: "Looks Aligned", euclidNote: "Demolition scope and amount consistent with proposal." },
  { id: "inv-03", number: "INV-003", contractor: "Alder Ridge Builders", date: "2026-02-05", amount: 28400, category: "Framing", description: "Framing — kitchen expansion wall, header modifications, bath reconfiguration", status: "Looks Aligned", euclidNote: "Framing invoice aligns with approved scope and proposal amount." },
  { id: "inv-04", number: "INV-004", contractor: "Alder Ridge Builders", date: "2026-02-12", amount: 12400, category: "Structural Repairs", description: "Structural repair — compromised floor joists discovered during demo, sistered joists, new beam", status: "Budget Impact High", euclidNote: "Amount exceeds original structural budget by $4,200. Related to approved CO-002." },
  { id: "inv-05", number: "INV-005", contractor: "Alder Ridge Builders", date: "2026-02-20", amount: 14600, category: "Roofing", description: "Roofing — tie-in at kitchen expansion, new flashing and underlayment", status: "Looks Aligned", euclidNote: "Roofing scope consistent with expansion requirements." },
  { id: "inv-06", number: "INV-006", contractor: "Alder Ridge Builders", date: "2026-03-01", amount: 18500, category: "Windows & Doors", description: "Window and exterior door installation — 8 windows, 2 exterior doors", status: "Looks Aligned", euclidNote: "Window count and pricing aligned with proposal." },
  { id: "inv-07", number: "INV-007", contractor: "Alder Ridge Builders", date: "2026-03-08", amount: 19800, category: "Electrical", description: "Electrical rough-in — new panel, kitchen circuits, bath circuits, recessed lighting", status: "Needs Review", euclidNote: "Electrical rough-in invoice appears higher than expected relative to original proposal. Includes recessed lighting from CO-003." },
  { id: "inv-08", number: "INV-008", contractor: "Alder Ridge Builders", date: "2026-03-10", amount: 21400, category: "Plumbing", description: "Plumbing rough-in — kitchen and bath supply/waste relocation, new valves", status: "Needs Review", euclidNote: "Plumbing amount includes fixture rough-in but fixture allowance not yet applied. Confirm final fixture selection status." },
  { id: "inv-09", number: "INV-009", contractor: "Alder Ridge Builders", date: "2026-03-12", amount: 16000, category: "Cabinets", description: "Cabinet deposit — 50% per supplier terms", status: "Looks Aligned", euclidNote: "Cabinet deposit aligns with approved schedule." },
  { id: "inv-10", number: "INV-010", contractor: "Alder Ridge Builders", date: "2026-03-14", amount: 12500, category: "Appliances", description: "Appliance package — range, refrigerator, dishwasher, hood, microwave", status: "Potential Overlap", euclidNote: "Appliance total within allowance but verify hood wasn't included in electrical scope." },
];

export interface ChangeOrder {
  id: string;
  number: string;
  contractor: string;
  date: string;
  amount: number;
  category: string;
  reason: string;
  status: "Pending Review" | "Approved" | "Needs Clarification" | "Budget Impact High";
  impactLevel: "Low" | "Medium" | "High";
  euclidNote: string;
  type: "Owner Upgrade" | "Unforeseen Condition" | "Scope Ambiguity" | "Allowance Overrun";
  relatedProposalLanguage?: string;
}

export const changeOrders: ChangeOrder[] = [
  {
    id: "co-01", number: "CO-001", contractor: "Alder Ridge Builders", date: "2026-02-08",
    amount: 2800, category: "Plumbing", reason: "Plumbing fixture upgrade — owner selected higher-end faucets and shower system above allowance",
    status: "Approved", impactLevel: "Medium", type: "Allowance Overrun",
    euclidNote: "Owner selections exceeded the $8,500 plumbing fixture allowance by $2,800. This is an owner-driven upgrade, not a contractor scope change.",
    relatedProposalLanguage: "Plumbing fixtures: $8,500 allowance. Owner to select from approved suppliers.",
  },
  {
    id: "co-02", number: "CO-002", contractor: "Alder Ridge Builders", date: "2026-02-10",
    amount: 4200, category: "Structural Repairs", reason: "Structural repair — compromised floor joists discovered after demo, not visible during pre-construction inspection",
    status: "Approved", impactLevel: "High", type: "Unforeseen Condition",
    euclidNote: "True unforeseen condition. Joist damage was concealed behind existing finishes. Repair scope is reasonable for the condition described.",
    relatedProposalLanguage: "Structural repairs included for visible conditions. Hidden conditions subject to change order.",
  },
  {
    id: "co-03", number: "CO-003", contractor: "Alder Ridge Builders", date: "2026-02-25",
    amount: 3500, category: "Electrical", reason: "Added recessed lighting package — 12 additional recessed lights in kitchen and living areas per owner request",
    status: "Approved", impactLevel: "Medium", type: "Owner Upgrade",
    euclidNote: "Owner-requested addition. Original proposal included can lights in kitchen only. This extends lighting into adjacent living area.",
    relatedProposalLanguage: "Electrical: per plan. Kitchen recessed lighting included. Living area not in original scope.",
  },
  {
    id: "co-04", number: "CO-004", contractor: "Alder Ridge Builders", date: "2026-03-02",
    amount: 1850, category: "Tile", reason: "Tile material upgrade — owner selected large-format porcelain requiring modified substrate and layout",
    status: "Approved", impactLevel: "Low", type: "Allowance Overrun",
    euclidNote: "Material selection exceeds tile allowance. Additional cost includes modified substrate prep for large-format tile.",
    relatedProposalLanguage: "Tile: $7,800 material allowance. Standard subway or field tile assumed.",
  },
  {
    id: "co-05", number: "CO-005", contractor: "Alder Ridge Builders", date: "2026-03-10",
    amount: 2500, category: "Fixtures", reason: "Upgraded vanity lighting and bath accessories — owner selected designer fixtures above allowance",
    status: "Pending Review", impactLevel: "Medium", type: "Allowance Overrun",
    euclidNote: "Light fixture selections exceed the $6,200 allowance by $2,500. Review whether all selections are finalized before approving.",
    relatedProposalLanguage: "Light fixtures: $6,200 allowance. Standard residential grade assumed.",
  },
];

export interface Document {
  id: string;
  name: string;
  type: "Proposal" | "Contract" | "Invoice" | "Change Order" | "Plans" | "Selections" | "Receipt" | "Notes";
  uploadDate: string;
  contractor?: string;
  category?: string;
  extractedSummary?: string;
}

export const documents: Document[] = [
  { id: "doc-01", name: "Alder Ridge Builders — Proposal Rev 2.pdf", type: "Proposal", uploadDate: "2025-11-14", contractor: "Alder Ridge Builders", extractedSummary: "Complete renovation proposal. $312,400 total." },
  { id: "doc-02", name: "Summit Oak Construction — Proposal.pdf", type: "Proposal", uploadDate: "2025-11-18", contractor: "Summit Oak Construction", extractedSummary: "Renovation proposal. $278,900 total. Multiple exclusions noted." },
  { id: "doc-03", name: "Northline Homes — Proposal.pdf", type: "Proposal", uploadDate: "2025-11-21", contractor: "Northline Homes", extractedSummary: "Mid-range proposal. $298,750 total." },
  { id: "doc-04", name: "Signed Contract — Alder Ridge Builders.pdf", type: "Contract", uploadDate: "2025-12-05", contractor: "Alder Ridge Builders", extractedSummary: "Executed construction agreement. $312,400 contract sum." },
  { id: "doc-05", name: "Kitchen Expansion Floor Plan.pdf", type: "Plans", uploadDate: "2025-10-28", category: "Architectural", extractedSummary: "Architectural plans for kitchen expansion and bath remodel." },
  { id: "doc-06", name: "Cabinet Selection Sheet.pdf", type: "Selections", uploadDate: "2026-01-15", category: "Cabinets", extractedSummary: "Owner cabinet selections — Shaker style, white oak finish." },
  { id: "doc-07", name: "Fixture Selection Worksheet.pdf", type: "Selections", uploadDate: "2026-01-20", category: "Fixtures", extractedSummary: "Plumbing and lighting fixture selections with pricing." },
  { id: "doc-08", name: "Appliance Purchase Receipt.pdf", type: "Receipt", uploadDate: "2026-03-12", category: "Appliances", extractedSummary: "Appliance package receipt — $12,500 total." },
];

export const recentActivity = [
  { date: "2026-03-14", description: "Invoice INV-010 submitted — Appliance package ($12,500)" },
  { date: "2026-03-12", description: "Appliance purchase receipt uploaded" },
  { date: "2026-03-10", description: "Change Order CO-005 received — Fixture upgrade ($2,500)" },
  { date: "2026-03-08", description: "Invoice INV-007 submitted — Electrical rough-in ($19,800)" },
  { date: "2026-03-02", description: "Change Order CO-004 approved — Tile material upgrade ($1,850)" },
  { date: "2026-02-25", description: "Change Order CO-003 approved — Recessed lighting ($3,500)" },
  { date: "2026-02-20", description: "Invoice INV-005 submitted — Roofing ($14,600)" },
  { date: "2026-02-10", description: "Change Order CO-002 approved — Structural repair ($4,200)" },
];

export const openActions = [
  { priority: "High", action: "Review Change Order CO-005 — fixture upgrade ($2,500)", category: "Change Orders" },
  { priority: "High", action: "Review Invoice INV-007 — electrical rough-in appears higher than expected", category: "Invoices" },
  { priority: "Medium", action: "Review Invoice INV-008 — confirm plumbing fixture selection status", category: "Invoices" },
  { priority: "Medium", action: "Compare cabinet allowance exposure across remaining selections", category: "Budget" },
  { priority: "Low", action: "Verify appliance hood not double-counted in electrical scope", category: "Invoices" },
  { priority: "Low", action: "Ask contractor to clarify flooring finish schedule", category: "Budget" },
];
