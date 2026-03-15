import { OwnerLayout } from "@/components/homeowner/OwnerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2 } from "lucide-react";

const uploadedFiles = [
  { name: "Alder Ridge Builders — Proposal Rev 2.pdf", type: "Proposal", contractor: "Alder Ridge Builders", status: "Extracted", date: "2025-11-14" },
  { name: "Summit Oak Construction — Proposal.pdf", type: "Proposal", contractor: "Summit Oak Construction", status: "Extracted", date: "2025-11-18" },
  { name: "Northline Homes — Proposal.pdf", type: "Proposal", contractor: "Northline Homes", status: "Extracted", date: "2025-11-21" },
  { name: "Kitchen Expansion Floor Plan.pdf", type: "Plans", contractor: "—", status: "Classified", date: "2025-10-28" },
  { name: "Structural Engineering Report.pdf", type: "Plans", contractor: "—", status: "Classified", date: "2025-10-30" },
  { name: "Fixture Selection Worksheet.pdf", type: "Selections", contractor: "—", status: "Classified", date: "2026-01-20" },
  { name: "Cabinet Selection Sheet.pdf", type: "Selections", contractor: "—", status: "Classified", date: "2026-01-15" },
];

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    "Extracted": "bg-primary/10 text-primary border-primary/20",
    "Classified": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "Processing": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };
  return <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${s[status] || ""}`}>{status}</Badge>;
}

export default function HomeownerUploadPage() {
  return (
    <OwnerLayout>
      <div className="p-6 space-y-6 max-w-[1400px]">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Upload</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload contractor proposals and project documents for analysis</p>
        </div>

        {/* Upload Area */}
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <Upload size={32} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Drop files here or click to upload</p>
            <p className="text-xs text-muted-foreground mb-4">PDF, DOCX, XLSX — Contractor proposals, plans, specs, selections</p>
            <Button size="sm" variant="outline" className="gap-2">
              <Upload size={14} /> Choose Files
            </Button>
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">File</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Linked Contractor</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Upload Date</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Extraction Status</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedFiles.map((f, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/10 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground">{f.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className="text-[10px]">{f.type}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{f.contractor}</td>
                      <td className="p-3 text-muted-foreground">{f.date}</td>
                      <td className="p-3 text-center"><StatusBadge status={f.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Data Readiness */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Data Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Proposals Uploaded", value: "3 of 3", done: true },
                { label: "Proposals Extracted", value: "3 of 3", done: true },
                { label: "Plans Classified", value: "2 of 2", done: true },
                { label: "Selections Uploaded", value: "2 files", done: true },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 size={12} className={item.done ? "text-primary" : "text-muted-foreground"} />
                    <p className="text-[11px] text-muted-foreground">{item.label}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </OwnerLayout>
  );
}
