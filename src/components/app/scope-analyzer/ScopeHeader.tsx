import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Save, Play, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ScopeProject, VersionStatus } from "@/data/scopeAnalyzerData";
import { countItems } from "@/data/scopeAnalyzerData";

interface Props {
  project: ScopeProject;
  onRunAnalysis: () => void;
  onSaveDraft: () => void;
  onLockScope: () => void;
}

const statusColors: Record<VersionStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  "In Review": "bg-warning/15 text-warning border-warning/30",
  Ready: "bg-success/15 text-success border-success/30",
  Locked: "bg-primary/15 text-primary border-primary/30",
};

export function ScopeHeader({ project, onRunAnalysis, onSaveDraft, onLockScope }: Props) {
  const stats = countItems(project);
  const canLock = stats.needsReview === 0 && stats.missingCostCodes === 0;

  const pills = [
    { label: "Parent Scopes", value: stats.parentScopes },
    { label: "Trades", value: stats.trades },
    { label: "Assemblies", value: stats.assemblies },
    { label: "Line Items", value: stats.lineItems },
    { label: "Needs Review", value: stats.needsReview, warn: stats.needsReview > 0 },
    { label: "Missing Codes", value: stats.missingCostCodes, warn: stats.missingCostCodes > 0 },
    { label: "Low Confidence", value: stats.lowConfidence, warn: stats.lowConfidence > 0 },
    { label: "Missing Takeoffs", value: stats.missingTakeoffs, warn: stats.missingTakeoffs > 0 },
  ];

  return (
    <div className="border-b border-border bg-card">
      {/* Main header row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground font-heading">Scope Analyzer</h1>
            <Badge variant="outline" className={statusColors[project.status]}>{project.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Structure the full project scope, connect sources, add takeoffs, and route scope downstream.</p>
        </div>

        <div className="flex items-center gap-2">
          <Select defaultValue={project.id}>
            <SelectTrigger className="h-8 w-[220px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={project.id}>{project.name}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={onRunAnalysis}>
            <Play className="h-3 w-3" /> Run Analysis
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={onSaveDraft}>
            <Save className="h-3 w-3" /> Save Draft
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button size="sm" className="h-8 text-xs gap-1.5" onClick={onLockScope} disabled={!canLock}>
                  <Lock className="h-3 w-3" /> Lock Scope
                </Button>
              </span>
            </TooltipTrigger>
            {!canLock && (
              <TooltipContent side="bottom" className="text-xs max-w-xs">
                <p>Cannot lock scope:</p>
                <ul className="list-disc pl-4 mt-1">
                  {stats.needsReview > 0 && <li>{stats.needsReview} items need review</li>}
                  {stats.missingCostCodes > 0 && <li>{stats.missingCostCodes} items missing cost codes</li>}
                </ul>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>

    </div>
  );
}
