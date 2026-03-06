import { SubLayout } from "@/components/sub/SubLayout";
import {
  BarChart3, FileText, AlertTriangle, TrendingUp, Plus, Search, Clock,
  CheckCircle, ArrowRight, FileSearch, GitCompare, DollarSign, FileOutput,
  Upload, Table2, Scale, ChevronDown, ExternalLink, MessageSquare, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";

/* ────────── Types ────────── */

type WorkflowStep = "Document Upload" | "Scope Analyzer" | "Estimate Builder" | "Pricing & Margin" | "Proposal Export" | "Submitted";
type SubmissionStatus = "Draft" | "Ready to Submit" | "Submitted" | "Awarded" | "Lost" | "Revision Requested";
type FilterKey = "all" | "due-soon" | "needs-rfi" | "needs-pricing" | "ready" | "submitted" | "awarded";

interface Project {
  name: string;
  gc: string;
  type: string;
  region: string;
  workflowStep: WorkflowStep;
  submissionStatus: SubmissionStatus;
  updated: string;
  proposalScore: number | null;
  bidDue: string;
  dueInDays: number | null;
  nextAction: string;
  nextActionRoute: string;
  unconfirmedAssumptions: number;
  openRFIs: number;
  coveragePct: number;
  version: string;
}

/* ────────── Mock Data ────────── */

const projects: Project[] = [
  {
    name: "Maple St. Kitchen Remodel", gc: "Mayfield & Co.", type: "Remodel", region: "Midwest",
    workflowStep: "Pricing & Margin", submissionStatus: "Draft", updated: "2 hours ago",
    proposalScore: 82, bidDue: "Mar 12", dueInDays: 2, nextAction: "Finalize quote",
    nextActionRoute: "/sub/pricing", unconfirmedAssumptions: 3, openRFIs: 1, coveragePct: 87, version: "v2",
  },
  {
    name: "Oakwood Addition", gc: "BrightBuild", type: "Addition", region: "Midwest",
    workflowStep: "Proposal Export", submissionStatus: "Ready to Submit", updated: "1 day ago",
    proposalScore: 88, bidDue: "Mar 15", dueInDays: 5, nextAction: "Submit quote",
    nextActionRoute: "/sub/proposal", unconfirmedAssumptions: 0, openRFIs: 0, coveragePct: 96, version: "v3",
  },
  {
    name: "Riverside TI", gc: "Metro Builders", type: "Tenant Finish", region: "Midwest",
    workflowStep: "Scope Analyzer", submissionStatus: "Draft", updated: "3 days ago",
    proposalScore: null, bidDue: "Mar 20", dueInDays: 10, nextAction: "Send RFI",
    nextActionRoute: "/sub/scope-analyzer", unconfirmedAssumptions: 5, openRFIs: 3, coveragePct: 64, version: "v1",
  },
  {
    name: "Central Office Buildout", gc: "TechForward Inc.", type: "Tenant Finish", region: "Midwest",
    workflowStep: "Submitted", submissionStatus: "Submitted", updated: "1 week ago",
    proposalScore: 79, bidDue: "—", dueInDays: null, nextAction: "Awaiting response",
    nextActionRoute: "/sub/proposal", unconfirmedAssumptions: 0, openRFIs: 0, coveragePct: 100, version: "v2",
  },
  {
    name: "Heritage Rehab Phase 2", gc: "Heritage Partners", type: "Commercial Rehab", region: "Northeast",
    workflowStep: "Submitted", submissionStatus: "Awarded", updated: "2 weeks ago",
    proposalScore: 91, bidDue: "—", dueInDays: null, nextAction: "Review actuals",
    nextActionRoute: "/sub/est-vs-actual", unconfirmedAssumptions: 0, openRFIs: 0, coveragePct: 100, version: "v3",
  },
  {
    name: "Lakeview Condos Ph1", gc: "Lakeview Dev Group", type: "New Construction", region: "Midwest",
    workflowStep: "Estimate Builder", submissionStatus: "Draft", updated: "5 hours ago",
    proposalScore: null, bidDue: "Mar 18", dueInDays: 8, nextAction: "Confirm assumptions",
    nextActionRoute: "/sub/estimate-builder", unconfirmedAssumptions: 4, openRFIs: 2, coveragePct: 72, version: "v1",
  },
  {
    name: "Pinnacle Tower TI", gc: "Pinnacle GC", type: "Tenant Finish", region: "Midwest",
    workflowStep: "Submitted", submissionStatus: "Lost", updated: "3 weeks ago",
    proposalScore: 68, bidDue: "—", dueInDays: null, nextAction: "Review feedback",
    nextActionRoute: "/sub/est-vs-actual", unconfirmedAssumptions: 0, openRFIs: 0, coveragePct: 100, version: "v2",
  },
];

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "due-soon", label: "Due Soon" },
  { key: "needs-rfi", label: "Needs RFI" },
  { key: "needs-pricing", label: "Needs Pricing" },
  { key: "ready", label: "Ready to Submit" },
  { key: "submitted", label: "Submitted" },
  { key: "awarded", label: "Awarded" },
];

