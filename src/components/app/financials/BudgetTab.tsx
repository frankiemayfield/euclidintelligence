import { useState } from "react";
import { ChevronRight, Columns3, Layers, SlidersHorizontal } from "lucide-react";
import { money } from "@/data/demoUniverse";
import {
  BudgetLine, costToComplete, forecast, groupsFor, projectFinancials, revisedBudget, variance, forecastHistory,
} from "@/data/financialData";
import { Dropdown, DropdownToggle } from "@/components/app/active/Dropdown";
import { EuclidImpact } from "@/components/app/active/EuclidImpact";
import { cn } from "@/lib/utils";
import { Metric, Panel, Variance } from "./FinancialPrimitives";
import { BudgetDetailDrawer } from "./BudgetDetailDrawer";

const VIEWS = ["Estimate Structure", "Cost Code", "Trade", "Phase"] as const;
const OPTIONAL = ["Original Budget", "Approved Changes", "Cost to Complete", "Pending Exposure", "Client Price", "% Complete"] as const;

export function BudgetTab({ projectId, base }: { projectId: string; base: string }) {
  const [viewBy, setViewBy] = useState<(typeof VIEWS)[number]>("Estimate Structure");
  const [mode, setMode] = useState<"Current" | "Forecast">("Current");
  const [cols, setCols] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [detail, setDetail] = useState<BudgetLine | null>(null);

  const f = projectFinancials(projectId);
  const groups = groupsFor(projectId, viewBy);
  const on = (c: string) => !!cols[c];
  const history = forecastHistory[projectId] ?? [];

  const cells = (r: { original: number; approvedChanges: number; revised: number; committed: number; actual: number; forecast: number; costToComplete: number; pendingExposure: number; clientPrice: number; variance: number }, pct?: number) => (
    <>
      {on("Original Budget") && <td className="p-2 text-right tabular-nums">{money(r.original)}</td>}
      {on("Approved Changes") && <td className="p-2 text-right tabular-nums">{money(r.approvedChanges)}</td>}
      <td className="p-2 text-right tabular-nums">{money(r.revised)}</td>
      <td className="p-2 text-right tabular-nums">{money(r.committed)}</td>
      <td className="p-2 text-right tabular-nums">{money(r.actual)}</td>
      <td className="p-2 text-right tabular-nums">{money(mode === "Forecast" ? r.forecast : r.actual + 0)}</td>
      {on("Cost to Complete") && <td className="p-2 text-right tabular-nums">{money(r.costToComplete)}</td>}
      {on("Pending Exposure") && <td className="p-2 text-right tabular-nums">{money(r.pendingExposure)}</td>}
      {on("Client Price") && <td className="p-2 text-right tabular-nums">{money(r.clientPrice)}</td>}
      {on("% Complete") && <td className="p-2 text-right tabular-nums">{pct != null ? `${pct}%` : "—"}</td>}
      <td className="p-2 text-right tabular-nums"><Variance value={r.variance} /></td>
    </>
  );

  return (
    <div className="space-y-3">
      <Panel title="Project financial position">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
          <Metric label="Original Budget" value={f.original} />
          <Metric label="Approved Budget Changes" value={f.approvedChanges} />
          <Metric label="Revised Budget" value={f.revised} />
          <Metric label="Committed" value={f.committed} />
          <Metric label="Actual Cost" value={f.actual} />
          <Metric label="Forecast at Completion" value={f.forecast} />
          <Metric label="Projected Variance" value={`${f.variance < 0 ? "-" : "+"}${money(Math.abs(f.variance))}`} tone={f.variance < 0 ? "bad" : "good"} />
        </div>
      </Panel>

      <Panel title="Revenue / profitability">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
          <Metric label="Original Contract Value" value={f.contract.originalContract} />
          <Metric label="Approved Client Changes" value={f.contract.approvedClientChanges} />
          <Metric label="Current Contract Value" value={f.currentContract} />
          <Metric label="Invoiced" value={f.invoiced} />
          <Metric label="Paid" value={f.paid} />
          <Metric label="Remaining to Invoice" value={f.remainingToInvoice} />
          <Metric label="Forecast Gross Profit" value={f.forecastGP} />
          <Metric label="Forecast Margin" value={`${f.forecastMargin.toFixed(1)}%`} />
          <Metric label="Original Margin" value={`${f.originalMargin.toFixed(1)}%`} />
          <Metric label="Margin Erosion" value={`${f.marginErosion.toFixed(1)} pts`} tone={f.marginErosion < 0 ? "bad" : "good"} />
          <Metric label="Pending Exposure" value={f.pendingExposure} tone="bad" />
          <Metric label="Risk-Adjusted Forecast" value={f.riskAdjustedForecast} />
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">Builder cost and client price are tracked separately. Actual cost changes margin; client price only changes through an approved Change.</p>
      </Panel>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full bg-muted/60 p-0.5">
          {(["Current", "Forecast"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={cn("rounded-full px-3 py-1 text-[11px] font-semibold text-muted-foreground", mode === m && "bg-card text-foreground shadow-sm")}>{m}</button>
          ))}
        </div>
        <Dropdown label={`View By: ${viewBy}`} icon={Layers} align="start" width="w-56">
          {VIEWS.map(v => (
            <button key={v} onClick={() => setViewBy(v)} className={cn("block w-full rounded-lg px-2 py-1.5 text-left hover:bg-card/70", viewBy === v && "text-primary")}>{v}</button>
          ))}
        </Dropdown>
        <Dropdown label="Columns" icon={Columns3} align="start" width="w-60">
          {OPTIONAL.map(c => <DropdownToggle key={c} label={c} checked={on(c)} onChange={v => setCols(s => ({ ...s, [c]: v }))} />)}
        </Dropdown>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground"><SlidersHorizontal size={11} />{mode === "Forecast" ? "Showing where Euclid and the project team believe this project finishes." : "Showing what is currently posted and committed."}</span>
      </div>

      <Panel className="overflow-x-auto p-0">
        <table className="w-full min-w-[820px] text-[11px]">
          <thead className="text-[10px] uppercase text-muted-foreground">
            <tr className="border-b border-border/50">
              <th className="p-2 text-left">Scope / Cost Code</th>
              {on("Original Budget") && <th className="p-2 text-right">Original</th>}
              {on("Approved Changes") && <th className="p-2 text-right">Approved Chg</th>}
              <th className="p-2 text-right">Revised Budget</th>
              <th className="p-2 text-right">Committed</th>
              <th className="p-2 text-right">Actual</th>
              <th className="p-2 text-right">{mode === "Forecast" ? "Forecast" : "Posted"}</th>
              {on("Cost to Complete") && <th className="p-2 text-right">Cost to Complete</th>}
              {on("Pending Exposure") && <th className="p-2 text-right">Pending</th>}
              {on("Client Price") && <th className="p-2 text-right">Client Price</th>}
              {on("% Complete") && <th className="p-2 text-right">% Complete</th>}
              <th className="p-2 text-right">Variance</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <>
                <tr key={g.group} className="cursor-pointer border-b border-border/40 bg-card/30 font-semibold" onClick={() => setOpen(s => ({ ...s, [g.group]: !s[g.group] }))}>
                  <td className="p-2"><span className="flex items-center gap-1"><ChevronRight size={12} className={cn("transition-transform", open[g.group] && "rotate-90")} />{g.group}</span></td>
                  {cells(g)}
                </tr>
                {open[g.group] && g.lines.map(l => (
                  <tr key={l.id} className="cursor-pointer border-b border-border/30 hover:bg-card/40" onClick={() => setDetail(l)}>
                    <td className="py-2 pl-7 pr-2">{l.name}<span className="block text-[10px] text-muted-foreground">{l.costCode}{l.allowance ? " · allowance" : ""}</span></td>
                    {cells({
                      original: l.originalBudget, approvedChanges: l.approvedChanges, revised: revisedBudget(l), committed: l.committed,
                      actual: l.actual, forecast: forecast(l), costToComplete: costToComplete(l), pendingExposure: l.pendingExposure,
                      clientPrice: l.clientPrice, variance: variance(l),
                    }, l.percentComplete)}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </Panel>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title="Forecast history">
          <div className="space-y-1 text-[11px]">
            {history.map(h => (
              <p key={h.date} className="flex items-center justify-between border-b border-border/35 py-1 last:border-0">
                <span className="text-muted-foreground">{h.date}</span><Variance value={h.variance} />
              </p>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">Snapshots answer "when did we first know this project was going over budget?"</p>
        </Panel>
        {f.contingency && (
          <Panel title="Contingency">
            <div className="grid grid-cols-3 gap-2">
              <Metric label="Original" value={f.contingency.original} />
              <Metric label="Allocated" value={f.contingency.allocated} />
              <Metric label="Remaining" value={f.contingency.remaining} tone="good" />
            </div>
            <div className="mt-3 space-y-1 text-[11px]">
              {f.contingency.allocations.map(a => (
                <p key={a.date + a.reason} className="flex items-center justify-between border-b border-border/35 py-1 last:border-0">
                  <span>{a.reason}<span className="block text-[10px] text-muted-foreground">{a.date} · {a.user} · {a.source}</span></span>
                  <b>{money(a.amount)}</b>
                </p>
              ))}
            </div>
          </Panel>
        )}
      </div>

      <EuclidImpact domain="Cost" tone={f.variance < 0 ? "warning" : "positive"}
        message={`Forecast at completion is ${money(f.forecast)} against a revised budget of ${money(f.revised)} — ${f.variance < 0 ? `a projected overrun of ${money(Math.abs(f.variance))}` : `${money(f.variance)} favorable`}. ${money(f.pendingExposure)} of pending change exposure is not yet approved, giving a risk-adjusted forecast of ${money(f.riskAdjustedForecast)}.`}
        action={{ label: "Open Estimate vs Actual", to: `${base}/est-vs-actual` }} />

      {detail && <BudgetDetailDrawer line={detail} base={base} onClose={() => setDetail(null)} />}
    </div>
  );
}
