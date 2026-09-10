/**
 * Euclid connected financial model.
 *
 * One lifecycle, one set of numbers:
 *   Estimate -> Original Budget -> Commitments -> Costs -> Forecast -> Actual Performance
 *   Client Price -> Original Contract -> Approved Changes -> Current Contract -> Billing -> Payments
 *
 * Every screen (Budget, Costs, Commitments, Changes, Client Billing, Cost Inbox,
 * Selections) reads from this module. Nothing is duplicated between screens.
 */

import { getProject, isConstructionActive, money } from "./demoUniverse";

/* ------------------------------------------------------------------ types */

export type CostType =
  | "Vendor Invoice" | "Subcontractor Invoice" | "Receipt" | "Credit Card"
  | "Internal Labor" | "Reimbursement" | "Manual Expense" | "QBO Transaction" | "Credit";

export type CostSource = "QBO" | "Invoice Upload" | "Receipt Upload" | "Card Feed" | "Time Clock" | "Manual" | "Vendor Statement" | "Email";
export type ApprovalStatus = "Received" | "Needs Review" | "Approved" | "Synced to QBO" | "Paid";
export type SyncStatus = "Not synced" | "Queued" | "Synced" | "Mismatch";

export interface BudgetLine {
  id: string;
  projectId: string;
  group: string;              // estimate structure parent (e.g. Carpentry)
  name: string;               // leaf (e.g. Rough Framing)
  costCode: string;
  trade: string;
  phase: string;
  estimateLine: string;       // lineage back to preconstruction estimate
  originalBudget: number;
  approvedChanges: number;    // approved budget adjustments
  committed: number;          // current commitment value against this line
  actual: number;             // posted actual cost
  forecastUncommitted: number;// forecast cost not yet committed
  euclidForecast: number;     // Euclid forecast at completion
  pmForecast?: number;
  pmForecastReason?: string;
  pmForecastBy?: string;
  pmForecastAt?: string;
  pendingExposure: number;    // unapproved potential cost
  clientPrice: number;        // sell price carried for this scope
  percentComplete: number;    // installed progress from schedule
  allowance?: number;         // budget allowance amount, if this line is an allowance
}

export interface CostRecord {
  id: string;
  projectId: string;
  companyId?: string;         // Network company
  vendor: string;
  type: CostType;
  source: CostSource;
  number: string;
  date: string;
  dueDate?: string;
  amount: number;
  tax: number;
  budgetLineId: string;
  commitmentId?: string;
  selectionId?: string;
  changeId?: string;
  approval: ApprovalStatus;
  sync: SyncStatus;
  description: string;
  attachment?: string;
  financial: boolean;         // false = production only (fixed-price sub labor)
}

export interface Commitment {
  id: string;
  projectId: string;
  companyId?: string;
  company: string;
  type: "Subcontract" | "Purchase Order" | "Vendor Order" | "Rental Agreement" | "T&M Authorization" | "Service Agreement";
  scope: string;
  original: number;
  approvedChanges: number;
  invoiced: number;
  paid: number;
  retainagePct: number;
  status: "Draft" | "Executed" | "In Progress" | "Closed" | "Exception";
  source: string;             // e.g. "Awarded bid — Bid Packages"
  budgetLineIds: string[];
  billedPct?: number;         // for progress-billing comparison
  schedulePct?: number;
}

export interface ChangeRecord {
  id: string;
  projectId: string;
  title: string;
  kind: "Owner Change" | "Sub/Vendor Change" | "Internal Budget Change";
  source: string;
  scope: string;
  costImpact: number;
  clientImpact: number;       // 0 for internal / sub-only changes
  markupPct: number;
  scheduleDays: number;
  fundingSource: "Client Contract" | "Contingency" | "Budget Transfer" | "Commitment";
  status: "Draft" | "Potential" | "Pricing" | "Submitted" | "Approved" | "Rejected" | "Needs Review";
  budgetLineId?: string;
  commitmentId?: string;
  selectionId?: string;
  date: string;
}

export interface ClientInvoice {
  id: string;
  projectId: string;
  number: string;
  method: "Progress Billing" | "Fixed Amount" | "Milestone" | "Cost Plus" | "Deposit";
  periodFrom: string;
  periodTo: string;
  issued: string;
  due: string;
  amount: number;
  retainage: number;
  paid: number;
  status: "Draft" | "Sent" | "Partially Paid" | "Paid" | "Overdue";
  lines: { scope: string; contract: number; previouslyBilled: number; thisInvoice: number }[];
}

export interface ClientPayment {
  id: string; projectId: string; invoiceId: string; date: string; amount: number;
  method: "ACH" | "Check" | "Wire" | "Card"; reference: string; sync: SyncStatus;
}

export interface Selection {
  id: string;
  projectId: string;
  title: string;
  category: string;
  description: string;
  status: "Not Started" | "Requested" | "Reviewing" | "Selected" | "Approved" | "Ordered" | "Received" | "Installed";
  decisionDue: string;
  requiredOnSite: string;
  leadTimeWeeks: number;
  allowanceLineId?: string;
  allowance: number;
  selectedItem?: string;
  vendor?: string;
  companyId?: string;
  cost?: number;
  markupPct: number;
  commitmentId?: string;
  changeId?: string;
  scheduleActivity?: string;
  notes?: string;
  overdueDays?: number;
}

export interface InboxLine { description: string; amount: number; suggestedLineId: string; confidence: number; }

export interface InboxItem {
  id: string;
  vendor: string;
  companyId?: string;
  docType: "Invoice" | "Receipt" | "Credit" | "Statement" | "Subcontractor Application";
  number?: string;
  projectId?: string;
  amount: number;
  tax: number;
  date: string;
  dueDate?: string;
  source: CostSource;
  suggestedLineId?: string;
  commitmentId?: string;
  selectionId?: string;
  confidence: number;
  state: "Ready" | "Needs Review" | "Exception" | "Posted";
  exception?: { kind: string; detail: string; actions: string[] };
  lines: InboxLine[];
  card?: string;
  terms?: string;
}

export interface ForecastSnapshot { date: string; variance: number; }
export interface BudgetRevision { date: string; user: string; lineId: string; from: number; to: number; reason: string; source: string; }
export interface Contingency { original: number; allocations: { date: string; reason: string; amount: number; user: string; source: string }[]; }

export interface ProjectContract {
  originalContract: number;
  approvedClientChanges: number;
  retainagePct: number;
  originalMarginPct: number;
  billingMethod: ClientInvoice["method"];
}

/* ------------------------------------------------------------- budget data */

const line = (
  projectId: string, id: string, group: string, name: string, costCode: string, trade: string, phase: string,
  v: Partial<BudgetLine> & { originalBudget: number; committed: number; actual: number; euclidForecast: number; clientPrice: number },
): BudgetLine => ({
  projectId, id, group, name, costCode, trade, phase,
  estimateLine: `${costCode} · ${name}`,
  approvedChanges: 0, forecastUncommitted: 0, pendingExposure: 0, percentComplete: 0,
  ...v,
});

