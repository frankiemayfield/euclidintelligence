// Shared construction schedule dataset. References the canonical demo universe + Network companies.
import { companies } from "@/data/demoUniverse";

export type TaskStatus = "Not Started" | "Ready" | "In Progress" | "Complete" | "Delayed" | "Blocked";
export type TaskCategory = "sitework" | "structural" | "mep" | "finishes" | "inspection" | "milestone";

export interface SchedulePhase { id: string; name: string; }
export interface ScheduleTask {
  id: string; projectId: string; phaseId: string; title: string; description?: string;
  start: string; finish: string; baselineStart: string; baselineFinish: string;
  companyId?: string; assignee: string; trade: string; category: TaskCategory; location?: string;
  predecessors: string[]; progress: number; status: TaskStatus; critical: boolean; milestone: boolean;
  notes?: string; cost?: { estimate: number; committed: number; actual: number };
}
export interface ProjectScheduleStatus {
  projectId: string; mode: "active" | "draft" | "none"; label: string;
  baselineStart: string; baselineFinish: string; currentStart: string; forecastFinish: string;
  variance: number; percentComplete: number; currentPhase: string; criticalCount: number; delayedCount: number;
  published: boolean; unpublishedChanges: number; locked: boolean;
  superintendent?: string; projectManager?: string; recovery?: string;
}

