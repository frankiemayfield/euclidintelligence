import { CheckCircle, AlertTriangle, Info, DollarSign, BarChart3, Users } from "lucide-react";
import { SubBid, formatCurrency } from "./bidLevelingData";

interface BidSummaryCardsProps {
  items: SubBid[];
}

export function BidSummaryCards({ items }: BidSummaryCardsProps) {
  const completeScope = items.filter(b => b.packageCoverage >= 90).length;
  const withExclusions = items.filter(b => b.exclusions.length > 0).length;
  const needsClarification = items.filter(b => b.status === "Needs Clarification" || b.clarifications.some(c => !c.resolved)).length;
  const avgRaw = items.length ? Math.round(items.reduce((s, b) => s + b.rawTotal, 0) / items.length) : 0;
  const avgLeveled = items.length ? Math.round(items.reduce((s, b) => s + b.leveledTotal, 0) / items.length) : 0;
  const leveledSpread = items.length > 1
    ? Math.max(...items.map(b => b.leveledTotal)) - Math.min(...items.map(b => b.leveledTotal))
    : 0;

  const cards = [
    { icon: Users, label: "Bids Received", value: items.length.toString(), color: "text-primary" },
    { icon: CheckCircle, label: "Complete Scope", value: `${completeScope} of ${items.length}`, color: "text-primary" },
    { icon: AlertTriangle, label: "With Exclusions", value: withExclusions.toString(), color: "text-warning" },
    { icon: Info, label: "Needs Clarification", value: needsClarification.toString(), color: "text-destructive" },
    { icon: DollarSign, label: "Avg Raw Bid", value: formatCurrency(avgRaw), color: "text-muted-foreground" },
    { icon: BarChart3, label: "Avg Leveled Total", value: formatCurrency(avgLeveled), color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((c) => (
        <div key={c.label} className="bg-card border border-border rounded-2xl p-3.5 shadow-card">
          <div className="flex items-center gap-2 mb-1.5">
            <c.icon size={14} className={c.color} />
            <p className="text-[11px] text-muted-foreground font-medium">{c.label}</p>
          </div>
          <p className="font-display text-lg font-bold text-foreground">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
