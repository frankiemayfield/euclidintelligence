import { OwnerLayout } from "@/components/homeowner/OwnerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { invoices } from "@/data/homeownerData";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

function fmt(n: number) { return "$" + n.toLocaleString(); }

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Looks Aligned": "bg-primary/10 text-primary border-primary/20",
    "Needs Review": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Unclear Source": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    "Potential Overlap": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    "Budget Impact High": "bg-destructive/10 text-destructive border-destructive/20",
  };
  return <Badge variant="outline" className={`text-[10px] px-2 py-0.5 whitespace-nowrap ${styles[status] || ""}`}>{status}</Badge>;
}

export default function HomeownerInvoicesPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);
  const needsReview = invoices.filter(i => i.status !== "Looks Aligned").length;

  return (
    <OwnerLayout>
      <div className="p-6 space-y-6 max-w-[1400px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
            <p className="text-sm text-muted-foreground mt-1">Review queue — each invoice checked against contract terms</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div><span className="text-muted-foreground">Total Invoiced:</span> <span className="font-bold text-foreground">{fmt(totalInvoiced)}</span></div>
            <div><span className="text-muted-foreground">Need Review:</span> <span className="font-bold text-foreground">{needsReview}</span></div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3 w-8"></th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Invoice</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Contractor</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <>
                      <tr key={inv.id}
                        className="border-b border-border hover:bg-muted/10 cursor-pointer transition-colors"
                        onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                      >
                        <td className="p-3">
                          {expandedId === inv.id ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
                        </td>
                        <td className="p-3 font-medium text-foreground">{inv.number}</td>
                        <td className="p-3 text-muted-foreground">{inv.contractor}</td>
                        <td className="p-3 text-muted-foreground">{inv.date}</td>
                        <td className="p-3 text-right font-semibold text-foreground">{fmt(inv.amount)}</td>
                        <td className="p-3 text-muted-foreground">{inv.category}</td>
                        <td className="p-3 text-center"><StatusBadge status={inv.status} /></td>
                      </tr>
                      {expandedId === inv.id && (
                        <tr key={`${inv.id}-detail`}>
                          <td colSpan={7} className="p-0">
                            <div className="bg-muted/20 border-b border-border p-5 space-y-3">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Description</p>
                                <p className="text-sm text-foreground">{inv.description}</p>
                              </div>
                              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                                <p className="text-xs text-muted-foreground mb-1">Euclid Review Note</p>
                                <p className="text-sm text-foreground">{inv.euclidNote}</p>
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
