// Field workforce, time clock entries and project team data for active construction projects.
import { TODAY, addDays, d } from "@/data/scheduleData";

export type TimeStatus = "Active" | "Submitted" | "Complete" | "Needs Review" | "Edited" | "Approved";
export type WorkerType = "Internal Employee" | "Subcontractor Crew" | "Temp Labor" | "T&M Subcontractor";
export type CostTreatment = "Direct Labor Actual" | "Production Only" | "T&M Billable" | "Excluded";

export interface Worker {
  id: string; name: string; initials: string; role: string; trade: string;
  company: string; companyId?: string; rate: number; contract: "Fixed / Lump Sum" | "Time & Materials" | "Internal Payroll";
}
export interface TimeEntry {
  id: string; workerId: string; projectId: string; date: string; clockIn: string; clockOut?: string; breakMinutes: number;
  regular: number; overtime: number; phase: string; costCode: string; estimateLine?: string; taskId?: string;
  notes?: string; status: TimeStatus; history?: { date: string; actor: string; action: string }[];
}

export const workers: Worker[] = [
  { id: "w-carter", name: "Michael Carter", initials: "MC", role: "Lead Carpenter", trade: "Finish Carpentry", company: "TrueFrame Carpentry", companyId: "trueframe", rate: 46, contract: "Fixed / Lump Sum" },
  { id: "w-wilson", name: "James Wilson", initials: "JW", role: "Superintendent", trade: "Supervision", company: "Mayfield & Co.", rate: 62, contract: "Internal Payroll" },
  { id: "w-ellis", name: "Jordan Ellis", initials: "JE", role: "Project Manager", trade: "Supervision", company: "Mayfield & Co.", rate: 68, contract: "Internal Payroll" },
  { id: "w-ramos", name: "Luis Ramos", initials: "LR", role: "Carpenter", trade: "Finish Carpentry", company: "TrueFrame Carpentry", companyId: "trueframe", rate: 41, contract: "Fixed / Lump Sum" },
  { id: "w-collins", name: "Mark Collins", initials: "MK", role: "Field Lead", trade: "Framing", company: "TrueFrame Carpentry", companyId: "trueframe", rate: 52, contract: "Fixed / Lump Sum" },
  { id: "w-nguyen", name: "Danny Nguyen", initials: "DN", role: "Electrician", trade: "Electrical", company: "Spark Electric Co.", companyId: "spark-electric", rate: 58, contract: "Fixed / Lump Sum" },
  { id: "w-boyd", name: "Terrell Boyd", initials: "TB", role: "Laborer", trade: "General Labor", company: "Mayfield & Co.", rate: 32, contract: "Internal Payroll" },
  { id: "w-hahn", name: "Erik Hahn", initials: "EH", role: "Flooring Installer", trade: "Flooring", company: "Mayfield & Co.", rate: 39, contract: "Internal Payroll" },
  { id: "w-park", name: "Sonia Park", initials: "SP", role: "Assistant Superintendent", trade: "Supervision", company: "Mayfield & Co.", rate: 48, contract: "Internal Payroll" },
  { id: "w-diaz", name: "Rafael Diaz", initials: "RD", role: "Plumber", trade: "Plumbing", company: "AquaFlow Plumbing", companyId: "aquaflow", rate: 55, contract: "Time & Materials" },
];
export const workerById = (id: string) => workers.find(w => w.id === id)!;

