import { AppLayout } from "@/components/app/AppLayout";
import { useState } from "react";
import { CheckCircle, AlertTriangle, Info, FileText, ChevronDown, Send, ArrowRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const trades = ["Electrical", "Plumbing", "HVAC", "Drywall", "Framing"];

type BidStatus = "Draft Scope" | "Sent to Sub" | "Awaiting Bid" | "Bid Received" | "Needs Clarification" | "Ready to Compare" | "Selected" | "Sent to Estimate";

interface SubBid {
  sub: string; total: number; notes: string; recommended?: boolean; status: BidStatus;
  scopeNotes: string[]; inclusions: string[]; exclusions: string[];
  uploadedFrom: string;
}

const bids: Record<string, SubBid[]> = {
  Electrical: [
    { sub: "Spark Electric Co.", total: 16800, notes: "Includes panel upgrade", recommended: true, status: "Selected",
      scopeNotes: ["Full scope", "Includes permit fees"], inclusions: ["200A panel upgrade", "All circuits per plan", "Permit fees", "Fixture trim-out"], exclusions: ["Low voltage / data", "Generator hookup"], uploadedFrom: "Spark_Electric_Bid.pdf" },
    { sub: "BrightWire LLC", total: 18200, notes: "Includes permit fees", status: "Bid Received",
      scopeNotes: ["Excludes panel upgrade", "Assumes owner-supplied fixtures"], inclusions: ["Rough-in only", "Permit fees"], exclusions: ["Panel upgrade", "Fixture supply", "Low voltage"], uploadedFrom: "BrightWire_Quote.pdf" },
    { sub: "Metro Electrical", total: 21400, notes: "Premium fixtures included", status: "Bid Received",
      scopeNotes: ["Premium fixtures included", "Full scope"], inclusions: ["Full rough + finish", "Premium fixtures", "Panel upgrade", "Permit fees"], exclusions: ["Generator"], uploadedFrom: "Metro_Electrical_Bid.pdf" },
  ],
  Plumbing: [
    { sub: "AquaFlow Plumbing", total: 18500, recommended: true, notes: "Includes rough + finish", status: "Selected",
      scopeNotes: ["Full rough + finish", "Includes fixtures"], inclusions: ["Full rough-in", "Finish plumbing", "Fixture supply"], exclusions: ["Gas piping", "Water heater"], uploadedFrom: "AquaFlow_Plumbing_Bid.pdf" },
    { sub: "PipeMasters Inc.", total: 19800, notes: "Excludes fixtures", status: "Needs Clarification",
      scopeNotes: ["Excludes fixtures", "Rough-in only"], inclusions: ["Rough-in only"], exclusions: ["Fixtures", "Finish plumbing", "Gas piping"], uploadedFrom: "PipeMasters_Quote.pdf" },
    { sub: "RedLine Plumbing", total: 22100, notes: "Includes fixture allowance", status: "Bid Received",
      scopeNotes: ["Includes fixture allowance", "Full scope"], inclusions: ["Full rough + finish", "$3,500 fixture allowance"], exclusions: ["Gas piping"], uploadedFrom: "RedLine_Plumbing.pdf" },
  ],
  HVAC: [
    { sub: "CoolAir Systems", total: 14200, notes: "Equipment only", status: "Needs Clarification",
      scopeNotes: ["Equipment only", "Excludes ductwork"], inclusions: ["Equipment supply", "Equipment install"], exclusions: ["Ductwork", "Controls", "Startup"], uploadedFrom: "CoolAir_Bid.pdf" },
    { sub: "ComfortPro HVAC", total: 16900, recommended: true, notes: "Includes ductwork", status: "Ready to Compare",
      scopeNotes: ["Includes ductwork", "Full scope"], inclusions: ["Equipment", "Ductwork", "Controls", "Startup", "Balancing"], exclusions: ["Electrical connection"], uploadedFrom: "ComfortPro_Bid.pdf" },
    { sub: "TempRight Mechanical", total: 19500, notes: "Premium equipment", status: "Bid Received",
      scopeNotes: ["Premium equipment", "Full scope"], inclusions: ["Premium equipment", "Ductwork", "Controls", "Startup"], exclusions: ["Electrical connection"], uploadedFrom: "TempRight_Bid.pdf" },
  ],
  Drywall: [
    { sub: "SmoothWall Inc.", total: 12160, recommended: true, notes: "Hang, tape, finish L5", status: "Selected",
      scopeNotes: ["Full scope Level 5"], inclusions: ["Hang", "Tape", "Level 5 finish", "Cleanup"], exclusions: ["Insulation", "Framing"], uploadedFrom: "SmoothWall_Bid.pdf" },
    { sub: "GypBoard Pros", total: 13400, notes: "Includes soundproofing", status: "Bid Received",
      scopeNotes: ["Includes soundproofing", "Assumes owner-supplied materials"], inclusions: ["Hang", "Tape", "Level 4 finish", "Soundproofing"], exclusions: ["Material supply"], uploadedFrom: "GypBoard_Bid.pdf" },
  ],
  Framing: [
    { sub: "TrueFrame Carpentry", total: 23800, recommended: true, notes: "Full framing package", status: "Sent to Estimate",
      scopeNotes: ["Full framing package", "Includes sheathing"], inclusions: ["All framing", "Sheathing", "Hardware", "Blocking"], exclusions: ["Engineered lumber supply"], uploadedFrom: "TrueFrame_Bid.pdf" },
    { sub: "SquareEdge Builders", total: 25200, notes: "Includes sheathing", status: "Awaiting Bid",
      scopeNotes: ["Includes sheathing", "Excludes hardware"], inclusions: ["Framing labor", "Sheathing"], exclusions: ["Hardware", "Blocking", "Engineered lumber"], uploadedFrom: "SquareEdge_Quote.pdf" },
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Bid Leveling</h1>
            <p className="text-sm text-muted-foreground mt-1">Compare subcontractor bids side-by-side — review uploaded bids by trade package</p>
          </div>
        </div>

        {/* Source reference */}
        <div className="bg-muted/30 border border-border rounded-lg px-4 py-2.5 mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Upload size={12} className="text-primary" />
          <span>Subcontractor bids imported from <Link to="/app/upload" className="text-primary font-medium hover:underline">Document Upload</Link>. Add new bids there.</span>
        </div>

        {/* Trade Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {trades.map((t) => {
            const tradeItems = bids[t] || [];
            return (
              <button key={t} onClick={() => { setActiveTrade(t); setExpandedSub(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTrade === t ? "bg-primary/10 text-primary" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
                {t} <span className="text-[10px] ml-1 opacity-70">({tradeItems.length})</span>
              </button>
            );
          })}
        </div>

        {/* Coverage cards */}
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
                          <div className="grid md:grid-cols-3 gap-4 text-xs">
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
                                  <div key={i} className="flex items-center gap-2"><span className="text-destructive">✕</span><span className="text-foreground">{exc}</span></div>
                                ))}
                              </div>
                              <div className="mt-3 pt-2 border-t border-border">
                                <p className="text-muted-foreground">Notes: {b.notes}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-display font-semibold text-foreground text-sm mb-2">Source</h4>
                              <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                                <FileText size={12} className="text-primary" />
                                <span className="text-foreground">{b.uploadedFrom}</span>
                              </div>
                              <p className="text-muted-foreground mt-2">Imported from <Link to="/app/upload" className="text-primary hover:underline">Document Upload</Link></p>
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
