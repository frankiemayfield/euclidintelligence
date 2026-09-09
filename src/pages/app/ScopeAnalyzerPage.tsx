import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/app/AppLayout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ScopeHeader } from "@/components/app/scope-analyzer/ScopeHeader";
import { PlanViewer, type TakeoffLineItemOption, type TakeoffMarkup, type ViewerMode } from "@/components/app/scope-analyzer/PlanViewer";
import { BidPackageView, QuantityTakeoffView, ReviewView, StructureView, type ReviewDecision, type ScopeTab, type ScopeTrack, type StructureState } from "@/components/app/scope-analyzer/ScopeWorkflowViews";
import { WorkflowTransition } from "@/components/app/WorkflowTransition";
import { cn } from "@/lib/utils";
import { getAllLineItems, mockProject, type IssueFlag, type LineItem, type ReviewStatus, type ScopeProject, type TakeoffRecord } from "@/data/scopeAnalyzerData";
import { useDemoProject } from "@/hooks/use-demo-project";

interface WorkspaceProps { Layout: React.ComponentType<{ children: React.ReactNode }>; track?: ScopeTrack; }

function mergeManualTakeoffs(project: ScopeProject, takeoffsByLineItem: Record<string, TakeoffRecord[]>) {
  return { ...project, parentScopes: project.parentScopes.map(parentScope => ({ ...parentScope, trades: parentScope.trades.map(trade => ({ ...trade, assemblies: trade.assemblies.map(assembly => ({ ...assembly, lineItems: assembly.lineItems.map(item => ({ ...item, takeoffs: [...item.takeoffs, ...(takeoffsByLineItem[item.id] ?? [])] })) })) })) })) } satisfies ScopeProject;
}

function updateLineItem(project: ScopeProject, id: string, update: (item: LineItem) => LineItem) {
  return { ...project, parentScopes: project.parentScopes.map(parentScope => ({ ...parentScope, trades: parentScope.trades.map(trade => ({ ...trade, assemblies: trade.assemblies.map(assembly => ({ ...assembly, lineItems: assembly.lineItems.map(item => item.id === id ? update(item) : item) })) })) })) };
}

function projectScope(activeProject: ReturnType<typeof useDemoProject>["project"]): ScopeProject {
  if (activeProject.id === "fregolle") return { ...mockProject, id: activeProject.id, name: activeProject.name };
  const quantityFactor = Math.max(0.35, Math.min(1.85, (activeProject.builderCost ?? 620000) / 1182400));
  const keepRatio = Math.max(0.25, activeProject.scopeCoverage / 100);
  return {
    ...mockProject,
    id: activeProject.id,
    name: activeProject.name,
    parentScopes: mockProject.parentScopes.map((parentScope, parentIndex) => ({
      ...parentScope,
      name: parentIndex === 0 ? `${activeProject.type} Base Scope` : parentScope.name,
      trades: parentScope.trades.map(trade => ({ ...trade, assemblies: trade.assemblies.map(assembly => ({
        ...assembly,
        lineItems: assembly.lineItems.filter((_, index) => index === 0 || (index + parentIndex) / Math.max(1, assembly.lineItems.length) <= keepRatio).map(item => ({
          ...item,
          id: `${activeProject.id}-${item.id}`,
          name: `${item.name} — ${activeProject.name}`,
          quantity: Math.max(1, Number((item.quantity * quantityFactor).toFixed(1))),
          reviewStatus: activeProject.scopeCoverage < 60 ? "Needs Review" : item.reviewStatus,
          takeoffs: activeProject.scopeCoverage < 60 ? [] : item.takeoffs.map(takeoff => ({ ...takeoff, id: `${activeProject.id}-${takeoff.id}`, quantity: Math.max(1, Number((takeoff.quantity * quantityFactor).toFixed(1))), linkedLineItemId: `${activeProject.id}-${item.id}` })),
          sources: item.sources.map(source => ({ ...source, fileName: `${activeProject.name.replace(/[^a-z0-9]+/gi, "_")}_Plans.pdf` })),
        }))
      })) }))
    }))
  };
}

