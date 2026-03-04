import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Download, Eye, FileText, ToggleLeft, ToggleRight, Upload, Save, Copy, Send, Lock, AlertTriangle,
  CheckCircle, Palette, X, Plus, Pencil, Clock, Shield, ZoomIn, ZoomOut,
  ChevronLeft, ChevronRight, Check, FileCode
} from "lucide-react";
import { useState } from "react";

interface ProposalSection {
  id: string;
  title: string;
  desc: string;
  status: "ready" | "draft";
  included: boolean;
  editing: boolean;
  content: string;
  internalNotes: string;
}

const initialSections: ProposalSection[] = [
  { id: "summary", title: "Proposal Summary", desc: "Executive overview with project details, total cost, and timeline", status: "ready", included: true, editing: false, content: "This proposal covers the complete renovation of the Maple St. Kitchen, including demolition, framing, electrical, plumbing, HVAC modifications, cabinetry, countertops, flooring, and finish work. Total project cost: $168,700. Estimated duration: 8–10 weeks.", internalNotes: "" },
  { id: "prebuild", title: "Pre-Build Requirements", desc: "Preconstruction, permitting, design, and engineering costs", status: "ready", included: true, editing: false, content: "Permitting & Fees: $4,700\nDesign & Engineering: $12,700\nSite Investigation & Survey: $6,300\nPlanning & Coordination: $3,000\nHOA Submission: $800", internalNotes: "" },
  { id: "scope", title: "Scope Summary", desc: "Detailed scope of work organized by trade with inclusions and exclusions", status: "ready", included: true, editing: false, content: "Division 06 – Wood & Plastics: Custom cabinetry, blocking, trim carpentry\nDivision 09 – Finishes: Drywall, tile backsplash, interior paint\nDivision 22 – Plumbing: Fixture rough-in and finals\nDivision 26 – Electrical: Panel upgrade, lighting, device rough-in", internalNotes: "" },
  { id: "cost", title: "Cost Breakdown", desc: "Client-friendly cost breakdown by category with subtotals", status: "ready", included: true, editing: false, content: "Pre-Build Requirements: $27,500\nDemolition: $8,200\nFraming & Carpentry: $22,400\nElectrical: $18,600\nPlumbing: $14,800\nHVAC: $14,200\nCabinetry & Millwork: $32,500\nCountertops: $12,400\nFlooring: $9,800\nDrywall & Paint: $11,200\nCleanup & Final: $4,600\nGeneral Conditions: $20,000", internalNotes: "Check HVAC allowance before sending" },
  { id: "alternates", title: "Alternates & Options", desc: "Optional upgrades and value-engineering alternatives", status: "ready", included: true, editing: false, content: "Alt 1: Upgrade to quartz countertops — Add $4,200\nAlt 2: Under-cabinet LED lighting package — Add $1,800\nVE 1: Standard grade cabinets instead of custom — Deduct $8,400", internalNotes: "" },
  { id: "allowances", title: "Allowance Schedule", desc: "Itemized allowances with descriptions and amounts", status: "ready", included: true, editing: false, content: "Plumbing fixtures: $3,500 allowance\nLight fixtures: $2,800 allowance\nAppliance package: $6,500 allowance\nTile selection: $2,200 allowance", internalNotes: "" },
  { id: "generalreqs", title: "General Requirements", desc: "Job-wide conditions, supervision, and site overhead", status: "ready", included: true, editing: false, content: "Dumpster & Hauling: $4,200\nTemporary Facilities: $2,910\nSite Protection: $2,400\nDaily & Final Clean: $3,600\nSupervision: $28,800\nMobilization: $3,200\nSafety & Equipment: $5,700", internalNotes: "Supervision is internal cost — consider hiding from client view" },
  { id: "exclusions", title: "Exclusions List", desc: "Items explicitly excluded from the scope and pricing", status: "ready", included: true, editing: false, content: "• Permits and inspection fees\n• Furniture, fixtures & equipment (FF&E)\n• Appliance procurement\n• Landscaping or exterior work\n• Asbestos or hazmat abatement\n• Structural engineering", internalNotes: "" },
  { id: "clarifications", title: "Clarifications & Exclusions", desc: "Items requiring client clarification before finalizing", status: "ready", included: true, editing: false, content: "• Confirm final cabinet layout before ordering\n• Tile selection must be finalized 4 weeks before install\n• Owner to confirm appliance models for rough-in dimensions\n• Electrical panel location subject to field verification", internalNotes: "" },
  { id: "terms", title: "Terms & Conditions", desc: "Standard contract terms, payment schedule, and warranty info", status: "ready", included: true, editing: false, content: "Payment Schedule:\n• 10% deposit upon signing\n• 30% at rough-in completion\n• 30% at finish stage\n• 30% upon substantial completion\n\nWarranty: 1-year workmanship warranty from date of substantial completion.\n\nChange Orders: All changes must be documented in writing and approved before work proceeds. Additional costs will be billed at agreed-upon rates.", internalNotes: "" },
];

