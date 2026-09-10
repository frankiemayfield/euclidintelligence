import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, CheckCircle2,
  ChevronDown, ChevronRight, Columns3, CreditCard, FileText, Filter, Flag,
  History, Link2, Mail, Maximize2, Minus, MoreHorizontal, Plus, RefreshCw,
  RotateCw, Search, Upload, X,
} from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { getProject, money, projects } from "@/data/demoUniverse";
import {
  budgetLines, commitmentById, commitments, inboxItems, InboxItem, lineById,
  selections,
} from "@/data/financialData";
import { EuclidImpact } from "@/components/app/active/EuclidImpact";
import { Pill } from "@/components/app/financials/FinancialPrimitives";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FinancialsNav } from "./FinancialsNav";

type InboxState = InboxItem["state"];
type QueueFilter = "All" | InboxState | "Exceptions";
type ReviewTab = "document" | "review";
type PostedCost = {
  inboxId: string; projectId?: string; budgetLineId?: string; commitmentId?: string;
  amount: number; status: "Posted"; sync: "Queued";
};

const SOURCES = [
  { label: "Email", icon: Mail },
  { label: "QBO Sync", icon: RefreshCw }, { label: "Card Feed", icon: CreditCard },
  { label: "Manual", icon: FileText },
];
const FILTERS: QueueFilter[] = ["All", "Ready", "Needs Review", "Exceptions", "Posted"];

const stateTone = (state: InboxState) => state === "Ready" ? "good" : state === "Exception" ? "bad" : state === "Posted" ? "muted" : "info";
const sourceLabel = (source: string) => source === "Invoice Upload" || source === "Receipt Upload" ? "Upload" : source;
const documentLabel = (item: InboxItem) => `${item.docType}${item.number ? ` #${item.number}` : ""}`;
const confidenceTone = (value: number) => value >= 90 ? "text-success" : value >= 70 ? "text-foreground" : "text-warning";

function CountTab({ label, count, active, onClick }: { label: QueueFilter; count: number; active: boolean; onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick}
      data-active={active}
      className="financial-segment h-8 gap-1.5 px-2.5 text-[11px] hover:bg-transparent">
      {label}<span className="text-[10px] tabular-nums opacity-70">{count}</span>
    </Button>
  );
}

function QueueStatus({ state }: { state: InboxState }) {
  return <span className={cn(
    "inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
    state === "Ready" && "bg-success/10 text-success",
    state === "Needs Review" && "bg-info/10 text-info",
    state === "Exception" && "bg-warning/12 text-warning",
    state === "Posted" && "bg-muted text-muted-foreground",
  )}>{state}</span>;
}

function DocumentSheet({ item, zoom, rotation }: { item: InboxItem; zoom: number; rotation: number }) {
  return (
    <div className="flex min-h-[430px] items-start justify-center overflow-auto bg-muted/35 p-5 lg:min-h-0 lg:flex-1">
      <article className="w-full max-w-[560px] origin-top bg-card p-7 text-[11px] text-card-foreground shadow-lg transition-transform"
        style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }} aria-label={`Preview of ${documentLabel(item)}`}>
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div><p className="font-display text-lg font-bold">{item.vendor}</p><p className="text-[10px] text-muted-foreground">{documentLabel(item)}</p></div>
          <div className="text-right text-[10px] text-muted-foreground"><p>Date {item.date}</p>{item.dueDate && <p>Due {item.dueDate}</p>}{item.terms && <p>{item.terms}</p>}{item.card && <p>{item.card}</p>}</div>
        </div>
        <table className="mt-4 w-full"><tbody>{item.lines.map((line, index) => (
          <tr key={`${line.description}-${index}`} className="border-b border-border/55"><td className="py-2 pr-3">{line.description}</td><td className="py-2 text-right tabular-nums">{money(line.amount)}</td></tr>
        ))}</tbody></table>
        <div className="ml-auto mt-4 w-48 space-y-1.5">
          <p className="flex justify-between"><span className="text-muted-foreground">Tax</span><b>{money(item.tax)}</b></p>
          <p className="flex justify-between border-t border-border pt-1.5 text-sm"><span>Total</span><b>{money(item.amount)}</b></p>
        </div>
        <p className="mt-7 text-[9px] uppercase tracking-wide text-muted-foreground">Source document · {item.source}</p>
      </article>
    </div>
  );
}

