import { SubLayout } from "@/components/sub/SubLayout";
import { AlertTriangle, CheckCircle, XCircle, Info, ChevronDown, ArrowRight, Check, Clock, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WorkflowTransition } from "@/components/app/WorkflowTransition";
import { useState } from "react";

// Framing-specific takeoff data
const takeoffData = [
  { id: 1, description: "2x4 wall framing — exterior", qty: 1420, unit: "LF", sheet: "A1.1", confidence: "High", status: "Confirmed", planRef: "Sheet A1.1 — Floor Plan" },
  { id: 2, description: "2x6 wall framing — bearing", qty: 380, unit: "LF", sheet: "S1.1", confidence: "High", status: "Confirmed", planRef: "Sheet S1.1 — Structural" },
  { id: 3, description: "LVL headers — assorted sizes", qty: 18, unit: "EA", sheet: "S1.1", confidence: "Medium", status: "Needs Review", planRef: "Sheet S1.1 — Structural Details" },
  { id: 4, description: "Roof trusses", qty: 22, unit: "EA", sheet: "A4.1", confidence: "High", status: "Confirmed", planRef: "Sheet A4.1 — Framing Plan" },
  { id: 5, description: "Floor joists (I-joists)", qty: 1100, unit: "LF", sheet: "S1.1", confidence: "Medium", status: "Needs Review", planRef: "Sheet S1.1 — Structural" },
  { id: 6, description: "Wall sheathing", qty: 2800, unit: "SF", sheet: "A1.1", confidence: "High", status: "Confirmed", planRef: "Sheet A1.1 — Floor Plan" },
  { id: 7, description: "Roof sheathing", qty: 1900, unit: "SF", sheet: "A4.1", confidence: "High", status: "Confirmed", planRef: "Sheet A4.1 — Roof Plan" },
  { id: 8, description: "Blocking/nailers", qty: 1, unit: "LS", sheet: "—", confidence: "Low", status: "Needs Review", planRef: "Inferred from project type" },
  { id: 9, description: "Hangers/fasteners", qty: 1, unit: "LS", sheet: "S1.1", confidence: "Medium", status: "Auto-Extracted", planRef: "Sheet S1.1 — Hardware Schedule" },
];

const assumptions = [
  { id: 1, text: "Wall height assumed 10 ft from section detail A-A", status: "confirmed" as const, source: "Section A-A" },
  { id: 2, text: "2x6 bearing walls per structural plan — all interior load-bearing partitions", status: "confirmed" as const, source: "S1.1" },
  { id: 3, text: "Roof trusses assumed pre-engineered — verify with truss shop drawings", status: "needs-review" as const, source: "A4.1" },
  { id: 4, text: "I-joist spacing assumed 16\" OC per typical residential", status: "confirmed" as const, source: "S1.1" },
  { id: 5, text: "Sheathing assumed 7/16\" OSB per spec — verify grade", status: "needs-review" as const, source: "Spec Section 06 16 00" },
  { id: 6, text: "Blocking includes cabinet backing, TV mount backing, and handrail blocking", status: "adjust" as const, source: "Inferred" },
  { id: 7, text: "Engineered lumber (LVL) supply by GC — labor only by sub", status: "confirmed" as const, source: "GC Scope Package" },
  { id: 8, text: "Temporary shoring not included — verify if required during demo phase", status: "needs-review" as const, source: "Not specified" },
];

const scopeIssues = [
  { message: "Unclear bearing wall transition at kitchen-to-addition boundary", trade: "Framing", sheet: "S1.1", severity: "high", recommendation: "Request structural clarification on load path at transition point" },
  { message: "Missing temporary shoring callout during demolition phase", trade: "Framing", sheet: "—", severity: "medium", recommendation: "Confirm with GC if temporary shoring is GC-provided or sub responsibility" },
  { message: "Stair opening framing not dimensioned on structural plans", trade: "Framing", sheet: "S1.1", severity: "high", recommendation: "Request dimensioned stair opening detail from structural engineer" },
  { message: "Opening header sizes conflict between framing detail and schedule", trade: "Framing", sheet: "S1.1 / A5.1", severity: "medium", recommendation: "Clarify which header sizes govern — detail or schedule" },
];

