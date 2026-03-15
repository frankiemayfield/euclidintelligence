import { OwnerLayout } from "@/components/homeowner/OwnerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { proposals, scopeCategories, euclidScopeNotes, type ScopeStatus } from "@/data/homeownerData";
import { useState } from "react";

function fmt(n: number) { return "$" + n.toLocaleString(); }

function StatusCell({ status }: { status: ScopeStatus }) {
  const styles: Record<ScopeStatus, string> = {
    "Included": "bg-primary/10 text-primary border-primary/20",
    "Excluded": "bg-destructive/10 text-destructive border-destructive/20",
    "Allowance": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Unclear": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    "Not Mentioned": "bg-muted text-muted-foreground border-border",
  };
  return <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${styles[status]}`}>{status}</Badge>;
}

export default function HomeownerComparisonPage() {
  const [filter, setFilter] = useState<"all" | "flags" | "allowances" | "missing">("all");

  const totals = proposals.map(p => p.total);
  const lowest = Math.min(...totals);
  const highest = Math.max(...totals);
  const spread = highest - lowest;
  const mostComplete = [...proposals].sort((a, b) => b.completenessScore - a.completenessScore)[0];
  const mostFlags = [...proposals].sort((a, b) => b.missingFlags - a.missingFlags)[0];

  const filteredCategories = scopeCategories.filter(cat => {
    if (filter === "all") return true;
    const statuses = proposals.map(p => p.scopeCoverage[cat]);
    if (filter === "flags") return statuses.some(s => s === "Excluded" || s === "Unclear" || s === "Not Mentioned");
    if (filter === "allowances") return statuses.some(s => s === "Allowance");
    if (filter === "missing") return statuses.some(s => s === "Not Mentioned" || s === "Excluded");
    return true;
  });

  return (
    <OwnerLayout>
      <div className="p-6 space-y-6 max-w-[1400px]">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proposal Comparison</h1>
          <p className="text-sm text-muted-foreground mt-1">Side-by-side scope normalization across all contractor proposals</p>
        </div>

        {/* Summary Band */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">Lowest</p><p className="text-sm font-bold text-foreground">{fmt(lowest)}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">Highest</p><p className="text-sm font-bold text-foreground">{fmt(highest)}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">Spread</p><p className="text-sm font-bold text-foreground">{fmt(spread)}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">Most Complete</p><p className="text-sm font-bold text-foreground">{mostComplete.contractor.split(" ")[0]}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">Most Flags</p><p className="text-sm font-bold text-foreground">{mostFlags.contractor.split(" ")[0]}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-[11px] text-muted-foreground">Avg Allowances</p><p className="text-sm font-bold text-foreground">{(proposals.reduce((s, p) => s + p.allowanceCount, 0) / proposals.length).toFixed(1)}</p></CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {(["all", "flags", "allowances", "missing"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {f === "all" ? "All Categories" : f === "flags" ? "Flags Only" : f === "allowances" ? "Allowances Only" : "Missing Items"}
            </button>
          ))}
        </div>

        {/* Comparison Matrix */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground min-w-[180px]">Scope Category</th>
                    {proposals.map(p => (
                      <th key={p.id} className="text-center p-3 font-medium text-muted-foreground min-w-[140px]">
                        <div>{p.contractor.split(" ").slice(0, 2).join(" ")}</div>
                        <div className="text-[10px] font-normal">{fmt(p.total)}</div>
                      </th>
                    ))}
                    <th className="text-left p-3 font-medium text-muted-foreground min-w-[260px]">Euclid Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((cat) => (
                    <tr key={cat} className="border-b border-border hover:bg-muted/10 transition-colors">
                      <td className="p-3 font-medium text-foreground">{cat}</td>
                      {proposals.map(p => (
                        <td key={p.id} className="p-3 text-center">
                          <StatusCell status={p.scopeCoverage[cat]} />
                        </td>
                      ))}
                      <td className="p-3 text-xs text-muted-foreground">{euclidScopeNotes[cat]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </OwnerLayout>
  );
}
