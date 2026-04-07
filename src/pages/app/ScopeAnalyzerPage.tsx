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
import { PlanViewerExpanded, type TakeoffLineItemOption, type TakeoffMarkup } from "@/components/app/scope-analyzer/PlanViewer";
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
    return (
      node.parentScope.trades[0]?.sources[0]?.pageNumber ??
      node.parentScope.trades[0]?.assemblies[0]?.sources[0]?.pageNumber ??
      node.parentScope.trades[0]?.assemblies[0]?.lineItems[0]?.sources[0]?.pageNumber
    );
  }

  return getAllLineItems(project)[0]?.sources[0]?.pageNumber ?? 1;
}

function getTakeoffLineItemOptions(project: ScopeProject, selection: TreeSelection): TakeoffLineItemOption[] {
  const node = findNode(project, selection);

  if (selection.type === "lineItem" && node.lineItem) {
    return [{ id: node.lineItem.id, name: node.lineItem.name, unit: node.lineItem.unit }];
  }

  if (selection.type === "assembly" && node.assembly) {
    return node.assembly.lineItems.map(lineItem => ({ id: lineItem.id, name: lineItem.name, unit: lineItem.unit }));
  }

  if (selection.type === "trade" && node.trade) {
    return node.trade.assemblies.flatMap(assembly =>
      assembly.lineItems.map(lineItem => ({ id: lineItem.id, name: `${assembly.name} · ${lineItem.name}`, unit: lineItem.unit })),
    );
  }

  if (selection.type === "parentScope" && node.parentScope) {
    return node.parentScope.trades.flatMap(trade =>
      trade.assemblies.flatMap(assembly =>
        assembly.lineItems.map(lineItem => ({ id: lineItem.id, name: `${trade.name} · ${lineItem.name}`, unit: lineItem.unit })),
      ),
    );
  }

  return getAllLineItems(project).map(lineItem => ({ id: lineItem.id, name: lineItem.name, unit: lineItem.unit }));
}

export default function ScopeAnalyzerPage() {
  const [selection, setSelection] = useState<TreeSelection>({ type: "project", id: mockProject.id });
  const [planExpanded, setPlanExpanded] = useState(false);
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
    if (selection.type === "lineItem") {
      setSelectedTakeoffLineItemId(selection.id);
      return;
    }

    if (!takeoffLineItemOptions.some(option => option.id === selectedTakeoffLineItemId)) {
      setSelectedTakeoffLineItemId(takeoffLineItemOptions[0]?.id ?? "");
    }
  }, [selectedTakeoffLineItemId, selection, takeoffLineItemOptions]);

  const openPlanViewer = (page?: number) => {
    if (page) setCurrentPage(page);
    setPlanExpanded(true);
  };

  const handleCreateTakeoff = ({ markup, record }: { markup: TakeoffMarkup; record: TakeoffRecord }) => {
    setManualTakeoffs(previous => ({
      ...previous,
      [record.linkedLineItemId]: [...(previous[record.linkedLineItemId] ?? []), record],
    }));
    setManualMarkups(previous => [...previous, markup]);
  };

  const handleDeleteTakeoff = (takeoffId: string, lineItemId: string) => {
    setManualTakeoffs(previous => {
      const next = { ...previous };
      const filtered = (next[lineItemId] ?? []).filter(takeoff => takeoff.id !== takeoffId);

      if (filtered.length > 0) next[lineItemId] = filtered;
      else delete next[lineItemId];

      return next;
    });

    setManualMarkups(previous => previous.filter(markup => markup.takeoffId !== takeoffId));
  };

  const renderCenter = () => {
    switch (selection.type) {
      case "project":
        return <ProjectOverview project={project} onNavigate={setSelection} />;
      case "parentScope":
        if (node.parentScope) return <ParentScopeView parentScope={node.parentScope} onNavigate={setSelection} />;
        break;
      case "trade":
        if (node.trade) return <TradeView trade={node.trade} parentScopeName={node.parentScopeName || ""} onNavigate={setSelection} />;
        break;
      case "assembly":
        if (node.assembly) {
          return (
            <AssemblyView
              assembly={node.assembly}
              onAddTakeoff={() => openPlanViewer()}
              onNavigate={setSelection}
              parentScopeName={node.parentScopeName || ""}
              tradeName={node.tradeName || ""}
            />
          );
        }
        break;
      case "lineItem":
        if (node.assembly) {
          return (
            <AssemblyView
              assembly={node.assembly}
              onAddTakeoff={() => openPlanViewer()}
              onNavigate={setSelection}
              parentScopeName={node.parentScopeName || ""}
              tradeName={node.tradeName || ""}
            />
          );
        }
        break;
    }

    return <ProjectOverview project={project} onNavigate={setSelection} />;
  };

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="flex h-[calc(100vh-48px)] flex-col">
          <ScopeHeader project={project} onRunAnalysis={() => {}} onSaveDraft={() => {}} onLockScope={() => {}} />

          {planExpanded ? (
            <PlanViewerExpanded
              currentPage={currentPage}
              lineItemOptions={takeoffLineItemOptions}
              markups={manualMarkups}
              onCollapse={() => setPlanExpanded(false)}
              onCreateTakeoff={handleCreateTakeoff}
              onDeleteTakeoff={handleDeleteTakeoff}
              onPageChange={setCurrentPage}
              onSelectedLineItemChange={setSelectedTakeoffLineItemId}
              selectedLineItemId={selectedTakeoffLineItemId}
              takeoffs={selectedLineItemTakeoffs}
            />
          ) : null}

          <div className="flex flex-1 min-h-0">
            <div className="w-[280px] shrink-0">
              <ScopeHierarchyTree project={project} selection={selection} onSelect={setSelection} />
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">{renderCenter()}</div>

            <div className="w-[320px] shrink-0">
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
      </TooltipProvider>
    </AppLayout>
  );
}