const scopeStructure = [
  { category: "Exterior Wall Framing", items: ["2x4 studs @ 16\" OC", "Double top plate", "Bottom plate (PT at slab)", "Corner assemblies", "Window/door bucks"], status: "Complete" },
  { category: "Interior Bearing Walls", items: ["2x6 studs @ 16\" OC", "Double top plate", "Point loads per structural", "Header support posts"], status: "Complete" },
  { category: "Floor System", items: ["I-joists @ 16\" OC", "Rim board", "Blocking at bearing points", "Subfloor (by others)"], status: "Partial" },
  { category: "Roof System", items: ["Pre-engineered trusses", "Truss bracing", "Fascia framing", "Soffit framing"], status: "Complete" },
  { category: "Sheathing", items: ["Wall sheathing — 7/16\" OSB", "Roof sheathing — 7/16\" OSB", "Clips at unsupported edges"], status: "Complete" },
  { category: "Miscellaneous", items: ["Blocking for cabinets/TV/handrails", "Hardware — hangers, straps, clips", "LVL headers (labor only)"], status: "Partial" },
];

export default function SubScopeAnalyzerPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [transition, setTransition] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);
  const [assumptionStates, setAssumptionStates] = useState<Record<number, string>>(
    Object.fromEntries(assumptions.map(a => [a.id, a.status]))
  );

  const updateAssumption = (id: number, status: string) => {
    setAssumptionStates(prev => ({ ...prev, [id]: status }));
  };

  return (
    <SubLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Scope Analyzer</h1>
            <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Framing scope review & quantity takeoff</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSkipTransition(true)}>
              Skip to Build Estimate
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setTransition(true)}>
              Continue to Bid Leveling <ArrowRight size={14} />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scope-structure">Scope Structure</TabsTrigger>
            <TabsTrigger value="quantity-takeoff">Quantity Takeoff</TabsTrigger>
            <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
            <TabsTrigger value="scope-issues">Scope Issues</TabsTrigger>
            <TabsTrigger value="sub-bid-packages">Sub Bid Packages</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Takeoff Items", value: takeoffData.length, color: "text-foreground" },
                { label: "Confirmed", value: takeoffData.filter(t => t.status === "Confirmed").length, color: "text-primary" },
                { label: "Needs Review", value: takeoffData.filter(t => t.status === "Needs Review").length, color: "text-warning" },
                { label: "Scope Issues", value: scopeIssues.length, color: "text-destructive" },
              ].map(c => (
                <div key={c.label} className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
                  <p className={`font-display text-xl font-bold ${c.color}`}>{c.value}</p>
                  <p className="text-[10px] text-muted-foreground">{c.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <h2 className="font-display font-semibold text-foreground mb-3">Scope Summary</h2>
              <p className="text-sm text-muted-foreground">
                Framing scope for Maple St. Kitchen Remodel covers exterior wall framing (2x4), interior bearing walls (2x6),
                floor system (I-joists), pre-engineered roof trusses, wall and roof sheathing, miscellaneous blocking, and hardware.
                Engineered lumber is GC-supplied (labor only). 4 scope issues require attention before quoting.
              </p>
            </div>
          </TabsContent>

          {/* Scope Structure */}
          <TabsContent value="scope-structure">
            <div className="space-y-4">
              {scopeStructure.map((cat) => (
                <div key={cat.category} className="bg-card border border-border rounded-xl p-5 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold text-foreground text-sm">{cat.category}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cat.status === "Complete" ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"}`}>{cat.status}</span>
                  </div>
                  <ul className="space-y-1">
                    {cat.items.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle size={12} className="text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Quantity Takeoff */}
          <TabsContent value="quantity-takeoff">
            <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["#", "Description", "Qty", "Unit", "Sheet", "Confidence", "Status", "Plan Reference"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {takeoffData.map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 text-xs text-muted-foreground">{t.id}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{t.description}</td>
                      <td className="px-4 py-3 font-display font-semibold text-foreground">{t.qty.toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.unit}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{t.sheet}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          t.confidence === "High" ? "bg-primary/10 text-primary" : t.confidence === "Medium" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                        }`}>{t.confidence}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          t.status === "Confirmed" ? "bg-primary/10 text-primary" : t.status === "Needs Review" ? "bg-warning/10 text-warning" : "bg-info/10 text-info"
                        }`}>{t.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{t.planRef}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Assumptions */}
          <TabsContent value="assumptions">
            <div className="space-y-2">
              {assumptions.map((a) => {
                const state = assumptionStates[a.id] || a.status;
                return (
                  <div key={a.id} className="bg-card border border-border rounded-xl p-4 shadow-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{a.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Source: {a.source}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        {["confirmed", "adjust", "needs-review", "defer"].map(s => (
                          <button key={s} onClick={() => updateAssumption(a.id, s)}
                            className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors ${
                              state === s
                                ? s === "confirmed" ? "bg-primary/10 text-primary" : s === "adjust" ? "bg-info/10 text-info" : s === "needs-review" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                                : "bg-muted/50 text-muted-foreground hover:text-foreground"
                            }`}>
                            {s === "confirmed" ? "Confirm" : s === "adjust" ? "Adjust" : s === "needs-review" ? "Needs Review" : "Defer"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Scope Issues */}
          <TabsContent value="scope-issues">
            <div className="space-y-3">
              {scopeIssues.map((issue, i) => (
                <div key={i} className={`bg-card border rounded-xl p-4 shadow-card ${issue.severity === "high" ? "border-destructive/30" : "border-warning/30"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${issue.severity === "high" ? "bg-destructive/10" : "bg-warning/10"}`}>
                      {issue.severity === "high" ? <XCircle size={14} className="text-destructive" /> : <AlertTriangle size={14} className="text-warning" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{issue.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">Sheet: {issue.sheet}</p>
                      <p className="text-xs text-muted-foreground mt-1">Recommendation: {issue.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Sub Bid Packages */}
          <TabsContent value="sub-bid-packages">
            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <p className="text-sm text-muted-foreground">
                As a subcontractor, this tab shows the GC's scope package that was sent to you. Review the scope items, confirm quantities, and note any exclusions or clarifications before building your quote.
              </p>
              <div className="mt-4 bg-muted/20 rounded-lg p-4">
                <h3 className="font-display font-semibold text-foreground text-sm mb-2">GC Scope Package — Framing</h3>
                <p className="text-xs text-muted-foreground mb-3">From: Mayfield & Co. | Received: Mar 1, 2026</p>
                <ul className="space-y-1 text-sm text-foreground">
                  <li>• All framing per plans A1.1, A4.1, S1.1</li>
                  <li>• Sheathing — walls and roof</li>
                  <li>• Hardware — hangers, clips, straps per structural</li>
                  <li>• Blocking — cabinet, TV, handrail per finish schedule</li>
                  <li>• Engineered lumber install (material by GC)</li>
                  <li>• Temporary bracing during construction</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <WorkflowTransition
        active={transition}
        headline="Compiling scope for bid review"
        steps={[
          { label: "Organizing scope items" },
          { label: "Checking GC package coverage" },
          { label: "Preparing comparison workspace" },
        ]}
        targetPath="/sub/bid-leveling"
        onComplete={() => setTransition(false)}
      />

      <WorkflowTransition
        active={skipTransition}
        headline="Building your estimate"
        steps={[
          { label: "Refining scope" },
          { label: "Applying scope packages" },
          { label: "Organizing allowances" },
          { label: "Preparing estimate structure" },
        ]}
        targetPath="/sub/estimate-builder"
        onComplete={() => setSkipTransition(false)}
      />
    </SubLayout>
  );
}
