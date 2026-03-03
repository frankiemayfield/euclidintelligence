import { AppLayout } from "@/components/app/AppLayout";
import { useState } from "react";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

const trades = ["Electrical", "Plumbing", "HVAC", "Drywall", "Framing"];

const bids: Record<string, { sub: string; total: number; notes: string; recommended?: boolean; scopeNotes: string[] }[]> = {
  Electrical: [
    { sub: "Spark Electric Co.", total: 16800, notes: "Includes panel upgrade", recommended: true, scopeNotes: ["Includes panel upgrade", "Includes permit fees", "Full scope"] },
    { sub: "BrightWire LLC", total: 18200, notes: "Includes permit fees", scopeNotes: ["Includes permit fees", "Excludes panel upgrade", "Assumes owner-supplied fixtures"] },
    { sub: "Metro Electrical", total: 21400, notes: "Premium fixtures included", scopeNotes: ["Premium fixtures included", "Full scope", "Includes permit fees"] },
  ],
  Plumbing: [
    { sub: "AquaFlow Plumbing", total: 18500, recommended: true, notes: "Includes rough + finish", scopeNotes: ["Full rough + finish", "Includes fixtures", "Complete scope"] },
    { sub: "PipeMasters Inc.", total: 19800, notes: "Excludes fixtures", scopeNotes: ["Excludes fixtures", "Rough-in only", "Scope incomplete"] },
    { sub: "RedLine Plumbing", total: 22100, notes: "Includes fixture allowance", scopeNotes: ["Includes fixture allowance", "Full scope", "Allowance included"] },
  ],
  HVAC: [
    { sub: "CoolAir Systems", total: 14200, notes: "Equipment only", scopeNotes: ["Equipment only", "Excludes ductwork", "Scope incomplete"] },
    { sub: "ComfortPro HVAC", total: 16900, recommended: true, notes: "Includes ductwork", scopeNotes: ["Includes ductwork", "Full scope", "Includes startup"] },
    { sub: "TempRight Mechanical", total: 19500, notes: "Premium equipment", scopeNotes: ["Premium equipment", "Full scope", "Includes controls"] },
  ],
  Drywall: [
    { sub: "SmoothWall Inc.", total: 12160, recommended: true, notes: "Hang, tape, finish L5", scopeNotes: ["Full scope Level 5", "Includes cleanup"] },
    { sub: "GypBoard Pros", total: 13400, notes: "Includes soundproofing", scopeNotes: ["Includes soundproofing", "Full scope", "Assumes owner-supplied materials"] },
  ],
  Framing: [
    { sub: "TrueFrame Carpentry", total: 23800, recommended: true, notes: "Full framing package", scopeNotes: ["Full framing package", "Includes sheathing", "Complete scope"] },
    { sub: "SquareEdge Builders", total: 25200, notes: "Includes sheathing", scopeNotes: ["Includes sheathing", "Excludes hardware", "Scope incomplete"] },
  ],
};

export default function BidLevelingPage() {
  const [activeTrade, setActiveTrade] = useState("Electrical");
  const items = bids[activeTrade] || [];

  const formatCurrency = (n: number) => `$${n.toLocaleString()}`;
  const avg = Math.round(items.reduce((s, b) => s + b.total, 0) / items.length);
  const spread = items.length > 1 ? items[items.length - 1].total - items[0].total : 0;

  const completeScope = items.filter(b => !b.scopeNotes.some(n => n.toLowerCase().includes("incomplete") || n.toLowerCase().includes("excludes"))).length;
  const withExclusions = items.filter(b => b.scopeNotes.some(n => n.toLowerCase().includes("excludes"))).length;
  const needsClarification = items.filter(b => b.scopeNotes.some(n => n.toLowerCase().includes("incomplete") || n.toLowerCase().includes("assumes"))).length;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Bid Leveling</h1>
          <p className="text-sm text-muted-foreground mt-1">Compare subcontractor bids side-by-side</p>
        </div>

        {/* Trade Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {trades.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTrade(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTrade === t
                  ? "bg-primary/10 text-primary"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Coverage Comparison */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-card border border-border rounded-lg p-3 shadow-card flex items-center gap-2">
            <CheckCircle size={14} className="text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Complete Scope</p>
              <p className="font-display font-bold text-foreground">{completeScope} of {items.length}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 shadow-card flex items-center gap-2">
            <AlertTriangle size={14} className="text-warning" />
            <div>
              <p className="text-xs text-muted-foreground">With Exclusions</p>
              <p className="font-display font-bold text-foreground">{withExclusions}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 shadow-card flex items-center gap-2">
            <Info size={14} className="text-info" />
            <div>
              <p className="text-xs text-muted-foreground">Needs Clarification</p>
              <p className="font-display font-bold text-foreground">{needsClarification}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="font-display text-xl font-bold text-foreground">{formatCurrency(avg)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground">Spread</p>
            <p className="font-display text-xl font-bold text-warning">{formatCurrency(spread)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground">Bids Received</p>
            <p className="font-display text-xl font-bold text-primary">{items.length}</p>
          </div>
        </div>

        {/* Bid Table */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Subcontractor</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Bid Total</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">vs Average</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Scope Notes</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => {
                const diff = b.total - avg;
                return (
                  <tr key={b.sub} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{b.sub}</td>
                    <td className="px-5 py-3 font-display font-semibold text-foreground">{formatCurrency(b.total)}</td>
                    <td className={`px-5 py-3 text-sm ${diff > 0 ? "text-destructive" : diff < 0 ? "text-primary" : "text-muted-foreground"}`}>
                      {diff > 0 ? "+" : ""}{formatCurrency(diff)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {b.scopeNotes.map((note, i) => (
                          <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            note.toLowerCase().includes("excludes") || note.toLowerCase().includes("incomplete")
                              ? "bg-warning/10 text-warning"
                              : note.toLowerCase().includes("assumes")
                              ? "bg-info/10 text-info"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {note}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {b.recommended && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Recommended</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
