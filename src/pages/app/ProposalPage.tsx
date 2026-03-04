import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Download, Eye, FileText, ChevronUp, ChevronDown, GripVertical,
  ToggleLeft, ToggleRight, Upload, Save, Copy, Send, Lock, AlertTriangle,
  CheckCircle, FileUp, Palette, X, Plus, Pencil, Clock, Shield
} from "lucide-react";
import { useState } from "react";

interface ProposalSection {
  id: string;
  title: string;
  desc: string;
  status: "ready" | "draft";
  included: boolean;
  expanded: boolean;
  content: string;
  internalNotes: string;
}

const initialSections: ProposalSection[] = [
  { id: "summary", title: "Proposal Summary", desc: "Executive overview with project details, total cost, and timeline", status: "ready", included: true, expanded: false, content: "This proposal covers the complete renovation of the Maple St. Kitchen, including demolition, framing, electrical, plumbing, HVAC modifications, cabinetry, countertops, flooring, and finish work. Total project cost: $168,700. Estimated duration: 8–10 weeks.", internalNotes: "" },
  { id: "scope", title: "Scope Summary", desc: "Detailed scope of work organized by trade with inclusions and exclusions", status: "ready", included: true, expanded: false, content: "Division 06 – Wood & Plastics: Custom cabinetry, blocking, trim carpentry\nDivision 09 – Finishes: Drywall, tile backsplash, interior paint\nDivision 22 – Plumbing: Fixture rough-in and finals\nDivision 26 – Electrical: Panel upgrade, lighting, device rough-in", internalNotes: "" },
  { id: "cost", title: "Cost Breakdown", desc: "Client-friendly cost breakdown by category with subtotals", status: "ready", included: true, expanded: false, content: "Demolition: $8,200\nFraming & Carpentry: $22,400\nElectrical: $18,600\nPlumbing: $14,800\nHVAC: $14,200\nCabinetry & Millwork: $32,500\nCountertops: $12,400\nFlooring: $9,800\nDrywall & Paint: $11,200\nCleanup & Final: $4,600\nGeneral Conditions: $20,000", internalNotes: "Check HVAC allowance before sending" },
  { id: "alternates", title: "Alternates & Options", desc: "Optional upgrades and value-engineering alternatives", status: "ready", included: true, expanded: false, content: "Alt 1: Upgrade to quartz countertops — Add $4,200\nAlt 2: Under-cabinet LED lighting package — Add $1,800\nVE 1: Standard grade cabinets instead of custom — Deduct $8,400", internalNotes: "" },
  { id: "allowances", title: "Allowance Schedule", desc: "Itemized allowances with descriptions and amounts", status: "ready", included: true, expanded: false, content: "Plumbing fixtures: $3,500 allowance\nLight fixtures: $2,800 allowance\nAppliance package: $6,500 allowance\nTile selection: $2,200 allowance", internalNotes: "" },
  { id: "exclusions", title: "Exclusions List", desc: "Items explicitly excluded from the scope and pricing", status: "ready", included: true, expanded: false, content: "• Permits and inspection fees\n• Furniture, fixtures & equipment (FF&E)\n• Appliance procurement\n• Landscaping or exterior work\n• Asbestos or hazmat abatement\n• Structural engineering", internalNotes: "" },
  { id: "clarifications", title: "Clarifications & Exclusions", desc: "Items requiring client clarification before finalizing", status: "ready", included: true, expanded: false, content: "• Confirm final cabinet layout before ordering\n• Tile selection must be finalized 4 weeks before install\n• Owner to confirm appliance models for rough-in dimensions\n• Electrical panel location subject to field verification", internalNotes: "" },
  { id: "terms", title: "Terms & Conditions", desc: "Standard contract terms, payment schedule, and warranty info", status: "ready", included: true, expanded: false, content: "Payment Schedule:\n• 10% deposit upon signing\n• 30% at rough-in completion\n• 30% at finish stage\n• 30% upon substantial completion\n\nWarranty: 1-year workmanship warranty from date of substantial completion.\n\nChange Orders: All changes must be documented in writing and approved before work proceeds. Additional costs will be billed at agreed-upon rates.", internalNotes: "" },
];

const viewModes = ["Full Proposal", "Client View", "Section Preview"] as const;
const proposalStates = ["Draft", "Ready for Review", "Finalized"] as const;

