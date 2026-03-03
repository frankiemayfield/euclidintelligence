import { AppLayout } from "@/components/app/AppLayout";
import { BarChart3, FileSearch, Upload, Bot, AlertTriangle, Clock, TrendingUp, FileText } from "lucide-react";

const recentProjects = [
  { name: "Maple St. Kitchen Remodel", type: "Remodel", score: 84, status: "Review", date: "Feb 28" },
  { name: "Oakwood Custom Home", type: "Custom Home", score: 91, status: "Complete", date: "Feb 25" },
  { name: "Downtown TI - Suite 400", type: "Tenant Finish", score: 72, status: "Flagged", date: "Feb 22" },
  { name: "Riverside Addition", type: "Addition", score: 88, status: "Review", date: "Feb 20" },
  { name: "Heritage Rehab Phase 2", type: "Commercial Rehab", score: 67, status: "Flagged", date: "Feb 18" },
];

const summaryCards = [
  { label: "Active Projects", value: "12", icon: FileText, change: "+3 this month" },
  { label: "Avg. Bid Score", value: "82", icon: BarChart3, change: "↑ 4 pts" },
  { label: "Scope Gaps Flagged", value: "23", icon: AlertTriangle, change: "8 unresolved" },
  { label: "Estimates This Month", value: "18", icon: TrendingUp, change: "+6 vs last month" },
];

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's your estimating overview.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((c) => (
            <div key={c.label} className="bg-card border border-border rounded-xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">{c.label}</span>
                <c.icon size={16} className="text-primary" />
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.change}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: "New Project", icon: Upload, href: "/app/upload" },
            { label: "Bid Score", icon: BarChart3, href: "/app/bid-score" },
            { label: "Scope Review", icon: FileSearch, href: "/app/scope-analyzer" },
            { label: "Ask Atlas", icon: Bot, href: "/app/atlas" },
          ].map((a) => (
            <a key={a.label} href={a.href} className="flex items-center gap-3 bg-card border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-card-hover transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <a.icon size={18} className="text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{a.label}</span>
            </a>
          ))}
        </div>

        {/* Recent Projects Table */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-semibold text-foreground">Recent Projects</h2>
            <span className="text-xs text-muted-foreground">Showing 5 of 12</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Project</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Bid Score</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((p) => (
                  <tr key={p.name} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.type}</td>
                    <td className="px-5 py-3">
                      <span className={`font-display font-semibold ${p.score >= 80 ? "text-primary" : p.score >= 70 ? "text-warning" : "text-destructive"}`}>
                        {p.score}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === "Complete" ? "bg-primary/10 text-primary" :
                        p.status === "Flagged" ? "bg-destructive/10 text-destructive" :
                        "bg-warning/10 text-warning"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
