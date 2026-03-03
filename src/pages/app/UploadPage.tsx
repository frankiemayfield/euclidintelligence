import { AppLayout } from "@/components/app/AppLayout";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const projectTypes = ["Remodel", "Custom Home", "Addition", "White Box", "Tenant Finish", "Commercial Rehab"];
const specLevels = ["Builder Grade", "Mid-Tier", "Premium", "Luxury"];
const regions = ["Northeast", "Southeast", "Midwest", "Southwest", "West Coast", "Pacific NW"];

export default function UploadPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const addFile = () => {
    setFiles([...files, `Project_Document_${files.length + 1}.pdf`]);
  };

  const handleSubmit = () => {
    setProcessing(true);
    setTimeout(() => navigate("/app/bid-score"), 2500);
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
            <p className="text-sm text-muted-foreground">Processing documents, extracting scope, normalizing costs...</p>
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

            <Button onClick={handleSubmit} disabled={files.length === 0} size="lg" className="w-full">
              Analyze Project
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
