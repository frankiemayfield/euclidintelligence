import { SubLayout } from "@/components/sub/SubLayout";
import { Button } from "@/components/ui/button";
import { Download, Eye, Save, Lock, Pencil, Check, GripVertical, Send } from "lucide-react";
import { useState } from "react";

interface QuoteSection {
  id: string; title: string; included: boolean; editing: boolean; content: string;
}

const initialSections: QuoteSection[] = [
  { id: "summary", title: "Quote Summary", included: true, editing: false,
    content: "TrueFrame Carpentry\nFraming Quote for Maple St. Kitchen Remodel\nGC: Mayfield & Co.\n\nTotal Bid Price: $35,049\nValid Through: April 3, 2026\nEstimated Duration: 2–3 weeks" },
  { id: "scope", title: "Scope Summary", included: true, editing: false,
    content: "• Exterior wall framing — 2x4 @ 16\" OC\n• Interior bearing walls — 2x6 @ 16\" OC\n• Floor joists — I-joists @ 16\" OC\n• Roof trusses — pre-engineered (22 EA)\n• Wall sheathing — 7/16\" OSB\n• Roof sheathing — 7/16\" OSB\n• Blocking — cabinets, TV, handrails\n• Hardware — hangers, clips, straps\n• LVL header install (material by GC)\n• Temporary shoring during demo" },
  { id: "cost", title: "Cost Breakdown", included: true, editing: false,
    content: "Rough Framing Labor ..... $5,988\nLumber/Material Package ..... $6,800\nTruss Package ..... $4,070\nWall Sheathing ..... $1,820\nRoof Sheathing ..... $1,235\nHardware ..... $1,200\nHeaders/LVL Install ..... $810\nBlocking/Nailers ..... $680\nTemporary Shoring ..... $1,200\nGeneral Requirements ..... $1,600\nPre-Build ..... $1,000\nOverhead & Profit (20%) ..... $5,281\nContingency (5%) ..... $1,365" },
  { id: "alternates", title: "Alternates & Options", included: true, editing: false,
    content: "Alt 1: Upgrade to plywood sheathing ..... Add $1,200\nAlt 2: Additional blocking for tile surround ..... Add $350\nVE 1: Reduce to 24\" OC framing (non-bearing) ..... Deduct $800" },
  { id: "allowances", title: "Allowances", included: true, editing: false,
    content: "Misc blocking & nailers ..... $680 allowance\nShop drawings review ..... $400 allowance" },
  { id: "exclusions", title: "Exclusions", included: true, editing: false,
    content: "• Engineered lumber supply (by GC)\n• Subfloor installation\n• Insulation\n• Drywall\n• Exterior finish / siding\n• Permits and inspection fees\n• Design or engineering services" },
  { id: "clarifications", title: "Clarifications", included: true, editing: false,
    content: "• Stair opening dimensions to be confirmed before framing\n• Header sizes per structural detail (not schedule)\n• Assumes clear access to work area during framing phase\n• Temporary bracing removed after roof is sheathed" },
  { id: "terms", title: "Terms & Conditions", included: true, editing: false,
    content: "Payment Schedule:\n• 50% at start of framing\n• 50% at framing completion\n\nQuote valid for 30 days.\nChange orders require written approval.\n1-year workmanship warranty." },
];

export default function SubProposalExportPage() {
  const [sections, setSections] = useState(initialSections);
  const [locked, setLocked] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);

  const toggleSection = (id: string, field: "included" | "editing") => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: !s[field] } : s));
  };

  const updateContent = (id: string, value: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, content: value } : s));
  };

  const renderContentWithPrices = (content: string) => {
    return content.split("\n").map((line, i) => {
      const priceMatch = line.match(/^(.+?)\s*\.{2,}\s*(.+)$/);
      if (priceMatch) {
        return (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span>{priceMatch[1].trim()}</span>
            <span style={{ textAlign: "right", whiteSpace: "nowrap", fontWeight: 600 }}>{priceMatch[2].trim()}</span>
          </div>
        );
      }
      return <div key={i}>{line}</div>;
    });
  };

  const includedSections = sections.filter(s => s.included);

  return (
    <SubLayout>
      <div className="flex h-full overflow-hidden">
        {/* Editor */}
        <div className="flex-1 overflow-y-auto border-r border-border">
          <div className="p-5 lg:p-6 max-w-3xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">Proposal Export</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Framing quote for Maple St. Kitchen Remodel</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setLocked(!locked)} className="gap-1.5">
                  <Lock size={12} /> {locked ? "Unlock" : "Lock"}
                </Button>
                <Button size="sm" className="gap-1.5"><Send size={12} /> Send to GC</Button>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-3">
              {sections.map((s) => (
                <div key={s.id} className={`bg-card border rounded-xl p-4 shadow-card transition-all ${s.included ? "border-border" : "border-border/50 opacity-50"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GripVertical size={14} className="text-muted-foreground cursor-grab" />
                      <h3 className="font-display text-sm font-semibold text-foreground">{s.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => toggleSection(s.id, "included")}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.included ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {s.included ? "Included" : "Excluded"}
                      </button>
                      {s.included && !locked && (
                        <button onClick={() => toggleSection(s.id, "editing")} className="text-muted-foreground hover:text-foreground">
                          {s.editing ? <Check size={14} /> : <Pencil size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                  {s.included && (
                    s.editing ? (
                      <textarea value={s.content} onChange={e => updateContent(s.id, e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring h-32 resize-none" />
                    ) : (
                      <div className="text-xs text-muted-foreground whitespace-pre-line">{s.content}</div>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="w-[480px] xl:w-[540px] bg-muted/30 overflow-y-auto shrink-0 hidden lg:block">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground">Print Preview</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setPreviewZoom(Math.max(60, previewZoom - 10))}>−</Button>
                <span className="text-xs text-muted-foreground self-center">{previewZoom}%</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setPreviewZoom(Math.min(150, previewZoom + 10))}>+</Button>
              </div>
            </div>

            {/* Paper */}
            <div className="bg-white rounded-lg shadow-md mx-auto" style={{ width: `${previewZoom * 4.8}px`, padding: 32, color: "#1a1a1a", fontSize: `${previewZoom * 0.12}px` }}>
              {/* Cover */}
              <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #e5e5e5" }}>
                <div style={{ fontSize: "1.4em", fontWeight: 700, marginBottom: 4 }}>TrueFrame Carpentry</div>
                <div style={{ fontSize: "0.85em", color: "#666", marginBottom: 8 }}>Framing Subcontractor · Midwest</div>
                <div style={{ fontSize: "1.1em", fontWeight: 600, marginBottom: 4 }}>Framing Quote</div>
                <div style={{ fontSize: "0.85em", color: "#666" }}>Project: Maple St. Kitchen Remodel</div>
                <div style={{ fontSize: "0.85em", color: "#666" }}>GC: Mayfield & Co.</div>
                <div style={{ fontSize: "0.85em", color: "#666" }}>Date: March 6, 2026</div>
              </div>

              {/* Sections */}
              {includedSections.map(s => (
                <div key={s.id} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: "1em", fontWeight: 700, marginBottom: 6, borderBottom: "1px solid #eee", paddingBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: "0.85em", lineHeight: 1.6, color: "#333" }}>
                    {renderContentWithPrices(s.content)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SubLayout>
  );
}