export const budgetLines: BudgetLine[] = [
  /* ---------------- Downtown TI — Suite 400 (construction, commercial) --- */
  line("downtown-ti", "dt-gc-super", "General Conditions", "Supervision", "01-310", "General Conditions", "Construction", { originalBudget: 68000, approvedChanges: 3200, committed: 71200, actual: 63400, forecastUncommitted: 8600, euclidForecast: 72000, clientPrice: 81600, percentComplete: 88 }),
  line("downtown-ti", "dt-gc-temp", "General Conditions", "Temporary Facilities", "01-500", "General Conditions", "Construction", { originalBudget: 21500, committed: 19800, actual: 18900, forecastUncommitted: 1400, euclidForecast: 20300, clientPrice: 25800, percentComplete: 92 }),
  line("downtown-ti", "dt-demo", "Sitework & Demo", "Selective Demolition", "02-410", "Demolition", "Demolition", { originalBudget: 46500, committed: 44900, actual: 44900, euclidForecast: 44900, clientPrice: 55800, percentComplete: 100 }),
  line("downtown-ti", "dt-carp-rough", "Carpentry", "Rough Framing", "06-110", "Carpentry", "Framing", { originalBudget: 92750, approvedChanges: 3700, committed: 96450, actual: 88200, forecastUncommitted: 4900, euclidForecast: 93100, clientPrice: 115740, percentComplete: 96 }),
  line("downtown-ti", "dt-carp-finish", "Carpentry", "Finish Carpentry", "06-200", "Carpentry", "Interior Finishes", { originalBudget: 58400, committed: 54200, actual: 41800, forecastUncommitted: 21000, euclidForecast: 62800, pendingExposure: 6200, clientPrice: 70080, percentComplete: 45 }),
  line("downtown-ti", "dt-carp-mill", "Carpentry", "Millwork", "06-400", "Carpentry", "Interior Finishes", { originalBudget: 74600, committed: 74600, actual: 52200, forecastUncommitted: 21400, euclidForecast: 73600, clientPrice: 89520, percentComplete: 68 }),
  line("downtown-ti", "dt-drywall", "Interior Finishes", "Drywall & Framing Board", "09-250", "Drywall", "Interior Finishes", { originalBudget: 128400, approvedChanges: 9200, committed: 136800, actual: 129900, forecastUncommitted: 7300, euclidForecast: 137200, clientPrice: 165120, percentComplete: 94 }),
  line("downtown-ti", "dt-flooring", "Interior Finishes", "Flooring", "09-650", "Flooring", "Interior Finishes", { originalBudget: 84200, committed: 82600, actual: 61300, forecastUncommitted: 22800, euclidForecast: 84100, clientPrice: 101040, percentComplete: 72 }),
  line("downtown-ti", "dt-paint", "Interior Finishes", "Painting", "09-900", "Painting", "Interior Finishes", { originalBudget: 39800, committed: 37400, actual: 22600, forecastUncommitted: 15600, euclidForecast: 38200, clientPrice: 47760, percentComplete: 58 }),
  line("downtown-ti", "dt-elec", "MEP", "Electrical", "26-000", "Electrical", "MEP Rough", { originalBudget: 168900, approvedChanges: 14600, committed: 183500, actual: 172400, forecastUncommitted: 12800, euclidForecast: 185200, pendingExposure: 9400, clientPrice: 220200, percentComplete: 89 }),
  line("downtown-ti", "dt-mech", "MEP", "HVAC", "23-000", "HVAC", "MEP Rough", { originalBudget: 142600, approvedChanges: 11100, committed: 153700, actual: 148300, forecastUncommitted: 6100, euclidForecast: 154400, clientPrice: 184440, percentComplete: 93 }),
  line("downtown-ti", "dt-plumb", "MEP", "Plumbing", "22-000", "Plumbing", "MEP Rough", { originalBudget: 68850, committed: 66900, actual: 64800, forecastUncommitted: 2600, euclidForecast: 67400, clientPrice: 82620, percentComplete: 95 }),
  line("downtown-ti", "dt-allow-appl", "Allowances", "Appliance Allowance", "11-300", "Equipment", "Interior Finishes", { originalBudget: 20000, committed: 0, actual: 0, forecastUncommitted: 20000, euclidForecast: 20000, clientPrice: 24000, allowance: 20000, percentComplete: 0 }),

  /* --------------------------------- Fregolle Residence (starting up) --- */
  line("fregolle", "fr-gc", "General Conditions", "Supervision & General Requirements", "01-310", "General Conditions", "Preconstruction", { originalBudget: 73000, committed: 24000, actual: 8600, forecastUncommitted: 62400, euclidForecast: 71000, clientPrice: 87600, percentComplete: 12 }),
  line("fregolle", "fr-site", "Sitework", "Excavation & Site Prep", "31-000", "Sitework", "Sitework", { originalBudget: 105000, approvedChanges: 6400, committed: 111400, actual: 96800, forecastUncommitted: 12200, euclidForecast: 109000, clientPrice: 133680, percentComplete: 84 }),
  line("fregolle", "fr-concrete", "Concrete", "Foundations & Flatwork", "03-300", "Concrete", "Foundation", { originalBudget: 185000, committed: 181200, actual: 158900, forecastUncommitted: 20400, euclidForecast: 179300, clientPrice: 222000, percentComplete: 86 }),
  line("fregolle", "fr-carp-rough", "Carpentry", "Rough Framing", "06-110", "Carpentry", "Framing", { originalBudget: 131850, committed: 131850, actual: 62400, forecastUncommitted: 51200, euclidForecast: 113650, clientPrice: 158220, percentComplete: 52 }),
  line("fregolle", "fr-carp-finish", "Carpentry", "Finish Carpentry", "06-200", "Carpentry", "Interior Finishes", { originalBudget: 62400, committed: 41800, actual: 12600, forecastUncommitted: 54200, euclidForecast: 66800, pendingExposure: 4400, clientPrice: 74880, percentComplete: 18 }),
  line("fregolle", "fr-carp-mill", "Carpentry", "Millwork", "06-400", "Carpentry", "Interior Finishes", { originalBudget: 84500, committed: 0, actual: 0, forecastUncommitted: 88200, euclidForecast: 88200, pendingExposure: 3700, clientPrice: 101400, percentComplete: 0 }),
  line("fregolle", "fr-hardware", "Carpentry", "Framing Hardware", "06-050", "Carpentry", "Framing", { originalBudget: 9800, committed: 6400, actual: 5240, forecastUncommitted: 3900, euclidForecast: 9140, clientPrice: 11760, percentComplete: 58 }),
  line("fregolle", "fr-roof", "Roofing", "Roofing & Flashing", "07-300", "Roofing", "Exterior", { originalBudget: 112000, committed: 108500, actual: 0, forecastUncommitted: 108500, euclidForecast: 108500, clientPrice: 134400, percentComplete: 0 }),
  line("fregolle", "fr-openings", "Openings", "Windows & Exterior Doors", "08-500", "Openings", "Exterior", { originalBudget: 98000, committed: 94600, actual: 47300, forecastUncommitted: 47300, euclidForecast: 94600, clientPrice: 117600, percentComplete: 50 }),
  line("fregolle", "fr-mep", "MEP", "Mechanical, Electrical & Plumbing", "20-000", "MEP", "MEP Rough", { originalBudget: 189150, committed: 176400, actual: 61200, forecastUncommitted: 122800, euclidForecast: 184000, clientPrice: 226980, percentComplete: 32 }),
  line("fregolle", "fr-allow-plumb", "Allowances", "Plumbing Fixture Allowance", "22-400", "Plumbing", "Interior Finishes", { originalBudget: 20000, committed: 0, actual: 0, forecastUncommitted: 27500, euclidForecast: 27500, pendingExposure: 7500, clientPrice: 24000, allowance: 20000, percentComplete: 0 }),
  line("fregolle", "fr-allow-tops", "Allowances", "Countertop Allowance", "12-360", "Finishes", "Interior Finishes", { originalBudget: 18000, committed: 0, actual: 0, forecastUncommitted: 21400, euclidForecast: 21400, pendingExposure: 3400, clientPrice: 21600, allowance: 18000, percentComplete: 0 }),
  line("fregolle", "fr-finishes", "Interior Finishes", "Interior Finishes", "09-000", "Finishes", "Interior Finishes", { originalBudget: 162000, committed: 42800, actual: 6200, forecastUncommitted: 158900, euclidForecast: 165100, clientPrice: 194400, percentComplete: 6 }),
];

