import { AppLayout } from "@/components/app/AppLayout";
import { AlertTriangle, CheckCircle, FileSearch, Info, XCircle } from "lucide-react";

const categories = [
  {
    title: "Missing Scope Items",
    icon: XCircle,
    severity: "high",
    items: [
      "Electrical rough-in not included for addition area",
      "No waterproofing specified for below-grade foundation",
      "Missing temporary power/utilities during construction",
    ],
  },
  {
    title: "Inconsistent Assumptions",
    icon: AlertTriangle,
    severity: "medium",
    items: [
      "HVAC ductwork bundled into equipment allowance — should be separate",
      "Drywall quantity (3,200 SF) doesn't match framing area (2,800 SF)",
      "Finish hardware allowance at builder grade vs premium spec level selected",
    ],
  },
  {
    title: "Likely Exclusions Needed",
    icon: Info,
    severity: "low",
    items: [
      "Furniture, fixtures & equipment (FF&E)",
      "Landscaping restoration after construction",
      "Permit fees and impact fees",
      "Architectural and engineering fees",
    ],
  },
  {
    title: "Trade Overlap Detected",
    icon: FileSearch,
    severity: "medium",
    items: [
      "Demolition scope appears in both General Conditions and Earthwork",
      "Paint prep labor overlaps with drywall finish scope",
    ],
  },
];

export default function ScopeAnalyzerPage() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">Plan & Scope Analyzer</h1>
          <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Document intelligence review</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Issues Found", value: "12", color: "text-warning" },
            { label: "High Priority", value: "3", color: "text-destructive" },
            { label: "Trades Reviewed", value: "10", color: "text-primary" },
            { label: "Documents Scanned", value: "4", color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5 shadow-card text-center">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.title} className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <cat.icon size={16} className={
                  cat.severity === "high" ? "text-destructive" :
                  cat.severity === "medium" ? "text-warning" :
                  "text-info"
                } />
                <h2 className="font-display font-semibold text-foreground">{cat.title}</h2>
                <span className="ml-auto text-xs text-muted-foreground">{cat.items.length} items</span>
              </div>
              <div className="p-4 space-y-2">
                {cat.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <CheckCircle size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
