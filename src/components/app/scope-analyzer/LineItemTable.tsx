import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, Eye, FileText, Ruler, Send, Trash2, Tag, Merge } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LineItem, ConfidenceLevel, ReviewStatus, IssueFlag } from "@/data/scopeAnalyzerData";
import { CSI_DIVISIONS, companyCostCodes } from "@/data/scopeAnalyzerData";
import type { TreeSelection } from "./ScopeHierarchyTree";

interface Props {
  lineItems: LineItem[];
  onSelectItem: (sel: TreeSelection) => void;
  compact?: boolean;
}

const confColors: Record<ConfidenceLevel, string> = {
  High: "bg-success/15 text-success border-success/30",
  Medium: "bg-warning/15 text-warning border-warning/30",
  Low: "bg-destructive/15 text-destructive border-destructive/30",
};

const reviewIcons: Record<ReviewStatus, { icon: typeof CheckCircle2; color: string }> = {
  "Needs Review": { icon: AlertTriangle, color: "text-warning" },
  Reviewed: { icon: Eye, color: "text-info" },
  Approved: { icon: CheckCircle2, color: "text-success" },
};

export function LineItemTable({ lineItems, onSelectItem, compact }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    if (selected.size === lineItems.length) setSelected(new Set());
    else setSelected(new Set(lineItems.map(l => l.id)));
  };

  return (
    <div>
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg mb-2">
          <span className="text-xs font-medium text-primary">{selected.size} selected</span>
          <div className="flex gap-1 ml-auto">
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1"><CheckCircle2 className="h-3 w-3" /> Mark Reviewed</Button>
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1"><Tag className="h-3 w-3" /> Assign Code</Button>
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1"><Send className="h-3 w-3" /> To Bid Package</Button>
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1"><Send className="h-3 w-3" /> To Estimate</Button>
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-destructive"><Trash2 className="h-3 w-3" /> Delete</Button>
          </div>
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-8 px-2"><Checkbox checked={selected.size === lineItems.length && lineItems.length > 0} onCheckedChange={toggleAll} /></TableHead>
              <TableHead className="w-8 px-1 text-[10px]">Status</TableHead>
              <TableHead className="text-[10px]">Line Item</TableHead>
              <TableHead className="text-[10px] w-16">Qty</TableHead>
              <TableHead className="text-[10px] w-12">Unit</TableHead>
              {!compact && <TableHead className="text-[10px]">Euclid Category</TableHead>}
              <TableHead className="text-[10px]">Company Code</TableHead>
              {!compact && <TableHead className="text-[10px]">CSI Division</TableHead>}
              <TableHead className="text-[10px] w-12">Src</TableHead>
              <TableHead className="text-[10px] w-12">TO</TableHead>
              <TableHead className="text-[10px] w-16">Conf.</TableHead>
              <TableHead className="text-[10px]">Issues</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map(li => {
              const Rev = reviewIcons[li.reviewStatus];
              return (
                <TableRow key={li.id} className={cn("cursor-pointer", selected.has(li.id) && "bg-primary/5")}
                  onClick={() => onSelectItem({ type: "lineItem", id: li.id })}>
                  <TableCell className="px-2" onClick={e => e.stopPropagation()}>
                    <Checkbox checked={selected.has(li.id)} onCheckedChange={() => toggleSelect(li.id)} />
                  </TableCell>
                  <TableCell className="px-1">
                    <Rev.icon className={cn("h-3.5 w-3.5", Rev.color)} />
                  </TableCell>
                  <TableCell className="text-xs font-medium">{li.name}</TableCell>
                  <TableCell className="text-xs tabular-nums">{li.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{li.unit}</TableCell>
                  {!compact && <TableCell className="text-xs text-muted-foreground">{li.euclidCategory}</TableCell>}
                  <TableCell>
                    <CostCodeCell li={li} />
                  </TableCell>
                  {!compact && <TableCell className="text-[10px] text-muted-foreground max-w-[140px] truncate">{li.csiDivision || "—"}</TableCell>}
                  <TableCell className="text-xs text-center">{li.sources.length || "—"}</TableCell>
                  <TableCell className="text-xs text-center">{li.takeoffs.length || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", confColors[li.confidence])}>{li.confidence}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5 flex-wrap">
                      {li.issues.map((issue, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0 rounded-full bg-destructive/10 text-destructive border border-destructive/20">{issue}</span>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CostCodeCell({ li }: { li: LineItem }) {
  if (li.companyCostCodeStatus === "mapped") {
    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/20">{li.companyCostCode}</span>;
  }
  if (li.companyCostCodeStatus === "suggested") {
    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning border border-warning/20">{li.companyCostCode} (suggested)</span>;
  }
  return <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">Missing</span>;
}
