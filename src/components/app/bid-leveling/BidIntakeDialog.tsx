import { useRef, useState } from "react";
import { Upload, Sparkles, X, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { builderNetwork } from "@/data/networkData";
import { addIntakeDocument } from "@/lib/documentIntake";
import type { SubBid } from "./bidLevelingData";

type Phase = "pick" | "reading" | "review";

/**
 * Contextual bid intake: a bid that arrives late is dropped straight onto the
 * trade package it belongs to. The file still lands in the project document
 * repository, and a matching bidder is treated as a revision, not a new bid.
 */
export function BidIntakeDialog({
  projectId, projectName, trade, existing, onAdd, onClose,
}: {
  projectId: string;
  projectName: string;
  trade: string;
  existing: SubBid[];
  onAdd: (bid: SubBid, isRevision: boolean, filename: string) => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [filename, setFilename] = useState("");
  const [bidder, setBidder] = useState("");
  const [amount, setAmount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const tradeSubs = builderNetwork.filter(c => c.relationship === "Subcontractor" && c.trade.toLowerCase().includes(trade.toLowerCase().split(" ")[0]));

  const read = (name: string) => {
    setFilename(name);
    setPhase("reading");
    setTimeout(() => {
      const stem = name.replace(/\.[a-z]+$/i, "").replace(/[_-]+/g, " ");
      const matched = builderNetwork.find(c => stem.toLowerCase().includes(c.name.toLowerCase().split(" ")[0]))
        ?? tradeSubs[0] ?? builderNetwork[0];
      const prior = existing.find(b => b.sub === matched.name);
      const base = prior ? Math.round(prior.rawTotal * 0.96) : 24000 + Math.round(stem.length * 137);
      setBidder(matched.name);
      setAmount(base);
      setPhase("review");
    }, 900);
  };

  const isRevision = existing.some(b => b.sub === bidder);

  const commit = () => {
    addIntakeDocument({
      projectId,
      filename,
      context: "bid-packages",
      classification: isRevision ? "Subcontractor bid revision" : "Subcontractor bid",
      tags: [trade, bidder],
      uploadedBy: "You",
      meta: { amount, trade },
    });
    onAdd({
      sub: bidder,
      rawTotal: amount,
      addBacks: 0,
      leveledTotal: amount,
      notes: isRevision ? "Revised bid received — prior version superseded" : "Newly received bid, pending leveling",
      status: "Bid Received",
      packageCoverage: 88,
      missingScopeCount: 1,
      scopeNotes: ["Extracted from uploaded bid"],
      inclusions: [`${trade} labor and material per uploaded bid`],
      exclusions: [{ item: "Scope not addressed in the bid letter", disposition: "unresolved" }],
      clarifications: [{ question: "Confirm scope alignment with the package", resolved: false }],
      adjustments: [],
      uploadedFrom: filename,
    }, isRevision, filename);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold">Upload bid — {trade}</h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">{projectName} · files also land in the project documents</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>

        {phase === "pick" && (
          <div className="mt-4">
            <button onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
              <Upload size={20} />
              <span className="text-[12.5px] font-medium">Choose a bid PDF</span>
              <span className="text-[11px]">Euclid reads the bidder, amount and scope</span>
            </button>
            <input ref={inputRef} type="file" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) read(f.name); }} />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tradeSubs.slice(0, 3).map(c => (
                <button key={c.id} onClick={() => read(`${c.name.replace(/\s+/g, "_")}_${trade}_Bid.pdf`)}
                  className="rounded-lg border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground">
                  Use sample from {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "reading" && (
          <div className="mt-6 flex items-center gap-2 text-[13px] text-muted-foreground">
            <Sparkles size={14} className="animate-pulse text-primary" /> Reading {filename} and matching the bidder…
          </div>
        )}

        {phase === "review" && (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-border p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Matched bidder</p>
              <select value={bidder} onChange={e => setBidder(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-[13px]">
                {builderNetwork.filter(c => c.relationship === "Subcontractor").map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">Bid amount</p>
              <input value={amount} onChange={e => setAmount(Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-[13px]" />
            </div>
            <p className={`flex items-center gap-1.5 text-[12px] ${isRevision ? "text-warning" : "text-primary"}`}>
              {isRevision ? <RefreshCw size={12} /> : <CheckCircle2 size={12} />}
              {isRevision
                ? "This bidder already has a bid — it will be recorded as a revision and downstream stages flagged for review."
                : "New bidder for this package. Downstream stages will be flagged for review."}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
              <Button size="sm" onClick={commit}>Add to {trade} package</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
