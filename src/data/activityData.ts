// Unified chronological activity record across preconstruction and active construction.
export type ActivityType = "Project" | "Schedule" | "Estimate" | "Bid" | "Document" | "Cost" | "Compliance" | "Time" | "Proposal";
export type Urgency = "normal" | "attention" | "critical";

export interface ActivityEvent {
  id: string; timestamp: string; type: ActivityType; projectId?: string; project?: string; company?: string;
  actor: string; summary: string; related?: string; urgency: Urgency; status: string; route?: string;
}

export const activityGroups: Record<ActivityType, "Preconstruction" | "Construction"> = {
  Project: "Construction", Schedule: "Construction", Time: "Construction", Cost: "Construction", Compliance: "Construction",
  Estimate: "Preconstruction", Bid: "Preconstruction", Proposal: "Preconstruction", Document: "Preconstruction",
};

export const builderActivity: ActivityEvent[] = [
  { id: "a1", timestamp: "2026-09-09T14:12:00", type: "Time", projectId: "downtown-ti", project: "Downtown TI — Suite 400", company: "TrueFrame Carpentry", actor: "Michael Carter", summary: "Clocked in to Interior Trim (Finish Carpentry)", related: "Interior Trim", urgency: "normal", status: "Active", route: "/app/active/downtown-ti/time" },
  { id: "a2", timestamp: "2026-09-09T11:40:00", type: "Schedule", projectId: "downtown-ti", project: "Downtown TI — Suite 400", company: "Mayfield & Co.", actor: "Jordan Ellis", summary: "Cabinetry install shifted +2 days — casework delivery confirmed Sep 16", related: "Casework & Millwork Install", urgency: "attention", status: "Unpublished", route: "/app/active/downtown-ti/schedule" },
  { id: "a3", timestamp: "2026-09-09T09:25:00", type: "Cost", projectId: "downtown-ti", project: "Downtown TI — Suite 400", company: "Queen City Building Supply", actor: "System", summary: "Invoice imported and mapped to Interior Finishes — $42,860", related: "TX-403", urgency: "normal", status: "Mapped", route: "/app/est-vs-actual" },
  { id: "a4", timestamp: "2026-09-09T08:02:00", type: "Schedule", projectId: "downtown-ti", project: "Downtown TI — Suite 400", actor: "James Wilson", summary: "Storefront glazing flagged delayed — supplier delivery 7 days late", related: "Storefront Glazing", urgency: "critical", status: "Delayed", route: "/app/active/downtown-ti/schedule" },
  { id: "a5", timestamp: "2026-09-08T16:48:00", type: "Compliance", company: "Spark Electric Co.", actor: "System", summary: "Workers comp certificate expired — flagged before finish electrical", urgency: "critical", status: "Out of Compliance", route: "/compliance" },
  { id: "a6", timestamp: "2026-09-08T15:10:00", type: "Project", projectId: "downtown-ti", project: "Downtown TI — Suite 400", actor: "Jordan Ellis", summary: "Change order #4 approved — breakroom upgrade, +$8,400", urgency: "normal", status: "Approved", route: "/app/active/downtown-ti/costs" },
  { id: "a7", timestamp: "2026-09-08T13:22:00", type: "Schedule", projectId: "downtown-ti", project: "Downtown TI — Suite 400", company: "ClimateWorks Mechanical", actor: "James Wilson", summary: "HVAC final inspection rescheduled to Oct 26", related: "Mechanical Final Inspection", urgency: "attention", status: "Rescheduled", route: "/app/active/downtown-ti/schedule" },
  { id: "a8", timestamp: "2026-09-08T10:05:00", type: "Time", projectId: "downtown-ti", project: "Downtown TI — Suite 400", actor: "James Wilson", summary: "Time entry corrected for Luis Ramos — Sep 7 clock-out", urgency: "normal", status: "Edited", route: "/app/time" },
  { id: "a9", timestamp: "2026-09-08T09:14:00", type: "Estimate", projectId: "fregolle", project: "Fregolle Residence", actor: "Frankie Mayfield", summary: "Scope confirmed for framing and interior trim assemblies", urgency: "normal", status: "Confirmed", route: "/app/scope-analyzer" },
  { id: "a10", timestamp: "2026-09-07T17:30:00", type: "Bid", projectId: "hyde-park", project: "Hyde Park Residence", company: "TrueFrame Carpentry", actor: "Tyler Reed", summary: "Framing bid received — $248,600", urgency: "normal", status: "Received", route: "/app/bid-leveling" },
  { id: "a11", timestamp: "2026-09-07T15:02:00", type: "Schedule", projectId: "downtown-ti", project: "Downtown TI — Suite 400", company: "TrueFrame Carpentry", actor: "Mark Collins", summary: "Interior trim started — casing and base, Level 1", related: "Interior Trim", urgency: "normal", status: "In Progress", route: "/app/active/downtown-ti/schedule" },
  { id: "a12", timestamp: "2026-09-07T11:18:00", type: "Document", projectId: "riverside", project: "Riverside Addition", actor: "Frankie Mayfield", summary: "Plan set uploaded — 18 sheets classified", urgency: "normal", status: "Processed", route: "/app/upload" },
  { id: "a13", timestamp: "2026-09-04T16:44:00", type: "Compliance", company: "Riverstone Concrete", actor: "System", summary: "W-9 received and applied to company profile", urgency: "normal", status: "In Compliance", route: "/compliance" },
  { id: "a14", timestamp: "2026-09-04T14:20:00", type: "Proposal", projectId: "oakwood", project: "Oakwood Custom Home", actor: "Frankie Mayfield", summary: "Proposal generated — $2,342,400", urgency: "normal", status: "Ready to Send", route: "/app/proposal" },
  { id: "a15", timestamp: "2026-09-04T10:35:00", type: "Cost", projectId: "downtown-ti", project: "Downtown TI — Suite 400", actor: "System", summary: "Forecast at completion moved to $961,900 (+$5,600 over revised budget)", urgency: "attention", status: "Needs Review", route: "/app/est-vs-actual" },
  { id: "a16", timestamp: "2026-09-03T13:50:00", type: "Schedule", projectId: "downtown-ti", project: "Downtown TI — Suite 400", actor: "James Wilson", summary: "Rough-in inspection passed — drywall released", related: "Rough-In Inspection", urgency: "normal", status: "Complete", route: "/app/active/downtown-ti/schedule" },
  { id: "a17", timestamp: "2026-09-02T09:12:00", type: "Estimate", projectId: "maple-street", project: "Maple Street Kitchen Remodel", actor: "Frankie Mayfield", summary: "Margin adjusted to 20% — pricing review reopened", urgency: "normal", status: "In Review", route: "/app/pricing" },
];

