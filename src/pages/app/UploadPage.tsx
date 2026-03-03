import { AppLayout } from "@/components/app/AppLayout";
import { Upload, FileText, X, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const projectTypes = ["Remodel", "Custom Home", "Addition", "White Box", "Tenant Finish", "Commercial Rehab"];
const specLevels = ["Builder Grade", "Mid-Tier", "Premium", "Luxury"];
const regions = ["Northeast", "Southeast", "Midwest", "Southwest", "West Coast", "Pacific NW"];

const docTypes = [
  { label: "Architectural Drawings", detected: true },
  { label: "Schedules", detected: true },
  { label: "Scope Notes", detected: false },
  { label: "Bid Sheets", detected: false },
  { label: "Takeoff Imports", detected: false },
];

const workflowSteps = [
  { step: "1", title: "Plans are analyzed", desc: "Documents are parsed, classified, and indexed for extraction" },
  { step: "2", title: "Quantities are extracted into a plan-derived takeoff", desc: "Measurements, counts, and materials are identified with source references" },
  { step: "3", title: "Estimate line items are built with assumptions attached", desc: "Every number traces back to a plan reference, formula, or stated assumption" },
];

export default function UploadPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const addFile = () => {
    setFiles([...files, `Project_Document_${files.length + 1}.pdf`]);
  };

  const handleSubmit = () => {
    setProcessing(true);
    setTimeout(() => navigate("/app/takeoff"), 2500);
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-3xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">New Project</h1>
        <p className="text-sm text-muted-foreground mb-8">Upload your files and configure your project.</p>

        {processing ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center shadow-card">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-5" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">Analyzing your project...</h3>
            <p className="text-sm text-muted-foreground">Processing documents, extracting quantities, building traceable takeoff...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upload Zone */}
            <div
              className="bg-card border-2 border-dashed border-primary/30 rounded-xl p-10 text-center cursor-pointer hover:border-primary/60 transition-colors shadow-card"
              onClick={addFile}
            >
              <Upload className="mx-auto mb-3 text-primary" size={32} />
              <p className="font-display font-semibold text-foreground mb-1">Drop files here or click to upload</p>
              <p className="text-xs text-muted-foreground">Plans · Bid sheets · Buildertrend exports · Scope docs · Takeoff sheets</p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3">
                    <FileText size={16} className="text-primary" />
                    <span className="text-sm text-foreground flex-1">{f}</span>
                    <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Document Types Detected */}
            {files.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4 shadow-card">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3">Document Types Detected</h3>
                <div className="flex flex-wrap gap-2">
                  {docTypes.map((d) => (
                    <span
                      key={d.label}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        d.detected && files.length > 1
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {d.detected && files.length > 1 && <CheckCircle size={10} className="inline mr-1" />}
                      {d.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Project Config */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Project Name</label>
                <input className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. Maple St Kitchen Remodel" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Project Type</label>
                <select className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                  {projectTypes.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Region</label>
                <select className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                  {regions.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Spec Level</label>
                <select className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                  {specLevels.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Square Footage</label>
                <input className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. 2,800" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1.5 block">Notes</label>
                <input className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Optional project notes..." />
              </div>
            </div>

            {/* Workflow Preview */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <h3 className="font-display text-sm font-semibold text-foreground mb-4">What happens after upload</h3>
              <div className="space-y-3">
                {workflowSteps.map((s, i) => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">{s.step}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <ArrowRight size={10} /> Flow: New Project → Plan-Derived Takeoff → Bid Score / Estimate Builder
              </p>
            </div>

            <Button onClick={handleSubmit} disabled={files.length === 0} size="lg" className="w-full">
              Analyze Project
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
