import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Trash2, Eye, EyeOff } from "lucide-react";

interface GenReqItem {
  id: string; item: string; description: string; qty: string; unit: string; unitCost: number; total: number;
  source: string; inProposal: boolean; notes: string;
}

const defaultItems: GenReqItem[] = [
  { id: "gr1", item: "Dumpster / Hauling", description: "30-yard roll-off, bi-weekly swap", qty: "Duration", unit: "LS", unitCost: 4200, total: 4200, source: "Historical", inProposal: true, notes: "" },
  { id: "gr2", item: "Temporary Toilet", description: "Standard portable unit", qty: "6 mo", unit: "MO", unitCost: 185, total: 1110, source: "Vendor quote", inProposal: true, notes: "" },
  { id: "gr3", item: "Temporary Power", description: "Temp panel + weekly usage", qty: "1", unit: "LS", unitCost: 1800, total: 1800, source: "Assumption", inProposal: true, notes: "" },
  { id: "gr4", item: "Site Protection", description: "Floor/wall protection, dust barriers", qty: "1", unit: "LS", unitCost: 2400, total: 2400, source: "Template", inProposal: true, notes: "" },
  { id: "gr5", item: "Daily Clean / Final Clean", description: "Daily broom clean + final detail clean", qty: "1", unit: "LS", unitCost: 3600, total: 3600, source: "Historical", inProposal: true, notes: "" },
  { id: "gr6", item: "Supervision", description: "Project superintendent allocation", qty: "6 mo", unit: "MO", unitCost: 4800, total: 28800, source: "Internal rate", inProposal: false, notes: "Internal only" },
  { id: "gr7", item: "Mobilization", description: "Equipment & crew mobilization", qty: "1", unit: "LS", unitCost: 3200, total: 3200, source: "Assumption", inProposal: true, notes: "" },
  { id: "gr8", item: "Permit Coordination", description: "Permit pulls, inspections", qty: "1", unit: "LS", unitCost: 2800, total: 2800, source: "Historical", inProposal: true, notes: "" },
  { id: "gr9", item: "Safety / PPE", description: "Safety supplies, fencing", qty: "1", unit: "LS", unitCost: 1200, total: 1200, source: "Template", inProposal: true, notes: "" },
  { id: "gr10", item: "Equipment Rental", description: "Scissor lift, scaffolding", qty: "3 mo", unit: "MO", unitCost: 1500, total: 4500, source: "Vendor quote", inProposal: true, notes: "" },
];

export function GeneralRequirementsSection() {
  const [items, setItems] = useState<GenReqItem[]>(defaultItems);

  const total = items.reduce((s, i) => s + i.total, 0);

  const toggleProposal = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, inProposal: !i.inProposal } : i));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">General Requirements</h2>
          <p className="text-xs text-muted-foreground">Job-wide conditions, support costs, and site overhead</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs"><FileText size={13} className="mr-1.5" />Insert Template</Button>
          <Button size="sm" className="text-xs"><Plus size={13} className="mr-1.5" />Add Item</Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Item", "Description", "Qty", "Unit", "Unit Cost", "Total", "Source", "In Proposal", ""].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{item.item}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{item.description}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{item.qty}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{item.unit}</td>
                  <td className="px-3 py-2.5 text-foreground">${item.unitCost.toLocaleString()}</td>
                  <td className="px-3 py-2.5 font-display font-semibold text-foreground">${item.total.toLocaleString()}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{item.source}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => toggleProposal(item.id)} className="text-muted-foreground hover:text-foreground">
                      {item.inProposal ? <Eye size={14} className="text-primary" /> : <EyeOff size={14} />}
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border bg-muted/30 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{items.length} items</span>
          <span className="font-display font-bold text-foreground">General Requirements Total: ${total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
