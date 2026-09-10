import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, CreditCard, FileText, Mail, RefreshCw, Upload } from "lucide-react";
import { TrackShell, useTrack } from "@/components/app/TrackShell";
import { getProject, money, projects } from "@/data/demoUniverse";
import { budgetLines, commitmentById, inboxItems, InboxItem, lineById, selections } from "@/data/financialData";
import { EuclidImpact } from "@/components/app/active/EuclidImpact";
import { Filters, Metric, Panel, Pill } from "@/components/app/financials/FinancialPrimitives";
import { cn } from "@/lib/utils";
import { FinancialsNav } from "./FinancialsNav";

const STATES = ["All", "Ready", "Needs Review", "Exceptions", "Posted"];
const SOURCES = [
  { label: "Upload", icon: Upload }, { label: "Email", icon: Mail }, { label: "QBO Sync", icon: RefreshCw },
  { label: "Card Feed", icon: CreditCard }, { label: "Manual", icon: FileText },
];

const tone = (s: InboxItem["state"]) => s === "Ready" ? "good" : s === "Exception" ? "bad" : s === "Posted" ? "muted" : "info";

function DocumentPreview({ item }: { item: InboxItem }) {
  return (
    <div className="rounded-xl bg-white p-5 text-[11px] text-neutral-800">
      <div className="flex items-start justify-between border-b border-neutral-200 pb-3">
        <div>
          <p className="font-display text-base font-bold text-neutral-900">{item.vendor}</p>
          <p className="text-[10px] text-neutral-500">{item.docType}{item.number ? ` #${item.number}` : ""}</p>
        </div>
        <div className="text-right text-[10px] text-neutral-500">
          <p>Date {item.date}</p>{item.dueDate && <p>Due {item.dueDate}</p>}{item.terms && <p>{item.terms}</p>}{item.card && <p>{item.card}</p>}
        </div>
      </div>
      <table className="mt-3 w-full">
        <tbody>
          {item.lines.map(l => (
            <tr key={l.description} className="border-b border-neutral-100">
              <td className="py-1.5">{l.description}</td>
              <td className="py-1.5 text-right tabular-nums">{money(l.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 ml-auto w-44 space-y-1">
        <p className="flex justify-between"><span className="text-neutral-500">Tax</span><b>{money(item.tax)}</b></p>
        <p className="flex justify-between border-t border-neutral-200 pt-1"><span className="font-semibold">Total</span><b>{money(item.amount)}</b></p>
      </div>
      <p className="mt-4 text-[9px] uppercase tracking-wide text-neutral-400">Original document · {item.source}</p>
    </div>
  );
}

function Review({ item, onPost }: { item: InboxItem; onPost: () => void }) {
  const [alloc, setAlloc] = useState(() => item.lines.map(l => ({ ...l })));
  const project = item.projectId ? getProject(item.projectId) : undefined;
  const lineOptions = budgetLines.filter(l => !item.projectId || l.projectId === item.projectId);
  const commitment = commitmentById(item.commitmentId);
  const selection = selections.find(s => s.commitmentId === item.commitmentId || s.id === item.selectionId);

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Panel title="Document">
        <DocumentPreview item={item} />
      </Panel>

      <div className="space-y-3">
        <Panel title="Extracted information">
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Vendor" value={item.vendor} />
            <Metric label="Document" value={`${item.docType}${item.number ? ` #${item.number}` : ""}`} />
            <Metric label="Amount" value={item.amount} />
            <Metric label="Tax" value={item.tax} />
            <Metric label="Date" value={item.date} />
            <Metric label="Due Date" value={item.dueDate ?? "—"} />
          </div>
        </Panel>

        <Panel title="Project mapping">
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Project" value={project?.name ?? "Unmatched"} />
            <Metric label="Phase" value={lineById(item.suggestedLineId)?.phase ?? "—"} />
            <Metric label="Cost Code" value={lineById(item.suggestedLineId)?.costCode ?? "—"} />
            <Metric label="Estimate Line" value={lineById(item.suggestedLineId)?.estimateLine ?? "—"} />
            <Metric label="Commitment" value={commitment ? `${commitment.id} — ${money(commitment.original)}` : "None matched"} />
            <Metric label="Confidence" value={`${item.confidence}%`} tone={item.confidence >= 90 ? "good" : item.confidence >= 70 ? "default" : "bad"} />
          </div>
          {selection && <p className="mt-2 text-[10px] text-muted-foreground">Matched selection: {selection.title} — allowance {money(selection.allowance)}.</p>}
        </Panel>

        <Panel title="Line-level coding" action={<span className="text-[10px] text-muted-foreground">Edit · split · bulk apply</span>}>
          <table className="w-full text-[11px]">
            <thead className="text-[10px] uppercase text-muted-foreground">
              <tr className="border-b border-border/50"><th className="p-1 text-left">Invoice line</th><th className="p-1 text-right">Amount</th><th className="p-1 text-left">Suggested mapping</th><th className="p-1 text-right">Conf.</th></tr>
            </thead>
            <tbody>
              {alloc.map((l, i) => (
                <tr key={l.description} className="border-b border-border/30">
                  <td className="p-1">{l.description}</td>
                  <td className="p-1 text-right tabular-nums">{money(l.amount)}</td>
                  <td className="p-1">
                    <select value={l.suggestedLineId} onChange={e => setAlloc(a => a.map((x, j) => j === i ? { ...x, suggestedLineId: e.target.value } : x))}
                      className="w-full max-w-[180px] rounded-full border border-border/60 bg-transparent px-2 py-1 text-[11px] outline-none">
                      {lineOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </td>
                  <td className={cn("p-1 text-right tabular-nums", l.confidence < 70 && "text-warning")}>{l.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[10px] text-muted-foreground">Euclid codes line by line using the project's Scope Analyzer structure, estimate lines, trade, Network vendor history, active commitments and schedule phase.</p>
        </Panel>

        {item.exception && (
          <Panel title={`Exception — ${item.exception.kind}`}>
            <p className="flex items-start gap-2 text-[11px] text-warning"><AlertTriangle size={12} className="mt-0.5" />{item.exception.detail}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.exception.actions.map(a => <button key={a} className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">{a}</button>)}
            </div>
          </Panel>
        )}

        <EuclidImpact domain="Cost" tone={item.state === "Ready" ? "positive" : "warning"}
          message={item.state === "Ready"
            ? `Euclid is ${item.confidence}% confident in this mapping. Posting creates one cost record that appears in project Costs, the Budget line, the matched commitment, the vendor's Network profile, Estimate vs Actual, and the QuickBooks sync queue.`
            : `This document is not safe to post automatically. Resolve the exception above so a single, explainable cost record can be created.`} />

        <button onClick={onPost} disabled={item.state === "Posted"}
          className="w-full rounded-full bg-primary py-2.5 text-[12px] font-semibold text-primary-foreground disabled:opacity-50">
          {item.state === "Posted" ? "Posted" : "Approve & Post"}
        </button>
      </div>
    </div>
  );
}

export default function CostInboxPage() {
  const track = useTrack();
  const base = track === "sub" ? "/sub" : "/app";
  const [filter, setFilter] = useState("All");
  const [posted, setPosted] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [sel, setSel] = useState<string[]>([]);

  const items = useMemo(() => inboxItems.map(i => posted.includes(i.id) ? { ...i, state: "Posted" as const } : i), [posted]);
  const rows = items.filter(i => filter === "All" ? true : filter === "Exceptions" ? i.state === "Exception" : i.state === filter);
  const open = items.find(i => i.id === openId);

  return (
    <TrackShell>
      <div className="mx-auto w-full max-w-[1250px] p-4 lg:p-7">
        <header className="mb-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">Financials</p>
          <h1 className="font-display text-3xl font-semibold">Cost Inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">Receive financial documents, let Euclid structure them, and push them into the right project financial records.</p>
        </header>
        <FinancialsNav base={base} active="inbox" />

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <label className="odyssey-surface flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/40 p-6 text-center lg:col-span-2">
            <Upload size={20} className="text-primary" />
            <p className="mt-2 text-sm font-semibold">Drop bills, invoices, receipts, credits, and statements here</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Euclid reads the document, matches the vendor, project, commitment and cost codes, and flags anything that needs a human.</p>
            <input type="file" className="hidden" />
          </label>
          <Panel title="Sources">
            <div className="space-y-1.5 text-[11px]">
              {SOURCES.map(s => (
                <p key={s.label} className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><s.icon size={12} />{s.label}</span>
                  <span>{items.filter(i => i.source.startsWith(s.label.split(" ")[0])).length}</span></p>
              ))}
            </div>
          </Panel>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          <Metric label="Ready" value={items.filter(i => i.state === "Ready").length} tone="good" />
          <Metric label="Needs Review" value={items.filter(i => i.state === "Needs Review").length} />
          <Metric label="Exceptions" value={items.filter(i => i.state === "Exception").length} tone="bad" />
          <Metric label="Posted" value={items.filter(i => i.state === "Posted").length} tone="muted" />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <Filters options={STATES} value={filter} onChange={setFilter} />
          {sel.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary">
              {sel.length} selected
              <button onClick={() => { setPosted(p => [...new Set([...p, ...sel])]); setSel([]); }} className="rounded-full px-2 py-0.5 hover:bg-primary/15">Approve Selected</button>
              {["Assign Project", "Assign Cost Code", "Assign Commitment", "Flag", "Sync to QBO"].map(a => <button key={a} className="rounded-full px-2 py-0.5 hover:bg-primary/15">{a}</button>)}
            </div>
          )}
        </div>

        <Panel className="mt-3 overflow-x-auto p-0">
          <table className="w-full min-w-[860px] text-[11px]">
            <thead className="text-[10px] uppercase text-muted-foreground">
              <tr className="border-b border-border/50">
                <th className="w-8 p-2" /><th className="p-2 text-left">Vendor</th><th className="p-2 text-left">Document</th><th className="p-2 text-left">Project</th>
                <th className="p-2 text-right">Amount</th><th className="p-2 text-left">Suggested mapping</th><th className="p-2 text-right">Confidence</th>
                <th className="p-2 text-left">Exception</th><th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(i => (
                <tr key={i.id} onClick={() => setOpenId(o => o === i.id ? null : i.id)} className={cn("cursor-pointer border-b border-border/30 hover:bg-card/40", openId === i.id && "bg-card/40")}>
                  <td className="p-2" onClick={e => e.stopPropagation()}><input type="checkbox" checked={sel.includes(i.id)} onChange={() => setSel(s => s.includes(i.id) ? s.filter(x => x !== i.id) : [...s, i.id])} /></td>
                  <td className="p-2 font-medium">{i.vendor}</td>
                  <td className="p-2">{i.docType}<span className="block text-[10px] text-muted-foreground">{i.number ? `#${i.number} · ` : ""}{i.date}</span></td>
                  <td className="p-2">{i.projectId ? projects.find(p => p.id === i.projectId)?.name : <span className="text-warning">Unmatched</span>}</td>
                  <td className="p-2 text-right tabular-nums font-semibold">{money(i.amount)}</td>
                  <td className="p-2">{lineById(i.suggestedLineId)?.name ?? "—"}</td>
                  <td className={cn("p-2 text-right tabular-nums", i.confidence < 70 && "text-warning")}>{i.confidence}%</td>
                  <td className="p-2 text-[10px] text-muted-foreground">{i.exception?.kind ?? "—"}</td>
                  <td className="p-2"><Pill label={i.state} tone={tone(i.state)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        {open && (
          <div className="mt-3">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold">
              <CheckCircle2 size={13} className="text-primary" />Reviewing {open.vendor} {open.docType}{open.number ? ` #${open.number}` : ""}
            </div>
            <Review item={open} onPost={() => { setPosted(p => [...p, open.id]); setOpenId(null); }} />
          </div>
        )}
      </div>
    </TrackShell>
  );
}