/* ---------- relationship + cost treatment are relative to the viewing company ---------- */
/** viewerCompanyId: undefined = Mayfield & Co. (builder), otherwise the sub's company id. */
export const workerTypeFor = (w: Worker, viewerCompanyId?: string): WorkerType => {
  const isOwn = viewerCompanyId ? w.companyId === viewerCompanyId : !w.companyId;
  if (isOwn) return "Internal Employee";
  return w.contract === "Time & Materials" ? "T&M Subcontractor" : "Subcontractor Crew";
};
export const costTreatmentFor = (w: Worker, viewerCompanyId?: string): CostTreatment => {
  const type = workerTypeFor(w, viewerCompanyId);
  if (type === "Internal Employee" || type === "Temp Labor") return "Direct Labor Actual";
  if (type === "T&M Subcontractor") return "T&M Billable";
  return "Production Only"; // fixed / lump-sum subcontract: never a GC labor actual
};
export const treatmentTone: Record<CostTreatment, string> = {
  "Direct Labor Actual": "bg-success/15 text-success",
  "Production Only": "bg-muted text-muted-foreground",
  "T&M Billable": "bg-info/15 text-info",
  Excluded: "bg-destructive/10 text-destructive",
};
export const entryCost = (e: TimeEntry) => { const w = workerById(e.workerId); return Math.round(e.regular * w.rate + e.overtime * w.rate * 1.5); };
/** Only entries whose treatment is a real cost roll into financial actuals. */
export const financialCost = (e: TimeEntry, viewerCompanyId?: string) => {
  const t = costTreatmentFor(workerById(e.workerId), viewerCompanyId);
  return t === "Direct Labor Actual" || t === "T&M Billable" ? entryCost(e) : 0;
};

const e = (
  id: string, workerId: string, date: string, clockIn: string, clockOut: string | undefined, breakMinutes: number,
  regular: number, overtime: number, phase: string, costCode: string, status: TimeStatus, taskId?: string, notes?: string,
  estimateLine?: string
): TimeEntry => ({ id, workerId, projectId: "downtown-ti", date, clockIn, clockOut, breakMinutes, regular, overtime, phase, costCode, status, taskId, notes, estimateLine });

