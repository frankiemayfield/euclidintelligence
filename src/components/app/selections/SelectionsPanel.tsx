import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Package, Plus } from "lucide-react";
import { money } from "@/data/demoUniverse";
import { changesFor, commitmentById, lineById, Selection, selectionsFor } from "@/data/financialData";
import { EuclidImpact } from "@/components/app/active/EuclidImpact";
import { cn } from "@/lib/utils";
import { Metric, Panel, Pill } from "@/components/app/financials/FinancialPrimitives";

const STAGES = ["Not Started", "Requested", "Reviewing", "Selected", "Approved", "Ordered", "Received", "Installed"] as const;

const variance = (s: Selection) => (s.cost ?? 0) - s.allowance;
const clientImpact = (s: Selection) => Math.round(variance(s) * (1 + s.markupPct / 100));

function Detail({ s, base }: { s: Selection; base: string }) {
  const v = variance(s);
  const change = changesFor(s.projectId).find(c => c.id === s.changeId);
  const commitment = commitmentById(s.commitmentId);
  const allowanceLine = lineById(s.allowanceLineId);
  return (
    <div className="border-t border-border/40 bg-card/25 p-4 text-[11px]">
      <div className="mb-3 flex flex-wrap gap-1">
        {STAGES.map(st => (
          <span key={st} className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", s.status === st ? "bg-primary/15 text-primary" : "bg-secondary/70 text-muted-foreground")}>{st}</span>
        ))}
      </div>
      <p className="mb-3">{s.description}</p>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
        <Metric label="Allowance" value={s.allowance} sub={allowanceLine ? `Budget: ${allowanceLine.name}` : "No linked allowance"} />
        <Metric label="Selected Cost" value={s.cost ?? 0} />
        <Metric label="Allowance Variance" value={s.cost ? `${v >= 0 ? "+" : "-"}${money(Math.abs(v))}` : "—"} tone={v > 0 ? "bad" : "good"} />
        <Metric label="Markup" value={`${s.markupPct}%`} />
        <Metric label="Client Impact" value={s.cost ? `${clientImpact(s) >= 0 ? "+" : "-"}${money(Math.abs(clientImpact(s)))}` : "—"} />
        <Metric label="Lead Time" value={`${s.leadTimeWeeks} weeks`} />
      </div>

      <p className="mt-3 text-muted-foreground">
        Decision due {s.decisionDue} · required on site {s.requiredOnSite}{s.vendor ? ` · ${s.vendor}` : ""}{s.selectedItem ? ` · ${s.selectedItem}` : ""}
        {s.scheduleActivity ? ` · installs at "${s.scheduleActivity}"` : ""}
      </p>

      {s.overdueDays ? (
        <EuclidImpact className="mt-3" domain="Schedule" tone="warning"
          message={`This selection is ${s.overdueDays} days overdue. A ${s.leadTimeWeeks}-week procurement lead time now creates a ${Math.max(1, s.overdueDays - 1)}-day risk to ${s.scheduleActivity ?? "the installation activity"}.`} />
      ) : v > 0 ? (
        <EuclidImpact className="mt-3" domain="Cost" tone="warning"
          message={`The selected package is ${money(v)} above the ${money(s.allowance)} allowance. At ${s.markupPct}% markup that is ${money(clientImpact(s))} of client impact${change ? ` — captured on change ${change.id} (${change.status.toLowerCase()})` : " — create a change to move it to the client contract"}.`}
          action={change ? { label: "Open the change", to: `${base}/projects/${s.projectId}/financials/changes` } : undefined} />
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2 font-semibold text-primary">
        {!change && v > 0 && <button className="rounded-full bg-primary/10 px-3 py-1">Create Change</button>}
        {change && <Link to={`${base}/projects/${s.projectId}/financials/changes`} className="rounded-full bg-primary/10 px-3 py-1">View Change {change.id}</Link>}
        {!commitment && (s.status === "Approved" || s.status === "Selected") && <button className="rounded-full bg-primary/10 px-3 py-1">Create Purchase Order</button>}
        {commitment && <Link to={`${base}/projects/${s.projectId}/financials/commitments`} className="rounded-full bg-primary/10 px-3 py-1">View {commitment.id} — {money(commitment.original)}</Link>}
        <button className="rounded-full bg-primary/10 px-3 py-1">Request client decision</button>
      </div>
      {s.notes && <p className="mt-2 text-[10px] text-muted-foreground">{s.notes}</p>}
    </div>
  );
}

export function SelectionsPanel({ projectId, base }: { projectId: string; base: string }) {
  const list = selectionsFor(projectId);
  const [open, setOpen] = useState<string | null>(list[0]?.id ?? null);

  const dueThisWeek = list.filter(s => !s.overdueDays && ["Not Started", "Requested", "Reviewing"].includes(s.status)).length;
  const overdue = list.filter(s => s.overdueDays).length;
  const awaiting = list.filter(s => s.status === "Requested" || s.status === "Reviewing").length;

  if (!list.length) return <Panel><p className="text-[11px] text-muted-foreground">No selections have been created for this project yet.</p></Panel>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
        <Metric label="Due This Week" value={dueThisWeek} />
        <Metric label="Overdue" value={overdue} tone={overdue ? "bad" : "good"} />
        <Metric label="Awaiting Client" value={awaiting} />
        <Metric label="Approved" value={list.filter(s => s.status === "Approved").length} />
        <Metric label="Ordered" value={list.filter(s => s.status === "Ordered").length} />
        <Metric label="Installed" value={list.filter(s => s.status === "Installed" || s.status === "Received").length} />
      </div>

      <Panel title="Selections" className="p-0"
        action={<button className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary"><Plus size={12} />New selection</button>}>
        {list.map(s => (
          <div key={s.id} className="border-b border-border/40 last:border-0">
            <button onClick={() => setOpen(o => o === s.id ? null : s.id)} className="flex w-full flex-wrap items-center gap-3 p-4 text-left hover:bg-card/40">
              <span className="min-w-[180px] flex-1">
                <span className="block text-sm font-semibold">{s.title}</span>
                <span className="block text-[11px] text-muted-foreground">{s.category}{s.vendor ? ` · ${s.vendor}` : ""}</span>
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><CalendarClock size={12} />Due {s.decisionDue}</span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Package size={12} />On site {s.requiredOnSite}</span>
              <span className="text-[11px]"><span className="block text-muted-foreground">Allowance</span><b>{money(s.allowance)}</b></span>
              <span className="text-[11px]"><span className="block text-muted-foreground">Variance</span><b className={variance(s) > 0 ? "text-warning" : "text-success"}>{s.cost ? `${variance(s) >= 0 ? "+" : "-"}${money(Math.abs(variance(s)))}` : "—"}</b></span>
              {s.overdueDays ? <Pill label={`${s.overdueDays}d overdue`} tone="bad" /> : <Pill label={s.status} tone={["Approved", "Ordered", "Received", "Installed"].includes(s.status) ? "good" : "info"} />}
            </button>
            {open === s.id && <Detail s={s} base={base} />}
          </div>
        ))}
      </Panel>

      <p className="text-[11px] text-muted-foreground">Selections are decisions. The money lives on the allowance in Financials → Budget, and flows through Changes, Commitments and Costs as decisions are made.</p>
    </div>
  );
}
