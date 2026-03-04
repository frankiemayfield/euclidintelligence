import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface RollupProps {
  baseScope: number;
  generalReqs: number;
  allowances: number;
  selectionsVariance: number;
  alternatesImpact: number;
}

export function EstimateRollup({ baseScope, generalReqs, allowances, selectionsVariance, alternatesImpact }: RollupProps) {
  const estimatedTotal = baseScope + generalReqs + allowances + selectionsVariance + alternatesImpact;

  const items = [
    { label: "Base Scope", value: baseScope, icon: DollarSign },
    { label: "General Requirements", value: generalReqs, icon: DollarSign },
    { label: "Allowances", value: allowances, icon: DollarSign },
    { label: "Selections Variance", value: selectionsVariance, icon: selectionsVariance >= 0 ? TrendingUp : TrendingDown, highlight: selectionsVariance !== 0 },
    { label: "Alternates Impact", value: alternatesImpact, icon: alternatesImpact >= 0 ? TrendingUp : AlertTriangle, highlight: alternatesImpact !== 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
      {items.map((item) => (
        <div key={item.label} className="bg-card border border-border rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <item.icon size={12} className={item.highlight ? (item.value >= 0 ? "text-warning" : "text-destructive") : "text-muted-foreground"} />
            <span className="text-[10px] text-muted-foreground">{item.label}</span>
          </div>
          <p className={`font-display text-sm font-bold ${item.highlight ? (item.value >= 0 ? "text-warning" : "text-destructive") : "text-foreground"}`}>
            {item.value < 0 ? "-" : ""}${Math.abs(item.value).toLocaleString()}
          </p>
        </div>
      ))}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <DollarSign size={12} className="text-primary" />
          <span className="text-[10px] text-primary font-medium">Estimated Cost Total</span>
        </div>
        <p className="font-display text-sm font-bold text-primary">${estimatedTotal.toLocaleString()}</p>
      </div>
    </div>
  );
}