const kpiTimeframes = ["Last 30", "Last 90", "YTD"] as const;

const recentActivity = [
  { text: "Scope package received — Maple St. Kitchen Remodel (Mayfield & Co.)", time: "2 hours ago", icon: FileSearch },
  { text: "Quote v3 finalized for Oakwood Addition — ready to send", time: "1 day ago", icon: DollarSign },
  { text: "Bid submitted for Central Office Buildout", time: "1 week ago", icon: FileOutput },
  { text: "Market comparison completed — Heritage Rehab", time: "2 weeks ago", icon: BarChart3 },
  { text: "RFI drafted for Riverside TI — missing structural detail", time: "3 days ago", icon: GitCompare },
];

const alerts: { text: string; type: "warning" | "success"; action: string; route: string }[] = [
  { text: "Maple St. bid due Mar 12 — quote still in pricing stage", type: "warning", action: "Open Quote", route: "/sub/pricing" },
  { text: "Oakwood Addition quote is ready to send — Proposal Score: 88", type: "success", action: "Submit Quote", route: "/sub/proposal" },
  { text: "Riverside TI has 3 open RFIs and 5 unconfirmed assumptions", type: "warning", action: "Resolve Assumptions", route: "/sub/scope-analyzer" },
  { text: "Lakeview Condos has 4 unconfirmed assumptions — coverage at 72%", type: "warning", action: "Draft RFI", route: "/sub/scope-analyzer" },
  { text: "Heritage Rehab was awarded — congrats!", type: "success", action: "Review Actuals", route: "/sub/est-vs-actual" },
];

/* ────────── Helpers ────────── */

const workflowStepIcon: Record<WorkflowStep, React.ElementType> = {
  "Document Upload": Upload,
  "Scope Analyzer": FileSearch,
  "Estimate Builder": Table2,
  "Pricing & Margin": DollarSign,
  "Proposal Export": FileOutput,
  "Submitted": CheckCircle,
};

const workflowStepColor: Record<WorkflowStep, string> = {
  "Document Upload": "bg-muted text-muted-foreground",
  "Scope Analyzer": "bg-info/10 text-info",
  "Estimate Builder": "bg-accent text-accent-foreground",
  "Pricing & Margin": "bg-primary/10 text-primary",
  "Proposal Export": "bg-primary/10 text-primary",
  "Submitted": "bg-muted text-muted-foreground",
};

const submissionStatusColor: Record<SubmissionStatus, string> = {
  "Draft": "bg-muted text-muted-foreground",
  "Ready to Submit": "bg-primary/10 text-primary",
  "Submitted": "bg-info/10 text-info",
  "Awarded": "bg-primary/15 text-primary",
  "Lost": "bg-destructive/10 text-destructive",
  "Revision Requested": "bg-warning/10 text-warning",
};