export default function ProposalPage() {
  const [sections, setSections] = useState<ProposalSection[]>(initialSections);
  const [activeView, setActiveView] = useState<typeof viewModes[number]>("Full Proposal");
  const [proposalState, setProposalState] = useState<typeof proposalStates[number]>("Draft");
  const [locked, setLocked] = useState(false);
  const [showCoverPage, setShowCoverPage] = useState(true);
  const [showSignature, setShowSignature] = useState(true);
  const [showFee, setShowFee] = useState(false);
  const [showContingency, setShowContingency] = useState(false);
  const [showTax, setShowTax] = useState(true);

  // Proposal header fields
  const [proposalTitle, setProposalTitle] = useState("Kitchen Renovation Proposal");
  const [proposalNumber, setProposalNumber] = useState("P-2026-0042");
  const [revision, setRevision] = useState("Rev 1");
  const [validThrough, setValidThrough] = useState("2026-04-03");

  const readySections = sections.filter(s => s.status === "ready" && s.included).length;
  const includedSections = sections.filter(s => s.included).length;
  const draftSections = sections.filter(s => s.status === "draft" && s.included);
  const warnings: string[] = [];
  if (!validThrough) warnings.push("Expiration date missing");
  if (draftSections.length > 0) warnings.push(`${draftSections.length} section(s) still in draft`);
  if (!sections.find(s => s.id === "exclusions")?.included) warnings.push("No exclusions section included");

  const toggleSection = (id: string, field: keyof ProposalSection) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: !s[field] } : s));
  };

  const updateContent = (id: string, field: "content" | "title" | "internalNotes", value: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const moveSection = (id: string, dir: -1 | 1) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if ((dir === -1 && idx === 0) || (dir === 1 && idx === prev.length - 1)) return prev;
      const next = [...prev];
      [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
      return next;
    });
  };

  return (
    <AppLayout>
      <div className="flex h-full overflow-hidden">
        {/* LEFT: Editor Panel */}
        <div className="flex-1 overflow-y-auto border-r border-border">
          <div className="p-5 lg:p-6 max-w-3xl">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">Proposal Builder</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Edit, configure, and export your client-facing proposal</p>
              </div>
              <div className="flex items-center gap-2">
                <select value={proposalState} onChange={e => setProposalState(e.target.value as any)}
                  className="text-xs bg-card border border-border rounded-lg px-2 py-1.5 text-foreground">
                  {proposalStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <Button variant="outline" size="sm" onClick={() => setLocked(!locked)} className="gap-1.5">
                  <Lock size={12} /> {locked ? "Unlock" : "Lock"}
                </Button>
              </div>
            </div>

            {/* Commercial Snapshot */}
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-5">
              {[
                { label: "Est. Cost", value: "$147,200" },
                { label: "Sell Price", value: "$168,700" },
                { label: "Gross Margin", value: "12.7%" },
                { label: "Allowances", value: "$15,000" },
                { label: "Alternates", value: "3" },
                { label: "Valid Through", value: "Apr 3" },
              ].map(m => (
                <div key={m.label} className="bg-card border border-border rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  <p className="font-display text-sm font-bold text-foreground">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Readiness Panel */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-card mb-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-sm font-semibold text-foreground">Document Readiness</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  warnings.length === 0 ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                }`}>
                  {warnings.length === 0 ? "Ready to Export" : `${warnings.length} Issue${warnings.length > 1 ? "s" : ""}`}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                <span><CheckCircle size={11} className="inline mr-1 text-primary" />{readySections} of {includedSections} sections ready</span>
                <span><Clock size={11} className="inline mr-1" />{revision} · Updated 2h ago</span>
              </div>
              {warnings.length > 0 && (
                <div className="space-y-1 mt-2">
                  {warnings.map(w => (
                    <div key={w} className="flex items-center gap-1.5 text-xs text-warning">
                      <AlertTriangle size={10} /> {w}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Template Controls */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-card mb-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-sm font-semibold text-foreground">Template</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">Default Template</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button variant="outline" size="sm" className="text-xs h-7"><Upload size={11} className="mr-1" /> Upload Template</Button>
                <Button variant="outline" size="sm" className="text-xs h-7"><Save size={11} className="mr-1" /> Save as Template</Button>
                <Button variant="outline" size="sm" className="text-xs h-7"><Copy size={11} className="mr-1" /> Duplicate</Button>
                <Button variant="outline" size="sm" className="text-xs h-7">Use Default</Button>
              </div>
            </div>

            {/* Proposal Identity */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-card mb-5">
              <h3 className="font-display text-sm font-semibold text-foreground mb-3">Proposal Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Proposal Title", value: proposalTitle, onChange: setProposalTitle },
                  { label: "Proposal Number", value: proposalNumber, onChange: setProposalNumber },
                  { label: "Revision", value: revision, onChange: setRevision },
                  { label: "Valid Through", value: validThrough, onChange: setValidThrough },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-[10px] text-muted-foreground font-medium">{f.label}</label>
                    <input value={f.value} onChange={e => f.onChange(e.target.value)} disabled={locked}
                      className="w-full mt-0.5 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-[10px] text-muted-foreground font-medium">Prepared By</label>
                  <input defaultValue="Ryan M. — Mayfield & Co." disabled={locked} className="w-full mt-0.5 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-medium">Client / Owner</label>
                  <input defaultValue="Johnson Family" disabled={locked} className="w-full mt-0.5 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50" />
                </div>
              </div>
            </div>

            {/* Presentation Controls */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-card mb-5">
              <h3 className="font-display text-sm font-semibold text-foreground mb-3">Presentation Controls</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Include Cover Page", state: showCoverPage, toggle: () => setShowCoverPage(!showCoverPage) },
                  { label: "Include Signature Block", state: showSignature, toggle: () => setShowSignature(!showSignature) },
                  { label: "Show Fee Separately", state: showFee, toggle: () => setShowFee(!showFee) },
                  { label: "Show Contingency", state: showContingency, toggle: () => setShowContingency(!showContingency) },
                  { label: "Show Tax Separately", state: showTax, toggle: () => setShowTax(!showTax) },
                ].map(c => (
                  <div key={c.label} className="flex items-center justify-between py-1">
                    <span className="text-xs text-foreground">{c.label}</span>
                    <button onClick={c.toggle} className="text-primary">
                      {c.state ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Branding Controls */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-card mb-5">
              <h3 className="font-display text-sm font-semibold text-foreground mb-3">Branding</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Show Company Logo", default: true },
                  { label: "Branded Footer", default: true },
                  { label: "Page Numbering", default: true },
                ].map(c => {
                  const [on, setOn] = useState(c.default);
                  return (
                    <div key={c.label} className="flex items-center justify-between py-1">
                      <span className="text-xs text-foreground">{c.label}</span>
                      <button onClick={() => setOn(!on)} className="text-primary">
                        {on ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Editable Sections */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-sm font-semibold text-foreground">Proposal Sections</h3>
                <span className="text-[10px] text-muted-foreground">{includedSections} of {sections.length} included</span>
              </div>
              <div className="space-y-2">
                {sections.map((section) => (
                  <div key={section.id} className={`bg-card border rounded-xl shadow-card transition-all ${
                    section.included ? "border-border" : "border-border opacity-50"
                  }`}>
                    {/* Section Header */}
                    <div className="flex items-center gap-2 px-4 py-3">
                      <GripVertical size={14} className="text-muted-foreground shrink-0 cursor-grab" />
                      <button onClick={() => toggleSection(section.id, "expanded")} className="flex-1 text-left flex items-center gap-2">
                        <FileText size={14} className="text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-display text-sm font-semibold text-foreground">{section.title}</span>
                          <p className="text-[10px] text-muted-foreground truncate">{section.desc}</p>
                        </div>
                      </button>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                        section.status === "ready" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                      }`}>{section.status === "ready" ? "Ready" : "Draft"}</span>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button onClick={() => moveSection(section.id, -1)} className="p-1 text-muted-foreground hover:text-foreground rounded"><ChevronUp size={12} /></button>
                        <button onClick={() => moveSection(section.id, 1)} className="p-1 text-muted-foreground hover:text-foreground rounded"><ChevronDown size={12} /></button>
                      </div>
                      <button onClick={() => toggleSection(section.id, "included")} className="text-primary shrink-0">
                        {section.included ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </div>

                    {/* Expanded Editor */}
                    {section.expanded && section.included && (
                      <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                        <div>
                          <label className="text-[10px] text-muted-foreground font-medium">Section Title</label>
                          <input value={section.title} onChange={e => updateContent(section.id, "title", e.target.value)} disabled={locked}
                            className="w-full mt-0.5 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground font-medium">Content</label>
                          <textarea value={section.content} onChange={e => updateContent(section.id, "content", e.target.value)} disabled={locked}
                            rows={5}
                            className="w-full mt-0.5 bg-background border border-border rounded-lg px-2.5 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 resize-y" />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground font-medium">Internal Notes <span className="text-muted-foreground">(not shown in proposal)</span></label>
                          <textarea value={section.internalNotes} onChange={e => updateContent(section.id, "internalNotes", e.target.value)} disabled={locked}
                            rows={2} placeholder="Add internal notes..."
                            className="w-full mt-0.5 bg-background border border-border rounded-lg px-2.5 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 resize-y placeholder:text-muted-foreground" />
                        </div>
                        <div className="flex gap-1.5">
                          <Button variant="outline" size="sm" className="text-xs h-7"><Plus size={10} className="mr-1" /> Insert Snippet</Button>
                          <Button variant="outline" size="sm" className="text-xs h-7"
                            onClick={() => setSections(prev => prev.map(s => s.id === section.id ? { ...s, status: s.status === "ready" ? "draft" : "ready" } : s))}>
                            {section.status === "ready" ? "Mark as Draft" : "Mark as Ready"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Final Actions */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-card mb-5">
              <h3 className="font-display text-sm font-semibold text-foreground mb-3">Export & Share</h3>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="gap-1.5"><Download size={12} /> Export PDF</Button>
                <Button variant="outline" size="sm" className="gap-1.5"><Download size={12} /> Export DOCX</Button>
                <Button variant="outline" size="sm" className="gap-1.5"><Copy size={12} /> Copy Share Link</Button>
                <Button variant="outline" size="sm" className="gap-1.5"><Send size={12} /> Send to Client</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button variant="outline" size="sm" className="gap-1.5"><Save size={12} /> Save Draft</Button>
                <Button variant="outline" size="sm" className="gap-1.5"><Shield size={12} /> Approve Final</Button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="hidden lg:flex flex-col w-[420px] xl:w-[480px] shrink-0 bg-muted/30">
          {/* Preview Controls */}
          <div className="px-4 py-2.5 border-b border-border bg-card flex items-center justify-between shrink-0">
            <div className="flex gap-1">
              {viewModes.map(v => (
                <button key={v} onClick={() => setActiveView(v)}
                  className={`text-[10px] px-2 py-1 rounded font-medium transition-colors ${
                    activeView === v ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}>{v}</button>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">Page 1 of 4</span>
          </div>

          {/* Preview Document */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-card border border-border rounded-xl shadow-card mx-auto max-w-sm">
              {/* Cover Page */}
              {showCoverPage && (
                <div className="p-8 border-b border-border text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <Palette size={24} className="text-primary" />
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-1">Mayfield & Co.</p>
                  <h2 className="font-display text-base font-bold text-foreground mb-1">{proposalTitle}</h2>
                  <p className="text-xs text-muted-foreground">Prepared for Johnson Family</p>
                  <p className="text-xs text-muted-foreground">Maple St. Kitchen Remodel</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{proposalNumber} · {revision}</p>
                  <p className="text-[10px] text-muted-foreground">March 4, 2026</p>
                </div>
              )}

              {/* Rendered Sections */}
              <div className="divide-y divide-border">
                {sections.filter(s => s.included).map(section => (
                  <div key={section.id} className="p-5">
                    <h3 className="font-display text-xs font-bold text-foreground mb-2">{section.title}</h3>
                    <div className="text-[10px] text-muted-foreground leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                ))}

                {/* Fee / Tax / Contingency */}
                {(showFee || showContingency || showTax) && (
                  <div className="p-5">
                    <h3 className="font-display text-xs font-bold text-foreground mb-2">Pricing Summary</h3>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between text-muted-foreground"><span>Base Cost</span><span>$147,200</span></div>
                      {showFee && <div className="flex justify-between text-muted-foreground"><span>Fee (12.7%)</span><span>$18,694</span></div>}
                      {showContingency && <div className="flex justify-between text-muted-foreground"><span>Contingency (5%)</span><span>$7,360</span></div>}
                      {showTax && <div className="flex justify-between text-muted-foreground"><span>Tax (7.5%)</span><span>$12,653</span></div>}
                      <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border"><span>Total</span><span>$168,700</span></div>
                    </div>
                  </div>
                )}

                {/* Signature Block */}
                {showSignature && (
                  <div className="p-5">
                    <h3 className="font-display text-xs font-bold text-foreground mb-3">Acceptance</h3>
                    <p className="text-[10px] text-muted-foreground mb-4">By signing below, Client accepts this proposal and authorizes Mayfield & Co. to proceed with the work described herein.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="border-b border-muted-foreground/30 mb-1 h-6"></div>
                        <p className="text-[9px] text-muted-foreground">Client Signature</p>
                      </div>
                      <div>
                        <div className="border-b border-muted-foreground/30 mb-1 h-6"></div>
                        <p className="text-[9px] text-muted-foreground">Date</p>
                      </div>
                      <div>
                        <div className="border-b border-muted-foreground/30 mb-1 h-6"></div>
                        <p className="text-[9px] text-muted-foreground">Printed Name</p>
                      </div>
                      <div>
                        <div className="border-b border-muted-foreground/30 mb-1 h-6"></div>
                        <p className="text-[9px] text-muted-foreground">Title</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-border text-center">
                <p className="text-[9px] text-muted-foreground">Mayfield & Co. · {proposalNumber} · Valid through {validThrough}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}