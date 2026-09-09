import mainPlanAsset from "@/assets/FinalConstructionSetFregolle.pdf.asset.json";

export type DemoTrack = "builder" | "sub";
export type WorkflowStage = "Document Upload" | "Scope Analyzer" | "Bid Packages" | "Estimate" | "Pricing & Margin" | "Proposal Export" | "Market Comparison" | "Est. vs Actual";
export type DemoDocumentType = "plans" | "structural" | "schedule" | "addendum" | "subcontractor bid" | "estimate" | "proposal";

export interface DemoCompany { id: string; name: string; accountType: string; trade?: string; region: string; }
export interface DemoPerson { id: string; name: string; firstName: string; initials: string; email: string; title: string; companyId: string; }
export interface DemoDocument { id: string; projectId: string; filename: string; sourceType: DemoDocumentType; uploadedBy: string; uploadedAt: string; revision: string; classification: string; primary: boolean; excluded: boolean; assetUrl?: string; sheets?: string[]; }
export interface DemoQuote { id: string; projectId: string; companyId: string; trade: string; currentAmount: number | null; preliminaryAmount?: number; status: string; score: number | null; revisions: { version: string; amount: number; date: string; reason: string }[]; }
export interface DemoActuals { originalEstimate: number; approvedChangeOrders: number; revisedBudget: number; actualToDate: number; forecastAtCompletion: number; forecastVariance: number; transactions: { id: string; source: string; description: string; amount: number; status: "Mapped" | "Auto-mapped" | "Needs Review" }[]; }
export interface DemoProject {
  id: string; jobNumber: string; name: string; client: string; builderCompanyId: string; location: string; type: string; size?: number; specLevel: string;
  builderStage: WorkflowStage; subStage: WorkflowStage; builderStatus: string; subStatus: string; builderCost: number | null; clientPrice: number | null; markup: number | null;
  proposalScore: number | null; subProposalScore: number | null; marketPosition?: string; benchmark: { low?: number; high?: number; sampleCount: number; cohort: string };
  attention: string; assumptions: number; openRfis: number; scopeCoverage: number; bidDue?: string; quoteId: string; actuals?: DemoActuals;
}

export const companies: Record<string, DemoCompany> = {
  mayfield: { id: "mayfield", name: "Mayfield & Co.", accountType: "General Contractor / Design-Build", region: "Cincinnati, Ohio" },
  trueframe: { id: "trueframe", name: "TrueFrame Carpentry", accountType: "Subcontractor", trade: "Carpentry / Framing", region: "Cincinnati, Ohio" },
  queenCityFraming: { id: "queen-city-framing", name: "Queen City Framing", accountType: "Subcontractor", trade: "Carpentry / Framing", region: "Cincinnati, Ohio" },
  precisionStructural: { id: "precision-structural", name: "Precision Structural Carpentry", accountType: "Subcontractor", trade: "Carpentry / Framing", region: "Cincinnati, Ohio" },
  spark: { id: "spark-electric", name: "Spark Electric Co.", accountType: "Subcontractor", trade: "Electrical", region: "Cincinnati, Ohio" },
  aquaflow: { id: "aquaflow", name: "AquaFlow Plumbing", accountType: "Subcontractor", trade: "Plumbing", region: "Cincinnati, Ohio" },
  climateworks: { id: "climateworks", name: "ClimateWorks Mechanical", accountType: "Subcontractor", trade: "HVAC", region: "Cincinnati, Ohio" },
  queenCityDrywall: { id: "queen-city-drywall", name: "Queen City Drywall", accountType: "Subcontractor", trade: "Drywall", region: "Cincinnati, Ohio" },
  riverstone: { id: "riverstone-concrete", name: "Riverstone Concrete", accountType: "Subcontractor", trade: "Concrete", region: "Cincinnati, Ohio" },
  apex: { id: "apex-roofing", name: "Apex Roofing", accountType: "Subcontractor", trade: "Roofing", region: "Cincinnati, Ohio" },
};

export const people: Record<string, DemoPerson> = {
  frankie: { id: "frankie", name: "Frankie Mayfield", firstName: "Frankie", initials: "FM", email: "frankie@mayfield.co", title: "Estimator / Preconstruction", companyId: "mayfield" },
  tyler: { id: "tyler", name: "Tyler Reed", firstName: "Tyler", initials: "TR", email: "tyler@trueframe.co", title: "Estimator", companyId: "trueframe" },
  jordan: { id: "jordan", name: "Jordan Ellis", firstName: "Jordan", initials: "JE", email: "jordan@mayfield.co", title: "Project Manager", companyId: "mayfield" },
  mia: { id: "mia", name: "Mia Fregolle", firstName: "Mia", initials: "MF", email: "mia.fregolle@example.com", title: "Client", companyId: "mayfield" },
};