export const contracts: Record<string, ProjectContract> = {
  "downtown-ti": { originalContract: 1097400, approvedClientChanges: 51900, retainagePct: 10, originalMarginPct: 16.7, billingMethod: "Progress Billing" },
  fregolle: { originalContract: 1418880, approvedClientChanges: 7680, retainagePct: 10, originalMarginPct: 16.7, billingMethod: "Progress Billing" },
};

/* -------------------------------------------------------- commitment data */

export const commitments: Commitment[] = [
  { id: "SC-1041", projectId: "downtown-ti", companyId: "trueframe", company: "TrueFrame Carpentry", type: "Subcontract", scope: "Carpentry — rough framing, blocking, finish carpentry", original: 118000, approvedChanges: 3700, invoiced: 94600, paid: 82300, retainagePct: 10, status: "In Progress", source: "Awarded bid — Bid Packages", budgetLineIds: ["dt-carp-rough", "dt-carp-finish"], billedPct: 82, schedulePct: 50 },
  { id: "SC-1042", projectId: "downtown-ti", companyId: "spark-electric", company: "Spark Electric Co.", type: "Subcontract", scope: "Complete electrical package", original: 168900, approvedChanges: 14600, invoiced: 172400, paid: 152800, retainagePct: 10, status: "In Progress", source: "Awarded bid — Bid Packages", budgetLineIds: ["dt-elec"], billedPct: 94, schedulePct: 89 },
  { id: "SC-1043", projectId: "downtown-ti", companyId: "climateworks", company: "ClimateWorks Mechanical", type: "Subcontract", scope: "HVAC equipment and distribution", original: 142600, approvedChanges: 11100, invoiced: 148300, paid: 133500, retainagePct: 10, status: "In Progress", source: "Awarded bid — Bid Packages", budgetLineIds: ["dt-mech"], billedPct: 96, schedulePct: 93 },
  { id: "SC-1044", projectId: "downtown-ti", companyId: "queen-city-drywall", company: "Queen City Drywall", type: "Subcontract", scope: "Drywall, tape and finish", original: 128400, approvedChanges: 9200, invoiced: 129900, paid: 118600, retainagePct: 10, status: "In Progress", source: "Awarded bid — Bid Packages", budgetLineIds: ["dt-drywall"], billedPct: 94, schedulePct: 94 },
  { id: "PO-2210", projectId: "downtown-ti", company: "Hyde Park Lumber", type: "Purchase Order", scope: "Framing lumber and sheathing", original: 18000, approvedChanges: 0, invoiced: 19700, paid: 12500, retainagePct: 0, status: "Exception", source: "Created from estimate line 06-110", budgetLineIds: ["dt-carp-rough"] },
  { id: "PO-2214", projectId: "downtown-ti", company: "Ferguson Enterprises", type: "Purchase Order", scope: "Plumbing trim and fixtures", original: 41200, approvedChanges: 0, invoiced: 28600, paid: 24100, retainagePct: 0, status: "In Progress", source: "Created from estimate line 22-000", budgetLineIds: ["dt-plumb"] },

  { id: "SC-1102", projectId: "fregolle", companyId: "trueframe", company: "TrueFrame Carpentry", type: "Subcontract", scope: "Framing package — Fregolle Residence", original: 131850, approvedChanges: 0, invoiced: 62400, paid: 48200, retainagePct: 10, status: "In Progress", source: "Awarded bid v2 — Bid Packages", budgetLineIds: ["fr-carp-rough"], billedPct: 47, schedulePct: 52 },
  { id: "SC-1103", projectId: "fregolle", companyId: "riverstone-concrete", company: "Riverstone Concrete", type: "Subcontract", scope: "Foundations, walls and flatwork", original: 181200, approvedChanges: 0, invoiced: 158900, paid: 142000, retainagePct: 10, status: "In Progress", source: "Awarded bid — Bid Packages", budgetLineIds: ["fr-concrete"], billedPct: 88, schedulePct: 86 },
  { id: "SC-1104", projectId: "fregolle", companyId: "apex-roofing", company: "Apex Roofing", type: "Subcontract", scope: "Roofing, underlayment and flashing", original: 108500, approvedChanges: 0, invoiced: 0, paid: 0, retainagePct: 10, status: "Executed", source: "Awarded bid — Bid Packages", budgetLineIds: ["fr-roof"] },
  { id: "SC-1105", projectId: "fregolle", companyId: "aquaflow", company: "AquaFlow Plumbing", type: "Subcontract", scope: "Plumbing rough and trim", original: 96400, approvedChanges: 0, invoiced: 31200, paid: 24900, retainagePct: 10, status: "In Progress", source: "Awarded bid — Bid Packages", budgetLineIds: ["fr-mep"] },
  { id: "PO-2301", projectId: "fregolle", company: "Hyde Park Lumber", type: "Purchase Order", scope: "Framing lumber, LVL and sheathing", original: 42800, approvedChanges: 0, invoiced: 26400, paid: 21800, retainagePct: 0, status: "In Progress", source: "Created from estimate line 06-110", budgetLineIds: ["fr-carp-rough", "fr-hardware"] },
  { id: "PO-2308", projectId: "fregolle", company: "Ferguson Enterprises", type: "Purchase Order", scope: "Plumbing fixtures — approved selection", original: 27500, approvedChanges: 0, invoiced: 0, paid: 0, retainagePct: 0, status: "Executed", source: "Created from Selection — Plumbing Fixtures", budgetLineIds: ["fr-allow-plumb"] },
  { id: "RA-118", projectId: "fregolle", company: "Sunbelt Rentals", type: "Rental Agreement", scope: "Lift and temporary power", original: 9600, approvedChanges: 0, invoiced: 4100, paid: 4100, retainagePct: 0, status: "In Progress", source: "Manual", budgetLineIds: ["fr-gc"] },
];

/* -------------------------------------------------------------- cost data */

