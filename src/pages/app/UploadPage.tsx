import { AppLayout } from "@/components/app/AppLayout";
import { Upload, FileText, X, CheckCircle, ArrowRight, FolderOpen, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const projectTypes = ["Remodel", "Custom Home", "Addition", "White Box", "Tenant Finish", "Commercial Rehab"];
const specLevels = ["Builder Grade", "Mid-Tier", "Premium", "Luxury"];
const regions = ["Northeast", "Southeast", "Midwest", "Southwest", "West Coast", "Pacific NW"];

interface UploadedFile {
  name: string;
  category: "plans" | "schedules" | "scope" | "takeoff" | "subbids";
}

interface SubBidEntry {
  file: string;
  subcontractor: string;
  trade: string;
  status: "Uploaded" | "Reviewed" | "Ready for Leveling";
  date: string;
}

const categoryLabels: Record<string, string> = {
  plans: "Plans / Drawings",
  schedules: "Schedules",
  scope: "Scope Documents",
  takeoff: "Takeoff Imports",
  subbids: "Subcontractor Bids",
};

const categoryIcons: Record<string, string> = {
  plans: "📐",
  schedules: "📅",
  scope: "📋",
  takeoff: "📊",
  subbids: "📨",
};

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([
    { name: "A1.1_Floor_Plan.pdf", category: "plans" },
    { name: "S1.1_Structural.pdf", category: "plans" },
    { name: "Finish_Schedule.xlsx", category: "schedules" },
  ]);
  const [subBids, setSubBids] = useState<SubBidEntry[]>([
    { file: "Spark_Electric_Bid.pdf", subcontractor: "Spark Electric Co.", trade: "Electrical", status: "Ready for Leveling", date: "Feb 28" },
    { file: "BrightWire_Quote.pdf", subcontractor: "BrightWire LLC", trade: "Electrical", status: "Uploaded", date: "Feb 27" },
    { file: "AquaFlow_Plumbing_Bid.pdf", subcontractor: "AquaFlow Plumbing", trade: "Plumbing", status: "Ready for Leveling", date: "Feb 26" },
  ]);
  const [processing, setProcessing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const navigate = useNavigate();

  const addFile = (category: UploadedFile["category"]) => {
    setFiles([...files, { name: `Document_${files.length + 1}.pdf`, category }]);
  };

  const addSubBid = () => {
    setSubBids([...subBids, {
      file: `Sub_Bid_${subBids.length + 1}.pdf`,
      subcontractor: "New Subcontractor",
      trade: "General",
      status: "Uploaded",
      date: "Today"
    }]);
  };

  const handleSubmit = () => {
    setProcessing(true);
    setTimeout(() => navigate("/app/scope-analyzer"), 2500);
  };

  const categories = ["all", "plans", "schedules", "scope", "takeoff", "subbids"];
  const filteredFiles = activeCategory === "all" ? files : files.filter(f => f.category === activeCategory);
  const filesByCategory = (cat: string) => files.filter(f => f.category === cat).length;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Document Upload</h1>
        <p className="text-sm text-muted-foreground mb-8">Upload project documents, organize by category, and add subcontractor bids.</p>

        {processing ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center shadow-card">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-5" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">Analyzing your project...</h3>
            <p className="text-sm text-muted-foreground">Processing documents, extracting quantities, building traceable takeoff...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Project Setup */}
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

            {/* Document Upload Area */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <h2 className="font-display text-sm font-semibold text-foreground mb-4">Upload Project Documents</h2>
              <div
                className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/60 transition-colors mb-4"
                onClick={() => addFile("plans")}
              >
                <Upload className="mx-auto mb-2 text-primary" size={28} />
                <p className="font-display font-semibold text-foreground text-sm mb-1">Drop files here or click to upload</p>
                <p className="text-xs text-muted-foreground">Plans · Schedules · Scope docs · Takeoff sheets · Sub bids</p>
              </div>

              {/* Category tabs */}
              <div className="flex gap-1.5 flex-wrap mb-3">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      activeCategory === cat ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}>
                    {cat === "all" ? `All (${files.length})` : `${categoryLabels[cat]} (${filesByCategory(cat)})`}
                  </button>
                ))}
              </div>

              {/* File list */}
              {filteredFiles.length > 0 && (
                <div className="space-y-1.5">
                  {filteredFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-muted/20 rounded-lg px-3 py-2.5">
                      <FileText size={14} className="text-primary shrink-0" />
                      <span className="text-sm text-foreground flex-1">{f.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{categoryLabels[f.category]}</span>
                      <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subcontractor Bid Intake */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-sm font-semibold text-foreground">Subcontractor Bids</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Upload sub bids here. They'll be available in Bid Leveling.</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs" onClick={addSubBid}>
                  <Upload size={12} className="mr-1" /> Add Sub Bid
                </Button>
              </div>

              {subBids.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["File", "Subcontractor", "Trade", "Status", "Uploaded", ""].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {subBids.map((b, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-3 py-2.5 flex items-center gap-2"><FileText size={12} className="text-primary" /><span className="text-foreground">{b.file}</span></td>
                          <td className="px-3 py-2.5 text-foreground">{b.subcontractor}</td>
                          <td className="px-3 py-2.5 text-muted-foreground">{b.trade}</td>
                          <td className="px-3 py-2.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              b.status === "Ready for Leveling" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            }`}>{b.status}</span>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground">{b.date}</td>
                          <td className="px-3 py-2.5">
                            <button onClick={() => setSubBids(subBids.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X size={12} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/30 transition-colors" onClick={addSubBid}>
                  <GitCompare size={20} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No subcontractor bids uploaded yet</p>
                </div>
              )}
            </div>

            {/* Workflow hint */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-card">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ArrowRight size={10} className="text-primary" />
                <span>Flow: <span className="text-foreground font-medium">Document Upload</span> → Scope Analyzer → Bid Leveling → Estimate Builder → Pricing & Margin → Proposal Export</span>
              </p>
            </div>

            <Button onClick={handleSubmit} disabled={files.length === 0} size="lg" className="w-full">
              Continue to Scope Analyzer
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
