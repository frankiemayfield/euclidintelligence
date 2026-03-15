import { OwnerLayout } from "@/components/homeowner/OwnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { proposals } from "@/data/homeownerData";
import { useState } from "react";

function fmt(n: number) { return "$" + n.toLocaleString(); }

interface MarketBenchmark {
  category: string;
  marketLow: number;
  marketMid: number;
  marketHigh: number;
}

const marketBenchmarks: MarketBenchmark[] = [
  { category: "General Conditions", marketLow: 14000, marketMid: 18000, marketHigh: 24000 },
  { category: "Demolition", marketLow: 8000, marketMid: 12000, marketHigh: 16000 },
  { category: "Framing", marketLow: 22000, marketMid: 28000, marketHigh: 35000 },
  { category: "Structural Repairs", marketLow: 5000, marketMid: 9000, marketHigh: 15000 },
  { category: "Roofing", marketLow: 10000, marketMid: 14000, marketHigh: 20000 },
  { category: "Windows & Doors", marketLow: 16000, marketMid: 22000, marketHigh: 30000 },
  { category: "Plumbing", marketLow: 20000, marketMid: 27000, marketHigh: 35000 },
  { category: "Electrical", marketLow: 18000, marketMid: 24000, marketHigh: 32000 },
  { category: "HVAC", marketLow: 14000, marketMid: 19000, marketHigh: 26000 },
  { category: "Insulation & Drywall", marketLow: 12000, marketMid: 16000, marketHigh: 22000 },
  { category: "Cabinets", marketLow: 24000, marketMid: 32000, marketHigh: 45000 },
  { category: "Countertops", marketLow: 8000, marketMid: 12000, marketHigh: 18000 },
  { category: "Tile", marketLow: 6000, marketMid: 9000, marketHigh: 14000 },
  { category: "Flooring", marketLow: 12000, marketMid: 18000, marketHigh: 25000 },
  { category: "Painting", marketLow: 10000, marketMid: 15000, marketHigh: 20000 },
  { category: "Fixtures", marketLow: 4000, marketMid: 7000, marketHigh: 12000 },
  { category: "Appliances", marketLow: 8000, marketMid: 13000, marketHigh: 20000 },
  { category: "Permits", marketLow: 3000, marketMid: 5000, marketHigh: 8000 },
  { category: "Cleanup & Punch", marketLow: 6000, marketMid: 9000, marketHigh: 14000 },
];

// Simulated category-level amounts for each proposal
const proposalCategoryAmounts: Record<string, Record<string, number | null>> = {
  "alder-ridge": {
    "General Conditions": 18500, "Demolition": 12800, "Framing": 28400, "Structural Repairs": 8200,
    "Roofing": 14600, "Windows & Doors": 22100, "Plumbing": 26800, "Electrical": 24200,
    "HVAC": 18900, "Insulation & Drywall": 16400, "Cabinets": 32000, "Countertops": 12500,
    "Tile": 7800, "Flooring": 18200, "Painting": 14800, "Fixtures": 6200,
    "Appliances": 14000, "Permits": 4800, "Cleanup & Punch": 9900,
  },
  "summit-oak": {
    "General Conditions": 16000, "Demolition": 11500, "Framing": 26000, "Structural Repairs": null,
    "Roofing": 13200, "Windows & Doors": 20800, "Plumbing": 24500, "Electrical": 22000,
    "HVAC": null, "Insulation & Drywall": 15200, "Cabinets": 30000, "Countertops": 6000,
    "Tile": 5000, "Flooring": 7500, "Painting": null, "Fixtures": 3200,
    "Appliances": null, "Permits": null, "Cleanup & Punch": null,
  },
  "northline": {
    "General Conditions": 17200, "Demolition": 12000, "Framing": 27500, "Structural Repairs": 7800,
    "Roofing": null, "Windows & Doors": 21500, "Plumbing": 25800, "Electrical": 23500,
    "HVAC": 18200, "Insulation & Drywall": 15800, "Cabinets": 31000, "Countertops": 7000,
    "Tile": 5500, "Flooring": 17500, "Painting": 13500, "Fixtures": 4000,
    "Appliances": 10000, "Permits": 4500, "Cleanup & Punch": 9200,
  },
};

function getPosition(value: number | null, benchmark: MarketBenchmark): "Below" | "Within" | "Above" | "N/A" {
  if (value === null) return "N/A";
  if (value < benchmark.marketLow) return "Below";
  if (value > benchmark.marketHigh) return "Above";
  return "Within";
}

