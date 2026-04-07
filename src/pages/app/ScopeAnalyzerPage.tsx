import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScopeHeader } from "@/components/app/scope-analyzer/ScopeHeader";
import { ScopeHierarchyTree, type TreeSelection } from "@/components/app/scope-analyzer/ScopeHierarchyTree";
import { ProjectOverview } from "@/components/app/scope-analyzer/ProjectOverview";
import { ParentScopeView } from "@/components/app/scope-analyzer/ParentScopeView";
import { TradeView } from "@/components/app/scope-analyzer/TradeView";
import { AssemblyView } from "@/components/app/scope-analyzer/AssemblyView";
import { ScopeInspector } from "@/components/app/scope-analyzer/ScopeInspector";
import { PlanViewer, PlanViewerShowButton, type TakeoffLineItemOption, type TakeoffMarkup, type ViewerMode } from "@/components/app/scope-analyzer/PlanViewer";
import {
  getAllLineItems,
  mockProject,
  type Assembly,
  type LineItem,
  type ParentScope,
  type ScopeProject,
  type TakeoffRecord,
  type Trade,
} from "@/data/scopeAnalyzerData";

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

function mergeManualTakeoffs(project: ScopeProject, takeoffsByLineItem: Record<string, TakeoffRecord[]>) {
  return {
    ...project,
    parentScopes: project.parentScopes.map(parentScope => ({
      ...parentScope,
      trades: parentScope.trades.map(trade => ({
        ...trade,
        assemblies: trade.assemblies.map(assembly => ({
          ...assembly,
          lineItems: assembly.lineItems.map(lineItem => ({
            ...lineItem,
            takeoffs: [...lineItem.takeoffs, ...(takeoffsByLineItem[lineItem.id] ?? [])],
          })),
        })),
      })),
    })),
  } satisfies ScopeProject;
}

function getSelectionPage(project: ScopeProject, selection: TreeSelection) {
  const node = findNode(project, selection);
  if (selection.type === "lineItem" && node.lineItem) return node.lineItem.sources[0]?.pageNumber;
  if (selection.type === "assembly" && node.assembly) return node.assembly.sources[0]?.pageNumber ?? node.assembly.lineItems[0]?.sources[0]?.pageNumber;
  if (selection.type === "trade" && node.trade) return node.trade.sources[0]?.pageNumber ?? node.trade.assemblies[0]?.sources[0]?.pageNumber;
  if (selection.type === "parentScope" && node.parentScope) {
    return node.parentScope.trades[0]?.sources[0]?.pageNumber ?? node.parentScope.trades[0]?.assemblies[0]?.sources[0]?.pageNumber;
  }
  return getAllLineItems(project)[0]?.sources[0]?.pageNumber ?? 1;
}

function getTakeoffLineItemOptions(project: ScopeProject, selection: TreeSelection): TakeoffLineItemOption[] {
  const node = findNode(project, selection);
  if (selection.type === "lineItem" && node.lineItem) return [{ id: node.lineItem.id, name: node.lineItem.name, unit: node.lineItem.unit }];
  if (selection.type === "assembly" && node.assembly) return node.assembly.lineItems.map(li => ({ id: li.id, name: li.name, unit: li.unit }));
  if (selection.type === "trade" && node.trade) return node.trade.assemblies.flatMap(a => a.lineItems.map(li => ({ id: li.id, name: `${a.name} · ${li.name}`, unit: li.unit })));
  if (selection.type === "parentScope" && node.parentScope) return node.parentScope.trades.flatMap(t => t.assemblies.flatMap(a => a.lineItems.map(li => ({ id: li.id, name: `${t.name} · ${li.name}`, unit: li.unit }))));
  return getAllLineItems(project).map(li => ({ id: li.id, name: li.name, unit: li.unit }));
}

