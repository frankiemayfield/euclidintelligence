import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, FileText, Flag, Layers3, Merge, Plus, Ruler, Split, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { companyCostCodes, type IssueFlag, type LineItem, type ReviewStatus } from "@/data/scopeAnalyzerData";

export type ScopeTrack = "builder" | "sub";
export type ScopeTab = "takeoff" | "review" | "structure" | "package";
export type StructureState = Record<string, { trade?: string; mappedTo?: string; section?: string; deferred?: boolean }>;

export interface ReviewDecision {
  id: string;
  action: string;
  resolved: boolean;
}

interface CommonProps {
  items: LineItem[];
  selected: Set<string>;
  onSelectedChange: (selected: Set<string>) => void;
  onOpenPlan: (item: LineItem) => void;
  onReviewChange: (id: string, status: ReviewStatus, issues?: IssueFlag[]) => void;
}

const methodLabel = (item: LineItem) => {
  const method = item.takeoffs[0]?.method;
  if (!method) return item.sources.length ? "Explicit" : "Assumption";
  return method === "count" ? "Count" : method === "area" || method === "linear" || method === "volume" || method === "polygon" ? "Scale-Derived" : "Explicit";
};

const sheetLabel = (item: LineItem) => item.sources[0]?.sheetName || item.takeoffs[0]?.sourcePage || "—";
const statusTone = (status: ReviewStatus) => status === "Approved" ? "text-success border-success/30 bg-success/10" : status === "Reviewed" ? "text-info border-info/30 bg-info/10" : "text-warning border-warning/30 bg-warning/10";
const confidenceTone = (confidence: LineItem["confidence"]) => confidence === "High" ? "text-success" : confidence === "Medium" ? "text-warning" : "text-destructive";

function useExpanded() {
  const [expanded, setExpanded] = useState<string | null>(null);
  return { expanded, toggle: (id: string) => setExpanded(current => current === id ? null : id) };
}

function SelectionBar({ count, children, onClear }: { count: number; children: React.ReactNode; onClear: () => void }) {
  if (!count) return null;
  return (
    <div className="mb-3 flex min-h-11 items-center gap-2 border-y border-primary/20 bg-primary/5 px-3 py-2">
      <span className="text-xs font-semibold text-primary">{count} selected</span>
      <div className="ml-auto flex flex-wrap items-center justify-end gap-1">{children}</div>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClear} aria-label="Clear selection"><X /></Button>
    </div>
  );
}

function FilterChips<T extends string>({ options, value, onChange }: { options: { value: T; label: string; count?: number }[]; value: T; onChange: (value: T) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {options.map(option => (
        <Button key={option.value} type="button" variant="ghost" size="sm" onClick={() => onChange(option.value)}
          className={cn("h-7 rounded-md border border-transparent px-2.5 text-[11px] font-medium text-muted-foreground", value === option.value && "border-border bg-muted/70 text-foreground")}>
          {option.label}{option.count !== undefined ? ` (${option.count})` : ""}
        </Button>
      ))}
    </div>
  );
}

type TakeoffFilter = "all" | "explicit" | "scale" | "low" | "review";

