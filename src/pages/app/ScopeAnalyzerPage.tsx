import { useState, useMemo } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScopeHeader } from "@/components/app/scope-analyzer/ScopeHeader";
import { ScopeHierarchyTree, type TreeSelection } from "@/components/app/scope-analyzer/ScopeHierarchyTree";
import { ProjectOverview } from "@/components/app/scope-analyzer/ProjectOverview";
import { ParentScopeView } from "@/components/app/scope-analyzer/ParentScopeView";
import { TradeView } from "@/components/app/scope-analyzer/TradeView";
import { AssemblyView } from "@/components/app/scope-analyzer/AssemblyView";
import { ScopeInspector } from "@/components/app/scope-analyzer/ScopeInspector";
import { PlanViewerExpanded } from "@/components/app/scope-analyzer/PlanViewer";
import { mockProject, type ScopeProject, type ParentScope, type Trade, type Assembly, type LineItem } from "@/data/scopeAnalyzerData";

function findNode(project: ScopeProject, sel: TreeSelection) {
  for (const ps of project.parentScopes) {
    if (sel.type === "parentScope" && sel.id === ps.id) return { parentScope: ps, parentScopeName: ps.name };
    for (const t of ps.trades) {
      if (sel.type === "trade" && sel.id === t.id) return { trade: t, parentScope: ps, parentScopeName: ps.name, tradeName: t.name };
      for (const a of t.assemblies) {
        if (sel.type === "assembly" && sel.id === a.id) return { assembly: a, trade: t, parentScope: ps, parentScopeName: ps.name, tradeName: t.name };
        if (sel.type === "lineItem") {
          for (const li of a.lineItems) {
            if (sel.id === li.id) return { lineItem: li, assembly: a, trade: t, parentScope: ps, parentScopeName: ps.name, tradeName: t.name };
          }
        }
      }
    }
  }
  return {};
}

export default function ScopeAnalyzerPage() {
  const [selection, setSelection] = useState<TreeSelection>({ type: "project", id: mockProject.id });
  const [planExpanded, setPlanExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const node = useMemo(() => findNode(mockProject, selection), [selection]);

  const renderCenter = () => {
    switch (selection.type) {
      case "project":
        return <ProjectOverview project={mockProject} onNavigate={setSelection} />;
      case "parentScope":
        if (node.parentScope) return <ParentScopeView parentScope={node.parentScope} onNavigate={setSelection} />;
        break;
      case "trade":
        if (node.trade) return <TradeView trade={node.trade} parentScopeName={node.parentScopeName || ""} onNavigate={setSelection} />;
        break;
      case "assembly":
        if (node.assembly) return <AssemblyView assembly={node.assembly} parentScopeName={node.parentScopeName || ""} tradeName={node.tradeName || ""} onNavigate={setSelection} />;
        break;
      case "lineItem":
        if (node.assembly) return <AssemblyView assembly={node.assembly} parentScopeName={node.parentScopeName || ""} tradeName={node.tradeName || ""} onNavigate={setSelection} />;
        break;
    }
    return <ProjectOverview project={mockProject} onNavigate={setSelection} />;
  };

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="flex flex-col h-[calc(100vh-48px)]">
          <ScopeHeader project={mockProject} onRunAnalysis={() => {}} onSaveDraft={() => {}} onLockScope={() => {}} />

          {/* Expanded Plan Viewer — landscape above workspace */}
          {planExpanded && (
            <PlanViewerExpanded
              onCollapse={() => setPlanExpanded(false)}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}

          <div className="flex flex-1 min-h-0">
            {/* Left Hierarchy Tree */}
            <div className="w-[280px] shrink-0">
              <ScopeHierarchyTree project={mockProject} selection={selection} onSelect={setSelection} />
            </div>

            {/* Center Workspace */}
            <div className="flex-1 min-w-0 overflow-hidden">
              {renderCenter()}
            </div>

            {/* Right Inspector (with compact plan viewer at top) */}
            <div className="w-[280px] shrink-0">
              <ScopeInspector
                project={mockProject}
                selection={selection}
                onExpandPlan={() => setPlanExpanded(true)}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