function PreviewPane({ item, onHide }: { item: InboxItem; onHide: () => void }) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  return (
    <section className="flex min-h-0 flex-col overflow-hidden border-r border-border/60" aria-label="Document preview">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border/60 px-3">
        <div className="min-w-0"><p className="truncate text-[11px] font-semibold">{documentLabel(item)}</p><p className="truncate text-[9px] text-muted-foreground">{item.source} · 1 page</p></div>
        <TooltipProvider><div className="flex items-center gap-0.5">
          {[{ label: "Zoom out", icon: Minus, run: () => setZoom(z => Math.max(70, z - 10)) }, { label: "Fit page", icon: Maximize2, run: () => setZoom(100) }, { label: "Zoom in", icon: Plus, run: () => setZoom(z => Math.min(140, z + 10)) }, { label: "Rotate", icon: RotateCw, run: () => setRotation(r => (r + 90) % 360) }].map(action => (
            <Tooltip key={action.label}><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={action.run} className="h-7 w-7"><action.icon size={13} /></Button></TooltipTrigger><TooltipContent>{action.label}</TooltipContent></Tooltip>
          ))}
          <span className="w-10 text-center text-[9px] tabular-nums text-muted-foreground">{zoom}%</span>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onHide} className="h-7 w-7"><X size={13} /></Button></TooltipTrigger><TooltipContent>Hide document</TooltipContent></Tooltip>
        </div></TooltipProvider>
      </div>
      <DocumentSheet item={item} zoom={zoom} rotation={rotation} />
    </section>
  );
}

function DecisionCard({ item, resolvedAction, onAction }: { item: InboxItem; resolvedAction?: string; onAction: (action: string) => void }) {
  if (!item.exception) return null;
  const commitment = commitmentById(item.commitmentId);
  const duplicate = item.exception.kind === "Possible duplicate";
  const overage = item.exception.kind === "Invoice exceeds commitment";
  return (
    <section className="rounded-xl border border-warning/35 bg-warning/10 p-3" aria-label={`${item.exception.kind} decision`}>
      <div className="flex items-start gap-2"><AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" /><div><p className="text-[12px] font-bold">{item.exception.kind}</p><p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{item.exception.detail}</p></div></div>
      {duplicate && <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]"><div className="rounded-lg bg-card/75 p-2"><p className="font-semibold">Incoming</p><p>{item.vendor}</p><p>{documentLabel(item)}</p><b>{money(item.amount)}</b></div><div className="rounded-lg bg-card/75 p-2"><p className="font-semibold">Existing in QBO</p><p>{item.vendor}</p><p>Invoice #{item.number}</p><b>{money(item.amount)}</b></div></div>}
      {overage && commitment && <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px]"><div className="rounded-lg bg-card/75 p-2"><p className="text-muted-foreground">Commitment</p><b>{money(commitment.original + commitment.approvedChanges)}</b></div><div className="rounded-lg bg-card/75 p-2"><p className="text-muted-foreground">After invoice</p><b>{money(commitment.invoiced + item.amount)}</b></div><div className="rounded-lg bg-card/75 p-2"><p className="text-muted-foreground">Over</p><b className="text-warning">{money(Math.max(commitment.invoiced + item.amount - commitment.original - commitment.approvedChanges, 0))}</b></div></div>}
      <div className="mt-3 flex flex-wrap gap-1.5">{item.exception.actions.map((action, index) => <Button key={action} onClick={() => onAction(action)} variant={resolvedAction === action || (!resolvedAction && index === 0) ? "default" : "outline"} size="sm" className="h-7 px-2.5 text-[10px]">{resolvedAction === action && <Check size={10} />}{action}</Button>)}</div>
    </section>
  );
}

function Field({ label, value, options, attention, onChange }: { label: string; value: string; options: Array<string | { value: string; label: string }>; attention?: boolean; onChange?: (value: string) => void }) {
  return (
    <label className={cn("min-w-0 rounded-lg border bg-card/55 p-2", attention ? "border-warning/55" : "border-border/50")}>
      <span className="block text-[9px] uppercase text-muted-foreground">{label}</span>
      <select value={value} onChange={event => onChange?.(event.target.value)} className="mt-0.5 w-full truncate bg-transparent text-[11px] font-semibold outline-none">
        {options.map(option => { const choice = typeof option === "string" ? { value: option, label: option } : option; return <option key={choice.value} value={choice.value}>{choice.label}</option>; })}
      </select>
    </label>
  );
}

