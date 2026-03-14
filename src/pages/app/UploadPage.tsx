import { AppLayout } from "@/components/app/AppLayout";
import { Upload, X, CheckCircle, ArrowRight, Settings2, Layers, Target, FileText, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowTransition } from "@/components/app/WorkflowTransition";
import { useState } from "react";

const projectTypes = ["Remodel", "Custom Home", "Addition", "White Box", "Tenant Finish", "Commercial Rehab"];
const specLevels = ["Builder Grade", "Mid-Tier", "Premium", "Luxury"];
const regions = ["Northeast", "Southeast", "Midwest", "Southwest", "West Coast", "Pacific NW"];

type SourceType = "plans" | "schedules" | "scope" | "takeoff" | "estimates" | "proposals" | "subbids" | "vendorquotes" | "other";

interface UploadedFile {
  name: string;
  sourceType: SourceType;
  status: "Classified" | "Needs Review";
  isPrimary?: boolean;
  excludeFromAnalysis?: boolean;
}

const sourceTypeLabels: Record<SourceType, string> = {
  plans: "Plans / Drawings",
  schedules: "Schedules",
  scope: "Scope Documents",
  takeoff: "Takeoff Imports",
  estimates: "Estimates",
  proposals: "Proposals",
  subbids: "Subcontractor Bids",
  vendorquotes: "Vendor Quotes",
  other: "Other",
};

const sourceTypeIcons: Record<SourceType, string> = {
  plans: "📐", schedules: "📅", scope: "📋", takeoff: "📊",
  estimates: "📑", proposals: "📄", subbids: "📨", vendorquotes: "💰", other: "📎",
};

const costCodeSystems = [
  { id: "16div", label: "16-Division Default", description: "Standard 16-division construction cost code structure" },
  { id: "custom", label: "Company Custom Codes", description: "Mayfield & Co. custom cost code system" },
];

const estimateSections = [
  "Pre-Build Requirements", "Base Scope", "General Requirements",
  "Allowances", "Selection Placeholders", "Alternates / Options",
];

const workflowGoals = [
  { id: "build", label: "Build Estimate", description: "Full estimating workflow from plans to proposal" },
  { id: "compare", label: "Compare Existing Estimate", description: "Benchmark an existing estimate against market data" },
  { id: "subpackages", label: "Prepare Sub Scope Packages", description: "Build and send scope packages to subcontractors" },
];

const analysisSources = [
  { id: "plans", label: "Plans / Drawings" },
  { id: "estimate", label: "Uploaded Estimate" },
  { id: "subbids", label: "Subcontractor Bids" },
  { id: "all", label: "Use All Sources" },
];

