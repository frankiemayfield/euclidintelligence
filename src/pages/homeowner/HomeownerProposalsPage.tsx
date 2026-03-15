import { HomeownerLayout } from "@/components/homeowner/HomeownerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { proposals, homeowner } from "@/data/homeownerData";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

function fmt(n: number) { return "$" + n.toLocaleString(); }

export default function HomeownerProposalsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <HomeownerLayout>
      <div className="p-6 space-y-6 max-w-[1400px]">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proposals</h1>
          <p className="text-sm text-muted-foreground mt-1">All contractor proposals for {homeowner.projectName}</p>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground w-8"></th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Contractor</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Total</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Completeness</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Allowances</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Exclusions</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Flags</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((p) => (
                    <>
                      <tr key={p.id}
                        className="border-b border-border hover:bg-muted/20 cursor-pointer transition-colors"
                        onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                      >
                        <td className="p-3">
                          {expandedId === p.id ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground whitespace-nowrap">{p.contractor}</span>
                            {p.contractor === homeowner.selectedContractor && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">Selected</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right font-semibold text-foreground">{fmt(p.total)}</td>
                        <td className="p-3 text-muted-foreground">{p.date}</td>
                        <td className="p-3 text-center">
                          <Badge variant={p.completenessScore >= 90 ? "default" : p.completenessScore >= 80 ? "secondary" : "destructive"} className="text-[10px]">
                            {p.completenessScore}%
                          </Badge>
                        </td>
                        <td className="p-3 text-center text-muted-foreground">{p.allowanceCount}</td>
                        <td className="p-3 text-center text-muted-foreground">{p.exclusionCount}</td>
                        <td className="p-3 text-center">
                          {p.missingFlags > 0 ? (
                            <Badge variant="destructive" className="text-[10px]">{p.missingFlags}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className="text-[10px]">{p.reviewStatus}</Badge>
                        </td>
                      </tr>
                      {expandedId === p.id && (
                        <tr key={`${p.id}-detail`}>
                          <td colSpan={9} className="p-0">
                            <div className="bg-muted/20 border-b border-border p-5">
                              <div className="grid grid-cols-3 gap-6">
                                {/* Summary */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground">Summary</h4>
                                  <p className="text-xs text-muted-foreground">{p.notes}</p>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Payment Schedule</p>
                                    <p className="text-xs text-foreground">{p.paymentSchedule}</p>
                                  </div>
                                </div>
                                {/* Allowances */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-foreground">Allowances</h4>
                                  {p.allowances.map((a, i) => (
                                    <div key={i} className="flex justify-between text-xs">
                                      <span className="text-muted-foreground">{a.item}</span>
                                      <span className="text-foreground font-medium">{fmt(a.amount)}</span>
                                    </div>
                                  ))}
                                </div>
                                {/* Exclusions & Assumptions */}
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-1">Exclusions</h4>
                                    <ul className="space-y-1">
                                      {p.exclusions.map((e, i) => (
                                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                          <span className="text-destructive mt-0.5">×</span> {e}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-1">Assumptions</h4>
                                    <ul className="space-y-1">
                                      {p.assumptions.map((a, i) => (
                                        <li key={i} className="text-xs text-muted-foreground">• {a}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </HomeownerLayout>
  );
}
