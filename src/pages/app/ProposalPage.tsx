import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Download, Eye, FileText, ChevronUp, ChevronDown, GripVertical,
  ToggleLeft, ToggleRight, Upload, Save, Copy, Send, Lock, AlertTriangle,
  CheckCircle, Palette, X, Plus, Pencil, Clock, Shield, ZoomIn, ZoomOut,
  ChevronLeft, ChevronRight, Code, List, FileCode
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
  showCostCodes: boolean;
  showDescriptions: boolean;
  detailLevel: "summary" | "detailed";
}

const initialSections: ProposalSection[] = [
  { id: "summary", title: "Proposal Summary", desc: "Executive overview with project details, total cost, and timeline", status: "ready", included: true, expanded: false, content: "This proposal covers the complete renovation of the Maple St. Kitchen, including demolition, framing, electrical, plumbing, HVAC modifications, cabinetry, countertops, flooring, and finish work. Total project cost: $168,700. Estimated duration: 8–10 weeks.", internalNotes: "", showCostCodes: false, showDescriptions: true, detailLevel: "summary" },
  { id: "prebuild", title: "Pre-Build Requirements", desc: "Preconstruction, permitting, design, and engineering costs", status: "ready", included: true, expanded: false, content: "Permitting & Fees: $4,700\nDesign & Engineering: $12,700\nSite Investigation & Survey: $6,300\nPlanning & Coordination: $3,000\nHOA Submission: $800", internalNotes: "", showCostCodes: false, showDescriptions: true, detailLevel: "summary" },
  { id: "scope", title: "Scope Summary", desc: "Detailed scope of work organized by trade with inclusions and exclusions", status: "ready", included: true, expanded: false, content: "Division 06 – Wood & Plastics: Custom cabinetry, blocking, trim carpentry\nDivision 09 – Finishes: Drywall, tile backsplash, interior paint\nDivision 22 – Plumbing: Fixture rough-in and finals\nDivision 26 – Electrical: Panel upgrade, lighting, device rough-in", internalNotes: "", showCostCodes: true, showDescriptions: true, detailLevel: "detailed" },
  { id: "cost", title: "Cost Breakdown", desc: "Client-friendly cost breakdown by category with subtotals", status: "ready", included: true, expanded: false, content: "Pre-Build Requirements: $27,500\nDemolition: $8,200\nFraming & Carpentry: $22,400\nElectrical: $18,600\nPlumbing: $14,800\nHVAC: $14,200\nCabinetry & Millwork: $32,500\nCountertops: $12,400\nFlooring: $9,800\nDrywall & Paint: $11,200\nCleanup & Final: $4,600\nGeneral Conditions: $20,000", internalNotes: "Check HVAC allowance before sending", showCostCodes: false, showDescriptions: true, detailLevel: "detailed" },
  { id: "alternates", title: "Alternates & Options", desc: "Optional upgrades and value-engineering alternatives", status: "ready", included: true, expanded: false, content: "Alt 1: Upgrade to quartz countertops — Add $4,200\nAlt 2: Under-cabinet LED lighting package — Add $1,800\nVE 1: Standard grade cabinets instead of custom — Deduct $8,400", internalNotes: "", showCostCodes: false, showDescriptions: true, detailLevel: "summary" },
  { id: "allowances", title: "Allowance Schedule", desc: "Itemized allowances with descriptions and amounts", status: "ready", included: true, expanded: false, content: "Plumbing fixtures: $3,500 allowance\nLight fixtures: $2,800 allowance\nAppliance package: $6,500 allowance\nTile selection: $2,200 allowance", internalNotes: "", showCostCodes: false, showDescriptions: true, detailLevel: "summary" },
  { id: "generalreqs", title: "General Requirements", desc: "Job-wide conditions, supervision, and site overhead", status: "ready", included: true, expanded: false, content: "Dumpster & Hauling: $4,200\nTemporary Facilities: $2,910\nSite Protection: $2,400\nDaily & Final Clean: $3,600\nSupervision: $28,800\nMobilization: $3,200\nSafety & Equipment: $5,700", internalNotes: "Supervision is internal cost — consider hiding from client view", showCostCodes: false, showDescriptions: true, detailLevel: "summary" },
  { id: "exclusions", title: "Exclusions List", desc: "Items explicitly excluded from the scope and pricing", status: "ready", included: true, expanded: false, content: "• Permits and inspection fees\n• Furniture, fixtures & equipment (FF&E)\n• Appliance procurement\n• Landscaping or exterior work\n• Asbestos or hazmat abatement\n• Structural engineering", internalNotes: "", showCostCodes: false, showDescriptions: true, detailLevel: "summary" },
  { id: "clarifications", title: "Clarifications & Exclusions", desc: "Items requiring client clarification before finalizing", status: "ready", included: true, expanded: false, content: "• Confirm final cabinet layout before ordering\n• Tile selection must be finalized 4 weeks before install\n• Owner to confirm appliance models for rough-in dimensions\n• Electrical panel location subject to field verification", internalNotes: "", showCostCodes: false, showDescriptions: true, detailLevel: "summary" },
  { id: "terms", title: "Terms & Conditions", desc: "Standard contract terms, payment schedule, and warranty info", status: "ready", included: true, expanded: false, content: "Payment Schedule:\n• 10% deposit upon signing\n• 30% at rough-in completion\n• 30% at finish stage\n• 30% upon substantial completion\n\nWarranty: 1-year workmanship warranty from date of substantial completion.\n\nChange Orders: All changes must be documented in writing and approved before work proceeds. Additional costs will be billed at agreed-upon rates.", internalNotes: "", showCostCodes: false, showDescriptions: true, detailLevel: "summary" },
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
  const [previewZoom, setPreviewZoom] = useState(100);
  const [previewPage, setPreviewPage] = useState(1);

  const [proposalTitle, setProposalTitle] = useState("Kitchen Renovation Proposal");
  const [proposalNumber, setProposalNumber] = useState("P-2026-0042");
  const [revision, setRevision] = useState("Rev 1");
  const [validThrough, setValidThrough] = useState("2026-04-03");
  const [preparedBy, setPreparedBy] = useState("Ryan M. — Mayfield & Co.");
  const [clientName, setClientName] = useState("Johnson Family");
  const [projectName, setProjectName] = useState("Maple St. Kitchen Remodel");
  const [projectAddress, setProjectAddress] = useState("1247 Maple St, Springfield, IL");

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

  const updateContent = (id: string, field: "content" | "title" | "internalNotes" | "desc", value: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const updateSectionSetting = (id: string, field: "showCostCodes" | "showDescriptions" | "detailLevel", value: any) => {
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

  const totalPages = Math.max(1, Math.ceil(sections.filter(s => s.included).length / 3) + (showCoverPage ? 1 : 0));

  return (
    <AppLayout>
      <div className="flex h-full overflow-hidden">
        {/* LEFT: Editor Panel */}
        <div className="flex-1 overflow-y-auto border-r border-border">
          <div className="p-5 lg:p-6 max-w-3xl">
            {/* Page Header with editable title */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex-1">
                <input
                  value={proposalTitle}
                  onChange={e => setProposalTitle(e.target.value)}
                  disabled={locked}
                  className="font-display text-xl font-bold text-foreground bg-transparent border-none outline-none w-full focus:ring-0 disabled:opacity-70 hover:bg-muted/30 rounded px-1 -ml-1 transition-colors"
                  placeholder="Proposal Title"
                />
                <p className="text-xs text-muted-foreground mt-0.5">Edit, configure, and export your client-facing proposal</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
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
                {[
                  { label: "Prepared By", value: preparedBy, onChange: setPreparedBy },
                  { label: "Client / Owner", value: clientName, onChange: setClientName },
                  { label: "Project Name", value: projectName, onChange: setProjectName },
                  { label: "Project Address", value: projectAddress, onChange: setProjectAddress },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-[10px] text-muted-foreground font-medium">{f.label}</label>
                    <input value={f.value} onChange={e => f.onChange(e.target.value)} disabled={locked}
                      className="w-full mt-0.5 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50" />
                  </div>
                ))}
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
                  { label: "Show Company Logo", id: "logo" },
                  { label: "Branded Footer", id: "footer" },
                  { label: "Page Numbering", id: "pages" },
                ].map(c => (
                  <BrandingToggle key={c.id} label={c.label} defaultOn={true} />
                ))}
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
                          <label className="text-[10px] text-muted-foreground font-medium">Section Description</label>
                          <input value={section.desc} onChange={e => updateContent(section.id, "desc", e.target.value)} disabled={locked}
                            className="w-full mt-0.5 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50" />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground font-medium">Content</label>
                          <textarea value={section.content} onChange={e => updateContent(section.id, "content", e.target.value)} disabled={locked}
                            rows={6}
                            className="w-full mt-0.5 bg-background border border-border rounded-lg px-2.5 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 resize-y" />
                        </div>

                        {/* Section-specific controls */}
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <p className="text-[10px] font-medium text-muted-foreground">Section Display Controls</p>
                          <div className="flex flex-wrap gap-3">
                            <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                              <input type="checkbox" checked={section.showCostCodes} onChange={() => updateSectionSetting(section.id, "showCostCodes", !section.showCostCodes)}
                                className="rounded border-border" />
                              <Code size={11} className="text-muted-foreground" /> Show Cost Codes
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                              <input type="checkbox" checked={section.showDescriptions} onChange={() => updateSectionSetting(section.id, "showDescriptions", !section.showDescriptions)}
                                className="rounded border-border" />
                              <List size={11} className="text-muted-foreground" /> Show Descriptions
                            </label>
                            <select value={section.detailLevel} onChange={e => updateSectionSetting(section.id, "detailLevel", e.target.value)}
                              className="text-xs bg-background border border-border rounded px-2 py-1 text-foreground">
                              <option value="summary">Summary</option>
                              <option value="detailed">Detailed</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-muted-foreground font-medium">Internal Notes <span className="text-muted-foreground">(not shown in proposal)</span></label>
                          <textarea value={section.internalNotes} onChange={e => updateContent(section.id, "internalNotes", e.target.value)} disabled={locked}
                            rows={2} placeholder="Add internal notes..."
                            className="w-full mt-0.5 bg-background border border-border rounded-lg px-2.5 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 resize-y placeholder:text-muted-foreground" />
                        </div>
                        <div className="flex gap-1.5">
                          <Button variant="outline" size="sm" className="text-xs h-7"><Plus size={10} className="mr-1" /> Insert Snippet</Button>
                          <Button variant="outline" size="sm" className="text-xs h-7"><FileCode size={10} className="mr-1" /> Add Standard Terms</Button>
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

        {/* RIGHT: Print-style Live Preview */}
        <div className="hidden lg:flex flex-col w-[480px] xl:w-[540px] shrink-0 bg-muted/50">
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
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button onClick={() => setPreviewZoom(Math.max(50, previewZoom - 10))} className="p-1 text-muted-foreground hover:text-foreground rounded"><ZoomOut size={12} /></button>
                <span className="text-[10px] text-muted-foreground w-8 text-center">{previewZoom}%</span>
                <button onClick={() => setPreviewZoom(Math.min(150, previewZoom + 10))} className="p-1 text-muted-foreground hover:text-foreground rounded"><ZoomIn size={12} /></button>
              </div>
              <div className="flex items-center gap-1 border-l border-border pl-2">
                <button onClick={() => setPreviewPage(Math.max(1, previewPage - 1))} className="p-1 text-muted-foreground hover:text-foreground rounded"><ChevronLeft size={12} /></button>
                <span className="text-[10px] text-muted-foreground">Page {previewPage} of {totalPages}</span>
                <button onClick={() => setPreviewPage(Math.min(totalPages, previewPage + 1))} className="p-1 text-muted-foreground hover:text-foreground rounded"><ChevronRight size={12} /></button>
              </div>
            </div>
          </div>

          {/* Preview Document — Paper Style */}
          <div className="flex-1 overflow-y-auto p-6 flex justify-center">
            <div
              className="bg-white dark:bg-card shadow-[0_2px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.4)] rounded-sm mx-auto"
              style={{
                width: `${Math.round(480 * (previewZoom / 100))}px`,
                minHeight: `${Math.round(620 * (previewZoom / 100))}px`,
                transform: `scale(1)`,
                transformOrigin: "top center",
              }}
            >
              <div className="p-8" style={{ fontSize: `${Math.round(12 * (previewZoom / 100))}px` }}>
                {/* Cover Page */}
                {showCoverPage && (
                  <div className="text-center pb-6 mb-6 border-b border-border">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <Palette size={20} className="text-primary" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-1">{preparedBy.split("—")[1]?.trim() || "Company"}</p>
                    <h2 className="font-display text-base font-bold text-foreground mb-1">{proposalTitle}</h2>
                    <p className="text-xs text-muted-foreground">Prepared for {clientName}</p>
                    <p className="text-xs text-muted-foreground">{projectName}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{projectAddress}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">{proposalNumber} · {revision}</p>
                    <p className="text-[10px] text-muted-foreground">March 4, 2026</p>
                  </div>
                )}

                {/* Rendered Sections */}
                <div className="space-y-5">
                  {sections.filter(s => s.included).map(section => (
                    <div key={section.id}>
                      <h3 className="font-display text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">{section.title}</h3>
                      {section.showDescriptions && (
                        <p className="text-[9px] text-muted-foreground mb-1.5 italic">{section.desc}</p>
                      )}
                      <div className="text-[10px] text-foreground/80 dark:text-foreground/70 leading-relaxed whitespace-pre-line">
                        {section.content}
                      </div>
                    </div>
                  ))}

                  {/* Fee / Tax / Contingency */}
                  {(showFee || showContingency || showTax) && (
                    <div>
                      <h3 className="font-display text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">Pricing Summary</h3>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between text-foreground/70"><span>Base Cost</span><span>$147,200</span></div>
                        {showFee && <div className="flex justify-between text-foreground/70"><span>Fee (12.7%)</span><span>$18,694</span></div>}
                        {showContingency && <div className="flex justify-between text-foreground/70"><span>Contingency (5%)</span><span>$7,360</span></div>}
                        {showTax && <div className="flex justify-between text-foreground/70"><span>Tax (7.5%)</span><span>$12,653</span></div>}
                        <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border"><span>Total</span><span>$168,700</span></div>
                      </div>
                    </div>
                  )}

                  {/* Signature Block */}
                  {showSignature && (
                    <div className="pt-4">
                      <h3 className="font-display text-xs font-bold text-foreground mb-2 uppercase tracking-wider">Acceptance</h3>
                      <p className="text-[9px] text-foreground/60 mb-4">By signing below, Client accepts this proposal and authorizes work to proceed as described.</p>
                      <div className="grid grid-cols-2 gap-4">
                        {["Client Signature", "Date", "Printed Name", "Title"].map(label => (
                          <div key={label}>
                            <div className="border-b border-foreground/20 mb-1 h-5"></div>
                            <p className="text-[8px] text-muted-foreground">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-3 border-t border-border text-center">
                  <p className="text-[8px] text-muted-foreground">{preparedBy.split("—")[1]?.trim() || "Company"} · {proposalNumber} · Valid through {validThrough}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function BrandingToggle({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-foreground">{label}</span>
      <button onClick={() => setOn(!on)} className="text-primary">
        {on ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
      </button>
    </div>
  );
}
