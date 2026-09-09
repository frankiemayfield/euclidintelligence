import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, GitCompareArrows, Scale,
  Wallet, Receipt, FileWarning, FolderOpen, Settings, ChevronLeft
} from "lucide-react";
import euclidLogo from "@/assets/euclid-logo.png";
import { useState } from "react";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, path: "/owner" },
  { label: "Proposals", icon: FileText, path: "/owner/proposals" },
  { label: "Comparison", icon: GitCompareArrows, path: "/owner/comparison" },
  { label: "Leveling", icon: Scale, path: "/owner/leveling" },
  { label: "Budget", icon: Wallet, path: "/owner/budget" },
  { label: "Invoices", icon: Receipt, path: "/owner/invoices" },
  { label: "Change Orders", icon: FileWarning, path: "/owner/change-orders" },
  { label: "Documents", icon: FolderOpen, path: "/owner/documents" },
  { label: "Settings", icon: Settings, path: "/owner/settings" },
];

export function HomeownerLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Nav */}
      <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <Link to="/" className="shrink-0">
            <img src={euclidLogo} alt="Euclid" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Osterfeld Residence Renovation</span>
            <span className="text-xs text-muted-foreground">· Cincinnati, OH</span>
          </div>
        </div>
        <div className="flex items-center gap-2 border-l border-border pl-4">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">AO</div>
          <div className="text-xs">
            <span className="text-foreground font-medium">Andrew Osterfeld</span>
            <span className="text-muted-foreground ml-1.5">· Homeowner</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${collapsed ? "w-14" : "w-52"} bg-card border-r border-border flex flex-col shrink-0 transition-all duration-200`}>
          <div className={`px-3 py-3 border-b border-border ${collapsed ? "px-2" : ""}`}>
            {!collapsed && (
              <>
                <p className="text-sm font-semibold text-foreground">Project Portal</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Homeowner Workspace</p>
              </>
            )}
            {collapsed && (
              <p className="text-[10px] text-muted-foreground font-medium text-center">HO</p>
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

        <main className="flex-1 overflow-y-auto odyssey-scroll-fade">{children}</main>
      </div>
    </div>
  );
}
