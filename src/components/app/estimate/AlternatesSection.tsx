import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react";

type AltType = "Add" | "Deduct" | "Upgrade" | "VE";
type AltStatus = "Pending" | "Approved" | "Rejected" | "Internal Only";

interface AlternateItem {
  id: string; name: string; description: string; type: AltType; trade: string;
  costImpact: number; clientVisible: boolean; status: AltStatus; notes: string;
}

const typeStyles: Record<AltType, string> = {
  Add: "bg-warning/10 text-warning",
  Deduct: "bg-primary/10 text-primary",
  Upgrade: "bg-info/10 text-info",
  VE: "bg-accent text-accent-foreground",
};

const statusStyles: Record<AltStatus, string> = {
  Pending: "bg-warning/10 text-warning",
  Approved: "bg-primary/10 text-primary",
  Rejected: "bg-destructive/10 text-destructive",
  "Internal Only": "bg-muted text-muted-foreground",
};

const defaultItems: AlternateItem[] = [
  { id: "alt1", name: "Premium Flooring Upgrade", description: "Upgrade from LVP to engineered hardwood", type: "Upgrade", trade: "Flooring", costImpact: 4800, clientVisible: true, status: "Pending", notes: "" },
  { id: "alt2", name: "Heated Bathroom Floor", description: "Add radiant heat under tile in master bath", type: "Add", trade: "HVAC", costImpact: 3200, clientVisible: true, status: "Pending", notes: "" },
  { id: "alt3", name: "Deduct Builder-Grade Fixtures", description: "Swap specified fixtures for builder-grade", type: "Deduct", trade: "Plumbing", costImpact: -2400, clientVisible: true, status: "Rejected", notes: "Client wants mid-range" },
  { id: "alt4", name: "VE Cabinetry Package", description: "Semi-custom instead of full custom cabinetry", type: "VE", trade: "Millwork", costImpact: -6200, clientVisible: true, status: "Pending", notes: "" },
  { id: "alt5", name: "Built-In Shelving", description: "Custom built-in shelving in living room", type: "Add", trade: "Millwork", costImpact: 5400, clientVisible: true, status: "Approved", notes: "Client confirmed" },
];

export function AlternatesSection() {
  const [items, setItems] = useState<AlternateItem[]>(defaultItems);

  const adds = items.filter(i => i.costImpact > 0 && i.status !== "Rejected");
  const deducts = items.filter(i => i.costImpact < 0 && i.status !== "Rejected");
  const pending = items.filter(i => i.status === "Pending").length;
  const totalAdd = adds.reduce((s, i) => s + i.costImpact, 0);
  const totalDeduct = deducts.reduce((s, i) => s + i.costImpact, 0);

  const toggleVisible = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, clientVisible: !i.clientVisible } : i));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Alternates & Options</h2>
          <p className="text-xs text-muted-foreground">Optional upgrades, add-ons, and value engineering</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs"><FileText size={13} className="mr-1.5" />Common Alternates</Button>
          <Button size="sm" className="text-xs"><Plus size={13} className="mr-1.5" />Add Option</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-warning">{pending}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-foreground">+${totalAdd.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Add Alternates</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className="font-display text-lg font-bold text-primary">-${Math.abs(totalDeduct).toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Deduct Alternates</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <p className={`font-display text-lg font-bold ${totalAdd + totalDeduct >= 0 ? "text-warning" : "text-primary"}`}>
            {totalAdd + totalDeduct >= 0 ? "+" : "-"}${Math.abs(totalAdd + totalDeduct).toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">Net Impact</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Option", "Description", "Type", "Trade", "Cost Impact", "Status", "Visible"].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${item.status === "Rejected" ? "opacity-50" : ""}`}>
                  <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{item.name}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{item.description}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeStyles[item.type]}`}>{item.type}</span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{item.trade}</td>
                  <td className="px-3 py-2.5 font-display font-semibold">
                    <span className={`flex items-center gap-1 ${item.costImpact >= 0 ? "text-warning" : "text-primary"}`}>
                      {item.costImpact >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {item.costImpact >= 0 ? "+" : "-"}${Math.abs(item.costImpact).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[item.status]}`}>{item.status}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => toggleVisible(item.id)} className="text-muted-foreground hover:text-foreground">
                      {item.clientVisible ? <Eye size={14} className="text-primary" /> : <EyeOff size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
