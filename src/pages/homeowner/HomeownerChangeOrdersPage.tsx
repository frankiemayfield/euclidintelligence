import { OwnerLayout } from "@/components/homeowner/OwnerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { changeOrders } from "@/data/homeownerData";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

function fmt(n: number) { return "$" + n.toLocaleString(); }

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Pending Review": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Approved": "bg-primary/10 text-primary border-primary/20",
    "Needs Clarification": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    "Budget Impact High": "bg-destructive/10 text-destructive border-destructive/20",
  };
  return <Badge variant="outline" className={`text-[10px] px-2 py-0.5 whitespace-nowrap ${styles[status] || ""}`}>{status}</Badge>;
}

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    "Owner Upgrade": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Unforeseen Condition": "bg-purple-500/10 text-purple-600 border-purple-500/20",
    "Scope Ambiguity": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    "Allowance Overrun": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };
  return <Badge variant="outline" className={`text-[10px] px-2 py-0.5 whitespace-nowrap ${styles[type] || ""}`}>{type}</Badge>;
}

export default function HomeownerChangeOrdersPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const totalApproved = changeOrders.filter(c => c.status === "Approved").reduce((s, c) => s + c.amount, 0);
  const pending = changeOrders.filter(c => c.status === "Pending Review").length;

  return (
    <OwnerLayout>
      <div className="p-6 space-y-6 max-w-[1400px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Change Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">Review and track scope changes against your original agreement</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div><span className="text-muted-foreground">Total Approved:</span> <span className="font-bold text-foreground">{fmt(totalApproved)}</span></div>
            <div><span className="text-muted-foreground">Pending:</span> <span className="font-bold text-foreground">{pending}</span></div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3 w-8"></th>
                    <th className="text-left p-3 font-medium text-muted-foreground">CO #</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Type</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Impact</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {changeOrders.map((co) => (
                    <>
                      <tr key={co.id}
                        className="border-b border-border hover:bg-muted/10 cursor-pointer transition-colors"
                        onClick={() => setExpandedId(expandedId === co.id ? null : co.id)}
                      >
                        <td className="p-3">
                          {expandedId === co.id ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
                        </td>
                        <td className="p-3 font-medium text-foreground">{co.number}</td>
                        <td className="p-3 text-muted-foreground">{co.date}</td>
                        <td className="p-3 text-right font-semibold text-foreground">{fmt(co.amount)}</td>
                        <td className="p-3 text-muted-foreground">{co.category}</td>
                        <td className="p-3 text-center"><TypeBadge type={co.type} /></td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className={`text-[10px] ${co.impactLevel === "High" ? "text-destructive" : co.impactLevel === "Medium" ? "text-amber-600" : "text-muted-foreground"}`}>
                            {co.impactLevel}
                          </Badge>
                        </td>
                        <td className="p-3 text-center"><StatusBadge status={co.status} /></td>
                      </tr>
                      {expandedId === co.id && (
                        <tr key={`${co.id}-detail`}>
                          <td colSpan={8} className="p-0">
                            <div className="bg-muted/20 border-b border-border p-5 space-y-3">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Reason</p>
                                <p className="text-sm text-foreground">{co.reason}</p>
                              </div>
                              {co.relatedProposalLanguage && (
                                <div className="p-3 rounded-lg border border-border bg-muted/30">
                                  <p className="text-xs text-muted-foreground mb-1">Related Proposal Language</p>
                                  <p className="text-sm text-foreground italic">"{co.relatedProposalLanguage}"</p>
                                </div>
                              )}
                              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                                <p className="text-xs text-muted-foreground mb-1">Euclid Assessment</p>
                                <p className="text-sm text-foreground">{co.euclidNote}</p>
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
    </OwnerLayout>
  );
}
