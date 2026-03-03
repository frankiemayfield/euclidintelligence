import { AppLayout } from "@/components/app/AppLayout";
import { AlertTriangle, CheckCircle, ChevronDown } from "lucide-react";
import { EvidenceSummaryCard } from "@/components/app/traceability/EvidenceSummaryCard";
import { ConfidenceBadge } from "@/components/app/traceability/ConfidenceBadge";
import { PlanReferenceChip } from "@/components/app/traceability/PlanReferenceChip";
import { useState } from "react";

const scoreBreakdown = [
  { label: "Estimate Completeness", score: 92, color: "text-primary" },
  { label: "Trade Coverage", score: 88, color: "text-primary" },
  { label: "Pricing Confidence", score: 79, color: "text-warning" },
  { label: "Scope Gap Risk", score: 34, color: "text-primary", inverted: true },
  { label: "Change-Order Exposure", score: 28, color: "text-primary", inverted: true },
];

const flags = [
  { severity: "high", message: "Missing electrical rough-in for addition — estimated $4,200–$6,100", sheet: "A1.1", type: "Quantity", link: "takeoff" },
  { severity: "medium", message: "HVAC ductwork not itemized separately from equipment allowance", sheet: "M1.1", type: "Pricing", link: "estimate-builder" },
  { severity: "medium", message: "No waterproofing line item for below-grade foundation work", sheet: "S1.1", type: "Quantity", link: "takeoff" },
  { severity: "low", message: "Finish hardware allowance below regional median by 15%", sheet: "A5.1", type: "Pricing", link: "estimate-builder" },
];

const scoreDrivers = [
  { label: "Quantity Confidence", score: 86, explanation: "82% of quantities explicitly labeled or schedule-verified. 18% derived from scale.", status: "Good" as const },
  { label: "Assumption Strength", score: 74, explanation: "3 assumptions marked as industry default. 2 require project-specific verification.", status: "Review" as const },
  { label: "Scope Completeness", score: 91, explanation: "All 16 CSI divisions have at least one line item. 2 minor gaps detected.", status: "Good" as const },
  { label: "Pricing Support", score: 79, explanation: "Regional pricing basis applied. 2 items flagged for above-range costs.", status: "Review" as const },
  { label: "Review Coverage", score: 68, explanation: "6 of 10 line items estimator-confirmed. 4 items still auto-extracted.", status: "Needs Attention" as const },
];

const nextActions = [
  "Add electrical rough-in line item to Division 26",
  "Break out HVAC ductwork from equipment allowance",
  "Request waterproofing sub quote for foundation scope",
  "Review finish hardware allowance against spec requirements",
];

export default function BidScorePage() {
  const [expandedDriver, setExpandedDriver] = useState<number | null>(null);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Bid Score</h1>
          <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Evidence-backed confidence analysis</p>
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

        {/* Evidence Summary */}
        <div className="mb-6">
          <EvidenceSummaryCard
            title="Evidence Summary"
            items={[
              { label: "Explicitly Labeled", value: "62%", color: "text-primary" },
              { label: "Derived from Scale", value: "20%", color: "text-warning" },
              { label: "Estimator Confirmed", value: "60%", color: "text-primary" },
              { label: "Low Confidence Lines", value: "2", color: "text-destructive" },
              { label: "Assumptions to Review", value: "5", color: "text-warning" },
              { label: "Schedule Verified", value: "18%", color: "text-info" },
            ]}
          />
        </div>

        {/* What's Driving This Score */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-foreground">What's Driving This Score</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Every score component traces back to plan data and estimator review</p>
          </div>
          <div className="divide-y divide-border">
            {scoreDrivers.map((d, i) => (
              <div key={d.label}>
                <button
                  onClick={() => setExpandedDriver(expandedDriver === i ? null : i)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm ${
                    d.score >= 80 ? "bg-primary/10 text-primary" : d.score >= 70 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                  }`}>
                    {d.score}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{d.label}</p>
                    <p className="text-xs text-muted-foreground">{d.status === "Good" ? "On track" : d.status === "Review" ? "Review recommended" : "Attention needed"}</p>
                  </div>
                  <ConfidenceBadge level={d.score >= 80 ? "High" : d.score >= 70 ? "Medium" : "Low"} />
                  <ChevronDown size={14} className={`text-muted-foreground transition-transform ${expandedDriver === i ? "rotate-180" : ""}`} />
                </button>
                {expandedDriver === i && (
                  <div className="px-5 pb-3 ml-[52px]">
                    <p className="text-xs text-muted-foreground">{d.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
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
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{f.message}</p>
                    <div className="flex gap-2 mt-1.5">
                      <PlanReferenceChip sheet={f.sheet} />
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Affects {f.type}</span>
                    </div>
                  </div>
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