function applyFilter(p: Project, filter: FilterKey): boolean {
  switch (filter) {
    case "due-soon": return p.dueInDays !== null && p.dueInDays <= 7;
    case "needs-rfi": return p.openRFIs > 0;
    case "needs-pricing": return p.workflowStep === "Pricing & Margin" || p.workflowStep === "Estimate Builder";
    case "ready": return p.submissionStatus === "Ready to Submit";
    case "submitted": return p.submissionStatus === "Submitted";
    case "awarded": return p.submissionStatus === "Awarded";
    default: return true;
  }
}

/* ────────── Component ────────── */

export default function SubDashboardPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [kpiTimeframe, setKpiTimeframe] = useState<typeof kpiTimeframes[number]>("Last 30");
  const [kpiDropdownOpen, setKpiDropdownOpen] = useState(false);

  const filtered = projects
    .filter(p => applyFilter(p, activeFilter))
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.gc.toLowerCase().includes(search.toLowerCase())
    );

  const dueNext = projects
    .filter(p => p.dueInDays !== null && p.submissionStatus !== "Awarded" && p.submissionStatus !== "Lost")
    .sort((a, b) => (a.dueInDays ?? 99) - (b.dueInDays ?? 99))
    .slice(0, 4);

  const scoredProjects = projects.filter(p => p.proposalScore !== null);
  const avgScore = scoredProjects.length
    ? Math.round(scoredProjects.reduce((s, p) => s + (p.proposalScore ?? 0), 0) / scoredProjects.length)
    : 0;
  const awardedCount = projects.filter(p => p.submissionStatus === "Awarded").length;
  const decidedCount = projects.filter(p => p.submissionStatus === "Awarded" || p.submissionStatus === "Lost").length;

  const summaryCards = [
    { label: "Active Quotes", value: String(projects.filter(p => p.submissionStatus === "Draft" || p.submissionStatus === "Ready to Submit").length), icon: FileText, sub: `${projects.filter(p => p.submissionStatus === "Submitted").length} submitted` },
    { label: "Due This Week", value: String(projects.filter(p => p.dueInDays !== null && p.dueInDays <= 7).length), icon: Clock, sub: projects.filter(p => p.dueInDays !== null && p.dueInDays <= 7).map(p => p.name.split(" ")[0]).join(", ") },
    { label: "Submitted Quotes", value: String(projects.filter(p => p.submissionStatus === "Submitted").length), icon: FileOutput, sub: projects.filter(p => p.submissionStatus === "Submitted").map(p => p.name.split(" ")[0]).join(", ") || "—" },
    { label: "Avg Proposal Score", value: String(avgScore), icon: BarChart3, sub: `Across ${scoredProjects.length} scored` },
    { label: "Win Rate", value: decidedCount > 0 ? `${Math.round((awardedCount / decidedCount) * 100)}%` : "—", icon: TrendingUp, sub: `${awardedCount} of ${decidedCount} decided` },
    { label: "Open RFIs", value: String(projects.reduce((s, p) => s + p.openRFIs, 0)), icon: MessageSquare, sub: `${projects.filter(p => p.openRFIs > 0).length} quotes affected` },
  ];

  return (
    <SubLayout>
      <div className="p-6 lg:p-8 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">TrueFrame Carpentry — Framing Subcontractor · Midwest</p>
          </div>
          <div className="flex items-center gap-2">
            {/* KPI timeframe */}
            <div className="relative">
              <button
                onClick={() => setKpiDropdownOpen(!kpiDropdownOpen)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 bg-card transition-colors"
              >
                {kpiTimeframe}
                <ChevronDown size={12} />
              </button>
              {kpiDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 py-1 w-24">
                  {kpiTimeframes.map(t => (
                    <button key={t} onClick={() => { setKpiTimeframe(t); setKpiDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted/50 transition-colors ${t === kpiTimeframe ? "text-primary font-medium" : "text-foreground"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link to="/sub/upload">
              <Button size="sm"><Plus size={14} className="mr-1.5" /> New Quote</Button>
            </Link>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
          {summaryCards.map((c) => (
            <div key={c.label} className="bg-card border border-border rounded-xl p-4 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <c.icon size={14} className="text-primary" />
              </div>
              <p className="font-display text-xl font-bold text-foreground">{c.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{c.label}</p>
              <p className="text-[10px] text-muted-foreground">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Due Next Panel */}
        <div className="bg-card border border-border rounded-xl shadow-card mb-6">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            <h2 className="font-display font-semibold text-foreground text-sm">Due Next</h2>
            <span className="text-[10px] text-muted-foreground ml-auto">{dueNext.length} upcoming</span>
          </div>
          <div className="divide-y divide-border">
            {dueNext.map(p => (
              <div key={p.name} className="px-5 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{p.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      (p.dueInDays ?? 99) <= 3 ? "bg-destructive/10 text-destructive" :
                      (p.dueInDays ?? 99) <= 7 ? "bg-warning/10 text-warning" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      Due in {p.dueInDays} day{p.dueInDays !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.gc} · {p.bidDue}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">{p.nextAction}</span>
                <Link to={p.nextActionRoute}>
                  <Button variant="outline" size="sm" className="text-xs h-7 px-3 shrink-0">
                    Open <ArrowRight size={10} className="ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 max-w-xs flex-1 min-w-[200px]">
            <Search size={14} className="text-muted-foreground" />
            <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Search quotes..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {filters.map(f => (
              <button key={f.key} onClick={() => setActiveFilter(f.key)}
                className={`text-[11px] px-2.5 py-1.5 rounded-full font-medium transition-colors ${
                  activeFilter === f.key
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quotes Table */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-semibold text-foreground text-sm">Quotes</h2>
            <span className="text-xs text-muted-foreground">{filtered.length} of {projects.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Project", "GC / Builder", "Workflow Step", "Status", "Score", "Scope Health", "Version", "Due", ""].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.name} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-1.5 hidden lg:inline">{p.updated}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.gc}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${workflowStepColor[p.workflowStep]}`}>
                        {(() => { const Icon = workflowStepIcon[p.workflowStep]; return <Icon size={9} />; })()}
                        {p.workflowStep}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${submissionStatusColor[p.submissionStatus]}`}>
                        {p.submissionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.proposalScore ? (
                        <span className={`font-display font-semibold text-xs ${p.proposalScore >= 80 ? "text-primary" : p.proposalScore >= 70 ? "text-warning" : "text-destructive"}`}>{p.proposalScore}</span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {p.unconfirmedAssumptions > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning font-medium" title="Unconfirmed Assumptions">
                            <ShieldAlert size={9} /> {p.unconfirmedAssumptions}
                          </span>
                        )}
                        {p.openRFIs > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-info/10 text-info font-medium" title="Open RFIs">
                            <MessageSquare size={9} /> {p.openRFIs}
                          </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          p.coveragePct >= 90 ? "bg-primary/10 text-primary" :
                          p.coveragePct >= 75 ? "bg-warning/10 text-warning" :
                          "bg-destructive/10 text-destructive"
                        }`}>{p.coveragePct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground font-mono">{p.version}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{p.bidDue}</td>
                    <td className="px-4 py-3">
                      <Link to={p.nextActionRoute}>
                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                          Open <ArrowRight size={10} className="ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">No quotes match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Grid: Activity + Alerts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-xl shadow-card p-5">
            <h2 className="font-display font-semibold text-foreground text-sm mb-3">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <a.icon size={13} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{a.text}</p>
                    <p className="text-[10px] text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Alerts */}
          <div className="bg-card border border-border rounded-xl shadow-card p-5">
            <h2 className="font-display font-semibold text-foreground text-sm mb-3">Alerts & Flags</h2>
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${
                  a.type === "warning" ? "bg-warning/5 text-warning" : "bg-primary/5 text-primary"
                }`}>
                  {a.type === "warning" ? <AlertTriangle size={12} className="shrink-0" /> : <CheckCircle size={12} className="shrink-0" />}
                  <span className="flex-1">{a.text}</span>
                  <Link to={a.route}>
                    <Button variant="ghost" size="sm" className={`text-[10px] h-6 px-2 shrink-0 ${a.type === "warning" ? "text-warning hover:text-warning" : "text-primary hover:text-primary"}`}>
                      {a.action} <ExternalLink size={8} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SubLayout>
  );
}
