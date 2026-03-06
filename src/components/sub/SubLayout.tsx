import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Upload, FileSearch, Table2,
  FileOutput, Scale, TrendingUp, Settings, ChevronLeft, BarChart3, ChevronDown, DollarSign
} from "lucide-react";
import bedrockLogo from "@/assets/bedrock-logo-new.png";
import { useState } from "react";
import { AtlasPanel, AtlasToggleButton } from "@/components/app/AtlasPanel";

const estimatorNavItems = [
  { label: "Document Upload", icon: Upload, path: "/sub/upload" },
  { label: "Scope Analyzer", icon: FileSearch, path: "/sub/scope-analyzer" },
  { label: "Bid Leveling", icon: Scale, path: "/sub/bid-leveling" },
  { label: "Estimate Builder", icon: Table2, path: "/sub/estimate-builder" },
  { label: "Pricing & Margin", icon: DollarSign, path: "/sub/pricing" },
  { label: "Proposal Export", icon: FileOutput, path: "/sub/proposal" },
  { label: "Market Comparison", icon: BarChart3, path: "/sub/market-comparison" },
  { label: "Est. vs Actual", icon: TrendingUp, path: "/sub/est-vs-actual" },
];

const recentProjects = [
  { name: "Maple St. Kitchen Remodel", id: "maple", gc: "Mayfield & Co." },
  { name: "Oakwood Addition", id: "oakwood", gc: "BrightBuild" },
  { name: "Riverside TI", id: "riverside", gc: "Metro Builders" },
];

type GlobalSection = "dashboard" | "estimator" | "settings";

export function SubLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [activeProject] = useState("Maple St. Kitchen Remodel");
  const [atlasOpen, setAtlasOpen] = useState(true);

  const getSection = (): GlobalSection => {
    if (location.pathname === "/sub" || location.pathname === "/sub/") return "dashboard";
    if (location.pathname === "/sub/settings") return "settings";
    return "estimator";
  };
  const section = getSection();
  const isEstimator = section === "estimator";
  const isDashboard = section === "dashboard";
  const showAtlas = isEstimator || isDashboard;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Global Top Nav */}
      <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <Link to="/" className="shrink-0">
            <img src={bedrockLogo} alt="Bedrock" className="h-8 w-auto" />
          </Link>
          <nav className="flex items-center gap-1">
            <Link to="/sub"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${section === "dashboard" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              Dashboard
            </Link>
            <Link to="/sub/upload"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isEstimator ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              Estimator
            </Link>
            <Link to="/sub/settings"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${section === "settings" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isEstimator && (
            <div className="relative">
              <button onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                <span className="text-xs text-muted-foreground">Project:</span>
                <span className="font-medium">{activeProject}</span>
                <span className="text-[10px] text-muted-foreground ml-1">GC: Mayfield & Co.</span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
              {projectMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-72 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                  {recentProjects.map((p) => (
                    <button key={p.id} onClick={() => setProjectMenuOpen(false)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors ${
                        p.name === activeProject ? "text-primary font-medium" : "text-foreground"
                      }`}>
                      <span>{p.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">GC: {p.gc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 border-l border-border pl-4">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">TF</div>
            <div className="text-xs">
              <span className="text-foreground font-medium">TrueFrame Carpentry</span>
              <span className="text-muted-foreground ml-1.5">· Framing</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Estimator Sidebar */}
        {isEstimator && (
          <aside className={`${collapsed ? "w-14" : "w-56"} bg-card border-r border-border flex flex-col shrink-0 transition-all duration-200`}>
            <div className={`px-3 py-3 border-b border-border ${collapsed ? "px-2" : ""}`}>
              {!collapsed && (
                <>
                  <p className="text-sm font-semibold text-foreground">Estimator</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Subcontractor Workspace</p>
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

        {/* Main + Atlas */}
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Atlas Panel */}
        {showAtlas && <AtlasPanel isOpen={atlasOpen} onClose={() => setAtlasOpen(false)} />}
      </div>

      {/* Atlas toggle button when panel is closed */}
      {showAtlas && !atlasOpen && <AtlasToggleButton onClick={() => setAtlasOpen(true)} />}
    </div>
  );
}