export const timeEntries: TimeEntry[] = [
  // Today — in progress
  e("t-1", "w-carter", TODAY, "7:04 AM", undefined, 0, 8.2, 0, "Interior Finishes", "06-2000", "Active", "ti-trim", undefined, "Finish Carpentry"),
  e("t-2", "w-wilson", TODAY, "6:51 AM", undefined, 0, 8.4, 0, "Interior Finishes", "01-3100", "Active", undefined, undefined, "Supervision"),
  e("t-3", "w-ramos", TODAY, "7:06 AM", undefined, 30, 7.7, 0, "Interior Finishes", "06-2000", "Active", "ti-trim", undefined, "Finish Carpentry"),
  e("t-4", "w-hahn", TODAY, "7:12 AM", undefined, 30, 7.6, 0, "Interior Finishes", "09-6500", "Active", "ti-flooring", undefined, "Resilient & Carpet Flooring"),
  e("t-5", "w-boyd", TODAY, "7:00 AM", undefined, 30, 7.8, 0, "Interior Finishes", "01-5000", "Active", undefined, undefined, "General Conditions"),
  // Sep 8
  e("t-10", "w-carter", "2026-09-08", "7:02 AM", "4:31 PM", 30, 8, 0.5, "Interior Finishes", "06-2000", "Approved", "ti-trim", undefined, "Finish Carpentry"),
  e("t-11", "w-ramos", "2026-09-08", "7:05 AM", "3:58 PM", 30, 8, 0, "Interior Finishes", "06-2000", "Approved", "ti-trim", undefined, "Finish Carpentry"),
  e("t-12", "w-wilson", "2026-09-08", "6:48 AM", "4:52 PM", 30, 8, 1.6, "Interior Finishes", "01-3100", "Approved", undefined, undefined, "Supervision"),
  e("t-13", "w-hahn", "2026-09-08", "7:10 AM", "4:04 PM", 30, 8, 0, "Interior Finishes", "09-6500", "Approved", "ti-flooring", undefined, "Resilient & Carpet Flooring"),
  e("t-14", "w-nguyen", "2026-09-08", "7:20 AM", "2:15 PM", 30, 6.4, 0, "Interior Finishes", "26-5000", "Submitted", undefined, undefined, "Devices, Fixtures & Trim"),
  e("t-15", "w-boyd", "2026-09-08", "7:00 AM", "3:31 PM", 30, 8, 0, "Interior Finishes", "01-5000", "Approved", undefined, undefined, "General Conditions"),
  e("t-16", "w-park", "2026-09-08", "6:58 AM", "3:44 PM", 30, 8, 0, "Interior Finishes", "01-3100", "Submitted", undefined, undefined, "Supervision"),
  // Sep 7
  e("t-20", "w-carter", "2026-09-07", "7:00 AM", "3:34 PM", 30, 8, 0, "Interior Finishes", "06-2000", "Approved", "ti-trim", undefined, "Finish Carpentry"),
  e("t-21", "w-ramos", "2026-09-07", "7:03 AM", "5:12 PM", 30, 8, 1.7, "Interior Finishes", "06-2000", "Edited", "ti-trim", "Clock-out corrected by J. Wilson — worker forgot to punch out.", "Finish Carpentry"),
  e("t-22", "w-collins", "2026-09-07", "6:58 AM", "3:30 PM", 30, 8, 0, "Interior Finishes", "06-2000", "Approved", "ti-trim", undefined, "Finish Carpentry"),
  e("t-23", "w-park", "2026-09-07", "6:55 AM", "3:40 PM", 30, 8, 0, "Interior Finishes", "01-3100", "Approved", undefined, undefined, "Supervision"),
  e("t-24", "w-hahn", "2026-09-07", "7:15 AM", "4:00 PM", 30, 8, 0, "Interior Finishes", "09-6500", "Approved", "ti-flooring", undefined, "Resilient & Carpet Flooring"),
  e("t-25", "w-diaz", "2026-09-07", "8:00 AM", "1:10 PM", 30, 4.7, 0, "Interior Finishes", "22-4000", "Submitted", undefined, "T&M ticket #418 — relocate breakroom rough.", "Finish Plumbing"),
  // Sep 4
  e("t-30", "w-carter", "2026-09-04", "7:01 AM", "3:32 PM", 30, 8, 0, "Interior Finishes", "06-2000", "Approved", "ti-trim", undefined, "Finish Carpentry"),
  e("t-31", "w-diaz", "2026-09-04", "8:40 AM", "11:05 AM", 0, 2.4, 0, "Interior Finishes", "22-4000", "Needs Review", undefined, "No cost code selected at clock-in — needs phase confirmation.", "Finish Plumbing"),
  e("t-32", "w-boyd", "2026-09-04", "7:00 AM", "3:30 PM", 30, 8, 0, "Interior Finishes", "01-5000", "Approved", undefined, undefined, "General Conditions"),
  e("t-33", "w-wilson", "2026-09-04", "6:50 AM", "4:20 PM", 30, 8, 1, "Interior Finishes", "01-3100", "Approved", undefined, undefined, "Supervision"),
  e("t-34", "w-ramos", "2026-09-04", "7:04 AM", "3:35 PM", 30, 8, 0, "Interior Finishes", "06-2000", "Approved", "ti-trim", undefined, "Finish Carpentry"),
  e("t-35", "w-collins", "2026-09-04", "7:00 AM", "3:30 PM", 30, 8, 0, "Interior Finishes", "06-2000", "Approved", "ti-trim", undefined, "Finish Carpentry"),
  e("t-36", "w-nguyen", "2026-09-04", "7:25 AM", "3:05 PM", 30, 7.2, 0, "Interior Finishes", "26-5000", "Approved", undefined, undefined, "Devices, Fixtures & Trim"),
];

timeEntries.forEach(t => {
  t.history = [
    { date: t.date, actor: workerById(t.workerId).name, action: `Clocked in at ${t.clockIn}` },
    ...(t.clockOut ? [{ date: t.date, actor: workerById(t.workerId).name, action: `Clocked out at ${t.clockOut}` }] : []),
    ...(t.status === "Edited" ? [{ date: t.date, actor: "James Wilson", action: "Entry edited — clock-out corrected" }] : []),
    ...(t.status === "Approved" ? [{ date: t.date, actor: "James Wilson", action: "Approved for payroll and cost posting" }] : []),
  ];
});

