import { Link, useLocation } from "react-router-dom";
import {
  Upload, FileText, Scale, GitCompareArrows, BarChart3,
   FolderOpen, Wallet, Receipt, FileWarning, ChevronLeft
} from "lucide-react";
import { WorkspaceBackground } from "@/components/app/WorkspaceBackground";
import { useState } from "react";
import { AtlasPanel, AtlasToggleButton } from "@/components/app/AtlasPanel";
import { GlobalHeader } from "@/components/app/GlobalHeader";

const preConNavItems = [
  { label: "Document Upload", icon: Upload, path: "/owner/upload" },
  { label: "Proposals", icon: FileText, path: "/owner/proposals" },
  { label: "Leveling", icon: Scale, path: "/owner/leveling" },
  { label: "Comparison", icon: GitCompareArrows, path: "/owner/comparison" },
  { label: "Market Comparison", icon: BarChart3, path: "/owner/market-comparison" },
];

const activeNavItems = [
  { label: "Documents", icon: FolderOpen, path: "/owner/documents" },
  { label: "Budget", icon: Wallet, path: "/owner/budget" },
  { label: "Invoices", icon: Receipt, path: "/owner/invoices" },
  { label: "Change Orders", icon: FileWarning, path: "/owner/change-orders" },
];

type GlobalSection = "dashboard" | "pre-construction" | "active-projects" | "settings";

export function OwnerLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [atlasOpen, setAtlasOpen] = useState(false);

  const getSection = (): GlobalSection => {
    if (location.pathname === "/owner" || location.pathname === "/owner/") return "dashboard";
    if (location.pathname === "/owner/settings") return "settings";
    if (["/owner/documents", "/owner/budget", "/owner/invoices", "/owner/change-orders"].includes(location.pathname)) return "active-projects";
    return "pre-construction";
  };

  const section = getSection();
  const isPreCon = section === "pre-construction";
  const isActive = section === "active-projects";
  const hasSidebar = isPreCon || isActive;
  const showAtlas = hasSidebar || section === "dashboard";

  const navItems = isPreCon ? preConNavItems : isActive ? activeNavItems : [];
  const sidebarTitle = isPreCon ? "Pre-Construction" : "Active Projects";
  const sidebarSub = isPreCon ? "Proposal Review" : "Project Tracking";
  const sidebarShort = isPreCon ? "Pre" : "Act";

  return (
    <div className="odyssey-app relative flex h-screen flex-col overflow-hidden">
      <WorkspaceBackground />
      <div className="relative z-[70]"><GlobalHeader track="owner" /></div>

      <div className="relative z-10 flex flex-1 gap-3 overflow-hidden px-3 pb-3 pt-3 lg:gap-4 lg:px-5 lg:pb-5">
        {/* Sidebar */}
        {hasSidebar && (
          <aside className={`${collapsed ? "w-14" : "w-56"} odyssey-surface flex flex-col shrink-0 overflow-hidden rounded-2xl transition-all duration-200`}>
            <div className={`px-3 py-3 border-b border-border ${collapsed ? "px-2" : ""}`}>
              {!collapsed && (
                <>
                  <p className="text-sm font-semibold text-foreground">{sidebarTitle}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{sidebarSub}</p>
                </>
              )}
              {collapsed && (
                <p className="text-[10px] text-muted-foreground font-medium text-center">{sidebarShort}</p>
              )}
            </div>
            <nav className="flex-1 py-2 px-1.5 space-y-0.5 overflow-y-auto">
              {navItems.map((item) => {
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

        {/* Main */}
        <main className="header-scroll-fade min-w-0 flex-1 overflow-y-auto rounded-2xl">{children}</main>

        {/* Atlas Panel */}
        {showAtlas && <AtlasPanel isOpen={atlasOpen} onClose={() => setAtlasOpen(false)} />}
      </div>

      {/* Atlas toggle */}
      {showAtlas && !atlasOpen && <AtlasToggleButton onClick={() => setAtlasOpen(true)} />}
    </div>
  );
}
