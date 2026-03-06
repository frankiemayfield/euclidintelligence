import { SubLayout } from "@/components/sub/SubLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Pencil, Check, Trash2, ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LineItem {
  code: string; description: string; qty: number; unit: string; unitCost: number; total: number;
  category: string;
}

const lineItems: LineItem[] = [
  { code: "06-100", description: "Rough framing labor — exterior walls", qty: 1420, unit: "LF", unitCost: 3.20, total: 4544, category: "base" },
  { code: "06-100", description: "Rough framing labor — bearing walls", qty: 380, unit: "LF", unitCost: 3.80, total: 1444, category: "base" },
  { code: "06-110", description: "Lumber/material package — studs, plates, headers", qty: 1, unit: "LS", unitCost: 6800, total: 6800, category: "base" },
  { code: "06-120", description: "Truss package — pre-engineered roof trusses", qty: 22, unit: "EA", unitCost: 185, total: 4070, category: "base" },
  { code: "06-130", description: "Sheathing material — wall (7/16\" OSB)", qty: 2800, unit: "SF", unitCost: 0.65, total: 1820, category: "base" },
  { code: "06-130", description: "Sheathing material — roof (7/16\" OSB)", qty: 1900, unit: "SF", unitCost: 0.65, total: 1235, category: "base" },
  { code: "06-140", description: "Hardware — hangers, clips, straps", qty: 1, unit: "LS", unitCost: 1200, total: 1200, category: "base" },
  { code: "06-150", description: "Headers/LVL package — install labor only", qty: 18, unit: "EA", unitCost: 45, total: 810, category: "base" },
  { code: "06-160", description: "Blocking/nailers — cabinet, TV, handrail", qty: 1, unit: "LS", unitCost: 680, total: 680, category: "base" },
  { code: "06-170", description: "Temporary shoring during demo phase", qty: 1, unit: "LS", unitCost: 1200, total: 1200, category: "base" },
  { code: "01-100", description: "Mobilization & setup", qty: 1, unit: "LS", unitCost: 800, total: 800, category: "general" },
  { code: "01-200", description: "Cleanup & debris removal", qty: 1, unit: "LS", unitCost: 450, total: 450, category: "general" },
  { code: "01-300", description: "Temp protection — floors & finishes", qty: 1, unit: "LS", unitCost: 350, total: 350, category: "general" },
  { code: "01-400", description: "Coordination meetings (allowance)", qty: 4, unit: "EA", unitCost: 150, total: 600, category: "prebuild" },
  { code: "01-500", description: "Shop drawings review (allowance)", qty: 1, unit: "LS", unitCost: 400, total: 400, category: "prebuild" },
];

const fmt = (n: number) => `$${n.toLocaleString()}`;

export default function SubEstimateBuilderPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("base");
  const [editingRow, setEditingRow] = useState<string | null>(null);

  const baseItems = lineItems.filter(l => l.category === "base");
  const generalItems = lineItems.filter(l => l.category === "general");
  const prebuildItems = lineItems.filter(l => l.category === "prebuild");

  const baseTotal = baseItems.reduce((s, l) => s + l.total, 0);
  const generalTotal = generalItems.reduce((s, l) => s + l.total, 0);
  const prebuildTotal = prebuildItems.reduce((s, l) => s + l.total, 0);
  const grandTotal = baseTotal + generalTotal + prebuildTotal;

  const renderTable = (items: LineItem[]) => (
    <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {["Code", "Description", "Qty", "Unit", "Unit Cost", "Total", ""].map(h => (
              <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((l, i) => (
            <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20">
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.code}</td>
              <td className="px-4 py-3 text-foreground">{l.description}</td>
              <td className="px-4 py-3 font-display font-semibold text-foreground">{l.qty.toLocaleString()}</td>
              <td className="px-4 py-3 text-muted-foreground">{l.unit}</td>
              <td className="px-4 py-3 text-muted-foreground">{fmt(l.unitCost)}</td>
              <td className="px-4 py-3 font-display font-semibold text-foreground">{fmt(l.total)}</td>
              <td className="px-4 py-3">
                <button className="text-muted-foreground hover:text-foreground"><Pencil size={12} /></button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-muted/30">
            <td colSpan={5} className="px-4 py-3 text-sm font-medium text-foreground">Subtotal</td>
            <td className="px-4 py-3 font-display font-bold text-foreground">{fmt(items.reduce((s, l) => s + l.total, 0))}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <SubLayout>
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Estimate Builder</h1>
            <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — Framing quote builder</p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => navigate("/sub/pricing")}>
            Continue to Pricing <ArrowRight size={14} />
          </Button>
        </div>

        {/* Rollup */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Base Scope", value: fmt(baseTotal) },
            { label: "General Requirements", value: fmt(generalTotal) },
            { label: "Pre-Build", value: fmt(prebuildTotal) },
            { label: "Total Estimate", value: fmt(grandTotal) },
          ].map(c => (
            <div key={c.label} className="bg-card border border-border rounded-xl p-4 shadow-card text-center">
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
              <p className="font-display text-xl font-bold text-foreground mt-0.5">{c.value}</p>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="prebuild">Pre-Build Requirements</TabsTrigger>
            <TabsTrigger value="base">Base Scope</TabsTrigger>
            <TabsTrigger value="general">General Requirements</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>

          <TabsContent value="prebuild">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Pre-Build Requirements</h2>
                <p className="text-xs text-muted-foreground">Coordination, shop drawings, and preconstruction items</p>
              </div>
              <Button size="sm" className="text-xs"><Plus size={13} className="mr-1.5" />Add Line</Button>
            </div>
            {renderTable(prebuildItems)}
          </TabsContent>

          <TabsContent value="base">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Base Scope</h2>
                <p className="text-xs text-muted-foreground">Core framing line items — labor, materials, and installation</p>
              </div>
              <Button size="sm" className="text-xs"><Plus size={13} className="mr-1.5" />Add Line</Button>
            </div>
            {renderTable(baseItems)}
          </TabsContent>

          <TabsContent value="general">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">General Requirements</h2>
                <p className="text-xs text-muted-foreground">Mobilization, cleanup, staging, and site protection</p>
              </div>
              <Button size="sm" className="text-xs"><Plus size={13} className="mr-1.5" />Add Line</Button>
            </div>
            {renderTable(generalItems)}
          </TabsContent>

          <TabsContent value="review">
            <div className="bg-card border border-border rounded-xl p-5 shadow-card">
              <h2 className="font-display font-semibold text-foreground mb-3">Estimate Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Pre-Build Requirements</span>
                  <span className="font-display font-semibold text-foreground">{fmt(prebuildTotal)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Base Scope (Framing)</span>
                  <span className="font-display font-semibold text-foreground">{fmt(baseTotal)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">General Requirements</span>
                  <span className="font-display font-semibold text-foreground">{fmt(generalTotal)}</span>
                </div>
                <div className="flex justify-between py-2 pt-3">
                  <span className="text-sm font-medium text-foreground">Total Estimated Cost</span>
                  <span className="font-display text-lg font-bold text-primary">{fmt(grandTotal)}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SubLayout>
  );
}
