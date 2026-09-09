import { AppLayout } from "@/components/app/AppLayout";
import { useState } from "react";
import { Upload, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { trades, bids, type SubBid } from "@/components/app/bid-leveling/bidLevelingData";
import { BidSummaryCards } from "@/components/app/bid-leveling/BidSummaryCards";
import { BidComparisonTable } from "@/components/app/bid-leveling/BidComparisonTable";
import { Button } from "@/components/ui/button";
import { WorkflowTransition } from "@/components/app/WorkflowTransition";
import { useDemoProject } from "@/hooks/use-demo-project";
import { companies, framingBidPool } from "@/data/demoUniverse";

export default function BidLevelingPage() {
  const { project } = useDemoProject();
  const [activeTrade, setActiveTrade] = useState("Framing");
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [transition, setTransition] = useState(false);
  const projectFramingBids: SubBid[] = (framingBidPool[project.id] ?? []).map((bid, index) => ({
    sub: Object.values(companies).find(company => company.id === bid.companyId)?.name ?? bid.companyId,
    rawTotal: bid.amount,
    addBacks: bid.addBacks,
    leveledTotal: bid.amount + bid.addBacks,
    notes: bid.note,
    recommended: index === 0,
    selected: index === 0 && project.builderStage !== "Document Upload",
    recommendedReason: index === 0 ? "Best alignment with the current project scope" : undefined,
    status: bid.amount === 0 ? "Awaiting Bid" : index === 0 ? (project.builderStage === "Est. vs Actual" ? "Sent to Estimate" : "Selected") : bid.coverage < 90 ? "Needs Clarification" : "Ready to Compare",
    packageCoverage: bid.coverage,
    missingScopeCount: Math.max(0, Math.ceil((100 - bid.coverage) / 6)),
    scopeNotes: [bid.note], inclusions: ["Framing labor", "Project-specific scope package"],
    exclusions: bid.addBacks ? [{ item: "Scope represented by add-backs", disposition: "add-to-estimate" }] : [],
    clarifications: bid.coverage < 90 ? [{ question: "Confirm excluded scope before award", resolved: false }] : [],
    adjustments: bid.addBacks ? [{ description: "Scope normalization", amount: bid.addBacks, reason: bid.note }] : [],
    uploadedFrom: `${project.name.replace(/[^a-z0-9]+/gi, "_")}_${bid.companyId}_Bid.pdf`,
  }));
  const items = activeTrade === "Framing" ? projectFramingBids : bids[activeTrade] || [];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
             <h1 className="font-display text-2xl font-bold text-foreground">Bid Packages</h1>
            <p className="text-sm text-muted-foreground mt-1">
               {project.name} — compare and normalize subcontractor bids against the analyzed scope
            </p>
          </div>
          <Button size="sm" className="text-sm font-semibold gap-1.5" onClick={() => setTransition(true)}>
            Build Estimate
            <ArrowRight size={14} />
          </Button>
        </div>

        {/* Source reference */}
        <div className="bg-muted/30 border border-border rounded-xl px-4 py-2.5 mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Upload size={12} className="text-primary" />
          <span>
            Subcontractor bids imported from{" "}
            <Link to="/app/upload" className="text-primary font-medium hover:underline">Document Upload</Link>.
            Bids compared against defined scope packages from{" "}
            <Link to="/app/scope-analyzer" className="text-primary font-medium hover:underline">Scope Analyzer</Link>.
          </span>
        </div>

        {/* Trade Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {trades.map((t) => {
            const tradeItems = bids[t] || [];
            const needsClarCount = tradeItems.filter(b => b.status === "Needs Clarification" || b.clarifications.some(c => !c.resolved)).length;
            return (
              <button
                key={t}
                onClick={() => { setActiveTrade(t); setExpandedSub(null); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTrade === t
                    ? "bg-primary/10 text-primary"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
                <span className="text-[10px] opacity-70">({tradeItems.length})</span>
                {needsClarCount > 0 && activeTrade !== t && (
                  <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                )}
              </button>
            );
          })}
        </div>

        {/* Summary Cards */}
        <BidSummaryCards items={items} />

        {/* Comparison Table */}
        <BidComparisonTable
          items={items}
          expandedSub={expandedSub}
          onToggleExpand={(sub) => setExpandedSub(expandedSub === sub ? null : sub)}
        />

      </div>

      <WorkflowTransition
        active={transition}
        headline="Building your estimate"
        steps={[
          { label: "Refining scope from analysis" },
          { label: "Applying selected subcontractor bids" },
          { label: "Adding scope packages" },
          { label: "Organizing allowances and selections" },
          { label: "Preparing estimate structure" },
          { label: "Carrying leveling decisions into estimate lines" },
        ]}
        targetPath="/app/estimate-builder"
        onComplete={() => setTransition(false)}
      />
    </AppLayout>
  );
}
