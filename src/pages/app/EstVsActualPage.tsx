import { AppLayout } from "@/components/app/AppLayout";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const tradeComparisons = [
  { trade: "Concrete", estimated: 12400, actual: 13100, variance: 5.6 },
  { trade: "Framing", estimated: 23800, actual: 22900, variance: -3.8 },
  { trade: "Insulation", estimated: 5400, actual: 5400, variance: 0 },
  { trade: "Drywall", estimated: 12160, actual: 12800, variance: 5.3 },
  { trade: "Flooring", estimated: 10500, actual: 11200, variance: 6.7 },
  { trade: "Plumbing", estimated: 18500, actual: 19100, variance: 3.2 },
  { trade: "HVAC", estimated: 14200, actual: 16900, variance: 19 },
  { trade: "Electrical", estimated: 16800, actual: 17200, variance: 2.4 },
];

const changeOrders = [
  { id: "CO-001", desc: "HVAC ductwork addition", amount: 2700, status: "Approved" },
  { id: "CO-002", desc: "Structural header upgrade", amount: 1800, status: "Approved" },
  { id: "CO-003", desc: "Additional outlet locations (6)", amount: 900, status: "Pending" },
];

export default function EstVsActualPage() {
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  const totalEst = tradeComparisons.reduce((s, t) => s + t.estimated, 0);
  const totalAct = tradeComparisons.reduce((s, t) => s + t.actual, 0);
  const totalVar = ((totalAct - totalEst) / totalEst * 100).toFixed(1);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Estimate vs Actual</h1>
          <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Post-award review</p>
        </div>

        {/* Summary */}
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
            <p className={`font-display text-2xl font-bold ${Number(totalVar) > 5 ? "text-destructive" : "text-warning"}`}>
              +{totalVar}%
            </p>
          </div>
        </div>

        {/* Trade Variance */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-foreground">Trade Variance Report</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Trade</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Estimated</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Actual</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Variance</th>
              </tr>
            </thead>
            <tbody>
              {tradeComparisons.map((t) => (
                <tr key={t.trade} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-5 py-3 font-medium text-foreground">{t.trade}</td>
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

        {/* Change Orders */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-foreground">Change Orders</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">ID</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Description</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {changeOrders.map((co) => (
                <tr key={co.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{co.id}</td>
                  <td className="px-5 py-3 text-foreground">{co.desc}</td>
                  <td className="px-5 py-3 font-display font-semibold text-foreground">{fmt(co.amount)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      co.status === "Approved" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                    }`}>{co.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