const downtownActuals: DemoActuals = {
  originalEstimate: 914500, approvedChangeOrders: 41800, revisedBudget: 956300, actualToDate: 928700, forecastAtCompletion: 961900, forecastVariance: 5600,
  transactions: [
    { id: "TX-401", source: "QBO", description: "TrueFrame progress invoice", amount: 89600, status: "Mapped" },
    { id: "TX-402", source: "QBO", description: "Spark Electric progress billing", amount: 118400, status: "Auto-mapped" },
    { id: "TX-403", source: "Supplier invoice", description: "Interior finish materials", amount: 42860, status: "Mapped" },
    { id: "TX-404", source: "Uploaded receipt", description: "Field equipment rental", amount: 6840, status: "Needs Review" },
    { id: "TX-405", source: "Manual hard cost", description: "After-hours supervision", amount: 3950, status: "Needs Review" },
  ],
};

export const projects: DemoProject[] = [
  { id: "fregolle", jobNumber: "MF-2026-101", name: "Fregolle Residence", client: "Fregolle Family", builderCompanyId: "mayfield", location: "Cincinnati, OH", type: "Custom Residential / Renovation", specLevel: "Premium", builderStage: "Scope Analyzer", subStage: "Scope Analyzer", builderStatus: "Active Preconstruction", subStatus: "In Progress", builderCost: 1182400, clientPrice: 1418880, markup: 20, proposalScore: 88, subProposalScore: 87, marketPosition: "Within Market", benchmark: { low: 1350000, high: 1470000, sampleCount: 1284, cohort: "similar premium residential projects" }, attention: "3 assumptions require confirmation", assumptions: 3, openRfis: 1, scopeCoverage: 94, bidDue: "Sep 18", quoteId: "quote-fregolle-framing" },
  { id: "hyde-park", jobNumber: "MF-2026-102", name: "Hyde Park Residence", client: "Bennett Family", builderCompanyId: "mayfield", location: "Hyde Park, Cincinnati, OH", type: "Custom Home", size: 8000, specLevel: "Premium", builderStage: "Bid Packages", subStage: "Estimate", builderStatus: "Bidding", subStatus: "In Progress", builderCost: 2820000, clientPrice: 3384000, markup: 20, proposalScore: null, subProposalScore: 89, benchmark: { low: 3220000, high: 3510000, sampleCount: 748, cohort: "large custom-home estimates" }, attention: "2 bid packages awaiting response", assumptions: 0, openRfis: 1, scopeCoverage: 97, bidDue: "Sep 11", quoteId: "quote-hyde-framing" },
  { id: "maple-street", jobNumber: "MF-2026-103", name: "Maple Street Kitchen Remodel", client: "Johnson Family", builderCompanyId: "mayfield", location: "Cincinnati, OH", type: "Remodel", specLevel: "Premium", builderStage: "Pricing & Margin", subStage: "Pricing & Margin", builderStatus: "Pricing Review", subStatus: "Pricing Review", builderCost: 168700, clientPrice: 202440, markup: 20, proposalScore: 84, subProposalScore: 81, marketPosition: "Above Target Category", benchmark: { low: 188000, high: 215000, sampleCount: 3842, cohort: "residential remodel estimates" }, attention: "margin below company target", assumptions: 1, openRfis: 0, scopeCoverage: 100, bidDue: "Sep 14", quoteId: "quote-maple-framing" },
  { id: "oakwood", jobNumber: "MF-2026-104", name: "Oakwood Custom Home", client: "Harper Family", builderCompanyId: "mayfield", location: "Oakwood, OH", type: "Custom Home", specLevel: "Premium", builderStage: "Proposal Export", subStage: "Proposal Export", builderStatus: "Ready to Send", subStatus: "Ready to Send", builderCost: 1952000, clientPrice: 2342400, markup: 20, proposalScore: 91, subProposalScore: 92, marketPosition: "Strong / Within Market", benchmark: { low: 2240000, high: 2410000, sampleCount: 962, cohort: "custom-home estimates" }, attention: "proposal fully generated", assumptions: 0, openRfis: 0, scopeCoverage: 100, bidDue: "Sep 16", quoteId: "quote-oakwood-framing" },
  { id: "riverside", jobNumber: "MF-2026-105", name: "Riverside Addition", client: "Miller Family", builderCompanyId: "mayfield", location: "Cincinnati, OH", type: "Residential Addition", specLevel: "Mid-Tier", builderStage: "Document Upload", subStage: "Document Upload", builderStatus: "Early Scope", subStatus: "Reviewing Documents", builderCost: null, clientPrice: null, markup: null, proposalScore: null, subProposalScore: null, benchmark: { low: 540000, high: 630000, sampleCount: 1126, cohort: "residential additions" }, attention: "scope analysis incomplete", assumptions: 5, openRfis: 2, scopeCoverage: 42, bidDue: "Sep 25", quoteId: "quote-riverside-framing" },
  { id: "downtown-ti", jobNumber: "MF-2026-106", name: "Downtown TI — Suite 400", client: "Fourth Street Partners", builderCompanyId: "mayfield", location: "Downtown Cincinnati, OH", type: "Tenant Improvement", specLevel: "Commercial", builderStage: "Est. vs Actual", subStage: "Est. vs Actual", builderStatus: "Construction", subStatus: "Awarded / Active", builderCost: 914500, clientPrice: 1097400, markup: 20, proposalScore: 90, subProposalScore: 90, marketPosition: "Within Market", benchmark: { low: 880000, high: 995000, sampleCount: 2106, cohort: "tenant-improvement estimates" }, attention: "forecast exceeds revised budget by $5,600", assumptions: 0, openRfis: 0, scopeCoverage: 100, quoteId: "quote-downtown-framing", actuals: downtownActuals },
];