export const costs: CostRecord[] = [
  { id: "C-4101", projectId: "downtown-ti", companyId: "trueframe", vendor: "TrueFrame Carpentry", type: "Subcontractor Invoice", source: "QBO", number: "1042", date: "2026-08-28", dueDate: "2026-09-27", amount: 42800, tax: 0, budgetLineId: "dt-carp-rough", commitmentId: "SC-1041", approval: "Paid", sync: "Synced", description: "Carpentry application #4 — rough framing", financial: true },
  { id: "C-4102", projectId: "downtown-ti", companyId: "trueframe", vendor: "TrueFrame Carpentry", type: "Subcontractor Invoice", source: "QBO", number: "1051", date: "2026-09-05", dueDate: "2026-10-05", amount: 46800, tax: 0, budgetLineId: "dt-carp-finish", commitmentId: "SC-1041", approval: "Approved", sync: "Queued", description: "Carpentry application #5 — finish carpentry start", financial: true },
  { id: "C-4103", projectId: "downtown-ti", companyId: "spark-electric", vendor: "Spark Electric Co.", type: "Subcontractor Invoice", source: "QBO", number: "SE-7741", date: "2026-09-02", dueDate: "2026-10-02", amount: 118400, tax: 0, budgetLineId: "dt-elec", commitmentId: "SC-1042", approval: "Paid", sync: "Synced", description: "Electrical progress billing", financial: true },
  { id: "C-4104", projectId: "downtown-ti", vendor: "Hyde Park Lumber", type: "Vendor Invoice", source: "Invoice Upload", number: "410702", date: "2026-09-04", dueDate: "2026-10-04", amount: 1575.26, tax: 118.14, budgetLineId: "dt-carp-rough", commitmentId: "PO-2210", approval: "Needs Review", sync: "Not synced", description: "SPF studs, sheathing and connectors", financial: true },
  { id: "C-4105", projectId: "downtown-ti", vendor: "Ferguson Enterprises", type: "Receipt", source: "Card Feed", number: "AMEX-9921", date: "2026-09-06", amount: 218.73, tax: 16.4, budgetLineId: "dt-plumb", commitmentId: "PO-2214", approval: "Approved", sync: "Synced", description: "Plumbing trim pickup — AMEX •••• 1043", financial: true },
  { id: "C-4106", projectId: "downtown-ti", vendor: "Mayfield & Co. Internal Labor", type: "Internal Labor", source: "Time Clock", number: "WK-36", date: "2026-09-05", amount: 14620, tax: 0, budgetLineId: "dt-gc-super", approval: "Approved", sync: "Queued", description: "Approved internal crew and supervision hours", financial: true },
  { id: "C-4107", projectId: "downtown-ti", companyId: "trueframe", vendor: "TrueFrame Carpentry", type: "Internal Labor", source: "Time Clock", number: "WK-36-SUB", date: "2026-09-05", amount: 0, tax: 0, budgetLineId: "dt-carp-finish", commitmentId: "SC-1041", approval: "Approved", sync: "Not synced", description: "Fixed-price subcontract crew hours — production only, cost posts from subcontract invoice", financial: false },
  { id: "C-4108", projectId: "downtown-ti", vendor: "Queen City Building Supply", type: "Credit", source: "Invoice Upload", number: "CM-2214", date: "2026-09-01", amount: -1840, tax: 0, budgetLineId: "dt-drywall", approval: "Approved", sync: "Synced", description: "Return credit — surplus drywall board", financial: true },
  { id: "C-4109", projectId: "downtown-ti", vendor: "United Rentals", type: "Manual Expense", source: "Manual", number: "EXP-118", date: "2026-08-30", amount: 6840, tax: 0, budgetLineId: "dt-gc-temp", approval: "Needs Review", sync: "Not synced", description: "Field equipment rental — extended two weeks", financial: true },

  { id: "C-5101", projectId: "fregolle", companyId: "riverstone-concrete", vendor: "Riverstone Concrete", type: "Subcontractor Invoice", source: "QBO", number: "RC-882", date: "2026-08-14", dueDate: "2026-09-13", amount: 96400, tax: 0, budgetLineId: "fr-concrete", commitmentId: "SC-1103", approval: "Paid", sync: "Synced", description: "Foundation application #2", financial: true },
  { id: "C-5102", projectId: "fregolle", companyId: "riverstone-concrete", vendor: "Riverstone Concrete", type: "Subcontractor Invoice", source: "QBO", number: "RC-914", date: "2026-09-02", dueDate: "2026-10-02", amount: 62500, tax: 0, budgetLineId: "fr-concrete", commitmentId: "SC-1103", approval: "Approved", sync: "Synced", description: "Foundation application #3", financial: true },
  { id: "C-5103", projectId: "fregolle", companyId: "trueframe", vendor: "TrueFrame Carpentry", type: "Subcontractor Invoice", source: "QBO", number: "TF-2211", date: "2026-09-03", dueDate: "2026-10-03", amount: 62400, tax: 0, budgetLineId: "fr-carp-rough", commitmentId: "SC-1102", approval: "Approved", sync: "Synced", description: "Framing application #1", financial: true },
  { id: "C-5104", projectId: "fregolle", vendor: "Hyde Park Lumber", type: "Vendor Invoice", source: "Invoice Upload", number: "409884", date: "2026-08-21", dueDate: "2026-09-20", amount: 21160, tax: 1587, budgetLineId: "fr-carp-rough", commitmentId: "PO-2301", approval: "Paid", sync: "Synced", description: "Framing lumber package — first release", financial: true },
  { id: "C-5105", projectId: "fregolle", vendor: "Hyde Park Lumber", type: "Vendor Invoice", source: "Invoice Upload", number: "410401", date: "2026-09-01", dueDate: "2026-10-01", amount: 5240, tax: 393, budgetLineId: "fr-hardware", commitmentId: "PO-2301", approval: "Approved", sync: "Queued", description: "Simpson connectors and framing hardware", financial: true },
  { id: "C-5106", projectId: "fregolle", vendor: "Mayfield & Co. Internal Labor", type: "Internal Labor", source: "Time Clock", number: "WK-36", date: "2026-09-05", amount: 8600, tax: 0, budgetLineId: "fr-gc", approval: "Approved", sync: "Queued", description: "Approved internal supervision hours", financial: true },
  { id: "C-5107", projectId: "fregolle", companyId: "aquaflow", vendor: "AquaFlow Plumbing", type: "Subcontractor Invoice", source: "QBO", number: "AF-551", date: "2026-09-04", dueDate: "2026-10-04", amount: 31200, tax: 0, budgetLineId: "fr-mep", commitmentId: "SC-1105", approval: "Approved", sync: "Synced", description: "Plumbing rough-in application #1", financial: true },
  { id: "C-5108", projectId: "fregolle", vendor: "Ferguson Enterprises", type: "Receipt", source: "Receipt Upload", number: "R-4471", date: "2026-09-08", amount: 218.73, tax: 16.4, budgetLineId: "fr-mep", approval: "Needs Review", sync: "Not synced", description: "Plumbing finish parts — AMEX •••• 1043", financial: true },
  { id: "C-5109", projectId: "fregolle", vendor: "Queen City Building Supply", type: "Vendor Invoice", source: "Invoice Upload", number: "QC-88214", date: "2026-08-26", dueDate: "2026-09-25", amount: 12480, tax: 936, budgetLineId: "fr-openings", approval: "Paid", sync: "Synced", description: "Exterior door and window hardware", financial: true },
];

/* ------------------------------------------------------------ change data */