const estimateUsageOptions = [
  { id: "reference", label: "Use as Reference Only" },
  { id: "baseline", label: "Use as Baseline Estimate" },
  { id: "comparison", label: "Use for Market Comparison" },
];

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([
    { name: "A1.1_Floor_Plan.pdf", sourceType: "plans", status: "Classified" },
    { name: "S1.1_Structural.pdf", sourceType: "plans", status: "Classified" },
    { name: "Finish_Schedule.xlsx", sourceType: "schedules", status: "Classified" },
    { name: "Spark_Electric_Bid.pdf", sourceType: "subbids", status: "Classified" },
    { name: "BrightWire_Quote.pdf", sourceType: "subbids", status: "Classified" },
    { name: "AquaFlow_Plumbing_Bid.pdf", sourceType: "subbids", status: "Classified" },
  ]);
  const [processing, setProcessing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeCostCode, setActiveCostCode] = useState("16div");
  const [workflowGoal, setWorkflowGoal] = useState("build");
  const [analysisSource, setAnalysisSource] = useState("all");
  const [estimateUsage, setEstimateUsage] = useState("baseline");
  const [transition, setTransition] = useState(false);

  const addFiles = () => {
    const newFiles: UploadedFile[] = [
      { name: `Document_${files.length + 1}.pdf`, sourceType: "scope", status: "Needs Review" },
    ];
    setFiles([...files, ...newFiles]);
  };

  const handleSubmit = () => {
    setTransition(true);
  };

  const updateSourceType = (index: number, newType: SourceType) => {
    setFiles(files.map((f, i) => i === index ? { ...f, sourceType: newType, status: "Classified" } : f));
  };

  const togglePrimary = (index: number) => {
    setFiles(files.map((f, i) => i === index ? { ...f, isPrimary: !f.isPrimary } : f));
  };

  const toggleExclude = (index: number) => {
    setFiles(files.map((f, i) => i === index ? { ...f, excludeFromAnalysis: !f.excludeFromAnalysis } : f));
  };

  const categories: SourceType[] = ["plans", "schedules", "scope", "takeoff", "estimates", "proposals", "subbids", "vendorquotes", "other"];
  const allCategories = ["all", ...categories] as const;
  const filteredFiles = activeCategory === "all" ? files : files.filter(f => f.sourceType === activeCategory);
  const filesByCategory = (cat: string) => files.filter(f => f.sourceType === cat).length;

  const hasEstimatesOrProposals = files.some(f => f.sourceType === "estimates" || f.sourceType === "proposals");

  const classifiedCount = files.filter(f => f.status === "Classified").length;
  const needsReviewCount = files.filter(f => f.status === "Needs Review").length;
  const primarySelected = files.some(f => f.isPrimary);
  const isReady = files.length > 0 && needsReviewCount === 0;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Document Upload</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">Upload project files and configure how Euclid should structure your project before analysis.</p>
        </div>

        {!transition ? (
          <div className="space-y-8">
            {/* === UPLOAD AREA === */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <div
                className="border-2 border-dashed border-primary/30 rounded-xl p-10 text-center cursor-pointer hover:border-primary/60 transition-colors"
                onClick={addFiles}
              >
                <Upload className="mx-auto mb-3 text-primary" size={32} />
                <p className="font-display font-semibold text-foreground text-base mb-1">Drop files here or click to upload</p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Plans · Schedules · Scope docs · Takeoff sheets · Estimates · Proposals · Subcontractor bids · Vendor quotes
                </p>
              </div>
            </div>

            {/* === FILE CLASSIFICATION === */}
            {files.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                <h2 className="font-display text-sm font-semibold text-foreground mb-1">File Classification</h2>
                <p className="text-xs text-muted-foreground mb-4">Euclid classifies uploads automatically. Reassign types, mark primary sources, or exclude files.</p>

                <div className="flex gap-1.5 flex-wrap mb-4">
                  {allCategories.map(cat => {
                    const count = cat === "all" ? files.length : filesByCategory(cat);
                    if (cat !== "all" && count === 0) return null;
                    return (
                      <button key={cat} onClick={() => setActiveCategory(cat)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                          activeCategory === cat ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}>
                        {cat === "all" ? `All (${count})` : `${sourceTypeLabels[cat as SourceType]} (${count})`}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5">
                  {filteredFiles.map((f) => {
                    const realIndex = files.indexOf(f);
                    return (
                      <div key={realIndex} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                        f.excludeFromAnalysis ? "bg-muted/10 opacity-50" : "bg-muted/20"
                      }`}>
                        <span className="text-sm">{sourceTypeIcons[f.sourceType]}</span>
                        <span className={`text-sm flex-1 ${f.excludeFromAnalysis ? "line-through text-muted-foreground" : "text-foreground"}`}>{f.name}</span>
                        {f.isPrimary && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">PRIMARY</span>
                        )}
                        <button onClick={() => togglePrimary(realIndex)} title="Mark as primary source"
                          className={`text-[10px] px-1.5 py-0.5 rounded-full border transition-colors ${
                            f.isPrimary ? "border-primary/30 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                          }`}>
                          ★
                        </button>
                        <button onClick={() => toggleExclude(realIndex)} title={f.excludeFromAnalysis ? "Include in analysis" : "Exclude from analysis"}
                          className={`text-[10px] px-1.5 py-0.5 rounded-full border transition-colors ${
                            f.excludeFromAnalysis ? "border-destructive/30 text-destructive" : "border-border text-muted-foreground hover:text-foreground"
                          }`}>
                          {f.excludeFromAnalysis ? "Excluded" : "Excl"}
                        </button>
                        <select
                          value={f.sourceType}
                          onChange={(e) => updateSourceType(realIndex, e.target.value as SourceType)}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium border-0 outline-none cursor-pointer"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{sourceTypeLabels[cat]}</option>
                          ))}
                        </select>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          f.status === "Classified" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                        }`}>{f.status}</span>
                        <button onClick={() => setFiles(files.filter((_, j) => j !== realIndex))} className="text-muted-foreground hover:text-destructive">
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* === PROJECT SETUP (moved above Project Structuring) === */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <h2 className="font-display text-sm font-semibold text-foreground mb-4">Project Setup</h2>
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Project Name</label>
                  <input className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue="Maple St. Kitchen Remodel" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Client / Owner</label>
                  <input className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Johnson Family" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Project Type</label>
                  <select className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                    {projectTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Region</label>
                  <select className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                    {regions.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Spec Level</label>
                  <select className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                    {specLevels.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Square Footage</label>
                  <input className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. 2,800" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Project Address</label>
                  <input className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. 123 Maple St, Chicago, IL" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Job Number / Internal ID</label>
                  <input className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. MF-2024-042" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Notes</label>
                  <input className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Optional project notes..." />
                </div>
              </div>
            </div>

            {/* === PROJECT STRUCTURING (simplified) === */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Settings2 size={16} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-sm font-semibold text-foreground">Project Structuring</h2>
                  <p className="text-[11px] text-muted-foreground">Tell Euclid how to interpret and structure your project data.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Cost Code System */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Layers size={12} className="text-primary" />
                    Active Cost Code System
                  </label>
                  {costCodeSystems.map(sys => (
                    <button key={sys.id} onClick={() => setActiveCostCode(sys.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${
                        activeCostCode === sys.id
                          ? "border-primary/40 bg-primary/5"
                          : "border-border bg-background hover:border-primary/20"
                      }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                          activeCostCode === sys.id ? "border-primary" : "border-muted-foreground/30"
                        }`}>
                          {activeCostCode === sys.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </div>
                        <span className="text-xs font-medium text-foreground">{sys.label}</span>
                      </div>
                    </button>
                  ))}
                  <button className="text-[10px] text-primary font-medium hover:underline ml-1">
                    + Upload Custom Codes
                  </button>
                </div>

                {/* Primary Workflow Goal */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Target size={12} className="text-primary" />
                    Primary Workflow Goal
                  </label>
                  {workflowGoals.map(goal => (
                    <button key={goal.id} onClick={() => setWorkflowGoal(goal.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${
                        workflowGoal === goal.id
                          ? "border-primary/40 bg-primary/5"
                          : "border-border bg-background hover:border-primary/20"
                      }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                          workflowGoal === goal.id ? "border-primary" : "border-muted-foreground/30"
                        }`}>
                          {workflowGoal === goal.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </div>
                        <span className="text-xs font-medium text-foreground">{goal.label}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Primary Analysis Source */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <FileText size={12} className="text-primary" />
                    Primary Analysis Source
                  </label>
                  {analysisSources.map(src => (
                    <button key={src.id} onClick={() => setAnalysisSource(src.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl border transition-colors ${
                        analysisSource === src.id
                          ? "border-primary/40 bg-primary/5"
                          : "border-border bg-background hover:border-primary/20"
                      }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                          analysisSource === src.id ? "border-primary" : "border-muted-foreground/30"
                        }`}>
                          {analysisSource === src.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </div>
                        <span className="text-xs font-medium text-foreground">{src.label}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Estimate File Usage or Estimate Structure */}
                {hasEstimatesOrProposals ? (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <FileText size={12} className="text-primary" />
                      Estimate File Usage
                    </label>
                    {estimateUsageOptions.map(opt => (
                      <button key={opt.id} onClick={() => setEstimateUsage(opt.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl border transition-colors ${
                          estimateUsage === opt.id
                            ? "border-primary/40 bg-primary/5"
                            : "border-border bg-background hover:border-primary/20"
                        }`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                            estimateUsage === opt.id ? "border-primary" : "border-muted-foreground/30"
                          }`}>
                            {estimateUsage === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          </div>
                          <span className="text-xs font-medium text-foreground">{opt.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <Layers size={12} className="text-primary" />
                      Preferred Estimate Structure
                    </label>
                    <div className="bg-background border border-border rounded-xl p-3">
                      <p className="text-[10px] text-muted-foreground mb-2">Bedrock will organize scope into these sections:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {estimateSections.map(sec => (
                          <span key={sec} className="text-[10px] px-2 py-1 rounded-full bg-primary/8 text-primary border border-primary/10 font-medium">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* === DATA READINESS === */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isReady ? "bg-primary/10" : "bg-warning/10"}`}>
                  {isReady ? <CheckCircle size={16} className="text-primary" /> : <AlertCircle size={16} className="text-warning" />}
                </div>
                <div>
                  <h2 className="font-display text-sm font-semibold text-foreground">Data Readiness</h2>
                  <p className="text-[11px] text-muted-foreground">
                    {isReady ? "Project is ready for Scope Analyzer" : "Some items need attention before continuing"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "Files uploaded", value: `${files.length}`, ok: files.length > 0 },
                  { label: "Classified", value: `${classifiedCount}`, ok: classifiedCount === files.length },
                  { label: "Needs review", value: `${needsReviewCount}`, ok: needsReviewCount === 0 },
                  { label: "Primary source", value: primarySelected ? "Selected" : "Not set", ok: primarySelected },
                  { label: "Cost code system", value: activeCostCode === "16div" ? "16-Division" : "Custom", ok: true },
                  { label: "Workflow goal", value: workflowGoals.find(g => g.id === workflowGoal)?.label || "", ok: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 bg-muted/20 rounded-xl px-3 py-2.5">
                    {item.ok ? (
                      <Check size={12} className="text-primary shrink-0" />
                    ) : (
                      <AlertCircle size={12} className="text-warning shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                      <p className="text-xs font-medium text-foreground truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* === CTA === */}
            <Button onClick={handleSubmit} disabled={files.length === 0} size="lg" className="w-full rounded-2xl">
              Continue to Scope Analyzer <ArrowRight size={14} className="ml-2" />
            </Button>
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
          { label: "Preparing extracted quantities" },
          { label: "Organizing your project for scope analysis" },
        ]}
        targetPath="/app/scope-analyzer"
        onComplete={() => setTransition(false)}
      />
    </AppLayout>
  );
}