function Disclosure({ label, icon: Icon, children, defaultOpen = false }: { label: string; icon?: React.ElementType; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="border-b border-border/45 py-1 last:border-0">
      <CollapsibleTrigger asChild><Button variant="ghost" className="group h-8 w-full justify-between rounded-lg px-1.5 text-[11px]"><span className="flex items-center gap-2">{Icon && <Icon size={12} />}{label}</span><ChevronRight size={12} className="transition-transform group-data-[state=open]:rotate-90" /></Button></CollapsibleTrigger>
      <CollapsibleContent className="px-1.5 pb-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function ReviewPanel({ item, postedCost, onApprove, onFlag, onPrevious, onNext, onShowDocument }: {
  item: InboxItem; postedCost?: PostedCost; onApprove: () => void; onFlag: () => void;
  onPrevious: () => void; onNext: () => void; onShowDocument: () => void;
}) {
  const project = item.projectId ? getProject(item.projectId) : undefined;
  const initialLine = lineById(item.suggestedLineId);
  const [projectId, setProjectId] = useState(item.projectId ?? "Unassigned");
  const lineOptions = budgetLines.filter(line => projectId === "Unassigned" || line.projectId === projectId);
  const [lineId, setLineId] = useState(item.suggestedLineId ?? lineOptions[0]?.id ?? "");
  const line = lineById(lineId) ?? initialLine;
  const [commitmentId, setCommitmentId] = useState(item.commitmentId ?? "None");
  const [allocations, setAllocations] = useState(() => item.lines.map(lineItem => ({ ...lineItem })));
  const [resolvedAction, setResolvedAction] = useState<string>();
  const codingRef = useRef<HTMLDivElement>(null);
  const lowConfidence = item.confidence < 70 || item.state !== "Ready";
  const hasDifferentCodes = new Set(allocations.map(allocation => allocation.suggestedLineId)).size > 1;
  const extractedAllocationTotal = item.lines.reduce((total, allocation) => total + allocation.amount, 0);
  const allocationTotal = allocations.reduce((total, allocation) => total + allocation.amount, 0);
  const balanced = Math.abs(allocationTotal - extractedAllocationTotal) < 0.01;
  const resolutionAllowsPosting = item.state === "Ready" || ["Post Anyway", "Adjust Commitment", "Create Change", "Partial Approve", "Assign Vendor", "Assign Project", "Create Cost"].includes(resolvedAction ?? "");
  const canPost = !postedCost && item.state !== "Posted" && balanced && resolutionAllowsPosting && Boolean(projectId !== "Unassigned" && lineId);
  const selection = selections.find(candidate => candidate.id === item.selectionId || candidate.commitmentId === commitmentId);

  useEffect(() => {
    setProjectId(item.projectId ?? "Unassigned"); setLineId(item.suggestedLineId ?? ""); setCommitmentId(item.commitmentId ?? "None");
    setAllocations(item.lines.map(lineItem => ({ ...lineItem }))); setResolvedAction(undefined);
  }, [item]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
      if (event.key === "Enter" && canPost) onApprove();
      if (event.key === "j" || event.key === "ArrowDown") { event.preventDefault(); onNext(); }
      if (event.key === "k" || event.key === "ArrowUp") { event.preventDefault(); onPrevious(); }
      if (event.key.toLowerCase() === "e") codingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (event.key.toLowerCase() === "f") onFlag();
    };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  }, [canPost, onApprove, onFlag, onNext, onPrevious]);

  return (
    <section className="flex min-h-0 flex-col bg-[hsl(var(--surface-workspace)/0.98)]" aria-label="Cost review">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-border/60 px-3">
        <div className="flex items-center gap-2"><Pill label={postedCost ? "Posted" : item.state} tone={postedCost ? "muted" : stateTone(item.state)} /><span className={cn("text-[10px] font-semibold tabular-nums", confidenceTone(item.confidence))}>{item.confidence}% confidence</span></div>
        <TooltipProvider><div className="flex items-center gap-0.5"><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onShowDocument} className="h-7 w-7"><FileText size={13} /></Button></TooltipTrigger><TooltipContent>Show document</TooltipContent></Tooltip><Button variant="ghost" size="icon" onClick={onPrevious} className="h-7 w-7"><ArrowUp size={13} /></Button><Button variant="ghost" size="icon" onClick={onNext} className="h-7 w-7"><ArrowDown size={13} /></Button></div></TooltipProvider>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0"><p className="text-[10px] font-semibold uppercase text-primary">{item.state === "Ready" ? "Ready to post" : item.state === "Posted" || postedCost ? "Posted cost" : "Decision required"}</p><h2 className="truncate font-display text-lg font-bold">{item.vendor}</h2><p className="text-[11px] text-muted-foreground">{documentLabel(item)} · {item.date}</p></div>
          <p className="shrink-0 font-display text-xl font-bold tabular-nums">{money(item.amount)}</p>
        </header>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div><p className="text-[9px] uppercase text-muted-foreground">Source</p><p className="truncate text-[11px] font-semibold">{item.source}</p></div>
          <div><p className="text-[9px] uppercase text-muted-foreground">Due</p><p className="text-[11px] font-semibold">{item.dueDate ?? "Not stated"}</p></div>
          <div><p className="text-[9px] uppercase text-muted-foreground">Tax</p><p className="text-[11px] font-semibold tabular-nums">{money(item.tax)}</p></div>
          <div><p className="text-[9px] uppercase text-muted-foreground">Network match</p><p className="truncate text-[11px] font-semibold">{item.companyId ? "Matched" : item.vendor === "Unknown vendor" ? "Required" : "Likely match"}</p></div>
        </div>

        <div className="mt-3"><DecisionCard item={item} resolvedAction={resolvedAction} onAction={setResolvedAction} /></div>

        <section className="mt-3">
          <div className="mb-2 flex items-center justify-between"><h3 className="text-[11px] font-bold">Coding decision</h3><span className="text-[9px] text-muted-foreground">Euclid recommendation</span></div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Project" value={projectId} attention={!item.projectId} onChange={value => { setProjectId(value); const first = budgetLines.find(candidate => candidate.projectId === value); if (first) setLineId(first.id); }} options={["Unassigned", ...projects.map(candidate => ({ value: candidate.id, label: candidate.name }))]} />
            <Field label="Estimate line" value={lineId} attention={!lineId || item.confidence < 70} onChange={setLineId} options={lineOptions.length ? lineOptions.map(candidate => ({ value: candidate.id, label: candidate.name })) : [""]} />
            <Field label="Phase / cost code" value={line ? `${line.phase} · ${line.costCode}` : "Unmapped"} options={[line ? `${line.phase} · ${line.costCode}` : "Unmapped"]} />
            <Field label="Commitment" value={commitmentId} attention={item.exception?.kind.includes("commitment")} onChange={setCommitmentId} options={["None", ...commitments.filter(candidate => projectId === "Unassigned" || candidate.projectId === projectId).map(candidate => ({ value: candidate.id, label: `${candidate.id} · ${candidate.company}` }))]} />
          </div>
          {selection && <p className="mt-2 text-[10px] text-muted-foreground">Linked selection: {selection.title} · allowance {money(selection.allowance)}</p>}
        </section>

        <div ref={codingRef} className="mt-3 rounded-xl border border-border/55 bg-background/35 px-2">
          <Disclosure label={`Review Line Coding · ${allocations.length} line${allocations.length === 1 ? "" : "s"}`} icon={Columns3} defaultOpen={lowConfidence || hasDifferentCodes}>
            <div className="space-y-1.5">{allocations.map((allocation, index) => (
              <div key={`${allocation.description}-${index}`} className="grid grid-cols-[minmax(0,1fr)_88px] gap-2 rounded-lg bg-card/65 p-2 text-[10px] sm:grid-cols-[minmax(0,1fr)_92px_minmax(120px,0.8fr)_48px]">
                <span className="truncate">{allocation.description}</span><input value={allocation.amount} type="number" onChange={event => setAllocations(current => current.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, amount: Number(event.target.value) } : candidate))} className="bg-transparent text-right tabular-nums outline-none" />
                <select value={allocation.suggestedLineId} onChange={event => setAllocations(current => current.map((candidate, candidateIndex) => candidateIndex === index ? { ...candidate, suggestedLineId: event.target.value } : candidate))} className="col-span-2 min-w-0 bg-transparent outline-none sm:col-span-1">{lineOptions.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</select>
                <span className={cn("hidden text-right tabular-nums sm:block", confidenceTone(allocation.confidence))}>{allocation.confidence}%</span>
              </div>
            ))}</div>
            <div className="mt-2 flex items-center justify-between border-t border-border/45 pt-2 text-[10px]"><span className={balanced ? "text-success" : "text-warning"}>{balanced ? "Allocation balanced" : `${money(extractedAllocationTotal - allocationTotal)} remaining`}</span><Button variant="ghost" size="sm" onClick={() => setAllocations(current => [...current, { description: "New allocation", amount: 0, suggestedLineId: lineId, confidence: item.confidence }])} className="h-6 px-2 text-[9px]"><Plus size={10} />Split</Button></div>
          </Disclosure>
        </div>

        <EuclidImpact className="mt-3" domain="Cost" tone={item.state === "Ready" ? "positive" : "warning"}
          headline={item.state === "Ready" ? "No accounting conflict detected" : "Review before this changes project cost"}
          message={project && line ? `${money(item.amount)} will post once to ${project.name} · ${line.costCode} ${line.name}${commitmentId !== "None" ? ` and update ${commitmentId}` : ""}. Budget actuals, Estimate vs Actual, vendor history, activity, and the QBO queue will derive from that same cost.` : "Assign the missing project and estimate line before posting. No financial record has been created yet."} />

        <div className="mt-2 rounded-xl border border-border/50 bg-background/25 px-2">
          <Disclosure label="Why this match?" icon={Link2}><p className="text-[10px] leading-relaxed text-muted-foreground">Matched from vendor identity, document number, project history, estimate structure, cost-code usage, active commitments, and amount patterns. {item.confidence}% confidence.</p></Disclosure>
          <Disclosure label="History" icon={History}><p className="text-[10px] leading-relaxed text-muted-foreground">Received {item.date} from {item.source}. Euclid extracted {item.lines.length} line{item.lines.length === 1 ? "" : "s"}, checked duplicate and commitment rules, then placed it in {item.state}.</p></Disclosure>
          <Disclosure label="Review All Details" icon={MoreHorizontal}><div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground"><p>Vendor: {item.vendor}</p><p>Number: {item.number ?? "—"}</p><p>Project: {project?.name ?? "Unassigned"}</p><p>Estimate: {line?.estimateLine ?? "Unmapped"}</p><p>Phase: {line?.phase ?? "Unmapped"}</p><p>Cost code: {line?.costCode ?? "Unmapped"}</p></div></Disclosure>
        </div>
      </div>

      <footer className="sticky bottom-0 flex shrink-0 items-center justify-between gap-2 border-t border-border/70 bg-card/95 px-3 py-2 backdrop-blur-xl">
        <TooltipProvider><div className="flex gap-1"><Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={onFlag} className="h-8 w-8"><Flag size={13} /></Button></TooltipTrigger><TooltipContent>Flag for review (F)</TooltipContent></Tooltip><Button variant="ghost" size="sm" onClick={onNext} className="h-8 text-[10px]">Skip<ArrowRight size={11} /></Button></div></TooltipProvider>
        <Button size="sm" onClick={onApprove} disabled={!canPost} className="h-8 min-w-[132px] text-[11px]"><Check size={13} />{postedCost || item.state === "Posted" ? "Posted" : resolvedAction ? "Apply & Post" : "Approve & Post"}</Button>
      </footer>
    </section>
  );
}

