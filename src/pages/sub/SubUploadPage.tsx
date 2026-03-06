import { SubLayout } from "@/components/sub/SubLayout";
import { Upload, X, CheckCircle, ArrowRight, Settings2, Layers, Target, ChevronDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { WorkflowTransition } from "@/components/app/WorkflowTransition";
import { useState, useMemo } from "react";
import { useSubSettings } from "@/hooks/use-sub-settings";
import { allTradeNames, type TradeName, getTradeProfile } from "@/data/tradeProfiles";
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
const pricingBasisOptions = ["Labor + Material", "Labor Only", "Material Only", "Full (L+M+E)"];
const quoteOrgOptions = ["Trade Categories", "Company Custom Codes", "CSI Divisions"];
const displayFormatOptions = ["Title + Description", "Description Only", "Code + Description"];

export default function SubUploadPage() {
  const { settings } = useSubSettings();
  const [projectTrade, setProjectTrade] = useState<TradeName | null>(null);
  const activeTrade = projectTrade || settings.primaryTrade;
  const profile = getTradeProfile(activeTrade);
  const isOverridden = projectTrade !== null;

  const [files, setFiles] = useState<UploadedFile[]>([
    { name: "A1_Floor_Plan.pdf", sourceType: "plans", status: "Classified" },
    { name: "A2_Foundation_Plan.pdf", sourceType: "plans", status: "Classified" },
    { name: "A4_Detail_Plan.pdf", sourceType: "plans", status: "Classified" },
    { name: "S1_Structural_Details.pdf", sourceType: "structural", status: "Classified" },
    { name: "Finish_Schedule.xlsx", sourceType: "schedules", status: "Classified" },
    { name: "GC_Scope_Package.pdf", sourceType: "scope", status: "Classified" },
    { name: "Addendum_1.pdf", sourceType: "addenda", status: "Classified" },
    { name: "RFI_Responses.pdf", sourceType: "rfis", status: "Classified" },
  ]);
  const [transition, setTransition] = useState(false);

  // Per-project overrides
  const [pricingBasis, setPricingBasis] = useState(pricingBasisOptions[0]);
  const [pricingStyle, setPricingStyle] = useState(settings.pricingStyle);
  const [crewSize, setCrewSize] = useState(String(settings.crewSize));
  const [loadedRate, setLoadedRate] = useState(String(settings.loadedRate));
  const [burdenIncluded, setBurdenIncluded] = useState(settings.burdenIncluded);
  const [wasteFactor, setWasteFactor] = useState(String(settings.wasteFactor));
  const [materialTax, setMaterialTax] = useState(settings.materialTaxToggle);
  const [quoteOrg, setQuoteOrg] = useState("Trade Categories");
  const [displayFormat, setDisplayFormat] = useState("Title + Description");
  const [scopeToggles, setScopeToggles] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    profile.scopeResponsibility.forEach(s => { m[s.label] = s.defaultIncluded; });
    return m;
  });
  const [assumptions, setAssumptions] = useState(() => profile.baselineAssumptions.map(a => ({ ...a })));

  // When trade changes, re-seed scope & assumptions
  const handleTradeChange = (t: TradeName) => {
    setProjectTrade(t === settings.primaryTrade ? null : t);
    const p = getTradeProfile(t);
    const m: Record<string, boolean> = {};
    p.scopeResponsibility.forEach(s => { m[s.label] = s.defaultIncluded; });
    setScopeToggles(m);
    setAssumptions(p.baselineAssumptions.map(a => ({ ...a })));
    setWasteFactor(String(p.materialDefaults.wastePercent));
    setPricingStyle(p.recommendedPricingStyle);
    setCrewSize(String(p.laborDefaults.crewSize));
    setLoadedRate(String(p.laborDefaults.loadedRate));
    setBurdenIncluded(p.laborDefaults.burdenIncluded);
  };

  const addFiles = () => {
    setFiles([...files, { name: `Document_${files.length + 1}.pdf`, sourceType: "other", status: "Needs Review" }]);
  };

  const categories: SourceType[] = ["plans", "structural", "scope", "addenda", "schedules", "rfis", "other"];

  // Check if anything has been customized
  const hasOverrides = isOverridden || pricingStyle !== settings.pricingStyle || Number(crewSize) !== settings.crewSize;

  return (
    <SubLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Document Upload</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">Upload scope packages, plans, and project files to begin your quote.</p>
        </div>

        {/* Trade Profile Banner */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-card border border-border rounded-2xl shadow-sm">
          <Layers size={15} className="text-primary shrink-0" />
          <span className="text-sm text-muted-foreground">Trade Profile:</span>
          <span className="text-sm font-semibold text-foreground">{activeTrade}</span>
          {isOverridden && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/10 text-warning font-medium">Project Override</span>}
          {!isOverridden && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Company Default</span>}
          <div className="ml-auto">
            <select className="text-xs bg-background border border-border rounded-lg px-2 py-1 text-foreground outline-none" value={activeTrade} onChange={e => handleTradeChange(e.target.value as TradeName)}>
              {allTradeNames.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {hasOverrides && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-warning/5 border border-warning/20 rounded-xl text-xs text-warning">
            <Info size={13} />
            <span>Customized for this project — company defaults unchanged</span>
          </div>
        )}

        {!transition ? (
          <div className="space-y-8">
            {/* Upload Area */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <div className="border-2 border-dashed border-primary/30 rounded-xl p-10 text-center cursor-pointer hover:border-primary/60 transition-colors" onClick={addFiles}>
                <Upload className="mx-auto mb-3 text-primary" size={32} />
                <p className="font-display font-semibold text-foreground text-base mb-1">Drop files here or click to upload</p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Plans · Drawings · GC scope packages · Addenda · Schedules · RFI responses
                </p>
              </div>
            </div>

            {/* File Classification */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="font-display text-sm font-semibold text-foreground mb-1">File Classification</h2>
              <p className="text-xs text-muted-foreground mb-4">Bedrock classifies uploads automatically. Reassign types as needed.</p>
              <div className="space-y-1.5">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-muted/20">
                    <span className="text-sm flex-1 text-foreground">{f.name}</span>
                    <select value={f.sourceType} onChange={(e) => setFiles(files.map((ff, j) => j === i ? { ...ff, sourceType: e.target.value as SourceType, status: "Classified" } : ff))}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium border-0 outline-none cursor-pointer">
                      {categories.map(cat => <option key={cat} value={cat}>{sourceTypeLabels[cat]}</option>)}
                    </select>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${f.status === "Classified" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"}`}>{f.status}</span>
                    <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X size={12} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Setup */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="font-display text-sm font-semibold text-foreground mb-4">Project Setup</h2>
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Project Name</label>
                  <input className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" defaultValue="Maple St. Kitchen Remodel" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">GC / Builder</label>
                  <input className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" defaultValue="Mayfield & Co." />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Trade</label>
                  <input className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none text-foreground opacity-60" value={activeTrade} readOnly />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Bid Due Date</label>
                  <input type="date" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" defaultValue="2026-03-12" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Region</label>
                  <select className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" defaultValue={settings.region}>
                    {regions.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Spec Level</label>
                  <select className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground">
                    {specLevels.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Notes</label>
                  <input className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" placeholder="Scope notes, special conditions..." />
                </div>
              </div>
            </div>

            {/* Quote Setup */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="font-display text-sm font-semibold text-foreground mb-4">Quote Setup</h2>
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Pricing Basis</label>
                  <select className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" value={pricingBasis} onChange={e => setPricingBasis(e.target.value)}>
                    {pricingBasisOptions.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Pricing Style</label>
                  <select className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" value={pricingStyle} onChange={e => setPricingStyle(e.target.value)}>
                    {profile.pricingStyleOptions.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-1">Recommended: {profile.recommendedPricingStyle}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Quote Includes</label>
                  <div className="flex flex-wrap gap-2">
                    {(["Labor", "Material", "Equipment", "Permits", "Cleanup"] as const).map(k => {
                      const key = k.toLowerCase() as keyof typeof settings.quoteIncludes;
                      return (
                        <span key={k} className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", settings.quoteIncludes[key] ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                          {k}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Labor Defaults */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="font-display text-sm font-semibold text-foreground mb-4">Labor Defaults</h2>
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Crew Size</label>
                  <input type="number" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" value={crewSize} onChange={e => setCrewSize(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground mt-1">Trade default: {profile.laborDefaults.crewSize}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Loaded Rate ($/hr)</label>
                  <input type="number" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" value={loadedRate} onChange={e => setLoadedRate(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground mt-1">Trade default: ${profile.laborDefaults.loadedRate}/hr</p>
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <Switch checked={burdenIncluded} onCheckedChange={setBurdenIncluded} className="scale-75" />
                  <span className="text-sm text-foreground">Burden included</span>
                </div>
              </div>
            </div>

            {/* Material Defaults */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="font-display text-sm font-semibold text-foreground mb-4">Material Defaults</h2>
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">{profile.materialDefaults.wasteLabel} %</label>
                  <input type="number" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" value={wasteFactor} onChange={e => setWasteFactor(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground mt-1">Trade default: {profile.materialDefaults.wastePercent}%</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Pricing Source</label>
                  <select className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" defaultValue={settings.materialPricingSource}>
                    <option>Supplier Quote</option>
                    <option>Company Price Book</option>
                    <option>Regional Benchmark</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-5">
                  <Switch checked={materialTax} onCheckedChange={setMaterialTax} className="scale-75" />
                  <span className="text-sm text-foreground">Material tax included</span>
                </div>
              </div>
            </div>

            {/* Quote Structure */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="font-display text-sm font-semibold text-foreground mb-4">Quote Structure</h2>
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Organization</label>
                  <select className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" value={quoteOrg} onChange={e => setQuoteOrg(e.target.value)}>
                    {quoteOrgOptions.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Display Format</label>
                  <select className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" value={displayFormat} onChange={e => setDisplayFormat(e.target.value)}>
                    {displayFormatOptions.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Trade Categories</label>
                  <div className="flex flex-wrap gap-1">
                    {profile.tradeCategories.map(c => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Scope Responsibility */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="font-display text-sm font-semibold text-foreground mb-1">Scope Responsibility</h2>
              <p className="text-xs text-muted-foreground mb-4">{activeTrade} scope inclusions — toggle items your quote covers. Excluded items auto-populate exclusions.</p>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-1">
                {profile.scopeResponsibility.map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-foreground">{s.label}</span>
                    <Switch checked={scopeToggles[s.label] ?? s.defaultIncluded} onCheckedChange={v => setScopeToggles(prev => ({ ...prev, [s.label]: v }))} className="scale-75" />
                  </div>
                ))}
              </div>
            </div>

            {/* Defaults & Assumptions */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="font-display text-sm font-semibold text-foreground mb-1">Defaults & Assumptions</h2>
              <p className="text-xs text-muted-foreground mb-4">{activeTrade}-specific baseline assumptions. Edit values for this project as needed.</p>
              <div className="grid md:grid-cols-2 gap-4">
                {assumptions.map((a, i) => (
                  <div key={a.label}>
                    <label className="text-xs font-medium text-foreground mb-1.5 block">{a.label}</label>
                    <input className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground" value={a.value} onChange={e => setAssumptions(prev => prev.map((p, j) => j === i ? { ...p, value: e.target.value } : p))} />
                  </div>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="flex justify-end">
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
