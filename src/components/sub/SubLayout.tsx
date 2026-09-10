import { Link, useLocation } from "react-router-dom";
import {
  Upload, FileSearch, Table2,
  FileOutput, Scale, TrendingUp, ChevronLeft, BarChart3, DollarSign
} from "lucide-react";
import { WorkspaceBackground } from "@/components/app/WorkspaceBackground";
import { useState } from "react";
import { AtlasPanel, AtlasToggleButton } from "@/components/app/AtlasPanel";
import { GlobalHeader } from "@/components/app/GlobalHeader";
import { ProjectSelector } from "@/components/app/ProjectSelector";

const estimatorNavItems = [
  { label: "Document Upload", icon: Upload, path: "/sub/upload" },
  { label: "Scope Analyzer", icon: FileSearch, path: "/sub/scope-analyzer" },
  { label: "Bid Packages", icon: Scale, path: "/sub/bid-leveling" },
  { label: "Estimate", icon: Table2, path: "/sub/estimate-builder" },
  { label: "Pricing & Margin", icon: DollarSign, path: "/sub/pricing" },
  { label: "Proposal Export", icon: FileOutput, path: "/sub/proposal" },
  { label: "Market Comparison", icon: BarChart3, path: "/sub/market-comparison" },
  { label: "Est. vs Actual", icon: TrendingUp, path: "/sub/est-vs-actual" },
];

type GlobalSection = "dashboard" | "estimator" | "settings";

export function SubLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [atlasOpen, setAtlasOpen] = useState(false);

  const getSection = (): GlobalSection => {
    if (location.pathname === "/sub" || location.pathname === "/sub/") return "dashboard";
    if (location.pathname === "/sub/settings") return "settings";
    if (/^\/sub\/(active|schedule|time|financials)/.test(location.pathname)) return "dashboard";
    if (!location.pathname.startsWith("/sub/")) return "dashboard";
    return "estimator";
  };
  const section = getSection();
  const isEstimator = section === "estimator";
  const isDashboard = section === "dashboard";
  const showAtlas = true;

  return (
    <div className="odyssey-app relative flex h-screen flex-col overflow-hidden">
      <WorkspaceBackground />
      <div className="relative z-[70]"><GlobalHeader track="sub" /></div>

      <div className="relative z-10 flex flex-1 gap-3 overflow-hidden px-3 pb-3 pt-3 lg:gap-4 lg:px-5 lg:pb-5">
        {/* Estimator Sidebar */}
        {isEstimator && (
          <aside className={`${collapsed ? "w-14" : "w-56"} odyssey-surface flex flex-col shrink-0 overflow-hidden rounded-2xl transition-all duration-200`}>
            <div className={`px-3 py-3 border-b border-border ${collapsed ? "px-2" : ""}`}>
              {!collapsed && (
                <>
                  <p className="text-sm font-semibold text-foreground">Estimator</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Subcontractor Workspace</p>
                  <div className="mt-3"><ProjectSelector compact /></div>
                </>
              )}
              {collapsed && (
                <p className="text-[10px] text-muted-foreground font-medium text-center">Est</p>
              )}
            </div>
            <nav className="flex-1 py-2 px-1.5 space-y-0.5 overflow-y-auto">
              {estimatorNavItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={16} className="shrink-0" />
                    {!collapsed && <span className="text-[13px]">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
            <button onClick={() => setCollapsed(!collapsed)}
              className="h-9 flex items-center justify-center border-t border-border text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={14} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
            </button>
          </aside>
        )}

        {/* Main + Euclid */}
        <main data-dense-workspace={location.pathname.includes("scope-analyzer") || location.pathname.includes("estimate-builder") || location.pathname.includes("bid-leveling") || location.pathname.includes("market-comparison") || location.pathname.includes("estimate-comparison") ? "true" : undefined} className="header-scroll-fade min-w-0 flex-1 overflow-y-auto rounded-2xl">{children}</main>

        {/* Euclid Panel */}
        {showAtlas && <AtlasPanel isOpen={atlasOpen} onClose={() => setAtlasOpen(false)} />}
      </div>

      {/* Euclid toggle button when panel is closed */}
      {showAtlas && !atlasOpen && <AtlasToggleButton onClick={() => setAtlasOpen(true)} />}
    </div>
  );
}
