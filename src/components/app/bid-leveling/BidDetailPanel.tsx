import { useState } from "react";
import { CheckCircle, FileText, AlertTriangle, Info, ArrowRight, Shield, Mail, RotateCcw, MessageSquare, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SubBid, Exclusion, formatCurrency, dispositionLabels, dispositionColors, ExclusionDisposition } from "./bidLevelingData";

interface BidDetailPanelProps {
  bid: SubBid;
  levelingState: { label: string; className: string };
}

const dispositionOptions: { value: ExclusionDisposition; label: string }[] = [
  { value: "unresolved", label: "Unresolved" },
  { value: "add-to-estimate", label: "Add to Estimate" },
  { value: "carry-by-gc", label: "Carry by GC" },
  { value: "reassign", label: "Other Trade" },
  { value: "accept", label: "Accept Exclusion" },
];

function ExclusionRow({ exc }: { exc: Exclusion }) {
  const [disposition, setDisposition] = useState(exc.disposition);
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <div className="flex items-center gap-2 text-xs bg-primary/5 rounded-lg px-3 py-2">
        <Check size={12} className="text-primary shrink-0" />
        <span className="text-foreground line-through opacity-60">{exc.item}</span>
        <span className="text-primary font-medium ml-auto text-[10px]">Confirmed Included</span>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 rounded-lg px-3 py-2.5 space-y-2">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-destructive shrink-0">✕</span>
        <span className="text-foreground font-medium flex-1">{exc.item}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap pl-4">
        {dispositionOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDisposition(opt.value)}
            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors ${
              disposition === opt.value
                ? dispositionColors[opt.value]
                : "bg-transparent text-muted-foreground border-border hover:border-primary/30"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => setConfirmed(true)}
          className="text-[10px] px-2 py-0.5 rounded-full border border-primary/20 text-primary font-medium hover:bg-primary/10 transition-colors ml-1"
        >
          Confirm Included
        </button>
      </div>
    </div>
  );
}

export function BidDetailPanel({ bid, levelingState }: BidDetailPanelProps) {
  return (
    <div className="p-5 space-y-5">
      {/* Top bar: Why Recommended + Leveling State */}
      <div className="flex items-center gap-3 flex-wrap">
        {bid.recommended && bid.recommendedReason && (
          <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-xl px-4 py-2 text-xs flex-1 min-w-[200px]">
            <Shield size={13} className="text-primary shrink-0" />
            <span className="text-foreground"><span className="font-semibold text-primary">Why recommended:</span> {bid.recommendedReason}</span>
          </div>
        )}
        <div className={`text-[11px] px-3 py-2 rounded-xl font-medium ${levelingState.className}`}>
          {levelingState.label}
        </div>
      </div>

      {/* Main grid: 3 columns */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Column 1: Scope Inclusions */}
        <div className="space-y-4">
          <div>
            <h4 className="font-display font-semibold text-foreground text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle size={12} className="text-primary" /> Scope Inclusions
            </h4>
            <div className="space-y-1.5">
              {bid.inclusions.map((inc, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-primary mt-0.5 shrink-0">✓</span>
                  <span className="text-foreground">{inc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source */}
          <div>
            <h4 className="font-display font-semibold text-foreground text-xs uppercase tracking-wider mb-2">Source</h4>
            <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2 text-xs">
              <FileText size={12} className="text-primary shrink-0" />
              <span className="text-foreground">{bid.uploadedFrom}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Imported from <Link to="/app/upload" className="text-primary hover:underline">Document Upload</Link>
            </p>
          </div>
        </div>

        {/* Column 2: Missing / Excluded Scope + Dispositions */}
        <div>
          <h4 className="font-display font-semibold text-foreground text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-warning" /> Exclusions &amp; Missing Scope
          </h4>
          {bid.exclusions.length > 0 ? (
            <div className="space-y-2">
              {bid.exclusions.map((exc, i) => (
                <ExclusionRow key={i} exc={exc} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No exclusions — full scope covered</p>
          )}

          {/* Sub follow-up actions */}
          {(bid.exclusions.some(e => e.disposition === "unresolved") || bid.clarifications.some(c => !c.resolved)) && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
              <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5 rounded-lg gap-1.5" onClick={(e) => e.stopPropagation()}>
                <Mail size={10} /> Notify Sub
              </Button>
              <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5 rounded-lg gap-1.5" onClick={(e) => e.stopPropagation()}>
                <RotateCcw size={10} /> Request Revision
              </Button>
              <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5 rounded-lg gap-1.5" onClick={(e) => e.stopPropagation()}>
                <MessageSquare size={10} /> Request Clarification
              </Button>
            </div>
          )}
        </div>

        {/* Column 3: Leveling Adjustments + Clarifications */}
        <div className="space-y-4">
          {/* Leveling Adjustments */}
          <div>
            <h4 className="font-display font-semibold text-foreground text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ArrowRight size={12} className="text-info" /> Leveling Adjustments
            </h4>
            {bid.adjustments.length > 0 ? (
              <div className="space-y-2">
                {bid.adjustments.map((adj, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg px-3 py-2 text-xs space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{adj.description}</span>
                      <span className="font-display font-semibold text-warning whitespace-nowrap">+{formatCurrency(adj.amount)}</span>
                    </div>
                    <p className="text-muted-foreground">{adj.reason}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <span className="text-muted-foreground font-medium">Total Add-Backs</span>
                  <span className="font-display font-bold text-warning">+{formatCurrency(bid.addBacks)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No adjustments — bid covers full scope</p>
            )}
          </div>

          {/* Clarifications */}
          {bid.clarifications.length > 0 && (
            <div>
              <h4 className="font-display font-semibold text-foreground text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Info size={12} className="text-info" /> Clarifications
              </h4>
              <div className="space-y-1.5">
                {bid.clarifications.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className={`mt-0.5 shrink-0 ${c.resolved ? "text-primary" : "text-warning"}`}>
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

          {/* Notes */}
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Notes:</span> {bid.notes}
          </div>
        </div>
      </div>

      {/* Bottom leveling summary bar */}
      <div className="flex items-center justify-between bg-muted/20 border border-border rounded-xl px-4 py-3 text-sm">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Raw Bid</span>
            <p className="font-display font-semibold text-muted-foreground">{formatCurrency(bid.rawTotal)}</p>
          </div>
          {bid.addBacks > 0 && (
            <>
              <span className="text-muted-foreground text-lg">+</span>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Add-Backs</span>
                <p className="font-display font-semibold text-warning">{formatCurrency(bid.addBacks)}</p>
              </div>
              <span className="text-muted-foreground text-lg">=</span>
            </>
          )}
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Leveled Total</span>
            <p className="font-display font-bold text-foreground text-base">{formatCurrency(bid.leveledTotal)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${bid.packageCoverage >= 90 ? "bg-primary/10 text-primary" : bid.packageCoverage >= 70 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
            {bid.packageCoverage}% coverage
          </span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${levelingState.className}`}>
            {levelingState.label}
          </span>
        </div>
      </div>
    </div>
  );
}