export const changes: ChangeRecord[] = [
  { id: "OCO-014", projectId: "downtown-ti", title: "Suite 400 conference AV rough-in", kind: "Owner Change", source: "Client request", scope: "Additional AV conduit, boxes and dedicated circuits", costImpact: 14600, clientImpact: 18500, markupPct: 20, scheduleDays: 3, fundingSource: "Client Contract", status: "Approved", budgetLineId: "dt-elec", commitmentId: "SC-1042", date: "2026-08-12" },
  { id: "OCO-015", projectId: "downtown-ti", title: "Upgraded corridor millwork finish", kind: "Owner Change", source: "Client request", scope: "Rift white oak in lieu of paint-grade", costImpact: 11200, clientImpact: 14400, markupPct: 22, scheduleDays: 5, fundingSource: "Client Contract", status: "Pricing", budgetLineId: "dt-carp-mill", date: "2026-09-02" },
  { id: "SCO-021", projectId: "downtown-ti", title: "TrueFrame — concealed blocking correction", kind: "Sub/Vendor Change", source: "Field condition", scope: "Additional blocking at existing shear wall", costImpact: 3700, clientImpact: 0, markupPct: 0, scheduleDays: 1, fundingSource: "Contingency", status: "Approved", budgetLineId: "dt-carp-rough", commitmentId: "SC-1041", date: "2026-07-19" },
  { id: "IBC-006", projectId: "downtown-ti", title: "Contingency allocation — drywall rework", kind: "Internal Budget Change", source: "Superintendent", scope: "Rework at ceiling transition", costImpact: 9200, clientImpact: 0, markupPct: 0, scheduleDays: 0, fundingSource: "Contingency", status: "Approved", budgetLineId: "dt-drywall", date: "2026-08-04" },
  { id: "OCO-016", projectId: "downtown-ti", title: "Break room equipment upgrade", kind: "Owner Change", source: "Client request", scope: "Higher-spec appliance package", costImpact: 9400, clientImpact: 11750, markupPct: 25, scheduleDays: 0, fundingSource: "Client Contract", status: "Potential", budgetLineId: "dt-allow-appl", date: "2026-09-07" },

  { id: "OCO-101", projectId: "fregolle", title: "Plumbing fixture selection above allowance", kind: "Owner Change", source: "Selection — Plumbing Fixtures", scope: "Selected fixture package exceeds the $20,000 allowance", costImpact: 7500, clientImpact: 9000, markupPct: 20, scheduleDays: 0, fundingSource: "Client Contract", status: "Submitted", budgetLineId: "fr-allow-plumb", selectionId: "SEL-FR-PLUMB", date: "2026-09-06" },
  { id: "OCO-102", projectId: "fregolle", title: "Kitchen countertop selection variance", kind: "Owner Change", source: "Selection — Kitchen Countertops", scope: "Quartzite in lieu of allowance-grade quartz", costImpact: 3400, clientImpact: 4080, markupPct: 20, scheduleDays: 2, fundingSource: "Client Contract", status: "Pricing", budgetLineId: "fr-allow-tops", selectionId: "SEL-FR-TOPS", date: "2026-09-09" },
  { id: "IBC-102", projectId: "fregolle", title: "Contingency allocation — unforeseen excavation", kind: "Internal Budget Change", source: "Field condition", scope: "Rock removal at north foundation wall", costImpact: 6400, clientImpact: 0, markupPct: 0, scheduleDays: 2, fundingSource: "Contingency", status: "Approved", budgetLineId: "fr-site", date: "2026-06-22" },
  { id: "SCO-105", projectId: "fregolle", title: "TrueFrame — stair opening reframe", kind: "Sub/Vendor Change", source: "RFI 04", scope: "Reframe stair opening per structural clarification", costImpact: 4400, clientImpact: 0, markupPct: 0, scheduleDays: 1, fundingSource: "Contingency", status: "Potential", budgetLineId: "fr-carp-finish", commitmentId: "SC-1102", date: "2026-09-08" },
  { id: "OCO-103", projectId: "fregolle", title: "Millwork scope clarification", kind: "Owner Change", source: "Design revision", scope: "Added pantry and mudroom cabinetry", costImpact: 3700, clientImpact: 4440, markupPct: 20, scheduleDays: 0, fundingSource: "Client Contract", status: "Potential", budgetLineId: "fr-carp-mill", date: "2026-09-08" },
];

/* ---------------------------------------------------- client billing data */

export const clientInvoices: ClientInvoice[] = [
  { id: "INV-DT-06", projectId: "downtown-ti", number: "2026-0106", method: "Progress Billing", periodFrom: "2026-08-01", periodTo: "2026-08-31", issued: "2026-09-01", due: "2026-09-30", amount: 214600, retainage: 21460, paid: 214600, status: "Paid",
    lines: [ { scope: "General Conditions", contract: 107400, previouslyBilled: 68200, thisInvoice: 21400 }, { scope: "Carpentry", contract: 185820, previouslyBilled: 96400, thisInvoice: 48200 }, { scope: "Interior Finishes", contract: 313920, previouslyBilled: 168300, thisInvoice: 84600 }, { scope: "MEP", contract: 487260, previouslyBilled: 316800, thisInvoice: 60400 } ] },
  { id: "INV-DT-07", projectId: "downtown-ti", number: "2026-0117", method: "Progress Billing", periodFrom: "2026-09-01", periodTo: "2026-09-30", issued: "2026-09-08", due: "2026-10-08", amount: 168400, retainage: 16840, paid: 0, status: "Sent",
    lines: [ { scope: "General Conditions", contract: 107400, previouslyBilled: 89600, thisInvoice: 8600 }, { scope: "Carpentry", contract: 185820, previouslyBilled: 144600, thisInvoice: 26800 }, { scope: "Interior Finishes", contract: 313920, previouslyBilled: 252900, thisInvoice: 42600 }, { scope: "MEP", contract: 487260, previouslyBilled: 377200, thisInvoice: 90400 } ] },
  { id: "INV-FR-02", projectId: "fregolle", number: "2026-0092", method: "Progress Billing", periodFrom: "2026-07-01", periodTo: "2026-07-31", issued: "2026-08-02", due: "2026-09-01", amount: 186400, retainage: 18640, paid: 186400, status: "Paid",
    lines: [ { scope: "Sitework", contract: 133680, previouslyBilled: 42800, thisInvoice: 62400 }, { scope: "Concrete", contract: 222000, previouslyBilled: 61200, thisInvoice: 98600 }, { scope: "General Conditions", contract: 87600, previouslyBilled: 12400, thisInvoice: 25400 } ] },
  { id: "INV-FR-03", projectId: "fregolle", number: "2026-0108", method: "Progress Billing", periodFrom: "2026-08-01", periodTo: "2026-08-31", issued: "2026-09-03", due: "2026-10-03", amount: 142800, retainage: 14280, paid: 60000, status: "Partially Paid",
    lines: [ { scope: "Concrete", contract: 222000, previouslyBilled: 159800, thisInvoice: 41200 }, { scope: "Carpentry", contract: 244260, previouslyBilled: 0, thisInvoice: 74800 }, { scope: "Openings", contract: 117600, previouslyBilled: 0, thisInvoice: 26800 } ] },
];

export const clientPayments: ClientPayment[] = [
  { id: "PMT-DT-06", projectId: "downtown-ti", invoiceId: "INV-DT-06", date: "2026-09-18", amount: 214600, method: "ACH", reference: "ACH-88214", sync: "Synced" },
  { id: "PMT-FR-02", projectId: "fregolle", invoiceId: "INV-FR-02", date: "2026-08-26", amount: 186400, method: "Wire", reference: "WIRE-1182", sync: "Synced" },
  { id: "PMT-FR-03", projectId: "fregolle", invoiceId: "INV-FR-03", date: "2026-09-09", amount: 60000, method: "Check", reference: "CK-4471", sync: "Queued" },
];

