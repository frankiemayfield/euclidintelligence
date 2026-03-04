export interface TradeComparison {
  trade: string;
  yourCost: number;
  yourSell: number;
  benchmark: number;
  variance: number;
  insight: string;
  comparableCount: number;
  benchmarkRange: string;
  benchmarkLow: number;
  benchmarkHigh: number;
  pricingNote: string;
  primaryDriver: "labor" | "material" | "scope" | "markup" | "fee";
  suggestedAction: string;
  category: "base" | "general" | "prebuild";
}

export const tradeComparisons: TradeComparison[] = [
  { trade: "Concrete", yourCost: 11200, yourSell: 14570, benchmark: 13800, variance: 5.6, insight: "Concrete sell price is slightly above local benchmark after markup. Material costs may be driving the difference.", comparableCount: 4200, benchmarkRange: "$11,800 – $15,900", benchmarkLow: 11800, benchmarkHigh: 15900, pricingNote: "30% markup applied — above peer average", primaryDriver: "material", suggestedAction: "Hold — within acceptable range after markup.", category: "base" },
  { trade: "Framing", yourCost: 21500, yourSell: 28070, benchmark: 25200, variance: 11.4, insight: "Lumber package is 11% above local benchmark after pricing. Verify framing waste factor and lumber grade selection.", comparableCount: 3800, benchmarkRange: "$22,100 – $28,600", benchmarkLow: 22100, benchmarkHigh: 28600, pricingNote: "Markup driving above-market position", primaryDriver: "material", suggestedAction: "Reduce framing markup by 2% or verify material grade.", category: "base" },
  { trade: "Insulation", yourCost: 4800, yourSell: 6170, benchmark: 5900, variance: 4.6, insight: "Within expected range for R-19 wall / R-38 ceiling spec after markup.", comparableCount: 3100, benchmarkRange: "$4,800 – $7,200", benchmarkLow: 4800, benchmarkHigh: 7200, pricingNote: "Pricing aligned with market", primaryDriver: "material", suggestedAction: "No action needed — pricing aligned with market.", category: "base" },
  { trade: "Drywall", yourCost: 10800, yourSell: 14310, benchmark: 13100, variance: 9.2, insight: "Drywall sell price is elevated for this spec level. Check if Level 5 finish is required.", comparableCount: 4500, benchmarkRange: "$11,200 – $15,400", benchmarkLow: 11200, benchmarkHigh: 15400, pricingNote: "Material markup driving above-market position", primaryDriver: "markup", suggestedAction: "Check if Level 5 finish is required — may justify premium.", category: "base" },
  { trade: "Flooring", yourCost: 9200, yourSell: 12350, benchmark: 11500, variance: 7.4, insight: "Mid-tier LVP pricing is above median after markup. Material selection may be the driver.", comparableCount: 3600, benchmarkRange: "$9,400 – $14,100", benchmarkLow: 9400, benchmarkHigh: 14100, pricingNote: "Within acceptable range", primaryDriver: "material", suggestedAction: "Review material spec — LVP grade may be over-spec'd.", category: "base" },
  { trade: "Plumbing", yourCost: 16400, yourSell: 21770, benchmark: 20900, variance: 4.2, insight: "Plumbing sell price is within expected range for full rough + finish scope.", comparableCount: 2800, benchmarkRange: "$17,800 – $24,200", benchmarkLow: 17800, benchmarkHigh: 24200, pricingNote: "Sub quote pricing — competitive", primaryDriver: "labor", suggestedAction: "No action needed — sub quote is competitive.", category: "base" },
  { trade: "HVAC", yourCost: 13100, yourSell: 16710, benchmark: 21200, variance: -21.2, insight: "HVAC sell price is significantly below peer median. Ductwork may not be adequately covered in the current allowance.", comparableCount: 2600, benchmarkRange: "$18,100 – $25,800", benchmarkLow: 18100, benchmarkHigh: 25800, pricingNote: "⚠ Allowance-based — risk of under-scope", primaryDriver: "scope", suggestedAction: "Revisit HVAC scope — ductwork may be missing from allowance.", category: "base" },
  { trade: "Electrical", yourCost: 14900, yourSell: 19770, benchmark: 19000, variance: 4.1, insight: "Electrical is within expected range. Panel upgrade aligns with comparable projects.", comparableCount: 3200, benchmarkRange: "$16,400 – $22,800", benchmarkLow: 16400, benchmarkHigh: 22800, pricingNote: "Sub quote — well-positioned", primaryDriver: "labor", suggestedAction: "Hold — electrical pricing is well-positioned.", category: "base" },
  { trade: "Earthwork", yourCost: 7400, yourSell: 10120, benchmark: 9100, variance: 11.2, insight: "Slightly elevated after markup. Verify haul distance and soil condition assumptions.", comparableCount: 2100, benchmarkRange: "$7,400 – $12,100", benchmarkLow: 7400, benchmarkHigh: 12100, pricingNote: "Overhead allocation may be driving overshoot", primaryDriver: "markup", suggestedAction: "Verify haul distance and soil assumptions.", category: "base" },
  { trade: "Paving", yourCost: 2100, yourSell: 2820, benchmark: 3400, variance: -17.1, insight: "Paving sell price is below peer median. May indicate under-scoped repair area.", comparableCount: 1800, benchmarkRange: "$2,600 – $5,100", benchmarkLow: 2600, benchmarkHigh: 5100, pricingNote: "Review scope completeness", primaryDriver: "scope", suggestedAction: "Verify paving scope completeness — repair area may be under-scoped.", category: "base" },
];

export const fmt = (n: number) => `$${n.toLocaleString()}`;