export const quotes: DemoQuote[] = [
  { id: "quote-fregolle-framing", projectId: "fregolle", companyId: "trueframe", trade: "Framing", currentAmount: 131850, status: "In Progress", score: 87, revisions: [{ version: "v1", amount: 126400, date: "2026-08-27", reason: "Initial framing scope" }, { version: "v2", amount: 131850, date: "2026-09-08", reason: "Scope clarification and add-backs discovered during review" }] },
  { id: "quote-hyde-framing", projectId: "hyde-park", companyId: "trueframe", trade: "Framing", currentAmount: 248600, status: "In Progress", score: 89, revisions: [{ version: "v1", amount: 248600, date: "2026-09-05", reason: "Current complete framing scope" }] },
  { id: "quote-maple-framing", projectId: "maple-street", companyId: "trueframe", trade: "Framing", currentAmount: 31250, status: "Pricing Review", score: 81, revisions: [{ version: "v1", amount: 31250, date: "2026-09-03", reason: "Small structural and framing package" }] },
  { id: "quote-oakwood-framing", projectId: "oakwood", companyId: "trueframe", trade: "Framing", currentAmount: 172400, status: "Ready to Send", score: 92, revisions: [{ version: "v1", amount: 172400, date: "2026-09-01", reason: "Complete framing quote" }] },
  { id: "quote-riverside-framing", projectId: "riverside", companyId: "trueframe", trade: "Framing", currentAmount: null, preliminaryAmount: 64800, status: "Reviewing Documents", score: null, revisions: [] },
  { id: "quote-downtown-framing", projectId: "downtown-ti", companyId: "trueframe", trade: "Framing", currentAmount: 92750, status: "Awarded / Active", score: 90, revisions: [{ version: "Awarded", amount: 92750, date: "2026-06-14", reason: "Executed carpentry package" }] },
];