/* -------------------------------------------------------------- selections */

export const selections: Selection[] = [
  { id: "SEL-FR-PLUMB", projectId: "fregolle", title: "Plumbing Fixtures", category: "Plumbing", description: "Primary bath, powder and kitchen fixture package", status: "Approved", decisionDue: "2026-09-05", requiredOnSite: "2026-10-20", leadTimeWeeks: 5, allowanceLineId: "fr-allow-plumb", allowance: 20000, selectedItem: "Kohler Purist package", vendor: "Ferguson Enterprises", cost: 27500, markupPct: 20, commitmentId: "PO-2308", changeId: "OCO-101", scheduleActivity: "Plumbing trim", notes: "Client approved above-allowance selection; change submitted." },
  { id: "SEL-FR-TOPS", projectId: "fregolle", title: "Kitchen Countertops", category: "Finishes", description: "Kitchen island and perimeter countertops", status: "Reviewing", decisionDue: "2026-09-24", requiredOnSite: "2026-11-16", leadTimeWeeks: 6, allowanceLineId: "fr-allow-tops", allowance: 18000, selectedItem: "Taj Mahal quartzite (pending)", vendor: "Cincinnati Stone Works", cost: 21400, markupPct: 20, changeId: "OCO-102", scheduleActivity: "Countertop installation" },
  { id: "SEL-FR-TILE", projectId: "fregolle", title: "Primary Bath Tile", category: "Finishes", description: "Floor, wall and shower tile", status: "Requested", decisionDue: "2026-09-11", requiredOnSite: "2026-10-28", leadTimeWeeks: 4, allowance: 14500, markupPct: 20, scheduleActivity: "Tile installation", overdueDays: 0 },
  { id: "SEL-FR-LIGHT", projectId: "fregolle", title: "Decorative Lighting", category: "Electrical", description: "Pendants, sconces and chandeliers", status: "Requested", decisionDue: "2026-09-06", requiredOnSite: "2026-11-02", leadTimeWeeks: 7, allowance: 16800, markupPct: 20, scheduleActivity: "Electrical trim", overdueDays: 4, notes: "Awaiting client." },
  { id: "SEL-FR-APPL", projectId: "fregolle", title: "Kitchen Appliances", category: "Equipment", description: "Range, hood, refrigeration and dishwasher", status: "Selected", decisionDue: "2026-09-12", requiredOnSite: "2026-11-24", leadTimeWeeks: 10, allowance: 32000, selectedItem: "Wolf / Sub-Zero package", vendor: "Ferguson Enterprises", cost: 33400, markupPct: 18, scheduleActivity: "Appliance installation" },
  { id: "SEL-FR-FLOOR", projectId: "fregolle", title: "Hardwood Flooring", category: "Finishes", description: "White oak flooring, site finished", status: "Ordered", decisionDue: "2026-08-22", requiredOnSite: "2026-10-06", leadTimeWeeks: 5, allowance: 42000, selectedItem: '5" rift white oak', vendor: "Queen City Building Supply", cost: 41200, markupPct: 20, scheduleActivity: "Flooring installation" },
  { id: "SEL-FR-DOORS", projectId: "fregolle", title: "Interior Door Hardware", category: "Openings", description: "Levers, hinges and privacy sets", status: "Not Started", decisionDue: "2026-09-30", requiredOnSite: "2026-11-30", leadTimeWeeks: 3, allowance: 9800, markupPct: 20, scheduleActivity: "Finish carpentry" },
  { id: "SEL-DT-CARPET", projectId: "downtown-ti", title: "Open Office Carpet Tile", category: "Finishes", description: "Carpet tile for open office and corridors", status: "Ordered", decisionDue: "2026-07-18", requiredOnSite: "2026-09-15", leadTimeWeeks: 6, allowance: 38400, selectedItem: "Interface Composure", vendor: "Queen City Building Supply", cost: 37200, markupPct: 20, scheduleActivity: "Flooring installation" },
  { id: "SEL-DT-APPL", projectId: "downtown-ti", title: "Break Room Appliances", category: "Equipment", description: "Refrigeration, dishwasher and coffee system", status: "Reviewing", decisionDue: "2026-09-14", requiredOnSite: "2026-10-12", leadTimeWeeks: 4, allowanceLineId: "dt-allow-appl", allowance: 20000, selectedItem: "Upgraded commercial package (pending)", vendor: "Ferguson Enterprises", cost: 29400, markupPct: 25, changeId: "OCO-016", scheduleActivity: "Equipment installation" },
];

/* ------------------------------------------------------------- cost inbox */

