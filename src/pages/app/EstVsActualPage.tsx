import { AppLayout } from "@/components/app/AppLayout";
import { TrendingUp, TrendingDown, Minus, ChevronDown } from "lucide-react";
import { useState } from "react";

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

const driftLessons = [
  { trade: "HVAC", originalAssumption: "Ductwork bundled in $14,200 allowance — equipment + distribution", actualOutcome: "Ductwork alone cost $8,100. Total HVAC reached $16,900.", varianceImpact: "+$2,700 (19%)", lesson: "Always separate ductwork from equipment in HVAC allowances", status: "Logged" },
  { trade: "Drywall", originalAssumption: "3,200 SF based on interior partition lengths × 10 ft height", actualOutcome: "Added wall in mudroom increased SF to 3,400 SF", varianceImpact: "+$640 (5.3%)", lesson: "Verify wall counts during framing rough-in before drywall order", status: "Logged" },
  { trade: "Flooring", originalAssumption: "1,400 SF LVP at $7.50/SF with 7% waste", actualOutcome: "Client upgraded to premium LVP at $8.00/SF. Waste was 9%.", varianceImpact: "+$700 (6.7%)", lesson: "Lock material selection earlier. Increase waste factor for complex layouts.", status: "Under Review" },
  { trade: "Plumbing", originalAssumption: "Lump sum $18,500 from sub quote — full rough + finish", actualOutcome: "Field condition required re-route of drain line. Additional $600.", varianceImpact: "+$600 (3.2%)", lesson: "Include field condition contingency for below-slab plumbing", status: "Logged" },
];

export default function EstVsActualPage() {
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  const totalEst = tradeComparisons.reduce((s, t) => s + t.estimated, 0);
  const totalAct = tradeComparisons.reduce((s, t) => s + t.actual, 0);
  const totalVar = ((totalAct - totalEst) / totalEst * 100).toFixed(1);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Estimate vs Actual</h1>
          <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Post-award review & learning loop</p>
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
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden mb-8">
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

        {/* Original Assumptions vs Reality */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-foreground">Original Assumptions vs Reality</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Where the estimate drift came from — lessons for future projects</p>
          </div>
          <div className="divide-y divide-border">
            {driftLessons.map((d, i) => (
              <div key={i}>
                <button
                  onClick={() => setExpandedLesson(expandedLesson === i ? null : i)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors text-left"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{d.trade} — {d.varianceImpact}</p>
                    <p className="text-xs text-muted-foreground truncate">{d.originalAssumption}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    d.status === "Logged" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                  }`}>{d.status}</span>
                  <ChevronDown size={14} className={`text-muted-foreground transition-transform ${expandedLesson === i ? "rotate-180" : ""}`} />
                </button>
                {expandedLesson === i && (
                  <div className="px-5 pb-4 text-xs space-y-2">
                    <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
                      <div><span className="text-muted-foreground">Original Assumption:</span> <span className="text-foreground ml-1">{d.originalAssumption}</span></div>
                      <div><span className="text-muted-foreground">Actual Outcome:</span> <span className="text-foreground ml-1">{d.actualOutcome}</span></div>
                      <div><span className="text-muted-foreground">Variance Impact:</span> <span className="text-destructive ml-1">{d.varianceImpact}</span></div>
                      <div className="pt-1.5 border-t border-border">
                        <span className="text-muted-foreground">Lesson Learned:</span> <span className="text-foreground font-medium ml-1">{d.lesson}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
