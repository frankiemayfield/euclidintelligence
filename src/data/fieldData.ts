// Field workforce, time clock entries and project team data for active construction projects.
import { TODAY } from "@/data/scheduleData";

export type TimeStatus = "Active" | "Complete" | "Needs Review" | "Edited" | "Approved";

export interface Worker {
  id: string; name: string; initials: string; role: string; trade: string; company: string; companyId?: string; rate: number;
}
export interface TimeEntry {
  id: string; workerId: string; projectId: string; date: string; clockIn: string; clockOut?: string; breakMinutes: number;
  regular: number; overtime: number; phase: string; costCode: string; taskId?: string; notes?: string; status: TimeStatus;
}

export const workers: Worker[] = [
  { id: "w-carter", name: "Michael Carter", initials: "MC", role: "Lead Carpenter", trade: "Finish Carpentry", company: "TrueFrame Carpentry", companyId: "trueframe", rate: 46 },
  { id: "w-wilson", name: "James Wilson", initials: "JW", role: "Superintendent", trade: "Supervision", company: "Mayfield & Co.", rate: 62 },
  { id: "w-ellis", name: "Jordan Ellis", initials: "JE", role: "Project Manager", trade: "Supervision", company: "Mayfield & Co.", rate: 68 },
  { id: "w-ramos", name: "Luis Ramos", initials: "LR", role: "Carpenter", trade: "Finish Carpentry", company: "TrueFrame Carpentry", companyId: "trueframe", rate: 41 },
  { id: "w-collins", name: "Mark Collins", initials: "MK", role: "Field Lead", trade: "Framing", company: "TrueFrame Carpentry", companyId: "trueframe", rate: 52 },
  { id: "w-nguyen", name: "Danny Nguyen", initials: "DN", role: "Electrician", trade: "Electrical", company: "Spark Electric Co.", companyId: "spark-electric", rate: 58 },
  { id: "w-boyd", name: "Terrell Boyd", initials: "TB", role: "Laborer", trade: "General Labor", company: "Mayfield & Co.", rate: 32 },
  { id: "w-hahn", name: "Erik Hahn", initials: "EH", role: "Flooring Installer", trade: "Flooring", company: "Mayfield & Co.", rate: 39 },
  { id: "w-park", name: "Sonia Park", initials: "SP", role: "Assistant Superintendent", trade: "Supervision", company: "Mayfield & Co.", rate: 48 },
  { id: "w-diaz", name: "Rafael Diaz", initials: "RD", role: "Plumber", trade: "Plumbing", company: "AquaFlow Plumbing", companyId: "aquaflow", rate: 55 },
];
export const workerById = (id: string) => workers.find(w => w.id === id)!;

const e = (
  id: string, workerId: string, date: string, clockIn: string, clockOut: string | undefined, breakMinutes: number,
  regular: number, overtime: number, phase: string, costCode: string, status: TimeStatus, taskId?: string, notes?: string
): TimeEntry => ({ id, workerId, projectId: "downtown-ti", date, clockIn, clockOut, breakMinutes, regular, overtime, phase, costCode, status, taskId, notes });

