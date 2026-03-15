import { OwnerLayout } from "@/components/homeowner/OwnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { homeowner, proposals, openActions, recentActivity, budgetCategories } from "@/data/homeownerData";
import { AlertTriangle, CheckCircle2, Clock, DollarSign, FileText, TrendingUp } from "lucide-react";

function fmt(n: number) {
  return "$" + n.toLocaleString();
}

const metrics = [
  { label: "Target Budget", value: `${fmt(homeowner.targetBudgetLow)}–${fmt(homeowner.targetBudgetHigh)}`, icon: DollarSign },
  { label: "Selected Proposal", value: fmt(homeowner.selectedProposalAmount), sub: homeowner.selectedContractor, icon: FileText },
  { label: "Approved Changes", value: fmt(homeowner.approvedChanges), icon: TrendingUp },
  { label: "Projected Final", value: fmt(homeowner.projectedFinal), icon: DollarSign },
  { label: "Invoiced to Date", value: fmt(homeowner.invoicedToDate), icon: CheckCircle2 },
  { label: "Open Reviews", value: "3", icon: Clock },
];

export default function HomeownerOverviewPage() {
  const delta = homeowner.projectedFinal - homeowner.selectedProposalAmount;
  const overBudgetCount = budgetCategories.filter(c => c.status === "Over Budget").length;
  const watchCount = budgetCategories.filter(c => c.status === "Watch").length;

  return (
    <OwnerLayout>
      <div className="p-6 space-y-6 max-w-[1400px]">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{homeowner.projectName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {homeowner.name} · {homeowner.location} · {homeowner.projectType}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">Phase: {homeowner.phase}</Badge>
            <Badge variant="outline" className="text-xs">Contractor: {homeowner.selectedContractor}</Badge>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {metrics.map((m) => (
            <Card key={m.label} className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <m.icon size={14} />
                  <span className="text-xs font-medium">{m.label}</span>
                </div>
                <p className="text-lg font-bold text-foreground">{m.value}</p>
                {m.sub && <p className="text-[11px] text-muted-foreground mt-0.5">{m.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Status */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Project Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-muted-foreground text-xs">Pre-Construction</p>
                  <p className="font-semibold text-foreground">3 proposals · 1 selected</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-muted-foreground text-xs">Budget Health</p>
                  <p className="font-semibold text-foreground">{overBudgetCount} over · {watchCount} watch</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-muted-foreground text-xs">Invoices Pending</p>
                  <p className="font-semibold text-foreground">2 need review</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-muted-foreground text-xs">Change Orders</p>
                  <p className="font-semibold text-foreground">1 pending decision</p>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-border bg-primary/5">
                <p className="text-xs text-muted-foreground mb-1">Projected Final vs. Selected Proposal</p>
                <p className="font-semibold text-foreground">
                  {fmt(homeowner.projectedFinal)} <span className={delta > 0 ? "text-destructive" : "text-primary"}>({delta > 0 ? "+" : ""}{fmt(delta)})</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Proposal Snapshot */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Proposal Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {proposals.map((p) => (
                <div key={p.id} className="p-2.5 rounded-lg border border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.contractor}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{p.completenessScore}% complete</span>
                      {p.missingFlags > 0 && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{p.missingFlags} flags</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{fmt(p.total)}</p>
                    {p.contractor === homeowner.selectedContractor && (
                      <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">Selected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Open Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Open Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {openActions.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg border border-border">
                  {a.priority === "High" ? (
                    <AlertTriangle size={14} className="text-destructive mt-0.5 shrink-0" />
                  ) : (
                    <Clock size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm text-foreground">{a.action}</p>
                    <p className="text-[11px] text-muted-foreground">{a.category}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap mt-0.5">{a.date}</span>
                  <p className="text-sm text-foreground">{a.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </OwnerLayout>
  );
}
