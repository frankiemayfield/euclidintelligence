import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, CheckCircle, Clock, HelpCircle } from "lucide-react";

type ReviewStatus = "Open" | "Awaiting Estimator" | "Awaiting Client" | "Awaiting Designer" | "Resolved" | "Deferred";
type ReviewType = "Quantity" | "Pricing" | "Scope" | "Selection" | "Field Condition";
type RiskLevel = "High" | "Medium" | "Low";

interface ReviewItem {
  id: string; clarification: string; relatedTrade: string; type: ReviewType;
  riskLevel: RiskLevel; needsConfirmFrom: string; status: ReviewStatus;
  proposalVisible: boolean; notes: string;
}

const statusStyles: Record<ReviewStatus, string> = {
  Open: "bg-destructive/10 text-destructive",
  "Awaiting Estimator": "bg-warning/10 text-warning",
  "Awaiting Client": "bg-info/10 text-info",
  "Awaiting Designer": "bg-info/10 text-info",
  Resolved: "bg-primary/10 text-primary",
  Deferred: "bg-muted text-muted-foreground",
};

const riskStyles: Record<RiskLevel, string> = {
  High: "text-destructive",
  Medium: "text-warning",
  Low: "text-muted-foreground",
};

const defaultItems: ReviewItem[] = [
  { id: "r1", clarification: "HVAC system type not specified — forced air assumed", relatedTrade: "HVAC", type: "Scope", riskLevel: "High", needsConfirmFrom: "Designer", status: "Open", proposalVisible: false, notes: "" },
  { id: "r2", clarification: "Driveway area measured from scale — confirm on site", relatedTrade: "Paving", type: "Quantity", riskLevel: "Medium", needsConfirmFrom: "Estimator", status: "Awaiting Estimator", proposalVisible: false, notes: "" },
  { id: "r3", clarification: "Soil conditions assumed standard — geotech report pending", relatedTrade: "Earthwork", type: "Field Condition", riskLevel: "High", needsConfirmFrom: "Client", status: "Awaiting Client", proposalVisible: true, notes: "" },
  { id: "r4", clarification: "Flooring selection pending — using allowance pricing", relatedTrade: "Flooring", type: "Selection", riskLevel: "Medium", needsConfirmFrom: "Client", status: "Awaiting Client", proposalVisible: false, notes: "" },
  { id: "r5", clarification: "Lumber pricing based on Q4 2025 — verify volatility", relatedTrade: "Rough Carpentry", type: "Pricing", riskLevel: "Low", needsConfirmFrom: "Estimator", status: "Resolved", proposalVisible: false, notes: "Locked Q1 2026 pricing" },
  { id: "r6", clarification: "Gas piping excluded from plumbing scope — confirm coverage", relatedTrade: "Plumbing", type: "Scope", riskLevel: "Medium", needsConfirmFrom: "Designer", status: "Open", proposalVisible: true, notes: "" },
];

export function ReviewSection() {
  const [items] = useState<ReviewItem[]>(defaultItems);

  const open = items.filter(i => i.status === "Open").length;
  const highRisk = items.filter(i => i.riskLevel === "High" && i.status !== "Resolved").length;
  const awaitingClient = items.filter(i => i.status === "Awaiting Client").length;
  const resolved = items.filter(i => i.status === "Resolved").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Review & Clarifications</h2>
          <p className="text-xs text-muted-foreground">Centralized assumptions, open questions, and pre-pricing review log</p>
        </div>
        <Button size="sm" className="text-xs"><Plus size={13} className="mr-1.5" />Add Clarification</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-destructive">{open}</p>
          <p className="text-[10px] text-muted-foreground">Open</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-warning">{highRisk}</p>
          <p className="text-[10px] text-muted-foreground">High Risk</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-info">{awaitingClient}</p>
          <p className="text-[10px] text-muted-foreground">Awaiting Client</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-primary">{resolved}</p>
          <p className="text-[10px] text-muted-foreground">Resolved</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["", "Clarification", "Trade", "Type", "Risk", "Needs Confirm", "Status"].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${item.status === "Resolved" ? "opacity-60" : ""}`}>
                  <td className="pl-3 py-2.5">
                    {item.status === "Resolved" ? <CheckCircle size={13} className="text-primary" /> :
                     item.riskLevel === "High" ? <AlertTriangle size={13} className="text-destructive" /> :
                     item.status.startsWith("Awaiting") ? <Clock size={13} className="text-warning" /> :
                     <HelpCircle size={13} className="text-muted-foreground" />}
                  </td>
                  <td className="px-3 py-2.5 text-foreground">{item.clarification}</td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{item.relatedTrade}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{item.type}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-semibold ${riskStyles[item.riskLevel]}`}>{item.riskLevel}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{item.needsConfirmFrom}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusStyles[item.status]}`}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
