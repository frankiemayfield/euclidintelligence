import { AppLayout } from "@/components/app/AppLayout";
import { Upload, FileText, BarChart3, ArrowRight, FileSearch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";

const sourceTypes = [
  "Plans / Drawings", "Scope Documents", "Schedules", "Takeoff Imports",
  "Estimates", "Proposals", "Subcontractor Bids", "Vendor Quotes", "Other Project Files",
];

interface DetectedFile {
  name: string;
  type: string;
}

export default function NewProjectPage() {
  const [files, setFiles] = useState<DetectedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const newFiles = Array.from(e.dataTransfer.files).map(f => ({
      name: f.name,
      type: detectType(f.name),
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map(f => ({
      name: f.name,
      type: detectType(f.name),
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const detectType = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("plan") || n.includes("drawing") || n.includes(".dwg")) return "Plans / Drawings";
    if (n.includes("schedule")) return "Schedules";
    if (n.includes("scope")) return "Scope Documents";
    if (n.includes("takeoff")) return "Takeoff Imports";
    if (n.includes("estimate")) return "Estimates";
    if (n.includes("proposal")) return "Proposals";
    if (n.includes("bid") || n.includes("quote")) return "Subcontractor Bids";
    if (n.includes("vendor")) return "Vendor Quotes";
    return "Other Project Files";
  };

  const typeCounts = files.reduce<Record<string, number>>((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {});

  const hasEstimateOrProposal = files.some(f => f.type === "Estimates" || f.type === "Proposals");

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">New Project</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
            Upload plans, estimates, proposals, and project files to start in the right workflow.
            Bedrock will organize your files and route you where you need to go.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors mb-6 ${
            dragOver ? "border-primary bg-primary/5" : "border-border bg-card"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Upload size={24} className="text-primary" />
          </div>
          <p className="font-display font-semibold text-foreground mb-1">
            Drag & drop your project files here
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Plans, scope docs, estimates, proposals, subcontractor bids, and more
          </p>
          <label>
            <input type="file" multiple className="hidden" onChange={handleFileSelect} />
            <Button variant="outline" size="sm" className="cursor-pointer" asChild>
              <span>Browse Files</span>
            </Button>
          </label>
          <div className="flex flex-wrap justify-center gap-1.5 mt-5">
            {sourceTypes.map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* File Detection Summary */}
        {files.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-card mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-primary" />
              <h2 className="font-display font-semibold text-foreground text-sm">Detected Files</h2>
              <span className="text-xs text-muted-foreground ml-auto">{files.length} file{files.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeCounts).map(([type, count]) => (
                <span key={type} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {count} {type.toLowerCase()} detected
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Two Path Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/app/upload" className="block">
            <div className="bg-card border border-border rounded-xl p-6 shadow-card hover:border-primary/40 hover:shadow-md transition-all h-full flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <FileText size={20} className="text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">Build Your Estimate</h3>
              <p className="text-xs text-muted-foreground mb-4 flex-1">
                Upload plans and project files to start the full estimating workflow
              </p>
              <div className="flex items-center text-primary text-xs font-medium">
                Continue to Document Upload <ArrowRight size={12} className="ml-1.5" />
              </div>
            </div>
          </Link>

          <Link to="/app/proposal-comparison" className="block">
            <div className={`bg-card border rounded-xl p-6 shadow-card hover:border-primary/40 hover:shadow-md transition-all h-full flex flex-col ${
              hasEstimateOrProposal ? "border-primary/30 ring-1 ring-primary/10" : "border-border"
            }`}>
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 size={20} className="text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">Compare Your Proposal</h3>
              <p className="text-xs text-muted-foreground mb-4 flex-1">
                Upload an existing estimate or proposal to compare it against similar jobs
              </p>
              <div className="flex items-center text-primary text-xs font-medium">
                Continue to Proposal Comparison <ArrowRight size={12} className="ml-1.5" />
              </div>
              {hasEstimateOrProposal && (
                <span className="text-[10px] text-primary mt-2 font-medium">✦ Estimate or proposal detected — recommended</span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
