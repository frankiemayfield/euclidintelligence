import { useState } from "react";
import { Link } from "react-router-dom";
import { money } from "@/data/demoUniverse";
import { Commitment, commitmentsFor, costs, currentCommitment, lineById, remainingOnCommitment, retainageHeld } from "@/data/financialData";
import { EuclidImpact } from "@/components/app/active/EuclidImpact";
import { Metric, Panel, Pill } from "./FinancialPrimitives";

function Detail({ c }: { c: Commitment }) {
  const invoices = costs.filter(x => x.commitmentId === c.id);
  const overBilled = c.billedPct != null && c.schedulePct != null && c.billedPct - c.schedulePct >= 20;
  return (
    <div className="border-t border-border/40 bg-card/25 p-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
        <Metric label="Original Commitment" value={c.original} />
        <Metric label="Approved Changes" value={c.approvedChanges} />
        <Metric label="Current Commitment" value={currentCommitment(c)} />
        <Metric label="Invoiced to Date" value={c.invoiced} />
        <Metric label="Paid" value={c.paid} />
        <Metric label="Remaining" value={remainingOnCommitment(c)} tone={remainingOnCommitment(c) < 0 ? "bad" : "default"} />
        <Metric label="Retainage Held" value={retainageHeld(c)} sub={`${c.retainagePct}% held`} />
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">Source: {c.source} · Linked estimate lines: {c.budgetLineIds.map(id => lineById(id)?.estimateLine).filter(Boolean).join(", ")}</p>

      {c.billedPct != null && c.schedulePct != null && (
        <div className="mt-3">
          <p className="text-[11px]">Progress billing: {c.billedPct}% billed against {c.schedulePct}% installed progress.</p>
          {overBilled && <EuclidImpact className="mt-2" domain="Cost" tone="warning" message={`${c.company} is ${c.billedPct}% billed against ${c.schedulePct}% reported installed progress on this subcontract. Billing is materially ahead of installed progress — review before approval.`} />}
        </div>
      )}

      {remainingOnCommitment(c) < 0 && (
        <EuclidImpact className="mt-2" domain="Cost" tone="warning"
          message={`Invoicing of ${money(c.invoiced)} exceeds the current commitment of ${money(currentCommitment(c))} by ${money(Math.abs(remainingOnCommitment(c)))}. Adjust the commitment, create a change, or partially approve the invoice.`} />
      )}

      <p className="mt-3 text-[10px] font-bold uppercase text-muted-foreground">Invoices against this commitment</p>
      {invoices.length ? invoices.map(i => (
        <p key={i.id} className="flex items-center justify-between border-b border-border/35 py-1.5 text-[11px] last:border-0">
          <span>{i.vendor} #{i.number}<span className="block text-[10px] text-muted-foreground">{i.date} · {i.source}</span></span>
          <span className="flex items-center gap-2"><b>{money(i.amount)}</b><Pill label={i.approval} tone={i.approval === "Paid" ? "good" : i.approval === "Needs Review" ? "bad" : "muted"} /></span>
        </p>
      )) : <p className="text-[11px] text-muted-foreground">No invoices have been received against this commitment.</p>}

      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-primary">
        <button className="rounded-full bg-primary/10 px-3 py-1">Create commitment change</button>
        <button className="rounded-full bg-primary/10 px-3 py-1">Record payment</button>
        <button className="rounded-full bg-primary/10 px-3 py-1">Request lien waiver</button>
      </div>
    </div>
  );
}

export function CommitmentsTab({ projectId }: { projectId: string }) {
  const list = commitmentsFor(projectId);
  const [open, setOpen] = useState<string | null>(list[0]?.id ?? null);
  const total = list.reduce((t, c) => t + currentCommitment(c), 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Metric label="Current Commitments" value={total} />
        <Metric label="Invoiced to Date" value={list.reduce((t, c) => t + c.invoiced, 0)} />
        <Metric label="Remaining Committed" value={list.reduce((t, c) => t + Math.max(remainingOnCommitment(c), 0), 0)} />
        <Metric label="Retainage Held" value={list.reduce((t, c) => t + retainageHeld(c), 0)} />
      </div>

      <Panel className="p-0" >
        {list.map(c => (
          <div key={c.id} className="border-b border-border/40 last:border-0">
            <button onClick={() => setOpen(o => o === c.id ? null : c.id)} className="flex w-full flex-wrap items-center gap-3 p-4 text-left hover:bg-card/40">
              <span className="min-w-[180px] flex-1">
                <span className="block text-sm font-semibold">{c.company}</span>
                <span className="block text-[11px] text-muted-foreground">{c.id} · {c.type} · {c.scope}</span>
              </span>
              <span className="text-[11px]"><span className="block text-muted-foreground">Current</span><b>{money(currentCommitment(c))}</b></span>
              <span className="text-[11px]"><span className="block text-muted-foreground">Invoiced</span><b>{money(c.invoiced)}</b></span>
              <span className="text-[11px]"><span className="block text-muted-foreground">Remaining</span><b>{money(remainingOnCommitment(c))}</b></span>
              <Pill label={c.status} tone={c.status === "Exception" ? "bad" : c.status === "Closed" ? "muted" : "good"} />
            </button>
            {open === c.id && <Detail c={c} />}
          </div>
        ))}
      </Panel>

      <p className="text-[11px] text-muted-foreground">Commitments are created when a bid is awarded in Preconstruction or when a Selection is approved — scope and pricing are never re-entered. <Link to="/network" className="font-semibold text-primary">Open Network</Link></p>
    </div>
  );
}
