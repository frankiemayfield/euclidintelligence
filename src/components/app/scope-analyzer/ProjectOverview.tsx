import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, AlertTriangle, CheckCircle2, FileSearch, Package, Layers, Box, FileText } from "lucide-react";
import type { ScopeProject, ParentScope } from "@/data/scopeAnalyzerData";
import { countItems, getParentScopeStats } from "@/data/scopeAnalyzerData";
import type { TreeSelection } from "./ScopeHierarchyTree";

interface Props {
  project: ScopeProject;
  onNavigate: (sel: TreeSelection) => void;
}

export function ProjectOverview({ project, onNavigate }: Props) {
  const stats = countItems(project);
  const overallReviewed = stats.lineItems > 0 ? Math.round(((stats.lineItems - stats.needsReview) / stats.lineItems) * 100) : 0;

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* Readiness Summary */}
      <div className="grid grid-cols-4 gap-3">
        <SummaryCard icon={<CheckCircle2 className="h-4 w-4 text-success" />} label="Overall Reviewed" value={`${overallReviewed}%`} sub={`${stats.lineItems - stats.needsReview} / ${stats.lineItems} items`} />
        <SummaryCard icon={<AlertTriangle className="h-4 w-4 text-warning" />} label="Needs Review" value={stats.needsReview.toString()} sub="line items" warn={stats.needsReview > 0} />
        <SummaryCard icon={<FileSearch className="h-4 w-4 text-destructive" />} label="Missing Codes" value={stats.missingCostCodes.toString()} sub="unmapped items" warn={stats.missingCostCodes > 0} />
        <SummaryCard icon={<FileText className="h-4 w-4 text-info" />} label="Missing Takeoffs" value={stats.missingTakeoffs.toString()} sub="items without measurement" warn={stats.missingTakeoffs > 0} />
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Scope Readiness</span>
          <span>{overallReviewed}%</span>
        </div>
        <Progress value={overallReviewed} className="h-2" />
      </div>

      {/* Parent Scope Cards */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Parent Scopes</h2>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          {project.parentScopes.map(ps => (
            <ParentScopeCard key={ps.id} parentScope={ps} onOpen={() => onNavigate({ type: "parentScope", id: ps.id })} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, sub, warn }: { icon: React.ReactNode; label: string; value: string; sub: string; warn?: boolean }) {
  return (
    <Card className={`${warn ? "border-warning/30" : ""}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
        <div className="text-xl font-semibold text-foreground">{value}</div>
        <div className="text-[10px] text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}

function ParentScopeCard({ parentScope, onOpen }: { parentScope: ParentScope; onOpen: () => void }) {
  const s = getParentScopeStats(parentScope);
  return (
    <Card className="hover:border-primary/30 transition-colors cursor-pointer group" onClick={onOpen}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{parentScope.name}</h3>
            <div className="flex gap-2 mt-1">
              <span className="text-[10px] text-muted-foreground">{s.trades} trades</span>
              <span className="text-[10px] text-muted-foreground">{s.assemblies} assemblies</span>
              <span className="text-[10px] text-muted-foreground">{s.lineItems} items</span>
            </div>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <Progress value={s.reviewedPct} className="h-1.5 mb-2" />
        <div className="flex gap-2 text-[10px]">
          <span className="text-muted-foreground">{s.reviewedPct}% reviewed</span>
          {s.missingTakeoffs > 0 && <span className="text-warning">{s.missingTakeoffs} missing takeoffs</span>}
          {s.missingCostCodes > 0 && <span className="text-destructive">{s.missingCostCodes} missing codes</span>}
          {s.issues > 0 && <span className="text-destructive">{s.issues} issues</span>}
        </div>
      </CardContent>
    </Card>
  );
}