function PositionBadge({ position }: { position: string }) {
  const styles: Record<string, string> = {
    "Below": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Within": "bg-primary/10 text-primary border-primary/20",
    "Above": "bg-destructive/10 text-destructive border-destructive/20",
    "N/A": "bg-muted text-muted-foreground border-border",
  };
  return <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${styles[position] || ""}`}>{position}</Badge>;
}

export default function HomeownerMarketComparisonPage() {
  const [selectedProposal, setSelectedProposal] = useState(proposals[0].id);
  const proposal = proposals.find(p => p.id === selectedProposal)!;
  const amounts = proposalCategoryAmounts[selectedProposal];

  const totalMarketMid = marketBenchmarks.reduce((s, b) => s + b.marketMid, 0);
  const totalMarketLow = marketBenchmarks.reduce((s, b) => s + b.marketLow, 0);
  const totalMarketHigh = marketBenchmarks.reduce((s, b) => s + b.marketHigh, 0);

  return (
    <OwnerLayout>
      <div className="p-6 space-y-6 max-w-[1400px]">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Market Comparison</h1>
          <p className="text-sm text-muted-foreground mt-1">Compare proposal pricing against Cincinnati-area residential renovation market benchmarks</p>
        </div>

        {/* Proposal Selector */}
        <div className="flex items-center gap-2">
          {proposals.map(p => (
            <button key={p.id} onClick={() => setSelectedProposal(p.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedProposal === p.id ? "bg-primary/10 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border"
              }`}
            >
              {p.contractor.split(" ").slice(0, 2).join(" ")} · {fmt(p.total)}
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">Proposal Total</p><p className="text-sm font-bold text-foreground">{fmt(proposal.total)}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">Market Range</p><p className="text-sm font-bold text-foreground">{fmt(totalMarketLow)}–{fmt(totalMarketHigh)}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">Market Midpoint</p><p className="text-sm font-bold text-foreground">{fmt(totalMarketMid)}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">Delta vs. Mid</p><p className="text-sm font-bold text-foreground">{proposal.total > totalMarketMid ? "+" : ""}{fmt(proposal.total - totalMarketMid)}</p></CardContent></Card>
        </div>

        {/* Category Comparison Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{proposal.contractor} — Category-Level Market Position</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Proposal</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Market Low</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Market Mid</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Market High</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Position</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Delta vs Mid</th>
                  </tr>
                </thead>
                <tbody>
                  {marketBenchmarks.map((b) => {
                    const amount = amounts[b.category];
                    const position = getPosition(amount, b);
                    const delta = amount !== null ? amount - b.marketMid : null;
                    return (
                      <tr key={b.category} className="border-b border-border hover:bg-muted/10 transition-colors">
                        <td className="p-3 font-medium text-foreground">{b.category}</td>
                        <td className="p-3 text-right font-semibold text-foreground">{amount !== null ? fmt(amount) : "—"}</td>
                        <td className="p-3 text-right text-muted-foreground">{fmt(b.marketLow)}</td>
                        <td className="p-3 text-right text-muted-foreground">{fmt(b.marketMid)}</td>
                        <td className="p-3 text-right text-muted-foreground">{fmt(b.marketHigh)}</td>
                        <td className="p-3 text-center"><PositionBadge position={position} /></td>
                        <td className="p-3 text-right text-sm">
                          {delta !== null ? (
                            <span className={delta > 0 ? "text-destructive" : delta < 0 ? "text-amber-600" : "text-muted-foreground"}>
                              {delta > 0 ? "+" : ""}{fmt(delta)}
                            </span>
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Euclid Observations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Euclid Market Observations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedProposal === "alder-ridge" && (
              <>
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-sm text-foreground">Alder Ridge pricing sits near market midpoint across most categories. Cabinets and countertops are at or slightly above mid-market, consistent with the included scope depth. No material outliers detected.</p>
                </div>
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <p className="text-sm text-foreground">Overall market alignment is strong. This proposal is competitively positioned relative to Cincinnati-area benchmarks for a whole-home renovation of this scope.</p>
                </div>
              </>
            )}
            {selectedProposal === "summit-oak" && (
              <>
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-sm text-foreground">Summit Oak shows below-market pricing in multiple categories, but several key categories (Painting, Permits, Appliances, Cleanup) have no pricing — these are excluded from the proposal. The apparent savings are largely driven by scope omission rather than competitive pricing.</p>
                </div>
                <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                  <p className="text-sm text-foreground">Caution: When excluded categories are estimated at market midpoint, Summit Oak's effective total rises to approximately $318K–$340K, placing it at or above Alder Ridge on a comparable basis.</p>
                </div>
              </>
            )}
            {selectedProposal === "northline" && (
              <>
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-sm text-foreground">Northline pricing is generally within market range. Fixture and appliance allowances are below market midpoint, creating moderate overrun risk. Roofing is not priced — confirm whether roofing scope is included in the renovation.</p>
                </div>
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <p className="text-sm text-foreground">Overall a solid mid-market proposal. Primary exposure is in fixture/appliance allowances and the unpriced roofing category.</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </OwnerLayout>
  );
}
