import { AppLayout } from "@/components/app/AppLayout";
import { BarChart3, FileText, AlertTriangle, TrendingUp, Plus, Search, Clock, CheckCircle, ArrowRight, FileSearch, GitCompare, DollarSign, FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";

type StageLabel = "Document Upload" | "Scope Analyzer" | "Bid Leveling" | "Estimate Builder" | "Pricing & Margin" | "Proposal Export" | "Est. vs Actual" | "Proposal Comparison" | "Closed";
type FilterType = "All" | "Active" | "In Review" | "Awaiting Bids" | "Proposal Ready" | "Closed";

interface Project {
  name: string; client: string; type: string; region: string; stage: StageLabel; updated: string; marketFit: number | null; proposalStatus: string; estimator: string;
}

const projects: Project[] = [
  { name: "Maple St. Kitchen Remodel", client: "Johnson Family", type: "Remodel", region: "Midwest", stage: "Pricing & Margin", updated: "2 hours ago", marketFit: 78, proposalStatus: "Draft", estimator: "Ryan M." },
  { name: "Oakwood Custom Home", client: "Peterson Group", type: "Custom Home", region: "Midwest", stage: "Proposal Export", updated: "1 day ago", marketFit: 91, proposalStatus: "Ready", estimator: "Ryan M." },
  { name: "Downtown TI - Suite 400", client: "Metro Holdings", type: "Tenant Finish", region: "Midwest", stage: "Bid Leveling", updated: "3 days ago", marketFit: null, proposalStatus: "Pending", estimator: "Sarah K." },
  { name: "Riverside Addition", client: "Chen Family", type: "Addition", region: "West Coast", stage: "Scope Analyzer", updated: "4 days ago", marketFit: null, proposalStatus: "Not Started", estimator: "Ryan M." },
  { name: "Heritage Rehab Phase 2", client: "Heritage Partners", type: "Commercial Rehab", region: "Northeast", stage: "Estimate Builder", updated: "5 days ago", marketFit: null, proposalStatus: "Pending", estimator: "Sarah K." },
  { name: "Lakeview Duplex", client: "Greenline Dev", type: "Custom Home", region: "Midwest", stage: "Est. vs Actual", updated: "1 week ago", marketFit: 85, proposalStatus: "Sent", estimator: "Ryan M." },
  { name: "Central Office Buildout", client: "TechForward Inc.", type: "Tenant Finish", region: "Midwest", stage: "Closed", updated: "2 weeks ago", marketFit: 82, proposalStatus: "Accepted", estimator: "Sarah K." },
];

const summaryCards = [
  { label: "Active Projects", value: "6", icon: FileText, sub: "1 closed" },
  { label: "Awaiting Scope Review", value: "2", icon: FileSearch, sub: "Riverside, Heritage" },
  { label: "Open Sub Bid Requests", value: "4", icon: GitCompare, sub: "Across 2 projects" },
  { label: "Proposals Ready", value: "1", icon: FileOutput, sub: "Oakwood Custom Home" },
  { label: "Under Margin Target", value: "1", icon: AlertTriangle, sub: "Maple St. (15.3%)" },
  { label: "Updated Today", value: "1", icon: Clock, sub: "Maple St. Remodel" },
];

const recentActivity = [
  { text: "Scope reviewed for Riverside Addition", time: "4 days ago", icon: FileSearch },
  { text: "Sub bid received — Spark Electric (Maple St.)", time: "2 days ago", icon: GitCompare },
  { text: "Pricing updated for Maple St. Kitchen Remodel", time: "2 hours ago", icon: DollarSign },
  { text: "Proposal exported for Oakwood Custom Home", time: "1 day ago", icon: FileOutput },
  { text: "Market comparison completed — Oakwood", time: "1 day ago", icon: BarChart3 },
];

const alerts = [
  { text: "Maple St. margin (15.3%) is below company target (18%)", type: "warning" },
  { text: "Downtown TI has 3 trades awaiting sub bids", type: "info" },
  { text: "Heritage Rehab has 4 unresolved scope issues", type: "warning" },
  { text: "Oakwood proposal is ready to send — Market Fit: 91", type: "success" },
];

const stageColor: Record<string, string> = {
  "Document Upload": "bg-muted text-muted-foreground",
  "Scope Analyzer": "bg-info/10 text-info",
  "Bid Leveling": "bg-warning/10 text-warning",
  "Estimate Builder": "bg-accent text-accent-foreground",
  "Pricing & Margin": "bg-primary/10 text-primary",
  "Proposal Export": "bg-primary/10 text-primary",
  "Est. vs Actual": "bg-muted text-muted-foreground",
  "Proposal Comparison": "bg-muted text-muted-foreground",
  "Closed": "bg-muted text-muted-foreground",
};

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");
  const filters: FilterType[] = ["All", "Active", "In Review", "Awaiting Bids", "Proposal Ready", "Closed"];

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "All") return true;
    if (filter === "Active") return p.stage !== "Closed";
    if (filter === "In Review") return p.stage === "Scope Analyzer" || p.stage === "Estimate Builder";
    if (filter === "Awaiting Bids") return p.stage === "Bid Leveling";
    if (filter === "Proposal Ready") return p.proposalStatus === "Ready";
    if (filter === "Closed") return p.stage === "Closed";
    return true;
  });

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Mayfield & Co. — Company estimating overview</p>
          </div>
          <Link to="/app/new-project">
            <Button size="sm"><Plus size={14} className="mr-1.5" /> New Project</Button>
          </Link>
        </div>

        {/* Summary Cards */}
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

        {/* Search + Filter */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 max-w-xs flex-1">
            <Search size={14} className="text-muted-foreground" />
            <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${filter === f ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Project Table */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-semibold text-foreground text-sm">Projects</h2>
            <span className="text-xs text-muted-foreground">{filtered.length} of {projects.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Project", "Client", "Type", "Stage", "Market Fit", "Proposal", "Updated", ""].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.name} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.client}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.type}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageColor[p.stage] || "bg-muted text-muted-foreground"}`}>{p.stage}</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.marketFit ? (
                        <span className={`font-display font-semibold text-xs ${p.marketFit >= 80 ? "text-primary" : p.marketFit >= 70 ? "text-warning" : "text-destructive"}`}>{p.marketFit}</span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        p.proposalStatus === "Ready" || p.proposalStatus === "Accepted" ? "bg-primary/10 text-primary" :
                        p.proposalStatus === "Sent" ? "bg-info/10 text-info" :
                        "bg-muted text-muted-foreground"
                      }`}>{p.proposalStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.updated}</td>
                    <td className="px-4 py-3">
                      <Link to="/app/upload">
                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                          Open <ArrowRight size={10} className="ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
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

          {/* Alerts */}
          <div className="bg-card border border-border rounded-xl shadow-card p-5">
            <h2 className="font-display font-semibold text-foreground text-sm mb-3">Alerts & Flags</h2>
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                  a.type === "warning" ? "bg-warning/5 text-warning" : a.type === "success" ? "bg-primary/5 text-primary" : "bg-info/5 text-info"
                }`}>
                  {a.type === "warning" ? <AlertTriangle size={12} className="shrink-0 mt-0.5" /> : a.type === "success" ? <CheckCircle size={12} className="shrink-0 mt-0.5" /> : <Clock size={12} className="shrink-0 mt-0.5" />}
                  <span>{a.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
