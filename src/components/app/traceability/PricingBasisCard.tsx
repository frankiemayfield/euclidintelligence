import { TrendingUp } from "lucide-react";

interface PricingBasisProps {
  source: string;
  region: string;
  basisDate: string;
  rangeLow: number;
  rangeHigh: number;
  selected: number;
  volatility: "Stable" | "Moderate" | "Volatile";
}

export function PricingBasisCard({ source, region, basisDate, rangeLow, rangeHigh, selected, volatility }: PricingBasisProps) {
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  const volColor = volatility === "Stable" ? "text-primary" : volatility === "Moderate" ? "text-warning" : "text-destructive";

  return (
    <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-foreground">
        <TrendingUp size={12} className="text-primary" />
        Pricing Basis
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
        <span>Source</span><span className="text-foreground">{source}</span>
        <span>Region</span><span className="text-foreground">{region}</span>
        <span>Basis Date</span><span className="text-foreground">{basisDate}</span>
        <span>Range</span><span className="text-foreground">{fmt(rangeLow)} – {fmt(rangeHigh)}</span>
        <span>Selected</span><span className="text-foreground font-semibold">{fmt(selected)}</span>
        <span>Volatility</span><span className={volColor}>{volatility}</span>
      </div>
    </div>
  );
}
