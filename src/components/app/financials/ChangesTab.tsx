import { useState } from "react";
import { money } from "@/data/demoUniverse";
import { ChangeRecord, changesFor, lineById, projectFinancials } from "@/data/financialData";
import { EuclidImpact } from "@/components/app/active/EuclidImpact";
import { cn } from "@/lib/utils";
import { Filters, Metric, Panel, Pill } from "./FinancialPrimitives";

const STAGES = ["Potential", "Pricing", "Submitted", "Approved", "Rejected"] as const;
const KINDS = ["All", "Owner Changes", "Sub/Vendor Changes", "Internal Budget Changes"];

const gp = (c: ChangeRecord) => c.clientImpact - c.costImpact;

function Row({ c }: { c: ChangeRecord }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/40 last:border-0">
      <button onClick={() => setOpen(o => !o)} className="flex w-full flex-wrap items-center gap-3 p-4 text-left hover:bg-card/40">
        <span className="min-w-[200px] flex-1">
          <span className="block text-sm font-semibold">{c.title}</span>
          <span className="block text-[11px] text-muted-foreground">{c.id} · {c.kind} · {c.source} · {c.date}</span>
        </span>
        <span className="text-[11px]"><span className="block text-muted-foreground">Cost</span><b>{money(c.costImpact)}</b></span>
        <span className="text-[11px]"><span className="block text-muted-foreground">Client price</span><b>{c.clientImpact ? money(c.clientImpact) : "—"}</b></span>
        <span className="text-[11px]"><span className="block text-muted-foreground">Gross profit</span><b>{c.clientImpact ? money(gp(c)) : "—"}</b></span>
        <Pill label={c.status} tone={c.status === "Approved" ? "good" : c.status === "Rejected" ? "muted" : "info"} />
      </button>
      {open && (
        <div className="border-t border-border/40 bg-card/25 p-4 text-[11px]">
          <div className="mb-3 flex flex-wrap gap-1">
            {STAGES.map(s => (
              <span key={s} className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", c.status === s ? "bg-primary/15 text-primary" : "bg-secondary/70 text-muted-foreground")}>{s}</span>
            ))}
          </div>
          <p className="mb-3">{c.scope}</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
            <Metric label="Cost Impact" value={c.costImpact} />
            <Metric label="Markup" value={`${c.markupPct}%`} />
            <Metric label="Client Price Impact" value={c.clientImpact} />
            <Metric label="Projected Gross Profit" value={c.clientImpact ? gp(c) : 0} />
            <Metric label="Schedule Impact" value={`${c.scheduleDays} days`} />
            <Metric label="Funding Source" value={c.fundingSource} />
          </div>
          <p className="mt-3 text-muted-foreground">
            Budget line: {lineById(c.budgetLineId)?.estimateLine ?? "—"}
            {c.commitmentId ? ` · Downstream commitment: ${c.commitmentId}` : ""}
            {c.selectionId ? ` · Related selection: ${c.selectionId}` : ""}
          </p>
          {c.status !== "Approved" && (
            <EuclidImpact className="mt-3" domain="Cost" tone="warning"
              message={`${money(c.costImpact)} of cost exposure sits in the ${c.status.toLowerCase()} stage. Approval would move the revised budget by ${money(c.costImpact)}${c.clientImpact ? ` and the current contract by ${money(c.clientImpact)}, adding ${money(gp(c))} of projected gross profit` : " with no client price change, so margin absorbs it"}.`} />
          )}
          <div className="mt-3 flex flex-wrap gap-2 font-semibold text-primary">
            <button className="rounded-full bg-primary/10 px-3 py-1">Price change</button>
            <button className="rounded-full bg-primary/10 px-3 py-1">Submit to client</button>
            <button className="rounded-full bg-primary/10 px-3 py-1">Approve</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChangesTab({ projectId }: { projectId: string }) {
  const [kind, setKind] = useState("All");
  const all = changesFor(projectId);
  const f = projectFinancials(projectId);
  const rows = all.filter(c => kind === "All" || c.kind + "s" === kind || (kind === "Owner Changes" && c.kind === "Owner Change") || (kind === "Sub/Vendor Changes" && c.kind === "Sub/Vendor Change") || (kind === "Internal Budget Changes" && c.kind === "Internal Budget Change"));
  const approved = all.filter(c => c.status === "Approved");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Metric label="Approved Client Changes" value={approved.reduce((t, c) => t + c.clientImpact, 0)} />
        <Metric label="Approved Cost Changes" value={approved.reduce((t, c) => t + c.costImpact, 0)} />
        <Metric label="Pending Change Exposure" value={f.pendingExposure} tone="bad" sub={`${f.pendingChanges.length} unresolved`} />
        <Metric label="Risk-Adjusted Forecast" value={f.riskAdjustedForecast} />
      </div>
      <Filters options={KINDS} value={kind} onChange={setKind} />
      <Panel className="p-0">{rows.map(c => <Row key={c.id} c={c} />)}</Panel>
    </div>
  );
}
