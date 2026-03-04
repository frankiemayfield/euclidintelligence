import { CheckCircle, FileText, AlertTriangle, Info, ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { SubBid, formatCurrency, dispositionLabels, dispositionColors } from "./bidLevelingData";

interface BidDetailPanelProps {
  bid: SubBid;
}

export function BidDetailPanel({ bid }: BidDetailPanelProps) {
  return (
    <div className="p-5 space-y-5">
      {/* Recommendation reason */}
      {bid.recommended && bid.recommendedReason && (
        <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5 text-sm">
          <Shield size={14} className="text-primary shrink-0" />
          <span className="text-foreground"><span className="font-semibold text-primary">Why recommended:</span> {bid.recommendedReason}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Inclusions */}
        <div>
          <h4 className="font-display font-semibold text-foreground text-sm mb-2.5 flex items-center gap-1.5">
            <CheckCircle size={13} className="text-primary" /> Scope Inclusions
          </h4>
          <div className="space-y-1.5">
            {bid.inclusions.map((inc, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="text-primary mt-0.5">✓</span>
                <span className="text-foreground">{inc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exclusions with disposition */}
        <div>
          <h4 className="font-display font-semibold text-foreground text-sm mb-2.5 flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-warning" /> Exclusions
          </h4>
          <div className="space-y-2">
            {bid.exclusions.map((exc, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-start gap-2 text-xs">
                  <span className="text-destructive mt-0.5">✕</span>
                  <span className="text-foreground">{exc.item}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ml-4 inline-block ${dispositionColors[exc.disposition]}`}>
                  {dispositionLabels[exc.disposition]}
                </span>
              </div>
            ))}
            {bid.exclusions.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No exclusions</p>
            )}
          </div>
        </div>

        {/* Leveling Adjustments */}
        <div>
          <h4 className="font-display font-semibold text-foreground text-sm mb-2.5 flex items-center gap-1.5">
            <ArrowRight size={13} className="text-info" /> Leveling Adjustments
          </h4>
          {bid.adjustments.length > 0 ? (
            <div className="space-y-2.5">
              {bid.adjustments.map((adj, i) => (
                <div key={i} className="bg-muted/30 rounded-lg px-3 py-2 text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{adj.description}</span>
                    <span className="font-display font-semibold text-warning">+{formatCurrency(adj.amount)}</span>
                  </div>
                  <p className="text-muted-foreground">{adj.reason}</p>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1.5 border-t border-border text-xs">
                <span className="text-muted-foreground font-medium">Total Add-Backs</span>
                <span className="font-display font-bold text-warning">+{formatCurrency(bid.addBacks)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No adjustments needed — bid covers full scope</p>
          )}
        </div>

        {/* Clarifications + Source */}
        <div className="space-y-4">
          {bid.clarifications.length > 0 && (
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-2.5 flex items-center gap-1.5">
                <Info size={13} className="text-info" /> Clarifications
              </h4>
              <div className="space-y-1.5">
                {bid.clarifications.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className={`mt-0.5 ${c.resolved ? "text-primary" : "text-warning"}`}>
                      {c.resolved ? "✓" : "?"}
                    </span>
                    <div>
                      <span className="text-foreground">{c.question}</span>
                      {c.resolved && c.answer && (
                        <p className="text-muted-foreground mt-0.5">→ {c.answer}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-display font-semibold text-foreground text-sm mb-2.5">Source</h4>
            <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2 text-xs">
              <FileText size={12} className="text-primary shrink-0" />
              <span className="text-foreground">{bid.uploadedFrom}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Imported from <Link to="/app/upload" className="text-primary hover:underline">Document Upload</Link>
            </p>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Notes: {bid.notes}</p>
          </div>
        </div>
      </div>

      {/* Leveling summary bar */}
      <div className="flex items-center justify-between bg-muted/20 border border-border rounded-xl px-4 py-3 text-sm">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-muted-foreground">Raw Bid</span>
            <p className="font-display font-semibold text-muted-foreground">{formatCurrency(bid.rawTotal)}</p>
          </div>
          {bid.addBacks > 0 && (
            <>
              <span className="text-muted-foreground">+</span>
              <div>
                <span className="text-xs text-muted-foreground">Add-Backs</span>
                <p className="font-display font-semibold text-warning">{formatCurrency(bid.addBacks)}</p>
              </div>
              <span className="text-muted-foreground">=</span>
            </>
          )}
          <div>
            <span className="text-xs text-muted-foreground">Leveled Total</span>
            <p className="font-display font-bold text-foreground">{formatCurrency(bid.leveledTotal)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${bid.packageCoverage >= 90 ? "bg-primary/10 text-primary" : bid.packageCoverage >= 70 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
            {bid.packageCoverage}% coverage
          </span>
        </div>
      </div>
    </div>
  );
}
