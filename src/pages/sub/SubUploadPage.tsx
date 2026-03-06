import { SubLayout } from "@/components/sub/SubLayout";
import { Upload, X, ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { WorkflowTransition } from "@/components/app/WorkflowTransition";
import { useState } from "react";
import { cn } from "@/lib/utils";

type SourceType = "plans" | "structural" | "scope" | "addenda" | "schedules" | "rfis" | "other";

interface UploadedFile {
  name: string;
  sourceType: SourceType;
  status: "Classified" | "Needs Review";
}

const sourceTypeLabels: Record<SourceType, string> = {
  plans: "Plans / Drawings",
  structural: "Structural",
  scope: "Scope Package",
  addenda: "Addenda",
  schedules: "Schedules",
  rfis: "RFI Responses",
  other: "Other",
};

const regions = ["Northeast", "Southeast", "Midwest", "Southwest", "West Coast", "Pacific NW"];
const specLevels = ["Builder Grade", "Mid-Tier", "Premium", "Luxury"];

// ─── Collapsible Section Component ───────────────────────────────
function Section({ title, subtitle, defaultOpen = true, children }: { title: string; subtitle?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full px-6 py-4 flex items-center justify-between text-left">
        <div>
          <h2 className="font-display text-sm font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <ChevronDown size={16} className={cn("text-muted-foreground transition-transform", !open && "-rotate-90")} />
      </button>
      {open && <div className="px-6 pb-5 border-t border-border pt-4">{children}</div>}
    </div>
  );
}

// ─── Toggle Row ───────────────────────────────────────────────────
function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-1.5 cursor-pointer group">
      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} className="scale-[0.8]" />
    </label>
  );
}