export function ScopeAnalyzerWorkspace({ Layout, track = "builder" }: WorkspaceProps) {
  const { project: activeProject, quote } = useDemoProject();
  const [baseProject, setBaseProject] = useState(() => projectScope(activeProject));
  const [activeTab, setActiveTab] = useState<ScopeTab>("takeoff");
  const [viewerMode, setViewerMode] = useState<ViewerMode>("hidden");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLineItemId, setSelectedLineItemId] = useState("");
  const [manualTakeoffs, setManualTakeoffs] = useState<Record<string, TakeoffRecord[]>>({});
  const [manualMarkups, setManualMarkups] = useState<TakeoffMarkup[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [structure, setStructure] = useState<StructureState>({});
  const [decisions, setDecisions] = useState<ReviewDecision[]>([]);
  const [transition, setTransition] = useState(false);
  const project = useMemo(() => mergeManualTakeoffs(baseProject, manualTakeoffs), [baseProject, manualTakeoffs]);
  const items = useMemo(() => getAllLineItems(project), [project]);
  const selectedItem = items.find(item => item.id === selectedLineItemId);
  const takeoffs = selectedItem?.takeoffs ?? [];
  const options: TakeoffLineItemOption[] = items.map(item => ({ id: item.id, name: item.name, unit: item.unit }));
  const structured = items.filter(item => item.companyCostCode || structure[item.id]?.mappedTo).length;
  const scaleDerived = items.filter(item => ["linear", "area", "volume", "polygon"].includes(item.takeoffs[0]?.method || "")).length;
  const needsReview = items.filter(item => item.reviewStatus === "Needs Review").length;
  const lowConfidence = items.filter(item => item.confidence === "Low").length;
  const openIssues = items.reduce((sum, item) => sum + item.issues.length, 0) - decisions.filter(decision => decision.resolved).length;
  const tabs: { value: ScopeTab; label: string }[] = track === "builder" ? [{ value: "takeoff", label: "Quantity Takeoff" }, { value: "review", label: "Review" }, { value: "structure", label: "Scope Structure" }] : [{ value: "takeoff", label: "Quantity Takeoff" }, { value: "review", label: "Review" }, { value: "structure", label: "Quote Structure" }, { value: "package", label: "Bid Package" }];

  useEffect(() => {
    setBaseProject(projectScope(activeProject));
    setManualTakeoffs({}); setManualMarkups([]); setDecisions([]); setStructure({});
  }, [activeProject.id, activeProject.name]);

  useEffect(() => {
    setSelected(new Set());
    const detail = activeTab === "takeoff" ? `I'm reviewing ${activeProject.name}. ${needsReview} takeoff items still need review and ${scaleDerived} were derived from the project plans.` : activeTab === "review" ? `${activeProject.name} has ${Math.max(0, openIssues)} review items remaining.` : activeTab === "structure" ? `${structured} of ${items.length} ${activeProject.name} items are mapped into ${track === "builder" ? "estimate" : "quote"} line items.` : `${track === "sub" ? `TrueFrame's current quote is ${quote.currentAmount ? `$${quote.currentAmount.toLocaleString()}` : "preliminary"}. ` : ""}The package contains ${decisions.filter(decision => decision.action === "Exclude").length} exclusions and ${decisions.filter(decision => decision.action === "Clarify").length} clarifications.`;
    window.dispatchEvent(new CustomEvent("euclid-scope-context", { detail: { tab: activeTab, track, summary: detail } }));
  }, [activeProject.name, activeTab, decisions, items.length, needsReview, openIssues, quote.currentAmount, scaleDerived, structured, track]);

  useEffect(() => { if (!selectedLineItemId && items[0]) setSelectedLineItemId(items[0].id); }, [items, selectedLineItemId]);

  const openPlan = (item: LineItem) => { setSelectedLineItemId(item.id); setCurrentPage(item.sources[0]?.pageNumber || 1); setViewerMode("expanded"); };
  const reviewChange = (id: string, status: ReviewStatus, issues?: IssueFlag[]) => setBaseProject(projectValue => updateLineItem(projectValue, id, item => ({ ...item, reviewStatus: status, issues: issues ?? item.issues })));
  const makeDecision = (reviewItem: { id: string; lineItemId: string }, action: string) => {
    setDecisions(current => [...current.filter(decision => decision.id !== reviewItem.id), { id: reviewItem.id, action, resolved: true }]);
    if (["Confirm", "Add to Scope", "Select Preferred Source", "Merge", "Keep Separate", "Include", "Exclude", "Clarify"].includes(action)) reviewChange(reviewItem.lineItemId, "Reviewed", []);
  };
  const updateStructure = (id: string, patch: StructureState[string]) => setStructure(current => ({ ...current, [id]: { ...current[id], ...patch } }));
  const continueFlow = () => track === "builder" ? setTransition(true) : setActiveTab("package");
  const handleCreateTakeoff = ({ markup, record }: { markup: TakeoffMarkup; record: TakeoffRecord }) => { setManualTakeoffs(current => ({ ...current, [record.linkedLineItemId]: [...(current[record.linkedLineItemId] ?? []), record] })); setManualMarkups(current => [...current, markup]); };
  const handleDeleteTakeoff = (takeoffId: string, lineItemId: string) => { setManualTakeoffs(current => ({ ...current, [lineItemId]: (current[lineItemId] ?? []).filter(takeoff => takeoff.id !== takeoffId) })); setManualMarkups(current => current.filter(markup => markup.takeoffId !== takeoffId)); };
  const planViewerProps = { currentPage, lineItemOptions: options, markups: manualMarkups, onModeChange: setViewerMode, onCreateTakeoff: handleCreateTakeoff, onDeleteTakeoff: handleDeleteTakeoff, onPageChange: setCurrentPage, onSelectedLineItemChange: setSelectedLineItemId, selectedLineItemId, takeoffs };

  if (viewerMode === "fullscreen") return <TooltipProvider><PlanViewer {...planViewerProps} mode="fullscreen" /></TooltipProvider>;
  return <Layout><TooltipProvider>
    <div className="scope-analyzer-workspace odyssey-surface flex h-full min-h-[calc(100vh-112px)] flex-col overflow-hidden rounded-2xl">
      <ScopeHeader project={project} extracted={items.length} needsReview={needsReview} structured={structured} scaleDerived={scaleDerived} lowConfidence={lowConfidence} openIssues={Math.max(0, openIssues)} onRunAnalysis={() => {}} onSaveDraft={() => {}} />
      {viewerMode === "expanded" && <PlanViewer {...planViewerProps} mode="expanded" />}
      <nav className="flex items-center justify-between border-b border-border px-4" aria-label="Scope Analyzer sections"><div className="flex min-w-0 gap-1 overflow-x-auto py-2">{tabs.map(tab => <Button key={tab.value} variant="ghost" size="sm" onClick={() => setActiveTab(tab.value)} className={cn("h-8 rounded-full px-4 text-xs text-muted-foreground", activeTab === tab.value && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground")}>{tab.label}</Button>)}</div>{viewerMode === "hidden" && <Button variant="ghost" size="sm" className="h-8 text-[11px] text-muted-foreground" onClick={() => setViewerMode("expanded")}><RulerIcon /> Open Plan Viewer</Button>}</nav>
      <div className={cn("flex min-h-0 flex-1", viewerMode === "embedded" && "divide-x divide-border")}><div className="flex min-w-0 flex-1 flex-col">
        {activeTab === "takeoff" && <QuantityTakeoffView items={items} selected={selected} onSelectedChange={setSelected} onOpenPlan={openPlan} onReviewChange={reviewChange} />}
        {activeTab === "review" && <ReviewView items={items} decisions={decisions} onDecision={makeDecision} />}
        {activeTab === "structure" && <StructureView items={items} track={track} selected={selected} onSelectedChange={setSelected} onOpenPlan={openPlan} onReviewChange={reviewChange} structure={structure} onStructureChange={updateStructure} onContinue={continueFlow} />}
        {activeTab === "package" && <BidPackageView items={items} structure={structure} decisions={decisions} onBuild={() => setTransition(true)} />}
      </div>{viewerMode === "embedded" && <div className="w-[380px] shrink-0"><PlanViewer {...planViewerProps} mode="embedded" /></div>}</div>
    </div>
    <WorkflowTransition active={transition} headline={track === "builder" ? "Preparing bid packages" : "Building your estimate"} targetPath={track === "builder" ? "/app/bid-leveling" : "/sub/estimate-builder"} steps={track === "builder" ? [{ label: "Applying validated scope" }, { label: "Grouping trade packages" }, { label: "Preparing bid workspace" }] : [{ label: "Applying validated quantities" }, { label: "Structuring line items" }, { label: "Applying project defaults" }, { label: "Preparing pricing workspace" }]} />
  </TooltipProvider></Layout>;
}

function RulerIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 17 14-14 4 4L7 21H3v-4Z"/><path d="m14 6 4 4M11 9l2 2M8 12l2 2"/></svg>; }
export default function ScopeAnalyzerPage() { return <ScopeAnalyzerWorkspace Layout={AppLayout} track="builder" />; }