export const entriesFor = (projectId: string) => timeEntries.filter(t => t.projectId === projectId);
export const clockedIn = (projectId?: string) => timeEntries.filter(t => t.status === "Active" && (!projectId || t.projectId === projectId));
export const laborCost = (entries: TimeEntry[]) => entries.reduce((s, t) => s + entryCost(t), 0);

/* ---------- periods ---------- */
export type Period = "Today" | "This Week" | "Last Week" | "This Month" | "All Time";
export const periodOptions: Period[] = ["Today", "This Week", "Last Week", "This Month", "All Time"];
const weekStart = (iso: string) => addDays(iso, -d(iso).getDay());
export const periodRange = (p: Period): { from: string; to: string } => {
  const ws = weekStart(TODAY);
  if (p === "Today") return { from: TODAY, to: TODAY };
  if (p === "This Week") return { from: ws, to: addDays(ws, 6) };
  if (p === "Last Week") return { from: addDays(ws, -7), to: addDays(ws, -1) };
  if (p === "This Month") return { from: `${TODAY.slice(0, 7)}-01`, to: `${TODAY.slice(0, 7)}-31` };
  return { from: "2000-01-01", to: "2999-12-31" };
};
export const inPeriod = (entry: TimeEntry, p: Period) => { const { from, to } = periodRange(p); return entry.date >= from && entry.date <= to; };

export const summarize = (entries: TimeEntry[], viewerCompanyId?: string) => {
  const regular = Math.round(entries.reduce((s, t) => s + t.regular, 0) * 10) / 10;
  const overtime = Math.round(entries.reduce((s, t) => s + t.overtime, 0) * 10) / 10;
  const financial = entries.reduce((s, t) => s + financialCost(t, viewerCompanyId), 0);
  const production = entries.reduce((s, t) => s + entryCost(t), 0) - financial;
  return { regular, overtime, financial, production, budgetVariance: Math.round(financial * 0.07) };
};

export const weekSummary = {
  projectId: "downtown-ti", regular: 326, overtime: 21, laborCost: 17840, budgetVariance: 1240,
  highestVariance: { task: "Interior Trim", estimated: 160, actual: 186, pct: 16.3 },
};

export interface TeamMember { name: string; role: string; company: string; companyId?: string; contact?: string; internal: boolean; }
export const projectTeam: Record<string, TeamMember[]> = {
  "downtown-ti": [
    { name: "Jordan Ellis", role: "Project Manager", company: "Mayfield & Co.", contact: "jordan@mayfield.co", internal: true },
    { name: "James Wilson", role: "Superintendent", company: "Mayfield & Co.", contact: "james@mayfield.co", internal: true },
    { name: "Sonia Park", role: "Assistant Superintendent", company: "Mayfield & Co.", contact: "sonia@mayfield.co", internal: true },
    { name: "Frankie Mayfield", role: "Estimator / Preconstruction", company: "Mayfield & Co.", contact: "frankie@mayfield.co", internal: true },
    { name: "Tyler Reed", role: "Estimator", company: "TrueFrame Carpentry", companyId: "trueframe", internal: false },
    { name: "Mark Collins", role: "Field Lead", company: "TrueFrame Carpentry", companyId: "trueframe", internal: false },
    { name: "Danny Nguyen", role: "Foreman", company: "Spark Electric Co.", companyId: "spark-electric", internal: false },
    { name: "Rafael Diaz", role: "Foreman", company: "AquaFlow Plumbing", companyId: "aquaflow", internal: false },
    { name: "Priya Raman", role: "Service Manager", company: "ClimateWorks Mechanical", companyId: "climateworks", internal: false },
  ],
  fregolle: [
    { name: "Jordan Ellis", role: "Project Manager", company: "Mayfield & Co.", contact: "jordan@mayfield.co", internal: true },
    { name: "Frankie Mayfield", role: "Estimator / Preconstruction", company: "Mayfield & Co.", contact: "frankie@mayfield.co", internal: true },
    { name: "Tyler Reed", role: "Estimator", company: "TrueFrame Carpentry", companyId: "trueframe", internal: false },
  ],
};
