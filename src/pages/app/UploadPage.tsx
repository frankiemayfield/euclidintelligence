import { AppLayout } from "@/components/app/AppLayout";
import { Upload, FileText, X, CheckCircle, ArrowRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const projectTypes = ["Remodel", "Custom Home", "Addition", "White Box", "Tenant Finish", "Commercial Rehab"];
const specLevels = ["Builder Grade", "Mid-Tier", "Premium", "Luxury"];
const regions = ["Northeast", "Southeast", "Midwest", "Southwest", "West Coast", "Pacific NW"];

type SourceType = "plans" | "schedules" | "scope" | "takeoff" | "estimates" | "proposals" | "subbids" | "vendorquotes" | "other";

interface UploadedFile {
  name: string;
  sourceType: SourceType;
  status: "Classified" | "Needs Review";
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
  const navigate = useNavigate();

  const addFiles = () => {
    const newFiles: UploadedFile[] = [
      { name: `Document_${files.length + 1}.pdf`, sourceType: "scope", status: "Needs Review" },
    ];
    setFiles([...files, ...newFiles]);
  };

  const handleSubmit = () => {
    setProcessing(true);
    setTimeout(() => navigate("/app/scope-analyzer"), 2500);
  };

  const handleGoToComparison = () => {
    navigate("/app/proposal-comparison");
  };

  const updateSourceType = (index: number, newType: SourceType) => {
    setFiles(files.map((f, i) => i === index ? { ...f, sourceType: newType, status: "Classified" } : f));
  };

  const categories: SourceType[] = ["plans", "schedules", "scope", "takeoff", "estimates", "proposals", "subbids", "vendorquotes", "other"];
  const allCategories = ["all", ...categories] as const;
  const filteredFiles = activeCategory === "all" ? files : files.filter(f => f.sourceType === activeCategory);
  const filesByCategory = (cat: string) => files.filter(f => f.sourceType === cat).length;

  const hasEstimatesOrProposals = files.some(f => f.sourceType === "estimates" || f.sourceType === "proposals");
  const hasSubBids = files.some(f => f.sourceType === "subbids");
  const hasPlansOrScope = files.some(f => f.sourceType === "plans" || f.sourceType === "scope");

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Document Upload</h1>
        <p className="text-sm text-muted-foreground mb-6">Upload project files, estimates, and subcontractor bids. Bedrock will organize your files by source type.</p>

        {processing ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center shadow-card">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-5" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">Analyzing your project...</h3>
            <p className="text-sm text-muted-foreground">Processing documents, extracting quantities, building traceable takeoff...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* === UNIFIED UPLOAD AREA (TOP) === */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <div
                className="border-2 border-dashed border-primary/30 rounded-xl p-10 text-center cursor-pointer hover:border-primary/60 transition-colors mb-5"
                onClick={addFiles}
              >
                <Upload className="mx-auto mb-3 text-primary" size={32} />
                <p className="font-display font-semibold text-foreground text-base mb-1">Drop files here or click to upload</p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Plans · Schedules · Scope docs · Takeoff sheets · Estimates · Proposals · Subcontractor bids · Vendor quotes
                </p>
                <p className="text-[10px] text-muted-foreground mt-2">Use Bedrock to build an estimate or compare an existing proposal against the market</p>
              </div>
            </div>

            {/* === FILE CLASSIFICATION BREAKDOWN === */}
            {files.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5 shadow-card">
                <h2 className="font-display text-sm font-semibold text-foreground mb-3">File Classification</h2>
                <p className="text-xs text-muted-foreground mb-4">Bedrock automatically classifies your uploads. Reassign source types if needed.</p>

                {/* Category summary chips */}
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

                {/* File list */}
                <div className="space-y-1.5">
                  {filteredFiles.map((f, i) => {
                    const realIndex = files.indexOf(f);
                    return (
                      <div key={i} className="flex items-center gap-3 bg-muted/20 rounded-lg px-3 py-2.5">
                        <span className="text-sm">{sourceTypeIcons[f.sourceType]}</span>
                        <span className="text-sm text-foreground flex-1">{f.name}</span>
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

                {/* Source type summary cards */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-4">
                  {categories.filter(cat => filesByCategory(cat) > 0).map(cat => (
                    <div key={cat} className="bg-muted/20 rounded-lg p-2.5 text-center">
                      <p className="text-lg">{sourceTypeIcons[cat]}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{sourceTypeLabels[cat]}</p>
                      <p className="text-xs font-display font-bold text-foreground">{filesByCategory(cat)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* === ADAPTIVE NEXT STEPS === */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <h2 className="font-display text-sm font-semibold text-foreground mb-3">Recommended Next Steps</h2>
              <div className="space-y-2">
                {hasPlansOrScope && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <CheckCircle size={14} className="text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">Plans & scope documents detected</p>
                      <p className="text-[10px] text-muted-foreground">Continue to Scope Analyzer to review quantities and scope issues</p>
                    </div>
                    <Button size="sm" className="text-xs shrink-0" onClick={handleSubmit}>
                      Continue to Scope Analyzer <ArrowRight size={12} className="ml-1" />
                    </Button>
                  </div>
                )}
                {hasSubBids && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                    <CheckCircle size={14} className="text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{filesByCategory("subbids")} subcontractor bids uploaded</p>
                      <p className="text-[10px] text-muted-foreground">These will be available in Bid Leveling for side-by-side comparison</p>
                    </div>
                  </div>
                )}
                {hasEstimatesOrProposals && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-accent/20">
                    <BarChart3 size={14} className="text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">Estimate or proposal detected</p>
                      <p className="text-[10px] text-muted-foreground">Compare it against 20,000+ similar proposals in the Bedrock dataset</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs shrink-0" onClick={handleGoToComparison}>
                      Open Proposal Comparison <ArrowRight size={12} className="ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* === PROJECT SETUP (BELOW UPLOAD) === */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <h2 className="font-display text-sm font-semibold text-foreground mb-4">Project Setup</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Project Name</label>
                  <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue="Maple St. Kitchen Remodel" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Client / Owner</label>
                  <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Johnson Family" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Project Type</label>
                  <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                    {projectTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Region</label>
                  <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                    {regions.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Spec Level</label>
                  <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                    {specLevels.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Square Footage</label>
                  <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. 2,800" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Notes</label>
                  <input className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Optional project notes..." />
                </div>
              </div>
            </div>

            {/* Workflow hint */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-card">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ArrowRight size={10} className="text-primary" />
                <span>Flow: <span className="text-foreground font-medium">Document Upload</span> → Scope Analyzer → Bid Leveling → Estimate Builder → Pricing & Margin → Proposal Comparison → Proposal Export → Est. vs Actual</span>
              </p>
            </div>

            {!hasPlansOrScope && (
              <Button onClick={handleSubmit} disabled={files.length === 0} size="lg" className="w-full">
                Continue to Scope Analyzer
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
