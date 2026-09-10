import { useState } from "react";
import { money } from "@/data/demoUniverse";
import { CostRecord, costsFor, lineById } from "@/data/financialData";
import { EuclidImpact } from "@/components/app/active/EuclidImpact";
import { cn } from "@/lib/utils";
import { Filters, Metric, Panel, Pill } from "./FinancialPrimitives";

const FILTERS = ["All", "Bills & Invoices", "Receipts", "Card", "Labor", "Credits"] as const;

const matches = (c: CostRecord, f: string) =>
  f === "All" ? true :
  f === "Bills & Invoices" ? c.type.includes("Invoice") :
  f === "Receipts" ? c.type === "Receipt" :
  f === "Card" ? c.type === "Credit Card" || c.source === "Card Feed" :
  f === "Labor" ? c.type === "Internal Labor" :
  c.type === "Credit" || c.amount < 0;

export function CostsTab({ projectId }: { projectId: string }) {
  const [filter, setFilter] = useState<string>("All");
  const [sel, setSel] = useState<string[]>([]);
  const all = costsFor(projectId);
  const rows = all.filter(c => matches(c, filter));
  const financial = all.filter(c => c.financial);
  const posted = financial.reduce((t, c) => t + c.amount, 0);
  const needsReview = all.filter(c => c.approval === "Needs Review");
  const toggle = (id: string) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Metric label="Posted Actual Cost" value={posted} />
        <Metric label="Awaiting Review" value={needsReview.reduce((t, c) => t + c.amount, 0)} tone="bad" sub={`${needsReview.length} records`} />
        <Metric label="Paid" value={all.filter(c => c.approval === "Paid").reduce((t, c) => t + c.amount, 0)} />
        <Metric label="Queued for QuickBooks" value={all.filter(c => c.sync === "Queued").length} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Filters options={[...FILTERS]} value={filter} onChange={setFilter} />
        {sel.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary">
            {sel.length} selected
            {["Approve Selected", "Assign Cost Code", "Assign Commitment", "Flag", "Sync to QBO"].map(a => (
              <button key={a} className="rounded-full px-2 py-0.5 hover:bg-primary/15">{a}</button>
            ))}
          </div>
        )}
      </div>

      <Panel className="overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-[11px]">
          <thead className="text-[10px] uppercase text-muted-foreground">
            <tr className="border-b border-border/50">
              <th className="w-8 p-2" />
              <th className="p-2 text-left">Vendor</th>
              <th className="p-2 text-left">Type / Number</th>
              <th className="p-2 text-left">Cost code / Estimate line</th>
              <th className="p-2 text-left">Commitment</th>
              <th className="p-2 text-left">Source</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2 text-right">Tax</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Approval</th>
              <th className="p-2 text-left">QBO</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(c => {
              const l = lineById(c.budgetLineId);
              return (
                <tr key={c.id} className={cn("border-b border-border/30 hover:bg-card/40", !c.financial && "opacity-70")}>
                  <td className="p-2"><input type="checkbox" checked={sel.includes(c.id)} onChange={() => toggle(c.id)} /></td>
                  <td className="p-2 font-medium">{c.vendor}<span className="block text-[10px] text-muted-foreground">{c.description}</span></td>
                  <td className="p-2">{c.type}<span className="block text-[10px] text-muted-foreground">#{c.number}</span></td>
                  <td className="p-2">{l?.name ?? "Unassigned"}<span className="block text-[10px] text-muted-foreground">{l?.estimateLine}</span></td>
                  <td className="p-2">{c.commitmentId ?? "—"}</td>
                  <td className="p-2">{c.source}</td>
                  <td className="p-2 text-right tabular-nums font-semibold">{c.financial ? money(c.amount) : "—"}</td>
                  <td className="p-2 text-right tabular-nums">{c.tax ? money(c.tax) : "—"}</td>
                  <td className="p-2">{c.date}{c.dueDate && <span className="block text-[10px] text-muted-foreground">due {c.dueDate}</span>}</td>
                  <td className="p-2"><Pill label={c.approval} tone={c.approval === "Needs Review" ? "bad" : c.approval === "Paid" ? "good" : "muted"} /></td>
                  <td className="p-2"><Pill label={c.sync} tone={c.sync === "Synced" ? "good" : c.sync === "Mismatch" ? "bad" : "muted"} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>

      <EuclidImpact domain="Cost" tone="neutral"
        message="Approved internal Mayfield time posts as actual labor cost. Fixed-price subcontractor crew hours appear here as production only — their financial cost posts from the subcontract invoice against the commitment, so subcontract labor is never double counted." />
    </div>
  );
}
