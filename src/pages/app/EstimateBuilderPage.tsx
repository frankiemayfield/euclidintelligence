import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Download, Filter, Search, Plus } from "lucide-react";
import { useState } from "react";

const lineItems = [
  { code: "03 30 00", trade: "Concrete", desc: "Foundation footings", qty: 1, unit: "LS", unitCost: 12400, labor: 6200, material: 6200, markup: 10, contingency: 5 },
  { code: "06 10 00", trade: "Rough Carpentry", desc: "Framing – addition", qty: 2800, unit: "SF", unitCost: 8.50, labor: 15200, material: 8600, markup: 12, contingency: 5 },
  { code: "07 21 00", trade: "Insulation", desc: "Batt insulation – walls & ceiling", qty: 2400, unit: "SF", unitCost: 2.25, labor: 2100, material: 3300, markup: 10, contingency: 3 },
  { code: "09 29 00", trade: "Drywall", desc: "Drywall – hang, tape, finish", qty: 3200, unit: "SF", unitCost: 3.80, labor: 7800, material: 4360, markup: 10, contingency: 3 },
  { code: "09 65 00", trade: "Flooring", desc: "LVP flooring – main level", qty: 1400, unit: "SF", unitCost: 7.50, labor: 4200, material: 6300, markup: 10, contingency: 3 },
  { code: "22 10 00", trade: "Plumbing", desc: "Rough & finish plumbing", qty: 1, unit: "LS", unitCost: 18500, labor: 11100, material: 7400, markup: 10, contingency: 5 },
  { code: "23 00 00", trade: "HVAC", desc: "HVAC system – addition", qty: 1, unit: "LS", unitCost: 14200, labor: 7100, material: 7100, markup: 10, contingency: 8 },
  { code: "26 00 00", trade: "Electrical", desc: "Electrical – panels, circuits, fixtures", qty: 1, unit: "LS", unitCost: 16800, labor: 10080, material: 6720, markup: 10, contingency: 5 },
  { code: "31 20 00", trade: "Earthwork", desc: "Excavation & grading", qty: 1, unit: "LS", unitCost: 8600, labor: 5160, material: 3440, markup: 8, contingency: 5 },
  { code: "32 10 00", trade: "Paving", desc: "Driveway repair & patch", qty: 400, unit: "SF", unitCost: 6.00, labor: 1440, material: 960, markup: 10, contingency: 3 },
];

export default function EstimateBuilderPage() {
  const [search, setSearch] = useState("");
  const filtered = lineItems.filter((l) =>
    l.desc.toLowerCase().includes(search.toLowerCase()) ||
    l.trade.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (n: number) => `$${n.toLocaleString()}`;
  const subtotal = lineItems.reduce((s, l) => {
    const total = l.unit === "LS" ? l.unitCost : l.qty * l.unitCost;
    return s + total;
  }, 0);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Estimate Builder</h1>
            <p className="text-sm text-muted-foreground mt-1">Maple St. Kitchen Remodel — v2.1</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Filter size={14} className="mr-1.5" /> Filter</Button>
            <Button variant="outline" size="sm"><Download size={14} className="mr-1.5" /> Export</Button>
            <Button size="sm"><Plus size={14} className="mr-1.5" /> Add Line</Button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 max-w-sm">
            <Search size={16} className="text-muted-foreground" />
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search line items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Code", "Trade", "Description", "Qty", "Unit", "Unit Cost", "Labor", "Material", "Markup", "Cont.", "Total"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const base = l.unit === "LS" ? l.unitCost : l.qty * l.unitCost;
                  const total = base * (1 + l.markup / 100) * (1 + l.contingency / 100);
                  return (
                    <tr key={l.code} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.code}</td>
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{l.trade}</td>
                      <td className="px-4 py-3 text-foreground">{l.desc}</td>
                      <td className="px-4 py-3 text-muted-foreground">{l.qty.toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{l.unit}</td>
                      <td className="px-4 py-3 text-foreground">{l.unit === "LS" ? formatCurrency(l.unitCost) : `$${l.unitCost.toFixed(2)}`}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatCurrency(l.labor)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatCurrency(l.material)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{l.markup}%</td>
                      <td className="px-4 py-3 text-muted-foreground">{l.contingency}%</td>
                      <td className="px-4 py-3 font-display font-semibold text-foreground">{formatCurrency(Math.round(total))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border bg-muted/30 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{filtered.length} line items</span>
            <span className="font-display font-bold text-foreground">Subtotal: {formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
