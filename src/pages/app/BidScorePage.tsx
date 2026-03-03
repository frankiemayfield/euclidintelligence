import { AppLayout } from "@/components/app/AppLayout";
import { AlertTriangle, CheckCircle, TrendingUp, Shield } from "lucide-react";

const scoreBreakdown = [
  { label: "Estimate Completeness", score: 92, color: "text-primary" },
  { label: "Trade Coverage", score: 88, color: "text-primary" },
  { label: "Pricing Confidence", score: 79, color: "text-warning" },
  { label: "Scope Gap Risk", score: 34, color: "text-primary", inverted: true },
  { label: "Change-Order Exposure", score: 28, color: "text-primary", inverted: true },
];

const flags = [
  { severity: "high", message: "Missing electrical rough-in for addition — estimated $4,200–$6,100" },
  { severity: "medium", message: "HVAC ductwork not itemized separately from equipment allowance" },
  { severity: "medium", message: "No waterproofing line item for below-grade foundation work" },
  { severity: "low", message: "Finish hardware allowance below regional median by 15%" },
];

const nextActions = [
  "Add electrical rough-in line item to Division 26",
  "Break out HVAC ductwork from equipment allowance",
  "Request waterproofing sub quote for foundation scope",
  "Review finish hardware allowance against spec requirements",
];

export default function BidScorePage() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Bid Score</h1>
          <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Estimate confidence analysis</p>
        </div>

        {/* Main Score */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-card mb-6 text-center">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Overall Bid Score</p>
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary/20 relative mb-4">
            <svg className="absolute inset-0 w-32 h-32 -rotate-90">
              <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(140,50%,32%)" strokeWidth="5" strokeDasharray="351.8" strokeDashoffset="56" strokeLinecap="round" />
            </svg>
            <span className="font-display text-5xl font-bold text-primary">84</span>
          </div>
          <p className="text-sm text-muted-foreground">Good — Minor scope gaps detected. Review recommended actions below.</p>
        </div>

        {/* Breakdown */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          {scoreBreakdown.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`font-display text-2xl font-bold ${s.color}`}>
                {s.inverted ? `${100 - s.score}%` : `${s.score}%`}
              </p>
              {s.inverted && <p className="text-xs text-muted-foreground">risk level</p>}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Flags */}
          <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-display font-semibold text-foreground">Flagged Items</h2>
            </div>
            <div className="p-4 space-y-3">
              {flags.map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <AlertTriangle size={16} className={
                    f.severity === "high" ? "text-destructive mt-0.5" :
                    f.severity === "medium" ? "text-warning mt-0.5" :
                    "text-muted-foreground mt-0.5"
                  } />
                  <p className="text-sm text-foreground">{f.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-display font-semibold text-foreground">Recommended Actions</h2>
            </div>
            <div className="p-4 space-y-3">
              {nextActions.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle size={16} className="text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
