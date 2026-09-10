import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Save } from "lucide-react";
import type { ScopeProject } from "@/data/scopeAnalyzerData";

interface Props {
  project: ScopeProject;
  extracted: number;
  needsReview: number;
  structured: number;
  scaleDerived: number;
  lowConfidence: number;
  openIssues: number;
  onRunAnalysis: () => void;
  onSaveDraft: () => void;
}

export function ScopeHeader({ project, extracted, needsReview, structured, scaleDerived, lowConfidence, openIssues, onRunAnalysis, onSaveDraft }: Props) {
  return <header className="border-b border-border">
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <div className="min-w-0"><div className="flex items-center gap-2.5"><h1 className="font-heading text-lg font-semibold">Scope Analyzer</h1><Badge variant="outline" className="rounded-md bg-muted/50 text-[10px] text-muted-foreground">{project.status}</Badge></div><p className="mt-0.5 text-xs text-muted-foreground">Validate plan quantities, resolve judgment calls, and structure scope for estimating.</p></div>
      <div className="flex items-center gap-2"><Select defaultValue={project.id}><SelectTrigger className="h-8 w-[220px] text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={project.id}>{project.name}</SelectItem></SelectContent></Select><Button variant="outline" size="sm" className="h-8 text-xs" onClick={onRunAnalysis}><Play /> Run Analysis</Button><Button variant="outline" size="sm" className="h-8 text-xs" onClick={onSaveDraft}><Save /> Save Draft</Button></div>
    </div>
  </header>;
}
