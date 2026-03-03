import { AppLayout } from "@/components/app/AppLayout";
import { useState } from "react";
import { CheckCircle, AlertTriangle, Info, Upload, FileText, X, ChevronDown, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const trades = ["Electrical", "Plumbing", "HVAC", "Drywall", "Framing"];

type BidStatus = "Draft Scope" | "Sent to Sub" | "Awaiting Bid" | "Bid Received" | "Needs Clarification" | "Ready to Compare" | "Selected" | "Sent to Estimate";

interface SubBid {
  sub: string; total: number; notes: string; recommended?: boolean; status: BidStatus;
  scopeNotes: string[]; inclusions: string[]; exclusions: string[];
}

const bids: Record<string, SubBid[]> = {
  Electrical: [
    { sub: "Spark Electric Co.", total: 16800, notes: "Includes panel upgrade", recommended: true, status: "Selected",
      scopeNotes: ["Full scope", "Includes permit fees"], inclusions: ["200A panel upgrade", "All circuits per plan", "Permit fees", "Fixture trim-out"], exclusions: ["Low voltage / data", "Generator hookup"] },
    { sub: "BrightWire LLC", total: 18200, notes: "Includes permit fees", status: "Bid Received",
      scopeNotes: ["Excludes panel upgrade", "Assumes owner-supplied fixtures"], inclusions: ["Rough-in only", "Permit fees"], exclusions: ["Panel upgrade", "Fixture supply", "Low voltage"] },
    { sub: "Metro Electrical", total: 21400, notes: "Premium fixtures included", status: "Bid Received",
      scopeNotes: ["Premium fixtures included", "Full scope"], inclusions: ["Full rough + finish", "Premium fixtures", "Panel upgrade", "Permit fees"], exclusions: ["Generator"] },
  ],
  Plumbing: [
    { sub: "AquaFlow Plumbing", total: 18500, recommended: true, notes: "Includes rough + finish", status: "Selected",
      scopeNotes: ["Full rough + finish", "Includes fixtures"], inclusions: ["Full rough-in", "Finish plumbing", "Fixture supply"], exclusions: ["Gas piping", "Water heater"] },
    { sub: "PipeMasters Inc.", total: 19800, notes: "Excludes fixtures", status: "Needs Clarification",
      scopeNotes: ["Excludes fixtures", "Rough-in only"], inclusions: ["Rough-in only"], exclusions: ["Fixtures", "Finish plumbing", "Gas piping"] },
    { sub: "RedLine Plumbing", total: 22100, notes: "Includes fixture allowance", status: "Bid Received",
      scopeNotes: ["Includes fixture allowance", "Full scope"], inclusions: ["Full rough + finish", "$3,500 fixture allowance"], exclusions: ["Gas piping"] },
  ],
  HVAC: [
    { sub: "CoolAir Systems", total: 14200, notes: "Equipment only", status: "Needs Clarification",
      scopeNotes: ["Equipment only", "Excludes ductwork"], inclusions: ["Equipment supply", "Equipment install"], exclusions: ["Ductwork", "Controls", "Startup"] },
    { sub: "ComfortPro HVAC", total: 16900, recommended: true, notes: "Includes ductwork", status: "Ready to Compare",
      scopeNotes: ["Includes ductwork", "Full scope"], inclusions: ["Equipment", "Ductwork", "Controls", "Startup", "Balancing"], exclusions: ["Electrical connection"] },
    { sub: "TempRight Mechanical", total: 19500, notes: "Premium equipment", status: "Bid Received",
      scopeNotes: ["Premium equipment", "Full scope"], inclusions: ["Premium equipment", "Ductwork", "Controls", "Startup"], exclusions: ["Electrical connection"] },
  ],
  Drywall: [
    { sub: "SmoothWall Inc.", total: 12160, recommended: true, notes: "Hang, tape, finish L5", status: "Selected",
      scopeNotes: ["Full scope Level 5"], inclusions: ["Hang", "Tape", "Level 5 finish", "Cleanup"], exclusions: ["Insulation", "Framing"] },
    { sub: "GypBoard Pros", total: 13400, notes: "Includes soundproofing", status: "Bid Received",
      scopeNotes: ["Includes soundproofing", "Assumes owner-supplied materials"], inclusions: ["Hang", "Tape", "Level 4 finish", "Soundproofing"], exclusions: ["Material supply"] },
  ],
  Framing: [
    { sub: "TrueFrame Carpentry", total: 23800, recommended: true, notes: "Full framing package", status: "Sent to Estimate",
      scopeNotes: ["Full framing package", "Includes sheathing"], inclusions: ["All framing", "Sheathing", "Hardware", "Blocking"], exclusions: ["Engineered lumber supply"] },
    { sub: "SquareEdge Builders", total: 25200, notes: "Includes sheathing", status: "Awaiting Bid",
      scopeNotes: ["Includes sheathing", "Excludes hardware"], inclusions: ["Framing labor", "Sheathing"], exclusions: ["Hardware", "Blocking", "Engineered lumber"] },
  ],
};

const statusColors: Record<BidStatus, string> = {
  "Draft Scope": "bg-muted text-muted-foreground",
  "Sent to Sub": "bg-info/10 text-info",
  "Awaiting Bid": "bg-warning/10 text-warning",
  "Bid Received": "bg-accent text-accent-foreground",
  "Needs Clarification": "bg-destructive/10 text-destructive",
  "Ready to Compare": "bg-primary/10 text-primary",
  "Selected": "bg-primary/10 text-primary",
  "Sent to Estimate": "bg-primary/15 text-primary",
};

export default function BidLevelingPage() {
  const [activeTrade, setActiveTrade] = useState("Electrical");
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [uploadedBids, setUploadedBids] = useState<string[]>(["Spark_Electric_Bid.pdf", "BrightWire_Quote.pdf"]);
  const items = bids[activeTrade] || [];

  const formatCurrency = (n: number) => `$${n.toLocaleString()}`;
  const avg = Math.round(items.reduce((s, b) => s + b.total, 0) / items.length);
  const spread = items.length > 1 ? items[items.length - 1].total - items[0].total : 0;

  const completeScope = items.filter(b => b.exclusions.length <= 2).length;
  const withExclusions = items.filter(b => b.exclusions.length > 2).length;
  const needsClarification = items.filter(b => b.status === "Needs Clarification").length;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Bid Leveling</h1>
          <p className="text-sm text-muted-foreground mt-1">Compare subcontractor bids side-by-side — define scope, compare pricing, send to estimate</p>
        </div>

        {/* Upload Area */}
        <div className="bg-card border border-border rounded-xl shadow-card p-5 mb-6">
          <h3 className="font-display text-sm font-semibold text-foreground mb-3">Uploaded Sub Bids</h3>
          <div className="flex gap-3 flex-wrap mb-3">
            {uploadedBids.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                <FileText size={14} className="text-primary" />
                <span className="text-xs text-foreground">{f}</span>
                <button onClick={() => setUploadedBids(uploadedBids.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X size={12} /></button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setUploadedBids([...uploadedBids, `Sub_Bid_${uploadedBids.length + 1}.pdf`])}
            className="border-2 border-dashed border-primary/30 rounded-lg px-4 py-3 text-xs text-muted-foreground hover:border-primary/60 hover:text-foreground transition-colors flex items-center gap-2"
          >
            <Upload size={14} /> Drop sub bid PDFs here or click to upload
          </button>
        </div>

        {/* Trade Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {trades.map((t) => (
            <button key={t} onClick={() => { setActiveTrade(t); setExpandedSub(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTrade === t ? "bg-primary/10 text-primary" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Coverage Comparison */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-card border border-border rounded-lg p-3 shadow-card flex items-center gap-2">
            <CheckCircle size={14} className="text-primary" />
            <div><p className="text-xs text-muted-foreground">Complete Scope</p><p className="font-display font-bold text-foreground">{completeScope} of {items.length}</p></div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 shadow-card flex items-center gap-2">
            <AlertTriangle size={14} className="text-warning" />
            <div><p className="text-xs text-muted-foreground">With Exclusions</p><p className="font-display font-bold text-foreground">{withExclusions}</p></div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 shadow-card flex items-center gap-2">
            <Info size={14} className="text-info" />
            <div><p className="text-xs text-muted-foreground">Needs Clarification</p><p className="font-display font-bold text-foreground">{needsClarification}</p></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground">Average</p><p className="font-display text-xl font-bold text-foreground">{formatCurrency(avg)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground">Spread</p><p className="font-display text-xl font-bold text-warning">{formatCurrency(spread)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground">Bids Received</p><p className="font-display text-xl font-bold text-primary">{items.length}</p>
          </div>
        </div>

        {/* Bid Table */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-8" />
                {["Subcontractor", "Bid Total", "vs Average", "Status", "Scope", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((b) => {
                const diff = b.total - avg;
                const isExpanded = expandedSub === b.sub;
                return (
                  <>
                    <tr key={b.sub} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setExpandedSub(isExpanded ? null : b.sub)}>
                      <td className="pl-3 py-3"><ChevronDown size={14} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} /></td>
                      <td className="px-4 py-3 font-medium text-foreground">{b.sub}</td>
                      <td className="px-4 py-3 font-display font-semibold text-foreground">{formatCurrency(b.total)}</td>
                      <td className={`px-4 py-3 text-sm ${diff > 0 ? "text-destructive" : diff < 0 ? "text-primary" : "text-muted-foreground"}`}>
                        {diff > 0 ? "+" : ""}{formatCurrency(diff)}
                      </td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[b.status]}`}>{b.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {b.scopeNotes.map((note, i) => (
                            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              note.toLowerCase().includes("excludes") || note.toLowerCase().includes("incomplete") ? "bg-warning/10 text-warning" :
                              note.toLowerCase().includes("assumes") ? "bg-info/10 text-info" : "bg-muted text-muted-foreground"
                            }`}>{note}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {b.recommended && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Recommended</span>}
                          {b.status !== "Sent to Estimate" && (
                            <Button size="sm" variant="outline" className="text-xs h-6 px-2" onClick={(e) => e.stopPropagation()}>
                              <Send size={10} className="mr-1" /> Send to Estimate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${b.sub}-detail`} className="border-b border-border bg-muted/10">
                        <td colSpan={7} className="p-4">
                          <div className="grid md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <h4 className="font-display font-semibold text-foreground text-sm mb-2">Scope Inclusions</h4>
                              <div className="space-y-1">
                                {b.inclusions.map((inc, i) => (
                                  <div key={i} className="flex items-center gap-2"><CheckCircle size={11} className="text-primary" /><span className="text-foreground">{inc}</span></div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-display font-semibold text-foreground text-sm mb-2">Exclusions</h4>
                              <div className="space-y-1">
                                {b.exclusions.map((exc, i) => (
                                  <div key={i} className="flex items-center gap-2"><X size={11} className="text-destructive" /><span className="text-foreground">{exc}</span></div>
                                ))}
                              </div>
                              <div className="mt-3 pt-2 border-t border-border">
                                <p className="text-muted-foreground mb-1">Notes: {b.notes}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
