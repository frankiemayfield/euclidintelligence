import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Upload, FileSearch, Table2, Bot,
  FileOutput, GitCompare, TrendingUp, Settings, ChevronLeft, BarChart3, ChevronDown
} from "lucide-react";
import bedrockLogo from "@/assets/bedrock-logo.png";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/app" },
  { label: "New Project", icon: Upload, path: "/app/upload" },
  { label: "Scope Analyzer", icon: FileSearch, path: "/app/scope-analyzer" },
  { label: "Bid Leveling", icon: GitCompare, path: "/app/bid-leveling" },
  { label: "Estimate Builder", icon: Table2, path: "/app/estimate-builder" },
  { label: "Estimator Atlas", icon: Bot, path: "/app/atlas" },
  { label: "Proposal Export", icon: FileOutput, path: "/app/proposal" },
  { label: "Est. vs Actual", icon: TrendingUp, path: "/app/est-vs-actual" },
  { label: "Proposal Comparison", icon: BarChart3, path: "/app/proposal-comparison" },
  { label: "Settings", icon: Settings, path: "/app/settings" },
];

const recentProjects = [
  { name: "Maple St. Kitchen Remodel", id: "maple" },
  { name: "Oakwood Custom Home", id: "oakwood" },
  { name: "Downtown TI - Suite 400", id: "downtown" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [activeProject] = useState("Maple St. Kitchen Remodel");

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-16" : "w-60"} bg-card border-r border-border flex flex-col shrink-0 transition-all duration-200`}>
        <div className="h-14 flex items-center px-4 border-b border-border gap-2">
          {collapsed ? (
            <img src={bedrockLogo} alt="Bedrock" className="h-10 w-10 object-contain object-left" />
          ) : (
            <img src={bedrockLogo} alt="Bedrock" className="h-11 w-auto" />
          )}
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button onClick={() => setCollapsed(!collapsed)}
          className="h-10 flex items-center justify-center border-t border-border text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={16} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header with project context */}
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
          <div className="text-xs text-muted-foreground">
            Bedrock Estimating Hub
          </div>
          <div className="flex items-center gap-4">
            {/* Project switcher */}
            <div className="relative">
              <button onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                <span className="text-xs text-muted-foreground">Project:</span>
                <span className="font-medium">{activeProject}</span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
              {projectMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                  {recentProjects.map((p) => (
                    <button key={p.id} onClick={() => setProjectMenuOpen(false)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors ${
                        p.name === activeProject ? "text-primary font-medium" : "text-foreground"
                      }`}>
                      {p.name}
                    </button>
                  ))}
                  <div className="border-t border-border mt-1 pt-1">
                    <Link to="/app/upload" className="block px-3 py-2 text-sm text-primary hover:bg-muted/50" onClick={() => setProjectMenuOpen(false)}>
                      + New Project
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground border-l border-border pl-4">
              Mayfield & Co.
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
