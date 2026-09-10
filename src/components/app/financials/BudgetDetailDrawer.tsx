import { X } from "lucide-react";
import { money } from "@/data/demoUniverse";
import {
  BudgetLine, budgetImpact, budgetRevisions, changesFor, commitmentById, costsForLine,
  forecast, forecastToComplete, remainingCommitment, revisedBudget, variance,
} from "@/data/financialData";
import { EuclidImpact } from "@/components/app/active/EuclidImpact";
import { Pill, Variance } from "./FinancialPrimitives";

function Row({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <p className="flex items-center justify-between border-b border-border/35 py-1.5 text-[11px] last:border-0" title={hint}>
      <span className="text-muted-foreground">{label}</span><b>{value}</b>
    </p>
  );
}

export function BudgetDetailDrawer({ line, onClose, base }: { line: BudgetLine; onClose: () => void; base: string }) {
  const tx = costsForLine(line.id);
  const impact = budgetImpact(line);
  const revs = budgetRevisions.filter(r => r.lineId === line.id);
  const related = changesFor(line.projectId).filter(c => c.budgetLineId === line.id);

  return (
    <div className="fixed inset-0 z-[95] flex justify-end bg-background/40 backdrop-blur-sm" onClick={onClose}>
      <aside className="odyssey-surface header-scroll-fade m-3 flex w-[min(520px,calc(100vw-1.5rem))] flex-col overflow-y-auto rounded-2xl p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{line.group} · {line.costCode}</p>
            <h2 className="font-display text-lg font-semibold">{line.name}</h2>
            <p className="text-[11px] text-muted-foreground">Estimate line {line.estimateLine} · {line.phase} · {line.percentComplete}% installed</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>

        <div className="mt-4 space-y-4 text-[11px]">
          <section>
            <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Budget</p>
            <Row label="Original" value={money(line.originalBudget)} />
            <Row label="Approved changes" value={money(line.approvedChanges)} />
            <Row label="Revised" value={money(revisedBudget(line))} hint="Original Budget + Approved Budget Adjustments" />
          </section>
          <section>
            <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Commitments</p>
            <Row label="Current committed" value={money(line.committed)} />
            <Row label="Remaining commitment" value={money(remainingCommitment(line))} hint="Current Commitment − Actual Against Commitment" />
          </section>
          <section>
            <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Actual</p>
            <Row label="Posted actual cost" value={money(line.actual)} />
          </section>
          <section>
            <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Forecast</p>
            <Row label="Remaining committed" value={money(remainingCommitment(line))} />
            <Row label="Uncommitted forecast" value={money(line.forecastUncommitted)} />
            <Row label="Forecast to complete" value={money(forecastToComplete(line))} hint="Remaining Commitments + Forecast Uncommitted Cost" />
            <Row label="Euclid forecast" value={money(line.euclidForecast)} />
            {line.pmForecast != null && <Row label="PM forecast" value={money(line.pmForecast)} />}
            <Row label="Forecast at completion" value={money(forecast(line))} hint="Actual Cost + Forecast to Complete" />
            {line.pendingExposure > 0 && <Row label="Pending exposure" value={money(line.pendingExposure)} />}
          </section>
          <section>
            <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Variance</p>
            <Row label="Projected variance" value={<Variance value={variance(line)} />} hint="Revised Budget − Forecast at Completion" />
          </section>

          {line.pmForecast != null && (
            <div className="rounded-xl border border-border/60 p-3">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">PM forecast override</p>
              <p className="mt-1">Euclid {money(line.euclidForecast)} · PM {money(line.pmForecast)} · override {money(line.pmForecast - line.euclidForecast)}</p>
              <p className="mt-1 text-muted-foreground">{line.pmForecastReason} — {line.pmForecastBy}, {line.pmForecastAt}</p>
            </div>
          )}

          <EuclidImpact domain="Cost" tone={impact.tone} message={impact.message} action={{ label: "Open Estimate vs Actual", to: `${base}/est-vs-actual` }} />

          <section>
            <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Transactions</p>
            {tx.length ? tx.map(t => (
              <div key={t.id} className="flex items-center justify-between gap-2 border-b border-border/35 py-2 last:border-0">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{t.vendor} — {t.type} #{t.number}</span>
                  <span className="block text-[10px] text-muted-foreground">{t.source} · {t.date}{t.commitmentId ? ` · ${t.commitmentId}` : ""}{!t.financial ? " · production only" : ""}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2"><b>{money(t.amount)}</b><Pill label={t.approval} tone={t.approval === "Needs Review" ? "bad" : t.approval === "Paid" ? "good" : "muted"} /></span>
              </div>
            )) : <p className="text-muted-foreground">No costs have posted against this line yet.</p>}
          </section>

          {revs.length > 0 && (
            <section>
              <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Budget revision history</p>
              {revs.map(r => (
                <p key={r.date + r.source} className="border-b border-border/35 py-1.5 last:border-0">
                  {r.date} · {money(r.from)} → {money(r.to)}<span className="block text-[10px] text-muted-foreground">{r.reason} · {r.user} · {r.source}</span>
                </p>
              ))}
            </section>
          )}

          {related.length > 0 && (
            <section>
              <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Related changes</p>
              {related.map(c => (
                <p key={c.id} className="flex items-center justify-between border-b border-border/35 py-1.5 last:border-0">
                  <span>{c.id} · {c.title}</span><Pill label={c.status} tone={c.status === "Approved" ? "good" : "info"} />
                </p>
              ))}
            </section>
          )}

          {commitmentById(tx[0]?.commitmentId) && (
            <p className="text-[10px] text-muted-foreground">Primary commitment: {commitmentById(tx[0]?.commitmentId)?.id} — {commitmentById(tx[0]?.commitmentId)?.company}</p>
          )}
        </div>
      </aside>
    </div>
  );
}