export const subActivity: ActivityEvent[] = [
  { id: "s1", timestamp: "2026-09-09T14:12:00", type: "Time", projectId: "downtown-ti", project: "Downtown TI — Suite 400", company: "TrueFrame Carpentry", actor: "Michael Carter", summary: "Crew clocked in to interior trim", urgency: "normal", status: "Active", route: "/sub/active/downtown-ti/time" },
  { id: "s2", timestamp: "2026-09-09T11:40:00", type: "Schedule", projectId: "downtown-ti", project: "Downtown TI — Suite 400", company: "Mayfield & Co.", actor: "Jordan Ellis", summary: "GC moved casework install +2 days", urgency: "attention", status: "Updated", route: "/sub/active/downtown-ti/schedule" },
  { id: "s3", timestamp: "2026-09-08T15:31:00", type: "Cost", projectId: "downtown-ti", project: "Downtown TI — Suite 400", actor: "Tyler Reed", summary: "Progress invoice submitted — $89,600 to date", urgency: "normal", status: "Submitted", route: "/sub/est-vs-actual" },
  { id: "s4", timestamp: "2026-09-08T09:14:00", type: "Estimate", projectId: "fregolle", project: "Fregolle Residence", actor: "Tyler Reed", summary: "Framing scope confirmed for quote revision", urgency: "normal", status: "Confirmed", route: "/sub/scope-analyzer" },
  { id: "s5", timestamp: "2026-09-07T17:30:00", type: "Bid", projectId: "hyde-park", project: "Hyde Park Residence", actor: "Tyler Reed", summary: "Framing quote sent — $248,600", urgency: "normal", status: "Sent", route: "/sub/proposal" },
  { id: "s6", timestamp: "2026-09-07T10:02:00", type: "Compliance", company: "TrueFrame Carpentry", actor: "System", summary: "Commercial auto policy expires in 24 days", urgency: "attention", status: "Expiring Soon", route: "/compliance" },
];

export const activityFilters: (ActivityType | "All" | "Field")[] = ["All", "Project", "Schedule", "Cost", "Field", "Compliance", "Document"];
export const matchesFilter = (ev: ActivityEvent, f: string) =>
  f === "All" || (f === "Field" ? ev.type === "Time" : ev.type === f);

export const fmtWhen = (iso: string) => {
  const dt = new Date(iso);
  return dt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};
export const activityFor = (track: "builder" | "sub") => (track === "sub" ? subActivity : builderActivity);
export const projectActivity = (track: "builder" | "sub", projectId: string) => activityFor(track).filter(a => a.projectId === projectId);

export const urgencyTone: Record<Urgency, string> = {
  normal: "bg-info", attention: "bg-warning", critical: "bg-destructive",
};