const viewModes = ["Full Proposal", "Client View", "Section Preview"] as const;
const proposalStates = ["Draft", "Ready for Review", "Finalized"] as const;
type MarginSetting = "narrow" | "standard" | "wide";

// Pricing summary row type
interface PricingRow {
  id: string; label: string; value: string; visible: boolean;
}

const defaultPricingRows: PricingRow[] = [
  { id: "builder-cost", label: "Builder Cost", value: "$147,200", visible: true },
  { id: "markup", label: "Markup (12.7%)", value: "$18,694", visible: true },
  { id: "overhead", label: "Overhead", value: "$4,400", visible: false },
  { id: "profit", label: "Profit", value: "$14,294", visible: false },
  { id: "contingency", label: "Contingency (5%)", value: "$7,360", visible: false },
  { id: "tax", label: "Tax (7.5%)", value: "$12,653", visible: true },
  { id: "fee", label: "Fee", value: "$0", visible: false },
  { id: "client-price", label: "Client Price", value: "$168,700", visible: true },
];

export default function ProposalPage() {
  const [sections, setSections] = useState<ProposalSection[]>(initialSections);
  const [activeView, setActiveView] = useState<typeof viewModes[number]>("Full Proposal");
  const [proposalState, setProposalState] = useState<typeof proposalStates[number]>("Draft");
  const [locked, setLocked] = useState(false);
  const [showCoverPage, setShowCoverPage] = useState(true);
  const [showSignature, setShowSignature] = useState(true);
  const [showCostCodes, setShowCostCodes] = useState(false);
  const [showDescriptions, setShowDescriptions] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showBuilderCost, setShowBuilderCost] = useState(false);
  const [showSubcontractor, setShowSubcontractor] = useState(false);
  const [pageMargins, setPageMargins] = useState<MarginSetting>("standard");
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

  const [pricingRows, setPricingRows] = useState<PricingRow[]>(defaultPricingRows);
  const [editingPricing, setEditingPricing] = useState(false);

  const readySections = sections.filter(s => s.status === "ready" && s.included).length;
  const includedSections = sections.filter(s => s.included).length;
  const draftSections = sections.filter(s => s.status === "draft" && s.included);
  const warnings: string[] = [];
  if (!validThrough) warnings.push("Expiration date missing");
  if (draftSections.length > 0) warnings.push(`${draftSections.length} section(s) still in draft`);
  if (!sections.find(s => s.id === "exclusions")?.included) warnings.push("No exclusions section included");

  const toggleSection = (id: string, field: "included" | "editing") => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: !s[field] } : s));
  };

  const updateContent = (id: string, field: "content" | "title" | "internalNotes" | "desc", value: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const includedSectionsList = sections.filter(s => s.included);
  const sectionsPerPage = 3;
  const totalPages = Math.max(1, (showCoverPage ? 1 : 0) + Math.ceil(includedSectionsList.length / sectionsPerPage) + (showSignature ? 1 : 0));

  const marginPx = pageMargins === "narrow" ? 24 : pageMargins === "wide" ? 48 : 32;

  // Get sections for the current preview page
  const getPageSections = (page: number) => {
    let contentPageStart = showCoverPage ? 2 : 1;
    if (page < contentPageStart) return { type: "cover" as const };
    const contentPage = page - contentPageStart;
    const start = contentPage * sectionsPerPage;
    const end = start + sectionsPerPage;
    const pageSections = includedSectionsList.slice(start, end);
    if (pageSections.length === 0) {
      if (showSignature && page === totalPages) return { type: "signature" as const };
      return { type: "empty" as const };
    }
    return { type: "content" as const, sections: pageSections };
  };

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
                { label: "Builder Cost", value: "$147,200" },
                { label: "Client Price", value: "$168,700" },
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

            {/* Presentation Controls — consolidated */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-card mb-5">
              <h3 className="font-display text-sm font-semibold text-foreground mb-3">Presentation Controls</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Include Cover Page", state: showCoverPage, toggle: () => setShowCoverPage(!showCoverPage) },
                  { label: "Include Signature Block", state: showSignature, toggle: () => setShowSignature(!showSignature) },
                  { label: "Show Cost Codes", state: showCostCodes, toggle: () => setShowCostCodes(!showCostCodes) },
                  { label: "Show Descriptions", state: showDescriptions, toggle: () => setShowDescriptions(!showDescriptions) },
                  { label: "Show Price", state: showPrice, toggle: () => setShowPrice(!showPrice) },
                  { label: "Show Builder Cost", state: showBuilderCost, toggle: () => setShowBuilderCost(!showBuilderCost) },
                  { label: "Show Selected Subcontractor", state: showSubcontractor, toggle: () => setShowSubcontractor(!showSubcontractor) },
                ].map(c => (
                  <div key={c.label} className="flex items-center justify-between py-1">
                    <span className="text-xs text-foreground">{c.label}</span>
                    <button onClick={c.toggle} className="text-primary">
                      {c.state ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                  </div>
                ))}
              </div>
              {/* Page Margins */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">Page Margins</span>
                  <div className="flex gap-1">
                    {(["narrow", "standard", "wide"] as MarginSetting[]).map(m => (
                      <button key={m} onClick={() => setPageMargins(m)}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-medium capitalize transition-colors ${
                          pageMargins === m ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                        }`}>{m}</button>
                    ))}
                  </div>
                </div>
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

            {/* Pricing Summary — editable & toggle-driven */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-card mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-sm font-semibold text-foreground">Pricing Summary</h3>
                <button onClick={() => setEditingPricing(!editingPricing)} className="text-muted-foreground hover:text-foreground">
                  {editingPricing ? <Check size={14} className="text-primary" /> : <Pencil size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mb-3">Builder Cost is the internal cost before Pricing & Margin. Client Price is the amount after markup.</p>
              <div className="space-y-1.5">
                {pricingRows.map(row => (
                  <div key={row.id} className="flex items-center gap-2">
                    <button onClick={() => setPricingRows(prev => prev.map(r => r.id === row.id ? { ...r, visible: !r.visible } : r))}
                      className="shrink-0">
                      {row.visible ? <Eye size={12} className="text-primary" /> : <X size={12} className="text-muted-foreground" />}
                    </button>
                    {editingPricing ? (
                      <>
                        <input value={row.label} onChange={e => setPricingRows(prev => prev.map(r => r.id === row.id ? { ...r, label: e.target.value } : r))}
                          className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring" />
                        <input value={row.value} onChange={e => setPricingRows(prev => prev.map(r => r.id === row.id ? { ...r, value: e.target.value } : r))}
                          className="w-24 bg-background border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring text-right" />
                      </>
                    ) : (
                      <div className={`flex-1 flex justify-between text-xs ${row.visible ? "text-foreground" : "text-muted-foreground line-through opacity-50"}`}>
                        <span>{row.label}</span>
                        <span className="font-display font-semibold">{row.value}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Editable Sections — pencil/check pattern, no arrows, no section display text */}
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
                    {/* Section Header — clean: no arrows, no section display text */}
                    <div className="flex items-center gap-2 px-4 py-3">
                      <FileText size={14} className="text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-display text-sm font-semibold text-foreground">{section.title}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                        section.status === "ready" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                      }`}>{section.status === "ready" ? "Ready" : "Draft"}</span>
                      {/* Pencil / Check edit toggle */}
                      <button onClick={() => toggleSection(section.id, "editing")} className="text-muted-foreground hover:text-foreground shrink-0">
                        {section.editing ? <Check size={14} className="text-primary" /> : <Pencil size={14} />}
                      </button>
                      <button onClick={() => toggleSection(section.id, "included")} className="text-primary shrink-0">
                        {section.included ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </div>

                    {/* Expanded Editor — only when editing */}
                    {section.editing && section.included && (
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

        {/* RIGHT: Print-style Page-by-Page Preview */}
        <div className="hidden lg:flex flex-col w-[480px] xl:w-[540px] shrink-0 bg-muted/50 dark:bg-neutral-900/50">
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

          {/* Preview Document — Always White Paper Pages */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-6" style={{ background: "hsl(var(--muted) / 0.5)" }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
              const pageData = getPageSections(pageNum);
              return (
                <div
                  key={pageNum}
                  className="rounded-sm shrink-0"
                  style={{
                    width: `${Math.round(440 * (previewZoom / 100))}px`,
                    minHeight: `${Math.round(570 * (previewZoom / 100))}px`,
                    padding: `${Math.round(marginPx * (previewZoom / 100))}px`,
                    fontSize: `${Math.round(12 * (previewZoom / 100))}px`,
                    background: "#ffffff",
                    color: "#1a1a1a",
                    boxShadow: "0 2px 20px rgba(0,0,0,0.15)",
                    position: "relative",
                  }}
                >
                  {/* Cover Page */}
                  {pageData.type === "cover" && (
                    <div className="flex flex-col items-center justify-center h-full text-center" style={{ minHeight: `${Math.round(500 * (previewZoom / 100))}px` }}>
                      <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: "hsl(140,50%,32%,0.1)" }}>
                        <Palette size={20} style={{ color: "hsl(140,50%,32%)" }} />
                      </div>
                      <p style={{ fontSize: "0.7em", color: "#888", marginBottom: 4 }}>{preparedBy.split("—")[1]?.trim() || "Company"}</p>
                      <h2 style={{ fontSize: "1.3em", fontWeight: 700, marginBottom: 4, color: "#111" }}>{proposalTitle}</h2>
                      <p style={{ fontSize: "0.85em", color: "#666" }}>Prepared for {clientName}</p>
                      <p style={{ fontSize: "0.85em", color: "#666" }}>{projectName}</p>
                      <p style={{ fontSize: "0.7em", color: "#999", marginTop: 4 }}>{projectAddress}</p>
                      <p style={{ fontSize: "0.7em", color: "#999", marginTop: 12 }}>{proposalNumber} · {revision}</p>
                      <p style={{ fontSize: "0.7em", color: "#999" }}>March 4, 2026</p>
                    </div>
                  )}

                  {/* Content Pages */}
                  {pageData.type === "content" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {pageData.sections.map(section => (
                        <div key={section.id}>
                          <h3 style={{ fontSize: "0.8em", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, color: "#222" }}>{section.title}</h3>
                          {showDescriptions && (
                            <p style={{ fontSize: "0.7em", color: "#888", fontStyle: "italic", marginBottom: 6 }}>{section.desc}</p>
                          )}
                          <div style={{ fontSize: "0.75em", color: "#444", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                            {section.content}
                          </div>
                        </div>
                      ))}
                      {/* Pricing summary on last content page */}
                      {pageNum === (showCoverPage ? 1 : 0) + Math.ceil(includedSectionsList.length / sectionsPerPage) && (
                        <div>
                          <h3 style={{ fontSize: "0.8em", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, color: "#222" }}>Pricing Summary</h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            {pricingRows.filter(r => r.visible).map(row => (
                              <div key={row.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75em", color: row.id === "client-price" ? "#111" : "#555", fontWeight: row.id === "client-price" ? 700 : 400, borderTop: row.id === "client-price" ? "1px solid #ddd" : undefined, paddingTop: row.id === "client-price" ? 4 : 0 }}>
                                <span>{row.label}</span><span>{row.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Signature Page */}
                  {pageData.type === "signature" && (
                    <div style={{ paddingTop: 32 }}>
                      <h3 style={{ fontSize: "0.8em", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, color: "#222" }}>Acceptance</h3>
                      <p style={{ fontSize: "0.65em", color: "#888", marginBottom: 24 }}>By signing below, Client accepts this proposal and authorizes work to proceed as described.</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {["Client Signature", "Date", "Printed Name", "Title"].map(label => (
                          <div key={label}>
                            <div style={{ borderBottom: "1px solid #ccc", marginBottom: 4, height: 24 }}></div>
                            <p style={{ fontSize: "0.6em", color: "#999" }}>{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Page footer */}
                  <div style={{ position: "absolute", bottom: Math.round(marginPx * (previewZoom / 100) * 0.6), left: Math.round(marginPx * (previewZoom / 100)), right: Math.round(marginPx * (previewZoom / 100)), borderTop: "1px solid #eee", paddingTop: 4, textAlign: "center" }}>
                    <p style={{ fontSize: "0.55em", color: "#bbb" }}>{preparedBy.split("—")[1]?.trim() || "Company"} · {proposalNumber} · Page {pageNum} of {totalPages}</p>
                  </div>
                </div>
              );
            })}
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