export const timeEntries: TimeEntry[] = [
  // Today — in progress
  e("t-1", "w-carter", TODAY, "7:04 AM", undefined, 0, 8.2, 0, "Interior Finishes", "Finish Carpentry", "Active", "ti-trim"),
  e("t-2", "w-wilson", TODAY, "6:51 AM", undefined, 0, 8.4, 0, "Interior Finishes", "Supervision", "Active"),
  e("t-3", "w-ramos", TODAY, "7:06 AM", undefined, 30, 7.7, 0, "Interior Finishes", "Finish Carpentry", "Active", "ti-trim"),
  e("t-4", "w-hahn", TODAY, "7:12 AM", undefined, 30, 7.6, 0, "Interior Finishes", "Flooring", "Active", "ti-flooring"),
  e("t-5", "w-boyd", TODAY, "7:00 AM", undefined, 30, 7.8, 0, "Interior Finishes", "General Conditions", "Active"),
  // Sep 8
  e("t-10", "w-carter", "2026-09-08", "7:02 AM", "4:31 PM", 30, 8, 0.5, "Interior Finishes", "Finish Carpentry", "Approved", "ti-trim"),
  e("t-11", "w-ramos", "2026-09-08", "7:05 AM", "3:58 PM", 30, 8, 0, "Interior Finishes", "Finish Carpentry", "Approved", "ti-trim"),
  e("t-12", "w-wilson", "2026-09-08", "6:48 AM", "4:52 PM", 30, 8, 1.6, "Interior Finishes", "Supervision", "Approved"),
  e("t-13", "w-hahn", "2026-09-08", "7:10 AM", "4:04 PM", 30, 8, 0, "Interior Finishes", "Flooring", "Approved", "ti-flooring"),
  e("t-14", "w-nguyen", "2026-09-08", "7:20 AM", "2:15 PM", 30, 6.4, 0, "Interior Finishes", "Electrical", "Complete"),
  e("t-15", "w-boyd", "2026-09-08", "7:00 AM", "3:31 PM", 30, 8, 0, "Interior Finishes", "General Conditions", "Approved"),
  // Sep 7
  e("t-20", "w-carter", "2026-09-07", "7:00 AM", "3:34 PM", 30, 8, 0, "Interior Finishes", "Finish Carpentry", "Approved", "ti-trim"),
  e("t-21", "w-ramos", "2026-09-07", "7:03 AM", "5:12 PM", 30, 8, 1.7, "Interior Finishes", "Finish Carpentry", "Edited", "ti-trim", "Clock-out corrected by J. Wilson — worker forgot to punch out."),
  e("t-22", "w-collins", "2026-09-07", "6:58 AM", "3:30 PM", 30, 8, 0, "Interior Finishes", "Finish Carpentry", "Approved", "ti-trim"),
  e("t-23", "w-park", "2026-09-07", "6:55 AM", "3:40 PM", 30, 8, 0, "Interior Finishes", "Supervision", "Approved"),
  e("t-24", "w-hahn", "2026-09-07", "7:15 AM", "4:00 PM", 30, 8, 0, "Interior Finishes", "Flooring", "Approved", "ti-flooring"),
  // Sep 4
  e("t-30", "w-carter", "2026-09-04", "7:01 AM", "3:32 PM", 30, 8, 0, "Interior Finishes", "Finish Carpentry", "Approved", "ti-trim"),
  e("t-31", "w-diaz", "2026-09-04", "8:40 AM", "11:05 AM", 0, 2.4, 0, "Interior Finishes", "Plumbing", "Needs Review", undefined, "No cost code selected at clock-in — needs phase confirmation."),
  e("t-32", "w-boyd", "2026-09-04", "7:00 AM", "3:30 PM", 30, 8, 0, "Interior Finishes", "General Conditions", "Approved"),
  e("t-33", "w-wilson", "2026-09-04", "6:50 AM", "4:20 PM", 30, 8, 1, "Interior Finishes", "Supervision", "Approved"),
  e("t-34", "w-ramos", "2026-09-04", "7:04 AM", "3:35 PM", 30, 8, 0, "Interior Finishes", "Finish Carpentry", "Approved", "ti-trim"),
  e("t-35", "w-collins", "2026-09-04", "7:00 AM", "3:30 PM", 30, 8, 0, "Interior Finishes", "Finish Carpentry", "Approved", "ti-trim"),
];

export const entriesFor = (projectId: string) => timeEntries.filter(t => t.projectId === projectId);
export const clockedIn = (projectId?: string) => timeEntries.filter(t => t.status === "Active" && (!projectId || t.projectId === projectId));
export const laborCost = (entries: TimeEntry[]) => entries.reduce((s, t) => { const w = workerById(t.workerId); return s + t.regular * w.rate + t.overtime * w.rate * 1.5; }, 0);

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