/* ---------- date helpers ---------- */
export const TODAY = "2026-09-09";
export const d = (iso: string) => new Date(`${iso}T12:00:00`);
export const dayDiff = (a: string, b: string) => Math.round((d(b).getTime() - d(a).getTime()) / 86400000);
export const addDays = (iso: string, n: number) => { const x = d(iso); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
export const workdays = (a: string, b: string) => { let n = 0; for (let i = 0; i <= dayDiff(a, b); i++) { const w = d(addDays(a, i)).getDay(); if (w !== 0 && w !== 6) n++; } return n; };
export const fmtShort = (iso: string) => d(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
export const fmtLong = (iso: string) => d(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const categoryTone: Record<TaskCategory, { bar: string; dot: string; label: string }> = {
  sitework: { bar: "bg-muted-foreground/60", dot: "bg-muted-foreground", label: "Sitework" },
  structural: { bar: "bg-primary/70", dot: "bg-primary", label: "Structural" },
  mep: { bar: "bg-info/70", dot: "bg-info", label: "MEP" },
  finishes: { bar: "bg-success/70", dot: "bg-success", label: "Finishes" },
  inspection: { bar: "bg-warning/70", dot: "bg-warning", label: "Inspection" },
  milestone: { bar: "bg-foreground/70", dot: "bg-foreground", label: "Milestone" },
};
export const statusTone: Record<TaskStatus, string> = {
  "Not Started": "bg-muted text-muted-foreground",
  Ready: "bg-info/15 text-info",
  "In Progress": "bg-primary/15 text-primary",
  Complete: "bg-success/15 text-success",
  Delayed: "bg-warning/20 text-warning",
  Blocked: "bg-destructive/15 text-destructive",
};

/* ---------- phases ---------- */
export const tiPhases: SchedulePhase[] = [
  { id: "pre", name: "Pre-Construction" }, { id: "demo", name: "Demolition" }, { id: "framing", name: "Framing & Partitions" },
  { id: "rough", name: "Rough-Ins" }, { id: "drywall", name: "Insulation / Drywall" }, { id: "finishes", name: "Interior Finishes" },
  { id: "exterior", name: "Exterior / Storefront" }, { id: "final", name: "Final / Closeout" },
];
export const residentialPhases: SchedulePhase[] = [
  { id: "pre", name: "Pre-Construction" }, { id: "site", name: "Site / Foundation" }, { id: "framing", name: "Framing" },
  { id: "dryin", name: "Dry-In" }, { id: "rough", name: "Rough-Ins" }, { id: "drywall", name: "Insulation / Drywall" },
  { id: "finishes", name: "Interior Finishes" }, { id: "exterior", name: "Exterior Finishes" }, { id: "final", name: "Final / Closeout" },
];

/* ---------- task builder ---------- */
type Row = [string, string, string, string, string, string, string, string, TaskCategory, number, TaskStatus, string, 0 | 1];
const companyName = (id: string) => (id ? companies[Object.keys(companies).find(k => companies[k].id === id) || ""]?.name ?? id : "");
const mk = (projectId: string, rows: Row[]): ScheduleTask[] => rows.map(r => {
  const [id, phaseId, title, start, finish, bs, bf, companyId, category, progress, status, preds, critical] = r;
  return {
    id, projectId, phaseId, title, start, finish, baselineStart: bs, baselineFinish: bf,
    companyId: companyId || undefined, assignee: companyId ? companyName(companyId) : "Mayfield & Co.",
    trade: category === "inspection" ? "Inspection" : categoryTone[category].label, category,
    predecessors: preds ? preds.split(",") : [], progress, status, critical: !!critical, milestone: start === finish && (category === "milestone" || category === "inspection"),
  };
});

/* ---------- Downtown TI — Suite 400 (active construction) ---------- */
const tiRows: Row[] = [
  ["ti-permit", "pre", "Permit Approval", "2026-04-06", "2026-04-17", "2026-04-06", "2026-04-17", "", "milestone", 100, "Complete", "", 0],
  ["ti-procure", "pre", "Long Lead Procurement — Storefront & Lighting", "2026-04-06", "2026-06-12", "2026-04-06", "2026-06-05", "", "sitework", 100, "Complete", "", 0],
  ["ti-mob", "pre", "Site Mobilization", "2026-04-20", "2026-04-22", "2026-04-20", "2026-04-22", "", "sitework", 100, "Complete", "ti-permit", 0],
  ["ti-demo", "demo", "Selective Demolition", "2026-04-23", "2026-05-08", "2026-04-23", "2026-05-08", "", "sitework", 100, "Complete", "ti-mob", 0],
  ["ti-haul", "demo", "Debris Haul-Off", "2026-05-11", "2026-05-13", "2026-05-11", "2026-05-13", "", "sitework", 100, "Complete", "ti-demo", 0],
  ["ti-demo-insp", "demo", "Demolition Inspection", "2026-05-14", "2026-05-14", "2026-05-14", "2026-05-14", "", "inspection", 100, "Complete", "ti-haul", 0],
  ["ti-layout", "framing", "Layout & Partition Marking", "2026-05-15", "2026-05-19", "2026-05-15", "2026-05-19", "", "structural", 100, "Complete", "ti-demo-insp", 0],
  ["ti-partitions", "framing", "Interior Partition Framing", "2026-05-20", "2026-06-10", "2026-05-20", "2026-06-08", "trueframe", "structural", 100, "Complete", "ti-layout", 0],
  ["ti-blocking", "framing", "In-Wall Blocking", "2026-06-04", "2026-06-11", "2026-06-03", "2026-06-10", "trueframe", "structural", 100, "Complete", "ti-partitions", 0],
  ["ti-doorframes", "framing", "Door Frame Installation", "2026-06-11", "2026-06-17", "2026-06-10", "2026-06-16", "trueframe", "structural", 100, "Complete", "ti-partitions", 0],
  ["ti-gridlayout", "framing", "Ceiling Grid Layout", "2026-06-15", "2026-06-19", "2026-06-15", "2026-06-19", "", "structural", 100, "Complete", "ti-partitions", 0],
  ["ti-elec-rough", "rough", "Electrical Rough-In", "2026-06-15", "2026-07-10", "2026-06-15", "2026-07-08", "spark-electric", "mep", 100, "Complete", "ti-blocking", 0],
  ["ti-plumb-rough", "rough", "Plumbing Rough-In", "2026-06-18", "2026-07-06", "2026-06-18", "2026-07-06", "aquaflow", "mep", 100, "Complete", "ti-blocking", 0],
  ["ti-hvac-rough", "rough", "HVAC Rough-In", "2026-06-22", "2026-07-17", "2026-06-22", "2026-07-15", "climateworks", "mep", 100, "Complete", "ti-gridlayout", 0],
  ["ti-sprinkler", "rough", "Fire Sprinkler Rough", "2026-06-29", "2026-07-14", "2026-06-29", "2026-07-14", "", "mep", 100, "Complete", "ti-gridlayout", 0],
  ["ti-lowvolt", "rough", "Low-Voltage & Data Rough", "2026-07-06", "2026-07-17", "2026-07-06", "2026-07-17", "", "mep", 100, "Complete", "ti-elec-rough", 0],
  ["ti-rough-insp", "rough", "Rough-In Inspection", "2026-07-21", "2026-07-21", "2026-07-20", "2026-07-20", "", "inspection", 100, "Complete", "ti-hvac-rough,ti-lowvolt", 0],
  ["ti-insulation", "drywall", "Insulation", "2026-07-22", "2026-07-29", "2026-07-21", "2026-07-28", "", "structural", 100, "Complete", "ti-rough-insp", 0],
  ["ti-dw-hang", "drywall", "Drywall Hang", "2026-07-30", "2026-08-12", "2026-07-29", "2026-08-10", "queen-city-drywall", "structural", 100, "Complete", "ti-insulation", 0],
  ["ti-dw-finish", "drywall", "Drywall Finish & Texture", "2026-08-10", "2026-08-25", "2026-08-07", "2026-08-21", "queen-city-drywall", "structural", 100, "Complete", "ti-dw-hang", 0],
  ["ti-prime", "drywall", "Prime Paint", "2026-08-24", "2026-08-28", "2026-08-21", "2026-08-26", "", "finishes", 100, "Complete", "ti-dw-finish", 0],
  ["ti-grid", "finishes", "Ceiling Grid Installation", "2026-08-26", "2026-09-04", "2026-08-24", "2026-09-02", "", "structural", 100, "Complete", "ti-prime", 0],
  ["ti-trim", "finishes", "Interior Trim — Casing, Base, Crown", "2026-08-28", "2026-09-24", "2026-08-26", "2026-09-18", "trueframe", "finishes", 45, "In Progress", "ti-dw-finish", 1],
  ["ti-flooring", "finishes", "Flooring — LVT & Carpet Tile", "2026-09-02", "2026-09-22", "2026-09-01", "2026-09-18", "", "finishes", 38, "In Progress", "ti-prime", 0],
  ["ti-paint", "finishes", "Interior Paint — Finish Coats", "2026-09-14", "2026-09-29", "2026-09-10", "2026-09-24", "", "finishes", 0, "Ready", "ti-trim", 1],
  ["ti-casework", "finishes", "Casework & Millwork Install", "2026-09-17", "2026-09-30", "2026-09-14", "2026-09-25", "trueframe", "finishes", 0, "Ready", "ti-trim,ti-flooring", 1],
  ["ti-ceiling-tile", "finishes", "Ceiling Tile Drop-In", "2026-09-25", "2026-10-02", "2026-09-23", "2026-09-30", "", "finishes", 0, "Not Started", "ti-grid,ti-paint", 0],
  ["ti-tops", "finishes", "Countertops", "2026-09-30", "2026-10-06", "2026-09-28", "2026-10-02", "", "finishes", 0, "Not Started", "ti-casework", 1],
  ["ti-finish-elec", "finishes", "Finish Electrical — Devices & Fixtures", "2026-10-01", "2026-10-14", "2026-09-25", "2026-10-07", "spark-electric", "mep", 0, "Not Started", "ti-casework,ti-paint,ti-ceiling-tile", 1],
  ["ti-finish-plumb", "finishes", "Finish Plumbing", "2026-10-05", "2026-10-12", "2026-10-01", "2026-10-08", "aquaflow", "mep", 0, "Not Started", "ti-tops", 0],
  ["ti-finish-hvac", "finishes", "Finish HVAC — Registers & Balancing", "2026-10-06", "2026-10-15", "2026-10-02", "2026-10-09", "climateworks", "mep", 0, "Not Started", "ti-ceiling-tile", 0],
  ["ti-doors", "finishes", "Doors & Hardware", "2026-10-07", "2026-10-15", "2026-10-05", "2026-10-13", "trueframe", "finishes", 0, "Not Started", "ti-paint", 0],
  ["ti-glass", "finishes", "Interior Glass Partitions", "2026-10-12", "2026-10-20", "2026-10-02", "2026-10-12", "", "finishes", 0, "Delayed", "ti-paint", 0],
  ["ti-appliances", "finishes", "Breakroom Appliances", "2026-10-19", "2026-10-21", "2026-10-15", "2026-10-19", "", "finishes", 0, "Not Started", "ti-finish-plumb", 0],
  ["ti-storefront", "exterior", "Storefront Glazing", "2026-09-08", "2026-09-18", "2026-09-01", "2026-09-11", "", "structural", 30, "Delayed", "ti-procure", 0],
  ["ti-signage", "exterior", "Exterior Signage", "2026-10-14", "2026-10-19", "2026-10-05", "2026-10-08", "", "finishes", 0, "Delayed", "ti-storefront", 0],
  ["ti-alarm", "final", "Fire Alarm Test & Inspection", "2026-10-22", "2026-10-23", "2026-10-16", "2026-10-19", "", "inspection", 0, "Not Started", "ti-finish-elec", 0],
  ["ti-mech-insp", "final", "Mechanical Final Inspection", "2026-10-26", "2026-10-26", "2026-10-20", "2026-10-20", "climateworks", "inspection", 0, "Not Started", "ti-finish-hvac", 0],
  ["ti-elec-insp", "final", "Electrical Final Inspection", "2026-10-27", "2026-10-27", "2026-10-21", "2026-10-21", "spark-electric", "inspection", 0, "Not Started", "ti-finish-elec", 1],
  ["ti-plumb-insp", "final", "Plumbing Final Inspection", "2026-10-28", "2026-10-28", "2026-10-22", "2026-10-22", "aquaflow", "inspection", 0, "Not Started", "ti-finish-plumb", 0],
  ["ti-bldg-insp", "final", "Building Final Inspection", "2026-11-02", "2026-11-02", "2026-10-26", "2026-10-26", "", "inspection", 0, "Not Started", "ti-elec-insp,ti-mech-insp,ti-plumb-insp", 1],
  ["ti-punch", "final", "Punch List", "2026-11-03", "2026-11-11", "2026-10-27", "2026-11-04", "", "finishes", 0, "Not Started", "ti-bldg-insp", 1],
  ["ti-clean", "final", "Final Clean", "2026-11-09", "2026-11-12", "2026-11-03", "2026-11-05", "", "finishes", 0, "Not Started", "ti-punch", 0],
  ["ti-walk", "final", "Client Walkthrough", "2026-11-13", "2026-11-13", "2026-11-06", "2026-11-06", "", "milestone", 0, "Not Started", "ti-clean", 0],
  ["ti-co", "final", "Certificate of Occupancy", "2026-11-16", "2026-11-16", "2026-11-06", "2026-11-06", "", "milestone", 0, "Not Started", "ti-bldg-insp", 1],
  ["ti-closeout", "final", "Closeout Documents & Warranty", "2026-11-16", "2026-11-18", "2026-11-09", "2026-11-10", "", "finishes", 0, "Not Started", "ti-co", 1],
  ["ti-substantial", "final", "Substantial Completion", "2026-11-18", "2026-11-18", "2026-11-10", "2026-11-10", "", "milestone", 0, "Not Started", "ti-closeout", 1],
];

/* ---------- Fregolle Residence — draft / preconstruction schedule ---------- */
const fregolleRows: Row[] = [
  ["fr-permit", "pre", "Permitting", "2026-10-05", "2026-10-30", "2026-10-05", "2026-10-30", "", "milestone", 0, "Not Started", "", 0],
  ["fr-procure", "pre", "Long Lead Procurement — Windows & Cabinets", "2026-10-05", "2026-12-18", "2026-10-05", "2026-12-18", "", "sitework", 0, "Not Started", "", 0],
  ["fr-mob", "site", "Site Mobilization", "2026-11-02", "2026-11-04", "2026-11-02", "2026-11-04", "", "sitework", 0, "Not Started", "fr-permit", 0],
  ["fr-exc", "site", "Excavation", "2026-11-05", "2026-11-13", "2026-11-05", "2026-11-13", "", "sitework", 0, "Not Started", "fr-mob", 0],
  ["fr-footings", "site", "Footings", "2026-11-16", "2026-11-20", "2026-11-16", "2026-11-20", "riverstone-concrete", "structural", 0, "Not Started", "fr-exc", 0],
  ["fr-walls", "site", "Foundation Walls", "2026-11-23", "2026-12-04", "2026-11-23", "2026-12-04", "riverstone-concrete", "structural", 0, "Not Started", "fr-footings", 0],
  ["fr-wp", "site", "Waterproofing & Backfill", "2026-12-07", "2026-12-11", "2026-12-07", "2026-12-11", "", "structural", 0, "Not Started", "fr-walls", 0],
  ["fr-floor", "framing", "Floor Framing", "2026-12-14", "2026-12-22", "2026-12-14", "2026-12-22", "trueframe", "structural", 0, "Not Started", "fr-wp", 0],
  ["fr-extwalls", "framing", "Exterior Walls", "2027-01-04", "2027-01-19", "2027-01-04", "2027-01-19", "trueframe", "structural", 0, "Not Started", "fr-floor", 0],
  ["fr-roof", "framing", "Roof Framing", "2027-01-20", "2027-02-02", "2027-01-20", "2027-02-02", "trueframe", "structural", 0, "Not Started", "fr-extwalls", 0],
  ["fr-sheath", "framing", "Sheathing", "2027-01-25", "2027-02-05", "2027-01-25", "2027-02-05", "trueframe", "structural", 0, "Not Started", "fr-extwalls", 0],
  ["fr-roofing", "dryin", "Roofing", "2027-02-08", "2027-02-19", "2027-02-08", "2027-02-19", "apex-roofing", "structural", 0, "Not Started", "fr-roof,fr-sheath", 0],
  ["fr-windows", "dryin", "Windows & Exterior Doors", "2027-02-15", "2027-02-26", "2027-02-15", "2027-02-26", "", "structural", 0, "Not Started", "fr-sheath,fr-procure", 0],
  ["fr-plumb", "rough", "Plumbing Rough", "2027-03-01", "2027-03-12", "2027-03-01", "2027-03-12", "aquaflow", "mep", 0, "Not Started", "fr-windows", 0],
  ["fr-elec", "rough", "Electrical Rough", "2027-03-08", "2027-03-19", "2027-03-08", "2027-03-19", "spark-electric", "mep", 0, "Not Started", "fr-windows", 0],
  ["fr-hvac", "rough", "HVAC Rough", "2027-03-15", "2027-03-26", "2027-03-15", "2027-03-26", "climateworks", "mep", 0, "Not Started", "fr-windows", 0],
  ["fr-rough-insp", "rough", "Rough-In Inspections", "2027-03-30", "2027-03-30", "2027-03-30", "2027-03-30", "", "inspection", 0, "Not Started", "fr-plumb,fr-elec,fr-hvac", 0],
  ["fr-insul", "drywall", "Insulation", "2027-03-31", "2027-04-06", "2027-03-31", "2027-04-06", "", "structural", 0, "Not Started", "fr-rough-insp", 0],
  ["fr-drywall", "drywall", "Drywall Hang & Finish", "2027-04-07", "2027-04-28", "2027-04-07", "2027-04-28", "queen-city-drywall", "structural", 0, "Not Started", "fr-insul", 0],
  ["fr-trim", "finishes", "Interior Trim & Doors", "2027-04-29", "2027-05-20", "2027-04-29", "2027-05-20", "trueframe", "finishes", 0, "Not Started", "fr-drywall", 0],
  ["fr-cabs", "finishes", "Cabinetry", "2027-05-17", "2027-05-31", "2027-05-17", "2027-05-31", "trueframe", "finishes", 0, "Not Started", "fr-trim,fr-procure", 0],
  ["fr-floors", "finishes", "Flooring", "2027-05-24", "2027-06-11", "2027-05-24", "2027-06-11", "", "finishes", 0, "Not Started", "fr-trim", 0],
  ["fr-paint", "finishes", "Interior Paint", "2027-06-01", "2027-06-15", "2027-06-01", "2027-06-15", "", "finishes", 0, "Not Started", "fr-cabs", 0],
  ["fr-finmep", "finishes", "Finish MEP", "2027-06-16", "2027-06-30", "2027-06-16", "2027-06-30", "spark-electric", "mep", 0, "Not Started", "fr-paint,fr-floors", 0],
  ["fr-ext", "exterior", "Exterior Finishes & Grading", "2027-05-03", "2027-06-11", "2027-05-03", "2027-06-11", "", "finishes", 0, "Not Started", "fr-roofing", 0],
  ["fr-final-insp", "final", "Final Inspections", "2027-07-06", "2027-07-06", "2027-07-06", "2027-07-06", "", "inspection", 0, "Not Started", "fr-finmep", 0],
  ["fr-punch", "final", "Punch & Client Walkthrough", "2027-07-07", "2027-07-15", "2027-07-07", "2027-07-15", "", "finishes", 0, "Not Started", "fr-final-insp", 0],
  ["fr-co", "final", "Certificate of Occupancy", "2027-07-19", "2027-07-19", "2027-07-19", "2027-07-19", "", "milestone", 0, "Not Started", "fr-punch", 0],
];

export const scheduleTasks: ScheduleTask[] = [...mk("downtown-ti", tiRows), ...mk("fregolle", fregolleRows)];

scheduleTasks.forEach(t => {
  if (t.id === "ti-trim") { t.description = "Casing, base and crown throughout Suite 400."; t.location = "Suite 400 — Levels 1"; t.cost = { estimate: 48500, committed: 46800, actual: 32100 }; t.notes = "Crown profile substitution approved by client on Sep 2."; }
  if (t.id === "ti-casework") t.cost = { estimate: 64200, committed: 61900, actual: 0 };
  if (t.id === "ti-finish-elec") t.cost = { estimate: 118400, committed: 116200, actual: 0 };
  if (t.id === "ti-storefront") t.notes = "Glazing package delivered 7 days late by supplier.";
});

export const phasesFor = (projectId: string) => (projectId === "downtown-ti" ? tiPhases : residentialPhases);
export const tasksFor = (projectId: string) => scheduleTasks.filter(t => t.projectId === projectId);
export const taskById = (id: string) => scheduleTasks.find(t => t.id === id);
export const successorsOf = (id: string) => scheduleTasks.filter(t => t.predecessors.includes(id));

export const scheduleStatus: Record<string, ProjectScheduleStatus> = {
  "downtown-ti": {
    projectId: "downtown-ti", mode: "active", label: "Published Schedule",
    baselineStart: "2026-04-06", baselineFinish: "2026-11-10", currentStart: "2026-04-06", forecastFinish: "2026-11-18",
    variance: 8, percentComplete: 76, currentPhase: "Interior Finishes", criticalCount: 11, delayedCount: 3,
    published: true, unpublishedChanges: 6, locked: true,
    superintendent: "James Wilson", projectManager: "Jordan Ellis", recovery: "5 days through resequencing finish MEP",
  },
  fregolle: {
    projectId: "fregolle", mode: "draft", label: "Draft / Preconstruction Schedule",
    baselineStart: "2026-11-02", baselineFinish: "2027-07-19", currentStart: "2026-11-02", forecastFinish: "2027-07-19",
    variance: 0, percentComplete: 0, currentPhase: "Preconstruction", criticalCount: 0, delayedCount: 0,
    published: false, unpublishedChanges: 0, locked: false,
    superintendent: "James Wilson", projectManager: "Jordan Ellis",
  },
};
export const statusFor = (projectId: string): ProjectScheduleStatus =>
  scheduleStatus[projectId] ?? {
    projectId, mode: "none", label: "No schedule yet", baselineStart: TODAY, baselineFinish: TODAY, currentStart: TODAY,
    forecastFinish: TODAY, variance: 0, percentComplete: 0, currentPhase: "Preconstruction", criticalCount: 0, delayedCount: 0,
    published: false, unpublishedChanges: 0, locked: false,
  };

export const baselines = [
  { id: "b1", name: "Original Baseline", created: "2026-03-30", by: "Jordan Ellis", reason: "Contract award schedule approved by owner" },
  { id: "b2", name: "Baseline 2 — CO #3 Reset", created: "2026-07-24", by: "Jordan Ellis", reason: "Approved change orders for storefront upgrade" },
];

export const scheduleTemplates = [
  { id: "custom-home", name: "Custom Home", phases: 9, tasks: 62, note: "Full ground-up residential sequence" },
  { id: "remodel", name: "Residential Remodel", phases: 6, tasks: 38, note: "Demo through finish, no foundation" },
  { id: "addition", name: "Addition", phases: 7, tasks: 44, note: "Foundation, tie-in, finish" },
  { id: "ti", name: "Tenant Improvement", phases: 8, tasks: 47, note: "Commercial interior build-out" },
];

export const isActiveConstruction = (projectId: string) => statusFor(projectId).mode === "active";

/* ---------- derived helpers used across pages ---------- */
export const todaysWork = (projectId: string) => tasksFor(projectId).filter(t => t.start <= TODAY && t.finish >= TODAY && t.status !== "Complete");
export const upcoming = (projectId: string, n = 7) => tasksFor(projectId).filter(t => t.start > TODAY).sort((a, b) => a.start.localeCompare(b.start)).slice(0, n);
export const lateTasks = (projectId: string) => tasksFor(projectId).filter(t => t.status === "Delayed" || (t.status !== "Complete" && t.finish < TODAY));
export const criticalTasks = (projectId: string) => tasksFor(projectId).filter(t => t.critical && t.status !== "Complete");
