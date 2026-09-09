import { projects, quotes, type DemoTrack } from "@/data/demoUniverse";

export type Relationship = "Client" | "Subcontractor" | "Vendor" | "General Contractor";
export type ComplianceState = "In Compliance" | "Expiring Soon" | "Missing" | "Needs Review" | "Out of Compliance";
export type RequirementKey = "generalLiability" | "workersComp" | "commercialAuto" | "w9" | "umbrella" | "license";

export interface NetworkContact {
  id: string; firstName: string; lastName: string; title: string; email: string; officePhone?: string; mobilePhone?: string;
  preferred: "Email" | "Mobile" | "Office"; tags: string[]; notes?: string;
}

export interface ComplianceRecord {
  key: RequirementKey; label: string; required: boolean; status: ComplianceState;
  carrier?: string; policyNumber?: string; effective?: string; expires?: string; details?: string;
  source?: string; note?: string;
}

export interface BidHistoryRow { projectId: string; project: string; raw: number; leveled: number; result: string; marketPosition: string; }
export interface CostPerformanceRow { projectId: string; project: string; originalQuote: number; changeOrders: number; revisedContract: number; actual: number; invoices: number; }
export interface PricePoint { month: string; price: number; }
export interface PriceHistory { item: string; unit: string; points: PricePoint[]; }

export interface NetworkCompany {
  id: string; name: string; legalName: string; dba?: string; relationship: Relationship; trade: string;
  address: string; city: string; state: string; zip: string; phone: string; email: string; website?: string;
  serviceArea: string; taxId?: string; status: "Active" | "Prospect" | "Inactive"; notes: string;
  contacts: NetworkContact[];
  projectIds: string[];
  compliance?: ComplianceRecord[];
  complianceOverall?: ComplianceState;
  projectCompliance?: { projectId: string; note: string; state: ComplianceState }[];
  bids?: BidHistoryRow[];
  costPerformance?: CostPerformanceRow[];
  priceHistory?: PriceHistory[];
  totalSpend?: number;
  documents?: { id: string; name: string; type: string; uploaded: string }[];
  lastActivity: string;
}