export function QuantityTakeoffView(props: CommonProps) {
  const { items, selected, onSelectedChange, onOpenPlan, onReviewChange } = props;
  const [filter, setFilter] = useState<TakeoffFilter>("all");
  const { expanded, toggle } = useExpanded();
  const counts = useMemo(() => ({
    all: items.length,
    explicit: items.filter(item => methodLabel(item) === "Explicit").length,
    scale: items.filter(item => methodLabel(item) === "Scale-Derived").length,
    low: items.filter(item => item.confidence === "Low").length,
    review: items.filter(item => item.reviewStatus === "Needs Review").length,
  }), [items]);
  const filtered = items.filter(item => filter === "all" || (filter === "explicit" && methodLabel(item) === "Explicit") || (filter === "scale" && methodLabel(item) === "Scale-Derived") || (filter === "low" && item.confidence === "Low") || (filter === "review" && item.reviewStatus === "Needs Review"));
  const toggleSelected = (id: string) => onSelectedChange(new Set(selected.has(id) ? [...selected].filter(value => value !== id) : [...selected, id]));
  const toggleAll = () => onSelectedChange(selected.size === filtered.length ? new Set() : new Set(filtered.map(item => item.id)));

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
        <FilterChips<TakeoffFilter> value={filter} onChange={setFilter} options={[
          { value: "all", label: "All", count: counts.all }, { value: "explicit", label: "Explicit", count: counts.explicit },
          { value: "scale", label: "Scale-Derived", count: counts.scale }, { value: "low", label: "Low Confidence", count: counts.low },
          { value: "review", label: "Needs Review", count: counts.review },
        ]} />
        <span className="text-[11px] text-muted-foreground">What Euclid believes exists in the plans</span>
      </div>
      <SelectionBar count={selected.size} onClear={() => onSelectedChange(new Set())}>
        <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => selected.forEach(id => onReviewChange(id, "Reviewed"))}><CheckCircle2 /> Confirm</Button>
        <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => selected.forEach(id => onReviewChange(id, "Needs Review"))}><Flag /> Flag</Button>
      </SelectionBar>
      <div className="min-h-0 flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-10 w-10 px-3"><Checkbox checked={filtered.length > 0 && selected.size === filtered.length} onCheckedChange={toggleAll} /></TableHead>
              <TableHead className="h-10 w-8 px-1" />
              <TableHead className="h-10">Description</TableHead><TableHead className="h-10 w-20 text-right">Qty</TableHead><TableHead className="h-10 w-16">Unit</TableHead>
              <TableHead className="h-10 w-36">Sheet / Plan Reference</TableHead><TableHead className="h-10 w-32">Method</TableHead><TableHead className="h-10 w-24">Confidence</TableHead><TableHead className="h-10 w-28">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(item => (
              <TakeoffRows key={item.id} item={item} isExpanded={expanded === item.id} isSelected={selected.has(item.id)} onToggle={() => toggle(item.id)} onSelect={() => toggleSelected(item.id)} onOpenPlan={() => onOpenPlan(item)} onReviewChange={onReviewChange} />
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function TakeoffRows({ item, isExpanded, isSelected, onToggle, onSelect, onOpenPlan, onReviewChange }: { item: LineItem; isExpanded: boolean; isSelected: boolean; onToggle: () => void; onSelect: () => void; onOpenPlan: () => void; onReviewChange: CommonProps["onReviewChange"] }) {
  const source = item.sources[0];
  const takeoff = item.takeoffs[0];
  const formula = takeoff ? `${takeoff.quantity.toLocaleString()} ${takeoff.unit} measured on ${takeoff.sourcePage}` : `${item.quantity.toLocaleString()} ${item.unit} from plan notation`;
  const conversion = item.unit === "CY" ? `${(item.quantity * 27).toFixed(1)} CF ÷ 27 = ${item.quantity.toLocaleString()} CY` : `Direct ${item.unit} quantity`;
  return <>
    <TableRow data-state={isSelected ? "selected" : undefined} className="cursor-pointer" onClick={onToggle}>
      <TableCell className="px-3 py-3" onClick={event => event.stopPropagation()}><Checkbox checked={isSelected} onCheckedChange={onSelect} /></TableCell>
      <TableCell className="px-1 py-3">{isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}</TableCell>
      <TableCell className="py-3 font-medium">{item.name}</TableCell><TableCell className="py-3 text-right tabular-nums">{item.quantity.toLocaleString()}</TableCell><TableCell className="py-3 text-muted-foreground">{item.unit}</TableCell>
      <TableCell className="py-3"><button className="flex items-center gap-1.5 text-xs text-info hover:underline" onClick={event => { event.stopPropagation(); onOpenPlan(); }}><FileText className="h-3.5 w-3.5" />{sheetLabel(item)}</button></TableCell>
      <TableCell className="py-3 text-xs text-muted-foreground">{methodLabel(item)}</TableCell><TableCell className={cn("py-3 text-xs font-medium", confidenceTone(item.confidence))}>{item.confidence}</TableCell>
      <TableCell className="py-3"><Badge variant="outline" className={cn("rounded-md text-[10px]", statusTone(item.reviewStatus))}>{item.reviewStatus}</Badge></TableCell>
    </TableRow>
    {isExpanded && <TableRow className="hover:bg-transparent"><TableCell colSpan={9} className="bg-muted/15 px-6 py-5">
      <div className="grid gap-6 lg:grid-cols-3">
        <EvidenceColumn title="Source & Detection">
          <Detail label="Source type" value={source?.sourceType || "Plan analysis"} />
          <Detail label="Sheet reference" value={sheetLabel(item)} />
          <Detail label="Plan reference" value={source ? `${source.fileName} · Page ${source.pageNumber}` : "No source linked"} />
          <p className="text-xs leading-5 text-muted-foreground">Detected from {methodLabel(item).toLowerCase()} evidence and linked to the current plan set.</p>
          <Button variant="outline" size="sm" className="h-7 self-start text-[11px]" onClick={onOpenPlan}><Ruler /> Open in Plan Viewer</Button>
        </EvidenceColumn>
        <EvidenceColumn title="Quantity Derivation">
          <Formula label="Formula" value={formula} />
          <Formula label="Unit Conversion" value={conversion} />
          <Detail label="Waste factor" value={item.notes || "No additional waste factor applied"} />
          <div className="border-t border-border pt-3"><div className="text-[10px] uppercase text-muted-foreground">Final Takeoff Quantity</div><div className="mt-1 text-lg font-semibold tabular-nums">{item.quantity.toLocaleString()} {item.unit}</div></div>
        </EvidenceColumn>
        <EvidenceColumn title="Assumptions & Review">
          <p className="text-xs leading-5 text-muted-foreground">{item.notes || (item.confidence === "High" ? "No material assumptions affect this quantity." : `Verify the ${item.euclidCategory.toLowerCase()} basis before finalizing.`)}</p>
          <Detail label="Confidence explanation" value={`${item.confidence} confidence based on ${item.sources.length} linked source${item.sources.length === 1 ? "" : "s"}.`} />
          <Input className="h-8 text-xs" placeholder="Add reviewer note" />
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Button size="sm" className="h-7 text-[11px]" onClick={() => onReviewChange(item.id, "Approved", [])}><Check /> Confirm</Button>
            <Button variant="outline" size="sm" className="h-7 text-[11px]"><Ruler /> Adjust</Button>
            <Button variant="ghost" size="sm" className="h-7 text-[11px] text-warning" onClick={() => onReviewChange(item.id, "Needs Review", item.issues.length ? item.issues : ["Needs Clarification"])}><Flag /> Flag</Button>
          </div>
        </EvidenceColumn>
      </div>
    </TableCell></TableRow>}
  </>;
}

function EvidenceColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-3 border-l border-border pl-4 first:border-l-0 first:pl-0"><h3 className="text-xs font-semibold">{title}</h3>{children}</div>;
}
function Detail({ label, value }: { label: string; value: string }) { return <div><div className="text-[10px] uppercase text-muted-foreground">{label}</div><div className="mt-0.5 text-xs font-medium">{value}</div></div>; }
function Formula({ label, value }: { label: string; value: string }) { return <div className="border-l-2 border-primary bg-primary/5 px-3 py-2"><div className="text-[10px] uppercase text-muted-foreground">{label}</div><div className="mt-1 font-mono text-xs font-semibold text-foreground">{value}</div></div>; }

type ReviewKind = "Assumptions" | "Missing Scope" | "Conflicts" | "Duplicates" | "Exclusion Risks";
interface ReviewItem { id: string; lineItemId: string; kind: ReviewKind; title: string; detail: string; impact: string; }
const issueKind = (issue: IssueFlag): ReviewKind => issue === "Duplicate Item" ? "Duplicates" : issue === "Conflicting Source" ? "Conflicts" : issue === "Missing Source" || issue === "Missing Takeoff" || issue === "Missing Cost Code" ? "Missing Scope" : issue === "Needs Clarification" ? "Exclusion Risks" : "Assumptions";

function reviewItems(items: LineItem[]): ReviewItem[] {
  const result: ReviewItem[] = items.flatMap(item => item.issues.map((issue, index) => ({ id: `${item.id}-${index}`, lineItemId: item.id, kind: issueKind(issue), title: issue, detail: `${item.name} requires human review before it flows downstream.`, impact: `Impacts ${item.name}` })));
  items.filter(item => item.reviewStatus === "Needs Review" && item.issues.length === 0).forEach(item => result.push({ id: `${item.id}-assumption`, lineItemId: item.id, kind: "Assumptions", title: `${item.euclidCategory} basis requires confirmation`, detail: item.notes || `Verify the plan-derived quantity and assumptions for ${item.name}.`, impact: "Impacts 1 takeoff item" }));
  return result;
}

export function ReviewView({ items, decisions, onDecision }: { items: LineItem[]; decisions: ReviewDecision[]; onDecision: (item: ReviewItem, action: string) => void }) {
  const [filter, setFilter] = useState<"All" | ReviewKind | "Resolved">("All");
  const queue = useMemo(() => reviewItems(items), [items]);
  const resolved = new Set(decisions.filter(decision => decision.resolved).map(decision => decision.id));
  const visible = queue.filter(item => filter === "Resolved" ? resolved.has(item.id) : !resolved.has(item.id) && (filter === "All" || item.kind === filter));
  const counts = (kind: ReviewKind) => queue.filter(item => item.kind === kind && !resolved.has(item.id)).length;
  return <section className="flex min-h-0 flex-1 flex-col">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
      <FilterChips<"All" | ReviewKind | "Resolved"> value={filter} onChange={setFilter} options={[
        { value: "All", label: "All", count: queue.length - resolved.size }, { value: "Assumptions", label: "Assumptions", count: counts("Assumptions") },
        { value: "Missing Scope", label: "Missing Scope", count: counts("Missing Scope") }, { value: "Conflicts", label: "Conflicts", count: counts("Conflicts") },
        { value: "Duplicates", label: "Duplicates", count: counts("Duplicates") }, { value: "Exclusion Risks", label: "Exclusion Risks", count: counts("Exclusion Risks") },
        { value: "Resolved", label: "Resolved", count: resolved.size },
      ]} />
      <span className="text-[11px] text-muted-foreground">Human judgment required before scope is trusted</span>
    </div>
    <div className="min-h-0 flex-1 divide-y divide-border overflow-auto">
      {visible.map(item => <ReviewRow key={item.id} item={item} resolved={resolved.has(item.id)} onDecision={onDecision} />)}
      {!visible.length && <div className="flex h-48 flex-col items-center justify-center text-center"><CheckCircle2 className="mb-2 h-7 w-7 text-success" /><p className="text-sm font-medium">No items in this view</p><p className="text-xs text-muted-foreground">Resolved decisions remain available in the Resolved filter.</p></div>}
    </div>
  </section>;
}

function ReviewRow({ item, resolved, onDecision }: { item: ReviewItem; resolved: boolean; onDecision: (item: ReviewItem, action: string) => void }) {
  const actions: Record<ReviewKind, string[]> = { Assumptions: ["Confirm", "Adjust"], "Missing Scope": ["Add to Scope", "Clarify", "Exclude"], Conflicts: ["Review Sources", "Select Preferred Source", "Flag"], Duplicates: ["Merge", "Keep Separate", "Exclude"], "Exclusion Risks": ["Include", "Exclude", "Clarify"] };
  return <article className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
    <div className="flex min-w-0 gap-3">
      <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning", resolved && "bg-success/10 text-success")}>{resolved ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}</div>
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-semibold uppercase text-muted-foreground">{item.kind}</span>{resolved && <Badge variant="outline" className="rounded-md border-success/30 bg-success/10 text-[9px] text-success">Resolved</Badge>}</div><h3 className="mt-1 text-sm font-semibold">{item.title}</h3><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p><p className="mt-1 text-[10px] text-muted-foreground">{item.impact}</p></div>
    </div>
    {!resolved && <div className="flex flex-wrap justify-end gap-1.5">{actions[item.kind].map((action, index) => <Button key={action} variant={index === 0 ? "outline" : "ghost"} size="sm" className="h-7 text-[11px]" onClick={() => onDecision(item, action)}>{action}</Button>)}</div>}
  </article>;
}

interface StructureProps extends CommonProps { track: ScopeTrack; structure: StructureState; onStructureChange: (id: string, patch: StructureState[string]) => void; onContinue: () => void; }
export function StructureView({ items, track, selected, onSelectedChange, onOpenPlan, structure, onStructureChange, onContinue }: StructureProps) {
  const { expanded, toggle } = useExpanded();
  const mappedCount = items.filter(item => item.companyCostCode || structure[item.id]?.mappedTo).length;
  const toggleSelected = (id: string) => onSelectedChange(new Set(selected.has(id) ? [...selected].filter(value => value !== id) : [...selected, id]));
  const applySelected = (patch: StructureState[string]) => selected.forEach(id => onStructureChange(id, patch));
  return <section className="flex min-h-0 flex-1 flex-col">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
      <div><p className="text-xs font-medium">{track === "builder" ? "Turn validated scope into estimate-ready structure." : "Turn validated quantities into quote-ready line items."}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{mappedCount} of {items.length} items mapped</p></div>
      <div className="flex flex-wrap gap-1.5"><Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={() => items.filter(item => !item.companyCostCode).forEach(item => onStructureChange(item.id, { mappedTo: item.euclidCategory, section: "Base Scope" }))}>Auto-map unassigned</Button><Button variant="outline" size="sm" className="h-8 text-[11px]">Apply defaults</Button><Button size="sm" className="h-8 text-[11px]" onClick={onContinue}>{track === "builder" ? "Continue to Bid Packages" : "Continue to Bid Package"}<ArrowRight /></Button></div>
    </div>
    <SelectionBar count={selected.size} onClear={() => onSelectedChange(new Set())}>
      <Button variant="ghost" size="sm" className="h-7 text-[11px]"><Plus /> Create line item</Button><Button variant="ghost" size="sm" className="h-7 text-[11px]"><Layers3 /> Add to existing</Button><Button variant="ghost" size="sm" className="h-7 text-[11px]"><Merge /> Merge</Button><Button variant="ghost" size="sm" className="h-7 text-[11px]"><Split /> Split</Button><Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => applySelected({ deferred: true })}><CircleHelp /> Defer</Button>
    </SelectionBar>
    <div className="min-h-0 flex-1 overflow-auto"><Table><TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl"><TableRow className="hover:bg-transparent">
      <TableHead className="h-10 w-10 px-3"><Checkbox checked={selected.size === items.length && items.length > 0} onCheckedChange={() => onSelectedChange(selected.size === items.length ? new Set() : new Set(items.map(item => item.id)))} /></TableHead><TableHead className="h-10 w-8 px-1" /><TableHead className="h-10">Scope Item</TableHead><TableHead className="h-10 w-28">Qty</TableHead><TableHead className="h-10 w-44">{track === "builder" ? "Trade" : "Category"}</TableHead><TableHead className="h-10 w-48">{track === "builder" ? "Cost Code" : "Mapped To"}</TableHead><TableHead className="h-10 w-40">{track === "builder" ? "Estimate Section" : "Quote Section"}</TableHead><TableHead className="h-10 w-24">Status</TableHead>
    </TableRow></TableHeader><TableBody>{items.map(item => <StructureRows key={item.id} item={item} track={track} values={structure[item.id] || {}} isExpanded={expanded === item.id} isSelected={selected.has(item.id)} onToggle={() => toggle(item.id)} onSelect={() => toggleSelected(item.id)} onChange={patch => onStructureChange(item.id, patch)} onOpenPlan={() => onOpenPlan(item)} />)}</TableBody></Table></div>
  </section>;
}