export const inboxItems: InboxItem[] = [
  {
    id: "IN-9001", vendor: "Hyde Park Lumber", docType: "Invoice", number: "410702", projectId: "fregolle", amount: 1575.26, tax: 118.14, date: "2026-09-08", dueDate: "2026-10-08",
    source: "Invoice Upload", suggestedLineId: "fr-carp-rough", commitmentId: "PO-2301", confidence: 96, state: "Ready", terms: "Net 30",
    lines: [
      { description: "SPF studs 2x6x104-5/8", amount: 608.43, suggestedLineId: "fr-carp-rough", confidence: 97 },
      { description: "LVL 1-3/4 x 11-7/8", amount: 434.24, suggestedLineId: "fr-carp-rough", confidence: 94 },
      { description: '7/16" OSB sheathing', amount: 276.26, suggestedLineId: "fr-carp-rough", confidence: 96 },
      { description: "Simpson connectors", amount: 108.48, suggestedLineId: "fr-hardware", confidence: 98 },
      { description: "Delivery", amount: 29.71, suggestedLineId: "fr-gc", confidence: 88 },
    ],
  },
  {
    id: "IN-9002", vendor: "Ferguson Enterprises", docType: "Receipt", number: "R-4471", projectId: "fregolle", amount: 218.73, tax: 16.4, date: "2026-09-08",
    source: "Card Feed", suggestedLineId: "fr-mep", confidence: 98, state: "Ready", card: "AMEX •••• 1043",
    lines: [{ description: "Plumbing finish parts", amount: 218.73, suggestedLineId: "fr-mep", confidence: 98 }],
  },
  {
    id: "IN-9003", vendor: "Hyde Park Lumber", docType: "Invoice", number: "410702", projectId: "downtown-ti", amount: 1575.26, tax: 118.14, date: "2026-09-04",
    source: "Email", suggestedLineId: "dt-carp-rough", commitmentId: "PO-2210", confidence: 61, state: "Exception",
    exception: { kind: "Possible duplicate", detail: "Hyde Park Lumber invoice #410702 for $1,575.26 appears to already exist in QuickBooks.", actions: ["View Existing", "Post Anyway", "Dismiss Upload"] },
    lines: [{ description: "Framing material package", amount: 1575.26, suggestedLineId: "dt-carp-rough", confidence: 61 }],
  },
  {
    id: "IN-9004", vendor: "Hyde Park Lumber", docType: "Invoice", number: "411885", projectId: "downtown-ti", amount: 7200, tax: 540, date: "2026-09-07", dueDate: "2026-10-07",
    source: "Invoice Upload", suggestedLineId: "dt-carp-rough", commitmentId: "PO-2210", confidence: 92, state: "Exception",
    exception: { kind: "Invoice exceeds commitment", detail: "PO-2210 is $18,000. Previously invoiced $12,500. This invoice brings the total to $19,700 — $1,700 above the commitment.", actions: ["Adjust Commitment", "Create Change", "Partial Approve", "Request Correction"] },
    lines: [{ description: "Additional framing lumber release", amount: 7200, suggestedLineId: "dt-carp-rough", confidence: 92 }],
  },
  {
    id: "IN-9005", vendor: "Unknown vendor", docType: "Receipt", amount: 486.12, tax: 36.4, date: "2026-09-07", source: "Receipt Upload", confidence: 34, state: "Needs Review",
    exception: { kind: "No vendor match", detail: "Euclid could not match this receipt to a Network company or project.", actions: ["Assign Vendor", "Assign Project", "Discard"] },
    lines: [{ description: "Miscellaneous jobsite materials", amount: 486.12, suggestedLineId: "fr-gc", confidence: 34 }],
  },
  {
    id: "IN-9006", vendor: "TrueFrame Carpentry", companyId: "trueframe", docType: "Subcontractor Application", number: "TF-2218", projectId: "downtown-ti", amount: 24800, tax: 0, date: "2026-09-08", dueDate: "2026-10-08",
    source: "Email", suggestedLineId: "dt-carp-finish", commitmentId: "SC-1041", confidence: 88, state: "Needs Review",
    exception: { kind: "Billing ahead of progress", detail: "TrueFrame would be 82% billed against 50% reported installed progress on this subcontract.", actions: ["Review Progress", "Partial Approve", "Request Correction"] },
    lines: [{ description: "Finish carpentry application #6", amount: 24800, suggestedLineId: "dt-carp-finish", confidence: 88 }],
  },
  {
    id: "IN-9007", vendor: "Hyde Park Lumber", docType: "Statement", number: "STMT-2026-08", amount: 41284.6, tax: 0, date: "2026-09-01", source: "Vendor Statement", confidence: 74, state: "Exception",
    exception: { kind: "Statement mismatch", detail: "Statement contains invoice 412441 for $1,118.42 that does not appear in Euclid or QuickBooks.", actions: ["Request Invoice", "Create Cost", "Dismiss"] },
    lines: [{ description: "Monthly statement reconciliation", amount: 41284.6, suggestedLineId: "fr-carp-rough", confidence: 74 }],
  },
  {
    id: "IN-9008", vendor: "Queen City Building Supply", docType: "Credit", number: "CM-2214", projectId: "downtown-ti", amount: -1840, tax: 0, date: "2026-09-01",
    source: "QBO", suggestedLineId: "dt-drywall", confidence: 95, state: "Posted",
    lines: [{ description: "Return credit — surplus drywall board", amount: -1840, suggestedLineId: "dt-drywall", confidence: 95 }],
  },
];

/* ------------------------------------------------------- history & control */

export const forecastHistory: Record<string, ForecastSnapshot[]> = {
  "downtown-ti": [
    { date: "Apr 1", variance: 122000 }, { date: "May 1", variance: 64000 }, { date: "Jun 1", variance: 8000 },
    { date: "Jul 1", variance: -42000 }, { date: "Aug 1", variance: -87000 }, { date: "Sep 1", variance: -5600 },
  ],
  fregolle: [
    { date: "May 1", variance: 34000 }, { date: "Jun 1", variance: 28400 }, { date: "Jul 1", variance: 19600 },
    { date: "Aug 1", variance: 12800 }, { date: "Sep 1", variance: 6200 },
  ],
};

export const budgetRevisions: BudgetRevision[] = [
  { date: "2026-07-19", user: "Jordan Ellis", lineId: "dt-carp-rough", from: 92750, to: 96450, reason: "Approved sub change — concealed blocking correction", source: "SCO-021" },
  { date: "2026-08-04", user: "Jordan Ellis", lineId: "dt-drywall", from: 128400, to: 137600, reason: "Contingency allocation — ceiling transition rework", source: "IBC-006" },
  { date: "2026-08-12", user: "Frankie Mayfield", lineId: "dt-elec", from: 168900, to: 183500, reason: "Approved owner change — conference AV rough-in", source: "OCO-014" },
  { date: "2026-06-22", user: "Jordan Ellis", lineId: "fr-site", from: 105000, to: 111400, reason: "Contingency allocation — unforeseen rock removal", source: "IBC-102" },
];

export const contingency: Record<string, Contingency> = {
  "downtown-ti": { original: 45000, allocations: [
    { date: "2026-07-19", reason: "Concealed blocking correction", amount: 3700, user: "Jordan Ellis", source: "SCO-021" },
    { date: "2026-08-04", reason: "Ceiling transition drywall rework", amount: 9200, user: "Jordan Ellis", source: "IBC-006" },
  ] },
  fregolle: { original: 150000, allocations: [
    { date: "2026-06-22", reason: "Unforeseen excavation — rock removal", amount: 6400, user: "Jordan Ellis", source: "IBC-102" },
    { date: "2026-07-30", reason: "Framing correction at stair opening", amount: 4000, user: "Jordan Ellis", source: "Field" },
    { date: "2026-08-18", reason: "Concealed plumbing repair", amount: 42000, user: "Frankie Mayfield", source: "Field" },
  ] },
};

/**
 * Financial tools are only available for jobs that have started construction —
 * proposal accepted / estimate finalized and pushed to the job-costing budget.
 */
export const financialProjectIds = ["downtown-ti", "fregolle"].filter(isConstructionActive);

/* ------------------------------------------------------------- formulas */

export const revisedBudget = (l: BudgetLine) => l.originalBudget + l.approvedChanges;
export const forecast = (l: BudgetLine) => l.pmForecast ?? l.euclidForecast;
export const remainingCommitment = (l: BudgetLine) => Math.max(l.committed - l.actual, 0);
export const forecastToComplete = (l: BudgetLine) => Math.max(forecast(l) - l.actual, 0);
export const variance = (l: BudgetLine) => revisedBudget(l) - forecast(l);
export const costToComplete = (l: BudgetLine) => remainingCommitment(l) + l.forecastUncommitted;

export const formulaHelp: Record<string, string> = {
  "Revised Budget": "Original Budget + Approved Budget Adjustments",
  Committed: "Original Commitment + Approved Commitment Changes",
  "Remaining Commitment": "Current Commitment − Actual Against Commitment",
  Forecast: "Actual Cost + Forecast to Complete",
  "Forecast to Complete": "Remaining Commitments + Forecast Uncommitted Cost",
  Variance: "Revised Budget − Forecast at Completion (positive is favorable)",
};

/* ------------------------------------------------------------- selectors */

export const linesFor = (projectId: string) => budgetLines.filter(l => l.projectId === projectId);
export const lineById = (id?: string) => budgetLines.find(l => l.id === id);
export const costsFor = (projectId: string) => costs.filter(c => c.projectId === projectId);
export const costsForLine = (lineId: string) => costs.filter(c => c.budgetLineId === lineId);
export const commitmentsFor = (projectId: string) => commitments.filter(c => c.projectId === projectId);
export const commitmentById = (id?: string) => commitments.find(c => c.id === id);
export const changesFor = (projectId: string) => changes.filter(c => c.projectId === projectId);
export const invoicesFor = (projectId: string) => clientInvoices.filter(i => i.projectId === projectId);
export const paymentsFor = (projectId: string) => clientPayments.filter(p => p.projectId === projectId);
export const selectionsFor = (projectId: string) => selections.filter(s => s.projectId === projectId);

