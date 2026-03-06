import { SubLayout } from "@/components/sub/SubLayout";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const tradeComparisons = [
  { category: "Labor", estimated: 8188, actual: 8600, variance: 5.0 },
  { category: "Lumber/Materials", estimated: 8620, actual: 9100, variance: 5.6 },
  { category: "Trusses", estimated: 4070, actual: 4070, variance: 0 },
  { category: "Sheathing", estimated: 3055, actual: 3200, variance: 4.7 },
  { category: "Hardware", estimated: 1200, actual: 1350, variance: 12.5 },
  { category: "Headers/LVL", estimated: 810, actual: 810, variance: 0 },
  { category: "Misc/Blocking", estimated: 1880, actual: 2100, variance: 11.7 },
];

const fmt = (n: number) => `$${n.toLocaleString()}`;

export default function SubEstVsActualPage() {
  const totalEst = tradeComparisons.reduce((s, t) => s + t.estimated, 0);
  const totalAct = tradeComparisons.reduce((s, t) => s + t.actual, 0);
  const totalVar = ((totalAct - totalEst) / totalEst * 100).toFixed(1);

  return (
    <SubLayout>
      <div className="p-6 lg:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Estimate vs Actual</h1>
          <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Framing post-project review</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5 shadow-card text-center">
            <p className="text-xs text-muted-foreground">Estimated Total</p>
            <p className="font-display text-2xl font-bold text-foreground">{fmt(totalEst)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-card text-center">
            <p className="text-xs text-muted-foreground">Actual Total</p>
            <p className="font-display text-2xl font-bold text-foreground">{fmt(totalAct)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-card text-center">
            <p className="text-xs text-muted-foreground">Budget Drift</p>
            <p className={`font-display text-2xl font-bold ${Number(totalVar) > 5 ? "text-destructive" : "text-warning"}`}>+{totalVar}%</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-foreground">Category Variance Report</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Category", "Estimated", "Actual", "Variance"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tradeComparisons.map(t => (
                <tr key={t.category} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-5 py-3 font-medium text-foreground">{t.category}</td>
                  <td className="px-5 py-3 text-muted-foreground">{fmt(t.estimated)}</td>
                  <td className="px-5 py-3 text-foreground">{fmt(t.actual)}</td>
                  <td className="px-5 py-3 flex items-center gap-1">
                    {t.variance > 0 ? <TrendingUp size={14} className="text-destructive" /> :
                     t.variance < 0 ? <TrendingDown size={14} className="text-primary" /> :
                     <Minus size={14} className="text-muted-foreground" />}
                    <span className={t.variance > 5 ? "text-destructive" : t.variance < 0 ? "text-primary" : "text-muted-foreground"}>
                      {t.variance > 0 ? "+" : ""}{t.variance}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-card p-5">
          <h2 className="font-display font-semibold text-foreground mb-3">Lessons Learned</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Hardware costs consistently underestimated — increase standard allowance by 10%</p>
            <p>• Blocking scope expanded during framing phase — build in buffer for field conditions</p>
            <p>• Lumber pricing was stable but material waste slightly exceeded estimate</p>
            <p>• Truss and LVL costs were accurate — continue using current pricing basis</p>
          </div>
        </div>
      </div>
    </SubLayout>
  );
}