function StructureRows({ item, track, values, isExpanded, isSelected, onToggle, onSelect, onChange, onOpenPlan }: { item: LineItem; track: ScopeTrack; values: StructureState[string]; isExpanded: boolean; isSelected: boolean; onToggle: () => void; onSelect: () => void; onChange: (patch: StructureState[string]) => void; onOpenPlan: () => void }) {
  const trade = values.trade || item.euclidCategory;
  const mappedTo = values.mappedTo || item.companyCostCode || "Unassigned";
  const section = values.section || (track === "builder" ? "Base Estimate" : "Base Scope");
  return <>
    <TableRow data-state={isSelected ? "selected" : undefined} className="cursor-pointer" onClick={onToggle}><TableCell className="px-3 py-3" onClick={event => event.stopPropagation()}><Checkbox checked={isSelected} onCheckedChange={onSelect} /></TableCell><TableCell className="px-1 py-3">{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</TableCell><TableCell className="py-3 font-medium">{item.name}</TableCell><TableCell className="py-3 tabular-nums">{item.quantity.toLocaleString()} {item.unit}</TableCell><TableCell className="py-3 text-xs">{trade}</TableCell><TableCell className="py-3 text-xs">{mappedTo}</TableCell><TableCell className="py-3 text-xs">{section}</TableCell><TableCell className="py-3"><Badge variant="outline" className={cn("rounded-md text-[9px]", values.deferred ? "text-muted-foreground" : mappedTo === "Unassigned" ? "border-warning/30 text-warning" : "border-success/30 text-success")}>{values.deferred ? "Deferred" : mappedTo === "Unassigned" ? "Unmapped" : "Mapped"}</Badge></TableCell></TableRow>
    {isExpanded && <TableRow className="hover:bg-transparent"><TableCell colSpan={8} className="bg-muted/15 px-6 py-5"><div className="grid gap-6 lg:grid-cols-3">
      <EvidenceColumn title="Mapping"><Select value={trade} onValueChange={value => onChange({ trade: value })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{[item.euclidCategory, "Concrete", "Framing", "Roofing", "Openings", "General Conditions"].filter((value, index, all) => all.indexOf(value) === index).map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select><Select value={mappedTo} onValueChange={value => onChange({ mappedTo: value })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Unassigned">Unassigned</SelectItem>{companyCostCodes.slice(0, 12).map(code => <SelectItem key={code.code} value={track === "builder" ? code.code : `${code.name} — Labor & Material`}>{track === "builder" ? `${code.code} · ${code.name}` : `${code.name} — Labor & Material`}</SelectItem>)}</SelectContent></Select><Select value={section} onValueChange={value => onChange({ section: value })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{(track === "builder" ? ["Base Estimate", "Alternate", "Allowance"] : ["Base Scope", "Alternate", "Allowance", "Exclusion", "Clarification"]).map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></EvidenceColumn>
      <EvidenceColumn title="Source"><Detail label="Sheet" value={sheetLabel(item)} /><Detail label="Source" value={item.sources[0]?.fileName || "No source linked"} /><Detail label="Confidence" value={item.confidence} /><Button variant="ghost" size="sm" className="h-7 self-start px-0 text-[11px] text-info" onClick={onOpenPlan}>View derivation link <ArrowRight /></Button></EvidenceColumn>
      <EvidenceColumn title={track === "builder" ? "Actions" : "Advanced Mapping"}>{track === "sub" && <><Detail label="Company code" value={item.companyCostCode || "Optional"} /><Detail label="CSI export mapping" value={item.csiDivision || "Optional"} /></>}<div className="flex flex-wrap gap-1.5"><Button size="sm" className="h-7 text-[11px]"><Check /> Apply Mapping</Button><Button variant="outline" size="sm" className="h-7 text-[11px]"><Merge /> Merge</Button><Button variant="outline" size="sm" className="h-7 text-[11px]"><Split /> Split</Button><Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => onChange({ deferred: true })}>Defer</Button></div></EvidenceColumn>
    </div></TableCell></TableRow>}
  </>;
}

export function BidPackageView({ items, structure, decisions, onBuild }: { items: LineItem[]; structure: StructureState; decisions: ReviewDecision[]; onBuild: () => void }) {
  const included = items.filter(item => !structure[item.id]?.deferred);
  const exclusions = decisions.filter(decision => decision.action === "Exclude");
  const clarifications = decisions.filter(decision => decision.action === "Clarify");
  return <section className="min-h-0 flex-1 overflow-auto">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3"><div><p className="text-xs font-medium">Exactly what am I bidding?</p><p className="mt-0.5 text-[11px] text-muted-foreground">Your validated quote scope, ready for estimating.</p></div><Button size="sm" className="h-8 text-[11px]" onClick={onBuild}>Build Estimate <ArrowRight /></Button></div>
    <div className="grid gap-x-8 gap-y-6 p-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
      <div><h2 className="mb-3 text-sm font-semibold">Mapped quote line items</h2><div className="divide-y divide-border border-y border-border">{included.map(item => <div key={item.id} className="grid grid-cols-[1fr_auto_auto] gap-4 py-3 text-xs"><div><p className="font-medium">{item.name}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{structure[item.id]?.mappedTo || item.euclidCategory}</p></div><span className="tabular-nums">{item.quantity.toLocaleString()} {item.unit}</span><span className="text-muted-foreground">{structure[item.id]?.section || "Base Scope"}</span></div>)}</div></div>
      <div className="space-y-5"><PackageSection title="Scope summary" items={[`${included.length} mapped line items`, `${items.filter(item => item.reviewStatus === "Approved").length} confirmed quantities`, `${items.filter(item => item.reviewStatus === "Needs Review").length} items still need review`]} /><PackageSection title="Inclusions" items={["Labor and material for mapped base scope", "Plan-referenced quantities", "Project defaults and trade assumptions"]} /><PackageSection title="Exclusions" items={exclusions.length ? exclusions.map(item => item.action) : ["No exclusions recorded"]} /><PackageSection title="Clarifications & RFIs" items={clarifications.length ? clarifications.map(item => item.action) : ["1 unresolved clarification", "Verify final field dimensions"]} /><PackageSection title="Allowances & alternates" items={[`${Object.values(structure).filter(value => value.section === "Allowance").length} allowances`, `${Object.values(structure).filter(value => value.section === "Alternate").length} alternates`]} /></div>
    </div>
  </section>;
}
function PackageSection({ title, items }: { title: string; items: string[] }) { return <div><h3 className="mb-2 text-xs font-semibold">{title}</h3><ul className="space-y-1.5">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-2 text-xs text-muted-foreground"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />{item}</li>)}</ul></div>; }
