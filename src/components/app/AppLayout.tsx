import { Link, useLocation } from "react-router-dom";
import {
  Upload, FileSearch, Table2,
  FileOutput, Scale, TrendingUp, ChevronLeft, BarChart3, DollarSign
} from "lucide-react";
import { WorkspaceBackground } from "@/components/app/WorkspaceBackground";
import { useState } from "react";
import { AtlasPanel, AtlasToggleButton } from "./AtlasPanel";
import { GlobalHeader } from "./GlobalHeader";
import { ProjectSwitcher, SidebarProjectSwitcher } from "./ProjectSwitcher";
import { useDemoProject } from "@/hooks/use-demo-project";
import { WorkflowRailSlot } from "./precon/WorkflowRail";

const estimatorNavItems = [
  { label: "Document Upload", icon: Upload, path: "/app/upload" },
  { label: "Scope Analyzer", icon: FileSearch, path: "/app/scope-analyzer" },
  { label: "Bid Packages", icon: Scale, path: "/app/bid-leveling" },
  { label: "Estimate", icon: Table2, path: "/app/estimate-builder" },
  { label: "Pricing & Margin", icon: DollarSign, path: "/app/pricing" },
  { label: "Proposal Export", icon: FileOutput, path: "/app/proposal" },
  { label: "Market Comparison", icon: BarChart3, path: "/app/estimate-comparison" },
  { label: "Est. vs Actual", icon: TrendingUp, path: "/app/est-vs-actual" },
];

type GlobalSection = "dashboard" | "estimator" | "settings";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [atlasOpen, setAtlasOpen] = useState(false);
  const { project } = useDemoProject();

  const getSection = (): GlobalSection => {
    if (location.pathname === "/app" || location.pathname === "/app/") return "dashboard";
    if (location.pathname === "/app/settings") return "settings";
    if (/^\/app\/(projects|active|operations|schedule|time|financials)/.test(location.pathname)) return "dashboard";
    if (/^\/app\/precon(\/|$)/.test(location.pathname)) return "dashboard";
    if (!location.pathname.startsWith("/app/")) return "dashboard";
    return "estimator";
  };
  const section = getSection();
  const isEstimator = section === "estimator";
  const isDashboard = section === "dashboard";
  const showAtlas = true;

  return (
    <div className="odyssey-app relative flex h-screen flex-col overflow-hidden">
      <WorkspaceBackground />
      <div className="relative z-[70]"><GlobalHeader track="builder" /></div>

      <div className={`relative z-10 flex flex-1 gap-3 overflow-hidden pb-3 pt-3 lg:gap-4 lg:pb-5 ${isEstimator ? "px-3 lg:px-5" : "px-0"}`}>
        {/* Estimator Sidebar */}
        {isEstimator && (
          <aside className={`${collapsed ? "w-14" : "w-56"} odyssey-surface flex flex-col shrink-0 overflow-hidden rounded-2xl transition-all duration-200`}>
            <div className={`px-3 py-1.5 border-b border-border ${collapsed ? "px-2" : ""}`}>
              {!collapsed && (
                <>
                  <Link to="/app/projects?stage=precon" className="text-[10px] font-semibold text-primary">← Projects</Link>
                  <div className="mt-1"><SidebarProjectSwitcher /></div>
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
        <div className="flex min-w-0 flex-1 flex-col">
          {isEstimator && (
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-1 pt-1 lg:px-6">
              <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Preconstruction · Estimator</p>
              <ProjectSwitcher projectId={project.id} pillar="precon" compact className="w-auto max-w-[260px] rounded-full border border-border/60 bg-card/40 px-3 py-1.5" />
            </div>
          )}
          <main data-dense-workspace={location.pathname.includes("scope-analyzer") || location.pathname.includes("estimate-builder") || location.pathname.includes("bid-leveling") || location.pathname.includes("market-comparison") || location.pathname.includes("estimate-comparison") ? "true" : undefined} className="header-scroll-fade min-w-0 flex-1 overflow-y-auto rounded-2xl"><WorkflowRailSlot />{children}</main>
        </div>

        {/* Euclid Panel - persistent across estimator + dashboard */}
        {showAtlas && <AtlasPanel isOpen={atlasOpen} onClose={() => setAtlasOpen(false)} />}
      </div>

      {/* Euclid toggle button when panel is closed */}
      {showAtlas && !atlasOpen && <AtlasToggleButton onClick={() => setAtlasOpen(true)} />}
    </div>
  );
}