export default function ScopeAnalyzerPage() {
  const [selection, setSelection] = useState<TreeSelection>({ type: "project", id: mockProject.id });
  const [viewerMode, setViewerMode] = useState<ViewerMode>("embedded");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTakeoffLineItemId, setSelectedTakeoffLineItemId] = useState("");
  const [manualTakeoffs, setManualTakeoffs] = useState<Record<string, TakeoffRecord[]>>({});
  const [manualMarkups, setManualMarkups] = useState<TakeoffMarkup[]>([]);

  const project = useMemo(() => mergeManualTakeoffs(mockProject, manualTakeoffs), [manualTakeoffs]);
  const node = useMemo(() => findNode(project, selection), [project, selection]);
  const takeoffLineItemOptions = useMemo(() => getTakeoffLineItemOptions(project, selection), [project, selection]);
  const selectedLineItemTakeoffs = useMemo(() => {
    if (!selectedTakeoffLineItemId) return [];
    return getAllLineItems(project).find(item => item.id === selectedTakeoffLineItemId)?.takeoffs ?? [];
  }, [project, selectedTakeoffLineItemId]);

  useEffect(() => {
    const nextPage = getSelectionPage(mockProject, selection);
    if (nextPage) setCurrentPage(nextPage);
  }, [selection]);

  useEffect(() => {
    if (selection.type === "lineItem") { setSelectedTakeoffLineItemId(selection.id); return; }
    if (!takeoffLineItemOptions.some(o => o.id === selectedTakeoffLineItemId)) {
      setSelectedTakeoffLineItemId(takeoffLineItemOptions[0]?.id ?? "");
    }
  }, [selectedTakeoffLineItemId, selection, takeoffLineItemOptions]);

  const openPlanViewer = (page?: number) => {
    if (page) setCurrentPage(page);
    setViewerMode("expanded");
  };

  const handleCreateTakeoff = ({ markup, record }: { markup: TakeoffMarkup; record: TakeoffRecord }) => {
    setManualTakeoffs(prev => ({ ...prev, [record.linkedLineItemId]: [...(prev[record.linkedLineItemId] ?? []), record] }));
    setManualMarkups(prev => [...prev, markup]);
  };

  const handleDeleteTakeoff = (takeoffId: string, lineItemId: string) => {
    setManualTakeoffs(prev => {
      const next = { ...prev };
      const filtered = (next[lineItemId] ?? []).filter(t => t.id !== takeoffId);
      if (filtered.length > 0) next[lineItemId] = filtered; else delete next[lineItemId];
      return next;
    });
    setManualMarkups(prev => prev.filter(m => m.takeoffId !== takeoffId));
  };

  const renderCenter = () => {
    switch (selection.type) {
      case "project": return <ProjectOverview project={project} onNavigate={setSelection} />;
      case "parentScope": if (node.parentScope) return <ParentScopeView parentScope={node.parentScope} onNavigate={setSelection} />; break;
      case "trade": if (node.trade) return <TradeView trade={node.trade} parentScopeName={node.parentScopeName || ""} onNavigate={setSelection} />; break;
      case "assembly": if (node.assembly) return <AssemblyView assembly={node.assembly} onAddTakeoff={() => openPlanViewer()} onNavigate={setSelection} parentScopeName={node.parentScopeName || ""} tradeName={node.tradeName || ""} />; break;
      case "lineItem": if (node.assembly) return <AssemblyView assembly={node.assembly} onAddTakeoff={() => openPlanViewer()} onNavigate={setSelection} parentScopeName={node.parentScopeName || ""} tradeName={node.tradeName || ""} />; break;
    }
    return <ProjectOverview project={project} onNavigate={setSelection} />;
  };

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="flex h-[calc(100vh-48px)] flex-col">
          <ScopeHeader project={project} onRunAnalysis={() => {}} onSaveDraft={() => {}} onLockScope={() => {}} />

          {/* Expanded plan viewer - landscape above workspace */}
          {viewerMode === "expanded" && (
            <PlanViewer
              currentPage={currentPage}
              lineItemOptions={takeoffLineItemOptions}
              markups={manualMarkups}
              mode="expanded"
              onModeChange={setViewerMode}
              onCreateTakeoff={handleCreateTakeoff}
              onDeleteTakeoff={handleDeleteTakeoff}
              onPageChange={setCurrentPage}
              onSelectedLineItemChange={setSelectedTakeoffLineItemId}
              selectedLineItemId={selectedTakeoffLineItemId}
              takeoffs={selectedLineItemTakeoffs}
            />
          )}

          <div className="flex flex-1 min-h-0">
            <div className="w-[280px] shrink-0">
              <ScopeHierarchyTree project={project} selection={selection} onSelect={setSelection} />
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
              {/* Show viewer button when hidden */}
              {viewerMode === "hidden" && (
                <div className="flex items-center justify-end border-b border-border px-3 py-1.5 bg-muted/10">
                  <PlanViewerShowButton onClick={() => setViewerMode("embedded")} />
                </div>
              )}
              {renderCenter()}
            </div>

            <div className="w-[320px] shrink-0 flex flex-col">
              {/* Embedded plan viewer at top of inspector */}
              {viewerMode === "embedded" && (
                <div className="shrink-0 max-h-[50%]">
                  <PlanViewer
                    currentPage={currentPage}
                    lineItemOptions={takeoffLineItemOptions}
                    markups={manualMarkups}
                    mode="embedded"
                    onModeChange={setViewerMode}
                    onCreateTakeoff={handleCreateTakeoff}
                    onDeleteTakeoff={handleDeleteTakeoff}
                    onPageChange={setCurrentPage}
                    onSelectedLineItemChange={setSelectedTakeoffLineItemId}
                    selectedLineItemId={selectedTakeoffLineItemId}
                    takeoffs={selectedLineItemTakeoffs}
                  />
                </div>
              )}
              <div className="flex-1 min-h-0 overflow-hidden">
                <ScopeInspector
                  currentPage={currentPage}
                  onExpandPlan={() => openPlanViewer()}
                  onPageChange={setCurrentPage}
                  project={project}
                  selection={selection}
                />
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