export const documents: DemoDocument[] = [
  { id: "doc-fregolle-plans", projectId: "fregolle", filename: "FinalConstructionSetFregolle.pdf", sourceType: "plans", uploadedBy: "frankie", uploadedAt: "2026-04-05", revision: "Issued for Construction", classification: "Architectural / Structural Plan Set", primary: true, excluded: false, assetUrl: mainPlanAsset.url, sheets: ["A1.1", "A1.2", "A2.1", "S1.1", "S1.2", "P1.1", "M1.1", "E1.1"] },
  { id: "doc-fregolle-trueframe-v1", projectId: "fregolle", filename: "TrueFrame_Fregolle_Framing_v1.pdf", sourceType: "subcontractor bid", uploadedBy: "tyler", uploadedAt: "2026-08-27", revision: "v1", classification: "Framing Quote", primary: false, excluded: false },
  { id: "doc-fregolle-trueframe-v2", projectId: "fregolle", filename: "TrueFrame_Fregolle_Framing_v2.pdf", sourceType: "subcontractor bid", uploadedBy: "tyler", uploadedAt: "2026-09-08", revision: "v2", classification: "Framing Quote", primary: false, excluded: false },
  ...projects.filter(p => p.id !== "fregolle").flatMap((p, index) => [
    { id: `doc-${p.id}-plans`, projectId: p.id, filename: `${p.name.replace(/[^a-z0-9]+/gi, "_")}_Plans.pdf`, sourceType: "plans" as const, uploadedBy: "frankie", uploadedAt: `2026-0${Math.max(3, 8-index)}-12`, revision: "Current", classification: "Plan Set", primary: true, excluded: false },
    { id: `doc-${p.id}-structural`, projectId: p.id, filename: `${p.name.replace(/[^a-z0-9]+/gi, "_")}_Structural.pdf`, sourceType: "structural" as const, uploadedBy: "frankie", uploadedAt: `2026-0${Math.max(3, 8-index)}-13`, revision: "Current", classification: "Structural", primary: false, excluded: false },
  ]),
];

export const builderCostCategories = [
  { name: "Preconstruction", share: 58400 / 1182400 }, { name: "Sitework", share: 105000 / 1182400 }, { name: "Concrete", share: 185000 / 1182400 },
  { name: "Masonry", share: 68000 / 1182400 }, { name: "Framing", share: 131850 / 1182400 }, { name: "Roofing", share: 112000 / 1182400 },
  { name: "Openings", share: 98000 / 1182400 }, { name: "Finishes", share: 162000 / 1182400 }, { name: "MEP", share: 189150 / 1182400 }, { name: "General Conditions", share: 73000 / 1182400 },
];
export const trueFrameCostCategories = [
  { name: "Framing Labor", base: 42000 }, { name: "Lumber & Materials", base: 34000 }, { name: "Trusses", base: 12500 }, { name: "Sheathing", base: 7500 },
  { name: "Hardware & LVL", base: 3480 }, { name: "General Requirements", base: 4000 }, { name: "Pre-Build", base: 2000 },
];

export const framingBidPool: Record<string, { companyId: string; amount: number; addBacks: number; coverage: number; note: string }[]> = {
  fregolle: [
    { companyId: "trueframe", amount: 131850, addBacks: 0, coverage: 98, note: "Selected — complete scope after v2 clarification" },
    { companyId: "queen-city-framing", amount: 136900, addBacks: 1800, coverage: 94, note: "Excludes engineered lumber handling" },
    { companyId: "precision-structural", amount: 127600, addBacks: 8900, coverage: 86, note: "Lower base; blocking and hardware excluded" },
  ],
  "hyde-park": [
    { companyId: "trueframe", amount: 248600, addBacks: 0, coverage: 98, note: "Best-fit complete package" },
    { companyId: "queen-city-framing", amount: 257900, addBacks: 0, coverage: 96, note: "Complete scope; longer schedule" },
    { companyId: "precision-structural", amount: 242300, addBacks: 19400, coverage: 84, note: "Lowest base; excludes hardware and roof sheathing" },
  ],
  "maple-street": [
    { companyId: "trueframe", amount: 31250, addBacks: 0, coverage: 100, note: "Current structural framing package" },
    { companyId: "queen-city-framing", amount: 33800, addBacks: 0, coverage: 98, note: "Complete scope; two-week lead time" },
    { companyId: "precision-structural", amount: 28700, addBacks: 4200, coverage: 88, note: "Excludes temporary support and patch framing" },
  ],
  oakwood: [
    { companyId: "trueframe", amount: 172400, addBacks: 0, coverage: 100, note: "Selected complete framing quote" },
    { companyId: "queen-city-framing", amount: 181900, addBacks: 0, coverage: 97, note: "Complete alternate proposal" },
    { companyId: "precision-structural", amount: 165800, addBacks: 12400, coverage: 89, note: "Hardware and crane time excluded" },
  ],
  riverside: [
    { companyId: "trueframe", amount: 64800, addBacks: 0, coverage: 42, note: "Preliminary allowance pending structural plans" },
    { companyId: "queen-city-framing", amount: 0, addBacks: 0, coverage: 0, note: "Invitation sent — awaiting bid" },
  ],
  "downtown-ti": [
    { companyId: "trueframe", amount: 92750, addBacks: 0, coverage: 100, note: "Awarded carpentry package" },
    { companyId: "queen-city-framing", amount: 98600, addBacks: 0, coverage: 100, note: "Final comparison bid" },
    { companyId: "precision-structural", amount: 89900, addBacks: 7600, coverage: 91, note: "Excludes night-shift premium" },
  ],
};

