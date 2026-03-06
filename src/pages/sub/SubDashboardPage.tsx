import { SubLayout } from "@/components/sub/SubLayout";
import { BarChart3, FileText, AlertTriangle, TrendingUp, Plus, Search, Clock, CheckCircle, ArrowRight, FileSearch, GitCompare, DollarSign, FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";

type StageLabel = "Document Upload" | "Scope Analyzer" | "Bid Leveling" | "Estimate Builder" | "Pricing & Margin" | "Proposal Export" | "Est. vs Actual" | "Market Comparison" | "Submitted" | "Awarded";

interface Project {
  name: string; gc: string; type: string; region: string; stage: StageLabel; updated: string; proposalScore: number | null; quoteStatus: string; bidDue: string;
}

const projects: Project[] = [
  { name: "Maple St. Kitchen Remodel", gc: "Mayfield & Co.", type: "Remodel", region: "Midwest", stage: "Pricing & Margin", updated: "2 hours ago", proposalScore: 82, quoteStatus: "In Progress", bidDue: "Mar 12" },
  { name: "Oakwood Addition", gc: "BrightBuild", type: "Addition", region: "Midwest", stage: "Proposal Export", updated: "1 day ago", proposalScore: 88, quoteStatus: "Ready to Send", bidDue: "Mar 15" },
  { name: "Riverside TI", gc: "Metro Builders", type: "Tenant Finish", region: "Midwest", stage: "Scope Analyzer", updated: "3 days ago", proposalScore: null, quoteStatus: "Reviewing Scope", bidDue: "Mar 20" },
  { name: "Central Office Buildout", gc: "TechForward Inc.", type: "Tenant Finish", region: "Midwest", stage: "Submitted", updated: "1 week ago", proposalScore: 79, quoteStatus: "Submitted", bidDue: "—" },
  { name: "Heritage Rehab Phase 2", gc: "Heritage Partners", type: "Commercial Rehab", region: "Northeast", stage: "Awarded", updated: "2 weeks ago", proposalScore: 91, quoteStatus: "Won", bidDue: "—" },
];

const summaryCards = [
  { label: "Active Quotes", value: "3", icon: FileText, sub: "2 submitted" },
  { label: "Quotes Due This Week", value: "2", icon: Clock, sub: "Maple St., Oakwood" },
  { label: "Quotes Sent", value: "2", icon: FileOutput, sub: "Central Office, Heritage" },
  { label: "Avg Proposal Score", value: "85", icon: BarChart3, sub: "Across 4 scored" },
  { label: "Win Rate", value: "67%", icon: TrendingUp, sub: "2 of 3 awarded" },
  { label: "Updated Today", value: "1", icon: Clock, sub: "Maple St." },
];

const recentActivity = [
  { text: "Scope package received — Maple St. Kitchen Remodel (Mayfield & Co.)", time: "2 hours ago", icon: FileSearch },
  { text: "Quote updated for Oakwood Addition — ready to send", time: "1 day ago", icon: DollarSign },
  { text: "Bid submitted for Central Office Buildout", time: "1 week ago", icon: FileOutput },
  { text: "Market comparison completed — Heritage Rehab", time: "2 weeks ago", icon: BarChart3 },
  { text: "RFI drafted for Riverside TI — missing structural detail", time: "3 days ago", icon: GitCompare },
];

const alerts = [
  { text: "Maple St. bid due Mar 12 — quote still in pricing stage", type: "warning" },
  { text: "Oakwood Addition quote is ready to send — Proposal Score: 88", type: "success" },
  { text: "Riverside TI has 3 unresolved scope issues from GC package", type: "warning" },
  { text: "Heritage Rehab was awarded — congrats!", type: "success" },
];

const atlasSuggestions = [
  "Generate an exclusions list for this framing bid",
  "Draft an RFI based on missing structural detail",
  "Which scope items are still unconfirmed?",
  "Compare my quote against market rates",
];

const stageColor: Record<string, string> = {
  "Document Upload": "bg-muted text-muted-foreground",
  "Scope Analyzer": "bg-info/10 text-info",
  "Bid Leveling": "bg-warning/10 text-warning",
  "Estimate Builder": "bg-accent text-accent-foreground",
  "Pricing & Margin": "bg-primary/10 text-primary",
  "Proposal Export": "bg-primary/10 text-primary",
  "Est. vs Actual": "bg-muted text-muted-foreground",
  "Market Comparison": "bg-muted text-muted-foreground",
  "Submitted": "bg-info/10 text-info",
  "Awarded": "bg-primary/15 text-primary",
};

export default function SubDashboardPage() {
  const [search, setSearch] = useState("");

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.gc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SubLayout>
      <div className="p-6 lg:p-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">TrueFrame Carpentry — Framing Subcontractor · Midwest</p>
          </div>
          <Link to="/sub/upload">
            <Button size="sm"><Plus size={14} className="mr-1.5" /> New Quote</Button>
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

        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 max-w-xs flex-1">
            <Search size={14} className="text-muted-foreground" />
            <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Search quotes..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Project Table */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-semibold text-foreground text-sm">Quotes</h2>
            <span className="text-xs text-muted-foreground">{filtered.length} of {projects.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Project", "GC / Builder", "Type", "Stage", "Proposal Score", "Quote Status", "Bid Due", ""].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.name} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.gc}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.type}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stageColor[p.stage] || "bg-muted text-muted-foreground"}`}>{p.stage}</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.proposalScore ? (
                        <span className={`font-display font-semibold text-xs ${p.proposalScore >= 80 ? "text-primary" : p.proposalScore >= 70 ? "text-warning" : "text-destructive"}`}>{p.proposalScore}</span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        p.quoteStatus === "Ready to Send" || p.quoteStatus === "Won" ? "bg-primary/10 text-primary" :
                        p.quoteStatus === "Submitted" ? "bg-info/10 text-info" :
                        "bg-muted text-muted-foreground"
                      }`}>{p.quoteStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.bidDue}</td>
                    <td className="px-4 py-3">
                      <Link to="/sub/upload">
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

          <div className="bg-card border border-border rounded-xl shadow-card p-5">
            <h2 className="font-display font-semibold text-foreground text-sm mb-3">Alerts & Flags</h2>
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                  a.type === "warning" ? "bg-warning/5 text-warning" : "bg-primary/5 text-primary"
                }`}>
                  {a.type === "warning" ? <AlertTriangle size={12} className="shrink-0 mt-0.5" /> : <CheckCircle size={12} className="shrink-0 mt-0.5" />}
                  <span>{a.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SubLayout>
  );
}