// ─── Radio Option Row ─────────────────────────────────────────────
function RadioRow({ label, tag, selected, onSelect }: { label: string; tag?: string; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className={cn(
      "w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors",
      selected ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted/50"
    )}>
      <span className={cn("w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center",
        selected ? "border-primary" : "border-muted-foreground/40"
      )}>
        {selected && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
      </span>
      <span>{label}</span>
      {tag && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium ml-auto">{tag}</span>}
    </button>
  );
}

// ─── Input helper ─────────────────────────────────────────────────
function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground";
const selectCls = inputCls;

export default function SubUploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([
    { name: "A1_Floor_Plan.pdf", sourceType: "plans", status: "Classified" },
    { name: "A2_Foundation_Plan.pdf", sourceType: "plans", status: "Classified" },
    { name: "A4_Framing_Plan.pdf", sourceType: "plans", status: "Classified" },
    { name: "S1_Structural_Details.pdf", sourceType: "structural", status: "Classified" },
    { name: "Finish_Schedule.xlsx", sourceType: "schedules", status: "Classified" },
    { name: "GC_Scope_Package_Framing.pdf", sourceType: "scope", status: "Classified" },
    { name: "Addendum_1.pdf", sourceType: "addenda", status: "Classified" },
    { name: "RFI_Responses.pdf", sourceType: "rfis", status: "Classified" },
  ]);
  const [transition, setTransition] = useState(false);

  // Quote Setup
  const [includesLabor, setIncludesLabor] = useState(true);
  const [includesMaterials, setIncludesMaterials] = useState(true);
  const [includesEquipment, setIncludesEquipment] = useState(false);
  const [includesSubSubs, setIncludesSubSubs] = useState(false);
  const [includesMob, setIncludesMob] = useState(true);
  const [includesCleanup, setIncludesCleanup] = useState(true);
  const [pricingStyle, setPricingStyle] = useState("fixed");

  // Labor Defaults
  const [crewSize, setCrewSize] = useState("3");
  const [laborRate, setLaborRate] = useState("65");
  const [burdenIncluded, setBurdenIncluded] = useState(true);
  const [showLaborAdvanced, setShowLaborAdvanced] = useState(false);
  const [otMultiplier, setOtMultiplier] = useState("1.5");
  const [framingRate, setFramingRate] = useState("32");
  const [sheathingRate, setSheathingRate] = useState("85");

  // Material Defaults
  const [materialBasis, setMaterialBasis] = useState("supplier");
  const [lumberWaste, setLumberWaste] = useState("10");
  const [sheathingWaste, setSheathingWaste] = useState("7");
  const [hardwareAllowance, setHardwareAllowance] = useState(true);
  const [hardwareAmount, setHardwareAmount] = useState("1200");
  const [salesTax, setSalesTax] = useState(true);

  // Quote Structure
  const [orgSystem, setOrgSystem] = useState("trade");
  const [lineItemTemplate, setLineItemTemplate] = useState("full");
  const [displayFormat, setDisplayFormat] = useState("title-desc");

  // Scope Responsibility
  const [demoFraming, setDemoFraming] = useState(false);
  const [tempShoring, setTempShoring] = useState(true);
  const [blocking, setBlocking] = useState(true);
  const [hardware, setHardware] = useState(true);
  const [engineering, setEngineering] = useState(false);
  const [delivery, setDelivery] = useState(true);

  // Defaults & Assumptions
  const [wallHeight, setWallHeight] = useState("9");
  const [studSpacing, setStudSpacing] = useState("16");
  const [sheathingThickness, setSheathingThickness] = useState("7/16");
  const [headerMaterial, setHeaderMaterial] = useState("LVL");

  const addFiles = () => {
    setFiles([...files, { name: `Document_${files.length + 1}.pdf`, sourceType: "other", status: "Needs Review" }]);
  };

  const categories: SourceType[] = ["plans", "structural", "scope", "addenda", "schedules", "rfis", "other"];

  return (
    <SubLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="font-display text-2xl font-bold text-foreground">Project Intake</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">Upload scope documents and configure your quote preferences before Bedrock structures your workspace.</p>
          </div>
          <Button size="sm" className="gap-1.5 shrink-0 ml-4" onClick={() => setTransition(true)}>
            Continue to Scope Analyzer <ArrowRight size={14} />
          </Button>
        </div>

        {!transition ? (
          <div className="space-y-4">
            {/* Upload Area */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/60 transition-colors" onClick={addFiles}>
                <Upload className="mx-auto mb-3 text-primary" size={28} />
                <p className="font-display font-semibold text-foreground text-sm mb-1">Drop files here or click to upload</p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Plans · Structural drawings · GC scope packages · Addenda · Schedules · RFI responses
                </p>
              </div>
            </div>

            {/* File Classification */}
            <Section title="File Classification" subtitle="Bedrock classifies uploads automatically. Reassign types as needed.">
              <div className="space-y-1.5">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-muted/20">
                    <span className="text-sm flex-1 text-foreground">{f.name}</span>
                    <select value={f.sourceType} onChange={(e) => setFiles(files.map((ff, j) => j === i ? { ...ff, sourceType: e.target.value as SourceType, status: "Classified" } : ff))}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium border-0 outline-none cursor-pointer">
                      {categories.map(cat => <option key={cat} value={cat}>{sourceTypeLabels[cat]}</option>)}
                    </select>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", f.status === "Classified" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning")}>{f.status}</span>
                    <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X size={12} /></button>
                  </div>
                ))}
              </div>
            </Section>

            {/* Project Setup */}
            <Section title="Project Setup">
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Project Name"><input className={inputCls} defaultValue="Maple St. Kitchen Remodel" /></Field>
                <Field label="GC / Builder"><input className={inputCls} defaultValue="Mayfield & Co." /></Field>
                <Field label="Trade"><input className={inputCls} defaultValue="Framing" readOnly /></Field>
                <Field label="Bid Due Date"><input type="date" className={inputCls} defaultValue="2026-03-12" /></Field>
                <Field label="Region">
                  <select className={selectCls} defaultValue="Midwest">
                    {regions.map(r => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Spec Level">
                  <select className={selectCls}>{specLevels.map(s => <option key={s}>{s}</option>)}</select>
                </Field>
                <Field label="Notes" className="md:col-span-3">
                  <input className={inputCls} placeholder="Scope notes, special conditions..." />
                </Field>
              </div>
            </Section>

            {/* ═══════════ QUOTE SETUP ═══════════ */}
            <Section title="Quote Setup" subtitle="What's included in this quote and how should it be priced?">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">This Quote Includes</p>
                  <div className="space-y-0.5">
                    <ToggleRow label="Labor" checked={includesLabor} onChange={setIncludesLabor} />
                    <ToggleRow label="Materials" checked={includesMaterials} onChange={setIncludesMaterials} />
                    <ToggleRow label="Equipment" checked={includesEquipment} onChange={setIncludesEquipment} />
                    <ToggleRow label="Sub-subcontractors" checked={includesSubSubs} onChange={setIncludesSubSubs} />
                    <ToggleRow label="Mobilization / travel" checked={includesMob} onChange={setIncludesMob} />
                    <ToggleRow label="Cleanup / disposal" checked={includesCleanup} onChange={setIncludesCleanup} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Pricing Style</p>
                  <div className="space-y-0.5">
                    <RadioRow label="Fixed Price" selected={pricingStyle === "fixed"} onSelect={() => setPricingStyle("fixed")} tag="Default" />
                    <RadioRow label="Unit Rates" selected={pricingStyle === "unit"} onSelect={() => setPricingStyle("unit")} />
                    <RadioRow label="Time & Materials" selected={pricingStyle === "tm"} onSelect={() => setPricingStyle("tm")} />
                    <RadioRow label="Not-to-Exceed" selected={pricingStyle === "nte"} onSelect={() => setPricingStyle("nte")} />
                    <RadioRow label="Cost-Plus" selected={pricingStyle === "cost-plus"} onSelect={() => setPricingStyle("cost-plus")} />
                  </div>
                </div>
              </div>
            </Section>

            {/* ═══════════ LABOR DEFAULTS ═══════════ */}
            <Section title="Labor Defaults" subtitle="Crew and rate assumptions for this project.">
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Crew Size">
                  <select className={selectCls} value={crewSize} onChange={(e) => setCrewSize(e.target.value)}>
                    {["1", "2", "3", "4+"].map(s => <option key={s} value={s}>{s} {s === "1" ? "person" : s === "4+" ? "people" : "people"}</option>)}
                  </select>
                </Field>
                <Field label="Loaded Labor Rate ($/hr)">
                  <input type="number" className={inputCls} value={laborRate} onChange={(e) => setLaborRate(e.target.value)} />
                </Field>
                <div className="flex items-end pb-1">
                  <ToggleRow label="Burden included?" checked={burdenIncluded} onChange={setBurdenIncluded} />
                </div>
              </div>
              <button onClick={() => setShowLaborAdvanced(!showLaborAdvanced)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-3 transition-colors">
                <ChevronRight size={12} className={cn("transition-transform", showLaborAdvanced && "rotate-90")} />
                Advanced — Production rates & overtime
              </button>
              {showLaborAdvanced && (
                <div className="grid md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-border">
                  <Field label="Overtime Multiplier">
                    <input type="number" step="0.1" className={inputCls} value={otMultiplier} onChange={(e) => setOtMultiplier(e.target.value)} />
                  </Field>
                  <Field label="Framing Production (LF/hr)">
                    <input type="number" className={inputCls} value={framingRate} onChange={(e) => setFramingRate(e.target.value)} />
                  </Field>
                  <Field label="Sheathing Production (SF/hr)">
                    <input type="number" className={inputCls} value={sheathingRate} onChange={(e) => setSheathingRate(e.target.value)} />
                  </Field>
                </div>
              )}
            </Section>

            {/* ═══════════ MATERIAL DEFAULTS ═══════════ */}
            <Section title="Material Defaults" subtitle="Pricing sources, waste factors, and tax assumptions.">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Field label="Material Pricing Basis">
                    <select className={selectCls} value={materialBasis} onChange={(e) => setMaterialBasis(e.target.value)}>
                      <option value="supplier">Supplier quote attached</option>
                      <option value="pricebook">Company price book</option>
                      <option value="benchmark">Regional benchmark (Bedrock)</option>
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Framing Lumber Waste %">
                      <input type="number" className={inputCls} value={lumberWaste} onChange={(e) => setLumberWaste(e.target.value)} />
                    </Field>
                    <Field label="Sheathing Waste %">
                      <input type="number" className={inputCls} value={sheathingWaste} onChange={(e) => setSheathingWaste(e.target.value)} />
                    </Field>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <ToggleRow label="Hardware LS allowance" checked={hardwareAllowance} onChange={setHardwareAllowance} />
                  </div>
                  {hardwareAllowance && (
                    <Field label="Allowance Amount ($)">
                      <input type="number" className={inputCls} value={hardwareAmount} onChange={(e) => setHardwareAmount(e.target.value)} />
                    </Field>
                  )}
                  <ToggleRow label="Sales tax applied to materials?" checked={salesTax} onChange={setSalesTax} />
                </div>
              </div>
            </Section>

            {/* ═══════════ QUOTE STRUCTURE ═══════════ */}
            <Section title="Quote Structure" subtitle="How Bedrock should organize your line items and final package.">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Organization System</p>
                  <div className="space-y-0.5">
                    <RadioRow label="Trade Categories" selected={orgSystem === "trade"} onSelect={() => setOrgSystem("trade")} tag="Recommended" />
                    <RadioRow label="Company Custom Codes" selected={orgSystem === "custom"} onSelect={() => setOrgSystem("custom")} />
                    <RadioRow label="Map to CSI (export only)" selected={orgSystem === "csi"} onSelect={() => setOrgSystem("csi")} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Line Item Template</p>
                  <div className="space-y-0.5">
                    <RadioRow label="Base Scope only" selected={lineItemTemplate === "base"} onSelect={() => setLineItemTemplate("base")} />
                    <RadioRow label="Base + Alternates" selected={lineItemTemplate === "alt"} onSelect={() => setLineItemTemplate("alt")} />
                    <RadioRow label="Base + Allowances" selected={lineItemTemplate === "allow"} onSelect={() => setLineItemTemplate("allow")} />
                    <RadioRow label="Full Package" selected={lineItemTemplate === "full"} onSelect={() => setLineItemTemplate("full")} tag="Recommended" />
                  </div>
                  {lineItemTemplate === "full" && (
                    <p className="text-[10px] text-muted-foreground mt-1.5 px-3">Base + Alternates + Allowances + Exclusions + Clarifications</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Display Format</p>
                  <div className="space-y-0.5">
                    <RadioRow label="Title + Description" selected={displayFormat === "title-desc"} onSelect={() => setDisplayFormat("title-desc")} tag="Default" />
                    <RadioRow label="Title only" selected={displayFormat === "title"} onSelect={() => setDisplayFormat("title")} />
                  </div>
                </div>
              </div>
            </Section>

            {/* ═══════════ SCOPE RESPONSIBILITY ═══════════ */}
            <Section title="Scope Responsibility (Framing)" subtitle="Toggle what's included in your framing scope. Excluded items auto-populate your Bid Package exclusions.">
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-0.5">
                <ToggleRow label="Demo framing included?" checked={demoFraming} onChange={setDemoFraming} />
                <ToggleRow label="Temporary shoring included?" checked={tempShoring} onChange={setTempShoring} />
                <ToggleRow label="Blocking / backing included?" checked={blocking} onChange={setBlocking} />
                <ToggleRow label="Hardware / hangers included?" checked={hardware} onChange={setHardware} />
                <ToggleRow label="Engineering / truss design included?" checked={engineering} onChange={setEngineering} />
                <ToggleRow label="Delivery / staging included?" checked={delivery} onChange={setDelivery} />
              </div>
            </Section>

            {/* ═══════════ DEFAULTS & ASSUMPTIONS ═══════════ */}
            <Section title="Defaults & Assumptions" subtitle="Baseline assumptions that pre-fill your Scope Analyzer." defaultOpen={false}>
              <div className="grid md:grid-cols-4 gap-4">
                <Field label="Default Wall Height">
                  <select className={selectCls} value={wallHeight} onChange={(e) => setWallHeight(e.target.value)}>
                    {["8", "9", "10", "12"].map(h => <option key={h} value={h}>{h} ft</option>)}
                  </select>
                </Field>
                <Field label="Stud Spacing">
                  <select className={selectCls} value={studSpacing} onChange={(e) => setStudSpacing(e.target.value)}>
                    <option value="16">16&quot; OC</option>
                    <option value="24">24&quot; OC</option>
                  </select>
                </Field>
                <Field label="Sheathing Thickness">
                  <select className={selectCls} value={sheathingThickness} onChange={(e) => setSheathingThickness(e.target.value)}>
                    <option value="7/16">7/16&quot; OSB</option>
                    <option value="1/2">1/2&quot; OSB</option>
                    <option value="1/2 ply">1/2&quot; Plywood</option>
                    <option value="5/8">5/8&quot; Plywood</option>
                  </select>
                </Field>
                <Field label="Header Material">
                  <select className={selectCls} value={headerMaterial} onChange={(e) => setHeaderMaterial(e.target.value)}>
                    <option value="LVL">LVL</option>
                    <option value="PSL">PSL</option>
                    <option value="Solid Sawn">Solid Sawn</option>
                  </select>
                </Field>
              </div>
            </Section>

            {/* Bottom CTA */}
            <div className="flex justify-end pt-2">
              <Button size="sm" className="gap-1.5" onClick={() => setTransition(true)}>
                Continue to Scope Analyzer <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <WorkflowTransition
        active={transition}
        headline="Organizing your project files"
        steps={[
          { label: "Reading plans" },
          { label: "Taking measurements" },
          { label: "Condensing scope" },
          { label: "Preparing takeoff quantities" },
        ]}
        targetPath="/sub/scope-analyzer"
        onComplete={() => setTransition(false)}
      />
    </SubLayout>
  );
}
