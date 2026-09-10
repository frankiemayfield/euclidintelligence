import { useState } from "react";
import { Plus } from "lucide-react";
import { money, getProject } from "@/data/demoUniverse";
import { billingImpact, ClientInvoice, invoicesFor, paymentsFor, projectFinancials } from "@/data/financialData";
import { EuclidImpact } from "@/components/app/active/EuclidImpact";
import { cn } from "@/lib/utils";
import { Filters, Metric, Panel, Pill } from "./FinancialPrimitives";

const TABS = ["Invoices", "Payments", "Deposits", "Credits", "Retainage"];

function InvoicePreview({ invoice, projectName, retainagePct }: { invoice: ClientInvoice; projectName: string; retainagePct: number }) {
  const subtotal = invoice.amount;
  return (
    <div className="rounded-xl bg-white p-6 text-[11px] text-neutral-800 shadow-sm">
      <div className="flex items-start justify-between border-b border-neutral-200 pb-4">
        <div>
          <p className="font-display text-lg font-bold text-neutral-900">Mayfield &amp; Co.</p>
          <p className="text-[10px] text-neutral-500">Cincinnati, Ohio · General Contractor / Design-Build</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-neutral-900">Invoice {invoice.number}</p>
          <p className="text-[10px] text-neutral-500">Issued {invoice.issued} · Due {invoice.due}</p>
        </div>
      </div>
      <p className="mt-3 font-semibold text-neutral-900">{projectName}</p>
      <p className="text-[10px] text-neutral-500">Billing period {invoice.periodFrom} – {invoice.periodTo} · {invoice.method}</p>
      <table className="mt-4 w-full">
        <thead><tr className="border-b border-neutral-200 text-[10px] uppercase text-neutral-500">
          <th className="py-1 text-left">Scope</th><th className="py-1 text-right">Contract</th><th className="py-1 text-right">Previously billed</th><th className="py-1 text-right">This invoice</th><th className="py-1 text-right">Remaining</th>
        </tr></thead>
        <tbody>
          {invoice.lines.map(l => (
            <tr key={l.scope} className="border-b border-neutral-100">
              <td className="py-1.5">{l.scope}</td>
              <td className="py-1.5 text-right tabular-nums">{money(l.contract)}</td>
              <td className="py-1.5 text-right tabular-nums">{money(l.previouslyBilled)}</td>
              <td className="py-1.5 text-right font-semibold tabular-nums">{money(l.thisInvoice)}</td>
              <td className="py-1.5 text-right tabular-nums">{money(l.contract - l.previouslyBilled - l.thisInvoice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 ml-auto w-56 space-y-1">
        <p className="flex justify-between"><span className="text-neutral-500">Subtotal</span><b>{money(subtotal)}</b></p>
        <p className="flex justify-between"><span className="text-neutral-500">Retainage ({retainagePct}%)</span><b>-{money(invoice.retainage)}</b></p>
        <p className="flex justify-between border-t border-neutral-200 pt-1 text-[13px]"><span className="font-semibold">Total due</span><b>{money(subtotal - invoice.retainage)}</b></p>
      </div>
      <p className="mt-4 text-[10px] text-neutral-500">Payment terms: net 30. Retainage released at substantial completion.</p>
    </div>
  );
}

export function ClientBillingTab({ projectId }: { projectId: string }) {
  const [tab, setTab] = useState("Invoices");
  const [preview, setPreview] = useState<string | null>(null);
  const f = projectFinancials(projectId);
  const invoices = invoicesFor(projectId);
  const payments = paymentsFor(projectId);
  const impact = billingImpact(projectId);
  const project = getProject(projectId);
  const shown = invoices.find(i => i.id === preview) ?? invoices[invoices.length - 1];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Current Contract" value={f.currentContract} />
        <Metric label="Invoiced to Date" value={f.invoiced} />
        <Metric label="Paid to Date" value={f.paid} />
        <Metric label="Outstanding A/R" value={f.outstandingAR} tone={f.outstandingAR > 0 ? "bad" : "good"} />
        <Metric label="Remaining to Invoice" value={f.remainingToInvoice} />
        <Metric label="Retainage Receivable" value={f.retainage} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Filters options={TABS} value={tab} onChange={setTab} />
        <button className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"><Plus size={12} />New Invoice</button>
      </div>

      <EuclidImpact domain="Cost" tone={impact.tone} headline="Billing intelligence" message={impact.message} />

      {tab === "Invoices" && (
        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title="Invoices" className="p-0">
            {invoices.map(i => (
              <button key={i.id} onClick={() => setPreview(i.id)} className={cn("flex w-full items-center justify-between gap-3 border-b border-border/40 p-4 text-left last:border-0 hover:bg-card/40", shown?.id === i.id && "bg-card/40")}>
                <span>
                  <span className="block text-sm font-semibold">Invoice {i.number}</span>
                  <span className="block text-[11px] text-muted-foreground">{i.method} · {i.periodFrom} – {i.periodTo} · due {i.due}</span>
                </span>
                <span className="flex items-center gap-2 text-[11px]"><b>{money(i.amount)}</b><Pill label={i.status} tone={i.status === "Paid" ? "good" : i.status === "Overdue" ? "bad" : "info"} /></span>
              </button>
            ))}
          </Panel>
          <Panel title="Print preview">{shown && <InvoicePreview invoice={shown} projectName={project.name} retainagePct={f.contract.retainagePct} />}</Panel>
        </div>
      )}

      {tab === "Payments" && (
        <Panel className="p-0">
          {payments.map(p => (
            <div key={p.id} className="flex items-center justify-between border-b border-border/40 p-4 text-[11px] last:border-0">
              <span>{invoices.find(i => i.id === p.invoiceId)?.number} — {p.method}<span className="block text-[10px] text-muted-foreground">{p.date} · ref {p.reference}</span></span>
              <span className="flex items-center gap-2"><b>{money(p.amount)}</b><Pill label={p.sync} tone={p.sync === "Synced" ? "good" : "muted"} /></span>
            </div>
          ))}
        </Panel>
      )}

      {tab === "Deposits" && <Panel><p className="text-[11px] text-muted-foreground">No deposits recorded on this contract. Deposit billing is available when creating a new invoice.</p></Panel>}

      {tab === "Credits" && <Panel><p className="text-[11px] text-muted-foreground">No client credits issued. Credits reduce the current contract and appear on the next invoice.</p></Panel>}

      {tab === "Retainage" && (
        <Panel title="Owner retainage receivable">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Metric label="Contract Billing" value={f.invoiced} />
            <Metric label="Retainage Held" value={f.retainage} sub={`${f.contract.retainagePct}%`} />
            <Metric label="Currently Due" value={f.invoiced - f.retainage - f.paid} />
            <Metric label="Retainage Balance" value={f.retainage} />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Retainage is tracked separately from A/R and released at substantial completion.</p>
        </Panel>
      )}
    </div>
  );
}
