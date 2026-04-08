import { useState } from "react";
import { ChevronRight, ChevronDown, ChevronLeft, Search, Package, Layers, Box, FileText, Building2, PanelLeftClose, PanelLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ScopeProject, ParentScope, Trade, Assembly, LineItem } from "@/data/scopeAnalyzerData";

export type TreeNodeType = "project" | "parentScope" | "trade" | "assembly" | "lineItem";
export interface TreeSelection {
  type: TreeNodeType;
  id: string;
}

interface Props {
  project: ScopeProject;
  selection: TreeSelection;
  onSelect: (sel: TreeSelection) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

type QuickFilter = "missingCostCodes" | "missingTakeoffs" | "needsReview" | "lowConfidence" | "riskFlags";

function lineItemHasFilter(li: LineItem, filter: QuickFilter): boolean {
  switch (filter) {
    case "missingCostCodes": return li.companyCostCodeStatus === "missing";
    case "missingTakeoffs": return li.takeoffs.length === 0;
    case "needsReview": return li.reviewStatus === "Needs Review";
    case "lowConfidence": return li.confidence === "Low";
    case "riskFlags": return li.issues.length > 0;
  }
}

function countIssuesInScope(ps: ParentScope): number {
  let c = 0;
  for (const t of ps.trades) for (const a of t.assemblies) for (const li of a.lineItems) if (li.issues.length > 0) c++;
  return c;
}
function countIssuesInTrade(t: Trade): number {
  let c = 0;
  for (const a of t.assemblies) for (const li of a.lineItems) if (li.issues.length > 0) c++;
  return c;
}

export function ScopeHierarchyTree({ project, selection, onSelect, collapsed = false, onCollapsedChange }: Props) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["proj-001", project.parentScopes[0]?.id]));
  const [activeFilters, setActiveFilters] = useState<Set<QuickFilter>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleFilter = (f: QuickFilter) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f); else next.add(f);
      return next;
    });
  };

  const expandAll = () => {
    const ids = new Set<string>([project.id]);
    for (const ps of project.parentScopes) { ids.add(ps.id); for (const t of ps.trades) { ids.add(t.id); for (const a of t.assemblies) ids.add(a.id); } }
    setExpanded(ids);
  };
  const collapseAll = () => setExpanded(new Set([project.id]));

  const matchesSearch = (name: string) => !search || name.toLowerCase().includes(search.toLowerCase());

  const filterArray = Array.from(activeFilters);
  const lineItemPassesFilters = (li: LineItem) => {
    if (filterArray.length === 0) return true;
    return filterArray.some(f => lineItemHasFilter(li, f));
  };

  const filters: { key: QuickFilter; label: string }[] = [
    { key: "missingCostCodes", label: "Missing Codes" },
    { key: "missingTakeoffs", label: "Missing Takeoffs" },
    { key: "needsReview", label: "Needs Review" },
    { key: "lowConfidence", label: "Low Confidence" },
    { key: "riskFlags", label: "Risk Flags" },
  ];

  /* ── Collapsed rail ── */
  if (collapsed) {
    return (
      <div className="flex flex-col h-full border-r border-border bg-card w-full items-center py-2 gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7 mb-2" onClick={() => onCollapsedChange?.(false)} title="Expand panel">
          <PanelLeft className="h-3.5 w-3.5" />
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className={cn("p-1.5 rounded-md transition-colors", selection.type === "project" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")} onClick={() => onSelect({ type: "project", id: project.id })}>
              <Building2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">{project.name}</TooltipContent>
        </Tooltip>

        {project.parentScopes.map(ps => (
          <Tooltip key={ps.id}>
            <TooltipTrigger asChild>
              <button className={cn("p-1.5 rounded-md transition-colors", selection.type === "parentScope" && selection.id === ps.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")} onClick={() => onSelect({ type: "parentScope", id: ps.id })}>
                <Package className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">{ps.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    );
  }

  /* ── Full tree ── */
  return (
    <div className="flex flex-col h-full border-r border-border bg-card">
      {/* Header with collapse button */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search scope…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => onCollapsedChange?.(true)} title="Collapse panel">
            <PanelLeftClose className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {filters.map(f => (
            <button key={f.key} onClick={() => toggleFilter(f.key)}
              className={cn("text-[10px] px-2 py-0.5 rounded-full border transition-colors",
                activeFilters.has(f.key) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted")}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button onClick={expandAll} className="text-[10px] text-muted-foreground hover:text-foreground">Expand All</button>
          <span className="text-[10px] text-muted-foreground">·</span>
          <button onClick={collapseAll} className="text-[10px] text-muted-foreground hover:text-foreground">Collapse All</button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        <TreeNode icon={<Building2 className="h-3.5 w-3.5 text-primary" />} label={project.name} depth={0} isExpanded={expanded.has(project.id)}
          isSelected={selection.type === "project" && selection.id === project.id}
          onToggle={() => toggleExpand(project.id)} onSelect={() => onSelect({ type: "project", id: project.id })} hasChildren />

        {expanded.has(project.id) && project.parentScopes.map(ps => {
          const psIssues = countIssuesInScope(ps);
          const psVisible = matchesSearch(ps.name) || ps.trades.some(t => matchesSearch(t.name) || t.assemblies.some(a => matchesSearch(a.name) || a.lineItems.some(li => matchesSearch(li.name))));
          if (!psVisible) return null;
          return (
            <div key={ps.id}>
              <TreeNode icon={<Package className="h-3.5 w-3.5 text-primary/70" />} label={ps.name} depth={1} badge={psIssues > 0 ? psIssues : undefined}
                childCount={ps.trades.length} isExpanded={expanded.has(ps.id)} isSelected={selection.type === "parentScope" && selection.id === ps.id}
                onToggle={() => toggleExpand(ps.id)} onSelect={() => onSelect({ type: "parentScope", id: ps.id })} hasChildren />

              {expanded.has(ps.id) && ps.trades.map(tr => {
                const trIssues = countIssuesInTrade(tr);
                if (!matchesSearch(tr.name) && !tr.assemblies.some(a => matchesSearch(a.name) || a.lineItems.some(li => matchesSearch(li.name)))) return null;
                return (
                  <div key={tr.id}>
                    <TreeNode icon={<Layers className="h-3 w-3 text-muted-foreground" />} label={tr.name} depth={2} badge={trIssues > 0 ? trIssues : undefined}
                      childCount={tr.assemblies.length} isExpanded={expanded.has(tr.id)} isSelected={selection.type === "trade" && selection.id === tr.id}
                      onToggle={() => toggleExpand(tr.id)} onSelect={() => onSelect({ type: "trade", id: tr.id })} hasChildren />

                    {expanded.has(tr.id) && tr.assemblies.map(asm => {
                      const asmIssues = asm.lineItems.filter(li => li.issues.length > 0).length;
                      if (!matchesSearch(asm.name) && !asm.lineItems.some(li => matchesSearch(li.name))) return null;
                      return (
                        <div key={asm.id}>
                          <TreeNode icon={<Box className="h-3 w-3 text-muted-foreground" />} label={asm.name} depth={3} badge={asmIssues > 0 ? asmIssues : undefined}
                            childCount={asm.lineItems.length} isExpanded={expanded.has(asm.id)} isSelected={selection.type === "assembly" && selection.id === asm.id}
                            onToggle={() => toggleExpand(asm.id)} onSelect={() => onSelect({ type: "assembly", id: asm.id })} hasChildren />

                          {expanded.has(asm.id) && asm.lineItems.filter(li => {
                            if (!matchesSearch(li.name)) return false;
                            if (!lineItemPassesFilters(li)) return false;
                            return true;
                          }).map(li => (
                            <TreeNode key={li.id} icon={<FileText className="h-2.5 w-2.5 text-muted-foreground" />} label={li.name} depth={4}
                              isSelected={selection.type === "lineItem" && selection.id === li.id}
                              onSelect={() => onSelect({ type: "lineItem", id: li.id })}
                              reviewStatus={li.reviewStatus} issues={li.issues} confidence={li.confidence}
                              missingTakeoff={li.takeoffs.length === 0} missingCostCode={li.companyCostCodeStatus === "missing"} />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TreeNodeProps {
  icon: React.ReactNode;
  label: string;
  depth: number;
  childCount?: number;
  badge?: number;
  isExpanded?: boolean;
  isSelected: boolean;
  hasChildren?: boolean;
  onToggle?: () => void;
  onSelect: () => void;
  reviewStatus?: string;
  issues?: string[];
  confidence?: string;
  missingTakeoff?: boolean;
  missingCostCode?: boolean;
}

function TreeNode({ icon, label, depth, childCount, badge, isExpanded, isSelected, hasChildren, onToggle, onSelect, reviewStatus, issues, missingTakeoff, missingCostCode }: TreeNodeProps) {
  const padLeft = 8 + depth * 16;
  return (
    <div className={cn("flex items-center gap-1.5 py-1 px-2 cursor-pointer group transition-colors text-xs",
      isSelected ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground")}
      style={{ paddingLeft: `${padLeft}px` }}
      onClick={onSelect}>
      {hasChildren ? (
        <button onClick={e => { e.stopPropagation(); onToggle?.(); }} className="p-0.5 hover:bg-muted rounded shrink-0">
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
      ) : <span className="w-4" />}
      {icon}
      <span className="truncate flex-1">{label}</span>
      {childCount !== undefined && <span className="text-[10px] text-muted-foreground shrink-0">{childCount}</span>}
      {badge !== undefined && badge > 0 && (
        <span className="text-[9px] bg-destructive text-destructive-foreground rounded-full px-1.5 py-0 leading-4 shrink-0">{badge}</span>
      )}
      {missingTakeoff && <span className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" title="Missing takeoff" />}
      {missingCostCode && <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" title="Missing cost code" />}
      {reviewStatus === "Approved" && <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />}
    </div>
  );
}
