import { SubLayout } from "@/components/sub/SubLayout";
import { Upload, X, CheckCircle, ArrowRight, Settings2, Layers, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowTransition } from "@/components/app/WorkflowTransition";
import { useState } from "react";

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

  const addFiles = () => {
    setFiles([...files, { name: `Document_${files.length + 1}.pdf`, sourceType: "other", status: "Needs Review" }]);
  };

  const categories: SourceType[] = ["plans", "structural", "scope", "addenda", "schedules", "rfis", "other"];

  return (
    <SubLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Document Upload</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">Upload GC scope packages, plans, and project files to begin your framing quote.</p>
        </div>

        {!transition ? (
          <div className="space-y-8">
            {/* Upload Area */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <div className="border-2 border-dashed border-primary/30 rounded-xl p-10 text-center cursor-pointer hover:border-primary/60 transition-colors" onClick={addFiles}>
                <Upload className="mx-auto mb-3 text-primary" size={32} />
                <p className="font-display font-semibold text-foreground text-base mb-1">Drop files here or click to upload</p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Plans · Structural drawings · GC scope packages · Addenda · Schedules · RFI responses
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
                  <input className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue="Maple St. Kitchen Remodel" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">GC / Builder</label>
                  <input className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue="Mayfield & Co." />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Trade</label>
                  <input className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue="Framing" readOnly />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Bid Due Date</label>
                  <input type="date" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue="2026-03-12" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Region</label>
                  <select className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue="Midwest">
                    {regions.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Spec Level</label>
                  <select className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                    {specLevels.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Notes</label>
                  <input className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Scope notes, special conditions..." />
                </div>
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
