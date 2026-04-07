import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Upload, FileSearch, Table2,
  FileOutput, Scale, TrendingUp, Settings, ChevronLeft, BarChart3, ChevronDown, DollarSign,
  FolderOpen, Hammer
} from "lucide-react";
import euclidLogo from "@/assets/euclid-logo.png";
import companyLogo from "@/assets/company-logo.jpg";
import { useState } from "react";
import { AtlasPanel, AtlasToggleButton } from "./AtlasPanel";

const preconNavItems = [
  { label: "Document Upload", icon: Upload, path: "/app/upload" },
  { label: "Scope Analyzer", icon: FileSearch, path: "/app/scope-analyzer" },
  { label: "Bid Packages", icon: Scale, path: "/app/bid-leveling" },
  { label: "Estimate", icon: Table2, path: "/app/estimate-builder" },
  { label: "Pricing & Margin", icon: DollarSign, path: "/app/pricing" },
  { label: "Proposal Export", icon: FileOutput, path: "/app/proposal" },
  { label: "Market Comparison", icon: BarChart3, path: "/app/estimate-comparison" },
];

const activeProjectNavItems = [
  { label: "Est. vs Actual", icon: TrendingUp, path: "/app/est-vs-actual" },
];

const recentProjects = [
  { name: "Maple St. Kitchen Remodel", id: "maple" },
  { name: "Oakwood Custom Home", id: "oakwood" },
  { name: "Downtown TI - Suite 400", id: "downtown" },
];

type GlobalSection = "dashboard" | "precon" | "active" | "settings";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [activeProject] = useState("Maple St. Kitchen Remodel");
  const [atlasOpen, setAtlasOpen] = useState(true);

  const getSection = (): GlobalSection => {
    if (location.pathname === "/app" || location.pathname === "/app/") return "dashboard";
    if (location.pathname === "/app/settings") return "settings";
    // Pre-Construction paths
    const preconPaths = ["/app/upload", "/app/scope-analyzer", "/app/bid-leveling", "/app/estimate-builder", "/app/estimate-comparison", "/app/market-comparison", "/app/proposal-comparison"];
    if (preconPaths.some(p => location.pathname === p)) return "precon";
    // Active Projects paths
    const activePaths = ["/app/est-vs-actual"];
    if (activePaths.some(p => location.pathname === p)) return "active";
    return "precon";
  };
  const section = getSection();
  const hasSidebar = section === "precon" || section === "active";
  const sidebarItems = section === "precon" ? preconNavItems : section === "active" ? activeProjectNavItems : [];
  const sidebarTitle = section === "precon" ? "Pre-Construction" : "Active Projects";
  const showAtlas = section !== "settings";

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Global Top Nav */}
      <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <Link to="/" className="shrink-0">
            <img src={euclidLogo} alt="Euclid" className="h-8 w-auto" />
          </Link>
          <nav className="flex items-center gap-1">
            <Link to="/app"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${section === "dashboard" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              Dashboard
            </Link>
            <Link to="/app/upload"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${section === "precon" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              Pre-Construction
            </Link>
            <Link to="/app/pricing"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${section === "active" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              Active Projects
            </Link>
            <Link to="/app/settings"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${section === "settings" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {(hasSidebar || section === "dashboard") && (
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
                    <Link to="/app/new-project" className="block px-3 py-2 text-sm text-primary hover:bg-muted/50" onClick={() => setProjectMenuOpen(false)}>
                      + New Project
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 border-l border-border pl-4">
            <img src={companyLogo} alt="Company Logo" className="h-6 w-6 rounded-md object-cover" />
            <span className="text-xs text-muted-foreground">Mayfield & Co.</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {hasSidebar && (
          <aside className={`${collapsed ? "w-14" : "w-56"} bg-card border-r border-border flex flex-col shrink-0 transition-all duration-200`}>
            <div className={`px-3 py-3 border-b border-border ${collapsed ? "px-2" : ""}`}>
              {!collapsed && (
                <>
                  <p className="text-sm font-semibold text-foreground">{sidebarTitle}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Project Workspace</p>
                </>
              )}
              {collapsed && (
                <p className="text-[10px] text-muted-foreground font-medium text-center">
                  {section === "precon" ? "Pre" : "Act"}
                </p>
              )}
            </div>
            <nav className="flex-1 py-2 px-1.5 space-y-0.5 overflow-y-auto">
              {sidebarItems.map((item) => {
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
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Euclid Panel */}
        {showAtlas && <AtlasPanel isOpen={atlasOpen} onClose={() => setAtlasOpen(false)} />}
      </div>

      {/* Euclid toggle button when panel is closed */}
      {showAtlas && !atlasOpen && <AtlasToggleButton onClick={() => setAtlasOpen(true)} />}
    </div>
  );
}
