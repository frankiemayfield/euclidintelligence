import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Upload, BarChart3, FileSearch, Table2, Bot,
  FileOutput, GitCompare, TrendingUp, Settings, ChevronLeft
} from "lucide-react";
import bedrockLogo from "@/assets/bedrock-logo.png";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/app" },
  { label: "New Project", icon: Upload, path: "/app/upload" },
  { label: "Bid Score", icon: BarChart3, path: "/app/bid-score" },
  { label: "Scope Analyzer", icon: FileSearch, path: "/app/scope-analyzer" },
  { label: "Estimate Builder", icon: Table2, path: "/app/estimate-builder" },
  { label: "Estimator Atlas", icon: Bot, path: "/app/atlas" },
  { label: "Proposal Export", icon: FileOutput, path: "/app/proposal" },
  { label: "Bid Leveling", icon: GitCompare, path: "/app/bid-leveling" },
  { label: "Est. vs Actual", icon: TrendingUp, path: "/app/est-vs-actual" },
  { label: "Settings", icon: Settings, path: "/app/settings" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-16" : "w-60"
        } bg-card border-r border-border flex flex-col shrink-0 transition-all duration-200`}
      >
        <div className="h-14 flex items-center px-4 border-b border-border gap-2">
          {collapsed ? (
            <img src={bedrockLogo} alt="Bedrock" className="h-9 w-9 object-contain object-left" />
          ) : (
            <img src={bedrockLogo} alt="Bedrock" className="h-10 w-auto" />
          )}
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-10 flex items-center justify-center border-t border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
