import { HomeownerLayout } from "@/components/homeowner/HomeownerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { documents } from "@/data/homeownerData";
import { useState } from "react";
import { FileText, FolderOpen } from "lucide-react";

const docTypes = ["All", "Proposal", "Contract", "Invoice", "Change Order", "Plans", "Selections", "Receipt", "Notes"];

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    "Proposal": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Contract": "bg-primary/10 text-primary border-primary/20",
    "Invoice": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "Change Order": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    "Plans": "bg-purple-500/10 text-purple-600 border-purple-500/20",
    "Selections": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "Receipt": "bg-gray-500/10 text-gray-600 border-gray-500/20",
    "Notes": "bg-gray-500/10 text-gray-600 border-gray-500/20",
  };
  return <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${styles[type] || ""}`}>{type}</Badge>;
}

export default function HomeownerDocumentsPage() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? documents : documents.filter(d => d.type === filter);

  return (
    <HomeownerLayout>
      <div className="p-6 space-y-6 max-w-[1400px]">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">Project document library organized by type</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {docTypes.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === t ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Document</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Upload Date</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Contractor / Category</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Extracted Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="border-b border-border hover:bg-muted/10 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground">{doc.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center"><TypeBadge type={doc.type} /></td>
                      <td className="p-3 text-muted-foreground">{doc.uploadDate}</td>
                      <td className="p-3 text-muted-foreground">{doc.contractor || doc.category || "—"}</td>
                      <td className="p-3 text-xs text-muted-foreground">{doc.extractedSummary || "—"}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        <FolderOpen size={24} className="mx-auto mb-2 opacity-50" />
                        No documents in this category
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </HomeownerLayout>
  );
}
