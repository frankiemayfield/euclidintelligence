import { HomeownerLayout } from "@/components/homeowner/HomeownerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { homeowner, budgetCategories } from "@/data/homeownerData";

function fmt(n: number) { return "$" + n.toLocaleString(); }

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "On Track": "bg-primary/10 text-primary border-primary/20",
    "Watch": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Over Budget": "bg-destructive/10 text-destructive border-destructive/20",
    "Needs Review": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  };
  return <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${styles[status] || ""}`}>{status}</Badge>;
}

export default function HomeownerBudgetPage() {
  const totals = budgetCategories.reduce((acc, c) => ({
    original: acc.original + c.originalBudget,
    changes: acc.changes + c.approvedChanges,
    invoiced: acc.invoiced + c.invoiced,
    paid: acc.paid + c.paid,
    remaining: acc.remaining + c.remaining,
    projected: acc.projected + c.projectedFinal,
  }), { original: 0, changes: 0, invoiced: 0, paid: 0, remaining: 0, projected: 0 });

  const delta = totals.projected - totals.original;

  return (
    <HomeownerLayout>
      <div className="p-6 space-y-6 max-w-[1400px]">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Budget Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">Post-award financial tracking for {homeowner.selectedContractor}</p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Selected Proposal", value: fmt(homeowner.selectedProposalAmount) },
            { label: "Approved Changes", value: fmt(totals.changes) },
            { label: "Invoiced", value: fmt(totals.invoiced) },
            { label: "Paid", value: fmt(totals.paid) },
            { label: "Pending Reviews", value: "3" },
            { label: "Projected Final", value: fmt(totals.projected) },
            { label: "Delta vs. Original", value: (delta >= 0 ? "+" : "") + fmt(delta) },
          ].map(m => (
            <Card key={m.label}>
              <CardContent className="p-3">
                <p className="text-[11px] text-muted-foreground">{m.label}</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Budget Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Original</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Changes</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Invoiced</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Paid</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Remaining</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Projected</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetCategories.map((c) => (
                    <tr key={c.category} className="border-b border-border hover:bg-muted/10 transition-colors">
                      <td className="p-3 font-medium text-foreground">{c.category}</td>
                      <td className="p-3 text-right text-muted-foreground">{fmt(c.originalBudget)}</td>
                      <td className="p-3 text-right text-muted-foreground">{c.approvedChanges > 0 ? fmt(c.approvedChanges) : "—"}</td>
                      <td className="p-3 text-right text-muted-foreground">{c.invoiced > 0 ? fmt(c.invoiced) : "—"}</td>
                      <td className="p-3 text-right text-muted-foreground">{c.paid > 0 ? fmt(c.paid) : "—"}</td>
                      <td className="p-3 text-right text-foreground font-medium">{fmt(c.remaining)}</td>
                      <td className="p-3 text-right text-foreground font-semibold">{fmt(c.projectedFinal)}</td>
                      <td className="p-3 text-center"><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                  {/* Totals */}
                  <tr className="bg-muted/30 font-semibold">
                    <td className="p-3 text-foreground">Total</td>
                    <td className="p-3 text-right text-foreground">{fmt(totals.original)}</td>
                    <td className="p-3 text-right text-foreground">{fmt(totals.changes)}</td>
                    <td className="p-3 text-right text-foreground">{fmt(totals.invoiced)}</td>
                    <td className="p-3 text-right text-foreground">{fmt(totals.paid)}</td>
                    <td className="p-3 text-right text-foreground">{fmt(totals.remaining)}</td>
                    <td className="p-3 text-right text-foreground">{fmt(totals.projected)}</td>
                    <td className="p-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </HomeownerLayout>
  );
}