export const activities = [
  { id: "activity-1", track: "builder" as const, projectId: "fregolle", text: "Frankie confirmed the Fregolle foundation assumption", time: "18 minutes ago" },
  { id: "activity-2", track: "sub" as const, projectId: "fregolle", text: "TrueFrame revised the Fregolle framing quote to $131,850", time: "1 hour ago" },
  { id: "activity-3", track: "builder" as const, projectId: "hyde-park", text: "Hyde Park framing bid received from Queen City Framing", time: "3 hours ago" },
  { id: "activity-4", track: "builder" as const, projectId: "oakwood", text: "Oakwood proposal generated by Frankie Mayfield", time: "Yesterday" },
  { id: "activity-5", track: "builder" as const, projectId: "riverside", text: "Riverside structural plans uploaded", time: "Yesterday" },
  { id: "activity-6", track: "builder" as const, projectId: "downtown-ti", text: "Downtown TI QBO sync imported 14 new actual costs", time: "2 days ago" },
];

export const notificationsByTrack = {
  builder: [
    { id: "bn1", projectId: "fregolle", title: "Fregolle has 3 unresolved assumptions", detail: "Review before scope is structured", route: "/app/scope-analyzer", tone: "warning" },
    { id: "bn2", projectId: "hyde-park", title: "Hyde Park framing bid due tomorrow", detail: "Two packages are still awaiting response", route: "/app/bid-leveling", tone: "info" },
    { id: "bn3", projectId: "maple-street", title: "Maple Street gross margin below target", detail: "Pricing review is required", route: "/app/pricing", tone: "warning" },
    { id: "bn4", projectId: "downtown-ti", title: "Downtown TI forecast exceeds revised budget", detail: "Forecast variance is +$5,600", route: "/app/est-vs-actual", tone: "warning" },
  ],
  sub: [
    { id: "sn1", projectId: "fregolle", title: "Fregolle clarification requires review", detail: "Revision v2 includes scope add-backs", route: "/sub/scope-analyzer", tone: "warning" },
    { id: "sn2", projectId: "hyde-park", title: "Hyde Park quote due Friday", detail: "Estimate is in progress", route: "/sub/estimate-builder", tone: "info" },
    { id: "sn3", projectId: "maple-street", title: "Maple Street pricing requires attention", detail: "One category is above target", route: "/sub/pricing", tone: "warning" },
    { id: "sn4", projectId: "downtown-ti", title: "Downtown TI invoice imported", detail: "$89,600 invoiced to date", route: "/sub/est-vs-actual", tone: "info" },
  ],
};

export function getProject(id: string | undefined) { return projects.find(project => project.id === id) ?? projects[0]; }
export function getQuote(project: DemoProject) { return quotes.find(quote => quote.id === project.quoteId) ?? quotes[0]; }
export function getProjectDocuments(projectId: string) { return documents.filter(document => document.projectId === projectId); }
export function getProjectRoute(project: DemoProject, track: DemoTrack) {
  const map: Record<WorkflowStage, string> = track === "builder" ? { "Document Upload": "/app/upload", "Scope Analyzer": "/app/scope-analyzer", "Bid Packages": "/app/bid-leveling", Estimate: "/app/estimate-builder", "Pricing & Margin": "/app/pricing", "Proposal Export": "/app/proposal", "Market Comparison": "/app/market-comparison", "Est. vs Actual": "/app/est-vs-actual" } : { "Document Upload": "/sub/upload", "Scope Analyzer": "/sub/scope-analyzer", "Bid Packages": "/sub/bid-leveling", Estimate: "/sub/estimate-builder", "Pricing & Margin": "/sub/pricing", "Proposal Export": "/sub/proposal", "Market Comparison": "/sub/market-comparison", "Est. vs Actual": "/sub/est-vs-actual" };
  return map[track === "builder" ? project.builderStage : project.subStage];
}
export const money = (value: number | null | undefined) => value == null ? "—" : `$${value.toLocaleString()}`;