export const currentCommitment = (c: Commitment) => c.original + c.approvedChanges;
export const remainingOnCommitment = (c: Commitment) => currentCommitment(c) - c.invoiced;
export const retainageHeld = (c: Commitment) => Math.round(c.invoiced * (c.retainagePct / 100));

export type GroupRollup = { group: string; lines: BudgetLine[] } & ReturnType<typeof rollup>;

export function rollup(lines: BudgetLine[]) {
  const sum = (f: (l: BudgetLine) => number) => lines.reduce((t, l) => t + f(l), 0);
  const original = sum(l => l.originalBudget);
  const approved = sum(l => l.approvedChanges);
  const revised = original + approved;
  const fac = sum(forecast);
  return {
    original, approvedChanges: approved, revised,
    committed: sum(l => l.committed),
    actual: sum(l => l.actual),
    forecast: fac,
    forecastToComplete: sum(forecastToComplete),
    costToComplete: sum(costToComplete),
    pendingExposure: sum(l => l.pendingExposure),
    clientPrice: sum(l => l.clientPrice),
    variance: revised - fac,
  };
}

export function groupsFor(projectId: string, viewBy: "Estimate Structure" | "Cost Code" | "Trade" | "Phase" = "Estimate Structure"): GroupRollup[] {
  const key = (l: BudgetLine) =>
    viewBy === "Cost Code" ? l.costCode.split("-")[0] + "0 Division" : viewBy === "Trade" ? l.trade : viewBy === "Phase" ? l.phase : l.group;
  const map = new Map<string, BudgetLine[]>();
  linesFor(projectId).forEach(l => map.set(key(l), [...(map.get(key(l)) ?? []), l]));
  return [...map.entries()].map(([group, lines]) => ({ group, lines, ...rollup(lines) }));
}

export function projectFinancials(projectId: string) {
  const lines = linesFor(projectId);
  const r = rollup(lines);
  const contract = contracts[projectId] ?? { originalContract: 0, approvedClientChanges: 0, retainagePct: 10, originalMarginPct: 0, billingMethod: "Progress Billing" as const };
  const currentContract = contract.originalContract + contract.approvedClientChanges;
  const invoices = invoicesFor(projectId);
  const invoiced = invoices.reduce((t, i) => t + i.amount, 0);
  const paid = invoices.reduce((t, i) => t + i.paid, 0);
  const retainage = invoices.reduce((t, i) => t + i.retainage, 0);
  const forecastGP = currentContract - r.forecast;
  const forecastMargin = currentContract ? (forecastGP / currentContract) * 100 : 0;
  const pendingChanges = changesFor(projectId).filter(c => ["Potential", "Pricing", "Submitted", "Needs Review"].includes(c.status));
  const pendingExposure = pendingChanges.reduce((t, c) => t + c.costImpact, 0);
  const cont = contingency[projectId];
  const allocated = cont ? cont.allocations.reduce((t, a) => t + a.amount, 0) : 0;
  const openExceptions =
    inboxItems.filter(i => i.projectId === projectId && (i.state === "Exception" || i.state === "Needs Review")).length +
    commitmentsFor(projectId).filter(c => c.status === "Exception").length +
    costsFor(projectId).filter(c => c.approval === "Needs Review").length;

  return {
    ...r, contract, currentContract, invoiced, paid, retainage,
    outstandingAR: invoiced - paid,
    remainingToInvoice: currentContract - invoiced,
    forecastGP, forecastMargin,
    originalMargin: contract.originalMarginPct,
    marginErosion: forecastMargin - contract.originalMarginPct,
    pendingChanges, pendingExposure,
    riskAdjustedForecast: r.forecast + pendingExposure,
    contingency: cont ? { original: cont.original, allocated, remaining: cont.original - allocated, allocations: cont.allocations } : undefined,
    openExceptions,
    status: r.variance < 0 ? "At Risk" : r.variance < r.revised * 0.01 ? "Watch" : "On Track",
  };
}

export function companyFinancials() {
  const list = financialProjectIds.map(id => ({ id, name: getProject(id).name, ...projectFinancials(id) }));
  const sum = (f: (p: (typeof list)[number]) => number) => list.reduce((t, p) => t + f(p), 0);
  return {
    projects: list,
    revisedBudget: sum(p => p.revised),
    forecast: sum(p => p.forecast),
    forecastVariance: sum(p => p.variance),
    unapprovedCosts: costs.filter(c => c.approval === "Needs Review" || c.approval === "Received").reduce((t, c) => t + c.amount, 0),
    pendingExposure: sum(p => p.pendingExposure),
    outstandingAR: sum(p => p.outstandingAR),
    unresolvedChanges: changes.filter(c => ["Potential", "Pricing", "Submitted", "Needs Review", "Draft"].includes(c.status)).length,
    inboxNeedsAction: inboxItems.filter(i => i.state !== "Posted").length,
    commitmentExceptions: commitments.filter(c => c.status === "Exception").length,
  };
}

/* ------------------------------------------------- Euclid impact narration */

export function budgetImpact(l: BudgetLine) {
  const v = variance(l);
  const pctSpent = revisedBudget(l) ? Math.round((l.actual / revisedBudget(l)) * 100) : 0;
  if (v < 0) {
    return {
      tone: "warning" as const,
      message: `${l.name} is forecast ${money(Math.abs(v))} over revised budget. ${pctSpent}% of the revised budget is consumed against ${l.percentComplete}% installed progress${l.pendingExposure ? `, with ${money(l.pendingExposure)} of pending exposure not yet approved` : ""}.`,
    };
  }
  return {
    tone: "positive" as const,
    message: `${l.name} is forecast ${money(v)} favorable. ${pctSpent}% of the revised budget is consumed against ${l.percentComplete}% installed progress, driven primarily by committed pricing below estimate.`,
  };
}

export function billingImpact(projectId: string) {
  const lines = linesFor(projectId);
  const worst = [...lines].sort((a, b) => (b.percentComplete - (b.clientPrice ? 0 : 0)) - (a.percentComplete)).find(l => l.percentComplete > 0);
  const f = projectFinancials(projectId);
  const billedPct = f.currentContract ? Math.round((f.invoiced / f.currentContract) * 100) : 0;
  const progressPct = lines.length ? Math.round(lines.reduce((t, l) => t + l.percentComplete * l.clientPrice, 0) / (lines.reduce((t, l) => t + l.clientPrice, 0) || 1)) : 0;
  const gap = Math.round(((progressPct - billedPct) / 100) * f.currentContract);
  return {
    tone: gap > 0 ? ("warning" as const) : ("positive" as const),
    message: gap > 0
      ? `Installed progress is approximately ${progressPct}% against ${billedPct}% billed. Roughly ${money(gap)} appears underbilled relative to current progress${worst ? `, concentrated in ${worst.group}` : ""}.`
      : `Billing of ${billedPct}% is tracking at or ahead of ${progressPct}% installed progress. Review remaining scope before increasing billing.`,
  };
}