export default function CostInboxPage() {
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const { toast } = useToast();
  const [filter, setFilter] = useState<QueueFilter>("All");
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All projects");
  const [sourceFilter, setSourceFilter] = useState("All sources");
  const [postedCosts, setPostedCosts] = useState<PostedCost[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [flagged, setFlagged] = useState<string[]>([]);
  const [showDocument, setShowDocument] = useState(true);
  const [mobileTab, setMobileTab] = useState<ReviewTab>("review");

  const items = useMemo(() => inboxItems.map(item => postedCosts.some(cost => cost.inboxId === item.id) ? { ...item, state: "Posted" as const } : item), [postedCosts]);
  const counts = useMemo(() => ({
    All: items.length, Ready: items.filter(item => item.state === "Ready").length,
    "Needs Review": items.filter(item => item.state === "Needs Review").length,
    Exceptions: items.filter(item => item.state === "Exception").length,
    Posted: items.filter(item => item.state === "Posted").length,
  }), [items]);
  const rows = useMemo(() => items.filter(item => {
    const statusMatch = filter === "All" || (filter === "Exceptions" ? item.state === "Exception" : item.state === filter);
    const text = `${item.vendor} ${item.number ?? ""} ${item.docType} ${item.source}`.toLowerCase();
    return statusMatch && (!search || text.includes(search.toLowerCase())) && (projectFilter === "All projects" || item.projectId === projectFilter) && (sourceFilter === "All sources" || item.source === sourceFilter);
  }), [filter, items, projectFilter, search, sourceFilter]);
  const open = items.find(item => item.id === openId);
  const activeIndex = open ? rows.findIndex(item => item.id === open.id) : -1;
  const readySelected = selected.filter(id => items.find(item => item.id === id)?.state === "Ready");

  const navigate = (direction: -1 | 1) => {
    if (!rows.length) return;
    const nextIndex = activeIndex < 0 ? 0 : (activeIndex + direction + rows.length) % rows.length;
    setOpenId(rows[nextIndex].id);
  };
  const post = (ids: string[], allowResolved = false) => {
    const eligible = items.filter(item => ids.includes(item.id) && (item.state === "Ready" || allowResolved));
    if (!eligible.length) return;
    setPostedCosts(current => [...current, ...eligible.filter(item => !current.some(cost => cost.inboxId === item.id)).map(item => ({ inboxId: item.id, projectId: item.projectId, budgetLineId: item.suggestedLineId, commitmentId: item.commitmentId, amount: item.amount, status: "Posted" as const, sync: "Queued" as const }))]);
    setSelected(current => current.filter(id => !ids.includes(id)));
    toast({ title: `${eligible.length} cost${eligible.length === 1 ? "" : "s"} posted`, description: "Budget, commitments, vendor history, activity, and QBO queue now reference the same cost record." });
    if (eligible.some(item => item.id === openId)) {
      const next = items.find(item => item.state !== "Posted" && item.state !== "Ready" && !ids.includes(item.id)) ?? items.find(item => item.state !== "Posted" && !ids.includes(item.id));
      setOpenId(next?.id ?? null);
    }
  };
  const flag = (id: string) => {
    setFlagged(current => current.includes(id) ? current.filter(candidate => candidate !== id) : [...current, id]);
    toast({ title: flagged.includes(id) ? "Flag removed" : "Cost flagged", description: "The review state is visible in this processing session." });
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if (event.key === "Escape" && openId) setOpenId(null); };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  }, [openId]);

  return (
    <TrackShell>
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1500px] flex-col px-3 pb-3 pt-1 lg:px-5">
        <div className="shrink-0">
          <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase text-muted-foreground">Financials</p><h1 className="font-display text-2xl font-semibold">Cost Inbox</h1><p className="mt-0.5 text-[11px] text-muted-foreground">Euclid processes incoming costs. Review only what needs a decision.</p></div></div>
          <div className="mt-1.5"><FinancialsNav base={base} active="inbox" /></div>
        </div>

        {open ? (
          <div className="financial-workspace mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl">
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-border/60 px-2 sm:px-3">
              <Button variant="ghost" size="sm" onClick={() => setOpenId(null)} className="h-7 px-2 text-[10px]"><ArrowLeft size={12} />Back to queue</Button>
              <div className="flex items-center gap-1 lg:hidden"><Button variant={mobileTab === "document" ? "secondary" : "ghost"} size="sm" onClick={() => setMobileTab("document")} className="h-7 text-[10px]">Document</Button><Button variant={mobileTab === "review" ? "secondary" : "ghost"} size="sm" onClick={() => setMobileTab("review")} className="h-7 text-[10px]">Review</Button></div>
              <span className="text-[9px] text-muted-foreground">{Math.max(activeIndex + 1, 1)} of {rows.length || items.length}</span>
            </div>
            <div className={cn("grid min-h-0 flex-1 lg:grid-cols-[minmax(320px,0.9fr)_minmax(410px,1.1fr)]", !showDocument && "lg:grid-cols-1")}>
              {showDocument && <div className={cn("min-h-0", mobileTab !== "document" && "hidden lg:block")}><PreviewPane item={open} onHide={() => setShowDocument(false)} /></div>}
              <div className={cn("min-h-0", mobileTab !== "review" && "hidden lg:block")}><ReviewPanel item={open} postedCost={postedCosts.find(cost => cost.inboxId === open.id)} onApprove={() => post([open.id], true)} onFlag={() => flag(open.id)} onPrevious={() => navigate(-1)} onNext={() => navigate(1)} onShowDocument={() => { setShowDocument(true); setMobileTab("document"); }} /></div>
            </div>
          </div>
        ) : (
          <>
            <section className="financial-toolbar mt-2 flex shrink-0 items-center justify-between gap-3 rounded-xl p-2">
              <div className="flex min-w-0 items-center gap-1">
                <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 text-[10px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"><Upload size={12} />Add Documents<input type="file" className="hidden" multiple /></label>
                <div className="hidden items-center gap-0.5 lg:flex">{SOURCES.map(source => <Button key={source.label} variant="ghost" size="sm" className="h-8 rounded-lg px-2 text-[10px] font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary"><source.icon size={11} />{source.label}</Button>)}</div>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="financial-control h-8 px-2.5 text-[10px] lg:hidden">Sources<ChevronDown size={11} /></Button></DropdownMenuTrigger><DropdownMenuContent align="start" className="odyssey-popover min-w-40">{SOURCES.map(source => <DropdownMenuItem key={source.label} className="gap-2 text-[11px]"><source.icon size={12} />{source.label}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
              </div>
              <div className="flex min-w-0 items-center gap-1.5">
                <label className="financial-control flex h-8 min-w-0 items-center gap-1.5 px-2.5"><Search size={12} className="shrink-0 text-muted-foreground" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search inbox" className="w-24 bg-transparent text-[10px] outline-none sm:w-36" /></label>
                <label className="financial-control hidden h-8 items-center gap-1 px-2.5 text-[10px] sm:flex"><select aria-label="Project filter" value={projectFilter} onChange={event => setProjectFilter(event.target.value)} className="max-w-28 bg-transparent outline-none"><option>All projects</option>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select><ChevronDown size={10} className="text-muted-foreground" /></label>
                <label className="financial-control hidden h-8 items-center gap-1 px-2.5 text-[10px] md:flex"><select aria-label="Source filter" value={sourceFilter} onChange={event => setSourceFilter(event.target.value)} className="max-w-24 bg-transparent outline-none"><option>All sources</option>{[...new Set(inboxItems.map(item => item.source))].map(source => <option key={source}>{source}</option>)}</select><ChevronDown size={10} className="text-muted-foreground" /></label>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon" className="financial-control h-8 w-8 md:hidden" aria-label="Queue filters"><Filter size={12} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="odyssey-popover w-56 space-y-1.5 p-2">
                  <label className="block text-[9px] font-semibold uppercase text-muted-foreground">Project<select aria-label="Project filter" value={projectFilter} onChange={event => setProjectFilter(event.target.value)} className="financial-control mt-1 h-8 w-full px-2 text-[10px] outline-none"><option>All projects</option>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
                  <label className="block text-[9px] font-semibold uppercase text-muted-foreground">Source<select aria-label="Source filter" value={sourceFilter} onChange={event => setSourceFilter(event.target.value)} className="financial-control mt-1 h-8 w-full px-2 text-[10px] outline-none"><option>All sources</option>{[...new Set(inboxItems.map(item => item.source))].map(source => <option key={source}>{source}</option>)}</select></label>
                </DropdownMenuContent></DropdownMenu>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground" title="Columns"><Columns3 size={13} /></Button>
              </div>
            </section>

            <div className="mt-1.5 flex min-h-9 shrink-0 items-center justify-between gap-2 px-1">
              {selected.length > 0 ? <><span className="text-[11px] font-semibold text-primary">{selected.length} selected <span className="font-normal text-muted-foreground">· {readySelected.length} ready</span></span><div className="flex items-center gap-1"><Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px]">Change Project</Button><Button variant="ghost" size="sm" className="hidden h-8 rounded-lg text-[10px] sm:inline-flex">Change Mapping</Button><Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px]"><Flag size={11} />Flag</Button><Button size="sm" onClick={() => post(readySelected)} disabled={!readySelected.length} className="h-8 rounded-lg text-[10px]"><Check size={11} />Approve {readySelected.length || ""}</Button><Button variant="ghost" size="sm" onClick={() => setSelected([])} className="h-8 rounded-lg px-2 text-[10px] text-muted-foreground">Cancel</Button></div></> : <div className="flex items-center gap-0.5 overflow-x-auto">{FILTERS.map(value => <CountTab key={value} label={value} count={counts[value]} active={filter === value} onClick={() => setFilter(value)} />)}</div>}
            </div>

            <section className="financial-workspace mt-1 min-h-0 flex-1 overflow-auto rounded-2xl">
              <table className="w-full min-w-[900px] table-fixed text-[11px]">
                <thead className="financial-table-header sticky top-0 z-10 text-[9px] uppercase text-muted-foreground"><tr className="border-b border-border/65"><th className="w-9 p-2"><input type="checkbox" aria-label="Select visible ready items" checked={rows.length > 0 && rows.every(item => selected.includes(item.id))} onChange={() => setSelected(current => rows.every(item => current.includes(item.id)) ? current.filter(id => !rows.some(item => item.id === id)) : [...new Set([...current, ...rows.map(item => item.id)])])} /></th><th className="w-[20%] p-2 text-left">Vendor</th><th className="w-[15%] p-2 text-left">Document</th><th className="w-[17%] p-2 text-left">Project</th><th className="w-[11%] p-2 text-right">Amount</th><th className="w-[15%] p-2 text-left">Mapping</th><th className="w-[7%] p-2 text-right">Conf.</th><th className="w-[9%] p-2 text-left">Status</th><th className="w-[8%] p-2" /></tr></thead>
                <tbody>{rows.map(item => {
                  const mapped = lineById(item.suggestedLineId); const isFlagged = flagged.includes(item.id);
                   return <tr key={item.id} onClick={() => { setOpenId(item.id); setShowDocument(true); setMobileTab("review"); }} className={cn("h-12 cursor-pointer border-b border-border/35 transition-colors hover:bg-primary/5", selected.includes(item.id) && "bg-primary/[0.07]")}>
                    <td className="p-2 text-center" onClick={event => event.stopPropagation()}><input type="checkbox" aria-label={`Select ${documentLabel(item)}`} checked={selected.includes(item.id)} onChange={() => setSelected(current => current.includes(item.id) ? current.filter(id => id !== item.id) : [...current, item.id])} /></td>
                    <td className="truncate p-2 font-semibold">{isFlagged && <Flag size={10} className="mr-1 inline text-warning" />}{item.vendor}</td><td className="truncate p-2">{documentLabel(item)}<span className="block truncate text-[9px] text-muted-foreground">{sourceLabel(item.source)} · {item.date}</span></td><td className="truncate p-2">{item.projectId ? getProject(item.projectId).name : <span className="text-warning">Unassigned</span>}</td><td className="p-2 text-right font-semibold tabular-nums">{money(item.amount)}</td><td className="truncate p-2">{mapped?.name ?? "Unmapped"}<span className="block truncate text-[9px] text-muted-foreground">{mapped ? `${mapped.costCode} · ${item.commitmentId ?? "No commitment"}` : item.exception?.kind ?? "Needs coding"}</span></td><td className={cn("p-2 text-right font-semibold tabular-nums", confidenceTone(item.confidence))}>{item.confidence}%</td><td className="p-2"><QueueStatus state={postedCosts.some(cost => cost.inboxId === item.id) ? "Posted" : item.state} /></td><td className="p-2 text-right" onClick={event => event.stopPropagation()}>{item.state === "Ready" && !postedCosts.some(cost => cost.inboxId === item.id) ? <Button size="sm" onClick={() => post([item.id])} className="h-7 rounded-lg px-2 text-[9px]">Approve</Button> : <Button variant="ghost" size="icon" onClick={() => setOpenId(item.id)} className="h-7 w-7 rounded-lg text-muted-foreground"><ChevronRight size={13} /></Button>}</td>
                  </tr>;
                })}</tbody>
              </table>
              {!rows.length && <div className="flex h-40 flex-col items-center justify-center text-center"><CheckCircle2 size={20} className="text-success" /><p className="mt-2 text-[12px] font-semibold">No costs match these filters</p><p className="text-[10px] text-muted-foreground">Change a filter or review another queue.</p></div>}
            </section>
          </>
        )}
      </div>
    </TrackShell>
  );
}