const today = new Date("2026-09-09");
export const daysUntil = (iso?: string) => (iso ? Math.round((new Date(iso).getTime() - today.getTime()) / 86400000) : null);
export const fmtDate = (iso?: string) => (iso ? new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—");
export const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

const req = (
  key: RequirementKey, label: string, status: ComplianceState,
  extra: Partial<ComplianceRecord> = {},
): ComplianceRecord => ({ key, label, required: key !== "umbrella" && key !== "license", status, ...extra });

export const complianceRequirementDefaults = {
  generalLiability: { required: true, eachOccurrence: 1000000, aggregate: 2000000, additionalInsured: true, primaryNoncontributory: true, waiverOfSubrogation: true },
  workersComp: { required: true, statutory: true },
  commercialAuto: { required: true, csl: 1000000 },
  w9: { required: true },
  umbrella: { required: false, limit: 2000000 },
  license: { required: false },
  warningPeriodDays: 30,
};

const trueframeContacts: NetworkContact[] = [
  { id: "tyler", firstName: "Tyler", lastName: "Reed", title: "Estimator", email: "tyler@trueframe.co", officePhone: "(513) 555-0184", mobilePhone: "(513) 555-0921", preferred: "Email", tags: ["Primary", "Estimating"] },
  { id: "mark", firstName: "Mark", lastName: "Collins", title: "Field Superintendent", email: "mark@trueframe.co", mobilePhone: "(513) 555-0162", preferred: "Mobile", tags: ["Field"] },
  { id: "ashley", firstName: "Ashley", lastName: "Moore", title: "Accounts Receivable", email: "ashley@trueframe.co", officePhone: "(513) 555-0177", preferred: "Email", tags: ["Accounting"] },
];

const builderSubcontractors: NetworkCompany[] = [
  {
    id: "trueframe", name: "TrueFrame Carpentry", legalName: "TrueFrame Carpentry LLC", relationship: "Subcontractor", trade: "Framing / Carpentry",
    address: "4120 Vine St", city: "Cincinnati", state: "OH", zip: "45217", phone: "(513) 555-0184", email: "office@trueframe.co", website: "trueframe.co",
    serviceArea: "Greater Cincinnati / Northern Kentucky", taxId: "**-***4187", status: "Active",
    notes: "Preferred framing partner. Consistent quantities, low change-order exposure.",
    contacts: trueframeContacts, projectIds: ["fregolle", "hyde-park", "maple-street", "downtown-ti"],
    complianceOverall: "Expiring Soon",
    compliance: [
      req("generalLiability", "General Liability / COI", "In Compliance", { carrier: "Cincinnati Insurance", policyNumber: "GL-4471203", effective: "2026-01-01", expires: "2027-01-01", details: "$1M occurrence / $2M aggregate · AI + waiver", source: "TrueFrame_COI_2026.pdf" }),
      req("workersComp", "Workers' Compensation", "In Compliance", { carrier: "Ohio BWC", policyNumber: "WC-889210", effective: "2026-01-01", expires: "2027-01-01", details: "Statutory", source: "TrueFrame_WC_2026.pdf" }),
      req("commercialAuto", "Commercial Auto", "Expiring Soon", { carrier: "Cincinnati Insurance", policyNumber: "CA-113887", effective: "2025-10-01", expires: "2026-10-01", details: "$1M CSL", source: "TrueFrame_Auto.pdf" }),
      req("w9", "W-9", "In Compliance", { details: "TrueFrame Carpentry LLC · S-Corp", effective: "2026-01-14", source: "TrueFrame_W9.pdf" }),
    ],
    projectCompliance: [{ projectId: "fregolle", note: "Project-specific additional insured endorsement required", state: "Needs Review" }],
    bids: [
      { projectId: "fregolle", project: "Fregolle Residence", raw: 131850, leveled: 131850, result: "Pending", marketPosition: "+1.8%" },
      { projectId: "hyde-park", project: "Hyde Park Residence", raw: 248600, leveled: 248600, result: "Pending", marketPosition: "-0.4%" },
      { projectId: "maple-street", project: "Maple Street Kitchen", raw: 31250, leveled: 31250, result: "Pending", marketPosition: "+2.6%" },
      { projectId: "downtown-ti", project: "Downtown TI — Suite 400", raw: 92750, leveled: 92750, result: "Awarded", marketPosition: "+0.9%" },
    ],
    costPerformance: [
      { projectId: "downtown-ti", project: "Downtown TI — Suite 400", originalQuote: 92750, changeOrders: 0, revisedContract: 92750, actual: 89600, invoices: 6 },
    ],
    totalSpend: 92750,
    documents: [
      { id: "d1", name: "TrueFrame_COI_2026.pdf", type: "General Liability", uploaded: "Jan 4, 2026" },
      { id: "d2", name: "TrueFrame_WC_2026.pdf", type: "Workers Comp", uploaded: "Jan 4, 2026" },
      { id: "d3", name: "TrueFrame_W9.pdf", type: "W-9", uploaded: "Jan 14, 2026" },
    ],
    lastActivity: "Revised Fregolle quote to $131,850 · 2 hours ago",
  },
  {
    id: "spark-electric", name: "Spark Electric Co.", legalName: "Spark Electric Co.", relationship: "Subcontractor", trade: "Electrical",
    address: "88 Reading Rd", city: "Cincinnati", state: "OH", zip: "45202", phone: "(513) 555-0310", email: "bids@sparkelectric.co",
    serviceArea: "Hamilton County", status: "Active", notes: "Competitive on commercial TI. Watch insurance renewals.",
    contacts: [
      { id: "dana", firstName: "Dana", lastName: "Whitfield", title: "Chief Estimator", email: "dana@sparkelectric.co", officePhone: "(513) 555-0310", preferred: "Email", tags: ["Primary", "Estimating"] },
      { id: "ray", firstName: "Ray", lastName: "Ortega", title: "Owner", email: "ray@sparkelectric.co", mobilePhone: "(513) 555-0399", preferred: "Mobile", tags: ["Owner"] },
    ],
    projectIds: ["hyde-park", "downtown-ti"],
    complianceOverall: "Out of Compliance",
    compliance: [
      req("generalLiability", "General Liability / COI", "In Compliance", { carrier: "Westfield", policyNumber: "GL-77120", effective: "2026-03-01", expires: "2027-03-01", details: "$1M / $2M", source: "Spark_COI.pdf" }),
      req("workersComp", "Workers' Compensation", "Out of Compliance", { carrier: "Ohio BWC", policyNumber: "WC-220041", effective: "2025-09-01", expires: "2026-08-31", details: "Policy expired 9 days ago", source: "Spark_WC.pdf" }),
      req("commercialAuto", "Commercial Auto", "In Compliance", { carrier: "Westfield", policyNumber: "CA-55210", effective: "2026-02-01", expires: "2027-02-01", details: "$1M CSL", source: "Spark_Auto.pdf" }),
      req("w9", "W-9", "In Compliance", { details: "Spark Electric Co. · C-Corp", source: "Spark_W9.pdf" }),
    ],
    bids: [
      { projectId: "hyde-park", project: "Hyde Park Residence", raw: 164200, leveled: 164200, result: "Pending", marketPosition: "+3.1%" },
      { projectId: "downtown-ti", project: "Downtown TI — Suite 400", raw: 118400, leveled: 118400, result: "Awarded", marketPosition: "-1.2%" },
    ],
    costPerformance: [{ projectId: "downtown-ti", project: "Downtown TI — Suite 400", originalQuote: 118400, changeOrders: 6200, revisedContract: 124600, actual: 118400, invoices: 4 }],
    totalSpend: 118400,
    lastActivity: "Hyde Park electrical bid received · yesterday",
  },
  {
    id: "aquaflow", name: "AquaFlow Plumbing", legalName: "AquaFlow Plumbing Inc.", relationship: "Subcontractor", trade: "Plumbing",
    address: "1207 Spring Grove Ave", city: "Cincinnati", state: "OH", zip: "45225", phone: "(513) 555-0446", email: "estimating@aquaflow.co",
    serviceArea: "Greater Cincinnati", status: "Active", notes: "Reliable residential plumbing partner.",
    contacts: [{ id: "nina", firstName: "Nina", lastName: "Barrett", title: "Estimator", email: "nina@aquaflow.co", officePhone: "(513) 555-0446", preferred: "Email", tags: ["Primary", "Estimating"] }],
    projectIds: ["fregolle", "oakwood"],
    complianceOverall: "In Compliance",
    compliance: [
      req("generalLiability", "General Liability / COI", "In Compliance", { carrier: "Grange", policyNumber: "GL-30112", effective: "2026-05-01", expires: "2027-05-01", details: "$1M / $2M", source: "AquaFlow_COI.pdf" }),
      req("workersComp", "Workers' Compensation", "In Compliance", { carrier: "Ohio BWC", policyNumber: "WC-33489", effective: "2026-05-01", expires: "2027-05-01", details: "Statutory", source: "AquaFlow_WC.pdf" }),
      req("commercialAuto", "Commercial Auto", "In Compliance", { carrier: "Grange", policyNumber: "CA-91002", effective: "2026-05-01", expires: "2027-05-01", details: "$1M CSL", source: "AquaFlow_Auto.pdf" }),
      req("w9", "W-9", "In Compliance", { details: "AquaFlow Plumbing Inc. · S-Corp", source: "AquaFlow_W9.pdf" }),
    ],
    bids: [{ projectId: "fregolle", project: "Fregolle Residence", raw: 74300, leveled: 74300, result: "Pending", marketPosition: "-0.8%" }],
    lastActivity: "Fregolle plumbing bid submitted · 3 days ago",
  },
  {
    id: "climateworks", name: "ClimateWorks Mechanical", legalName: "ClimateWorks Mechanical LLC", relationship: "Subcontractor", trade: "HVAC",
    address: "6600 Montgomery Rd", city: "Cincinnati", state: "OH", zip: "45236", phone: "(513) 555-0522", email: "bids@climateworks.co",
    serviceArea: "Southwest Ohio", status: "Active", notes: "Additional insured endorsement referenced but not attached.",
    contacts: [{ id: "victor", firstName: "Victor", lastName: "Hale", title: "Preconstruction Manager", email: "victor@climateworks.co", officePhone: "(513) 555-0522", preferred: "Email", tags: ["Primary", "Estimating"] }],
    projectIds: ["fregolle", "downtown-ti"],
    complianceOverall: "Needs Review",
    compliance: [
      req("generalLiability", "General Liability / COI", "Needs Review", { carrier: "Nationwide", policyNumber: "GL-88342", effective: "2026-04-01", expires: "2027-04-01", details: "$1M / $2M · additional insured endorsement referenced but not included", source: "ClimateWorks_COI.pdf" }),
      req("workersComp", "Workers' Compensation", "In Compliance", { carrier: "Ohio BWC", policyNumber: "WC-77012", effective: "2026-04-01", expires: "2027-04-01", details: "Statutory", source: "ClimateWorks_WC.pdf" }),
      req("commercialAuto", "Commercial Auto", "In Compliance", { carrier: "Nationwide", policyNumber: "CA-22118", effective: "2026-04-01", expires: "2027-04-01", details: "$1M CSL" }),
      req("w9", "W-9", "In Compliance", { details: "ClimateWorks Mechanical LLC" }),
    ],
    bids: [{ projectId: "fregolle", project: "Fregolle Residence", raw: 96400, leveled: 96400, result: "Pending", marketPosition: "+6.4%" }],
    lastActivity: "Fregolle HVAC bid received · 4 days ago",
  },
  {
    id: "queen-city-drywall", name: "Queen City Drywall", legalName: "Queen City Drywall LLC", relationship: "Subcontractor", trade: "Drywall",
    address: "980 Harrison Ave", city: "Cincinnati", state: "OH", zip: "45214", phone: "(513) 555-0611", email: "office@qcdrywall.co",
    serviceArea: "Greater Cincinnati", status: "Active", notes: "",
    contacts: [{ id: "sam", firstName: "Sam", lastName: "Doyle", title: "Owner / Estimator", email: "sam@qcdrywall.co", mobilePhone: "(513) 555-0611", preferred: "Mobile", tags: ["Primary", "Owner", "Estimating"] }],
    projectIds: ["hyde-park", "oakwood"],
    complianceOverall: "In Compliance",
    compliance: [
      req("generalLiability", "General Liability / COI", "In Compliance", { carrier: "Erie", policyNumber: "GL-51220", effective: "2026-02-01", expires: "2027-02-01", details: "$1M / $2M", source: "QCD_COI.pdf" }),
      req("workersComp", "Workers' Compensation", "In Compliance", { carrier: "Ohio BWC", policyNumber: "WC-51221", effective: "2026-02-01", expires: "2027-02-01", details: "Statutory" }),
      req("commercialAuto", "Commercial Auto", "In Compliance", { carrier: "Erie", policyNumber: "CA-51222", effective: "2026-02-01", expires: "2027-02-01", details: "$1M CSL" }),
      req("w9", "W-9", "In Compliance", { details: "Queen City Drywall LLC" }),
    ],
    lastActivity: "Oakwood drywall pricing confirmed · last week",
  },
  {
    id: "riverstone-concrete", name: "Riverstone Concrete", legalName: "Riverstone Concrete Co.", relationship: "Subcontractor", trade: "Concrete",
    address: "215 River Rd", city: "Cincinnati", state: "OH", zip: "45204", phone: "(513) 555-0733", email: "bids@riverstoneconcrete.co",
    serviceArea: "Cincinnati / Dayton", status: "Active", notes: "W-9 never received.",
    contacts: [{ id: "gil", firstName: "Gil", lastName: "Marchetti", title: "Estimator", email: "gil@riverstoneconcrete.co", officePhone: "(513) 555-0733", preferred: "Office", tags: ["Primary", "Estimating"] }],
    projectIds: ["fregolle", "riverside"],
    complianceOverall: "Missing",
    compliance: [
      req("generalLiability", "General Liability / COI", "In Compliance", { carrier: "Selective", policyNumber: "GL-66120", effective: "2026-06-01", expires: "2027-06-01", details: "$1M / $2M", source: "Riverstone_COI.pdf" }),
      req("workersComp", "Workers' Compensation", "In Compliance", { carrier: "Ohio BWC", policyNumber: "WC-66121", effective: "2026-06-01", expires: "2027-06-01", details: "Statutory" }),
      req("commercialAuto", "Commercial Auto", "In Compliance", { carrier: "Selective", policyNumber: "CA-66122", effective: "2026-06-01", expires: "2027-06-01", details: "$1M CSL" }),
      req("w9", "W-9", "Missing", { details: "No W-9 on file" }),
    ],
    bids: [{ projectId: "fregolle", project: "Fregolle Residence", raw: 88200, leveled: 88200, result: "Awarded", marketPosition: "-2.1%" }],
    lastActivity: "Fregolle foundation quantities confirmed · 5 days ago",
  },
  {
    id: "apex-roofing", name: "Apex Roofing", legalName: "Apex Roofing Systems LLC", relationship: "Subcontractor", trade: "Roofing",
    address: "77 Galbraith Rd", city: "Cincinnati", state: "OH", zip: "45215", phone: "(513) 555-0855", email: "office@apexroof.co",
    serviceArea: "Greater Cincinnati", status: "Active", notes: "",
    contacts: [{ id: "lena", firstName: "Lena", lastName: "Crawford", title: "Estimator", email: "lena@apexroof.co", officePhone: "(513) 555-0855", preferred: "Email", tags: ["Primary", "Estimating"] }],
    projectIds: ["oakwood"],
    complianceOverall: "In Compliance",
    compliance: [
      req("generalLiability", "General Liability / COI", "In Compliance", { carrier: "Cincinnati Insurance", policyNumber: "GL-99001", effective: "2026-03-15", expires: "2027-03-15", details: "$1M / $2M" }),
      req("workersComp", "Workers' Compensation", "In Compliance", { carrier: "Ohio BWC", policyNumber: "WC-99002", effective: "2026-03-15", expires: "2027-03-15", details: "Statutory" }),
      req("commercialAuto", "Commercial Auto", "In Compliance", { carrier: "Cincinnati Insurance", policyNumber: "CA-99003", effective: "2026-03-15", expires: "2027-03-15", details: "$1M CSL" }),
      req("w9", "W-9", "In Compliance", { details: "Apex Roofing Systems LLC" }),
    ],
    lastActivity: "Oakwood roofing scope accepted · last week",
  },
];

const vendors: NetworkCompany[] = [
  {
    id: "qc-building-supply", name: "Queen City Building Supply", legalName: "Queen City Building Supply Inc.", relationship: "Vendor", trade: "Lumber & Building Materials",
    address: "3400 Spring Grove Ave", city: "Cincinnati", state: "OH", zip: "45225", phone: "(513) 555-0900", email: "orders@qcbuildingsupply.com", website: "qcbuildingsupply.com",
    serviceArea: "Tri-State", status: "Active", notes: "Primary lumber and sheathing supplier.",
    contacts: [
      { id: "brett", firstName: "Brett", lastName: "Novak", title: "Account Manager", email: "brett@qcbuildingsupply.com", officePhone: "(513) 555-0900", preferred: "Email", tags: ["Primary"] },
      { id: "kara", firstName: "Kara", lastName: "Simms", title: "Accounts Receivable", email: "ar@qcbuildingsupply.com", preferred: "Email", tags: ["Accounting"] },
    ],
    projectIds: ["fregolle", "hyde-park", "downtown-ti"],
    complianceOverall: "In Compliance",
    compliance: [
      req("generalLiability", "General Liability / COI", "In Compliance", { carrier: "Travelers", policyNumber: "GL-12009", effective: "2026-01-01", expires: "2027-01-01", details: "$1M / $2M" }),
      req("w9", "W-9", "In Compliance", { details: "Queen City Building Supply Inc." }),
    ],
    totalSpend: 214800,
    priceHistory: [
      { item: '7/16" OSB Sheathing', unit: "sheet", points: [{ month: "Jan", price: 18.42 }, { month: "Mar", price: 19.1 }, { month: "Jun", price: 21.3 }, { month: "Sep", price: 20.85 }] },
      { item: "2x6 SPF #2 (16')", unit: "each", points: [{ month: "Jan", price: 12.1 }, { month: "Mar", price: 12.65 }, { month: "Jun", price: 13.4 }, { month: "Sep", price: 13.15 }] },
    ],
    lastActivity: "Downtown TI material invoice imported · 2 days ago",
  },
  {
    id: "tristate-concrete", name: "Tri-State Concrete Supply", legalName: "Tri-State Concrete Supply LLC", relationship: "Vendor", trade: "Concrete Supplier",
    address: "500 Kellogg Ave", city: "Cincinnati", state: "OH", zip: "45226", phone: "(513) 555-0940", email: "dispatch@tristateconcrete.com",
    serviceArea: "Cincinnati", status: "Active", notes: "",
    contacts: [{ id: "omar", firstName: "Omar", lastName: "Reyes", title: "Sales", email: "omar@tristateconcrete.com", officePhone: "(513) 555-0940", preferred: "Office", tags: ["Primary"] }],
    projectIds: ["fregolle", "riverside"],
    complianceOverall: "In Compliance",
    compliance: [req("w9", "W-9", "In Compliance", { details: "Tri-State Concrete Supply LLC" })],
    totalSpend: 68400,
    priceHistory: [{ item: "4000 PSI Mix", unit: "CY", points: [{ month: "Jan", price: 158 }, { month: "Mar", price: 161 }, { month: "Jun", price: 166 }, { month: "Sep", price: 168 }] }],
    lastActivity: "Fregolle foundation delivery scheduled · 6 days ago",
  },
  {
    id: "midwest-fastener", name: "Midwest Fastener & Hardware", legalName: "Midwest Fastener & Hardware Co.", relationship: "Vendor", trade: "Hardware / Connectors",
    address: "212 Industrial Way", city: "Covington", state: "KY", zip: "41011", phone: "(859) 555-0177", email: "sales@midwestfastener.com",
    serviceArea: "Tri-State", status: "Active", notes: "",
    contacts: [{ id: "paul", firstName: "Paul", lastName: "Adkins", title: "Inside Sales", email: "paul@midwestfastener.com", officePhone: "(859) 555-0177", preferred: "Email", tags: ["Primary"] }],
    projectIds: ["hyde-park"],
    complianceOverall: "Needs Review",
    compliance: [req("w9", "W-9", "Needs Review", { details: "W-9 on file is from 2022 — confirm current" })],
    totalSpend: 18900,
    priceHistory: [{ item: "Simpson LSTA24 Strap", unit: "each", points: [{ month: "Jan", price: 2.84 }, { month: "Mar", price: 2.91 }, { month: "Jun", price: 3.12 }, { month: "Sep", price: 3.08 }] }],
    lastActivity: "Hyde Park hardware quote received · last week",
  },
];

const clientOf = (id: string, name: string, legalName: string, contact: NetworkContact, projectIds: string[], notes = ""): NetworkCompany => ({
  id, name, legalName, relationship: "Client", trade: "Residential Owner",
  address: "—", city: "Cincinnati", state: "OH", zip: "45202", phone: contact.mobilePhone || contact.officePhone || "(513) 555-0100",
  email: contact.email, serviceArea: "Cincinnati", status: "Active", notes, contacts: [contact], projectIds,
  lastActivity: "Proposal activity",
});

const clients: NetworkCompany[] = [
  clientOf("fregolle-family", "Fregolle Family", "Mia & Daniel Fregolle", { id: "mia", firstName: "Mia", lastName: "Fregolle", title: "Owner", email: "mia.fregolle@example.com", mobilePhone: "(513) 555-0201", preferred: "Email", tags: ["Primary"] }, ["fregolle"], "Premium renovation. Prefers weekly written updates."),
  clientOf("bennett-family", "Bennett Family", "Alan & Ruth Bennett", { id: "alan", firstName: "Alan", lastName: "Bennett", title: "Owner", email: "alan.bennett@example.com", mobilePhone: "(513) 555-0233", preferred: "Mobile", tags: ["Primary"] }, ["hyde-park"]),
  clientOf("johnson-family", "Johnson Family", "Peter & Cara Johnson", { id: "cara", firstName: "Cara", lastName: "Johnson", title: "Owner", email: "cara.johnson@example.com", mobilePhone: "(513) 555-0255", preferred: "Email", tags: ["Primary"] }, ["maple-street"]),
  clientOf("harper-family", "Harper Family", "Doug & Elaine Harper", { id: "doug", firstName: "Doug", lastName: "Harper", title: "Owner", email: "doug.harper@example.com", mobilePhone: "(937) 555-0288", preferred: "Email", tags: ["Primary"] }, ["oakwood"]),
  clientOf("miller-family", "Miller Family", "Jon & Amy Miller", { id: "amy", firstName: "Amy", lastName: "Miller", title: "Owner", email: "amy.miller@example.com", mobilePhone: "(513) 555-0299", preferred: "Mobile", tags: ["Primary"] }, ["riverside"]),
  {
    id: "fourth-street-partners", name: "Fourth Street Partners", legalName: "Fourth Street Partners LP", relationship: "Client", trade: "Commercial Owner / Developer",
    address: "400 Fourth St", city: "Cincinnati", state: "OH", zip: "45202", phone: "(513) 555-0777", email: "pm@fourthstreetpartners.com", website: "fourthstreetpartners.com",
    serviceArea: "Downtown Cincinnati", status: "Active", notes: "Tenant improvement portfolio owner. Monthly cost reporting required.",
    contacts: [
      { id: "grace", firstName: "Grace", lastName: "Lin", title: "Asset Manager", email: "grace@fourthstreetpartners.com", officePhone: "(513) 555-0777", preferred: "Email", tags: ["Primary"] },
      { id: "tom", firstName: "Tom", lastName: "Baxter", title: "Accounts Payable", email: "ap@fourthstreetpartners.com", preferred: "Email", tags: ["Accounting"] },
    ],
    projectIds: ["downtown-ti"], lastActivity: "Change order #3 approved · last week",
  },
];

const mayfieldAsClient: NetworkCompany = {
  id: "mayfield", name: "Mayfield & Co.", legalName: "Mayfield & Co. Construction LLC", relationship: "General Contractor", trade: "General Contractor / Design-Build",
  address: "1400 Central Pkwy", city: "Cincinnati", state: "OH", zip: "45202", phone: "(513) 555-0140", email: "precon@mayfield.co", website: "mayfield.co",
  serviceArea: "Greater Cincinnati", status: "Active", notes: "Primary GC customer. Six active opportunities.",
  contacts: [
    { id: "frankie", firstName: "Frankie", lastName: "Mayfield", title: "Estimator / Preconstruction", email: "frankie@mayfield.co", officePhone: "(513) 555-0140", mobilePhone: "(513) 555-0141", preferred: "Email", tags: ["Primary", "Estimating"] },
    { id: "jordan", firstName: "Jordan", lastName: "Ellis", title: "Project Manager", email: "jordan@mayfield.co", mobilePhone: "(513) 555-0148", preferred: "Mobile", tags: ["Field"] },
    { id: "ap-mayfield", firstName: "Rita", lastName: "Owens", title: "Accounts Payable", email: "ap@mayfield.co", preferred: "Email", tags: ["Accounting"] },
  ],
  projectIds: projects.map(p => p.id),
  bids: [
    { projectId: "fregolle", project: "Fregolle Residence", raw: 131850, leveled: 131850, result: "Pending", marketPosition: "+4.1%" },
    { projectId: "hyde-park", project: "Hyde Park Residence", raw: 248600, leveled: 248600, result: "Pending", marketPosition: "-0.4%" },
    { projectId: "oakwood", project: "Oakwood Custom Home", raw: 172400, leveled: 172400, result: "Ready to Send", marketPosition: "+1.1%" },
    { projectId: "downtown-ti", project: "Downtown TI — Suite 400", raw: 92750, leveled: 92750, result: "Awarded", marketPosition: "+0.9%" },
  ],
  costPerformance: [{ projectId: "downtown-ti", project: "Downtown TI — Suite 400", originalQuote: 92750, changeOrders: 0, revisedContract: 92750, actual: 89600, invoices: 6 }],
  totalSpend: 92750,
  lastActivity: "Fregolle scope package issued · 2 hours ago",
};

const subVendors: NetworkCompany[] = [
  { ...vendors[0], projectIds: ["fregolle", "hyde-park"], totalSpend: 74200, lastActivity: "Lumber quote refreshed · 3 days ago" },
  { ...vendors[2], projectIds: ["fregolle"], totalSpend: 9400, lastActivity: "Connector pricing updated · last week" },
  {
    id: "buckeye-truss", name: "Buckeye Truss & Components", legalName: "Buckeye Truss & Components LLC", relationship: "Vendor", trade: "Trusses / Engineered Lumber",
    address: "980 Commerce Dr", city: "Fairfield", state: "OH", zip: "45014", phone: "(513) 555-0466", email: "quotes@buckeyetruss.com",
    serviceArea: "Southwest Ohio", status: "Active", notes: "LVL and roof truss packages.",
    contacts: [{ id: "hank", firstName: "Hank", lastName: "Doss", title: "Sales Engineer", email: "hank@buckeyetruss.com", officePhone: "(513) 555-0466", preferred: "Email", tags: ["Primary"] }],
    projectIds: ["hyde-park", "oakwood"], totalSpend: 41200,
    priceHistory: [{ item: '1-3/4" x 11-7/8" LVL', unit: "LF", points: [{ month: "Jan", price: 7.4 }, { month: "Mar", price: 7.62 }, { month: "Jun", price: 7.95 }, { month: "Sep", price: 7.78 }] }],
    lastActivity: "Hyde Park LVL package quoted · 4 days ago",
  },
];

const subClients: NetworkCompany[] = [
  mayfieldAsClient,
  {
    id: "harborline-builders", name: "Harborline Builders", legalName: "Harborline Builders Inc.", relationship: "General Contractor", trade: "General Contractor",
    address: "2200 Madison Rd", city: "Cincinnati", state: "OH", zip: "45208", phone: "(513) 555-0512", email: "bids@harborline.co",
    serviceArea: "Cincinnati", status: "Prospect", notes: "Invited TrueFrame to bid two multifamily projects.",
    contacts: [{ id: "ellen", firstName: "Ellen", lastName: "Pike", title: "Preconstruction Lead", email: "ellen@harborline.co", officePhone: "(513) 555-0512", preferred: "Email", tags: ["Primary", "Estimating"] }],
    projectIds: [], lastActivity: "Bid invitation received · last week",
  },
];

const subSubs: NetworkCompany[] = [
  {
    id: "ridgeline-labor", name: "Ridgeline Labor Services", legalName: "Ridgeline Labor Services LLC", relationship: "Subcontractor", trade: "Framing Labor",
    address: "45 Cross St", city: "Cincinnati", state: "OH", zip: "45211", phone: "(513) 555-0620", email: "office@ridgelinelabor.co",
    serviceArea: "Cincinnati", status: "Active", notes: "Overflow framing crews.",
    contacts: [{ id: "cesar", firstName: "Cesar", lastName: "Nunez", title: "Crew Lead", email: "cesar@ridgelinelabor.co", mobilePhone: "(513) 555-0620", preferred: "Mobile", tags: ["Primary", "Field"] }],
    projectIds: ["hyde-park"],
    complianceOverall: "Expiring Soon",
    compliance: [
      req("generalLiability", "General Liability / COI", "In Compliance", { carrier: "Erie", policyNumber: "GL-40021", effective: "2026-01-01", expires: "2027-01-01", details: "$1M / $2M" }),
      req("workersComp", "Workers' Compensation", "Expiring Soon", { carrier: "Ohio BWC", policyNumber: "WC-40022", effective: "2025-10-05", expires: "2026-10-05", details: "Statutory" }),
      req("w9", "W-9", "In Compliance", { details: "Ridgeline Labor Services LLC" }),
    ],
    lastActivity: "Hyde Park crew availability confirmed · 3 days ago",
  },
];

export const builderNetwork: NetworkCompany[] = [...clients, ...builderSubcontractors, ...vendors];
export const subNetwork: NetworkCompany[] = [...subClients, ...subSubs, ...subVendors];

export const getNetwork = (track: DemoTrack): NetworkCompany[] => (track === "sub" ? subNetwork : builderNetwork);
export const getCompany = (track: DemoTrack, id: string) => getNetwork(track).find(c => c.id === id);

export const complianceCompanies = (track: DemoTrack) => getNetwork(track).filter(c => c.compliance?.length);

export const nextExpiration = (company: NetworkCompany) => {
  const dates = (company.compliance ?? []).map(r => r.expires).filter(Boolean).sort() as string[];
  return dates[0];
};

export const complianceSummary = (track: DemoTrack) => {
  const list = complianceCompanies(track);
  const count = (s: ComplianceState) => list.filter(c => c.complianceOverall === s).length;
  return {
    monitored: list.length,
    inCompliance: count("In Compliance"),
    expiringSoon: count("Expiring Soon"),
    missing: count("Missing"),
    outOfCompliance: count("Out of Compliance"),
    needsReview: count("Needs Review"),
  };
};

export const complianceTone: Record<ComplianceState, string> = {
  "In Compliance": "bg-success/10 text-success",
  "Expiring Soon": "bg-warning/10 text-warning",
  "Missing": "bg-destructive/10 text-destructive",
  "Needs Review": "bg-info/10 text-info",
  "Out of Compliance": "bg-destructive/10 text-destructive",
};

/* ---------------- Dashboard intelligence ---------------- */

export interface AttentionItem { id: string; company?: string; project?: string; title: string; type: string; action: string; route: string; projectId?: string; tone: "warning" | "danger" | "info"; }

export const builderAttention: AttentionItem[] = [
  { id: "a1", project: "Fregolle Residence", projectId: "fregolle", title: "3 scope assumptions require confirmation", type: "Scope Review", action: "Review", route: "/app/scope-analyzer", tone: "warning" },
  { id: "a2", project: "Hyde Park Residence", projectId: "hyde-park", title: "2 bid packages still awaiting response", type: "Procurement", action: "Review Bids", route: "/app/bid-leveling", tone: "info" },
  { id: "a3", project: "Maple Street Kitchen Remodel", projectId: "maple-street", title: "Gross margin is below company target", type: "Pricing", action: "Review Pricing", route: "/app/pricing", tone: "warning" },
  { id: "a4", project: "Downtown TI — Suite 400", projectId: "downtown-ti", title: "Forecast exceeds revised budget by $5,600", type: "Cost Performance", action: "Review Actuals", route: "/app/est-vs-actual", tone: "danger" },
  { id: "a5", company: "Spark Electric Co.", title: "Workers Compensation policy expired 9 days ago", type: "Compliance", action: "Review Compliance", route: "/network/spark-electric", tone: "danger" },
  { id: "a6", company: "TrueFrame Carpentry", title: "Commercial auto expires in 22 days", type: "Compliance", action: "Review Compliance", route: "/network/trueframe", tone: "warning" },
];

export const subAttention: AttentionItem[] = [
  { id: "s1", project: "Fregolle Residence", projectId: "fregolle", title: "2 assumptions need confirmation", type: "Scope Review", action: "Review Scope", route: "/sub/scope-analyzer", tone: "warning" },
  { id: "s2", project: "Hyde Park Residence", projectId: "hyde-park", title: "Structural detail missing for bearing wall", type: "RFI", action: "Open Estimate", route: "/sub/estimate-builder", tone: "info" },
  { id: "s3", project: "Maple Street Kitchen Remodel", projectId: "maple-street", title: "Margin below target on current quote", type: "Pricing", action: "Review Pricing", route: "/sub/pricing", tone: "warning" },
  { id: "s4", project: "Riverside Addition", projectId: "riverside", title: "RFI response received — update scope", type: "RFI", action: "Open Documents", route: "/sub/upload", tone: "info" },
  { id: "s5", project: "Oakwood Custom Home", projectId: "oakwood", title: "Proposal ready to send", type: "Proposal", action: "Open Proposal", route: "/sub/proposal", tone: "info" },
  { id: "s6", project: "Downtown TI — Suite 400", projectId: "downtown-ti", title: "1 invoice requires cost mapping", type: "Cost Performance", action: "Review Actuals", route: "/sub/est-vs-actual", tone: "warning" },
];

export interface NextItem { when: string; project: string; projectId: string; task: string; destination: string; route: string; }

export const builderNext: NextItem[] = [
  { when: "Today", project: "Fregolle Residence", projectId: "fregolle", task: "Complete scope review", destination: "Scope Analyzer", route: "/app/scope-analyzer" },
  { when: "Tomorrow", project: "Hyde Park Residence", projectId: "hyde-park", task: "Framing bids due", destination: "Bid Packages", route: "/app/bid-leveling" },
  { when: "Sep 12", project: "Maple Street Kitchen Remodel", projectId: "maple-street", task: "Finalize pricing & margin", destination: "Pricing & Margin", route: "/app/pricing" },
  { when: "Sep 12", project: "Oakwood Custom Home", projectId: "oakwood", task: "Proposal follow-up", destination: "Proposal Export", route: "/app/proposal" },
  { when: "Sep 13", project: "Downtown TI — Suite 400", projectId: "downtown-ti", task: "Job cost reconciliation", destination: "Estimate vs Actual", route: "/app/est-vs-actual" },
];

export const subDeadlines: NextItem[] = [
  { when: "Sep 11", project: "Hyde Park Residence", projectId: "hyde-park", task: "Estimate in progress", destination: "Estimate Builder", route: "/sub/estimate-builder" },
  { when: "Sep 14", project: "Maple Street Kitchen Remodel", projectId: "maple-street", task: "Pricing review", destination: "Pricing & Margin", route: "/sub/pricing" },
  { when: "Sep 16", project: "Oakwood Custom Home", projectId: "oakwood", task: "Proposal ready to send", destination: "Proposal Export", route: "/sub/proposal" },
  { when: "Sep 18", project: "Fregolle Residence", projectId: "fregolle", task: "Scope confirmation", destination: "Scope Analyzer", route: "/sub/scope-analyzer" },
  { when: "Sep 25", project: "Riverside Addition", projectId: "riverside", task: "Preliminary quote", destination: "Document Upload", route: "/sub/upload" },
];

export const bidPipeline = {
  summary: [
    { label: "Open Bid Packages", value: "9" },
    { label: "Bids Received", value: "17" },
    { label: "Due This Week", value: "4" },
    { label: "Need Clarification", value: "3" },
  ],
  packages: [
    { id: "bp1", project: "Hyde Park", projectId: "hyde-park", trade: "Framing", detail: "3 bids received", note: "Spread: $15,600", route: "/app/bid-leveling" },
    { id: "bp2", project: "Fregolle", projectId: "fregolle", trade: "HVAC", detail: "1 bid received", note: "Low competition", route: "/app/bid-leveling" },
    { id: "bp3", project: "Riverside", projectId: "riverside", trade: "Electrical", detail: "No bids returned", note: "Follow up with 2 invitees", route: "/app/bid-leveling" },
  ],
};

export const quotePipeline = [
  { label: "Active Quotes", value: "4" },
  { label: "Ready to Send", value: "2" },
  { label: "Awaiting Decision", value: "3" },
  { label: "Awarded", value: "2" },
  { label: "Lost", value: "1" },
];

export const costPerformanceSummary = {
  revisedBudgets: 6_013_600,
  actualToDate: 928_700,
  forecastOver: 1,
  unmappedCosts: 4,
  rows: [
    { project: "Downtown TI — Suite 400", projectId: "downtown-ti", revised: 956300, forecast: 961900, variance: 5600 },
  ],
};

export const marketPulse = {
  region: "Cincinnati Market",
  movements: [
    { label: "Framing", change: 4.2 },
    { label: "Electrical", change: 1.8 },
    { label: "HVAC", change: 6.4 },
    { label: "Concrete", change: -0.7 },
  ],
  note: "3 active estimates contain pricing outside expected market ranges.",
};

export const framingPulse = {
  region: "Framing Market",
  movements: [
    { label: "Framing labor", change: 2.4 },
    { label: "Lumber", change: 3.8 },
    { label: "LVL / engineered lumber", change: 5.1 },
  ],
  note: "Current open quotes average 1.7% above comparable framing proposals.",
  outlier: "Fregolle is 4.1% above similar framing proposals.",
};

export interface FeedItem { id: string; type: string; text: string; company: string; person: string; time: string; status: string; }

export const builderFeed: FeedItem[] = [
  { id: "f1", type: "Bid", text: "TrueFrame revised Fregolle quote to $131,850", company: "TrueFrame Carpentry", person: "Tyler Reed", time: "2 hours ago", status: "Received" },
  { id: "f2", type: "Scope", text: "Frankie confirmed Fregolle foundation quantity", company: "Mayfield & Co.", person: "Frankie Mayfield", time: "4 hours ago", status: "Confirmed" },
  { id: "f3", type: "Proposal", text: "Oakwood proposal generated", company: "Mayfield & Co.", person: "Frankie Mayfield", time: "Yesterday", status: "Ready" },
  { id: "f4", type: "Cost", text: "Downtown TI QBO sync imported 14 actual costs", company: "Fourth Street Partners", person: "System", time: "Yesterday", status: "Synced" },
  { id: "f5", type: "Bid", text: "Hyde Park electrical bid received", company: "Spark Electric Co.", person: "Dana Whitfield", time: "2 days ago", status: "Received" },
];

export const subFeed: FeedItem[] = [
  { id: "sf1", type: "Quote", text: "Fregolle quote revised to v2 — $131,850", company: "Mayfield & Co.", person: "Tyler Reed", time: "2 hours ago", status: "Sent" },
  { id: "sf2", type: "Documents", text: "Hyde Park structural plans uploaded", company: "Mayfield & Co.", person: "Frankie Mayfield", time: "Yesterday", status: "New" },
  { id: "sf3", type: "Pricing", text: "Maple Street pricing changed", company: "Mayfield & Co.", person: "Tyler Reed", time: "Yesterday", status: "Updated" },
  { id: "sf4", type: "Cost", text: "Downtown TI invoice imported", company: "Mayfield & Co.", person: "Ashley Moore", time: "2 days ago", status: "Needs mapping" },
  { id: "sf5", type: "Proposal", text: "Oakwood proposal marked ready", company: "Mayfield & Co.", person: "Tyler Reed", time: "3 days ago", status: "Ready" },
];

export const getQuoteFor = (projectId: string) => quotes.find(q => q.projectId === projectId);
