import { HomeownerLayout } from "@/components/homeowner/HomeownerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { proposals } from "@/data/homeownerData";

function fmt(n: number) { return "$" + n.toLocaleString(); }

interface LeveledProposal {
  contractor: string;
  original: number;
  scopeGapExposure: "Low" | "Medium" | "High";
  allowanceRisk: "Low" | "Medium" | "High";
  exclusionRisk: "Low" | "Medium" | "High";
  estimatedComparableRange: [number, number];
  completenessRank: number;
  confidence: "High" | "Medium" | "Low";
  assessment: string;
}

const leveledData: LeveledProposal[] = [
  {
    contractor: "Alder Ridge Builders",
    original: 312400,
    scopeGapExposure: "Low",
    allowanceRisk: "Medium",
    exclusionRisk: "Low",
    estimatedComparableRange: [312400, 324000],
    completenessRank: 1,
    confidence: "High",
    assessment: "Most complete proposal. Allowance exposure is moderate but within expected range for a project of this scope. Minimal risk of scope-related change orders.",
  },
  {
    contractor: "Summit Oak Construction",
    original: 278900,
    scopeGapExposure: "High",
    allowanceRisk: "High",
    exclusionRisk: "High",
    estimatedComparableRange: [318000, 345000],
    completenessRank: 3,
    confidence: "Low",
    assessment: "Lowest headline price but carries significant scope omission risk. Missing painting, permits, cleanup, and appliances could add $40K–$66K to actual project cost. Allowance amounts are materially below peer proposals.",
  },
  {
    contractor: "Northline Homes",
    original: 298750,
    scopeGapExposure: "Medium",
    allowanceRisk: "Medium",
    exclusionRisk: "Low",
    estimatedComparableRange: [305000, 322000],
    completenessRank: 2,
    confidence: "Medium",
    assessment: "Solid mid-range proposal. Fixture and appliance allowances are lower than Alder Ridge, creating moderate allowance overrun risk. Roofing scope needs confirmation. Generally well-structured.",
  },
];

function RiskBadge({ level }: { level: "Low" | "Medium" | "High" }) {
  const styles = {
    Low: "bg-primary/10 text-primary border-primary/20",
    Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    High: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${styles[level]}`}>{level}</Badge>;
}

export default function HomeownerLevelingPage() {
  return (
    <HomeownerLayout>
      <div className="p-6 space-y-6 max-w-[1400px]">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proposal Leveling</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Euclid-adjusted comparison accounting for scope gaps, allowance exposure, and exclusion risk
          </p>
        </div>

        {/* Leveling Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leveledData.map((ld) => (
            <Card key={ld.contractor} className={ld.completenessRank === 1 ? "border-primary/30" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{ld.contractor}</CardTitle>
                  {ld.completenessRank === 1 && (
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">Most Complete</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Original Proposal</p>
                    <p className="font-bold text-foreground text-base">{fmt(ld.original)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Estimated Comparable</p>
                    <p className="font-bold text-foreground text-base">{fmt(ld.estimatedComparableRange[0])}–{fmt(ld.estimatedComparableRange[1])}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><p className="text-[10px] text-muted-foreground mb-1">Scope Gap</p><RiskBadge level={ld.scopeGapExposure} /></div>
                  <div><p className="text-[10px] text-muted-foreground mb-1">Allowance</p><RiskBadge level={ld.allowanceRisk} /></div>
                  <div><p className="text-[10px] text-muted-foreground mb-1">Exclusions</p><RiskBadge level={ld.exclusionRisk} /></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Confidence</span>
                  <RiskBadge level={ld.confidence === "High" ? "Low" : ld.confidence === "Low" ? "High" : "Medium"} />
                  <span className="font-medium text-foreground">{ld.confidence}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leveled Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Leveled Proposal Table</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Contractor</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Original</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Scope Gap</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Allowance Risk</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Exclusion Risk</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Est. Comparable Range</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Rank</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {leveledData.sort((a, b) => a.completenessRank - b.completenessRank).map((ld) => (
                    <tr key={ld.contractor} className="border-b border-border hover:bg-muted/10">
                      <td className="p-3 font-medium text-foreground whitespace-nowrap">{ld.contractor}</td>
                      <td className="p-3 text-right font-semibold text-foreground">{fmt(ld.original)}</td>
                      <td className="p-3 text-center"><RiskBadge level={ld.scopeGapExposure} /></td>
                      <td className="p-3 text-center"><RiskBadge level={ld.allowanceRisk} /></td>
                      <td className="p-3 text-center"><RiskBadge level={ld.exclusionRisk} /></td>
                      <td className="p-3 text-right text-foreground">{fmt(ld.estimatedComparableRange[0])}–{fmt(ld.estimatedComparableRange[1])}</td>
                      <td className="p-3 text-center font-bold text-foreground">#{ld.completenessRank}</td>
                      <td className="p-3 text-center"><Badge variant="outline" className="text-[10px]">{ld.confidence}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Commentary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Euclid Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {leveledData.sort((a, b) => a.completenessRank - b.completenessRank).map((ld) => (
              <div key={ld.contractor} className="p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold text-foreground">{ld.contractor}</p>
                  <Badge variant="outline" className="text-[10px]">Rank #{ld.completenessRank}</Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{ld.assessment}</p>
              </div>
            ))}

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-semibold text-foreground mb-2">Euclid Recommendation</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Summit Oak Construction appears to be the lowest headline proposal, but also carries the highest scope omission risk and the largest finish allowance exposure. Alder Ridge Builders appears more expensive on face value, but is likely more complete once permit handling, painting, and waterproofing scope are normalized. Northline Homes represents a solid middle option with moderate risk. The true comparable range across all three proposals narrows significantly once scope gaps are accounted for.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </HomeownerLayout>
  );
}
